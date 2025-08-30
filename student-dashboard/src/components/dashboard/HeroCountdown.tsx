'use client';

import { useState, useEffect } from 'react';
import { Assignment } from '@/types';
import { Clock, AlertTriangle } from 'lucide-react';

interface HeroCountdownProps {
  assignment?: Assignment;
}

export function HeroCountdown({ assignment }: HeroCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!assignment) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const dueDate = assignment.dueDate.getTime();
      const difference = dueDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [assignment]);

  if (!assignment) {
    return (
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-center text-white">
        <div className="flex items-center justify-center mb-4">
          <Clock className="h-12 w-12 mr-3" />
          <h2 className="text-3xl font-bold">No Upcoming Deadlines</h2>
        </div>
        <p className="text-xl opacity-90">You&apos;re all caught up! 🎉</p>
      </div>
    );
  }

  const isOverdue = assignment.dueDate < new Date();
  const isUrgent = timeLeft.days <= 1 && timeLeft.hours <= 12;

  return (
    <div
      className={`rounded-2xl p-8 text-center text-white ${
        isOverdue
          ? 'bg-gradient-to-r from-red-500 to-red-600'
          : isUrgent
          ? 'bg-gradient-to-r from-orange-500 to-orange-600 animate-pulse'
          : 'bg-gradient-to-r from-orange-500 to-orange-600'
      }`}
    >
      <div className="flex items-center justify-center mb-6">
        {isOverdue ? (
          <AlertTriangle className="h-12 w-12 mr-3" />
        ) : (
          <Clock className="h-12 w-12 mr-3" />
        )}
        <h2 className="text-4xl font-bold">
          {isOverdue ? 'Overdue!' : `${assignment.title}`}
        </h2>
      </div>

      {!isOverdue && (
        <p className="text-2xl mb-8 opacity-90">
          Due in {timeLeft.days} days, {timeLeft.hours} hours,{' '}
          {timeLeft.minutes} minutes
        </p>
      )}

      {isOverdue && (
        <p className="text-2xl mb-8 opacity-90">
          Overdue by {Math.abs(timeLeft.days)} days, {Math.abs(timeLeft.hours)}{' '}
          hours
        </p>
      )}

      {/* Countdown Timer */}
      <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
        <div className="bg-white bg-opacity-20 rounded-lg p-4">
          <div className="text-3xl font-bold">{Math.abs(timeLeft.days)}</div>
          <div className="text-sm opacity-90">Days</div>
        </div>
        <div className="bg-white bg-opacity-20 rounded-lg p-4">
          <div className="text-3xl font-bold">{Math.abs(timeLeft.hours)}</div>
          <div className="text-sm opacity-90">Hours</div>
        </div>
        <div className="bg-white bg-opacity-20 rounded-lg p-4">
          <div className="text-3xl font-bold">{Math.abs(timeLeft.minutes)}</div>
          <div className="text-sm opacity-90">Minutes</div>
        </div>
        <div className="bg-white bg-opacity-20 rounded-lg p-4">
          <div className="text-3xl font-bold">{Math.abs(timeLeft.seconds)}</div>
          <div className="text-sm opacity-90">Seconds</div>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-lg opacity-90">
          {isOverdue
            ? 'Please submit as soon as possible'
            : isUrgent
            ? '⚠️ Deadline approaching fast!'
            : 'You have plenty of time to complete this assignment'}
        </p>
      </div>
    </div>
  );
}
