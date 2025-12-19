import { X, Plus } from 'lucide-react';
import { PlayerCard } from '../PlayerCard';
import { QuickAddPlayerButton } from '../PlayerAvatar';
import { TIMER_PRESETS, EXTENSION_PRESETS, VOICE_LANGUAGES } from '../../constants';

export const NewGameView = ({ 
  players,
  gameName,
  timerDuration,
  maxExtensions,
  ttsLanguage,
  savedPlayers,
  onClose,
  onGameNameChange,
  onTimerDurationChange,
  onMaxExtensionsChange,
  onTtsLanguageChange,
  onAddPlayer,
  onRemovePlayer,
  onUpdatePlayer,
  onImageUpload,
  onMovePlayerUp,
  onMovePlayerDown,
  onDragStart,
  onDragOver,
  onDrop,
  onAddSavedPlayer,
  onStartGame,
  draggedPlayerIndex,
  t
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">{t('newGame')}</h2>
        <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1">
          <X size={24} />
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">{t('gameNameOptional')}</label>
          <input 
            type="text" 
            value={gameName} 
            onChange={(e) => onGameNameChange(e.target.value)}
            placeholder={t('gameNamePlaceholder')}
            className="w-full px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm" 
          />
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">{t('turnTimerDuration')}</label>
          <select 
            value={timerDuration} 
            onChange={(e) => onTimerDurationChange(Number(e.target.value))}
            className="w-full px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm"
          >
            <option value={30}>30 {t('seconds')}</option>
            <option value={60}>1 {t('minute')}</option>
            <option value={90}>1.5 {t('minutes')}</option>
            <option value={120}>2 {t('minutes')}</option>
            <option value={180}>3 {t('minutes')}</option>
            <option value={300}>5 {t('minutes')}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">{t('timeExtensionsPerPlayer')}</label>
          <select 
            value={maxExtensions} 
            onChange={(e) => onMaxExtensionsChange(Number(e.target.value))}
            className="w-full px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm"
          >
            <option value={0}>{t('none')}</option>
            <option value={1}>1 {t('extension')}</option>
            <option value={2}>2 {t('extensions')}</option>
            <option value={3}>3 {t('extensions')}</option>
            <option value={5}>5 {t('extensions')}</option>
            <option value={10}>10 {t('extensions')}</option>
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('extensionNote')}</p>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">{t('voiceAnnouncementLanguage')}</label>
          <select 
            value={ttsLanguage} 
            onChange={(e) => onTtsLanguageChange(e.target.value)}
            className="w-full px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm"
          >
            {VOICE_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('voiceLanguageNote')}</p>
        </div>

        {savedPlayers.length > 0 && (
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('quickAddSavedPlayers')}</label>
            <div className="flex flex-wrap gap-2 p-2 md:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg max-h-40 overflow-y-auto">
              {savedPlayers.map((sp, idx) => (
                <QuickAddPlayerButton 
                  key={idx} 
                  player={sp} 
                  onClick={() => onAddSavedPlayer(sp)}
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('playersLabel')} <span className="text-xs text-gray-500 dark:text-gray-400">{t('playersNote')}</span>
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{t('imageAutoResize')}</p>
          {players.map((player, index) => (
            <PlayerCard
              key={index}
              player={player}
              index={index}
              onImageUpload={onImageUpload}
              onNameChange={(idx, value) => onUpdatePlayer(idx, 'name', value)}
              onRemove={onRemovePlayer}
              onMoveUp={onMovePlayerUp}
              onMoveDown={onMovePlayerDown}
              isDragging={draggedPlayerIndex === index}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              showMoveButtons={true}
              canRemove={players.length > 1}
              t={t}
            />
          ))}
          {players.length < 6 && (
            <button 
              onClick={onAddPlayer} 
              className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              {t('addPlayer')}
            </button>
          )}
        </div>

        <button 
          onClick={onStartGame} 
          className="w-full bg-indigo-600 dark:bg-indigo-500 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition mt-6 text-sm md:text-base"
        >
          {t('startGame')}
        </button>
      </div>
    </div>
  );
};
