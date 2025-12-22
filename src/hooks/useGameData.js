import { useState, useEffect } from 'react';

export const useGameData = () => {
  const [activeGame, setActiveGame] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [savedPlayers, setSavedPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [roundScores, setRoundScores] = useState({});
  const [playerExtensions, setPlayerExtensions] = useState({});
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    try {
      const historyData = localStorage.getItem('game-history');
      if (historyData) setGameHistory(JSON.parse(historyData));
      
      const savedPlayersData = localStorage.getItem('saved-players');
      if (savedPlayersData) setSavedPlayers(JSON.parse(savedPlayersData));
      
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
        setPlayerExtensions(game.playerExtensions || {});
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateRoundScore = (player, score) => {
    setRoundScores({ ...roundScores, [player.name]: score });
  };

  const saveRound = () => {
    if (!activeGame.players.every(p => roundScores[p.name] !== undefined && roundScores[p.name] !== '')) {
      return null; // Caller should handle validation
    }

    const zeroScoresCount = activeGame.players.reduce((count, player) => {
      const raw = roundScores[player.name];
      const score = raw === '' || raw === undefined ? NaN : Number.parseInt(raw, 10);
      return count + (Number.isFinite(score) && score === 0 ? 1 : 0);
    }, 0);

    if (zeroScoresCount > 1) {
      return null; // Caller should handle validation
    }
    
    const updatedGame = {
      ...activeGame,
      rounds: [...activeGame.rounds, { round: currentRound, scores: { ...roundScores }, timestamp: new Date().toISOString() }]
    };
    setActiveGame(updatedGame);
    localStorage.setItem('active-game', JSON.stringify(updatedGame));
    setCurrentRound(currentRound + 1);
    setRoundScores({});
    return updatedGame;
  };

  const calculateTotals = () => {
    if (!activeGame) return {};
    const totals = {};
    activeGame.players.forEach(player => {
      totals[player.name] = activeGame.rounds.reduce((sum, round) => sum + (parseInt(round.scores[player.name]) || 0), 0);
    });
    return totals;
  };

  const endGame = () => {
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
    return completedGame;
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

  const addSavedPlayerToGame = (players, savedPlayer) => {
    const emptyIndex = players.findIndex(p => !p.name.trim());
    if (emptyIndex !== -1) {
      const newPlayers = [...players];
      newPlayers[emptyIndex] = { ...savedPlayer };
      return newPlayers;
    } else {
      return [...players, { ...savedPlayer }];
    }
  };

  const startNewGame = (validPlayers, gameName, timerDuration, maxExtensions, ttsLanguage) => {
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
        originalTimerDuration: timerDuration,
        maxExtensions,
        playerExtensions: extensions,
        ttsLanguage
      };
      
      setActiveGame(game);
      setCurrentPlayerIndex(0);
      setPlayerExtensions(extensions);
      setCurrentRound(1);
      setRoundScores({});
      localStorage.setItem('active-game', JSON.stringify(game));
      return game;
    } catch (error) {
      console.error('Error starting game:', error);
      throw error;
    }
  };

  return {
    activeGame,
    setActiveGame,
    gameHistory,
    savedPlayers,
    setSavedPlayers,
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
    startNewGame,
    loadData
  };
};
