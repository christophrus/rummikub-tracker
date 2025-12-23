import React from 'react';
import { X, Play, Pause, RotateCcw, Check, Plus, SkipForward, Trophy } from 'lucide-react';
import { AnalogClock, Confetti, PlayerAvatar } from '../index';

export const ActiveGameView = ({ 
  activeGame,
  currentPlayerIndex,
  timerSeconds,
  timerDuration,
  timerActive,
  currentRound,
  gameElapsedTime,
  roundScores,
  playerExtensions,
  draggedGamePlayerIndex,
  declaredWinner,
  onClose,
  onNextPlayer,
  onPause,
  onResume,
  onResetTimer,
  onExtendTimer,
  onUpdateTimerDuration,
  onUpdateRoundScore,
  onUpdatePastScore,
  onSaveRound,
  onEndGame,
  onDeclareWinner,
  onCancelWinner,
  onMovePlayerUp,
  onMovePlayerDown,
  onDragStart,
  onDragOver,
  onDrop,
  t
}) => {
  const [editingCell, setEditingCell] = React.useState(null);
  const currentPlayer = activeGame.players[currentPlayerIndex];
  const playerExtensionsUsed = playerExtensions[currentPlayer?.name] || 0;
  const canExtend = playerExtensionsUsed < (activeGame.maxExtensions || 3) && (activeGame.maxExtensions || 3) > 0;
  const allScoresEntered = activeGame.players.every(p => roundScores[p.name] !== undefined && roundScores[p.name] !== '');

  const handleCloseClick = () => {
    if (declaredWinner) {
      onCancelWinner();
    } else {
      onClose();
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 min-w-0 mr-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 truncate">{activeGame.name}</h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {t('round')} {currentRound}
              {gameElapsedTime && (
                <span className="ml-2 opacity-75">• {gameElapsedTime}</span>
              )}
            </p>
          </div>
          <button 
            onClick={handleCloseClick}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex-shrink-0"
          >
            <X size={24} />
          </button>
        </div>

        {declaredWinner && (
          <>
          <Confetti active={true} />
          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-lg p-4 sm:p-6 mb-4 text-white animate-pulse">
            <div className="flex flex-col items-center gap-4">
              <Trophy size={56} className="text-white drop-shadow-lg" />
              <div className="text-center">
                <p className="text-xl sm:text-3xl font-bold mb-4">{t('roundWinner')}</p>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 flex items-center justify-center overflow-hidden border-4 border-white shadow-2xl">
                    {declaredWinner?.image ? (
                      <img src={declaredWinner.image} alt={declaredWinner.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl sm:text-6xl font-bold text-white">
                        {declaredWinner?.name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  <p className="text-2xl sm:text-4xl font-bold">{declaredWinner.name}</p>
                </div>
              </div>
            </div>
          </div>
          </>
        )}

        {!declaredWinner && currentPlayer && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 rounded-lg p-2 sm:p-4 mb-4 text-white">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 sm:gap-4">
                <PlayerAvatar player={currentPlayer} size="lg" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs opacity-90 mb-0.5">{t('currentTurn')}</p>
                  <p className="text-base sm:text-2xl font-bold truncate">{currentPlayer.name}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={onDeclareWinner}
                  className="flex-1 bg-yellow-400 text-yellow-900 py-4 rounded-lg flex items-center justify-center transition hover:bg-yellow-300 font-semibold shadow"
                  title={t('declareWinner')}
                >
                  <Trophy size={20} />
                </button>
                <button 
                  onClick={onNextPlayer}
                  className="flex-1 bg-white dark:bg-gray-100 text-indigo-600 dark:text-indigo-700 py-4 rounded-lg flex items-center justify-center transition hover:bg-indigo-50 dark:hover:bg-gray-200 font-semibold shadow"
                  title={t('nextPlayer')}
                >
                  <SkipForward size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {!declaredWinner && (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg p-4 sm:p-6 shadow-inner">
            <div className="flex flex-col items-center">
              <AnalogClock seconds={timerSeconds} duration={timerDuration} isActive={timerActive} t={t} onClick={onNextPlayer} />
              
              <div className="mt-4 w-full">
                <button 
                  onClick={onExtendTimer} 
                  disabled={!canExtend}
                  className={`w-full px-3 sm:px-4 py-3 sm:py-4.5 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-sm sm:text-base ${
                    canExtend ? 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600' : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  } ${canExtend && timerSeconds <= 15 && timerActive ? 'pulsate-urgent' : ''}`}
                >
                  <Plus size={20} />
                  <span className="truncate">{t('addSeconds')} ({(activeGame.maxExtensions || 3) - playerExtensionsUsed} {t('left')})</span>
                </button>
              </div>
              
              <div className="flex gap-2 mt-4 flex-wrap justify-center">
              {timerActive ? (
                <button 
                  onClick={onPause}
                  className="p-5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition flex items-center justify-center font-semibold shadow-lg"
                  title={t('pause')}
                >
                  <Pause size={30} />
                </button>
              ) : (
                <button 
                  onClick={onResume}
                  className="p-5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center font-semibold shadow-lg"
                  title={t('resume')}
                >
                  <Play size={30} />
                </button>
              )}
              <button 
                onClick={onResetTimer}
                className="p-5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center justify-center font-semibold shadow-lg"
                title={t('reset')}
              >
                <RotateCcw size={30} />
              </button>
            </div>

            <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
              <label className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">{t('duration')}</label>
              <select 
                value={timerDuration} 
                onChange={(e) => onUpdateTimerDuration(Number(e.target.value))}
                className="text-xs sm:text-sm px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 dark:text-gray-100"
              >
                <option value={30}>30 {t('seconds')}</option>
                <option value={45}>45 {t('seconds')}</option>
                <option value={60}>1 {t('minute')}</option>
                <option value={90}>1.5 {t('minutes')}</option>
                <option value={120}>2 {t('minutes')}</option>
                <option value={180}>3 {t('minutes')}</option>
                <option value={300}>5 {t('minutes')}</option>
              </select>
            </div>
          </div>
        </div>
        )}

        {!declaredWinner && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {activeGame.players.map((player, idx) => (
            <div 
              key={idx}
              draggable
              onDragStart={() => onDragStart?.(idx)}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop?.(e, idx)}
              className={`p-2 rounded-lg border-2 transition ${
                idx === currentPlayerIndex ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-400' : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
              } ${draggedGamePlayerIndex === idx ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-0.5">
                  <button 
                    onClick={() => onMovePlayerUp?.(idx)} 
                    disabled={idx === 0}
                    className={`w-5 h-4 sm:w-6 sm:h-5 rounded text-xs leading-none ${idx === 0 ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' : 'bg-indigo-500 dark:bg-indigo-600 text-white hover:bg-indigo-600 dark:hover:bg-indigo-700'}`}
                    title={t('moveUp')}
                  >
                    ▲
                  </button>
                  <button 
                    onClick={() => onMovePlayerDown?.(idx)} 
                    disabled={idx === activeGame.players.length - 1}
                    className={`w-5 h-4 sm:w-6 sm:h-5 rounded text-xs leading-none ${idx === activeGame.players.length - 1 ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' : 'bg-indigo-500 dark:bg-indigo-600 text-white hover:bg-indigo-600 dark:hover:bg-indigo-700'}`}
                    title={t('moveDown')}
                  >
                    ▼
                  </button>
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                <PlayerAvatar player={player} size="md" />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs sm:text-sm font-semibold truncate ${idx === currentPlayerIndex ? 'text-indigo-900 dark:text-indigo-200' : 'text-gray-700 dark:text-gray-300'}`}>
                    {player.name}
                  </p>
                  {activeGame.rounds.length > 0 && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {t('score')} {activeGame.rounds.reduce((s, r) => s + (parseInt(r.scores[player.name]) || 0), 0)}
                    </p>
                  )}
                  {activeGame.maxExtensions > 0 && (
                    <p className="text-xs text-blue-600 dark:text-blue-400">{playerExtensions[player.name] || 0}/{activeGame.maxExtensions}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          ))}
        </div>
        )}
      </div>

      {declaredWinner && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">{t('enterRoundScores', { round: currentRound })}</h3>
          <div className="space-y-3">
            {activeGame.players.map((player, idx) => {
              const isWinner = declaredWinner && player.name === declaredWinner.name;
              return (
              <div key={idx} className="flex items-center gap-2 sm:gap-3">
                <PlayerAvatar player={player} size="md" />
                <label className="flex-1 text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium truncate">{player.name}</label>
                <input 
                  type="number" 
                  value={roundScores[player.name] || ''} 
                  onChange={(e) => onUpdateRoundScore(player, e.target.value)}
                  placeholder="0" 
                  className={`w-16 sm:w-24 px-2 sm:px-4 py-2 border rounded-lg text-center text-sm sm:text-base ${
                    isWinner 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/30 dark:border-green-400 text-green-700 dark:text-green-300 font-bold' 
                      : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400'
                  }`} 
                />
              </div>
              );
            })}
          </div>
          <button 
            onClick={onSaveRound}
            disabled={!allScoresEntered}
            className={`w-full py-2 sm:py-3 rounded-lg font-semibold transition mt-4 flex items-center justify-center gap-2 text-sm sm:text-base ${
              allScoresEntered 
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600' 
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            <Check size={20} />
            {t('saveRound')}
          </button>
        </div>
      )}

      {activeGame.rounds.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">{t('scoreSummary')}</h3>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-600">
                    <th className="text-left py-2 px-1 sm:px-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-800">{t('round')}</th>
                    {activeGame.players.map((p, idx) => (
                      <th key={idx} className="text-center py-2 px-1 sm:px-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <div className="flex flex-col items-center gap-1">
                          <PlayerAvatar player={p} size="sm" />
                          <span className="text-xs truncate max-w-[60px] sm:max-w-none">{p.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeGame.rounds.map((round, idx) => (
                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-2 px-1 sm:px-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 sticky left-0 bg-white dark:bg-gray-800">{round.round}</td>
                      {activeGame.players.map((p, pIdx) => {
                        const isEditing = editingCell?.roundIndex === idx && editingCell?.playerName === p.name;
                        return (
                          <td key={pIdx} className="text-center py-2 px-1 sm:px-2">
                            {isEditing ? (
                              <input
                                type="number"
                                value={round.scores[p.name] || 0}
                                onChange={(e) => onUpdatePastScore?.(idx, p.name, e.target.value)}
                                onBlur={() => setEditingCell(null)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') setEditingCell(null);
                                  if (e.key === 'Escape') setEditingCell(null);
                                }}
                                autoFocus
                                className="w-12 sm:w-16 px-1 sm:px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center text-xs sm:text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                              />
                            ) : (
                              <div
                                onClick={() => setEditingCell({ roundIndex: idx, playerName: p.name })}
                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 rounded px-1 py-1 text-xs sm:text-sm text-gray-800 dark:text-gray-300"
                              >
                                {round.scores[p.name] || 0}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="bg-indigo-50 dark:bg-indigo-900/30 font-bold">
                    <td className="py-2 px-1 sm:px-2 text-xs sm:text-sm sticky left-0 bg-indigo-50 dark:bg-indigo-900/30 dark:text-gray-200">{t('total')}</td>
                    {activeGame.players.map((p, pIdx) => (
                      <td key={pIdx} className="text-center py-2 px-1 sm:px-2 text-xs sm:text-sm text-indigo-900 dark:text-indigo-200">
                        {activeGame.rounds.reduce((s, r) => s + (parseInt(r.scores[p.name]) || 0), 0)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <button 
            onClick={onEndGame}
            className="w-full bg-green-600 dark:bg-green-500 text-white py-2 sm:py-3 rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-green-600 transition mt-4 text-sm sm:text-base"
          >
            {t('endGame')}
          </button>
        </div>
      )}
    </div>
  );
};
