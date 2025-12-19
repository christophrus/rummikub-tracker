// Timer settings
export const TIMER_PRESETS = [
  { value: 30, label: 'seconds' },
  { value: 60, label: 'minute' },
  { value: 90, label: 'minutes' },
  { value: 120, label: 'minutes' },
  { value: 180, label: 'minutes' },
  { value: 300, label: 'minutes' }
];

export const TIMER_LABELS = {
  30: '30 seconds',
  60: '1 minute',
  90: '1.5 minutes',
  120: '2 minutes',
  180: '3 minutes',
  300: '5 minutes'
};

// Extension settings
export const EXTENSION_PRESETS = [0, 1, 2, 3, 5, 10];

// Voice language options
export const VOICE_LANGUAGES = [
  { code: 'de-DE', label: '🇩🇪 Deutsch' },
  { code: 'en-US', label: '🇺🇸 English (US)' },
  { code: 'en-GB', label: '🇬🇧 English (UK)' },
  { code: 'fr-FR', label: '🇫🇷 Français' },
  { code: 'es-ES', label: '🇪🇸 Español' },
  { code: 'it-IT', label: '🇮🇹 Italiano' },
  { code: 'pt-PT', label: '🇵🇹 Português' },
  { code: 'nl-NL', label: '🇳🇱 Nederlands' },
  { code: 'pl-PL', label: '🇵🇱 Polski' },
  { code: 'ru-RU', label: '🇷🇺 Русский' }
];

// UI languages
export const UI_LANGUAGES = [
  { code: 'en', label: '🇬🇧 English' },
  { code: 'de', label: '🇩🇪 Deutsch' },
  { code: 'fr', label: '🇫🇷 Français' }
];

// Game constraints
export const MAX_PLAYERS = 6;
export const MIN_PLAYERS = 2;
export const EXTENSION_DURATION_SECONDS = 30;
export const TIMER_LOW_TIME = 10;
export const TIMER_WARNING_TIME = 15;

// Storage keys
export const STORAGE_KEYS = {
  GAME_HISTORY: 'game-history',
  SAVED_PLAYERS: 'saved-players',
  ACTIVE_GAME: 'active-game',
  UI_LANGUAGE: 'ui-language'
};

// Views
export const VIEWS = {
  HOME: 'home',
  NEW_GAME: 'newGame',
  ACTIVE_GAME: 'activeGame',
  MANAGE_PLAYERS: 'managePlayers',
  GAME_HISTORY: 'gameHistory',
  SETTINGS: 'settings'
};
