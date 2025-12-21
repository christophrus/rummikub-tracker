import { useCallback } from 'react';
import { STORAGE_KEYS, EXTENSION_DURATION_SECONDS } from '../constants';

export const useTimerControl = ({
  activeGame,
  setActiveGame,
  currentPlayerIndex,
  setCurrentPlayerIndex,
  timerSeconds,
  setTimerSeconds,
  timerDuration,
  setTimerDuration,
  originalTimerDuration,
  setOriginalTimerDuration,
  playerExtensions,
  setPlayerExtensions,
  setTimerActive,
  playTurnNotification,
  speakPlayerName,
  ttsLanguage
}) => {
  const nextPlayer = useCallback(() => {
    if (!activeGame) return;
    setTimerActive(false);
    const nextIndex = (currentPlayerIndex + 1) % activeGame.players.length;
    const nextPlayerName = activeGame.players[nextIndex].name;
    playTurnNotification();
    speakPlayerName(nextPlayerName, activeGame.ttsLanguage || ttsLanguage);
    setCurrentPlayerIndex(nextIndex);
    setTimerSeconds(originalTimerDuration);
    setTimerDuration(originalTimerDuration);
    const updatedGame = { ...activeGame, currentPlayerIndex: nextIndex };
    setActiveGame(updatedGame);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_GAME, JSON.stringify(updatedGame));
    setTimeout(() => setTimerActive(true), 500);
  }, [activeGame, currentPlayerIndex, originalTimerDuration, playTurnNotification, speakPlayerName, ttsLanguage, setTimerActive, setCurrentPlayerIndex, setTimerSeconds, setTimerDuration, setActiveGame]);

  const extendTimer = useCallback(() => {
    if (!activeGame || !activeGame.players[currentPlayerIndex]) return;
    const currentPlayer = activeGame.players[currentPlayerIndex];
    const extensionsUsed = playerExtensions[currentPlayer.name] || 0;
    const maxAllowed = activeGame.maxExtensions || 3;
    if (extensionsUsed >= maxAllowed) return;
    
    const newTime = timerSeconds + EXTENSION_DURATION_SECONDS;
    setTimerSeconds(newTime);
    setTimerDuration(newTime);
    const updatedExtensions = { ...playerExtensions, [currentPlayer.name]: extensionsUsed + 1 };
    setPlayerExtensions(updatedExtensions);
    const updatedGame = { ...activeGame, playerExtensions: updatedExtensions };
    setActiveGame(updatedGame);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_GAME, JSON.stringify(updatedGame));
  }, [activeGame, currentPlayerIndex, timerSeconds, playerExtensions, setTimerSeconds, setTimerDuration, setPlayerExtensions, setActiveGame]);

  const updateTimerDuration = useCallback((newDuration) => {
    setTimerDuration(newDuration);
    setOriginalTimerDuration(newDuration);
    setTimerSeconds(newDuration);
    if (activeGame) {
      const updatedGame = { ...activeGame, timerDuration: newDuration, originalTimerDuration: newDuration };
      setActiveGame(updatedGame);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_GAME, JSON.stringify(updatedGame));
    }
  }, [activeGame, setTimerDuration, setOriginalTimerDuration, setTimerSeconds, setActiveGame]);

  const resetTimer = useCallback(() => {
    setTimerSeconds(originalTimerDuration);
    setTimerDuration(originalTimerDuration);
    setTimerActive(true);
  }, [originalTimerDuration, setTimerSeconds, setTimerDuration, setTimerActive]);

  const pauseTimer = useCallback(() => {
    setTimerActive(false);
  }, [setTimerActive]);

  const resumeTimer = useCallback(() => {
    setTimerActive(true);
  }, [setTimerActive]);

  return {
    nextPlayer,
    extendTimer,
    updateTimerDuration,
    resetTimer,
    pauseTimer,
    resumeTimer
  };
};
