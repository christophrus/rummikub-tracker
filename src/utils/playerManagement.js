/**
 * Player manipulation utilities
 */

export const movePlayerUp = (players, index) => {
  if (index === 0) return players;
  const newPlayers = [...players];
  [newPlayers[index - 1], newPlayers[index]] = [newPlayers[index], newPlayers[index - 1]];
  return newPlayers;
};

export const movePlayerDown = (players, index) => {
  if (index === players.length - 1) return players;
  const newPlayers = [...players];
  [newPlayers[index], newPlayers[index + 1]] = [newPlayers[index + 1], newPlayers[index]];
  return newPlayers;
};

export const reorderPlayers = (players, draggedIndex, dropIndex) => {
  if (draggedIndex === null || draggedIndex === dropIndex) return players;
  
  const newPlayers = [...players];
  const draggedPlayer = newPlayers[draggedIndex];
  newPlayers.splice(draggedIndex, 1);
  newPlayers.splice(dropIndex, 0, draggedPlayer);
  
  return newPlayers;
};

export const updatePlayer = (players, index, field, value) => {
  const newPlayers = [...players];
  newPlayers[index][field] = value;
  return newPlayers;
};

export const addPlayer = (players, maxPlayers = 6) => {
  if (players.length < maxPlayers) {
    return [...players, { name: '', image: null }];
  }
  return players;
};

export const removePlayer = (players, index) => {
  if (players.length > 1) {
    return players.filter((_, i) => i !== index);
  }
  return players;
};
