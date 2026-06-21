import { PlayerState } from '../engine/types';
import { LEVELS } from '../engine/levels';
import { ArrowLeft, FlaskConical, Lock, Check } from 'lucide-react';

interface Props { player: PlayerState; onBack: () => void; onStartLevel: (id: number) => void; }

const labs = [
  { id: 1, name: 'LAN Basics', desc: 'Master IP assignment and basic connectivity', diff: 'Beginner' },
  { id: 2, name: 'Router Configuration', desc: 'Configure inter-network routing with gateways', diff: 'Intermediate' },
  { id: 3, name: 'VLAN Segmentation', desc: 'Segment a flat network into VLANs for security', diff: 'Intermediate' },
  { id: 4, name: 'OSPF Dynamic Routing', desc: 'Build a self-healing routed network with OSPF', diff: 'Advanced' },
  { id: 5, name: 'Enterprise Network', desc: 'Full enterprise: VLANs, DHCP, ACLs, routing', diff: 'Expert' },
];

const diffColors: Record<string, string> = { Beginner: 'text-emerald-400 bg-emerald-400/10', Intermediate: 'text-amber-400 bg-amber-400/10', Advanced: 'text-orange-400 bg-orange-400/10', Expert: 'text-red-400 bg-red-400/10' };

export default function LabsScreen({ player, onBack, onStartLevel }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></button>
          <FlaskConical className="w-6 h-6 text-teal-400" />
          <h2 className="text-2xl font-bold text-white font-mono">Labs</h2>
        </div>
        <div className="space-y-3">
          {labs.map(lab => {
            const locked = lab.id > player.currentLevelId;
            const completed = lab.id < player.currentLevelId;
            const level = LEVELS.find(l => l.id === lab.id);
            return (
              <button key={lab.id} onClick={() => !locked && onStartLevel(lab.id)} disabled={locked}
                className={`w-full text-left rounded-xl border p-5 transition-all duration-300 ${locked ? 'border-slate-800/30 bg-slate-900/20 opacity-50 cursor-not-allowed' : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800/60 hover:border-slate-700 cursor-pointer'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-mono font-bold text-slate-300">Lab {lab.id}</span>
                    <span className={`text-[10px] font-mono px-2 py-1 rounded ${diffColors[lab.diff]}`}>{lab.diff}</span>
                  </div>
                  {completed ? <Check className="w-5 h-5 text-emerald-400" /> : locked ? <Lock className="w-4 h-4 text-slate-600" /> : null}
                </div>
                <div className="font-mono font-semibold text-slate-200 mb-1">{lab.name}</div>
                <div className="text-xs font-mono text-slate-500">{lab.desc}</div>
                {level && <div className="mt-2 text-[10px] font-mono text-cyan-400/60">Unlock: {level.unlockTool}</div>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
