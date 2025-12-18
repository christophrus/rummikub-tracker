import { Trophy, Trash2, X } from 'lucide-react';
import { PlayerAvatar } from '../PlayerAvatar';

export const ManagePlayersView = ({ 
  savedPlayers, 
  onClose, 
  onDeletePlayer,
  t 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-lg md:text-2xl font-bold text-gray-800">{t('managePlayersTitle')}  </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 flex-shrink-0"><X size={24} /></button>
      </div>
      {savedPlayers.length === 0 ? (
        <div className="text-center py-8 md:py-12 text-gray-500">
          <Trophy size={40} className="md:size-48 mx-auto mb-3 md:mb-4 opacity-50" />
          <p className="mb-2 md:mb-4 text-sm md:text-base">{t('noSavedPlayers')}</p>
          <p className="text-xs md:text-sm">{t('noSavedPlayersNote')}</p>
        </div>
      ) : (
        <div className="space-y-2 md:space-y-3">
          <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">{savedPlayers.length} {savedPlayers.length === 1 ? t('savedPlayer') : t('savedPlayers')}</p>
          {savedPlayers.map((player, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-2 md:p-4 hover:border-indigo-300 transition">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                  <PlayerAvatar player={player} size="md" className="flex-shrink-0" />
                  <p className="font-semibold text-gray-800 text-sm md:text-base truncate">{player.name}</p>
                </div>
                <button 
                  onClick={() => onDeletePlayer(player.name)} 
                  className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                >
                  <Trash2 size={18} className="md:size-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200">
        <p className="text-xs md:text-sm text-gray-600">{t('managePlayersTip')}</p>
      </div>
    </div>
  );
};
