import { NetworkState, Device } from '../engine/types';
import { Monitor, Server, Router, Network } from 'lucide-react';

interface Props { network: NetworkState; }

function DeviceIcon({ type }: { type: Device['type'] }) {
  const c = "w-6 h-6";
  switch (type) { case 'pc': return <Monitor className={c} />; case 'switch': return <Network className={c} />; case 'router': return <Router className={c} />; default: return <Server className={c} />; }
}

function getDeviceColor(device: Device): string {
  if (device.ip) return 'border-emerald-500/70 bg-emerald-950/40 shadow-emerald-500/10 shadow-md';
  return 'border-slate-600/50 bg-slate-900/40';
}

export default function TopologyView({ network }: Props) {
  const pcs = network.devices.filter(d => d.type === 'pc');
  const switches = network.devices.filter(d => d.type === 'switch');
  const routers = network.devices.filter(d => d.type === 'router');

  return (
    <div className="relative bg-slate-950 border border-slate-800 rounded-lg p-4 min-h-[260px] overflow-hidden">
      <div className="text-xs text-slate-500 mb-3 font-mono uppercase tracking-wider">Network Topology</div>

      <div className="relative flex flex-col items-center gap-6" style={{ zIndex: 1 }}>
        {routers.length > 0 && (
          <div className="flex gap-8 justify-center flex-wrap">
            {routers.map(d => (
              <div key={d.id} id={`dev-${d.id}`} className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all duration-300 ${getDeviceColor(d)}`}>
                <DeviceIcon type={d.type} />
                <span className="text-xs font-mono text-slate-300">{d.name}</span>
                {d.ip && <span className="text-[10px] font-mono text-emerald-400">{d.ip}</span>}
              </div>
            ))}
          </div>
        )}
        {switches.length > 0 && (
          <div className="flex gap-8 justify-center flex-wrap">
            {switches.map(d => (
              <div key={d.id} id={`dev-${d.id}`} className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all duration-300 ${getDeviceColor(d)}`}>
                <DeviceIcon type={d.type} />
                <span className="text-xs font-mono text-slate-300">{d.name}</span>
                {d.ports.some(p => p.vlan) && <span className="text-[10px] font-mono text-cyan-400">VLANs: {[...new Set(d.ports.filter(p => p.vlan).map(p => p.vlan))].join(',')}</span>}
                {d.ports.some(p => p.trunk) && <span className="text-[10px] font-mono text-purple-400">Trunk: P{d.ports.filter(p => p.trunk).map(p => p.id).join(',')}</span>}
              </div>
            ))}
          </div>
        )}
        {pcs.length > 0 && (
          <div className="flex gap-4 justify-center flex-wrap">
            {pcs.map(d => (
              <div key={d.id} id={`dev-${d.id}`} className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all duration-300 ${getDeviceColor(d)}`}>
                <DeviceIcon type={d.type} />
                <span className="text-xs font-mono text-slate-300">{d.name}</span>
                {d.ip && <span className="text-[10px] font-mono text-emerald-400">{d.ip}</span>}
                {d.gateway && <span className="text-[10px] font-mono text-amber-400">GW:{d.gateway}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="absolute bottom-2 right-3 flex gap-3 text-[10px] font-mono text-slate-600">
        <span>{network.devices.length} devices</span>
        <span>{network.links.length} links</span>
        {network.dhcpEnabled && <span className="text-amber-400">DHCP</span>}
        {network.ospfEnabled && <span className="text-cyan-400">OSPF</span>}
        {network.aclRules.length > 0 && <span className="text-red-400">ACL:{network.aclRules.length}</span>}
      </div>
    </div>
  );
}
