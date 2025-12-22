import React, { useState, useRef } from 'react';
import { X, History, Trash2, ChevronDown, ChevronUp, Camera } from 'lucide-react';
import { Trophy } from 'lucide-react';
import { PlayerAvatar } from '../index';

const formatPlayTime = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end - start;

  if (!Number.isFinite(diffMs) || diffMs < 0) return '';

  const totalSeconds = Math.floor(diffMs / 1000);
  const diffHours = Math.floor(totalSeconds / 3600);
  const remainingSecondsAfterHours = totalSeconds % 3600;
  const diffMins = Math.floor(remainingSecondsAfterHours / 60);
  const diffSecs = remainingSecondsAfterHours % 60;

  if (diffHours > 0) {
    return `${diffHours}h ${diffMins}m ${diffSecs}s`;
  }

  if (diffMins > 0) {
    return `${diffMins}m ${diffSecs}s`;
  }

  return `${diffSecs}s`;
};

const getWinnerNames = (game) => {
  if (game?.finalScores && typeof game.finalScores === 'object') {
    const entries = Object.entries(game.finalScores)
      .map(([name, score]) => [name, Number.parseInt(score, 10)])
      .filter(([, score]) => Number.isFinite(score));

    if (entries.length > 0) {
      const minScore = Math.min(...entries.map(([, score]) => score));
      const winners = entries.filter(([, score]) => score === minScore).map(([name]) => name);
      if (winners.length > 0) return winners.join(', ');
    }
  }

  return game?.winner || '';
};

