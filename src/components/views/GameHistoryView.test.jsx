import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GameHistoryView } from './GameHistoryView';

// Mock child components
vi.mock('../index', () => ({
  PlayerAvatar: ({ player }) => <div>{player.name}</div>
}));

const mocks = vi.hoisted(() => ({
  toBlob: vi.fn(() => Promise.resolve(new Blob(['test'], { type: 'image/png' })))
}));

// Mock html-to-image
vi.mock('html-to-image', () => ({
  toBlob: mocks.toBlob,
  default: { toBlob: mocks.toBlob } // Handle default export just in case
}));

describe('GameHistoryView', () => {
  const mockT = (key) => key;
  const defaultProps = {
    gameHistory: [
      {
        id: 1,
        name: 'Game 1',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        winner: 'Player 1',
        players: [{ name: 'Player 1' }, { name: 'Player 2' }],
        rounds: [{ scores: { 'Player 1': 10, 'Player 2': 20 } }]
      }
    ],
    onClose: vi.fn(),
    onDeleteGame: vi.fn(),
    initialExpandedGameId: null,
    t: mockT
  };

  beforeEach(() => {
    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:test');
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders game history list', () => {
    render(<GameHistoryView {...defaultProps} />);
    expect(screen.getByText('Game 1')).toBeInTheDocument();
  });

  it('shows empty state when no history', () => {
    render(<GameHistoryView {...defaultProps} gameHistory={[]} />);
    expect(screen.getByText('noGamesPlayed')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<GameHistoryView {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('captures screenshot when button is clicked', async () => {
    render(<GameHistoryView {...defaultProps} />);
    
    // Expand the game details
    const expandButton = screen.getByTitle('showDetails');
    fireEvent.click(expandButton);
    
    // Find screenshot button
    const screenshotButton = screen.getByTitle('takeScreenshot');
    expect(screenshotButton).toBeInTheDocument();
    
    // Click screenshot button
    fireEvent.click(screenshotButton);
    
    // Verify html-to-image was called
    await waitFor(() => {
      expect(mocks.toBlob).toHaveBeenCalled();
    });
    
    // Verify URL.createObjectURL was called
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });
});
