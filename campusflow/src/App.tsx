import React, { Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AnimatedLoader from './components/AnimatedLoader';
import LazyWrapper from './components/LazyWrapper';

// Lazy load components for better performance
const LandingPage = lazy(() => import('./components/LandingPage'));
const StudentDashboard = lazy(() => import('./components/StudentDashboard'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const LoginDebug = lazy(() => import('./components/LoginDebug'));
const FirebaseTest = lazy(() => import('./components/FirebaseTest'));
const OCRTest = lazy(() => import('./components/OCRTest'));

const AppContent: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const [loadingTimeout, setLoadingTimeout] = React.useState(false);

  // Add a timeout to prevent infinite loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log('Loading timeout reached - forcing app to show');
        setLoadingTimeout(true);
      }
    }, 8000); // 8 second timeout

    return () => clearTimeout(timer);
  }, [loading]);

  // Show loading only if we're actually loading and haven't timed out
  if (loading && !loadingTimeout) {
    return <AnimatedLoader type="campus" size="xl" text="Initializing CampusFlow..." />;
  }

  // If loading timed out, show a message and allow manual refresh
  if (loadingTimeout && !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-gradient-to-r from-primary to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl mx-auto mb-6 animate-pulse">
            <span className="text-white font-bold text-3xl">C</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">CampusFlow</h1>
          <p className="text-gray-600 mb-6">
            Having trouble connecting? This might be a temporary issue.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => window.location.reload()}
              className="btn-primary w-full"
            >
              Refresh Page
            </button>
            <button
              onClick={() => {
                setLoadingTimeout(false);
                window.location.reload();
              }}
              className="btn-secondary w-full"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    // Show original landing page when not authenticated
    return (
      <LazyWrapper fallback="campus" className="min-h-screen">
        <LandingPage />
      </LazyWrapper>
    );
  }

  // Route based on user role
  if (currentUser.role === 'admin') {
    return (
      <LazyWrapper fallback="campus" className="min-h-screen">
        <AdminDashboard />
      </LazyWrapper>
    );
  }

  return (
    <LazyWrapper fallback="campus" className="min-h-screen">
      <StudentDashboard />
    </LazyWrapper>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
