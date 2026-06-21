import { PlayerState } from '../engine/types';
import { ACHIEVEMENTS } from '../engine/levels';
import { ArrowLeft, Trophy, Lock } from 'lucide-react';

interface Props { player: PlayerState; onBack: () => void; }

export default function AchievementsScreen({ player, onBack }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></button>
          <Trophy className="w-6 h-6 text-amber-400" />
          <h2 className="text-2xl font-bold text-white font-mono">Achievements</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ACHIEVEMENTS.map(a => {
            const unlocked = player.achievements.includes(a.id);
            return (
              <div key={a.id} className={`relative overflow-hidden rounded-xl border p-5 transition-all duration-300 ${unlocked ? 'border-amber-500/30 bg-amber-500/5' : 'border-slate-800/30 bg-slate-900/30'}`}>
                {unlocked && <div className="absolute top-0 right-0 w-20 h-20 bg-amber-400/5 rounded-bl-full" />}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border" style={{ backgroundColor: unlocked ? `${a.color}20` : 'transparent', borderColor: unlocked ? a.color : '#334155' }}>
                    {unlocked ? <Trophy className="w-6 h-6" style={{ color: a.color }} /> : <Lock className="w-5 h-5 text-slate-600" />}
                  </div>
                  <div>
                    <div className={`font-mono font-semibold ${unlocked ? 'text-white' : 'text-slate-600'}`}>{a.name}</div>
                    <div className={`text-xs font-mono mt-1 ${unlocked ? 'text-slate-400' : 'text-slate-700'}`}>{a.description}</div>
                  </div>
                </div>
                {unlocked && <div className="mt-3 text-[10px] font-mono text-amber-400/60 uppercase tracking-wider">Unlocked</div>}
              </div>
            );
          })}
        </div>

        {player.adminMode && (
          <div className="mt-6 p-4 rounded-xl border border-red-500/30 bg-red-500/5 text-center">
            <div className="text-sm font-mono text-red-400 font-bold">ADMIN MODE ACTIVE</div>
            <div className="text-xs font-mono text-slate-500 mt-1">Custom topology, Packet Chaos, network editor</div>
          </div>
        )}
      </div>
    </div>
  );
}
