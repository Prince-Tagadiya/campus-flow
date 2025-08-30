'use client';

import { ProgressStats } from '@/types';
import { BarChart3, CheckCircle, Clock, Target } from 'lucide-react';

interface ProgressCardProps {
  stats: ProgressStats;
}

export function ProgressCard({ stats }: ProgressCardProps) {
  const completionPercentage =
    stats.total > 0 ? (stats.submitted / stats.total) * 100 : 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset =
    circumference - (completionPercentage / 100) * circumference;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Progress Tracker
        </h3>
        <BarChart3 className="h-6 w-6 text-gray-400" />
      </div>

      {/* Circular Progress Chart */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            {/* Background Circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Progress Circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="#f97316"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {completionPercentage.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-500">Complete</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Stats */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-800">
              Submitted
            </span>
          </div>
          <span className="text-lg font-bold text-green-600">
            {stats.submitted}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-orange-600 mr-2" />
            <span className="text-sm font-medium text-orange-800">Pending</span>
          </div>
          <span className="text-lg font-bold text-orange-600">
            {stats.pending}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <Target className="h-5 w-5 text-gray-600 mr-2" />
            <span className="text-sm font-medium text-gray-800">Total</span>
          </div>
          <span className="text-lg font-bold text-gray-600">{stats.total}</span>
        </div>
      </div>

      {/* Progress Message */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-blue-800">
          {completionPercentage === 100 ? (
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              <span className="font-medium">🎉 All assignments completed!</span>
            </div>
          ) : completionPercentage >= 75 ? (
            <div className="flex items-center">
              <Target className="h-4 w-4 mr-2 text-orange-600" />
              <span className="font-medium">Great progress! Almost there!</span>
            </div>
          ) : completionPercentage >= 50 ? (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-blue-600" />
              <span className="font-medium">Good start! Keep going!</span>
            </div>
          ) : (
            <div className="flex items-center">
              <Target className="h-4 w-4 mr-2 text-gray-600" />
              <span className="font-medium">Let's get started!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
