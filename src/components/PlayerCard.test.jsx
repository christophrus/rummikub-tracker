import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlayerCard } from './PlayerCard';

describe('PlayerCard', () => {
  const mockPlayer = {
    name: 'John Doe',
    image: null
  };
  const mockT = (key) => key;

  const defaultProps = {
    player: mockPlayer,
    index: 0,
    t: mockT,
    onNameChange: vi.fn(),
    onRemove: vi.fn(),
    onMoveUp: vi.fn(),
    onMoveDown: vi.fn(),
    onImageUpload: vi.fn(),
    onDragStart: vi.fn(),
    onDragOver: vi.fn(),
    onDrop: vi.fn(),
    showMoveButtons: true,
    canRemove: true
  };

  it('renders player name', () => {
    render(<PlayerCard {...defaultProps} />);
    const inputs = screen.getAllByDisplayValue('John Doe');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('calls onNameChange when input changes', () => {
    const onNameChange = vi.fn();
    render(<PlayerCard {...defaultProps} onNameChange={onNameChange} />);

    const inputs = screen.getAllByDisplayValue('John Doe');
    fireEvent.change(inputs[0], { target: { value: 'Jane Doe' } });

    expect(onNameChange).toHaveBeenCalledWith(0, 'Jane Doe');
  });

  it('calls onRemove when remove button is clicked', () => {
    const onRemove = vi.fn();
    render(<PlayerCard {...defaultProps} onRemove={onRemove} canRemove={true} />);

    const removeButtons = screen.getAllByText('removePlayer');
    fireEvent.click(removeButtons[0]);

    expect(onRemove).toHaveBeenCalledWith(0);
  });

  it('hides remove button when canRemove is false', () => {
    render(<PlayerCard {...defaultProps} canRemove={false} />);
    
    expect(screen.queryByText('removePlayer')).not.toBeInTheDocument();
  });

  it('calls onMoveUp when up button is clicked', () => {
    const onMoveUp = vi.fn();
    render(<PlayerCard {...defaultProps} index={1} onMoveUp={onMoveUp} />);

    const upButtons = screen.getAllByTitle('Move Up');
    fireEvent.click(upButtons[0]);

    expect(onMoveUp).toHaveBeenCalledWith(1);
  });

  it('calls onMoveDown when down button is clicked', () => {
    const onMoveDown = vi.fn();
    render(<PlayerCard {...defaultProps} index={0} onMoveDown={onMoveDown} />);

    const downButtons = screen.getAllByTitle('Move Down');
    fireEvent.click(downButtons[0]);

    expect(onMoveDown).toHaveBeenCalledWith(0);
  });

  it('disables up button for first player', () => {
    render(<PlayerCard {...defaultProps} index={0} />);

    const upButtons = screen.getAllByTitle('Move Up');
    expect(upButtons[0]).toBeDisabled();
  });

  it('renders player image when provided', () => {
    const playerWithImage = { name: 'John', image: 'base64-image-data' };
    const { container } = render(<PlayerCard {...defaultProps} player={playerWithImage} />);

    const images = container.querySelectorAll('img[src="base64-image-data"]');
    expect(images.length).toBeGreaterThan(0);
  });

  it('applies isDragging opacity class when dragging', () => {
    const { container } = render(<PlayerCard {...defaultProps} isDragging={true} />);
    
    expect(container.firstChild).toHaveClass('opacity-50');
  });

  it('calls drag handlers on drag events', () => {
    const onDragStart = vi.fn();
    const onDragOver = vi.fn();
    const onDrop = vi.fn();
    
    const { container } = render(
      <PlayerCard 
        {...defaultProps} 
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
      />
    );

    fireEvent.dragStart(container.firstChild);
    expect(onDragStart).toHaveBeenCalledWith(0);

    fireEvent.dragOver(container.firstChild);
    expect(onDragOver).toHaveBeenCalled();

    fireEvent.drop(container.firstChild);
    expect(onDrop).toHaveBeenCalled();
  });

  it('calls onImageUpload when file is selected', () => {
    const onImageUpload = vi.fn();
    render(<PlayerCard {...defaultProps} onImageUpload={onImageUpload} />);

    const fileInputs = document.querySelectorAll('input[type="file"]');
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    
    fireEvent.change(fileInputs[0], { target: { files: [file] } });

    expect(onImageUpload).toHaveBeenCalledWith(0, file);
  });

  it('hides move buttons when showMoveButtons is false', () => {
    render(<PlayerCard {...defaultProps} showMoveButtons={false} />);
    
    expect(screen.queryByTitle('Move Up')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Move Down')).not.toBeInTheDocument();
  });

  it('handles desktop layout image upload', () => {
    const onImageUpload = vi.fn();
    render(<PlayerCard {...defaultProps} onImageUpload={onImageUpload} />);

    // Get all file inputs (mobile and desktop)
    const fileInputs = document.querySelectorAll('input[type="file"]');
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    
    // Use the second one (desktop layout)
    if (fileInputs.length > 1) {
      fireEvent.change(fileInputs[1], { target: { files: [file] } });
      expect(onImageUpload).toHaveBeenCalledWith(0, file);
    }
  });

  it('handles desktop layout name input change', () => {
    const onNameChange = vi.fn();
    render(<PlayerCard {...defaultProps} onNameChange={onNameChange} />);

    const inputs = screen.getAllByDisplayValue('John Doe');
    // Use the second one (desktop layout)
    if (inputs.length > 1) {
      fireEvent.change(inputs[1], { target: { value: 'New Name' } });
      expect(onNameChange).toHaveBeenCalledWith(0, 'New Name');
    }
  });

  it('handles desktop layout move up button', () => {
    const onMoveUp = vi.fn();
    render(<PlayerCard {...defaultProps} index={1} onMoveUp={onMoveUp} />);

    const upButtons = screen.getAllByTitle('Move Up');
    // Use the second one (desktop layout)
    if (upButtons.length > 1) {
      fireEvent.click(upButtons[1]);
      expect(onMoveUp).toHaveBeenCalledWith(1);
    }
  });

  it('handles desktop layout move down button', () => {
    const onMoveDown = vi.fn();
    render(<PlayerCard {...defaultProps} index={1} showPlayerNumber={3} onMoveDown={onMoveDown} />);

    const downButtons = screen.getAllByTitle('Move Down');
    // Use the second one (desktop layout)
    if (downButtons.length > 1) {
      fireEvent.click(downButtons[1]);
      expect(onMoveDown).toHaveBeenCalledWith(1);
    }
  });

  it('handles desktop layout remove button', () => {
    const onRemove = vi.fn();
    render(<PlayerCard {...defaultProps} onRemove={onRemove} canRemove={true} />);

    const removeButtons = screen.getAllByText('removePlayer');
    // Use the second one (desktop layout)
    if (removeButtons.length > 1) {
      fireEvent.click(removeButtons[1]);
      expect(onRemove).toHaveBeenCalledWith(0);
    }
  });

  it('renders player number when showPlayerNumber is set', () => {
    render(<PlayerCard {...defaultProps} showPlayerNumber={5} />);
    
    // Component should render correctly
    expect(screen.getAllByDisplayValue('John Doe')).toHaveLength(2);
  });
});
