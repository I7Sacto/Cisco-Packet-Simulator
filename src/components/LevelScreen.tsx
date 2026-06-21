import { PlayerState, NetworkState, TerminalEntry } from '../engine/types';
import { LEVELS } from '../engine/levels';
import TopologyView from './TopologyView';
import Terminal from './Terminal';
import { ArrowLeft, Target, Zap } from 'lucide-react';

interface Props {
  player: PlayerState;
  network: NetworkState;
  terminalHistory: TerminalEntry[];
  onCommand: (cmd: string) => void;
  onBack: () => void;
}

function CmdBtn({ cmd, onCommand }: { cmd: string; onCommand: (c: string) => void }) {
  return (
    <button onClick={() => onCommand(cmd)}
      className="px-2 py-1 text-[11px] font-mono text-slate-400 bg-slate-800/50 border border-slate-700/50 rounded hover:bg-slate-700/50 hover:text-cyan-400 transition-colors">
      {cmd.length > 28 ? cmd.slice(0, 28) + '...' : cmd}
    </button>
  );
}

const quickCmds: Record<number, string[]> = {
  1: ['assign ip PC1 192.168.1.10', 'assign ip PC2 192.168.1.11', 'ping PC2'],
  2: ['assign ip PC1 192.168.1.10', 'assign ip PC3 192.168.2.10', 'set gateway PC1 192.168.1.1', 'set gateway PC3 192.168.2.1', 'router add route 192.168.2.0'],
  3: ['vlan create 10 HR', 'vlan create 20 IT', 'vlan assign SW1 1 10', 'vlan assign SW1 2 20', 'trunk enable SW1 24'],
  4: ['router ospf enable', 'router ospf network 192.168.0.0', 'show ip route'],
  5: ['vlan create 10 HR', 'dhcp enable', 'acl create block_telnet deny tcp any any', 'acl apply block_telnet R1'],
};

export default function LevelScreen({ player, network, terminalHistory, onCommand, onBack }: Props) {
  const level = LEVELS.find(l => l.id === player.currentLevelId);
  if (!level) return null;
  const completedCount = level.objectives.filter(o => player.completedObjectives.includes(o.id)).length;
  const allDone = completedCount === level.objectives.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-slate-800 backdrop-blur-sm">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /><span className="text-sm font-mono">Menu</span>
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono font-bold text-cyan-400">{level.title}</span>
          <span className="text-xs font-mono text-slate-500">|</span>
          <span className="text-sm font-mono text-emerald-400">{level.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-mono text-amber-400 font-bold">{player.xp} XP</span>
        </div>
      </div>

      <div className="px-4 py-2 bg-slate-900/40 border-b border-slate-800/50">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-mono text-slate-500">Progress</span>
          <span className="text-xs font-mono text-slate-400">{player.progress}%</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${player.progress}%` }} />
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-0">
        <div className="lg:w-[45%] flex flex-col p-4 gap-4 overflow-y-auto">
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-mono text-slate-300 uppercase tracking-wider">Objectives</span>
            </div>
            <div className="space-y-2">
              {level.objectives.map((obj, i) => {
                const done = player.completedObjectives.includes(obj.id);
                return (
                  <div key={obj.id} className={`flex items-start gap-2 text-sm font-mono ${done ? 'text-emerald-400' : 'text-slate-400'}`}>
                    <span className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center text-[10px] flex-shrink-0 ${done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                      {done ? '\u2713' : `${i + 1}`}
                    </span>
                    <span className={done ? 'line-through opacity-70' : ''}>{obj.description}</span>
                    <span className="ml-auto text-xs text-amber-400/60">+{obj.xpReward}</span>
                  </div>
                );
              })}
            </div>
            {allDone && (
              <div className="mt-3 p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono text-center">
                LEVEL COMPLETE! {level.unlockReward}
              </div>
            )}
          </div>

          <TopologyView network={network} />

          <div className="bg-slate-900/40 border border-slate-800/50 rounded-lg p-3">
            <div className="text-xs font-mono text-slate-500 mb-2">Quick Commands:</div>
            <div className="flex flex-wrap gap-2">
              {(quickCmds[level.id] || []).map(c => <CmdBtn key={c} cmd={c} onCommand={onCommand} />)}
              <CmdBtn cmd="show devices" onCommand={onCommand} />
              <CmdBtn cmd="help" onCommand={onCommand} />
            </div>
          </div>
        </div>

        <div className="lg:w-[55%] flex flex-col p-4 pt-0 lg:pt-4 lg:pl-0 min-h-[400px]">
          <Terminal history={terminalHistory} onCommand={onCommand} />
        </div>
      </div>
    </div>
  );
}
