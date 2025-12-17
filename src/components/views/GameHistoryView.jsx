import { History, Trash2 } from 'lucide-react';
import { Trophy } from 'lucide-react';

export const GameHistoryView = ({ 
  gameHistory, 
  onClose, 
  onDeleteGame,
  t 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{t('gameHistory')}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><History size={24} /></button>
      </div>
      {gameHistory.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <History size={48} className="mx-auto mb-4 opacity-50" />
          <p>{t('noGamesPlayed')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {gameHistory.map(game => (
            <div key={game.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{game.name}</h3>
                  <p className="text-sm text-gray-600">{new Date(game.startTime).toLocaleDateString()} • {game.rounds.length} {t('rounds')}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Trophy size={16} className="text-yellow-600" />
                    <span className="text-sm font-semibold text-gray-700">{t('winner')} {game.winner}</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    {Object.entries(game.finalScores).map(([player, score]) => (
                      <span key={player} className="mr-3">{player}: {score}</span>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => onDeleteGame(game.id)} 
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
