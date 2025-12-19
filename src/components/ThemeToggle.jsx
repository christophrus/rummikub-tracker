import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-6 left-6 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-4 rounded-full shadow-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all hover:scale-110 z-40"
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
    </button>
  );
};

export default ThemeToggle;
