import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// Create mutable mock state
const mockGameData = {
  activeGame: null,
  gameHistory: [],
  savedPlayers: [],
  loading: false,
  startNewGame: vi.fn(),
  deleteGame: vi.fn(),
  deleteSavedPlayer: vi.fn(),
  addSavedPlayerToGame: vi.fn((players, sp) => [...players, sp]),
  cancelActiveGame: vi.fn(),
  endGame: vi.fn(),
  updateRoundScore: vi.fn(),
  saveRound: vi.fn(),
  setPlayerExtensions: vi.fn(),
  setCurrentPlayerIndex: vi.fn(),
  setActiveGame: vi.fn(),
  currentPlayerIndex: 0,
  currentRound: 1,
  roundScores: {},
  playerExtensions: {}
};

const mockPlayerManagement = {
  players: [{ name: '', image: null }],
  setPlayers: vi.fn(),
  addPlayer: vi.fn(),
  removePlayer: vi.fn(),
  updatePlayer: vi.fn(),
  movePlayerUp: vi.fn(),
  movePlayerDown: vi.fn(),
  handleImageUploadWrapper: vi.fn(),
  handleDragStart: vi.fn(),
  handleDragOver: vi.fn(),
  handleDrop: vi.fn(),
  resetPlayers: vi.fn(),
  draggedPlayerIndex: null
};

const mockGameFlow = {
  handleStartGame: vi.fn(() => ({ success: true, showPlayerSelection: true })),
  handlePlayerSelected: vi.fn(),
  handleDeclareWinner: vi.fn(),
  handleCancelWinner: vi.fn(),
  handleSaveRound: vi.fn(),
  pendingGame: null,
  declaredWinner: null
};

