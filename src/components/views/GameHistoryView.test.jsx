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

  it('handles screenshot error gracefully', async () => {
    // Override the mock to reject
    mocks.toBlob.mockRejectedValueOnce(new Error('Canvas error'));
    
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<GameHistoryView {...defaultProps} />);
    
    // Expand the game details
    const expandButton = screen.getByTitle('showDetails');
    fireEvent.click(expandButton);
    
    // Click screenshot button
    const screenshotButton = screen.getByTitle('takeScreenshot');
    fireEvent.click(screenshotButton);
    
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Screenshot failed. Please try again.');
    });
    
    alertSpy.mockRestore();
  });

  it('calls onDeleteGame when delete button is clicked', () => {
    window.confirm = vi.fn(() => true);
    
    render(<GameHistoryView {...defaultProps} />);
    
    // Find delete button (trash icon button)
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(btn => btn.classList.contains('text-red-500'));
    
    if (deleteButton) {
      fireEvent.click(deleteButton);
      expect(defaultProps.onDeleteGame).toHaveBeenCalledWith(1);
    }
  });

  it('expands game when initialExpandedGameId is provided', () => {
    render(<GameHistoryView {...defaultProps} initialExpandedGameId={1} />);
    
    // Should show score summary since game is auto-expanded
    expect(screen.getByText('scoreSummary')).toBeInTheDocument();
  });

  it('toggles game expansion on click', () => {
    render(<GameHistoryView {...defaultProps} />);
    
    // Initially collapsed
    expect(screen.queryByText('scoreSummary')).not.toBeInTheDocument();
    
    // Click to expand
    const expandButton = screen.getByTitle('showDetails');
    fireEvent.click(expandButton);
    expect(screen.getByText('scoreSummary')).toBeInTheDocument();
    
    // Click to collapse (button title changes to hideDetails when expanded)
    const collapseButton = screen.getByTitle('hideDetails');
    fireEvent.click(collapseButton);
    expect(screen.queryByText('scoreSummary')).not.toBeInTheDocument();
  });

  it('displays play time when both start and end times exist', () => {
    const gameWithTimes = {
      ...defaultProps.gameHistory[0],
      startTime: new Date('2024-01-01T10:00:00').toISOString(),
      endTime: new Date('2024-01-01T10:30:45').toISOString()
    };
    
    render(<GameHistoryView {...defaultProps} gameHistory={[gameWithTimes]} />);
    
    // Play time is shown in the summary line (not expanded)
    expect(screen.getByText(/30m 45s/)).toBeInTheDocument();
  });

  it('displays winner name from finalScores', () => {
    const gameWithFinalScores = {
      ...defaultProps.gameHistory[0],
      finalScores: { 'Alice': 10, 'Bob': 50 }
    };
    
    render(<GameHistoryView {...defaultProps} gameHistory={[gameWithFinalScores]} />);
    
    // Alice has lowest score, should be the winner (displayed with "winner" label)
    expect(screen.getByText(/winner.*Alice/i)).toBeInTheDocument();
  });

  it('handles multiple winners with same score', () => {
    const gameWithTiedScores = {
      ...defaultProps.gameHistory[0],
      finalScores: { 'Alice': 10, 'Bob': 10 }
    };
    
    render(<GameHistoryView {...defaultProps} gameHistory={[gameWithTiedScores]} />);
    
    // Both winners should be displayed together
    expect(screen.getByText(/Alice.*Bob|Bob.*Alice/)).toBeInTheDocument();
  });

  it('handles hours in play time', () => {
    const gameWithLongPlayTime = {
      ...defaultProps.gameHistory[0],
      startTime: new Date('2024-01-01T10:00:00').toISOString(),
      endTime: new Date('2024-01-01T12:30:15').toISOString()
    };
    
    render(<GameHistoryView {...defaultProps} gameHistory={[gameWithLongPlayTime]} />);
    
    // 2 hours, 30 minutes, 15 seconds - shown in summary
    expect(screen.getByText(/2h 30m 15s/)).toBeInTheDocument();
  });

  it('displays only seconds for short games', () => {
    const shortGame = {
      ...defaultProps.gameHistory[0],
      startTime: new Date('2024-01-01T10:00:00').toISOString(),
      endTime: new Date('2024-01-01T10:00:45').toISOString()
    };
    
    render(<GameHistoryView {...defaultProps} gameHistory={[shortGame]} />);
    
    // Shown in summary line
    expect(screen.getByText(/45s/)).toBeInTheDocument();
  });

  it('renders total scores in summary', () => {
    render(<GameHistoryView {...defaultProps} initialExpandedGameId={1} />);
    
    // Should show the total row
    expect(screen.getByText('total')).toBeInTheDocument();
  });

  it('handles game with no rounds', () => {
    const gameNoRounds = {
      ...defaultProps.gameHistory[0],
      rounds: []
    };
    
    render(<GameHistoryView {...defaultProps} gameHistory={[gameNoRounds]} initialExpandedGameId={1} />);
    
    // Should still render without crashing
    expect(screen.getByText('Game 1')).toBeInTheDocument();
  });
});
