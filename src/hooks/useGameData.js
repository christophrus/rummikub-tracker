import { useState, useEffect } from 'react';
import { sanitizeGameForStorage } from '../utils';

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
      const savedPlayersData = localStorage.getItem('saved-players');
      const savedPlayersList = savedPlayersData ? JSON.parse(savedPlayersData) : [];
      if (savedPlayersData) setSavedPlayers(savedPlayersList);

      const imageByName = new Map(
        (savedPlayersList || [])
          .filter(p => p && typeof p === 'object' && typeof p.name === 'string')
          .map(p => [p.name.toLowerCase(), p.image || null])
      );

      const hydratePlayers = (players) => {
        if (!Array.isArray(players)) return players;
        return players
          .map((p) => {
            const name = typeof p === 'string' ? p : p?.name;
            if (!name) return null;
            return {
              name,
              image: imageByName.get(String(name).toLowerCase()) || null
            };
          })
          .filter(Boolean);
      };

      const historyData = localStorage.getItem('game-history');
      if (historyData) {
        const parsedHistory = JSON.parse(historyData);
        if (Array.isArray(parsedHistory)) {
          const hydratedHistory = parsedHistory.map(g => ({ ...g, players: hydratePlayers(g.players) }));
          setGameHistory(hydratedHistory);

          // Cleanup legacy data: remove any embedded images from stored history.
          const needsCleanup = parsedHistory.some(g =>
            Array.isArray(g?.players) && g.players.some(p => p && typeof p === 'object' && p.image)
          );
          if (needsCleanup) {
            localStorage.setItem('game-history', JSON.stringify(parsedHistory.map(sanitizeGameForStorage)));
          }
        }
      }
      
      const activeGameData = localStorage.getItem('active-game');
      if (activeGameData) {
        const game = JSON.parse(activeGameData);
        const activeGameHadEmbeddedImages =
          Array.isArray(game?.players) && game.players.some(p => p && typeof p === 'object' && p.image);
        if (game.players) {
          game.players = hydratePlayers(game.players);
        }
        if (!game.playerExtensions) {
          game.playerExtensions = {};
          game.players.forEach(p => game.playerExtensions[p.name] = 0);
        }
        setActiveGame(game);
        setCurrentPlayerIndex(game.currentPlayerIndex || 0);
        setCurrentRound(game.rounds.length + 1);
        setPlayerExtensions(game.playerExtensions || {});

        // Cleanup legacy data: remove any embedded images from stored active game.
        if (activeGameHadEmbeddedImages) {
          localStorage.setItem('active-game', JSON.stringify(sanitizeGameForStorage(game)));
        }
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
    localStorage.setItem('active-game', JSON.stringify(sanitizeGameForStorage(updatedGame)));
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
    const updatedHistory = [
      completedGame,
      ...gameHistory
    ];
    setGameHistory(updatedHistory);
    localStorage.setItem('game-history', JSON.stringify(updatedHistory.map(sanitizeGameForStorage)));
    localStorage.removeItem('active-game');
    setActiveGame(null);
    return completedGame;
  };

  const cancelActiveGame = () => {
    localStorage.removeItem('active-game');
    setActiveGame(null);
    setCurrentPlayerIndex(0);
    setCurrentRound(1);
    setRoundScores({});
    setPlayerExtensions({});
  };

  const deleteGame = (gameId) => {
    const updatedHistory = gameHistory.filter(g => g.id !== gameId);
    setGameHistory(updatedHistory);
    localStorage.setItem('game-history', JSON.stringify(updatedHistory.map(sanitizeGameForStorage)));
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
      
      const GAME_NUMBER_KEY = 'game-number-seq';
      const baseDefaultName = `Game ${new Date().toLocaleDateString()}`;
      const existingNames = new Set(
        [activeGame, ...gameHistory]
          .filter(Boolean)
          .map(g => String(g.name || '').toLowerCase())
      );

      let resolvedName = (gameName || '').trim();
      if (!resolvedName) {
        // Ensure a unique default name by adding an incrementing suffix (#1, #2, ...).
        // Persisted so it increments across reloads.
        let seq = Number.parseInt(localStorage.getItem(GAME_NUMBER_KEY) || '0', 10);
        if (!Number.isFinite(seq) || seq < 0) seq = 0;

        // Avoid collisions if localStorage was cleared but history remains.
        // Keep incrementing until we find a free name.
        for (let attempt = 0; attempt < 1000; attempt += 1) {
          const candidateSeq = seq + 1;
          const candidate = `${baseDefaultName} #${candidateSeq}`;
          if (!existingNames.has(candidate.toLowerCase())) {
            resolvedName = candidate;
            localStorage.setItem(GAME_NUMBER_KEY, String(candidateSeq));
            break;
          }
          seq = candidateSeq;
        }

        // Fallback: still guarantee a name.
        if (!resolvedName) {
          resolvedName = `${baseDefaultName} #${String(Date.now())}`;
        }
      }

      const game = {
        id: Date.now(),
        name: resolvedName,
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
      localStorage.setItem('active-game', JSON.stringify(sanitizeGameForStorage(game)));
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
    cancelActiveGame,
    deleteGame,
    deleteSavedPlayer,
    addSavedPlayerToGame,
    startNewGame,
    loadData
  };
};
