import React, { useState, useEffect } from 'react';
import { Plus, Timer, Trophy, History, X, Play, Pause, RotateCcw, Check, Trash2, SkipForward, Maximize, Minimize, Globe } from 'lucide-react';

// Import language files
import enTranslations from './locales/en.js';
import deTranslations from './locales/de.js';
import frTranslations from './locales/fr.js';

// Build translations object from imported files
const translations = {
  en: enTranslations,
  de: deTranslations,
  fr: frTranslations
};

const RummikubTracker = () => {
  const [view, setView] = useState('home');
  const [players, setPlayers] = useState([{ name: '', image: null }]);
  const [gameName, setGameName] = useState('');
  const [activeGame, setActiveGame] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [savedPlayers, setSavedPlayers] = useState([]);
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [timerDuration, setTimerDuration] = useState(60);
  const [maxExtensions, setMaxExtensions] = useState(3);
  const [playerExtensions, setPlayerExtensions] = useState({});
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [roundScores, setRoundScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [audioContext, setAudioContext] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [draggedPlayerIndex, setDraggedPlayerIndex] = useState(null);
  const [draggedGamePlayerIndex, setDraggedGamePlayerIndex] = useState(null);
  const [ttsLanguage, setTtsLanguage] = useState('de-DE');
  const [uiLanguage, setUiLanguage] = useState('en');

  // Translation function
  const t = (key, replacements = {}) => {
    let text = translations[uiLanguage]?.[key] || translations.en[key] || key;
    Object.keys(replacements).forEach(replaceKey => {
      text = text.replace(`{{${replaceKey}}}`, replacements[replaceKey]);
    });
    return text;
  };

  useEffect(() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    setAudioContext(ctx);
    return () => ctx.close();
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let interval;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          const newValue = prev - 1;
          if (newValue <= 15 && newValue > 0) {
            playTickTock();
          }
          if (newValue <= 0) {
            setTimerActive(false);
            nextPlayer();
            return timerDuration;
          }
          return newValue;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds, timerDuration]);

  const playTickTock = () => {
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const playTurnNotification = () => {
    if (!audioContext) return;
    [523.25, 659.25].forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      const startTime = audioContext.currentTime + (index * 0.15);
      gainNode.gain.setValueAtTime(0.4, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    });
  };

  const speakPlayerName = (playerName, language = ttsLanguage) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(playerName);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = language;
      
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(voice => voice.lang.startsWith(language.split('-')[0]));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }
      
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 400);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const loadData = () => {
    try {
      const historyData = localStorage.getItem('game-history');
      if (historyData) setGameHistory(JSON.parse(historyData));
      
      const savedPlayersData = localStorage.getItem('saved-players');
      if (savedPlayersData) setSavedPlayers(JSON.parse(savedPlayersData));
      
      const savedUiLanguage = localStorage.getItem('ui-language');
      if (savedUiLanguage) setUiLanguage(savedUiLanguage);
      
      const activeGameData = localStorage.getItem('active-game');
      if (activeGameData) {
        const game = JSON.parse(activeGameData);
        if (game.players) {
          game.players = game.players.map(p => typeof p === 'string' ? { name: p, image: null } : p);
        }
        if (!game.playerExtensions) {
          game.playerExtensions = {};
          game.players.forEach(p => game.playerExtensions[p.name] = 0);
        }
        setActiveGame(game);
        setCurrentPlayerIndex(game.currentPlayerIndex || 0);
        setCurrentRound(game.rounds.length + 1);
        setTimerDuration(game.timerDuration || 60);
        setTimerSeconds(game.timerDuration || 60);
        setPlayerExtensions(game.playerExtensions || {});
        setTtsLanguage(game.ttsLanguage || 'de-DE');
        setTimerActive(false);
        setView('home');
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const changeUiLanguage = (lang) => {
    setUiLanguage(lang);
    localStorage.setItem('ui-language', lang);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const nextPlayer = () => {
    if (!activeGame) return;
    setTimerActive(false);
    const nextIndex = (currentPlayerIndex + 1) % activeGame.players.length;
    const nextPlayerName = activeGame.players[nextIndex].name;
    playTurnNotification();
    speakPlayerName(nextPlayerName, activeGame.ttsLanguage || ttsLanguage);
    setCurrentPlayerIndex(nextIndex);
    setTimerSeconds(timerDuration);
    const updatedGame = { ...activeGame, currentPlayerIndex: nextIndex };
    setActiveGame(updatedGame);
    localStorage.setItem('active-game', JSON.stringify(updatedGame));
    setTimeout(() => setTimerActive(true), 500);
  };

  const resetTimer = () => {
    setTimerSeconds(timerDuration);
    setTimerActive(true);
  };

  const extendTimer = () => {
    if (!activeGame || !activeGame.players[currentPlayerIndex]) return;
    const currentPlayer = activeGame.players[currentPlayerIndex];
    const extensionsUsed = playerExtensions[currentPlayer.name] || 0;
    const maxAllowed = activeGame.maxExtensions || 3;
    if (extensionsUsed >= maxAllowed) return;
    setTimerSeconds(prev => prev + 30);
    const updatedExtensions = { ...playerExtensions, [currentPlayer.name]: extensionsUsed + 1 };
    setPlayerExtensions(updatedExtensions);
    const updatedGame = { ...activeGame, playerExtensions: updatedExtensions };
    setActiveGame(updatedGame);
    localStorage.setItem('active-game', JSON.stringify(updatedGame));
  };

  const updateTimerDuration = (newDuration) => {
    setTimerDuration(newDuration);
    setTimerSeconds(newDuration);
    if (activeGame) {
      const updatedGame = { ...activeGame, timerDuration: newDuration };
      setActiveGame(updatedGame);
      localStorage.setItem('active-game', JSON.stringify(updatedGame));
    }
  };

  const addPlayer = () => {
    if (players.length < 6) setPlayers([...players, { name: '', image: null }]);
  };

  const updatePlayer = (index, field, value) => {
    const newPlayers = [...players];
    newPlayers[index][field] = value;
    setPlayers(newPlayers);
  };

  const handleImageUpload = (index, file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set maximum dimensions
          const maxSize = 200;
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions maintaining aspect ratio
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          // Resize image
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with compression (0.8 quality)
          const resizedImage = canvas.toDataURL('image/jpeg', 0.8);
          updatePlayer(index, 'image', resizedImage);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const removePlayer = (index) => {
    if (players.length > 1) setPlayers(players.filter((_, i) => i !== index));
  };

  const movePlayerUp = (index) => {
    if (index === 0) return;
    const newPlayers = [...players];
    [newPlayers[index - 1], newPlayers[index]] = [newPlayers[index], newPlayers[index - 1]];
    setPlayers(newPlayers);
  };

  const movePlayerDown = (index) => {
    if (index === players.length - 1) return;
    const newPlayers = [...players];
    [newPlayers[index], newPlayers[index + 1]] = [newPlayers[index + 1], newPlayers[index]];
    setPlayers(newPlayers);
  };

  const moveGamePlayerUp = (index) => {
    if (index === 0) return;
    const currentPlayerName = activeGame.players[currentPlayerIndex].name;
    const newPlayers = [...activeGame.players];
    [newPlayers[index - 1], newPlayers[index]] = [newPlayers[index], newPlayers[index - 1]];
    
    const newCurrentPlayerIndex = newPlayers.findIndex(p => p.name === currentPlayerName);
    
    const updatedGame = {
      ...activeGame,
      players: newPlayers,
      currentPlayerIndex: newCurrentPlayerIndex
    };
    
    setActiveGame(updatedGame);
    setCurrentPlayerIndex(newCurrentPlayerIndex);
    localStorage.setItem('active-game', JSON.stringify(updatedGame));
  };

  const moveGamePlayerDown = (index) => {
    if (index === activeGame.players.length - 1) return;
    const currentPlayerName = activeGame.players[currentPlayerIndex].name;
    const newPlayers = [...activeGame.players];
    [newPlayers[index], newPlayers[index + 1]] = [newPlayers[index + 1], newPlayers[index]];
    
    const newCurrentPlayerIndex = newPlayers.findIndex(p => p.name === currentPlayerName);
    
    const updatedGame = {
      ...activeGame,
      players: newPlayers,
      currentPlayerIndex: newCurrentPlayerIndex
    };
    
    setActiveGame(updatedGame);
    setCurrentPlayerIndex(newCurrentPlayerIndex);
    localStorage.setItem('active-game', JSON.stringify(updatedGame));
  };

  const handleDragStart = (index) => {
    setDraggedPlayerIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedPlayerIndex === null || draggedPlayerIndex === dropIndex) return;
    
    const newPlayers = [...players];
    const draggedPlayer = newPlayers[draggedPlayerIndex];
    newPlayers.splice(draggedPlayerIndex, 1);
    newPlayers.splice(dropIndex, 0, draggedPlayer);
    
    setPlayers(newPlayers);
    setDraggedPlayerIndex(null);
  };

  const handleGamePlayerDragStart = (index) => {
    setDraggedGamePlayerIndex(index);
  };

  const handleGamePlayerDragOver = (e) => {
    e.preventDefault();
  };

  const handleGamePlayerDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedGamePlayerIndex === null || draggedGamePlayerIndex === dropIndex) return;
    
    const currentPlayerName = activeGame.players[currentPlayerIndex].name;
    const newPlayers = [...activeGame.players];
    const draggedPlayer = newPlayers[draggedGamePlayerIndex];
    newPlayers.splice(draggedGamePlayerIndex, 1);
    newPlayers.splice(dropIndex, 0, draggedPlayer);
    
    const newCurrentPlayerIndex = newPlayers.findIndex(p => p.name === currentPlayerName);
    
    const updatedGame = {
      ...activeGame,
      players: newPlayers,
      currentPlayerIndex: newCurrentPlayerIndex
    };
    
    setActiveGame(updatedGame);
    setCurrentPlayerIndex(newCurrentPlayerIndex);
    localStorage.setItem('active-game', JSON.stringify(updatedGame));
    setDraggedGamePlayerIndex(null);
  };

  const addSavedPlayerToGame = (savedPlayer) => {
    if (players.length >= 6) return alert(t('maxPlayersAlert'));
    if (players.some(p => p.name.toLowerCase() === savedPlayer.name.toLowerCase())) {
      return alert(t('playerAlreadyAddedAlert'));
    }
    const emptyIndex = players.findIndex(p => !p.name.trim());
    if (emptyIndex !== -1) {
      const newPlayers = [...players];
      newPlayers[emptyIndex] = { ...savedPlayer };
      setPlayers(newPlayers);
    } else {
      setPlayers([...players, { ...savedPlayer }]);
    }
  };

  const startNewGame = () => {
    const validPlayers = players.filter(p => p.name.trim() !== '');
    
    if (validPlayers.length < 2) {
      alert(t('minPlayersAlert'));
      return;
    }

    try {
      const newSavedPlayers = [...savedPlayers];
      validPlayers.forEach(player => {
        if (!newSavedPlayers.some(p => p.name.toLowerCase() === player.name.toLowerCase())) {
          newSavedPlayers.push({ ...player });
        }
      });
      if (newSavedPlayers.length > savedPlayers.length) {
        setSavedPlayers(newSavedPlayers);
        localStorage.setItem('saved-players', JSON.stringify(newSavedPlayers));
      }

      const extensions = {};
      validPlayers.forEach(p => extensions[p.name] = 0);
      
      const game = {
        id: Date.now(),
        name: gameName || `Game ${new Date().toLocaleDateString()}`,
        players: validPlayers,
        rounds: [],
        startTime: new Date().toISOString(),
        status: 'active',
        currentPlayerIndex: 0,
        timerDuration,
        maxExtensions,
        playerExtensions: extensions,
        ttsLanguage
      };
      
      setActiveGame(game);
      setCurrentPlayerIndex(0);
      setPlayerExtensions(extensions);
      setTimerActive(false);
      setTimerSeconds(timerDuration);
      localStorage.setItem('active-game', JSON.stringify(game));
      setCurrentRound(1);
      setRoundScores({});
      setView('activeGame');
      
      setTimeout(() => {
        playTurnNotification();
        speakPlayerName(validPlayers[0].name, ttsLanguage);
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

  const updateRoundScore = (player, score) => {
    setRoundScores({ ...roundScores, [player.name]: score });
  };

  const saveRound = () => {
    if (!activeGame.players.every(p => roundScores[p.name] !== undefined && roundScores[p.name] !== '')) {
      return alert(t('enterAllScoresAlert'));
    }
    
    // Stop and reset timer
    setTimerActive(false);
    setTimerSeconds(timerDuration);
    
    const updatedGame = {
      ...activeGame,
      rounds: [...activeGame.rounds, { round: currentRound, scores: { ...roundScores }, timestamp: new Date().toISOString() }]
    };
    setActiveGame(updatedGame);
    localStorage.setItem('active-game', JSON.stringify(updatedGame));
    setCurrentRound(currentRound + 1);
    setRoundScores({});
  };

  const calculateTotals = () => {
    const totals = {};
    activeGame.players.forEach(player => {
      totals[player.name] = activeGame.rounds.reduce((sum, round) => sum + (parseInt(round.scores[player.name]) || 0), 0);
    });
    return totals;
  };

  const endGame = () => {
    // Stop timer
    setTimerActive(false);
    setTimerSeconds(timerDuration);
    
    const totals = calculateTotals();
    const winner = Object.keys(totals).reduce((a, b) => totals[a] < totals[b] ? a : b);
    const completedGame = {
      ...activeGame,
      endTime: new Date().toISOString(),
      status: 'completed',
      winner,
      finalScores: totals
    };
    const updatedHistory = [completedGame, ...gameHistory];
    setGameHistory(updatedHistory);
    localStorage.setItem('game-history', JSON.stringify(updatedHistory));
    localStorage.removeItem('active-game');
    setActiveGame(null);
    setView('gameHistory');
  };

  const deleteGame = (gameId) => {
    const updatedHistory = gameHistory.filter(g => g.id !== gameId);
    setGameHistory(updatedHistory);
    localStorage.setItem('game-history', JSON.stringify(updatedHistory));
  };

  const deleteSavedPlayer = (playerName) => {
    const updatedPlayers = savedPlayers.filter(p => p.name !== playerName);
    setSavedPlayers(updatedPlayers);
    localStorage.setItem('saved-players', JSON.stringify(updatedPlayers));
  };

  const AnalogClock = ({ seconds, duration, isActive }) => {
    const percentage = seconds / duration;
    const angle = percentage * 360 - 90;
    const isLowTime = seconds <= 10;
    const isWarningTime = seconds <= 15 && seconds > 10;
    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - percentage);
    const handLength = 70;
    const handX = 100 + handLength * Math.cos((angle * Math.PI) / 180);
    const handY = 100 + handLength * Math.sin((angle * Math.PI) / 180);
    
    return (
      <div className="relative">
        <svg width="240" height="240" viewBox="0 0 200 200" className="mx-auto">
          <circle cx="100" cy="100" r="95" fill="white" stroke="#e5e7eb" strokeWidth="2" />
          {[...Array(12)].map((_, i) => {
            const tickAngle = (i * 30 - 90) * (Math.PI / 180);
            const x1 = 100 + 85 * Math.cos(tickAngle);
            const y1 = 100 + 85 * Math.sin(tickAngle);
            const x2 = 100 + 92 * Math.cos(tickAngle);
            const y2 = 100 + 92 * Math.sin(tickAngle);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#9ca3af" strokeWidth="2" />;
          })}
          <circle cx="100" cy="100" r={radius} fill="none"
            stroke={isLowTime ? '#ef4444' : isWarningTime ? '#f59e0b' : '#6366f1'}
            strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 100 100)"
            style={{ filter: isLowTime ? 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.5))' : 'none' }}
          />
          <circle cx="100" cy="100" r="8" fill="#1f2937" />
          <line x1="100" y1="100" x2={handX} y2={handY} stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
          <text x="100" y="140" textAnchor="middle"
            className={`font-mono font-bold ${isLowTime ? 'fill-red-600' : isWarningTime ? 'fill-yellow-600' : 'fill-gray-800'}`}
            style={{ fontSize: '20px' }}>
            {formatTime(seconds)}
          </text>
          {!isActive && <text x="100" y="160" textAnchor="middle" className="fill-yellow-600" style={{ fontSize: '12px' }}>{t('paused').toUpperCase()}</text>}
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-700">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {!(isFullscreen && view === 'activeGame') && (
          <div className="text-center mb-6 sm:mb-8 pt-4 sm:pt-6">
            <div className="flex items-center justify-center gap-2 sm:gap-4 mb-2 flex-wrap px-4">
              <h1 className="text-2xl sm:text-4xl font-bold text-indigo-900">{t('appTitle')}</h1>
              <div className="relative">
                <select
                  value={uiLanguage}
                  onChange={(e) => changeUiLanguage(e.target.value)}
                  className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-white rounded-lg shadow hover:bg-gray-50 transition cursor-pointer border border-gray-300 text-sm sm:text-base"
                  title={t('selectLanguage')}
                >
                  <option value="en">🇬🇧 English</option>
                  <option value="de">🇩🇪 Deutsch</option>
                  <option value="fr">🇫🇷 Français</option>
                </select>
              </div>
            </div>
            <p className="text-sm sm:text-base text-gray-600 px-4">{t('appSubtitle')}</p>
          </div>
        )}

        {view === 'home' && (
          <div className="space-y-4">
            {activeGame && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm opacity-90 mb-1">{t('gameInProgress')}</p>
                    <h3 className="text-xl sm:text-2xl font-bold mb-2 truncate">{activeGame.name}</h3>
                    <p className="text-xs sm:text-sm opacity-90">{t('round')} {activeGame.rounds.length + 1} • {activeGame.players.length} {t('players').toLowerCase()}</p>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentRound(activeGame.rounds.length + 1);
                      setView('activeGame');
                      setTimeout(() => {
                        playTurnNotification();
                        speakPlayerName(activeGame.players[currentPlayerIndex].name, activeGame.ttsLanguage || ttsLanguage);
                        setTimerActive(true);
                      }, 500);
                    }}
                    className="w-full sm:w-auto bg-white text-green-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-green-50 transition flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap"
                  >
                    <Play size={18} className="sm:hidden" />
                    <Play size={20} className="hidden sm:inline" />
                    {t('resumeGame')}
                  </button>
                </div>
              </div>
            )}
            
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('welcomeTitle')}</h2>
              <p className="text-gray-600 mb-6">{t('welcomeSubtitle')}</p>
              <div className="space-y-3">
                <button 
                  onClick={() => { 
                    if (activeGame) {
                      if (!window.confirm(t('endCurrentGameConfirm'))) {
                        return;
                      }
                    }
                    setView('newGame'); 
                    setPlayers([{ name: '', image: null }]); 
                    setGameName(''); 
                  }}
                  className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2">
                  <Plus size={20} /> {t('startNewGame')}
                </button>
                <button onClick={() => setView('managePlayers')}
                  className="w-full bg-purple-600 text-white py-4 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2">
                  <Trophy size={20} /> {t('managePlayers')}
                </button>
                <button onClick={() => setView('gameHistory')}
                  className="w-full bg-gray-200 text-gray-800 py-4 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center justify-center gap-2">
                  <History size={20} /> {t('viewGameHistory')}
                </button>
              </div>
            </div>
          </div>
        )}

        {view === 'newGame' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">{t('newGame')}</h2>
              <button onClick={() => setView('home')} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('gameNameOptional')}</label>
                <input type="text" value={gameName} onChange={(e) => setGameName(e.target.value)}
                  placeholder={t('gameNamePlaceholder')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('turnTimerDuration')}</label>
                <select value={timerDuration} onChange={(e) => setTimerDuration(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option value={30}>30 {t('seconds')}</option>
                  <option value={60}>1 {t('minute')}</option>
                  <option value={90}>1.5 {t('minutes')}</option>
                  <option value={120}>2 {t('minutes')}</option>
                  <option value={180}>3 {t('minutes')}</option>
                  <option value={300}>5 {t('minutes')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('timeExtensionsPerPlayer')}</label>
                <select value={maxExtensions} onChange={(e) => setMaxExtensions(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option value={0}>{t('none')}</option>
                  <option value={1}>1 {t('extension')}</option>
                  <option value={2}>2 {t('extensions')}</option>
                  <option value={3}>3 {t('extensions')}</option>
                  <option value={5}>5 {t('extensions')}</option>
                  <option value={10}>10 {t('extensions')}</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">{t('extensionNote')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('voiceAnnouncementLanguage')}</label>
                <select value={ttsLanguage} onChange={(e) => setTtsLanguage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option value="de-DE">🇩🇪 Deutsch</option>
                  <option value="en-US">🇺🇸 English (US)</option>
                  <option value="en-GB">🇬🇧 English (UK)</option>
                  <option value="fr-FR">🇫🇷 Français</option>
                  <option value="es-ES">🇪🇸 Español</option>
                  <option value="it-IT">🇮🇹 Italiano</option>
                  <option value="pt-PT">🇵🇹 Português</option>
                  <option value="nl-NL">🇳🇱 Nederlands</option>
                  <option value="pl-PL">🇵🇱 Polski</option>
                  <option value="ru-RU">🇷🇺 Русский</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">{t('voiceLanguageNote')}</p>
              </div>
              {savedPlayers.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('quickAddSavedPlayers')}</label>
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
                    {savedPlayers.map((sp, idx) => (
                      <button key={idx} onClick={() => addSavedPlayerToGame(sp)}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
                          {sp.image ? <img src={sp.image} alt={sp.name} className="w-full h-full object-cover" /> :
                            <span className="text-xs font-bold text-white">{sp.name.charAt(0).toUpperCase()}</span>}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{sp.name}</span>
                        <Plus size={16} className="text-gray-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('playersLabel')} <span className="text-xs text-gray-500">{t('playersNote')}</span>
                </label>
                <p className="text-xs text-gray-500 mb-3">{t('imageAutoResize')}</p>
                {players.map((player, index) => (
                  <div 
                    key={index} 
                    draggable 
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`flex gap-2 mb-3 transition ${
                      draggedPlayerIndex === index ? 'opacity-50' : ''
                    }`}
                  >
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(index, e.target.files[0])} className="hidden" />
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden border-2 border-gray-300 hover:border-indigo-500 transition">
                        {player.image ? <img src={player.image} alt="" className="w-full h-full object-cover" /> : <Plus size={20} className="text-white" />}
                      </div>
                    </label>
                    <input type="text" value={player.name} onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                      placeholder={`${t('playerPlaceholder')} ${index + 1}`}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={() => movePlayerUp(index)} 
                        disabled={index === 0}
                        className={`px-2 py-1 rounded ${index === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'}`}
                        title={t('moveUp')}
                      >
                        ▲
                      </button>
                      <button 
                        onClick={() => movePlayerDown(index)} 
                        disabled={index === players.length - 1}
                        className={`px-2 py-1 rounded ${index === players.length - 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'}`}
                        title={t('moveDown')}
                      >
                        ▼
                      </button>
                    </div>
                    {players.length > 1 && (
                      <button onClick={() => removePlayer(index)} className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
                {players.length < 6 && (
                  <button onClick={addPlayer} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition">
                    {t('addPlayer')}
                  </button>
                )}
              </div>
              <button onClick={startNewGame} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition mt-6">
                {t('startGame')}
              </button>
            </div>
          </div>
        )}

        {view === 'activeGame' && activeGame && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1 min-w-0 mr-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">{activeGame.name}</h2>
                  <p className="text-xs sm:text-sm text-gray-600">{t('round')} {currentRound}</p>
                </div>
                <button 
                  onClick={() => {
                    setTimerActive(false);
                    setView('home');
                  }} 
                  className="text-gray-500 hover:text-gray-700 flex-shrink-0">
                  <X size={20} className="sm:hidden" />
                  <X size={24} className="hidden sm:inline" />
                </button>
              </div>

              {activeGame.players[currentPlayerIndex] && (
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-3 sm:p-4 mb-4 text-white">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-lg flex-shrink-0">
                        {activeGame.players[currentPlayerIndex].image ? 
                          <img src={activeGame.players[currentPlayerIndex].image} alt="" className="w-full h-full object-cover" /> :
                          <span className="text-xl sm:text-2xl font-bold bg-gradient-to-br from-indigo-500 to-purple-600 text-white w-full h-full flex items-center justify-center">
                            {activeGame.players[currentPlayerIndex].name.charAt(0).toUpperCase()}
                          </span>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm opacity-90 mb-1">{t('currentTurn')}</p>
                        <p className="text-lg sm:text-2xl font-bold truncate">{activeGame.players[currentPlayerIndex].name}</p>
                      </div>
                    </div>
                    <button onClick={nextPlayer}
                      className="w-full sm:w-auto bg-white text-indigo-600 px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition hover:bg-indigo-50 font-semibold shadow text-sm sm:text-base whitespace-nowrap">
                      <SkipForward size={18} className="sm:hidden" />
                      <SkipForward size={20} className="hidden sm:inline" />
                      <span className="hidden sm:inline">{t('skipTurn')}</span>
                      <span className="sm:hidden">{t('nextPlayer')}</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 sm:p-6 shadow-inner">
                <div className="flex flex-col items-center">
                  <AnalogClock seconds={timerSeconds} duration={timerDuration} isActive={timerActive} />
                  <div className="flex gap-2 mt-4 flex-wrap justify-center">
                    {timerActive ? (
                      <button onClick={() => setTimerActive(false)}
                        className="px-4 sm:px-6 py-2 sm:py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition flex items-center gap-2 font-semibold shadow-lg text-sm sm:text-base">
                        <Pause size={18} className="sm:hidden" />
                        <Pause size={20} className="hidden sm:inline" />
                        {t('pause')}
                      </button>
                    ) : (
                      <button onClick={() => setTimerActive(true)}
                        className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 font-semibold shadow-lg text-sm sm:text-base">
                        <Play size={18} className="sm:hidden" />
                        <Play size={20} className="hidden sm:inline" />
                        {t('resume')}
                      </button>
                    )}
                    <button onClick={resetTimer}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2 font-semibold shadow-lg text-sm sm:text-base">
                      <RotateCcw size={18} className="sm:hidden" />
                      <RotateCcw size={20} className="hidden sm:inline" />
                      {t('reset')}
                    </button>
                  </div>
                  {activeGame.players[currentPlayerIndex] && (() => {
                    const cp = activeGame.players[currentPlayerIndex];
                    const used = playerExtensions[cp.name] || 0;
                    const max = activeGame.maxExtensions || 3;
                    const canExtend = used < max && max > 0;
                    return (
                      <div className="mt-4 w-full">
                        <button onClick={extendTimer} disabled={!canExtend}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-sm sm:text-base ${
                            canExtend ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}>
                          <Plus size={18} className="sm:hidden flex-shrink-0" />
                          <Plus size={20} className="hidden sm:inline flex-shrink-0" />
                          <span className="truncate">{t('addSeconds')} ({max - used} {t('left')})</span>
                        </button>
                      </div>
                    );
                  })()}
                  <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
                    <label className="text-xs sm:text-sm text-gray-700 font-medium">{t('duration')}</label>
                    <select value={timerDuration} onChange={(e) => updateTimerDuration(Number(e.target.value))}
                      className="text-xs sm:text-sm px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white">
                      <option value={30}>30 {t('seconds')}</option>
                      <option value={60}>1 {t('minute')}</option>
                      <option value={90}>1.5 {t('minutes')}</option>
                      <option value={120}>2 {t('minutes')}</option>
                      <option value={180}>3 {t('minutes')}</option>
                      <option value={300}>5 {t('minutes')}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeGame.players.map((player, idx) => (
                  <div 
                    key={idx}
                    draggable
                    onDragStart={() => handleGamePlayerDragStart(idx)}
                    onDragOver={handleGamePlayerDragOver}
                    onDrop={(e) => handleGamePlayerDrop(e, idx)}
                    className={`p-2 sm:p-3 rounded-lg border-2 transition relative ${
                      idx === currentPlayerIndex ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-gray-50'
                    } ${draggedGamePlayerIndex === idx ? 'opacity-50' : ''}`}
                  >
                    <div className="absolute top-1 right-1 flex gap-1">
                      <button 
                        onClick={() => moveGamePlayerUp(idx)} 
                        disabled={idx === 0}
                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded text-xs ${idx === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}
                        title={t('moveUp')}
                      >
                        ▲
                      </button>
                      <button 
                        onClick={() => moveGamePlayerDown(idx)} 
                        disabled={idx === activeGame.players.length - 1}
                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded text-xs ${idx === activeGame.players.length - 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}
                        title={t('moveDown')}
                      >
                        ▼
                      </button>
                    </div>
                    <div className="flex items-center gap-2 pr-12 sm:pr-14">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {player.image ? <img src={player.image} alt="" className="w-full h-full object-cover" /> :
                          <span className="text-xs sm:text-sm font-bold text-white">{player.name.charAt(0).toUpperCase()}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs sm:text-sm font-semibold truncate ${idx === currentPlayerIndex ? 'text-indigo-900' : 'text-gray-700'}`}>
                          {player.name}
                        </p>
                        {activeGame.rounds.length > 0 && (
                          <p className="text-xs text-gray-600">
                            {t('score')} {activeGame.rounds.reduce((s, r) => s + (parseInt(r.scores[player.name]) || 0), 0)}
                          </p>
                        )}
                        {activeGame.maxExtensions > 0 && (
                          <p className="text-xs text-blue-600">{playerExtensions[player.name] || 0}/{activeGame.maxExtensions}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">{t('enterRoundScores', { round: currentRound })}</h3>
              <div className="space-y-3">
                {activeGame.players.map((player, idx) => (
                  <div key={idx} className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {player.image ? <img src={player.image} alt="" className="w-full h-full object-cover" /> :
                        <span className="text-xs sm:text-sm font-bold text-white">{player.name.charAt(0).toUpperCase()}</span>}
                    </div>
                    <label className="flex-1 text-sm sm:text-base text-gray-700 font-medium truncate">{player.name}</label>
                    <input type="number" value={roundScores[player.name] || ''} onChange={(e) => updateRoundScore(player, e.target.value)}
                      placeholder="0" className="w-16 sm:w-24 px-2 sm:px-4 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base" />
                  </div>
                ))}
              </div>
              <button onClick={saveRound}
                className="w-full bg-indigo-600 text-white py-2 sm:py-3 rounded-lg font-semibold hover:bg-indigo-700 transition mt-4 flex items-center justify-center gap-2 text-sm sm:text-base">
                <Check size={18} className="sm:hidden" />
                <Check size={20} className="hidden sm:inline" />
                {t('saveRound')}
              </button>
            </div>

            {activeGame.rounds.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">{t('scoreSummary')}</h3>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-2 px-1 sm:px-2 text-xs sm:text-sm font-semibold text-gray-700 sticky left-0 bg-white">{t('round')}</th>
                          {activeGame.players.map((p, idx) => (
                            <th key={idx} className="text-center py-2 px-1 sm:px-2 text-xs sm:text-sm font-semibold text-gray-700">
                              <div className="flex flex-col items-center gap-1">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
                                  {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> :
                                    <span className="text-xs font-bold text-white">{p.name.charAt(0).toUpperCase()}</span>}
                                </div>
                                <span className="text-xs truncate max-w-[60px] sm:max-w-none">{p.name}</span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {activeGame.rounds.map((round, idx) => (
                          <tr key={idx} className="border-b border-gray-100">
                            <td className="py-2 px-1 sm:px-2 text-xs sm:text-sm text-gray-600 sticky left-0 bg-white">{round.round}</td>
                            {activeGame.players.map((p, pIdx) => (
                              <td key={pIdx} className="text-center py-2 px-1 sm:px-2 text-xs sm:text-sm">{round.scores[p.name] || 0}</td>
                            ))}
                          </tr>
                        ))}
                        <tr className="bg-indigo-50 font-bold">
                          <td className="py-2 px-1 sm:px-2 text-xs sm:text-sm sticky left-0 bg-indigo-50">{t('total')}</td>
                          {activeGame.players.map((p, pIdx) => (
                            <td key={pIdx} className="text-center py-2 px-1 sm:px-2 text-xs sm:text-sm text-indigo-900">
                              {activeGame.rounds.reduce((s, r) => s + (parseInt(r.scores[p.name]) || 0), 0)}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <button onClick={endGame} className="w-full bg-green-600 text-white py-2 sm:py-3 rounded-lg font-semibold hover:bg-green-700 transition mt-4 text-sm sm:text-base">
                  {t('endGame')}
                </button>
              </div>
            )}
          </div>
        )}

        {view === 'managePlayers' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">{t('managePlayersTitle')}</h2>
              <button onClick={() => setView('home')} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>
            {savedPlayers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Trophy size={48} className="mx-auto mb-4 opacity-50" />
                <p className="mb-4">{t('noSavedPlayers')}</p>
                <p className="text-sm">{t('noSavedPlayersNote')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-4">{savedPlayers.length} {savedPlayers.length === 1 ? t('savedPlayer') : t('savedPlayers')}</p>
                {savedPlayers.map((player, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
                          {player.image ? <img src={player.image} alt={player.name} className="w-full h-full object-cover" /> :
                            <span className="text-lg font-bold text-white">{player.name.charAt(0).toUpperCase()}</span>}
                        </div>
                        <p className="font-semibold text-gray-800">{player.name}</p>
                      </div>
                      <button onClick={() => deleteSavedPlayer(player.name)} className="text-red-500 hover:text-red-700 p-2">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">{t('managePlayersTip')}</p>
            </div>
          </div>
        )}

        {view === 'gameHistory' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">{t('gameHistory')}</h2>
              <button onClick={() => setView('home')} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>
            {gameHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <History size={48} className="mx-auto mb-4 opacity-50" />
                <p>{t('noGamesPlayed')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {gameHistory.map(game => (
                  <div key={game.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{game.name}</h3>
                        <p className="text-sm text-gray-600">{new Date(game.startTime).toLocaleDateString()} • {game.rounds.length} {t('rounds')}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Trophy size={16} className="text-yellow-600" />
                          <span className="text-sm font-semibold text-gray-700">{t('winner')} {game.winner}</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-600">
                          {Object.entries(game.finalScores).map(([player, score]) => (
                            <span key={player} className="mr-3">{player}: {score}</span>
                          ))}
                        </div>
                      </div>
                      <button onClick={() => deleteGame(game.id)} className="text-red-500 hover:text-red-700 p-2">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <button onClick={toggleFullscreen}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-110 z-40"
        title={isFullscreen ? t('exitFullscreen') : t('enterFullscreen')}>
        {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
      </button>
    </div>
  );
};

export default RummikubTracker;