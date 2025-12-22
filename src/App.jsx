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
  ThemeProvider,
  useGameFlow,
  useTimerControl,
  usePlayerManagement,
  useGamePlayerManagement
} from './hooks';

// Import constants
import { VIEWS, STORAGE_KEYS, MAX_PLAYERS, MIN_PLAYERS, EXTENSION_DURATION_SECONDS } from './constants';

// Import utilities
// (No utilities currently imported)

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
  const [scrollLockInFullscreen, setScrollLockInFullscreen] = useState(() => {
    const saved = localStorage.getItem('scroll-lock-fullscreen');
    return saved === null ? true : saved === 'true';
  });

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
    endGame,
    cancelActiveGame,
    deleteGame,
    deleteSavedPlayer,
    addSavedPlayerToGame,
    startNewGame
  } = gameData;

  // Localization
  const { uiLanguage, changeUiLanguage } = useLocalization();

  // New Game form state
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

  // Audio
  const { playTickTock, playTurnNotification, speakPlayerName, playVictorySound } = useAudio();

  // Timer (kept for useTimer hook compatibility)
  const handleTimeUp = useCallback(() => {
    // This is now handled by the useEffect watching timerSeconds
  }, []);

  const { 
    timerSeconds, 
    setTimerSeconds
  } = useTimer(timerDuration, handleTimeUp, false);

  const [timerActive, setTimerActive] = useState(false);
  const [gameElapsedTime, setGameElapsedTime] = useState('');
  const [initialExpandedGameId, setInitialExpandedGameId] = useState(null);

  // Player management hooks
  const playerManagement = usePlayerManagement(MAX_PLAYERS);
  const {
    players,
    setPlayers,
    draggedPlayerIndex,
    addPlayer,
    removePlayer,
    updatePlayer,
    movePlayerUp,
    movePlayerDown,
    handleImageUploadWrapper,
    handleDragStart,
    handleDragOver,
    handleDrop,
    resetPlayers
  } = playerManagement;

  const gamePlayerManagement = useGamePlayerManagement({
    activeGame,
    setActiveGame,
    currentPlayerIndex,
    setCurrentPlayerIndex
  });
  const {
    draggedGamePlayerIndex,
    moveGamePlayerUp,
    moveGamePlayerDown,
    handleGameDragStart,
    handleGameDragOver,
    handleGameDrop
  } = gamePlayerManagement;

  // Timer control hook
  const timerControl = useTimerControl({
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
  });
  const {
    nextPlayer,
    extendTimer,
    updateTimerDuration,
    resetTimer,
    pauseTimer,
    resumeTimer
  } = timerControl;

  // Game flow hook
  const gameFlow = useGameFlow({
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
    playVictorySound,
    setTimerActive,
    setTimerSeconds,
    timerDuration
  });
  const {
    declaredWinner,
    pendingGame,
    handleStartGame: handleStartGameFlow,
    handlePlayerSelected: handlePlayerSelectedFlow,
    handleDeclareWinner,
    handleCancelWinner,
    handleSaveRound: handleSaveRoundFlow,
    cancelPendingGame
  } = gameFlow;


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
  }, [timerActive, timerSeconds, timerDuration, playTickTock, setTimerSeconds]);

  // Handle timer expiration
  useEffect(() => {
    if (timerSeconds === 0 && activeGame && !timerActive) {
      nextPlayer();
    }
  }, [timerSeconds, activeGame, timerActive, nextPlayer]);

  // Fullscreen listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Control scrolling in fullscreen mode
  useEffect(() => {
    if (isFullscreen && scrollLockInFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen, scrollLockInFullscreen]);

  // Update game elapsed time (hours and minutes only)
  useEffect(() => {
    if (!activeGame || !activeGame.startTime) return;
    
    const updateElapsedTime = () => {
      const start = new Date(activeGame.startTime);
      const now = new Date();
      const diffMs = now - start;
      const totalMinutes = Math.floor(diffMs / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      
      if (hours > 0) {
        setGameElapsedTime(`${hours}h ${mins}m`);
      } else {
        setGameElapsedTime(`${mins}m`);
      }
    };
    
    updateElapsedTime();
    const interval = setInterval(updateElapsedTime, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [activeGame]);

  // Load timer duration from active game
  useEffect(() => {
    if (activeGame && activeGame.timerDuration) {
      setTimerDuration(activeGame.timerDuration);
      setOriginalTimerDuration(activeGame.originalTimerDuration || activeGame.timerDuration);
      setTimerSeconds(activeGame.timerDuration);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGame?.timerDuration]);

  // Translation function
  const t = (key, replacements = {}) => {
    let text = translations[uiLanguage]?.[key] || translations.en[key] || key;
    Object.keys(replacements).forEach(replaceKey => {
      text = text.replace(`{{${replaceKey}}}`, replacements[replaceKey]);
    });
    return text;
  };

  // New game flow
  const handleStartNewGame = () => {
    if (activeGame) {
      if (!window.confirm(t('endCurrentGameConfirm'))) {
        return;
      }
    }
    setView(VIEWS.NEW_GAME);
    resetPlayers();
    setGameName('');
  };

  const handleStartGame = () => {
    const result = handleStartGameFlow(players, gameName, timerDuration, maxExtensions, ttsLanguage, MIN_PLAYERS);
    
    if (result.error) {
      alert(t(result.error));
      return;
    }

    if (result.showPlayerSelection) {
      setView(VIEWS.PLAYER_SELECTION);
    }
  };

  const handlePlayerSelected = (selectedIndex) => {
    const result = handlePlayerSelectedFlow(selectedIndex);
    
    if (result.error) {
      if (result.error === 'quotaExceeded') {
        alert('Storage quota exceeded! This usually happens when player images are too large. Try:\n\n1. Using smaller images\n2. Removing some player photos\n3. Clearing old game history\n4. Using browser settings to increase storage limit');
      } else {
        alert('Error starting game. Please try again.');
      }
      return;
    }

    if (result.success) {
      setOriginalTimerDuration(result.originalTimerDuration);
      setView(VIEWS.ACTIVE_GAME);
    }
  };

  const handleSaveRound = () => {
    const result = handleSaveRoundFlow(t, ttsLanguage);
    
    if (result.error) {
      alert(t(result.error));
    }
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
    // Store without player images; images are persisted only in saved-players.
    localStorage.setItem(STORAGE_KEYS.ACTIVE_GAME, JSON.stringify({
      ...updatedGame,
      players: updatedGame.players?.map(p => ({ name: p.name }))
    }));
  };

  const handleEndGame = () => {
    setTimerActive(false);
    setTimerSeconds(timerDuration);
    
    const completedGame = endGame();
    setInitialExpandedGameId(completedGame?.id || null);
    setView(VIEWS.GAME_HISTORY);
  };

  const handleCancelActiveGame = () => {
    if (!activeGame) return;
    if (!window.confirm(t('cancelActiveGameConfirm'))) return;

    setTimerActive(false);
    setTimerSeconds(timerDuration);
    cancelActiveGame();
    setView(VIEWS.HOME);
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

  // Toggle scroll lock in fullscreen
  const toggleScrollLock = () => {
    const newValue = !scrollLockInFullscreen;
    setScrollLockInFullscreen(newValue);
    localStorage.setItem('scroll-lock-fullscreen', newValue.toString());
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
            onCancelActiveGame={handleCancelActiveGame}
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
            onAddPlayer={addPlayer}
            onRemovePlayer={removePlayer}
            onUpdatePlayer={updatePlayer}
            onImageUpload={handleImageUploadWrapper}
            onMovePlayerUp={movePlayerUp}
            onMovePlayerDown={movePlayerDown}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
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
                cancelPendingGame();
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
            gameElapsedTime={gameElapsedTime}
            roundScores={roundScores}
            playerExtensions={playerExtensions}
            draggedGamePlayerIndex={draggedGamePlayerIndex}
            declaredWinner={declaredWinner}
            onClose={() => {
              setTimerActive(false);
              setView(VIEWS.HOME);
            }}
            onNextPlayer={nextPlayer}
            onPause={pauseTimer}
            onResume={resumeTimer}
            onResetTimer={resetTimer}
            onExtendTimer={extendTimer}
            onUpdateTimerDuration={updateTimerDuration}
            onUpdateRoundScore={updateRoundScore}
            onUpdatePastScore={handleUpdatePastScore}
            onSaveRound={handleSaveRound}
            onEndGame={handleEndGame}
            onDeclareWinner={handleDeclareWinner}
            onCancelWinner={handleCancelWinner}
            onMovePlayerUp={moveGamePlayerUp}
            onMovePlayerDown={moveGamePlayerDown}
            onDragStart={handleGameDragStart}
            onDragOver={handleGameDragOver}
            onDrop={handleGameDrop}
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
            onClose={() => {
              setInitialExpandedGameId(null);
              setView(VIEWS.HOME);
            }}
            onDeleteGame={deleteGame}
            initialExpandedGameId={initialExpandedGameId}
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

      {isFullscreen && (
        <button 
          onClick={toggleScrollLock}
          className="fixed bottom-6 left-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-110 z-40"
          title={scrollLockInFullscreen ? t('unlockScrolling') : t('lockScrolling')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {scrollLockInFullscreen ? (
              <>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </>
            ) : (
              <>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
              </>
            )}
          </svg>
        </button>
      )}
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