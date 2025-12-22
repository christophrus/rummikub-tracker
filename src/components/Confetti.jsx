import { useMemo } from 'react';

const CONFETTI_COLORS = [
  '#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3',
  '#ff69b4', '#ffd700', '#00ffff', '#ff1493', '#7fff00'
];

const CONFETTI_COUNT = 100;

const randomBetween = (min, max) => Math.random() * (max - min) + min;

const createConfettiPiece = (index) => ({
  id: index,
  x: randomBetween(0, 100),
  delay: randomBetween(0, 3),
  duration: randomBetween(3, 6),
  color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
  size: randomBetween(8, 14),
  rotation: randomBetween(0, 360),
  shape: Math.random() > 0.5 ? 'square' : 'circle',
  swayDuration: randomBetween(1, 2)
});

export const Confetti = ({ active }) => {
  const pieces = useMemo(() => {
    if (!active) return [];
    return Array.from({ length: CONFETTI_COUNT }, (_, i) => createConfettiPiece(i));
  }, [active]);

  if (!active || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes confetti-sway {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(30px);
          }
        }
        .confetti-piece {
          position: absolute;
          top: -20px;
          animation: confetti-fall linear forwards;
        }
        .confetti-inner {
          animation: confetti-sway ease-in-out infinite;
        }
      `}</style>
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.x}%`,
            animationDuration: `${piece.duration}s`,
            animationDelay: `${piece.delay}s`,
          }}
        >
          <div
            className="confetti-inner"
            style={{
              width: `${piece.size}px`,
              height: piece.shape === 'circle' ? `${piece.size}px` : `${piece.size * 0.6}px`,
              backgroundColor: piece.color,
              borderRadius: piece.shape === 'circle' ? '50%' : '2px',
              transform: `rotate(${piece.rotation}deg)`,
              animationDuration: `${piece.swayDuration}s`,
            }}
          />
        </div>
      ))}
    </div>
  );
};
