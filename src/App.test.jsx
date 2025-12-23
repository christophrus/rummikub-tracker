import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// Mock all the hooks
vi.mock('./hooks', () => ({
  useGameData: () => ({
    activeGame: null,
    gameHistory: [],
    savedPlayers: [],
    loading: false,
    startNewGame: vi.fn(),
    deleteGame: vi.fn(),
    deleteSavedPlayer: vi.fn(),
    addSavedPlayerToGame: vi.fn(),
    cancelActiveGame: vi.fn(),
    endGame: vi.fn(),
    updateRoundScore: vi.fn(),
    saveRound: vi.fn(),
    setPlayerExtensions: vi.fn(),
    setCurrentPlayerIndex: vi.fn(),
    setActiveGame: vi.fn()
  }),
  useTimer: () => ({
    seconds: 60,
    isActive: false,
    toggle: vi.fn(),
    reset: vi.fn(),
    setSeconds: vi.fn(),
    setIsActive: vi.fn()
  }),
  useAudio: () => ({
    playTickTock: vi.fn(),
    playTurnNotification: vi.fn(),
    speakPlayerName: vi.fn(),
    playVictorySound: vi.fn()
  }),
  useLocalization: () => ({
    t: (key) => key,
    uiLanguage: 'en',
    changeUiLanguage: vi.fn()
  }),
  useTheme: () => ({
    theme: 'light',
    toggleTheme: vi.fn()
  }),
  ThemeProvider: ({ children }) => <div>{children}</div>,
  useGameFlow: () => ({
    handleStartGame: vi.fn(() => ({ success: true, showPlayerSelection: true })),
    handlePlayerSelected: vi.fn(),
    handleDeclareWinner: vi.fn(),
    handleCancelWinner: vi.fn(),
    handleSaveRound: vi.fn(),
    pendingGame: null,
    declaredWinner: null
  }),
  useTimerControl: () => ({
    nextPlayer: vi.fn(),
    extendTimer: vi.fn(),
    updateTimerDuration: vi.fn(),
    resetTimer: vi.fn(),
    pauseTimer: vi.fn(),
    resumeTimer: vi.fn()
  }),
  usePlayerManagement: () => ({
    players: [],
    addPlayer: vi.fn(),
    removePlayer: vi.fn(),
    updatePlayer: vi.fn(),
    movePlayerUp: vi.fn(),
    movePlayerDown: vi.fn(),
    handleImageUploadWrapper: vi.fn(),
    handleDragStart: vi.fn(),
    handleDragOver: vi.fn(),
    handleDrop: vi.fn(),
    resetPlayers: vi.fn()
  }),
  useGamePlayerManagement: () => ({
    draggedGamePlayerIndex: null,
    moveGamePlayerUp: vi.fn(),
    moveGamePlayerDown: vi.fn(),
    handleGameDragStart: vi.fn(),
    handleGameDragOver: vi.fn(),
    handleGameDrop: vi.fn()
  })
}));

// Mock child components to simplify testing App navigation
vi.mock('./components/views', () => ({
  HomeView: ({ onNewGame, onViewHistory, onManagePlayers, onSettings }) => (
    <div data-testid="home-view">
      <button onClick={onNewGame}>New Game</button>
      <button onClick={onViewHistory}>History</button>
      <button onClick={onManagePlayers}>Manage Players</button>
      <button onClick={onSettings}>Settings</button>
    </div>
  ),
  NewGameView: ({ onClose }) => (
    <div data-testid="new-game-view">
      <button onClick={onClose}>Back</button>
    </div>
  ),
  ActiveGameView: () => <div data-testid="active-game-view" />,
  GameHistoryView: ({ onClose }) => (
    <div data-testid="history-view">
      <button onClick={onClose}>Close</button>
    </div>
  ),
  ManagePlayersView: ({ onClose }) => (
    <div data-testid="manage-players-view">
      <button onClick={onClose}>Close</button>
    </div>
  ),
  SettingsView: ({ onClose }) => (
    <div data-testid="settings-view">
      <button onClick={onClose}>Close</button>
    </div>
  )
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders home view by default', () => {
    render(<App />);
    expect(screen.getByTestId('home-view')).toBeInTheDocument();
  });

  it('navigates to new game view', () => {
    render(<App />);
    fireEvent.click(screen.getByText('New Game'));
    expect(screen.getByTestId('new-game-view')).toBeInTheDocument();
  });

  it('navigates back from new game view', () => {
    render(<App />);
    fireEvent.click(screen.getByText('New Game'));
    fireEvent.click(screen.getByText('Back'));
    expect(screen.getByTestId('home-view')).toBeInTheDocument();
  });

  it('navigates to history view', () => {
    render(<App />);
    fireEvent.click(screen.getByText('History'));
    expect(screen.getByTestId('history-view')).toBeInTheDocument();
  });

  it('navigates to manage players view', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Manage Players'));
    expect(screen.getByTestId('manage-players-view')).toBeInTheDocument();
  });

  it('navigates to settings view', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Settings'));
    expect(screen.getByTestId('settings-view')).toBeInTheDocument();
  });
});
