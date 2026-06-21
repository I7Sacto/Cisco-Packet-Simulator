import { useState, useRef, useEffect } from 'react';
import { TerminalEntry } from '../engine/types';
import { ChevronRight } from 'lucide-react';

interface Props { history: TerminalEntry[]; onCommand: (cmd: string) => void; }

const cmdHistory: string[] = [];
let histIdx = -1;

export default function Terminal({ history, onCommand }: Props) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    cmdHistory.push(input.trim());
    histIdx = cmdHistory.length;
    onCommand(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); if (histIdx > 0) { histIdx--; setInput(cmdHistory[histIdx]); } }
    else if (e.key === 'ArrowDown') { e.preventDefault(); if (histIdx < cmdHistory.length - 1) { histIdx++; setInput(cmdHistory[histIdx]); } else { histIdx = cmdHistory.length; setInput(''); } }
  };

  const entryStyle = (t: TerminalEntry['type']): string => {
    switch (t) { case 'input': return 'text-cyan-400'; case 'output': return 'text-slate-300'; case 'success': return 'text-emerald-400'; case 'error': return 'text-red-400'; case 'system': return 'text-amber-400'; }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border-b border-slate-800">
        <div className="w-3 h-3 rounded-full bg-red-500/80" />
        <div className="w-3 h-3 rounded-full bg-amber-500/80" />
        <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
        <span className="ml-2 text-xs font-mono text-slate-500">network-cli@simulator</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm leading-relaxed" onClick={() => inputRef.current?.focus()}>
        {history.map((entry, i) => (
          <div key={i} className={`${entryStyle(entry.type)} whitespace-pre-wrap break-words`}>{entry.text}</div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3 bg-slate-900 border-t border-slate-800">
        <ChevronRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-cyan-400 font-mono text-sm outline-none placeholder-slate-700"
          placeholder="type 'help' for commands..." autoComplete="off" spellCheck={false} />
      </form>
    </div>
  );
}
