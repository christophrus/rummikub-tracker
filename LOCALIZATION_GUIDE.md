# Rummikub Tracker - Localization Guide

## Overview

The Rummikub Tracker app includes a complete localization system that makes it easy to add support for multiple languages. Translation files are loaded from separate files in the `locales/` folder.

## Current Languages

- **English (en)** - Default language (`locales/en.js`)
- **German (de)** - (`locales/de.js`)
- **French (fr)** - (`locales/fr.js`)

## Project Structure

```
project/
├── App.jsx                 # Main application file
├── locales/
│   ├── en.js              # English translations
│   ├── de.js              # German translations
│   └── fr.js              # French translations
└── LOCALIZATION_GUIDE.md  # This file
```

## How It Works

### 1. Translation Function

The app uses a simple `t()` function to translate text:

```javascript
t('welcomeTitle')  // Returns: "Welcome to Rummikub Tracker!"
```

For dynamic text with placeholders:

```javascript
t('enterRoundScores', { round: 5 })  // Returns: "Enter Round 5 Scores"
```

### 2. Language Files

Each language is defined as an object with key-value pairs:

```javascript
{
  welcomeTitle: 'Welcome to Rummikub Tracker!',
  appSubtitle: 'Track your game scores with ease',
  // ... more translations
}
```

## Adding a New Language

### Step 1: Create the Language File

Create a new file in the `locales/` directory, e.g., `locales/es.js`:

```javascript
// locales/es.js - Spanish translations
const esTranslations = {
  appTitle: 'Rummikub Tracker',
  appSubtitle: 'Sigue tus puntuaciones con facilidad',
  gameInProgress: 'Juego en progreso',
  round: 'Ronda',
  players: 'Jugadores',
  // ... copy all keys from en.js and translate
};

export default esTranslations;
```

### Step 2: Import in App.jsx

At the top of `App.jsx`, import your new language file:

```javascript
import React, { useState, useEffect } from 'react';
import { Plus, Timer, Trophy, History, ... } from 'lucide-react';

// Import language files
import enTranslations from './locales/en.js';
import deTranslations from './locales/de.js';
import frTranslations from './locales/fr.js';
import esTranslations from './locales/es.js';  // Add your new language

// Build translations object from imported files
const translations = {
  en: enTranslations,
  de: deTranslations,
  fr: frTranslations,
  es: esTranslations  // Add your new language
};
```

### Step 3: Update the Language Selector

Find the language selector in the header section of `App.jsx` and add your new language option:

```javascript
<select
  value={uiLanguage}
  onChange={(e) => changeUiLanguage(e.target.value)}
  className="..."
>
  <option value="en">🇬🇧 English</option>
  <option value="de">🇩🇪 Deutsch</option>
  <option value="fr">🇫🇷 Français</option>
  <option value="es">🇪🇸 Español</option>  {/* Add your new option */}
</select>
```

That's it! Your new language is now available in the app.

## Translation Keys

### File Format

Each translation file should follow this structure:

```javascript
// locales/xx.js
const xxTranslations = {
  key1: 'Translation 1',
  key2: 'Translation 2',
  // ... all translation keys
};

export default xxTranslations;
```

### Required Keys

All translation files must include these keys:

**App Header**
- `appTitle` - Application title
- `appSubtitle` - Subtitle below title
- `language` - "Language" label
- `selectLanguage` - Language selector tooltip

**Home Screen**
- `gameInProgress` - "Game in Progress"
- `round` - "Round"
- `players` - "Players"
- `resumeGame` - "Resume Game"
- `welcomeTitle` - Welcome message
- `welcomeSubtitle` - Welcome subtitle
- `startNewGame` - Start new game button
- `managePlayers` - Manage players button
- `viewGameHistory` - View history button

**New Game Setup**
- `newGame` - "New Game"
- `gameNameOptional` - "Game Name (optional)"
- `gameNamePlaceholder` - Placeholder text
- `turnTimerDuration` - "Turn Timer Duration"
- `seconds`, `minute`, `minutes` - Time units
- `timeExtensionsPerPlayer` - Extensions label
- `none`, `extension`, `extensions` - Extension options
- `extensionNote` - Extension explanation
- `voiceAnnouncementLanguage` - TTS language label
- `voiceLanguageNote` - TTS explanation
- `quickAddSavedPlayers` - Quick add section
- `playersLabel` - "Players"
- `playersNote` - Instructions for player list
- `playerPlaceholder` - "Player"
- `addPlayer` - Add player button
- `startGame` - Start game button

**Active Game**
- `currentTurn` - "Current Turn"
- `skipTurn` - Skip turn button
- `pause` - Pause button
- `resume` - Resume button
- `reset` - Reset button
- `addSeconds` - "Add 30 Seconds"
- `left` - "left" (remaining)
- `duration` - "Duration:"
- `enterRoundScores` - "Enter Round {{round}} Scores"
- `saveRound` - Save round button
- `scoreSummary` - "Score Summary"
- `total` - "Total"
- `endGame` - End game button
- `paused` - "PAUSED"
- `score` - "Score:"

**Player Management**
- `managePlayersTitle` - "Manage Players"
- `noSavedPlayers` - No players message
- `noSavedPlayersNote` - Explanation
- `savedPlayer`, `savedPlayers` - Singular/plural
- `managePlayersTip` - Tip message

**Game History**
- `gameHistory` - "Game History"
- `noGamesPlayed` - No games message
- `rounds` - "rounds"
- `winner` - "Winner:"

**UI Elements**
- `loading` - "Loading..."
- `moveUp` - "Move up"
- `moveDown` - "Move down"
- `enterFullscreen` - Fullscreen tooltip
- `exitFullscreen` - Exit fullscreen tooltip

**Alerts**
- `maxPlayersAlert` - Max players alert
- `playerAlreadyAddedAlert` - Duplicate player alert
- `minPlayersAlert` - Minimum players alert
- `enterAllScoresAlert` - Missing scores alert
- `endCurrentGameConfirm` - Confirm end game

## Best Practices

1. **Keep Keys Consistent**: Use the same keys across all language files
2. **Test Thoroughly**: Check that all text displays correctly in each language
3. **Consider Length**: Some languages require more space (e.g., German words are often longer)
4. **Use Placeholders**: For dynamic content, use `{{key}}` syntax
5. **Maintain Alphabetical Order**: Keep keys sorted for easier maintenance
6. **Document Changes**: Update this guide when adding new translation keys

## Fallback Behavior

If a translation key is missing in a language file, the app will:
1. Try to use the English (en) translation
2. If that's also missing, display the key itself

This ensures the app never shows blank text.

## Example: Complete Flow

To add Italian support:

1. **Create `locales/it.js`**:
```javascript
// locales/it.js
const itTranslations = {
  appTitle: 'Rummikub Tracker',
  appSubtitle: 'Monitora i punteggi con facilità',
  // ... all other translations
};

export default itTranslations;
```

2. **Import in App.jsx**:
```javascript
import itTranslations from './locales/it.js';

const translations = {
  en: enTranslations,
  de: deTranslations,
  fr: frTranslations,
  it: itTranslations
};
```

3. **Add to language selector**:
```javascript
<option value="it">🇮🇹 Italiano</option>
```

4. Test all screens in Italian
5. Document any UI adjustments needed for Italian text length

## Support

For questions or issues with localization, please refer to the main README or create an issue in the repository.