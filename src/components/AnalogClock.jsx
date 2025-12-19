import { TIMER_LOW_TIME, TIMER_WARNING_TIME } from '../constants';
import { formatTime } from '../utils';

export const AnalogClock = ({ seconds, duration, isActive, t }) => {
  const percentage = seconds / duration;
  const angle = percentage * 360 - 90;
  const isLowTime = seconds <= TIMER_LOW_TIME;
  const isWarningTime = seconds <= TIMER_WARNING_TIME && seconds > TIMER_LOW_TIME;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage);
  const handLength = 70;
  const handX = 100 + handLength * Math.cos((angle * Math.PI) / 180);
  const handY = 100 + handLength * Math.sin((angle * Math.PI) / 180);
  
  return (
    <div className="relative">
      <svg width="240" height="240" viewBox="0 0 200 200" className="mx-auto">
        <circle cx="100" cy="100" r="95" fill="white" stroke="#e5e7eb" strokeWidth="2" />
        {[...Array(12)].map((_, i) => {
          const tickAngle = (i * 30 - 90) * (Math.PI / 180);
          const x1 = 100 + 85 * Math.cos(tickAngle);
          const y1 = 100 + 85 * Math.sin(tickAngle);
          const x2 = 100 + 92 * Math.cos(tickAngle);
          const y2 = 100 + 92 * Math.sin(tickAngle);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#9ca3af" strokeWidth="2" />;
        })}
        <circle cx="100" cy="100" r={radius} fill="none"
          stroke={isLowTime ? '#ef4444' : isWarningTime ? '#f59e0b' : '#6366f1'}
          strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 100 100)"
          style={{ filter: isLowTime ? 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.5))' : 'none' }}
        />
        <circle cx="100" cy="100" r="8" fill="#1f2937" />
        <line x1="100" y1="100" x2={handX} y2={handY} stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
        <text x="100" y="140" textAnchor="middle"
          className={`font-mono font-bold ${isLowTime ? 'fill-red-600' : isWarningTime ? 'fill-yellow-600' : 'fill-gray-800'}`}
          style={{ fontSize: '20px' }}>
          {formatTime(seconds)}
        </text>
        {!isActive && <text x="100" y="160" textAnchor="middle" className="fill-yellow-600" style={{ fontSize: '12px' }}>{t('paused')}</text>}
      </svg>
    </div>
  );
};
