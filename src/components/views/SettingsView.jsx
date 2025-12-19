import { X, Settings, Moon, Sun, Globe, Volume2, Trash2 } from 'lucide-react';
import { VOICE_LANGUAGES, UI_LANGUAGES } from '../../constants';
import { useTheme } from '../../hooks';

export const SettingsView = ({ 
  uiLanguage,
  ttsLanguage,
  onClose,
  onUiLanguageChange,
  onTtsLanguageChange,
  t 
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-2">
          <Settings className="text-indigo-600 dark:text-indigo-400" size={24} />
          <h2 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-gray-100">{t('settings')}</h2>
        </div>
        <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex-shrink-0">
          <X size={24} />
        </button>
      </div>

      <div className="space-y-6">
        {/* UI Language Setting */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="text-indigo-600 dark:text-indigo-400" size={20} />
            <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100">{t('uiLanguage')}</h3>
          </div>
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-3">{t('uiLanguageDescription')}</p>
          <select
            value={uiLanguage}
            onChange={(e) => onUiLanguageChange(e.target.value)}
            className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm md:text-base"
          >
            {UI_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            ))}
          </select>
        </div>

        {/* Voice Announcement Language Setting */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <div className="flex items-center gap-2 mb-3">
            <Volume2 className="text-indigo-600 dark:text-indigo-400" size={20} />
            <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100">{t('voiceAnnouncementLanguage')}</h3>
          </div>
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-3">{t('voiceLanguageNote')}</p>
          <select 
            value={ttsLanguage} 
            onChange={(e) => onTtsLanguageChange(e.target.value)}
            className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm md:text-base"
          >
            {VOICE_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            ))}
          </select>
        </div>

        {/* Theme Setting */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            {theme === 'light' ? (
              <Sun className="text-indigo-600 dark:text-indigo-400" size={20} />
            ) : (
              <Moon className="text-indigo-600 dark:text-indigo-400" size={20} />
            )}
            <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100">{t('appearance')}</h3>
          </div>
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-3">{t('appearanceDescription')}</p>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
          >
            <div className="flex items-center gap-3">
              {theme === 'light' ? (
                <>
                  <Sun size={24} className="text-yellow-600 dark:text-yellow-500" />
                  <span className="text-sm md:text-base font-medium text-gray-800 dark:text-gray-100">{t('lightMode')}</span>
                </>
              ) : (
                <>
                  <Moon size={24} className="text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm md:text-base font-medium text-gray-800 dark:text-gray-100">{t('darkMode')}</span>
                </>
              )}
            </div>
            <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
              {t('clickToToggle')}
            </div>
          </button>
        </div>

        {/* Clear All Data Setting */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex items-center gap-2 mb-3">
            <Trash2 className="text-red-600 dark:text-red-400" size={20} />
            <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100">{t('clearAllData')}</h3>
          </div>
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-3">{t('clearAllDataDescription')}</p>
          <button
            onClick={() => {
              if (window.confirm(t('clearAllDataConfirm'))) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="w-full px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition text-red-700 dark:text-red-400 font-medium text-sm md:text-base"
          >
            {t('clearAllDataButton')}
          </button>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {t('settingsSavedAutomatically')}
        </p>
      </div>
    </div>
  );
};
