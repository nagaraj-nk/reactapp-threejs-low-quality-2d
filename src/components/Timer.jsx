import { useState, useEffect } from 'react';
import { formatTime } from '../utils/quizUtils';
import { TIMER_WARNING_THRESHOLD, TIMER_CRITICAL_THRESHOLD } from '../constants/quizConstants';

const Timer = ({ timeLimit, onTimeout, startTime }) => {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!startTime || !timeLimit) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = timeLimit * 60 - elapsed;

      setTimeRemaining(remaining);

      if (remaining <= 0 && !isExpired) {
        setIsExpired(true);
        if (onTimeout) {
          onTimeout();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, timeLimit, onTimeout, isExpired]);

  const isNegative = timeRemaining < 0;
  const isWarning = timeRemaining <= TIMER_WARNING_THRESHOLD && timeRemaining > TIMER_CRITICAL_THRESHOLD;
  const isCritical = timeRemaining <= TIMER_CRITICAL_THRESHOLD && timeRemaining > 0;

  const colorClass = isCritical
    ? 'text-red-600 dark:text-red-400'
    : isWarning
    ? 'text-amber-600 dark:text-amber-400'
    : isNegative
    ? 'text-red-600 dark:text-red-400'
    : 'text-gray-700 dark:text-gray-300';

  return (
    <div
      className={`text-lg font-mono font-bold ${colorClass} ${
        isCritical ? 'animate-pulse' : ''
      }`}
    >
      {formatTime(timeRemaining)}
    </div>
  );
};

export default Timer;
