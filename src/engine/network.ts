import { Device, Link, NetworkState, AclRule } from './types';

export function createDevice(type: Device['type'], name: string, portCount: number = 1): Device {
  const ports = Array.from({ length: portCount }, (_, i) => ({
    id: i + 1,
    connectedTo: undefined,
    vlan: undefined,
    trunk: undefined,
  }));
  return { id: name.toLowerCase().replace(/\s+/g, '_'), type, name, ports };
}

export function createLink(from: string, to: string, fromPort?: number, toPort?: number): Link {
  return { id: `${from}-${to}`, from, to, fromPort, toPort };
}

export function emptyNetwork(): NetworkState {
  return { devices: [], links: [], vlans: [], routes: [], dhcpEnabled: false, aclRules: [], ospfEnabled: false, ospfNetworks: [] };
}

export function findDevice(state: NetworkState, id: string): Device | undefined {
  return state.devices.find(d => d.id === id);
}

export function findDeviceByName(state: NetworkState, name: string): Device | undefined {
  return state.devices.find(d => d.name.toLowerCase() === name.toLowerCase());
}

function getSubnet(ip: string): string {
  const p = ip.split('.');
  return `${p[0]}.${p[1]}.${p[2]}.0`;
}

function areConnectedSameSubnet(state: NetworkState, fromId: string, toId: string): boolean {
  const shared: Set<string> = new Set();
  for (const link of state.links) {
    const fromDev = findDevice(state, link.from);
    const toDev = findDevice(state, link.to);
    if (!fromDev || !toDev) continue;
    if (toDev.type === 'switch') {
      if (link.from === fromId || link.from === toId) shared.add(toDev.id);
    }
    if (fromDev.type === 'switch') {
      if (link.to === fromId || link.to === toId) shared.add(fromDev.id);
    }
  }
  return shared.size > 0;
}

function hasRoute(state: NetworkState, fromSubnet: string, toSubnet: string): boolean {
  const routers = state.devices.filter(d => d.type === 'router');
  if (routers.length === 0) return false;

  for (const router of routers) {
    const routerSubnets = router.ports
      .filter(p => p.connectedTo)
      .map(p => {
        const link = state.links.find(l =>
          (l.from === router.id && l.fromPort === p.id) || (l.to === router.id && l.toPort === p.id)
        );
        if (!link) return null;
        const otherId = link.from === router.id ? link.to : link.from;
        const other = findDevice(state, otherId);
        return other?.ip ? getSubnet(other.ip) : null;
      })
      .filter((s): s is string => !!s);

    const knowsFrom = routerSubnets.includes(fromSubnet) || state.routes.some(r => r.network === fromSubnet);
    const knowsTo = routerSubnets.includes(toSubnet) || state.routes.some(r => r.network === toSubnet);
    if (knowsFrom && knowsTo) return true;
  }

  if (state.ospfEnabled && state.ospfNetworks.includes(fromSubnet) && state.ospfNetworks.includes(toSubnet)) return true;
  return false;
}

