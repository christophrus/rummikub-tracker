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
    // It renders a div with many children (confetti pieces)
    expect(container.firstChild).not.toBeNull();
    expect(container.firstChild.childNodes.length).toBeGreaterThan(0);
  });
});
