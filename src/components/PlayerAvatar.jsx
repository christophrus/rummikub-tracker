import { Plus } from 'lucide-react';

export const PlayerAvatar = ({ player, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
    '2xl': 'w-16 h-16'
  };

  const fontSizes = {
    sm: 'text-xs',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-lg',
    '2xl': 'text-2xl'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden border-2 border-white shadow-lg flex-shrink-0`}>
      {player?.image ? (
        <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
      ) : (
        <span className={`${fontSizes[size]} font-bold text-white`}>
          {player?.name?.charAt(0).toUpperCase() || '?'}
        </span>
      )}
    </div>
  );
};

export const QuickAddPlayerButton = ({ player, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition"
    >
      <PlayerAvatar player={player} size="sm" />
      <span className="text-sm font-medium text-gray-700">{player.name}</span>
      <Plus size={16} className="text-gray-400" />
    </button>
  );
};
