import { Trophy, Trash2, X } from 'lucide-react';
import { PlayerAvatar } from '../PlayerAvatar';

export const ManagePlayersView = ({ 
  savedPlayers, 
  onClose, 
  onDeletePlayer,
  t 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{t('managePlayersTitle')}  </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
      </div>
      {savedPlayers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Trophy size={48} className="mx-auto mb-4 opacity-50" />
          <p className="mb-4">{t('noSavedPlayers')}</p>
          <p className="text-sm">{t('noSavedPlayersNote')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-4">{savedPlayers.length} {savedPlayers.length === 1 ? t('savedPlayer') : t('savedPlayers')}</p>
          {savedPlayers.map((player, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PlayerAvatar player={player} size="xl" />
                  <p className="font-semibold text-gray-800">{player.name}</p>
                </div>
                <button 
                  onClick={() => onDeletePlayer(player.name)} 
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600">{t('managePlayersTip')}</p>
      </div>
    </div>
  );
};