export function canPing(state: NetworkState, fromId: string, toId: string): { ok: boolean; reason: string } {
  const from = findDevice(state, fromId);
  const to = findDevice(state, toId);
  if (!from) return { ok: false, reason: `Device ${fromId} not found` };
  if (!to) return { ok: false, reason: `Device ${toId} not found` };
  if (!from.ip) return { ok: false, reason: `ERROR: ${from.name} has no IP address assigned` };
  if (!to.ip) return { ok: false, reason: `ERROR: ${to.name} has no IP address assigned` };
  if (from.ip === to.ip) return { ok: false, reason: 'ERROR: IP conflict detected' };

  const fromSubnet = getSubnet(from.ip);
  const toSubnet = getSubnet(to.ip);

  if (fromSubnet === toSubnet) {
    const connected = areConnectedSameSubnet(state, fromId, toId);
    if (!connected) return { ok: false, reason: 'ERROR: No route to host' };
    return { ok: true, reason: `Reply from ${to.ip}: bytes=32 time<1ms TTL=128` };
  }

  if (!from.gateway) return { ok: false, reason: 'ERROR: Gateway unreachable' };

  if (!hasRoute(state, fromSubnet, toSubnet)) return { ok: false, reason: 'ERROR: No route to host' };

  const fromVlans = from.ports.filter(p => p.vlan).map(p => p.vlan);
  const toVlans = to.ports.filter(p => p.vlan).map(p => p.vlan);
  if (fromVlans.length > 0 && toVlans.length > 0 && !fromVlans.some(v => toVlans.includes(v))) {
    const trunkExists = state.links.some(link => {
      const fd = findDevice(state, link.from);
      const td = findDevice(state, link.to);
      if (!fd || !td) return false;
      const fp = fd.ports.find(p => p.id === link.fromPort);
      const tp = td.ports.find(p => p.id === link.toPort);
      return fp?.trunk || tp?.trunk;
    });
    if (!trunkExists) return { ok: false, reason: 'ERROR: VLAN mismatch' };
  }

  return { ok: true, reason: `Reply from ${to.ip}: bytes=32 time=1ms TTL=126` };
}

export function assignIp(state: NetworkState, deviceName: string, ip: string): NetworkState {
  return { ...state, devices: state.devices.map(d => d.name.toLowerCase() === deviceName.toLowerCase() ? { ...d, ip } : d) };
}

export function setGateway(state: NetworkState, deviceName: string, gateway: string): NetworkState {
  return { ...state, devices: state.devices.map(d => d.name.toLowerCase() === deviceName.toLowerCase() ? { ...d, gateway } : d) };
}

export function createVlan(state: NetworkState, id: number, name: string): NetworkState {
  if (state.vlans.some(v => v.id === id)) return state;
  return { ...state, vlans: [...state.vlans, { id, name, ports: [] }] };
}

export function assignPortToVlan(state: NetworkState, deviceName: string, portId: number, vlanId: number): NetworkState {
  return {
    ...state,
    devices: state.devices.map(d => {
      if (d.name.toLowerCase() !== deviceName.toLowerCase()) return d;
      return { ...d, ports: d.ports.map(p => p.id === portId ? { ...p, vlan: vlanId } : p) };
    }),
    vlans: state.vlans.map(v => v.id !== vlanId || v.ports.includes(portId) ? v : { ...v, ports: [...v.ports, portId] }),
  };
}

export function enableTrunk(state: NetworkState, deviceName: string, portId: number): NetworkState {
  return {
    ...state,
    devices: state.devices.map(d => {
      if (d.name.toLowerCase() !== deviceName.toLowerCase()) return d;
      return { ...d, ports: d.ports.map(p => p.id === portId ? { ...p, trunk: true } : p) };
    }),
  };
}

export function addRoute(state: NetworkState, network: string): NetworkState {
  if (state.routes.some(r => r.network === network)) return state;
  return { ...state, routes: [...state.routes, { network, type: 'static' }] };
}

export function enableOspf(state: NetworkState): NetworkState {
  return { ...state, ospfEnabled: true };
}

export function addOspfNetwork(state: NetworkState, network: string): NetworkState {
  if (state.ospfNetworks.includes(network)) return state;
  return { ...state, ospfNetworks: [...state.ospfNetworks, network] };
}

export function enableDhcp(state: NetworkState): NetworkState {
  return { ...state, dhcpEnabled: true };
}

export function createAcl(state: NetworkState, name: string, action: AclRule['action'], protocol: string, source: string, destination: string): NetworkState {
  const id = name.toLowerCase().replace(/\s+/g, '_');
  return { ...state, aclRules: [...state.aclRules, { id, name, action, protocol, source, destination }] };
}

export function applyAcl(state: NetworkState, aclName: string, routerName: string): NetworkState {
  return { ...state, aclRules: state.aclRules.map(r => r.name.toLowerCase() === aclName.toLowerCase() ? { ...r, appliedTo: routerName.toLowerCase() } : r) };
}

export function getIpConflict(state: NetworkState, ip: string): Device | undefined {
  return state.devices.find(d => d.ip === ip);
}
