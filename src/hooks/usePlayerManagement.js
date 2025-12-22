import { useState, useCallback } from 'react';
import { STORAGE_KEYS } from '../constants';
import {
  movePlayerUp as movePlayerUpUtil,
  movePlayerDown as movePlayerDownUtil,
  reorderPlayers as reorderPlayersUtil,
  updatePlayer as updatePlayerUtil,
  addPlayer as addPlayerUtil,
  removePlayer as removePlayerUtil,
  handleImageUpload,
  sanitizeGameForStorage
} from '../utils';

export const usePlayerManagement = (maxPlayers) => {
  const [players, setPlayers] = useState([{ name: '', image: null }]);
  const [draggedPlayerIndex, setDraggedPlayerIndex] = useState(null);

  const addPlayer = useCallback(() => {
    setPlayers(prev => addPlayerUtil(prev, maxPlayers));
  }, [maxPlayers]);

  const removePlayer = useCallback((index) => {
    setPlayers(prev => removePlayerUtil(prev, index));
  }, []);

  const updatePlayer = useCallback((index, field, value) => {
    setPlayers(prev => updatePlayerUtil(prev, index, field, value));
  }, []);

  const movePlayerUp = useCallback((index) => {
    setPlayers(prev => movePlayerUpUtil(prev, index));
  }, []);

  const movePlayerDown = useCallback((index) => {
    setPlayers(prev => movePlayerDownUtil(prev, index));
  }, []);

  const handleImageUploadWrapper = useCallback((index, file) => {
    handleImageUpload(file, (resizedImage) => {
      updatePlayer(index, 'image', resizedImage);
    });
  }, [updatePlayer]);

  const handleDragStart = useCallback((index) => {
    setDraggedPlayerIndex(index);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e, index) => {
    e.preventDefault();
    if (draggedPlayerIndex !== null && draggedPlayerIndex !== index) {
      const newPlayers = reorderPlayersUtil(players, draggedPlayerIndex, index);
      setPlayers(newPlayers);
    }
    setDraggedPlayerIndex(null);
  }, [draggedPlayerIndex, players]);

  const resetPlayers = useCallback(() => {
    setPlayers([{ name: '', image: null }]);
  }, []);

  return {
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
  };
};

export const useGamePlayerManagement = ({
  activeGame,
  setActiveGame,
  currentPlayerIndex,
  setCurrentPlayerIndex
}) => {
  const [draggedGamePlayerIndex, setDraggedGamePlayerIndex] = useState(null);

  const handleGamePlayerReorder = useCallback((dragIndex, dropIndex) => {
    if (!activeGame) return;
    const currentPlayerName = activeGame.players[currentPlayerIndex].name;
    const newPlayers = reorderPlayersUtil(activeGame.players, dragIndex, dropIndex);
    const newCurrentPlayerIndex = newPlayers.findIndex(p => p.name === currentPlayerName);
    
    const updatedGame = {
      ...activeGame,
      players: newPlayers,
      currentPlayerIndex: newCurrentPlayerIndex
    };
    
    setActiveGame(updatedGame);
    setCurrentPlayerIndex(newCurrentPlayerIndex);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_GAME, JSON.stringify(sanitizeGameForStorage(updatedGame)));
  }, [activeGame, currentPlayerIndex, setActiveGame, setCurrentPlayerIndex]);

  const moveGamePlayerUp = useCallback((index) => {
    if (index === 0) return;
    handleGamePlayerReorder(index, index - 1);
  }, [handleGamePlayerReorder]);

  const moveGamePlayerDown = useCallback((index) => {
    if (!activeGame || index === activeGame.players.length - 1) return;
    handleGamePlayerReorder(index, index + 1);
  }, [activeGame, handleGamePlayerReorder]);

  const handleGameDragStart = useCallback((index) => {
    setDraggedGamePlayerIndex(index);
  }, []);

  const handleGameDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleGameDrop = useCallback((e, index) => {
    e.preventDefault();
    if (draggedGamePlayerIndex !== null && draggedGamePlayerIndex !== index) {
      handleGamePlayerReorder(draggedGamePlayerIndex, index);
    }
    setDraggedGamePlayerIndex(null);
  }, [draggedGamePlayerIndex, handleGamePlayerReorder]);

  return {
    draggedGamePlayerIndex,
    moveGamePlayerUp,
    moveGamePlayerDown,
    handleGameDragStart,
    handleGameDragOver,
    handleGameDrop
  };
};
