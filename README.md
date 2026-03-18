# 🎲 Rummikub Tracker

A modern, feature-rich web application for tracking Rummikub game scores with timer functionality, player management, and multi-language support.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)
![Test Coverage](https://img.shields.io/badge/coverage-87%25-brightgreen.svg)

Demo: [https://christophrus.github.io/rummikub-tracker/](https://christophrus.github.io/rummikub-tracker/)

## ✨ Features

### 🎮 Game Management
- **Turn-based Timer**: Configurable timer (30 seconds to 5 minutes) with visual countdown
- **Audio Notifications**: Sound alerts and text-to-speech player name announcements
- **Time Extensions**: Configurable per-player time extensions (each adds 30 seconds) with pulsating button alert
- **Score Tracking**: Round-by-round score entry with automatic totals and editable past scores
- **Game History**: Save and review completed games with winners, final scores, and screenshot capture
- **Dark Mode**: Full dark mode support with persistent theme preference

### 👥 Player Management
- **2-6 Players**: Support for up to 6 players per game
- **Player Profiles**: Add custom avatars/photos for each player
- **Quick Add**: Saved players for quick game setup
- **Drag & Drop**: Reorder players via drag-and-drop (desktop)
- **Touch Controls**: Arrow buttons for reordering on mobile devices

### 🕐 Advanced Timer Features
- **Analog Clock Display**: Beautiful visual countdown with color-coded alerts
  - Blue: Normal time
  - Yellow: Warning (15-10 seconds remaining)
  - Red: Critical (under 10 seconds)
- **Pulsating Extension Button**: Button pulsates with glow effect when time is low (≤15 seconds)
- **Extension Counter Badge**: Visual badge showing remaining extensions
- **Tick-Tock Sound**: Audible countdown in the final 10 seconds
- **Pause/Resume**: Pause the timer at any time
- **Auto-Advance**: Automatic turn progression when time expires

### 🌍 Internationalization
- **Multi-language Support**: English, German, and French included
- **Text-to-Speech**: Announce player names in 10+ languages
- **Easy to Extend**: Simple system for adding new languages
- **Persistent Selection**: Remembers your language preference

### 💾 Data Persistence
- **Auto-Save**: All data saved to browser localStorage
- **Resume Games**: Continue interrupted games
- **Player Database**: Automatically saves players across sessions
- **Game History**: Complete archive of past games

### 📱 Responsive Design
- **Mobile-First**: Optimized for phones and tablets
- **Desktop Support**: Full-featured desktop experience
- **Fullscreen Mode**: Immersive gameplay with fullscreen toggle
- **Touch-Friendly**: Large buttons and intuitive touch controls

## 🚀 Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/rummikub-tracker.git
   cd rummikub-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The optimized build will be in the `dist/` directory.

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm test             # Run tests
npm run test:coverage # Run tests with coverage
```

## 📖 Usage Guide

### Starting a New Game

1. Click **"Start New Game"** from the home screen
2. (Optional) Enter a custom game name
3. Configure timer settings:
   - **Turn Duration**: 30 seconds to 5 minutes
   - **Time Extensions**: 0-10 extensions per player
   - **Voice Language**: Choose announcement language
4. Add players (2-6 required):
   - Click avatar to add photo
   - Enter player names
   - Use arrows or drag to reorder
5. Click **"Start Game"**

### During Gameplay

- **Timer Controls**:
  - ⏸️ Pause/▶️ Resume: Control the timer
  - 🔄 Reset: Restart the current turn
  - ➕ Add 30 Seconds: Use available time extensions
   - ⏭️ Skip Turn: Move to next player
   - 🕒 Tap/Click on the clock: Also advances to the next player

- **Entering Scores**:
  - Scroll down to "Enter Round X Scores"
  - Enter score for each player
  - Click "Save Round" to record

- **Player Order**:
  - Use ▲/▼ buttons in player cards to reorder
  - Or drag-and-drop on desktop

### 🔍 Tile Recognition API (Stone Detection)

When entering round scores (section "Enter Round X Scores"), each player row has a camera button next to the score field:
- Tap/click the camera icon to take or select a photo of the tiles
- The app sends the image to an external recognition API
- The detected `total_score` from the response is automatically filled into that player's score field (you can still adjust it manually)

**API details**
- Endpoint: `POST https://rummikub.lorus.org/api/analyze`
- Request: `multipart/form-data` with one field `file` (image, up to ~20 MB)
- Response (example):
   ```json
   {
      "tiles": [
         {
            "number": 7,
            "confidence": 0.95,
            "is_joker": false,
            "x": 100,
            "y": 150,
            "width": 50,
            "height": 60
         }
      ],
      "total_score": 49,
      "tile_count": 3,
      "processing_time_ms": 245.32,
      "image_width": 1920,
      "image_height": 1080
   }
   ```

Only `total_score` is currently used by the app.

### Managing Players

1. Click **"Manage Players"** from home
2. View all saved players
3. Delete players using the trash icon
4. Players are auto-saved when creating games

### Game History

1. Click **"View Game History"** from home
2. See all completed games with:
   - Game name and date
   - Number of rounds played
   - Winner and final scores
3. Delete old games using the trash icon

## 🛠️ Technology Stack

- **React 18.x** - UI framework with hooks
- **Vite** - Fast build tool and dev server
- **Lucide React** - Icon library
- **Tailwind CSS** - Utility-first styling
- **Vitest** - Unit testing framework (245 tests, 87% coverage)
- **React Testing Library** - Component testing
- **Web Speech API** - Text-to-speech functionality
- **Web Audio API** - Sound notifications
- **html-to-image** - Screenshot capture for game history
- **localStorage** - Data persistence
- **PWA Support** - Installable as a Progressive Web App

## 📁 Project Structure

```
rummikub-tracker/
├── public/
│   ├── favicon.ico
│   ├── pwa-192x192.png
│   └── pwa-512x512.png
├── src/
│   ├── components/
│   │   ├── AnalogClock.jsx      # Timer display
│   │   ├── Confetti.jsx         # Victory animation
│   │   ├── PlayerAvatar.jsx     # Player profile images
│   │   ├── PlayerCard.jsx       # Player card component
│   │   ├── ThemeToggle.jsx      # Dark/light mode toggle
│   │   └── views/
│   │       ├── ActiveGameView.jsx
│   │       ├── GameHistoryView.jsx
│   │       ├── HomeView.jsx
│   │       ├── ManagePlayersView.jsx
│   │       ├── NewGameView.jsx
│   │       └── SettingsView.jsx
│   ├── constants/
│   │   └── config.js            # App configuration
│   ├── hooks/
│   │   ├── useAudio.js          # Sound effects
│   │   ├── useGameData.js       # Game state management
│   │   ├── useGameFlow.js       # Game logic
│   │   ├── useLocalization.js   # Language support
│   │   ├── usePlayerManagement.js
│   │   ├── useTheme.jsx         # Dark mode
│   │   ├── useTimer.js          # Timer logic
│   │   └── useTimerControl.js   # Timer controls
│   ├── locales/
│   │   ├── en.js                # English translations
│   │   ├── de.js                # German translations
│   │   └── fr.js                # French translations
│   ├── utils/
│   │   ├── helpers.js           # Utility functions
│   │   └── playerManagement.js  # Player utilities
│   ├── App.jsx                  # Main application
│   ├── App.css                  # Custom styles
│   └── main.jsx                 # Entry point
├── LOCALIZATION_GUIDE.md
├── README.md
├── vite.config.js
└── package.json
```

## 🧪 Testing

The project includes a comprehensive test suite with **245 tests** and **87% code coverage**.

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Coverage

| Category | Coverage |
|----------|----------|
| Lines | 87.39% |
| Branches | 74.30% |
| Functions | 88.46% |
| Statements | 86.77% |

## 🌐 Adding New Languages

The app uses a simple localization system. To add a new language:

1. Create `src/locales/xx.js` (replace `xx` with language code)
2. Copy all keys from `en.js` and translate values
3. Import in `App.jsx`: `import xxTranslations from './locales/xx.js';`
4. Add to translations object: `xx: xxTranslations`
5. Add option to language selector dropdown

See [LOCALIZATION_GUIDE.md](./LOCALIZATION_GUIDE.md) for detailed instructions.

### Available Voice Languages

Text-to-speech supports these languages:
- 🇩🇪 German (de-DE)
- 🇺🇸 English US (en-US)
- 🇬🇧 English UK (en-GB)
- 🇫🇷 French (fr-FR)
- 🇪🇸 Spanish (es-ES)
- 🇮🇹 Italian (it-IT)
- 🇵🇹 Portuguese (pt-PT)
- 🇳🇱 Dutch (nl-NL)
- 🇵🇱 Polish (pl-PL)
- 🇷🇺 Russian (ru-RU)

## ⚙️ Configuration

### Timer Settings
Default values can be modified in the "New Game" setup screen:
- **Duration**: 30s, 1min, 1.5min, 2min, 3min, 5min
- **Extensions**: 0-10 per player (30 seconds each)

### Storage
All data is stored in browser localStorage:
- `game-history` - Completed games
- `saved-players` - Player profiles
- `active-game` - Current game state
- `ui-language` - Selected interface language

### Clearing Data
To reset all data:
```javascript
localStorage.clear();
```
Then refresh the page.

## 🎨 Customization

### Styling
The app uses Tailwind utility classes. To customize:
1. Modify the Tailwind configuration
2. Update classes in `App.jsx`
3. Color scheme uses Indigo/Purple gradient

### Timer Sounds
Sound generation uses Web Audio API. To customize:
- Edit `playTickTock()` for countdown sound
- Edit `playTurnNotification()` for turn change sound

### Clock Design
The analog clock can be customized in the `AnalogClock` component:
- Colors: Lines 518-523 in App.jsx
- Size: `radius` variable
- Tick marks: Lines 524-531

## 🐛 Known Issues

- **Browser Compatibility**: Web Speech API may not work in all browsers
- **localStorage Limits**: Most browsers limit to ~5-10MB
- **Offline Only**: No cloud sync (all data stored locally)
- **Large Images**: Player photos are compressed to reduce storage usage

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Guidelines
- Follow the existing code style
- Test on mobile and desktop
- Update documentation for new features
- Add translations for new UI text

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Rummikub** - The classic tile-based game that inspired this tracker
- **Lucide Icons** - Beautiful open-source icons
- **Tailwind CSS** - Utility-first CSS framework
- **React Community** - For the amazing ecosystem

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/rummikub-tracker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/rummikub-tracker/discussions)
- **Email**: your.email@example.com

## 🗺️ Roadmap

- [x] Dark mode theme
- [x] Screenshot capture for game history
- [x] Comprehensive test suite (87% coverage)
- [x] Editable past round scores
- [x] Pulsating timer extension button
- [ ] Cloud sync and multi-device support
- [ ] Statistics and analytics dashboard
- [ ] Customizable game rules
- [ ] Tournament mode
- [ ] Export game history (CSV/PDF)
- [ ] Mobile app version
- [ ] Team play mode

## 📸 Screenshots

### Home Screen
_Add screenshot of home screen_

### Active Game
_Add screenshot of game in progress with timer_

### Score Tracking
_Add screenshot of score entry and summary_

---

**Made with ❤️ for Rummikub players everywhere**

⭐ Star this repo if you find it helpful!
