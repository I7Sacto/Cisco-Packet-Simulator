import { PlayerState, NetworkState, TerminalEntry } from '../engine/types';
import TopologyView from './TopologyView';
import Terminal from './Terminal';
import { ArrowLeft, Brain, Zap } from 'lucide-react';

interface Props { player: PlayerState; network: NetworkState; terminalHistory: TerminalEntry[]; onCommand: (cmd: string) => void; onBack: () => void; }

export default function PracticeScreen({ player, network, terminalHistory, onCommand, onBack }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></button>
          <Brain className="w-5 h-5 text-amber-400" />
          <span className="font-mono font-semibold text-slate-200">Practice Mode</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-mono text-amber-400">{player.xp} XP</span>
        </div>
      </div>
      <div className="flex-1 flex flex-col lg:flex-row gap-0">
        <div className="lg:w-[45%] p-4 flex flex-col gap-4 overflow-y-auto">
          <TopologyView network={network} />
          <div className="bg-slate-900/40 border border-slate-800/50 rounded-lg p-3">
            <div className="text-xs font-mono text-slate-500">Free play sandbox - practice any commands! Type 'help' for available commands.</div>
          </div>
        </div>
        <div className="lg:w-[55%] flex flex-col p-4 pt-0 lg:pt-4 lg:pl-0 min-h-[400px]">
          <Terminal history={terminalHistory} onCommand={onCommand} />
        </div>
      </div>
    </div>
  );
}
