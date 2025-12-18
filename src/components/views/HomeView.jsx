import { Play, Trophy } from 'lucide-react';

export const HomeView = ({ 
  activeGame, 
  currentPlayerIndex, 
  onNewGame, 
  onResume, 
  onManagePlayers, 
  onViewHistory,
  t 
}) => {
  return (
    <div className="space-y-4">
      {activeGame && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm opacity-90 mb-1">{t('gameInProgress')}</p>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 truncate">{activeGame.name}</h3>
              <p className="text-xs sm:text-sm opacity-90">{t('round')} {activeGame.rounds.length + 1} • {activeGame.players.length} {t('players').toLowerCase()}</p>
            </div>
            <button
              onClick={onResume}
              className="w-full sm:w-auto bg-white text-green-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-green-50 transition flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap"
            >
              <Play size={18} className="sm:hidden" />
              <Play size={20} className="hidden sm:inline" />
              {t('resumeGame')}
            </button>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 text-center">
        <Trophy className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-3 sm:mb-4 text-indigo-600" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-4">{t('welcomeTitle')}</h2>
        <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">{t('welcomeSubtitle')}</p>
        <div className="space-y-2 sm:space-y-3">
          <button 
            onClick={onNewGame}
            className="w-full bg-indigo-600 text-white py-2 sm:py-4 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Trophy size={18} className="sm:hidden" />
            <Trophy size={20} className="hidden sm:inline" />
            {t('startNewGame')}
          </button>
          <button 
            onClick={onManagePlayers}
            className="w-full bg-purple-600 text-white py-2 sm:py-4 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Trophy size={18} className="sm:hidden" />
            <Trophy size={20} className="hidden sm:inline" />
            {t('managePlayers')}
          </button>
          <button 
            onClick={onViewHistory}
            className="w-full bg-gray-200 text-gray-800 py-2 sm:py-4 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Trophy size={18} className="sm:hidden" />
            <Trophy size={20} className="hidden sm:inline" />
            {t('viewGameHistory')}
          </button>
        </div>
      </div>
    </div>
  );
};
