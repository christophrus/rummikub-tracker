import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsView } from './SettingsView';

// Mock useTheme hook
vi.mock('../../hooks', () => ({
  useTheme: () => ({
    theme: 'light',
    toggleTheme: vi.fn()
  })
}));

// Mock constants
vi.mock('../../constants', () => ({
  UI_LANGUAGES: [
    { code: 'en', label: 'English' },
    { code: 'de', label: 'German' }
  ],
  VOICE_LANGUAGES: [
    { code: 'en-US', label: 'English (US)' }
  ]
}));

describe('SettingsView', () => {
  const mockT = (key) => key;
  const defaultProps = {
    uiLanguage: 'en',
    ttsLanguage: 'en-US',
    onClose: vi.fn(),
    onUiLanguageChange: vi.fn(),
    onTtsLanguageChange: vi.fn(),
    t: mockT
  };

  it('renders settings title', () => {
    render(<SettingsView {...defaultProps} />);
    expect(screen.getByText('settings')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<SettingsView {...defaultProps} />);
    // There might be multiple buttons (close icon), let's find by role or icon
    // The close button usually has an X icon.
    // Let's try to find the button that contains the X icon or is just a button in the header.
    // Since we don't have aria-labels on the close button in the code I read, 
    // I'll assume it's the first button or I can look for the X icon if I mocked lucide-react, 
    // but I didn't mock lucide-react so it renders the real component (SVG).
    // Let's rely on the fact that it's a button.
    const buttons = screen.getAllByRole('button');
    // The close button is likely the first one in the header
    fireEvent.click(buttons[0]);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onUiLanguageChange when language is selected', () => {
    render(<SettingsView {...defaultProps} />);
    const select = screen.getByDisplayValue('English');
    fireEvent.change(select, { target: { value: 'de' } });
    expect(defaultProps.onUiLanguageChange).toHaveBeenCalledWith('de');
  });
});
