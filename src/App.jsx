import React, { useState, useEffect, useCallback } from 'react';
import { Maximize, Minimize } from 'lucide-react';

// Import translations
import enTranslations from './locales/en.js';
import deTranslations from './locales/de.js';
import frTranslations from './locales/fr.js';

// Import hooks
import { 
  useGameData, 
  useTimer, 
  useAudio, 
  useLocalization,
  ThemeProvider
} from './hooks';

// Import constants
import { VIEWS, STORAGE_KEYS, MAX_PLAYERS, MIN_PLAYERS, EXTENSION_DURATION_SECONDS } from './constants';

// Import utilities
import { 
  handleImageUpload, 
  validateMinPlayers,
  movePlayerUp,
  movePlayerDown,
  reorderPlayers,
  updatePlayer,
  addPlayer,
  removePlayer
} from './utils';

// Import components
import {
  HomeView,
  NewGameView,
  ActiveGameView,
  GameHistoryView,
  ManagePlayersView,
  SettingsView
} from './components/views';

// Build translations object
const translations = {
  en: enTranslations,
  de: deTranslations,
  fr: frTranslations
};

const RummikubTracker = () => {
  // Views
  const [view, setView] = useState(VIEWS.HOME);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Game data
  const gameData = useGameData();
  const {
    activeGame,
    setActiveGame,
    gameHistory,
    savedPlayers,
    currentPlayerIndex,
    setCurrentPlayerIndex,
    currentRound,
    roundScores,
    playerExtensions,
    setPlayerExtensions,
    loading,
    updateRoundScore,
    saveRound,
    calculateTotals,
    endGame,
    deleteGame,
    deleteSavedPlayer,
    addSavedPlayerToGame,
    startNewGame
  } = gameData;

  // Localization
  const { uiLanguage, changeUiLanguage } = useLocalization();

  // New Game form state
  const [players, setPlayers] = useState([{ name: '', image: null }]);
  const [gameName, setGameName] = useState('');
  const [timerDuration, setTimerDuration] = useState(() => {
    const saved = localStorage.getItem('preferred-timer-duration');
    return saved ? Number(saved) : 60;
  });
  const [originalTimerDuration, setOriginalTimerDuration] = useState(60);
  const [maxExtensions, setMaxExtensions] = useState(3);
  const [ttsLanguage, setTtsLanguage] = useState(() => {
    const saved = localStorage.getItem('tts-language');
    return saved || 'de-DE';
  });
  const [draggedPlayerIndex, setDraggedPlayerIndex] = useState(null);
  const [draggedGamePlayerIndex, setDraggedGamePlayerIndex] = useState(null);
  const [declaredWinner, setDeclaredWinner] = useState(null);
  const [pendingGame, setPendingGame] = useState(null);
  const [startingPlayerIndex, setStartingPlayerIndex] = useState(0);

  // Audio
  const { playTickTock, playTurnNotification, speakPlayerName } = useAudio();

  // Timer (kept for useTimer hook compatibility)
  const handleTimeUp = useCallback(() => {
    // This is now handled by the useEffect watching timerSeconds
  }, []);

  const { 
    timerSeconds, 
    setTimerSeconds, 
    resetTimer: timerResetTimer, 
    updateDuration: timerUpdateDuration 
  } = useTimer(timerDuration, handleTimeUp, false);

  const [timerActive, setTimerActive] = useState(false);


  // Timer interval effect
  useEffect(() => {
    let interval;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          const newValue = prev - 1;
          if (newValue <= 10 && newValue > 0) {
            playTickTock();
          }
          if (newValue <= 0) {
            setTimerActive(false);
            return 0;
          }
          return newValue;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds, timerDuration, playTickTock]);

  // Handle timer expiration
  useEffect(() => {
    if (timerSeconds === 0 && activeGame && !timerActive) {
      nextPlayer();
    }
  }, [timerSeconds, activeGame, timerActive]);

  // Fullscreen listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Load timer duration from active game
  useEffect(() => {
    if (activeGame && activeGame.timerDuration) {
      setTimerDuration(activeGame.timerDuration);
      setOriginalTimerDuration(activeGame.originalTimerDuration || activeGame.timerDuration);
      setTimerSeconds(activeGame.timerDuration);
    }
  }, [activeGame?.timerDuration]);

  // Translation function
  const t = (key, replacements = {}) => {
    let text = translations[uiLanguage]?.[key] || translations.en[key] || key;
    Object.keys(replacements).forEach(replaceKey => {
      text = text.replace(`{{${replaceKey}}}`, replacements[replaceKey]);
    });
    return text;
  };

  // Game functions
  const nextPlayer = () => {
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
  };

  const extendTimer = () => {
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
  };

  const updateTimerDuration = (newDuration) => {
    setTimerDuration(newDuration);
    setOriginalTimerDuration(newDuration);
    setTimerSeconds(newDuration);
    if (activeGame) {
      const updatedGame = { ...activeGame, timerDuration: newDuration, originalTimerDuration: newDuration };
      setActiveGame(updatedGame);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_GAME, JSON.stringify(updatedGame));
    }
  };

  // Player management functions
  const handleAddPlayer = () => {
    setPlayers(addPlayer(players, MAX_PLAYERS));
  };

  const handleRemovePlayer = (index) => {
    setPlayers(removePlayer(players, index));
  };

  const handleUpdatePlayer = (index, field, value) => {
    setPlayers(updatePlayer(players, index, field, value));
  };

  const handleMovePlayerUp = (index) => {
    setPlayers(movePlayerUp(players, index));
  };

  const handleMovePlayerDown = (index) => {
    setPlayers(movePlayerDown(players, index));
  };

  const handleImageUploadWrapper = (index, file) => {
    handleImageUpload(file, (resizedImage) => {
      handleUpdatePlayer(index, 'image', resizedImage);
    });
  };

  const handleGamePlayerReorder = (dragIndex, dropIndex) => {
    if (!activeGame) return;
    const currentPlayerName = activeGame.players[currentPlayerIndex].name;
    const newPlayers = reorderPlayers(activeGame.players, dragIndex, dropIndex);
    const newCurrentPlayerIndex = newPlayers.findIndex(p => p.name === currentPlayerName);
    
    const updatedGame = {
      ...activeGame,
      players: newPlayers,
      currentPlayerIndex: newCurrentPlayerIndex
    };
    
    setActiveGame(updatedGame);
    setCurrentPlayerIndex(newCurrentPlayerIndex);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_GAME, JSON.stringify(updatedGame));
  };

  const handleMoveGamePlayerUp = (index) => {
    if (index === 0) return;
    handleGamePlayerReorder(index, index - 1);
  };

  const handleMoveGamePlayerDown = (index) => {
    if (!activeGame || index === activeGame.players.length - 1) return;
    handleGamePlayerReorder(index, index + 1);
  };

  // New game flow
  const handleStartNewGame = () => {
    if (activeGame) {
      if (!window.confirm(t('endCurrentGameConfirm'))) {
        return;
      }
    }
    setView(VIEWS.NEW_GAME);
    setPlayers([{ name: '', image: null }]);
    setGameName('');
  };

  const handleStartGame = () => {
    const validPlayers = validateMinPlayers(players, MIN_PLAYERS);
    
    if (!validPlayers) {
      alert(t('minPlayersAlert'));
      return;
    }

    // Store pending game data and show player selection
    setPendingGame({ validPlayers, gameName, timerDuration, maxExtensions, ttsLanguage });
    setView(VIEWS.PLAYER_SELECTION);
  };

  const handlePlayerSelected = (selectedIndex) => {
    if (!pendingGame) return;
    
    const { validPlayers, gameName, timerDuration, maxExtensions, ttsLanguage } = pendingGame;
    
    try {
      const game = startNewGame(validPlayers, gameName, timerDuration, maxExtensions, ttsLanguage);
      setCurrentPlayerIndex(selectedIndex);
      setStartingPlayerIndex(selectedIndex);
      setPlayerExtensions(game.playerExtensions);
      setTimerActive(false);
      setTimerSeconds(game.timerDuration);
      setOriginalTimerDuration(game.originalTimerDuration);
      setView(VIEWS.ACTIVE_GAME);
      setPendingGame(null);
      
      setTimeout(() => {
        playTurnNotification();
        speakPlayerName(validPlayers[selectedIndex].name, ttsLanguage);
        setTimerActive(true);
      }, 500);
    } catch (error) {
      console.error('Error starting game:', error);
      if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
        alert('Storage quota exceeded! This usually happens when player images are too large. Try:\n\n1. Using smaller images\n2. Removing some player photos\n3. Clearing old game history\n4. Using browser settings to increase storage limit');
      } else {
        alert('Error starting game. Please try again.');
      }
    }
  };

  const handleDeclareWinner = () => {
    if (!activeGame || !activeGame.players[currentPlayerIndex]) return;
    const winner = activeGame.players[currentPlayerIndex];
    setTimerActive(false);
    setDeclaredWinner(winner);
    updateRoundScore(winner, '0');
  };

  const handleCancelWinner = () => {
    setDeclaredWinner(null);
    setTimerActive(true);
  };

  const handleSaveRound = () => {
    if (!activeGame.players.every(p => roundScores[p.name] !== undefined && roundScores[p.name] !== '')) {
      alert(t('enterAllScoresAlert'));
      return;
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
  };

  const handleUpdatePastScore = (roundIndex, playerName, newScore) => {
    if (!activeGame) return;
    
    // Parse and convert to remove leading zeros
    const parsedScore = newScore === '' ? '0' : String(parseInt(newScore) || 0);
    
    const updatedRounds = [...activeGame.rounds];
    updatedRounds[roundIndex] = {
      ...updatedRounds[roundIndex],
      scores: {
        ...updatedRounds[roundIndex].scores,
        [playerName]: parsedScore
      }
    };
    
    const updatedGame = {
      ...activeGame,
      rounds: updatedRounds
    };
    
    setActiveGame(updatedGame);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_GAME, JSON.stringify(updatedGame));
  };

  const handleEndGame = () => {
    setTimerActive(false);
    setTimerSeconds(timerDuration);
    
    endGame();
    setView(VIEWS.GAME_HISTORY);
  };

  const handleResumeGame = () => {
    setView(VIEWS.ACTIVE_GAME);
    setTimeout(() => {
      playTurnNotification();
      speakPlayerName(activeGame.players[currentPlayerIndex].name, activeGame.ttsLanguage || ttsLanguage);
      setTimerActive(true);
    }, 500);
  };

  const handleAddSavedPlayer = (savedPlayer) => {
    if (players.length >= MAX_PLAYERS) {
      alert(t('maxPlayersAlert'));
      return;
    }
    if (players.some(p => p.name.toLowerCase() === savedPlayer.name.toLowerCase())) {
      alert(t('playerAlreadyAddedAlert'));
      return;
    }
    
    const newPlayers = addSavedPlayerToGame(players, savedPlayer);
    setPlayers(newPlayers);
  };

  // Settings handlers
  const handleTtsLanguageChange = (newLang) => {
    setTtsLanguage(newLang);
    localStorage.setItem('tts-language', newLang);
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-xl text-gray-700 dark:text-gray-300">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        {!(isFullscreen && view === VIEWS.ACTIVE_GAME) && (
          <div className="text-center mb-6 sm:mb-8 pt-4 sm:pt-6">
            <h1 className="text-2xl sm:text-4xl font-bold text-indigo-900 dark:text-indigo-300 mb-2">{t('appTitle')}</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4">{t('appSubtitle')}</p>
          </div>
        )}

        {view === VIEWS.HOME && (
          <HomeView
            activeGame={activeGame}
            currentPlayerIndex={currentPlayerIndex}
            onNewGame={handleStartNewGame}
            onResume={handleResumeGame}
            onManagePlayers={() => setView(VIEWS.MANAGE_PLAYERS)}
            onViewHistory={() => setView(VIEWS.GAME_HISTORY)}
            onSettings={() => setView(VIEWS.SETTINGS)}
            t={t}
          />
        )}

        {view === VIEWS.NEW_GAME && (
          <NewGameView
            players={players}
            gameName={gameName}
            timerDuration={timerDuration}
            maxExtensions={maxExtensions}
            savedPlayers={savedPlayers}
            onClose={() => setView(VIEWS.HOME)}
            onGameNameChange={setGameName}
            onTimerDurationChange={(duration) => {
              setTimerDuration(duration);
              localStorage.setItem('preferred-timer-duration', duration);
            }}
            onMaxExtensionsChange={setMaxExtensions}
            onAddPlayer={handleAddPlayer}
            onRemovePlayer={handleRemovePlayer}
            onUpdatePlayer={handleUpdatePlayer}
            onImageUpload={handleImageUploadWrapper}
            onMovePlayerUp={handleMovePlayerUp}
            onMovePlayerDown={handleMovePlayerDown}
            onDragStart={(index) => setDraggedPlayerIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e, index) => {
              e.preventDefault();
              if (draggedPlayerIndex !== null && draggedPlayerIndex !== index) {
                const newPlayers = reorderPlayers(players, draggedPlayerIndex, index);
                setPlayers(newPlayers);
              }
              setDraggedPlayerIndex(null);
            }}
            onAddSavedPlayer={handleAddSavedPlayer}
            onStartGame={handleStartGame}
            draggedPlayerIndex={draggedPlayerIndex}
            t={t}
          />
        )}

        {view === VIEWS.PLAYER_SELECTION && pendingGame && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{t('selectStartingPlayer')}</h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{t('selectStartingPlayerSubtitle')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {pendingGame.validPlayers.map((player, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePlayerSelected(idx)}
                  className="p-4 sm:p-6 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition flex items-center gap-3 sm:gap-4"
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 flex items-center justify-center overflow-hidden border-2 border-white dark:border-gray-700 shadow-lg flex-shrink-0">
                    {player.image ? (
                      <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl sm:text-3xl font-bold text-white">
                        {player.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 truncate flex-1 text-left">{player.name}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setPendingGame(null);
                setView(VIEWS.NEW_GAME);
              }}
              className="w-full mt-4 px-4 py-2 sm:py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition font-semibold text-sm sm:text-base"
            >
              {t('back')}
            </button>
          </div>
        )}

        {view === VIEWS.ACTIVE_GAME && activeGame && (
          <ActiveGameView
            activeGame={activeGame}
            currentPlayerIndex={currentPlayerIndex}
            timerSeconds={timerSeconds}
            timerDuration={timerDuration}
            timerActive={timerActive}
            currentRound={currentRound}
            roundScores={roundScores}
            playerExtensions={playerExtensions}
            draggedGamePlayerIndex={draggedGamePlayerIndex}
            declaredWinner={declaredWinner}
            onClose={() => {
              setTimerActive(false);
              setView(VIEWS.HOME);
            }}
            onNextPlayer={nextPlayer}
            onPause={() => setTimerActive(false)}
            onResume={() => setTimerActive(true)}
            onResetTimer={() => {
              setTimerSeconds(originalTimerDuration);
              setTimerDuration(originalTimerDuration);
              setTimerActive(true);
            }}
            onExtendTimer={extendTimer}
            onUpdateTimerDuration={updateTimerDuration}
            onUpdateRoundScore={updateRoundScore}
            onUpdatePastScore={handleUpdatePastScore}
            onSaveRound={handleSaveRound}
            onEndGame={handleEndGame}
            onDeclareWinner={handleDeclareWinner}
            onCancelWinner={handleCancelWinner}
            onMovePlayerUp={handleMoveGamePlayerUp}
            onMovePlayerDown={handleMoveGamePlayerDown}
            onDragStart={(index) => setDraggedGamePlayerIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e, index) => {
              e.preventDefault();
              if (draggedGamePlayerIndex !== null && draggedGamePlayerIndex !== index) {
                handleGamePlayerReorder(draggedGamePlayerIndex, index);
              }
              setDraggedGamePlayerIndex(null);
            }}
            t={t}
          />
        )}

        {view === VIEWS.MANAGE_PLAYERS && (
          <ManagePlayersView
            savedPlayers={savedPlayers}
            onClose={() => setView(VIEWS.HOME)}
            onDeletePlayer={deleteSavedPlayer}
            t={t}
          />
        )}

        {view === VIEWS.GAME_HISTORY && (
          <GameHistoryView
            gameHistory={gameHistory}
            onClose={() => setView(VIEWS.HOME)}
            onDeleteGame={deleteGame}
            t={t}
          />
        )}

        {view === VIEWS.SETTINGS && (
          <SettingsView
            uiLanguage={uiLanguage}
            ttsLanguage={ttsLanguage}
            onClose={() => setView(VIEWS.HOME)}
            onUiLanguageChange={changeUiLanguage}
            onTtsLanguageChange={handleTtsLanguageChange}
            t={t}
          />
        )}
      </div>

      <button 
        onClick={toggleFullscreen}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-110 z-40"
        title={isFullscreen ? t('exitFullscreen') : t('enterFullscreen')}
      >
        {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
      </button>
    </div>
  );
};

// Wrap with ThemeProvider
const App = () => (
  <ThemeProvider>
    <RummikubTracker />
  </ThemeProvider>
);

export default App;