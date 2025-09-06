import React from 'react';

interface PulseLoaderProps {
  count?: number;
  className?: string;
}

const PulseLoader: React.FC<PulseLoaderProps> = ({
  count = 3,
  className = '',
}) => {
  return (
    <div className={`flex space-x-2 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="w-3 h-3 bg-primary rounded-full animate-pulse"
          style={{
            animationDelay: `${index * 0.2}s`,
            animationDuration: '1.4s',
          }}
        ></div>
      ))}
    </div>
  );
};

export default PulseLoader;