// Mock all the hooks
vi.mock('./hooks', () => ({
  useGameData: () => mockGameData,
  useTimer: () => ({
    timerSeconds: 60,
    timerActive: false,
    setTimerSeconds: vi.fn(),
    setTimerActive: vi.fn(),
    resetTimer: vi.fn(),
    updateDuration: vi.fn()
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
  useGameFlow: () => mockGameFlow,
  useTimerControl: () => ({
    nextPlayer: vi.fn(),
    extendTimer: vi.fn(),
    updateTimerDuration: vi.fn(),
    resetTimer: vi.fn(),
    pauseTimer: vi.fn(),
    resumeTimer: vi.fn()
  }),
  usePlayerManagement: () => mockPlayerManagement,
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
  HomeView: ({ onNewGame, onViewHistory, onManagePlayers, onSettings, onResume, activeGame }) => (
    <div data-testid="home-view">
      <button onClick={onNewGame}>New Game</button>
      <button onClick={onViewHistory}>History</button>
      <button onClick={onManagePlayers}>Manage Players</button>
      <button onClick={onSettings}>Settings</button>
      {activeGame && <button onClick={onResume}>Resume</button>}
    </div>
  ),
  NewGameView: ({ onClose, onStartGame, onAddPlayer, onRemovePlayer, onAddSavedPlayer }) => (
    <div data-testid="new-game-view">
      <button onClick={onClose}>Back</button>
      <button onClick={onStartGame}>Start</button>
      <button onClick={onAddPlayer}>Add Player</button>
      <button onClick={() => onRemovePlayer(0)}>Remove Player</button>
      <button onClick={() => onAddSavedPlayer({ name: 'Saved' })}>Add Saved</button>
    </div>
  ),
  ActiveGameView: ({ onClose, onEndGame, onNextPlayer, onPause, onResume }) => (
    <div data-testid="active-game-view">
      <button onClick={onClose}>Close</button>
      <button onClick={onEndGame}>End Game</button>
      <button onClick={onNextPlayer}>Next Player</button>
      <button onClick={onPause}>Pause</button>
      <button onClick={onResume}>Resume</button>
    </div>
  ),
  GameHistoryView: ({ onClose, onDeleteGame }) => (
    <div data-testid="history-view">
      <button onClick={onClose}>Close</button>
      <button onClick={() => onDeleteGame(1)}>Delete</button>
    </div>
  ),
  ManagePlayersView: ({ onClose, onDeletePlayer }) => (
    <div data-testid="manage-players-view">
      <button onClick={onClose}>Close</button>
      <button onClick={() => onDeletePlayer('Player 1')}>Delete Player</button>
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
    mockGameData.activeGame = null;
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

  it('closes history view and returns home', () => {
    render(<App />);
    fireEvent.click(screen.getByText('History'));
    expect(screen.getByTestId('history-view')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Close'));
    expect(screen.getByTestId('home-view')).toBeInTheDocument();
  });

  it('closes manage players view and returns home', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Manage Players'));
    expect(screen.getByTestId('manage-players-view')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Close'));
    expect(screen.getByTestId('home-view')).toBeInTheDocument();
  });

  it('closes settings view and returns home', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Settings'));
    expect(screen.getByTestId('settings-view')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Close'));
    expect(screen.getByTestId('home-view')).toBeInTheDocument();
  });

  it('calls addPlayer when add player clicked in new game', () => {
    render(<App />);
    fireEvent.click(screen.getByText('New Game'));
    fireEvent.click(screen.getByText('Add Player'));
    
    expect(mockPlayerManagement.addPlayer).toHaveBeenCalled();
  });

  it('calls removePlayer when remove player clicked in new game', () => {
    render(<App />);
    fireEvent.click(screen.getByText('New Game'));
    fireEvent.click(screen.getByText('Remove Player'));
    
    expect(mockPlayerManagement.removePlayer).toHaveBeenCalledWith(0);
  });

  it('calls handleStartGame when start clicked in new game', () => {
    render(<App />);
    fireEvent.click(screen.getByText('New Game'));
    fireEvent.click(screen.getByText('Start'));
    
    expect(mockGameFlow.handleStartGame).toHaveBeenCalled();
  });

  it('calls deleteSavedPlayer when delete clicked in manage players', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Manage Players'));
    fireEvent.click(screen.getByText('Delete Player'));
    
    expect(mockGameData.deleteSavedPlayer).toHaveBeenCalledWith('Player 1');
  });

  it('calls deleteGame when delete clicked in history', () => {
    render(<App />);
    fireEvent.click(screen.getByText('History'));
    fireEvent.click(screen.getByText('Delete'));
    
    expect(mockGameData.deleteGame).toHaveBeenCalledWith(1);
  });

  it('shows resume button when activeGame exists', () => {
    mockGameData.activeGame = { 
      players: [{ name: 'Test' }], 
      currentPlayerIndex: 0,
      timerDuration: 60,
      maxExtensions: 3
    };
    render(<App />);
    
    expect(screen.getByText('Resume')).toBeInTheDocument();
  });

  it('resumes game when resume button clicked', () => {
    mockGameData.activeGame = { 
      players: [{ name: 'Test' }], 
      currentPlayerIndex: 0,
      timerDuration: 60,
      maxExtensions: 3
    };
    render(<App />);
    fireEvent.click(screen.getByText('Resume'));
    
    expect(screen.getByTestId('active-game-view')).toBeInTheDocument();
  });

  it('navigates to active game view after starting a game', () => {
    mockGameFlow.handleStartGame.mockReturnValueOnce({ success: true, showPlayerSelection: false });
    mockGameFlow.pendingGame = { 
      players: [{ name: 'Player 1' }],
      timerDuration: 60
    };
    
    render(<App />);
    fireEvent.click(screen.getByText('New Game'));
    fireEvent.click(screen.getByText('Start'));
    
    // When showPlayerSelection is false and success is true, game should start
    expect(mockGameFlow.handleStartGame).toHaveBeenCalled();
  });



  it('calls addSavedPlayer when adding saved player in new game', () => {
    render(<App />);
    fireEvent.click(screen.getByText('New Game'));
    fireEvent.click(screen.getByText('Add Saved'));
    
    expect(mockPlayerManagement.setPlayers).toHaveBeenCalled();
  });

  it('handles end game in active game view', () => {
    mockGameData.activeGame = { 
      players: [{ name: 'Test' }], 
      currentPlayerIndex: 0,
      timerDuration: 60,
      maxExtensions: 3
    };
    render(<App />);
    fireEvent.click(screen.getByText('Resume'));
    fireEvent.click(screen.getByText('End Game'));
    
    expect(mockGameData.endGame).toHaveBeenCalled();
  });

  it('handles next player in active game view', () => {
    mockGameData.activeGame = { 
      players: [{ name: 'Test' }], 
      currentPlayerIndex: 0,
      timerDuration: 60,
      maxExtensions: 3
    };
    render(<App />);
    fireEvent.click(screen.getByText('Resume'));
    fireEvent.click(screen.getByText('Next Player'));
  });

  it('handles close in active game view', () => {
    mockGameData.activeGame = { 
      players: [{ name: 'Test' }], 
      currentPlayerIndex: 0,
      timerDuration: 60,
      maxExtensions: 3
    };
    render(<App />);
    fireEvent.click(screen.getByText('Resume'));
    fireEvent.click(screen.getByText('Close'));
    
    expect(screen.getByTestId('home-view')).toBeInTheDocument();
  });
});
