import { useState, useCallback, useEffect } from 'react';
import { PlayerState, NetworkState, TerminalEntry } from '../engine/types';
import { LEVELS, ACHIEVEMENTS } from '../engine/levels';
import { executeCommand } from '../engine/commands';
import { emptyNetwork } from '../engine/network';

const STORAGE_KEY = 'network_sim_state';

interface GameState {
  player: PlayerState;
  network: NetworkState;
  screen: 'menu' | 'level' | 'progress' | 'achievements' | 'labs' | 'practice' | 'settings';
  terminalHistory: TerminalEntry[];
  currentLevelId: number;
}

const defaultPlayer: PlayerState = {
  xp: 0, level: 1, progress: 0, completedObjectives: [], achievements: [], adminMode: false, currentLevelId: 1,
};

function loadState(): GameState | null {
  try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch { /* */ }
  return null;
}

function saveState(state: GameState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* */ }
}

export function useGameState() {
  const saved = loadState();
  const [player, setPlayer] = useState<PlayerState>(saved?.player || defaultPlayer);
  const [network, setNetwork] = useState<NetworkState>(saved?.network || emptyNetwork());
  const [screen, setScreen] = useState<GameState['screen']>(saved?.screen || 'menu');
  const [terminalHistory, setTerminalHistory] = useState<TerminalEntry[]>(saved?.terminalHistory || []);
  const [currentLevelId, setCurrentLevelId] = useState(saved?.currentLevelId || 1);

  useEffect(() => { saveState({ player, network, screen, terminalHistory, currentLevelId }); }, [player, network, screen, terminalHistory, currentLevelId]);

  const addTerminalEntry = useCallback((entry: TerminalEntry) => { setTerminalHistory(prev => [...prev, entry]); }, []);

  const runCommand = useCallback((raw: string) => {
    addTerminalEntry({ type: 'input', text: `> ${raw}` });
    const { result, newNetwork, newPlayer } = executeCommand(raw, network, player);
    setNetwork(newNetwork);
    addTerminalEntry({ type: result.success ? 'success' : 'error', text: result.message });
    if (result.xpGain && result.xpGain > 0) addTerminalEntry({ type: 'system', text: `+${result.xpGain} XP` });

    const level = LEVELS.find(l => l.id === newPlayer.currentLevelId);
    if (level && result.objectiveCompleted) {
      const allDone = level.objectives.every(o => newPlayer.completedObjectives.includes(o.id));
      if (allDone) {
        addTerminalEntry({ type: 'system', text: `LEVEL COMPLETE! ${level.unlockReward} - Unlocked: ${level.unlockTool}` });
        const idx = level.id - 1;
        if (idx < ACHIEVEMENTS.length && !newPlayer.achievements.includes(ACHIEVEMENTS[idx].id)) {
          newPlayer.achievements = [...newPlayer.achievements, ACHIEVEMENTS[idx].id];
        }
        if (level.id < LEVELS.length) { newPlayer.currentLevelId = level.id + 1; newPlayer.level = level.id + 1; }
      }
    }
    setPlayer(newPlayer);
    setCurrentLevelId(newPlayer.currentLevelId);
  }, [network, player, addTerminalEntry]);

  const startLevel = useCallback((levelId: number) => {
    const level = LEVELS.find(l => l.id === levelId);
    if (!level) return;
    setNetwork(level.initialNetwork);
    setCurrentLevelId(levelId);
    setPlayer(prev => ({ ...prev, currentLevelId: levelId, level: levelId }));
    setTerminalHistory([{ type: 'system', text: `=== ${level.title}: ${level.name} ===\n${level.description}\n\nObjectives:\n${level.objectives.map((o, i) => `  ${i + 1}. ${o.description}`).join('\n')}\n\nType 'help' for available commands.` }]);
    setScreen('level');
  }, []);

  const resetProgress = useCallback(() => {
    setPlayer(defaultPlayer); setNetwork(emptyNetwork()); setTerminalHistory([]); setCurrentLevelId(1); setScreen('menu'); localStorage.removeItem(STORAGE_KEY);
  }, []);

  const goToMenu = useCallback(() => setScreen('menu'), []);

  return { player, network, screen, terminalHistory, currentLevelId, setScreen, runCommand, startLevel, resetProgress, goToMenu, addTerminalEntry };
}
