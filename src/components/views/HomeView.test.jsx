import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HomeView } from './HomeView';

describe('HomeView', () => {
  const mockT = (key) => key;

  it('renders start new game button', () => {
    render(<HomeView t={mockT} />);
    expect(screen.getByText('startNewGame')).toBeInTheDocument();
  });

  it('calls onNewGame when start button is clicked', () => {
    const onNewGame = vi.fn();
    render(<HomeView onNewGame={onNewGame} t={mockT} />);
    
    fireEvent.click(screen.getByText('startNewGame'));
    expect(onNewGame).toHaveBeenCalled();
  });

  it('shows resume game button when active game exists', () => {
    const activeGame = { 
      name: 'Test Game',
      rounds: [],
      players: [{}, {}]
    };
    render(<HomeView activeGame={activeGame} t={mockT} />);
    
    expect(screen.getByText('resumeGame')).toBeInTheDocument();
    expect(screen.getByText('Test Game')).toBeInTheDocument();
  });
});
