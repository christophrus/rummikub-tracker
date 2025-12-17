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
  showPlayerNumber = false
}) => {
  return (
    <div 
      draggable 
      onDragStart={() => onDragStart?.(index)}
      onDragOver={(e) => onDragOver?.(e, index)}
      onDrop={(e) => onDrop?.(e, index)}
      className={`flex gap-2 mb-3 transition ${isDragging ? 'opacity-50' : ''}`}
    >
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
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" 
      />
      
      {showMoveButtons && (
        <div className="flex flex-col gap-1">
          <button 
            onClick={() => onMoveUp?.(index)} 
            disabled={index === 0}
            className={`px-2 py-1 rounded ${index === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'}`}
            title="Move Up"
          >
            ▲
          </button>
          <button 
            onClick={() => onMoveDown?.(index)} 
            disabled={index === showPlayerNumber ? undefined : false}
            className={`px-2 py-1 rounded ${index === showPlayerNumber ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'}`}
            title="Move Down"
          >
            ▼
          </button>
        </div>
      )}
      
      {canRemove && (
        <button 
          onClick={() => onRemove?.(index)} 
          className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
};
