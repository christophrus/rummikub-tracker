import { History, Trash2 } from 'lucide-react';
import { Trophy } from 'lucide-react';

export const GameHistoryView = ({ 
  gameHistory, 
  onClose, 
  onDeleteGame,
  t 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-lg md:text-2xl font-bold text-gray-800">{t('gameHistory')}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 flex-shrink-0"><History size={24} /></button>
      </div>
      {gameHistory.length === 0 ? (
        <div className="text-center py-8 md:py-12 text-gray-500">
          <History size={40} className="md:size-48 mx-auto mb-3 md:mb-4 opacity-50" />
          <p className="text-sm md:text-base">{t('noGamesPlayed')}</p>
        </div>
      ) : (
        <div className="space-y-2 md:space-y-3">
          {gameHistory.map(game => (
            <div key={game.id} className="border border-gray-200 rounded-lg p-2 md:p-4 hover:border-indigo-300 transition">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-sm md:text-base truncate">{game.name}</h3>
                  <p className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-1">{new Date(game.startTime).toLocaleDateString()} • {game.rounds.length} {t('rounds')}</p>
                  <div className="mt-1 md:mt-2 flex items-center gap-1 md:gap-2">
                    <Trophy size={14} className="md:size-4 text-yellow-600 flex-shrink-0" />
                    <span className="text-xs md:text-sm font-semibold text-gray-700 truncate">{t('winner')} {game.winner}</span>
                  </div>
                  <div className="mt-1 md:mt-2 text-xs text-gray-600 line-clamp-2 md:line-clamp-none">
                    {Object.entries(game.finalScores).map(([player, score]) => (
                      <span key={player} className="mr-2 md:mr-3">{player}: {score}</span>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => onDeleteGame(game.id)} 
                  className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                >
                  <Trash2 size={18} className="md:size-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
