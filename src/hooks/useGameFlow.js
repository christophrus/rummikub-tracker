import { useState, useCallback } from 'react';
import { STORAGE_KEYS } from '../constants';
import { validateMinPlayers } from '../utils';

export const useGameFlow = ({
  activeGame,
  setActiveGame,
  currentPlayerIndex,
  setCurrentPlayerIndex,
  playerExtensions,
  setPlayerExtensions,
  roundScores,
  updateRoundScore,
  saveRound,
  startNewGame,
  playTurnNotification,
  speakPlayerName,
  setTimerActive,
  setTimerSeconds,
  timerDuration
}) => {
  const [declaredWinner, setDeclaredWinner] = useState(null);
  const [pendingGame, setPendingGame] = useState(null);
  const [startingPlayerIndex, setStartingPlayerIndex] = useState(0);

  const handleStartGame = useCallback((players, gameName, timerDuration, maxExtensions, ttsLanguage, minPlayers) => {
    const validPlayers = validateMinPlayers(players, minPlayers);
    
    if (!validPlayers) {
      return { error: 'minPlayersAlert' };
    }

    // Store pending game data and show player selection
    setPendingGame({ validPlayers, gameName, timerDuration, maxExtensions, ttsLanguage });
    return { success: true, showPlayerSelection: true };
  }, []);

  const handlePlayerSelected = useCallback((selectedIndex) => {
    if (!pendingGame) return { error: 'noPendingGame' };
    
    const { validPlayers, gameName, timerDuration, maxExtensions, ttsLanguage } = pendingGame;
    
    try {
      const game = startNewGame(validPlayers, gameName, timerDuration, maxExtensions, ttsLanguage);
      setCurrentPlayerIndex(selectedIndex);
      setStartingPlayerIndex(selectedIndex);
      setPlayerExtensions(game.playerExtensions);
      setTimerActive(false);
      setTimerSeconds(game.timerDuration);
      setPendingGame(null);
      
      setTimeout(() => {
        playTurnNotification();
        speakPlayerName(validPlayers[selectedIndex].name, ttsLanguage);
        setTimerActive(true);
      }, 500);
      
      return { success: true, game, originalTimerDuration: game.originalTimerDuration };
    } catch (error) {
      console.error('Error starting game:', error);
      if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
        return { error: 'quotaExceeded' };
      }
      return { error: 'genericError' };
    }
  }, [pendingGame, startNewGame, setCurrentPlayerIndex, setPlayerExtensions, setTimerActive, setTimerSeconds, playTurnNotification, speakPlayerName]);

  const handleDeclareWinner = useCallback(() => {
    if (!activeGame || !activeGame.players[currentPlayerIndex]) return;
    const winner = activeGame.players[currentPlayerIndex];
    setTimerActive(false);
    setDeclaredWinner(winner);
    updateRoundScore(winner, '0');
  }, [activeGame, currentPlayerIndex, setTimerActive, updateRoundScore]);

  const handleCancelWinner = useCallback(() => {
    setDeclaredWinner(null);
    setTimerActive(true);
  }, [setTimerActive]);

  const handleSaveRound = useCallback((t, ttsLanguage) => {
    if (!activeGame.players.every(p => roundScores[p.name] !== undefined && roundScores[p.name] !== '')) {
      return { error: 'enterAllScoresAlert' };
    }

    const zeroScoresCount = activeGame.players.reduce((count, player) => {
      const raw = roundScores[player.name];
      const score = raw === '' || raw === undefined ? NaN : Number.parseInt(raw, 10);
      return count + (Number.isFinite(score) && score === 0 ? 1 : 0);
    }, 0);

    if (zeroScoresCount > 1) {
      return { error: 'multipleZeroScoresAlert' };
    }
    
    // Update starting player to next in order
    const nextStartingPlayerIndex = (startingPlayerIndex + 1) % activeGame.players.length;
    setStartingPlayerIndex(nextStartingPlayerIndex);
    setCurrentPlayerIndex(nextStartingPlayerIndex);
    
    setTimerActive(false);
    setTimerSeconds(timerDuration);
    setDeclaredWinner(null);
    saveRound();
    
    // Announce the new starting player (timer remains paused)
    setTimeout(() => {
      playTurnNotification();
      speakPlayerName(activeGame.players[nextStartingPlayerIndex].name, activeGame.ttsLanguage || ttsLanguage);
    }, 500);
    
    return { success: true };
  }, [activeGame, roundScores, startingPlayerIndex, setCurrentPlayerIndex, setTimerActive, setTimerSeconds, timerDuration, saveRound, playTurnNotification, speakPlayerName]);

  const cancelPendingGame = useCallback(() => {
    setPendingGame(null);
  }, []);

  return {
    declaredWinner,
    pendingGame,
    startingPlayerIndex,
    handleStartGame,
    handlePlayerSelected,
    handleDeclareWinner,
    handleCancelWinner,
    handleSaveRound,
    cancelPendingGame
  };
};