export const GameHistoryView = ({ 
  gameHistory, 
  onClose, 
  onDeleteGame,
  t 
}) => {
  const [expandedGameId, setExpandedGameId] = useState(null);
  const entryRefs = useRef({});

  const toggleGameExpanded = (gameId) => {
    setExpandedGameId(expandedGameId === gameId ? null : gameId);
  };

  const captureScreenshot = async (gameId, gameName) => {
    const element = entryRefs.current[gameId];
    if (!element) return;

    try {
      // Alternative screenshot method: html-to-image (avoids html2canvas color parsing).
      const htmlToImage = await import('html-to-image');

      const isDark = document.documentElement.classList.contains('dark');
      const safeBg = isDark ? '#1f2937' : '#f9fafb';
      const safeText = isDark ? '#f3f4f6' : '#111827';

      const blob = await htmlToImage.toBlob(element, {
        backgroundColor: safeBg,
        pixelRatio: 2,
        cacheBust: true,
        style: {
          backgroundColor: safeBg,
          color: safeText
        }
      });

      if (!blob) {
        throw new Error('Failed to generate screenshot blob');
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${gameName.replace(/[^a-z0-9]/gi, '_')}_stats_${new Date().toISOString().split('T')[0]}.png`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Screenshot failed:', error);
      alert('Screenshot failed. Please try again.');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-gray-100">{t('gameHistory')}</h2>
        <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex-shrink-0"><X size={24} /></button>
      </div>
      {gameHistory.length === 0 ? (
        <div className="text-center py-8 md:py-12 text-gray-500 dark:text-gray-400">
          <History size={40} className="md:size-48 mx-auto mb-3 md:mb-4 opacity-50" />
          <p className="text-sm md:text-base">{t('noGamesPlayed')}</p>
        </div>
      ) : (
        <div className="space-y-2 md:space-y-3">
          {gameHistory.map(game => {
            const isExpanded = expandedGameId === game.id;
            const winnerNames = getWinnerNames(game);
            return (
            <div
              key={game.id}
              ref={el => entryRefs.current[game.id] = el}
              className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden hover:border-indigo-300 dark:hover:border-indigo-500 transition bg-white dark:bg-gray-700"
            >
              <div className="p-2 md:p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm md:text-base truncate">{game.name}</h3>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-0.5 md:mt-1">
                      {new Date(game.startTime).toLocaleDateString()} • {game.rounds.length} {t('rounds')}
                      {game.endTime && (
                        <> • {formatPlayTime(game.startTime, game.endTime)}</>
                      )}
                    </p>
                    <div className="mt-1 md:mt-2 flex items-center gap-1 md:gap-2">
                      <Trophy size={14} className="md:size-4 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                      <span className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">{t('winner')} {winnerNames}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button 
                      onClick={() => toggleGameExpanded(game.id)} 
                      className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 p-1"
                      title={isExpanded ? t('hideDetails') : t('showDetails')}
                    >
                      {isExpanded ? <ChevronUp size={18} className="md:size-5" /> : <ChevronDown size={18} className="md:size-5" />}
                    </button>
                    <button 
                      onClick={() => onDeleteGame(game.id)} 
                      className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1"
                    >
                      <Trash2 size={18} className="md:size-5" />
                    </button>
                  </div>
                </div>
              </div>
              
              {isExpanded && game.rounds.length > 0 && (
                <div 
                  data-game-id={game.id}
                  className="border-t border-gray-200 dark:border-gray-600 p-2 md:p-4 bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <h4 className="text-sm md:text-base font-bold text-gray-800 dark:text-gray-100">{t('scoreSummary')}</h4>
                    <button
                      onClick={() => captureScreenshot(game.id, game.name)}
                      className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition text-xs md:text-sm font-semibold"
                      title={t('takeScreenshot') || 'Take Screenshot'}
                    >
                      <Camera size={14} className="md:size-4" />
                      <span className="hidden sm:inline">{t('screenshot') || 'Screenshot'}</span>
                    </button>
                  </div>
                  <div className="overflow-x-auto -mx-2 md:mx-0">
                    <div className="inline-block min-w-full align-middle px-2 md:px-0">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-200 dark:border-gray-600">
                            <th className="text-left py-2 px-1 md:px-2 text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 sticky left-0 bg-gray-50 dark:bg-gray-800">{t('round')}</th>
                            {game.players.map((p, idx) => (
                              <th key={idx} className="text-center py-2 px-1 md:px-2 text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300">
                                <div className="flex flex-col items-center gap-1">
                                  <PlayerAvatar player={p} size="sm" />
                                  <span className="text-xs truncate max-w-[60px] md:max-w-none">{p.name}</span>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {game.rounds.map((round, idx) => {
                            // Find the winner of this round (lowest score)
                            const roundScores = game.players.map(p => ({
                              name: p.name,
                              score: parseInt(round.scores[p.name]) || 0
                            }));
                            const minScore = Math.min(...roundScores.map(rs => rs.score));
                            const roundWinners = roundScores.filter(rs => rs.score === minScore).map(rs => rs.name);
                            
                            return (
                            <tr key={idx} className="border-b border-gray-100 dark:border-gray-700">
                              <td className="py-2 px-1 md:px-2 text-xs md:text-sm text-gray-600 dark:text-gray-400 sticky left-0 bg-gray-50 dark:bg-gray-800">{round.round}</td>
                              {game.players.map((p, pIdx) => {
                                const isRoundWinner = roundWinners.includes(p.name);
                                return (
                                <td key={pIdx} className={`text-center py-2 px-1 md:px-2 text-xs md:text-sm ${isRoundWinner ? 'text-green-700 dark:text-green-400 font-semibold' : 'text-gray-800 dark:text-gray-300'}`}>
                                  <div className="flex items-center justify-center gap-1">
                                    {isRoundWinner && <Trophy size={12} className="text-yellow-600 dark:text-yellow-500 flex-shrink-0" />}
                                    <span>{round.scores[p.name] || 0}</span>
                                  </div>
                                </td>
                                );
                              })}
                            </tr>
                            );
                          })}
                          <tr className="bg-indigo-50 dark:bg-indigo-900/30 font-bold">
                            <td className="py-2 px-1 md:px-2 text-xs md:text-sm sticky left-0 bg-indigo-50 dark:bg-indigo-900/30 dark:text-gray-200">{t('total')}</td>
                            {game.players.map((p, pIdx) => {
                              const isWinner = game.winner === p.name;
                              return (
                              <td key={pIdx} className={`text-center py-2 px-1 md:px-2 text-xs md:text-sm ${isWinner ? 'text-green-700 dark:text-green-400' : 'text-indigo-900 dark:text-indigo-200'}`}>
                                {game.rounds.reduce((s, r) => s + (parseInt(r.scores[p.name]) || 0), 0)}
                              </td>
                              );
                            })}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
