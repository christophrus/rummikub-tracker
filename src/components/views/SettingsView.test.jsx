import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsView } from './SettingsView';

// Create mutable mock for theme
let mockTheme = 'light';
const mockToggleTheme = vi.fn();

// Mock useTheme hook
vi.mock('../../hooks', () => ({
  useTheme: () => ({
    theme: mockTheme,
    toggleTheme: mockToggleTheme
  })
}));

// Mock constants
vi.mock('../../constants', () => ({
  UI_LANGUAGES: [
    { code: 'en', label: 'English' },
    { code: 'de', label: 'German' }
  ],
  VOICE_LANGUAGES: [
    { code: 'en-US', label: 'English (US)' },
    { code: 'de-DE', label: 'German' }
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

  beforeEach(() => {
    mockTheme = 'light';
    vi.clearAllMocks();
  });

  it('renders settings title', () => {
    render(<SettingsView {...defaultProps} />);
    expect(screen.getByText('settings')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<SettingsView {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onUiLanguageChange when language is selected', () => {
    render(<SettingsView {...defaultProps} />);
    const select = screen.getByDisplayValue('English');
    fireEvent.change(select, { target: { value: 'de' } });
    expect(defaultProps.onUiLanguageChange).toHaveBeenCalledWith('de');
  });

  it('calls onTtsLanguageChange when voice language is selected', () => {
    const onTtsLanguageChange = vi.fn();
    render(<SettingsView {...defaultProps} onTtsLanguageChange={onTtsLanguageChange} />);
    
    const select = screen.getByDisplayValue('English (US)');
    fireEvent.change(select, { target: { value: 'de-DE' } });
    
    expect(onTtsLanguageChange).toHaveBeenCalledWith('de-DE');
  });

  it('calls toggleTheme when theme button is clicked', () => {
    render(<SettingsView {...defaultProps} />);
    
    // Find the theme toggle button (has lightMode text)
    const themeButton = screen.getByText('lightMode').closest('button');
    fireEvent.click(themeButton);
    
    expect(mockToggleTheme).toHaveBeenCalled();
  });

  it('shows light mode when theme is light', () => {
    mockTheme = 'light';
    render(<SettingsView {...defaultProps} />);
    
    expect(screen.getByText('lightMode')).toBeInTheDocument();
  });

  it('shows dark mode when theme is dark', () => {
    mockTheme = 'dark';
    render(<SettingsView {...defaultProps} />);
    
    expect(screen.getByText('darkMode')).toBeInTheDocument();
  });

  it('clears all data when confirm is accepted', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const clearSpy = vi.spyOn(Storage.prototype, 'clear');
    const originalLocation = window.location;
    delete window.location;
    window.location = { ...originalLocation, reload: vi.fn() };
    
    render(<SettingsView {...defaultProps} />);
    
    const clearButton = screen.getByText('clearAllDataButton');
    fireEvent.click(clearButton);
    
    expect(confirmSpy).toHaveBeenCalledWith('clearAllDataConfirm');
    expect(clearSpy).toHaveBeenCalled();
    
    confirmSpy.mockRestore();
    clearSpy.mockRestore();
    window.location = originalLocation;
  });

  it('does not clear data when confirm is cancelled', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const clearSpy = vi.spyOn(Storage.prototype, 'clear');
    
    render(<SettingsView {...defaultProps} />);
    
    const clearButton = screen.getByText('clearAllDataButton');
    fireEvent.click(clearButton);
    
    expect(confirmSpy).toHaveBeenCalled();
    expect(clearSpy).not.toHaveBeenCalled();
    
    confirmSpy.mockRestore();
    clearSpy.mockRestore();
  });

  it('renders all section headers', () => {
    render(<SettingsView {...defaultProps} />);
    
    expect(screen.getByText('uiLanguage')).toBeInTheDocument();
    expect(screen.getByText('voiceAnnouncementLanguage')).toBeInTheDocument();
    expect(screen.getByText('appearance')).toBeInTheDocument();
    expect(screen.getByText('clearAllData')).toBeInTheDocument();
  });
});
