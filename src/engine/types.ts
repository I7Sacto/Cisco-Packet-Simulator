export interface Device {
  id: string;
  type: 'pc' | 'switch' | 'router';
  name: string;
  ip?: string;
  gateway?: string;
  ports: Port[];
}

export interface Port {
  id: number;
  connectedTo?: string;
  vlan?: number;
  trunk?: boolean;
}

export interface Link {
  id: string;
  from: string;
  to: string;
  fromPort?: number;
  toPort?: number;
}

export interface Vlan {
  id: number;
  name: string;
  ports: number[];
}

export interface RouteEntry {
  network: string;
  via?: string;
  type: 'static' | 'ospf' | 'connected';
}

export interface AclRule {
  id: string;
  name: string;
  action: 'permit' | 'deny';
  protocol: string;
  source: string;
  destination: string;
  appliedTo?: string;
}

export interface NetworkState {
  devices: Device[];
  links: Link[];
  vlans: Vlan[];
  routes: RouteEntry[];
  dhcpEnabled: boolean;
  aclRules: AclRule[];
  ospfEnabled: boolean;
  ospfNetworks: string[];
}

export interface Objective {
  id: string;
  description: string;
  check: (state: NetworkState) => boolean;
  xpReward: number;
}

export interface LevelConfig {
  id: number;
  name: string;
  title: string;
  description: string;
  progressMin: number;
  progressMax: number;
  initialNetwork: NetworkState;
  objectives: Objective[];
  unlockReward: string;
  unlockTool: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface PlayerState {
  xp: number;
  level: number;
  progress: number;
  completedObjectives: string[];
  achievements: string[];
  adminMode: boolean;
  currentLevelId: number;
}

export interface CommandResult {
  success: boolean;
  message: string;
  xpGain?: number;
  objectiveCompleted?: string;
  error?: string;
}

export interface TerminalEntry {
  type: 'input' | 'output' | 'success' | 'error' | 'system';
  text: string;
}
