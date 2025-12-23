import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HomeView } from './HomeView';

describe('HomeView', () => {
  const mockT = (key) => key;
  const defaultProps = {
    t: mockT,
    onNewGame: vi.fn(),
    onResume: vi.fn(),
    onCancelActiveGame: vi.fn(),
    onManagePlayers: vi.fn(),
    onViewHistory: vi.fn(),
    onSettings: vi.fn()
  };

  it('renders app logo image', () => {
    render(<HomeView {...defaultProps} />);
    const logo = screen.getByRole('img', { name: /rummikub/i });
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', 'pwa-192x192.png');
  });

  it('renders start new game button', () => {
    render(<HomeView {...defaultProps} />);
    expect(screen.getByText('startNewGame')).toBeInTheDocument();
  });

  it('calls onNewGame when start button is clicked', () => {
    render(<HomeView {...defaultProps} />);
    
    fireEvent.click(screen.getByText('startNewGame'));
    expect(defaultProps.onNewGame).toHaveBeenCalled();
  });

  it('shows resume game button when active game exists', () => {
    const activeGame = { 
      name: 'Test Game',
      rounds: [],
      players: [{}, {}]
    };
    render(<HomeView {...defaultProps} activeGame={activeGame} />);
    
    expect(screen.getByText('resumeGame')).toBeInTheDocument();
    expect(screen.getByText('Test Game')).toBeInTheDocument();
  });

  it('calls onResume when resume button is clicked', () => {
    const activeGame = { 
      name: 'Test Game',
      rounds: [],
      players: [{}, {}]
    };
    render(<HomeView {...defaultProps} activeGame={activeGame} />);
    
    fireEvent.click(screen.getByText('resumeGame'));
    expect(defaultProps.onResume).toHaveBeenCalled();
  });

  it('calls onManagePlayers when button is clicked', () => {
    render(<HomeView {...defaultProps} />);
    
    fireEvent.click(screen.getByText('managePlayers'));
    expect(defaultProps.onManagePlayers).toHaveBeenCalled();
  });

  it('calls onViewHistory when button is clicked', () => {
    render(<HomeView {...defaultProps} />);
    
    fireEvent.click(screen.getByText('viewGameHistory'));
    expect(defaultProps.onViewHistory).toHaveBeenCalled();
  });

  it('calls onSettings when button is clicked', () => {
    render(<HomeView {...defaultProps} />);
    
    fireEvent.click(screen.getByText('settings'));
    expect(defaultProps.onSettings).toHaveBeenCalled();
  });
});
