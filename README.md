# 🎲 Rummikub Tracker

A modern, feature-rich web application for tracking Rummikub game scores with timer functionality, player management, and multi-language support.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)

Demo: ![https://christophrus.github.io/rummikub-tracker/](https://christophrus.github.io/rummikub-tracker/)

## ✨ Features

### 🎮 Game Management
- **Turn-based Timer**: Configurable timer (30 seconds to 5 minutes) with visual countdown
- **Audio Notifications**: Sound alerts and text-to-speech player name announcements
- **Time Extensions**: Configurable per-player time extensions (each adds 30 seconds)
- **Score Tracking**: Round-by-round score entry with automatic totals
- **Game History**: Save and review completed games with winners and final scores

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
- **Tick-Tock Sound**: Audible countdown in the final 15 seconds
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
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The optimized build will be in the `build/` directory.

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

- **Entering Scores**:
  - Scroll down to "Enter Round X Scores"
  - Enter score for each player
  - Click "Save Round" to record

- **Player Order**:
  - Use ▲/▼ buttons in player cards to reorder
  - Or drag-and-drop on desktop

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

- **React 18.x** - UI framework
- **Lucide React** - Icon library
- **Tailwind CSS** - Styling (utility classes only)
- **Web Speech API** - Text-to-speech functionality
- **Web Audio API** - Sound notifications
- **localStorage** - Data persistence

## 📁 Project Structure

```
rummikub-tracker/
├── public/
│   ├── index.html
│   └── ...
├── src/
│   ├── locales/
│   │   ├── en.js          # English translations
│   │   ├── de.js          # German translations
│   │   └── fr.js          # French translations
│   ├── App.jsx            # Main application component
│   └── index.js           # Entry point
├── LOCALIZATION_GUIDE.md  # Guide for adding languages
├── README.md              # This file
└── package.json
```

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

- [ ] Cloud sync and multi-device support
- [ ] Statistics and analytics dashboard
- [ ] Customizable game rules
- [ ] Tournament mode
- [ ] Dark mode theme
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
