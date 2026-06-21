import { LevelConfig, Achievement } from './types';
import { createDevice, createLink, emptyNetwork, findDeviceByName } from './network';

function level1Network() {
  const pc1 = createDevice('pc', 'PC1', 1);
  const pc2 = createDevice('pc', 'PC2', 1);
  const sw = createDevice('switch', 'SW1', 4);
  return { ...emptyNetwork(), devices: [pc1, pc2, sw], links: [createLink('pc1', 'sw1', 1, 1), createLink('pc2', 'sw1', 1, 2)] };
}

function level2Network() {
  const pc1 = createDevice('pc', 'PC1', 1);
  const pc3 = createDevice('pc', 'PC3', 1);
  const sw1 = createDevice('switch', 'SW1', 4);
  const sw2 = createDevice('switch', 'SW2', 4);
  const r1 = createDevice('router', 'R1', 2);
  return {
    ...emptyNetwork(), devices: [pc1, pc3, sw1, sw2, r1],
    links: [createLink('pc1', 'sw1', 1, 1), createLink('sw1', 'r1', 3, 1), createLink('r1', 'sw2', 2, 1), createLink('sw2', 'pc3', 2, 1)],
  };
}

function level3Network() {
  const pc1 = createDevice('pc', 'HR-PC', 1);
  const pc2 = createDevice('pc', 'IT-PC', 1);
  const sw = createDevice('switch', 'SW1', 24);
  return { ...emptyNetwork(), devices: [pc1, pc2, sw], links: [createLink('hr-pc', 'sw1', 1, 1), createLink('it-pc', 'sw1', 1, 2)] };
}

function level4Network() {
  const r1 = createDevice('router', 'R1', 2);
  const r2 = createDevice('router', 'R2', 2);
  const r3 = createDevice('router', 'R3', 2);
  const pc1 = createDevice('pc', 'PC1', 1);
  const pc2 = createDevice('pc', 'PC2', 1);
  const pc3 = createDevice('pc', 'PC3', 1);
  return {
    ...emptyNetwork(), devices: [r1, r2, r3, pc1, pc2, pc3],
    links: [createLink('pc1', 'r1', 1, 1), createLink('r1', 'r2', 2, 1), createLink('r2', 'r3', 2, 1), createLink('pc2', 'r2', 1, 2), createLink('pc3', 'r3', 1, 2)],
  };
}

function level5Network() {
  const pc1 = createDevice('pc', 'HR-PC', 1);
  const pc2 = createDevice('pc', 'IT-PC', 1);
  const pc3 = createDevice('pc', 'FIN-PC', 1);
  const sw1 = createDevice('switch', 'SW1', 24);
  const sw2 = createDevice('switch', 'SW2', 24);
  const r1 = createDevice('router', 'R1', 2);
  const r2 = createDevice('router', 'R2', 2);
  const server = createDevice('pc', 'SERVER', 1);
  return {
    ...emptyNetwork(), devices: [pc1, pc2, pc3, sw1, sw2, r1, r2, server],
    links: [createLink('hr-pc', 'sw1', 1, 1), createLink('it-pc', 'sw1', 1, 2), createLink('fin-pc', 'sw1', 1, 3), createLink('sw1', 'r1', 24, 1), createLink('r1', 'r2', 2, 1), createLink('r2', 'sw2', 2, 1), createLink('sw2', 'server', 1, 1)],
  };
}

