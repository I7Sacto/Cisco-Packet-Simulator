import { Rocket, BarChart3, Brain, Puzzle, Trophy, Settings, Network } from 'lucide-react';
import { PlayerState } from '../engine/types';
import { LEVELS } from '../engine/levels';

interface Props {
  player: PlayerState;
  onStart: () => void;
  onProgress: () => void;
  onPractice: () => void;
  onLabs: () => void;
  onAchievements: () => void;
  onSettings: () => void;
}

const menuItems = [
  { key: 'start', label: 'Start Career', sub: 'Begin your network engineer journey', icon: Rocket, gradient: 'from-emerald-600 to-cyan-600' },
  { key: 'progress', label: 'View Progress', sub: 'Check your XP and level status', icon: BarChart3, gradient: 'from-blue-600 to-indigo-600' },
  { key: 'practice', label: 'Practice Tasks', sub: 'Free play sandbox mode', icon: Brain, gradient: 'from-amber-600 to-orange-600' },
  { key: 'labs', label: 'Labs', sub: 'Challenge scenarios', icon: Puzzle, gradient: 'from-teal-600 to-emerald-600' },
  { key: 'achievements', label: 'Achievements', sub: 'View unlocked badges', icon: Trophy, gradient: 'from-yellow-600 to-amber-600' },
  { key: 'settings', label: 'Settings', sub: 'Configure network options', icon: Settings, gradient: 'from-slate-600 to-slate-500' },
];

export default function MainMenu({ player, onStart, onProgress, onPractice, onLabs, onAchievements, onSettings }: Props) {
  const currentLevel = LEVELS.find(l => l.id === player.currentLevelId);
  const handleClick = (key: string) => {
    switch (key) { case 'start': onStart(); break; case 'progress': onProgress(); break; case 'practice': onPractice(); break; case 'labs': onLabs(); break; case 'achievements': onAchievements(); break; case 'settings': onSettings(); break; }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative mb-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Network className="w-10 h-10 text-cyan-400 animate-pulse" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
            NETWORK SIMULATOR
          </h1>
          <Network className="w-10 h-10 text-emerald-400 animate-pulse" />
        </div>
        <p className="text-slate-500 font-mono text-sm tracking-widest uppercase">Packet Tracer Game</p>

        {currentLevel && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-700/50">
            <span className="text-xs font-mono text-slate-400">Current:</span>
            <span className="text-sm font-mono text-cyan-400 font-semibold">{currentLevel.title} - {currentLevel.name}</span>
            <span className="text-xs font-mono text-emerald-400">{player.xp} XP</span>
          </div>
        )}
      </div>

      <div className="w-full max-w-lg space-y-3">
        {menuItems.map(item => {
          const Icon = item.icon;
          return (
            <button key={item.key} onClick={() => handleClick(item.key)}
              className="w-full group relative overflow-hidden rounded-xl border border-slate-800/50 bg-slate-900/50 hover:bg-slate-800/60 transition-all duration-300 hover:scale-[1.02] hover:border-slate-700/80">
              <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              <div className="relative flex items-center gap-4 px-5 py-4">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-slate-200 group-hover:text-white transition-colors">{item.label}</div>
                  <div className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">{item.sub}</div>
                </div>
                <div className="text-slate-700 group-hover:text-slate-400 transition-colors">&rarr;</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <p className="text-xs text-slate-700 font-mono">Build networks. Earn XP. Level up.</p>
      </div>
    </div>
  );
}
