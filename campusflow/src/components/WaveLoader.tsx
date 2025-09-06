import React from 'react';

interface WaveLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
}

const WaveLoader: React.FC<WaveLoaderProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-1 h-4',
    md: 'w-1 h-6',
    lg: 'w-1 h-8',
    xl: 'w-1 h-10',
  };

  const colorClasses = {
    primary: 'bg-primary',
    white: 'bg-white',
    gray: 'bg-gray-400',
  };

  return (
    <div className={`flex items-end space-x-1 ${className}`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-pulse`}
          style={{
            animationDelay: `${index * 0.1}s`,
            animationDuration: '1.2s',
          }}
        ></div>
      ))}
    </div>
  );
};

export default WaveLoader;
