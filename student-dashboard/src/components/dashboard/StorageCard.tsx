'use client';

import { StorageUsage } from '@/types';
import { HardDrive, AlertTriangle } from 'lucide-react';

interface StorageCardProps {
  storage: StorageUsage;
}

export function StorageCard({ storage }: StorageCardProps) {
  const usagePercentage = (storage.used / storage.total) * 100;
  const isNearLimit = usagePercentage >= 80;
  const isOverLimit = usagePercentage >= 100;

  const getProgressColor = () => {
    if (isOverLimit) return 'bg-red-500';
    if (isNearLimit) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getAlertMessage = () => {
    if (isOverLimit) return 'Storage limit exceeded!';
    if (isNearLimit) return 'Storage almost full!';
    return 'Storage usage is normal';
  };

  const getAlertIcon = () => {
    if (isOverLimit || isNearLimit)
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    return <HardDrive className="h-5 w-5 text-green-500" />;
  };

  const getAlertClass = () => {
    if (isOverLimit) return 'bg-red-50 border-red-200 text-red-800';
    if (isNearLimit) return 'bg-orange-50 border-orange-200 text-orange-800';
    return 'bg-green-50 border-green-200 text-green-800';
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Storage Usage</h3>
        <HardDrive className="h-6 w-6 text-gray-400" />
      </div>

      {/* Storage Info */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Used Space</span>
          <span className="text-sm font-medium text-gray-900">
            {storage.used} / {storage.total} {storage.unit}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>

        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500">0 {storage.unit}</span>
          <span className="text-xs text-gray-500">
            {storage.total} {storage.unit}
          </span>
        </div>
      </div>

      {/* Usage Percentage */}
      <div className="text-center mb-4">
        <div
          className={`text-2xl font-bold ${
            isOverLimit
              ? 'text-red-600'
              : isNearLimit
              ? 'text-orange-600'
              : 'text-green-600'
          }`}
        >
          {usagePercentage.toFixed(1)}%
        </div>
        <div className="text-sm text-gray-500">of total storage used</div>
      </div>

      {/* Alert Message */}
      <div className={`p-3 rounded-lg border ${getAlertClass()}`}>
        <div className="flex items-center">
          {getAlertIcon()}
          <span className="ml-2 text-sm font-medium">{getAlertMessage()}</span>
        </div>
      </div>

      {/* Storage Tips */}
      {isNearLimit && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-800">
            <div className="font-medium mb-1">💡 Storage Tips:</div>
            <ul className="text-xs space-y-1">
              <li>• Delete old assignments you no longer need</li>
              <li>• Compress large PDF files before uploading</li>
              <li>• Consider upgrading your storage plan</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
