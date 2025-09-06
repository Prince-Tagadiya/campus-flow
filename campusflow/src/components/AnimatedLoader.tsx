import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import WaveLoader from './WaveLoader';
import PulseLoader from './PulseLoader';

interface AnimatedLoaderProps {
  type?: 'spinner' | 'wave' | 'pulse' | 'campus' | 'dots';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
}

const AnimatedLoader: React.FC<AnimatedLoaderProps> = ({
  type = 'campus',
  size = 'lg',
  text = 'Loading CampusFlow...',
  className = '',
}) => {
  const renderLoader = () => {
    switch (type) {
      case 'spinner':
        return <LoadingSpinner size={size} text={text} className={className} />;
      
      case 'wave':
        return (
          <div className={`flex flex-col items-center ${className}`}>
            <WaveLoader size={size} />
            {text && <p className="mt-4 text-gray-600 font-medium">{text}</p>}
          </div>
        );
      
      case 'pulse':
        return (
          <div className={`flex flex-col items-center ${className}`}>
            <PulseLoader />
            {text && <p className="mt-4 text-gray-600 font-medium">{text}</p>}
          </div>
        );
      
      case 'dots':
        return (
          <div className={`flex flex-col items-center ${className}`}>
            <div className="flex space-x-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="w-3 h-3 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: `${index * 0.1}s` }}
                ></div>
              ))}
            </div>
            {text && <p className="mt-4 text-gray-600 font-medium">{text}</p>}
          </div>
        );
      
      case 'campus':
      default:
        return (
          <div className={`flex flex-col items-center justify-center ${className}`}>
            {/* CampusFlow Logo Animation */}
            <div className="relative mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-primary to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
                <span className="text-white font-bold text-3xl">C</span>
              </div>
              {/* Floating particles */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-orange-300 rounded-full animate-bounce"></div>
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute top-1/2 -left-3 w-2 h-2 bg-orange-200 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
            </div>
            
            {/* Animated text */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 animate-pulse">
                CampusFlow
              </h2>
              <p className="text-gray-600 mb-6">{text}</p>
              
              {/* Progress bar */}
              <div className="w-64 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-orange-600 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-200 rounded-full animate-ping"></div>
              <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-orange-300 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-orange-400 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
      {renderLoader()}
    </div>
  );
};

export default AnimatedLoader;
