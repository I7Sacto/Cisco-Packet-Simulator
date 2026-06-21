import { NetworkState, CommandResult, PlayerState } from './types';
import { assignIp, setGateway, createVlan, assignPortToVlan, enableTrunk, addRoute, enableOspf, addOspfNetwork, enableDhcp, createAcl, applyAcl, canPing, findDeviceByName, getIpConflict } from './network';
import { LEVELS } from './levels';

export function executeCommand(raw: string, network: NetworkState, player: PlayerState): {
  result: CommandResult;
  newNetwork: NetworkState;
  newPlayer: PlayerState;
} {
  const parts = raw.trim().split(/\s+/);
  const cmd = parts[0]?.toLowerCase();
  let result: CommandResult = { success: false, message: 'Unknown command' };
  let newNetwork = network;

  switch (cmd) {
    case 'assign': {
      if (parts[1]?.toLowerCase() === 'ip') {
        if (parts.length < 4) { result = { success: false, message: 'Usage: assign ip <device> <ip_address>', error: 'INVALID_SYNTAX' }; break; }
        const deviceName = parts[2], ip = parts[3];
        const conflict = getIpConflict(newNetwork, ip);
        if (conflict && conflict.name.toLowerCase() !== deviceName.toLowerCase()) { result = { success: false, message: `ERROR: IP conflict detected - ${ip} already assigned to ${conflict.name}`, error: 'IP_CONFLICT' }; break; }
        const dev = findDeviceByName(newNetwork, deviceName);
        if (!dev) { result = { success: false, message: `ERROR: Device '${deviceName}' not found`, error: 'DEVICE_NOT_FOUND' }; break; }
        newNetwork = assignIp(newNetwork, deviceName, ip);
        result = { success: true, message: `IP ${ip} assigned to ${dev.name}`, xpGain: 5 };
      } else if (parts[1]?.toLowerCase() === 'port') {
        const portNum = parseInt(parts[2]), vlanId = parseInt(parts[4]);
        if (!portNum || !vlanId) { result = { success: false, message: 'Usage: assign port <port> vlan <vlan_id>', error: 'INVALID_SYNTAX' }; break; }
        const sw = newNetwork.devices.find(d => d.type === 'switch');
        if (!sw) { result = { success: false, message: 'ERROR: No switch found', error: 'DEVICE_NOT_FOUND' }; break; }
        newNetwork = assignPortToVlan(newNetwork, sw.name, portNum, vlanId);
        result = { success: true, message: `Port ${portNum} on ${sw.name} assigned to VLAN ${vlanId}`, xpGain: 10 };
      } else {
        result = { success: false, message: 'Usage: assign ip <device> <ip> | assign port <port> vlan <id>', error: 'INVALID_SYNTAX' };
      }
      break;
    }

    case 'ping': {
      const target = parts[1];
      if (!target) { result = { success: false, message: 'Usage: ping <device_name | ip_address>', error: 'INVALID_SYNTAX' }; break; }
      let targetDevice = findDeviceByName(newNetwork, target) || newNetwork.devices.find(d => d.ip === target);
      if (!targetDevice) { result = { success: false, message: `ERROR: No route to host - '${target}' not found`, error: 'NO_ROUTE' }; break; }
      const sourceDevice = newNetwork.devices.find(d => d.type === 'pc' && d.ip);
      if (!sourceDevice) { result = { success: false, message: 'ERROR: No source device with IP address available', error: 'NO_SOURCE' }; break; }
      const pr = canPing(newNetwork, sourceDevice.id, targetDevice.id);
      result = pr.ok ? { success: true, message: `PING ${targetDevice.ip || targetDevice.name}: ${pr.reason}`, xpGain: 5 } : { success: false, message: `PING failed: ${pr.reason}`, error: 'PING_FAIL' };
      break;
    }

    case 'set': {
      if (parts[1]?.toLowerCase() !== 'gateway' || parts.length < 4) { result = { success: false, message: 'Usage: set gateway <device> <gateway_ip>', error: 'INVALID_SYNTAX' }; break; }
      const dev = findDeviceByName(newNetwork, parts[2]);
      if (!dev) { result = { success: false, message: `ERROR: Device '${parts[2]}' not found`, error: 'DEVICE_NOT_FOUND' }; break; }
      newNetwork = setGateway(newNetwork, parts[2], parts[3]);
      result = { success: true, message: `Gateway ${parts[3]} set for ${dev.name}`, xpGain: 5 };
      break;
    }

    case 'router': {
      if (parts[1]?.toLowerCase() === 'add' && parts[2]?.toLowerCase() === 'route') {
        if (!parts[3]) { result = { success: false, message: 'Usage: router add route <network>', error: 'INVALID_SYNTAX' }; break; }
        newNetwork = addRoute(newNetwork, parts[3]);
        result = { success: true, message: `Route to ${parts[3]} added`, xpGain: 10 };
      } else if (parts[1]?.toLowerCase() === 'ospf' && parts[2]?.toLowerCase() === 'enable') {
        newNetwork = enableOspf(newNetwork);
        result = { success: true, message: 'OSPF routing enabled', xpGain: 15 };
      } else if (parts[1]?.toLowerCase() === 'ospf' && parts[2]?.toLowerCase() === 'network') {
        if (!parts[3]) { result = { success: false, message: 'Usage: router ospf network <network>', error: 'INVALID_SYNTAX' }; break; }
        newNetwork = addOspfNetwork(newNetwork, parts[3]);
        result = { success: true, message: `OSPF network ${parts[3]} added`, xpGain: 10 };
      } else {
        result = { success: false, message: 'Usage: router add route <network> | router ospf enable | router ospf network <network>', error: 'INVALID_SYNTAX' };
      }
      break;
    }

    case 'vlan': {
      if (parts[1]?.toLowerCase() === 'create') {
        const vlanId = parseInt(parts[2]), vlanName = parts[3];
        if (!vlanId || !vlanName) { result = { success: false, message: 'Usage: vlan create <id> <name>', error: 'INVALID_SYNTAX' }; break; }
        newNetwork = createVlan(newNetwork, vlanId, vlanName);
        result = { success: true, message: `VLAN ${vlanId} (${vlanName}) created`, xpGain: 10 };
      } else if (parts[1]?.toLowerCase() === 'assign') {
        const dev = findDeviceByName(newNetwork, parts[2]);
        const portId = parseInt(parts[3]), vlanId = parseInt(parts[4]);
        if (!parts[2] || !portId || !vlanId) { result = { success: false, message: 'Usage: vlan assign <device> <port> <vlan_id>', error: 'INVALID_SYNTAX' }; break; }
        if (!dev) { result = { success: false, message: `ERROR: Device '${parts[2]}' not found`, error: 'DEVICE_NOT_FOUND' }; break; }
        newNetwork = assignPortToVlan(newNetwork, parts[2], portId, vlanId);
        result = { success: true, message: `Port ${portId} on ${dev.name} assigned to VLAN ${vlanId}`, xpGain: 10 };
      } else if (parts[1]?.toLowerCase() === 'trunk') {
        const dev = findDeviceByName(newNetwork, parts[2]);
        const portId = parseInt(parts[3]);
        if (!parts[2] || !portId) { result = { success: false, message: 'Usage: vlan trunk <device> <port>', error: 'INVALID_SYNTAX' }; break; }
        if (!dev) { result = { success: false, message: `ERROR: Device '${parts[2]}' not found`, error: 'DEVICE_NOT_FOUND' }; break; }
        newNetwork = enableTrunk(newNetwork, parts[2], portId);
        result = { success: true, message: `Trunk enabled on port ${portId} of ${dev.name}`, xpGain: 10 };
      } else {
        result = { success: false, message: 'Usage: vlan create <id> <name> | vlan assign <device> <port> <vlan_id> | vlan trunk <device> <port>', error: 'INVALID_SYNTAX' };
      }
      break;
    }

    case 'trunk': {
      const portId = parseInt(parts[3]);
      if (!parts[2] || !portId) { result = { success: false, message: 'Usage: trunk enable <device> <port>', error: 'INVALID_SYNTAX' }; break; }
      const devName = parts[2];
      const dev = findDeviceByName(newNetwork, devName);
      if (!dev) { result = { success: false, message: `ERROR: Device '${devName}' not found`, error: 'DEVICE_NOT_FOUND' }; break; }
      newNetwork = enableTrunk(newNetwork, devName, portId);
      result = { success: true, message: `Trunk enabled on port ${portId} of ${dev.name}`, xpGain: 10 };
      break;
    }

    case 'dhcp': {
      if (parts[1]?.toLowerCase() === 'enable') { newNetwork = enableDhcp(newNetwork); result = { success: true, message: 'DHCP server enabled', xpGain: 15 }; }
      else { result = { success: false, message: 'Usage: dhcp enable', error: 'INVALID_SYNTAX' }; }
      break;
    }

    case 'acl': {
      if (parts[1]?.toLowerCase() === 'create') {
        const [aclName, action, protocol, source, dest] = [parts[2], parts[3]?.toLowerCase(), parts[4], parts[5], parts[6]];
        if (!aclName || !action || !protocol || !source || !dest) { result = { success: false, message: 'Usage: acl create <name> <permit|deny> <protocol> <source> <destination>', error: 'INVALID_SYNTAX' }; break; }
        if (action !== 'permit' && action !== 'deny') { result = { success: false, message: 'ERROR: Action must be permit or deny', error: 'INVALID_ACTION' }; break; }
        newNetwork = createAcl(newNetwork, aclName, action, protocol, source, dest);
        result = { success: true, message: `ACL '${aclName}' created: ${action} ${protocol} ${source} -> ${dest}`, xpGain: 15 };
      } else if (parts[1]?.toLowerCase() === 'apply') {
        if (!parts[2] || !parts[3]) { result = { success: false, message: 'Usage: acl apply <acl_name> <router_name>', error: 'INVALID_SYNTAX' }; break; }
        newNetwork = applyAcl(newNetwork, parts[2], parts[3]);
        result = { success: true, message: `ACL '${parts[2]}' applied to ${parts[3]}`, xpGain: 10 };
      } else {
        result = { success: false, message: 'Usage: acl create <name> <permit|deny> <protocol> <source> <destination> | acl apply <name> <router>', error: 'INVALID_SYNTAX' };
      }
      break;
    }

    case 'show': {
      if (parts[1]?.toLowerCase() === 'ip' && parts[2]?.toLowerCase() === 'route') {
        if (newNetwork.routes.length === 0 && !newNetwork.ospfEnabled) result = { success: true, message: 'No routes configured' };
        else {
          const r = newNetwork.routes.map(rt => `${rt.network} via ${rt.via || 'direct'} [${rt.type}]`).join('\n');
          const o = newNetwork.ospfEnabled ? `\nOSPF: ${newNetwork.ospfNetworks.join(', ')}` : '';
          result = { success: true, message: `Routing Table:\n${r}${o}` };
        }
      } else if (parts[1]?.toLowerCase() === 'vlans') {
        result = newNetwork.vlans.length === 0
          ? { success: true, message: 'No VLANs configured' }
          : { success: true, message: `VLANs:\n${newNetwork.vlans.map(v => `VLAN ${v.id} (${v.name}): Ports ${v.ports.join(', ') || 'none'}`).join('\n')}` };
      } else if (parts[1]?.toLowerCase() === 'devices') {
        result = { success: true, message: `Devices:\n${newNetwork.devices.map(d => `${d.type.toUpperCase()}: ${d.name}${d.ip ? ` IP:${d.ip}` : ''}${d.gateway ? ` GW:${d.gateway}` : ''}`).join('\n')}` };
      } else if (parts[1]?.toLowerCase() === 'config') {
        result = { success: true, message: `Network Configuration:\nDevices: ${newNetwork.devices.length}\nLinks: ${newNetwork.links.length}\nVLANs: ${newNetwork.vlans.length}\nRoutes: ${newNetwork.routes.length}\nDHCP: ${newNetwork.dhcpEnabled ? 'Enabled' : 'Disabled'}\nOSPF: ${newNetwork.ospfEnabled ? 'Enabled' : 'Disabled'}\nACLs: ${newNetwork.aclRules.length}` };
      } else {
        result = { success: false, message: 'Usage: show ip route | show vlans | show devices | show config', error: 'INVALID_SYNTAX' };
      }
      break;
    }

    case 'enable': {
      if (parts[1]?.toLowerCase() === 'admin') { result = { success: true, message: 'ADMIN MODE ACTIVATED\nAccess granted: custom topology, network editor, Packet Chaos mode' }; return { result, newNetwork, newPlayer: { ...player, adminMode: true } }; }
      result = { success: false, message: 'Usage: enable admin', error: 'INVALID_SYNTAX' };
      break;
    }

    case 'monitor': {
      const s = newNetwork.devices.map(d => `  ${d.name}: ${d.ip ? 'UP' : 'DOWN'} ${d.ip || 'no IP'}`).join('\n');
      result = { success: true, message: `Network Monitor:\n${s}\nLinks: ${newNetwork.links.length} active` };
      break;
    }

    case 'optimize': {
      result = { success: true, message: 'Network optimization complete\nPacket loss: 0%\nLatency: optimal\nThroughput: maximum', xpGain: 20 };
      break;
    }

    case 'help': {
      result = { success: true, message: `Available commands:
  assign ip <device> <ip>          - Assign IP address
  assign port <port> vlan <id>     - Assign port to VLAN
  set gateway <device> <gateway>   - Set default gateway
  ping <device | ip>              - Test connectivity
  router add route <network>      - Add static route
  router ospf enable              - Enable OSPF
  router ospf network <network>   - Add OSPF network
  vlan create <id> <name>         - Create VLAN
  vlan assign <dev> <port> <id>   - Assign port to VLAN
  vlan trunk <dev> <port>         - Enable trunk on port
  trunk enable <device> <port>    - Enable trunk
  dhcp enable                     - Enable DHCP
  acl create <name> <action> <proto> <src> <dst>
  acl apply <name> <router>       - Apply ACL to router
  show ip route                   - Show routing table
  show vlans                      - Show VLANs
  show devices                    - Show all devices
  show config                     - Show network config
  monitor                         - Monitor network status
  optimize                        - Optimize network
  enable admin                    - Enable admin mode
  help                            - Show this help` };
      break;
    }

    default:
      result = { success: false, message: `Unknown command: '${cmd}'. Type 'help' for available commands.`, error: 'UNKNOWN_COMMAND' };
  }

  let newPlayer = { ...player };
  const level = LEVELS.find(l => l.id === player.currentLevelId);
  if (level && result.success) {
    for (const obj of level.objectives) {
      if (newPlayer.completedObjectives.includes(obj.id)) continue;
      if (obj.check(newNetwork)) {
        newPlayer.completedObjectives = [...newPlayer.completedObjectives, obj.id];
        result.objectiveCompleted = obj.id;
        result.xpGain = (result.xpGain || 0) + obj.xpReward;
        result.message += `\n\n  OBJECTIVE COMPLETE: ${obj.description} (+${obj.xpReward} XP)`;
      }
    }
    newPlayer.xp = player.xp + (result.xpGain || 0);
    const completedCount = newPlayer.completedObjectives.filter(id => level.objectives.some(o => o.id === id)).length;
    newPlayer.progress = Math.min(100, Math.round(level.progressMin + (level.progressMax - level.progressMin) * (completedCount / level.objectives.length)));
  }

  return { result, newNetwork, newPlayer };
}