export const LEVELS: LevelConfig[] = [
  {
    id: 1, name: 'LAN ROOKIE', title: 'Level 1',
    description: 'Create your first local network. Assign IP addresses and verify connectivity with ping.',
    progressMin: 0, progressMax: 30,
    initialNetwork: level1Network(),
    objectives: [
      { id: 'l1_assign_pc1', description: 'Assign IP 192.168.1.10 to PC1', xpReward: 10, check: s => findDeviceByName(s, 'PC1')?.ip === '192.168.1.10' },
      { id: 'l1_assign_pc2', description: 'Assign IP 192.168.1.11 to PC2', xpReward: 10, check: s => findDeviceByName(s, 'PC2')?.ip === '192.168.1.11' },
      { id: 'l1_ping', description: 'Ping PC2 from PC1 successfully', xpReward: 15, check: s => { const a = findDeviceByName(s, 'PC1'); const b = findDeviceByName(s, 'PC2'); return a?.ip === '192.168.1.10' && b?.ip === '192.168.1.11'; } },
    ],
    unlockReward: 'First Packet Sent', unlockTool: 'Network Tools',
  },
  {
    id: 2, name: 'ROUTED NETWORK', title: 'Level 2',
    description: 'Connect two LANs through a router. Configure gateways and static routes for inter-network communication.',
    progressMin: 30, progressMax: 60,
    initialNetwork: level2Network(),
    objectives: [
      { id: 'l2_assign_ips', description: 'Assign IPs: PC1=192.168.1.10, PC3=192.168.2.10', xpReward: 15, check: s => findDeviceByName(s, 'PC1')?.ip === '192.168.1.10' && findDeviceByName(s, 'PC3')?.ip === '192.168.2.10' },
      { id: 'l2_set_gateways', description: 'Set gateways: PC1->192.168.1.1, PC3->192.168.2.1', xpReward: 20, check: s => findDeviceByName(s, 'PC1')?.gateway === '192.168.1.1' && findDeviceByName(s, 'PC3')?.gateway === '192.168.2.1' },
      { id: 'l2_add_route', description: 'Add route to 192.168.2.0 on router', xpReward: 25, check: s => s.routes.some(r => r.network === '192.168.2.0') },
      { id: 'l2_cross_ping', description: 'Ping across subnets (PC1 -> PC3)', xpReward: 40, check: s => findDeviceByName(s, 'PC1')?.gateway === '192.168.1.1' && findDeviceByName(s, 'PC3')?.gateway === '192.168.2.1' && s.routes.some(r => r.network === '192.168.2.0') },
    ],
    unlockReward: 'Routing Enabled', unlockTool: 'CLI Router Mode',
  },
  {
    id: 3, name: 'VLAN ENGINEER', title: 'Level 3',
    description: 'Segment the network using VLANs. Create separate broadcast domains for HR and IT departments.',
    progressMin: 60, progressMax: 80,
    initialNetwork: level3Network(),
    objectives: [
      { id: 'l3_create_vlans', description: 'Create VLAN 10 (HR) and VLAN 20 (IT)', xpReward: 20, check: s => s.vlans.some(v => v.id === 10 && v.name === 'HR') && s.vlans.some(v => v.id === 20 && v.name === 'IT') },
      { id: 'l3_assign_ports', description: 'Assign port 1 to VLAN 10, port 2 to VLAN 20', xpReward: 20, check: s => { const sw = findDeviceByName(s, 'SW1'); if (!sw) return false; return sw.ports.find(p => p.id === 1)?.vlan === 10 && sw.ports.find(p => p.id === 2)?.vlan === 20; } },
      { id: 'l3_enable_trunk', description: 'Enable trunk on port 24', xpReward: 15, check: s => { const sw = findDeviceByName(s, 'SW1'); return sw?.ports.find(p => p.id === 24)?.trunk === true; } },
    ],
    unlockReward: 'Network Segmented', unlockTool: 'VLAN Manager',
  },
  {
    id: 4, name: 'ROUTING SPECIALIST', title: 'Level 4',
    description: 'Configure OSPF dynamic routing across three routers. Build a self-healing routed network.',
    progressMin: 80, progressMax: 90,
    initialNetwork: level4Network(),
    objectives: [
      { id: 'l4_assign_all_ips', description: 'Assign IPs to all PCs and routers', xpReward: 20, check: s => s.devices.filter(d => d.type === 'pc').length === 3 && s.devices.filter(d => d.type === 'pc').every(pc => !!pc.ip) },
      { id: 'l4_enable_ospf', description: 'Enable OSPF routing', xpReward: 25, check: s => s.ospfEnabled },
      { id: 'l4_add_ospf_networks', description: 'Add OSPF networks for all subnets', xpReward: 30, check: s => s.ospfEnabled && s.ospfNetworks.length >= 3 },
      { id: 'l4_full_connectivity', description: 'Verify full connectivity with ping all', xpReward: 50, check: s => s.ospfEnabled && s.ospfNetworks.length >= 3 && s.devices.filter(d => d.type === 'pc').every(pc => !!pc.ip && !!pc.gateway) },
    ],
    unlockReward: 'Dynamic Routing Active', unlockTool: 'Traffic Analyzer',
  },
  {
    id: 5, name: 'NETWORK ADMIN', title: 'Level 5',
    description: 'Build a complete enterprise network with VLANs, routing, DHCP, and ACL security.',
    progressMin: 90, progressMax: 100,
    initialNetwork: level5Network(),
    objectives: [
      { id: 'l5_setup_vlans', description: 'Create VLANs 10 (HR), 20 (IT), 30 (FIN)', xpReward: 20, check: s => s.vlans.filter(v => [10, 20, 30].includes(v.id)).length === 3 },
      { id: 'l5_routing', description: 'Configure inter-VLAN routing', xpReward: 30, check: s => s.routes.length >= 2 || s.ospfEnabled },
      { id: 'l5_dhcp', description: 'Enable DHCP server', xpReward: 20, check: s => s.dhcpEnabled },
      { id: 'l5_acl', description: 'Create and apply an ACL to block telnet', xpReward: 30, check: s => s.aclRules.some(a => a.name.toLowerCase().includes('block_telnet') && a.appliedTo) },
      { id: 'l5_complete', description: 'Achieve zero packet loss - all devices reachable', xpReward: 100, check: s => s.vlans.length >= 3 && (s.routes.length >= 2 || s.ospfEnabled) && s.dhcpEnabled && s.aclRules.some(a => a.appliedTo) && s.devices.filter(d => d.type === 'pc').every(d => !!d.ip) },
    ],
    unlockReward: 'Full Control Achieved - Zero Packet Loss Network', unlockTool: 'Admin Console',
  },
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_packet', name: 'First Packet', description: 'Successfully sent your first ping', color: '#22c55e' },
  { id: 'router_master', name: 'Router Master', description: 'Completed routed network level', color: '#3b82f6' },
  { id: 'vlan_engineer', name: 'VLAN Engineer', description: 'Segmented a network with VLANs', color: '#a855f7' },
  { id: 'ospf_explorer', name: 'OSPF Explorer', description: 'Enabled dynamic routing', color: '#f97316' },
  { id: 'network_admin', name: 'Network Administrator', description: 'Built a complete enterprise network', color: '#eab308' },
];
