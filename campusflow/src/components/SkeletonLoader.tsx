import React from 'react';

interface SkeletonLoaderProps {
  type?: 'text' | 'card' | 'avatar' | 'button' | 'custom';
  lines?: number;
  className?: string;
  children?: React.ReactNode;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'text',
  lines = 1,
  className = '',
  children,
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'text':
        return (
          <div className="space-y-2">
            {Array.from({ length: lines }).map((_, index) => (
              <div
                key={index}
                className={`h-4 bg-gray-200 rounded animate-pulse ${
                  index === lines - 1 ? 'w-3/4' : 'w-full'
                }`}
              ></div>
            ))}
          </div>
        );

      case 'card':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 animate-pulse">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        );

      case 'avatar':
        return (
          <div className="flex items-center space-x-3 animate-pulse">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        );

      case 'button':
        return (
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-24"></div>
        );

      case 'custom':
        return children;

      default:
        return null;
    }
  };

  return (
    <div className={`${className}`}>
      {renderSkeleton()}
    </div>
  );
};

export default SkeletonLoader;
