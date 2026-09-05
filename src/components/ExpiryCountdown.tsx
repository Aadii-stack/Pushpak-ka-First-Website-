'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface Props {
  expiryAt: string;
  preparedAt?: string;
  compact?: boolean;
}

export default function ExpiryCountdown({ expiryAt, preparedAt, compact = false }: Props) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isExpired: boolean }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = Date.now();
      const expiry = new Date(expiryAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [expiryAt]);

  if (timeLeft.isExpired) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-alert-subtle text-accent-alert border border-accent-alert/30">
        <AlertTriangle className="w-3.5 h-3.5" />
        Safe window passed
      </span>
    );
  }

  // Critical: < 2 hours (muted rust red)
  const isCritical = timeLeft.hours < 2;
  // Warning: < 4 hours (warm marigold)
  const isWarning = timeLeft.hours < 4;

  const colorClasses = isCritical
    ? 'bg-accent-alert-subtle text-accent-alert border-accent-alert/40'
    : isWarning
    ? 'bg-accent-primary-subtle text-accent-primary-hover border-accent-primary/40'
    : 'bg-accent-trust-subtle text-accent-trust border-accent-trust/30';

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-md shadow-xs ${colorClasses}`}>
        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="tabular-nums font-semibold">
          {timeLeft.hours > 0 ? `${timeLeft.hours}h ` : ''}
          {timeLeft.minutes}m left
        </span>
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border text-xs font-medium backdrop-blur-md shadow-xs ${colorClasses}`}>
      <Clock className="w-4 h-4 flex-shrink-0" />
      <span>Safe for:</span>
      <span className="tabular-nums font-bold tracking-normal">
        {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
      </span>
    </div>
  );
}
