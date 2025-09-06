import React, { Suspense, lazy, ComponentType } from 'react';
import SkeletonLoader from './SkeletonLoader';
import AnimatedLoader from './AnimatedLoader';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: 'skeleton' | 'spinner' | 'wave' | 'campus' | 'custom';
  skeletonType?: 'text' | 'card' | 'avatar' | 'button' | 'custom';
  skeletonLines?: number;
  customFallback?: React.ReactNode;
  className?: string;
}

const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback = 'skeleton',
  skeletonType = 'card',
  skeletonLines = 3,
  customFallback,
  className = '',
}) => {
  const renderFallback = () => {
    if (customFallback) return customFallback;
    
    switch (fallback) {
      case 'skeleton':
        return (
          <div className={className}>
            <SkeletonLoader type={skeletonType} lines={skeletonLines} />
          </div>
        );
      case 'spinner':
        return <AnimatedLoader type="spinner" text="Loading..." className={className} />;
      case 'wave':
        return <AnimatedLoader type="wave" text="Loading..." className={className} />;
      case 'campus':
        return <AnimatedLoader type="campus" text="Loading CampusFlow..." className={className} />;
      default:
        return <AnimatedLoader type="campus" text="Loading CampusFlow..." className={className} />;
    }
  };

  return (
    <Suspense fallback={renderFallback()}>
      {children}
    </Suspense>
  );
};

// Higher-order component for lazy loading
export const withLazyLoading = <P extends object>(
  Component: ComponentType<P>,
  fallback: LazyWrapperProps['fallback'] = 'skeleton',
  skeletonType: LazyWrapperProps['skeletonType'] = 'card'
) => {
  return (props: P) => (
    <LazyWrapper fallback={fallback} skeletonType={skeletonType}>
      <Component {...props} />
    </LazyWrapper>
  );
};

export default LazyWrapper;
