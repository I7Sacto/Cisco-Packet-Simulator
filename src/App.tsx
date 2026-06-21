import { useGameState } from './hooks/useGameState';
import MainMenu from './components/MainMenu';
import LevelScreen from './components/LevelScreen';
import ProgressScreen from './components/ProgressScreen';
import AchievementsScreen from './components/AchievementsScreen';
import SettingsScreen from './components/SettingsScreen';
import LabsScreen from './components/LabsScreen';
import PracticeScreen from './components/PracticeScreen';
import { LEVELS } from './engine/levels';
import { executeCommand } from './engine/commands';
import { emptyNetwork } from './engine/network';
import { NetworkState, TerminalEntry } from './engine/types';
import { useCallback, useState } from 'react';

function App() {
  const game = useGameState();
  const [practiceNetwork, setPracticeNetwork] = useState<NetworkState>(emptyNetwork());
  const [practiceHistory, setPracticeHistory] = useState<TerminalEntry[]>([{
    type: 'system', text: "=== PRACTICE MODE ===\nFree play sandbox - practice any commands!\nType 'help' for available commands.",
  }]);

  const handlePracticeCommand = useCallback((cmd: string) => {
    setPracticeHistory(prev => [...prev, { type: 'input', text: `> ${cmd}` }]);
    const { result, newNetwork } = executeCommand(cmd, practiceNetwork, game.player);
    setPracticeNetwork(newNetwork);
    setPracticeHistory(prev => [
      ...prev,
      { type: result.success ? 'success' : 'error', text: result.message },
      ...(result.xpGain ? [{ type: 'system' as const, text: `+${result.xpGain} XP` }] : []),
    ]);
  }, [practiceNetwork, game.player]);

  const handleStartPractice = useCallback(() => {
    const level = LEVELS.find(l => l.id === 1);
    setPracticeNetwork(level?.initialNetwork || emptyNetwork());
    setPracticeHistory([{ type: 'system', text: "=== PRACTICE MODE ===\nFree play sandbox - practice any commands!\nType 'help' for available commands." }]);
    game.setScreen('practice');
  }, [game]);

  switch (game.screen) {
    case 'menu':
      return <MainMenu player={game.player} onStart={() => game.startLevel(game.player.currentLevelId)} onProgress={() => game.setScreen('progress')} onPractice={handleStartPractice} onLabs={() => game.setScreen('labs')} onAchievements={() => game.setScreen('achievements')} onSettings={() => game.setScreen('settings')} />;
    case 'level':
      return <LevelScreen player={game.player} network={game.network} terminalHistory={game.terminalHistory} onCommand={game.runCommand} onBack={game.goToMenu} />;
    case 'progress':
      return <ProgressScreen player={game.player} onBack={game.goToMenu} />;
    case 'achievements':
      return <AchievementsScreen player={game.player} onBack={game.goToMenu} />;
    case 'settings':
      return <SettingsScreen player={game.player} onBack={game.goToMenu} onReset={game.resetProgress} />;
    case 'labs':
      return <LabsScreen player={game.player} onBack={game.goToMenu} onStartLevel={game.startLevel} />;
    case 'practice':
      return <PracticeScreen player={game.player} network={practiceNetwork} terminalHistory={practiceHistory} onCommand={handlePracticeCommand} onBack={game.goToMenu} />;
    default:
      return <MainMenu player={game.player} onStart={() => game.startLevel(1)} onProgress={() => game.setScreen('progress')} onPractice={handleStartPractice} onLabs={() => game.setScreen('labs')} onAchievements={() => game.setScreen('achievements')} onSettings={() => game.setScreen('settings')} />;
  }
}

export default App;
