import { useState, useEffect } from 'react';

export const useTimer = (timerDuration, onTimeUp, isActive) => {
  const [timerSeconds, setTimerSeconds] = useState(timerDuration);

  useEffect(() => {
    let interval;
    if (isActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          const newValue = prev - 1;
          if (newValue <= 0) {
            onTimeUp();
            return timerDuration;
          }
          return newValue;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timerSeconds, timerDuration, onTimeUp]);

  const resetTimer = () => {
    setTimerSeconds(timerDuration);
  };

  const updateDuration = (newDuration) => {
    setTimerSeconds(newDuration);
  };

  return {
    timerSeconds,
    setTimerSeconds,
    resetTimer,
    updateDuration
  };
};
