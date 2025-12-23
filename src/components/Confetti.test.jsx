import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Confetti } from './Confetti';

describe('Confetti', () => {
  it('renders nothing when not active', () => {
    const { container } = render(<Confetti active={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders confetti pieces when active', () => {
    const { container } = render(<Confetti active={true} />);
    expect(container.firstChild).not.toBeNull();
    expect(container.firstChild.childNodes.length).toBeGreaterThan(0);
  });

  it('renders multiple confetti elements for visual effect', () => {
    const { container } = render(<Confetti active={true} />);
    // Expect a reasonable number of confetti pieces for visual impact
    expect(container.firstChild.childNodes.length).toBeGreaterThanOrEqual(20);
  });

  it('has fixed positioning for overlay effect', () => {
    const { container } = render(<Confetti active={true} />);
    expect(container.firstChild).toHaveClass('fixed');
  });
});
