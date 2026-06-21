import { PlayerState } from '../engine/types';
import { LEVELS } from '../engine/levels';
import { ArrowLeft, Zap } from 'lucide-react';

interface Props { player: PlayerState; onBack: () => void; }

const gradients = ['from-emerald-500 to-cyan-500', 'from-blue-500 to-indigo-500', 'from-purple-500 to-pink-500', 'from-orange-500 to-amber-500', 'from-red-500 to-rose-500'];

export default function ProgressScreen({ player, onBack }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></button>
          <h2 className="text-2xl font-bold text-white font-mono">Progress</h2>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center">
            <Zap className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-amber-400 font-mono">{player.xp}</div>
            <div className="text-xs text-slate-500 font-mono">Total XP</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400 font-mono">{player.progress}%</div>
            <div className="text-xs text-slate-500 font-mono">Overall Progress</div>
            <div className="mt-2 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${player.progress}%` }} />
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400 font-mono">{player.achievements.length}</div>
            <div className="text-xs text-slate-500 font-mono">Achievements</div>
          </div>
        </div>

        <div className="space-y-4">
          {LEVELS.map((level, i) => {
            const isCurrent = level.id === player.currentLevelId;
            const completed = level.objectives.filter(o => player.completedObjectives.includes(o.id)).length;
            const pct = Math.round((completed / level.objectives.length) * 100);
            const locked = level.id > player.currentLevelId;
            return (
              <div key={level.id} className={`bg-slate-900/60 border rounded-xl p-5 transition-all duration-300 ${isCurrent ? 'border-cyan-500/50 ring-1 ring-cyan-500/20' : locked ? 'border-slate-800/30 opacity-50' : 'border-slate-800'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradients[i]} flex items-center justify-center text-white text-sm font-bold font-mono`}>{level.id}</div>
                    <div>
                      <div className="font-mono font-semibold text-slate-200">{level.name}</div>
                      <div className="text-xs font-mono text-slate-500">{level.title}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCurrent && <span className="text-xs font-mono text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded">CURRENT</span>}
                    {pct === 100 && <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">COMPLETE</span>}
                    {locked && <span className="text-xs font-mono text-slate-600">LOCKED</span>}
                  </div>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                  <div className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${gradients[i]}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-xs font-mono text-slate-500">
                  <span>{completed}/{level.objectives.length} objectives</span><span>{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
