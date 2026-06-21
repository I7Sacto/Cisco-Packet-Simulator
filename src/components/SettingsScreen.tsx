import { PlayerState } from '../engine/types';
import { ArrowLeft, RotateCcw, Trash2, Shield } from 'lucide-react';

interface Props { player: PlayerState; onBack: () => void; onReset: () => void; }

export default function SettingsScreen({ player, onBack, onReset }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></button>
          <h2 className="text-2xl font-bold text-white font-mono">Settings</h2>
        </div>
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-red-400" />
              <span className="font-mono font-semibold text-slate-200">Admin Mode</span>
            </div>
            <p className="text-xs font-mono text-slate-500 mb-3">Enable admin mode via terminal command: <code className="text-cyan-400">enable admin</code></p>
            <div className={`text-xs font-mono ${player.adminMode ? 'text-emerald-400' : 'text-slate-600'}`}>Status: {player.adminMode ? 'ACTIVE' : 'INACTIVE'}</div>
          </div>
          <div className="bg-slate-900/60 border border-red-900/30 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <RotateCcw className="w-5 h-5 text-red-400" />
              <span className="font-mono font-semibold text-slate-200">Reset Progress</span>
            </div>
            <p className="text-xs font-mono text-slate-500 mb-4">Reset all progress, XP, and achievements. This cannot be undone.</p>
            <button onClick={() => { if (confirm('Are you sure? All progress will be lost.')) onReset(); }}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-sm rounded-lg hover:bg-red-500/20 transition-colors">
              <Trash2 className="w-4 h-4" />Reset All Progress
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
