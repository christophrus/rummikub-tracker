import { Plus, X } from 'lucide-react';

export const PlayerCard = ({ 
  player, 
  index, 
  onImageUpload, 
  onNameChange, 
  onRemove, 
  onMoveUp, 
  onMoveDown, 
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
  showMoveButtons = true,
  canRemove = true,
  showPlayerNumber = false,
  t
}) => {
  return (
    <div 
      draggable 
      onDragStart={() => onDragStart?.(index)}
      onDragOver={(e) => onDragOver?.(e, index)}
      onDrop={(e) => onDrop?.(e, index)}
      className={`mb-3 transition ${isDragging ? 'opacity-50' : ''}`}
    >
      {/* Mobile layout - stacked */}
      <div className="md:hidden">
        <div className="flex gap-2 mb-2">
          <label className="cursor-pointer flex-shrink-0">
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => onImageUpload?.(index, e.target.files[0])} 
              className="hidden" 
            />
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 flex items-center justify-center overflow-hidden border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 transition">
              {player.image ? (
                <img src={player.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <Plus size={20} className="text-white" />
              )}
            </div>
          </label>
          
          <input 
            type="text" 
            value={player.name} 
            onChange={(e) => onNameChange?.(index, e.target.value)}
            placeholder={`Player ${index + 1}`}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm" 
          />
        </div>

        {/* Delete button - separate row on mobile */}
        {canRemove && (
          <div className="flex gap-2 mb-2">
            <button 
              onClick={() => onRemove?.(index)} 
              className="w-full px-2 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 flex items-center justify-center gap-2 text-sm"
              title="Remove player"
            >
              <X size={18} />
              <span>{t?.('removePlayer') || 'Remove'}</span>
            </button>
          </div>
        )}

        {/* Mobile control buttons - below input */}
        <div className="flex gap-1 mb-3">
          {showMoveButtons && (
            <>
              <button 
                onClick={() => onMoveUp?.(index)} 
                disabled={index === 0}
                className={`flex-1 px-2 py-2 rounded text-xs font-semibold ${index === 0 ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50'}`}
                title="Move Up"
              >
                ▲ Up
              </button>
              <button 
                onClick={() => onMoveDown?.(index)} 
                disabled={index === showPlayerNumber ? undefined : false}
                className={`flex-1 px-2 py-2 rounded text-xs font-semibold ${index === showPlayerNumber ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50'}`}
                title="Move Down"
              >
                Down ▼
              </button>
            </>
          )}
        </div>
      </div>

      {/* Desktop layout - inline */}
      <div className="hidden md:flex gap-2">
        <label className="cursor-pointer">
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => onImageUpload?.(index, e.target.files[0])} 
            className="hidden" 
          />
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden border-2 border-gray-300 hover:border-indigo-500 transition">
            {player.image ? (
              <img src={player.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <Plus size={20} className="text-white" />
            )}
          </div>
        </label>
        
        <input 
          type="text" 
          value={player.name} 
          onChange={(e) => onNameChange?.(index, e.target.value)}
          placeholder={`Player ${index + 1}`}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400" 
        />
        
        {showMoveButtons && (
          <div className="flex flex-col gap-1">
            <button 
              onClick={() => onMoveUp?.(index)} 
              disabled={index === 0}
              className={`px-2 py-1 rounded text-xs ${index === 0 ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50'}`}
              title="Move Up"
            >
              ▲
            </button>
            <button 
              onClick={() => onMoveDown?.(index)} 
              disabled={index === showPlayerNumber ? undefined : false}
              className={`px-2 py-1 rounded text-xs ${index === showPlayerNumber ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50'}`}
              title="Move Down"
            >
              ▼
            </button>
          </div>
        )}
        
        {canRemove && (
          <button 
            onClick={() => onRemove?.(index)} 
            className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  );
};
