import React, { useState } from 'react';

const OfflineMode: React.FC = () => {
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const handleOfflineMode = () => {
    setIsOfflineMode(true);
    // Store offline mode in localStorage
    localStorage.setItem('campusflow-offline-mode', 'true');
    // Reload the page
    window.location.reload();
  };

  if (isOfflineMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-gradient-to-r from-primary to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl mx-auto mb-6 animate-pulse">
            <span className="text-white font-bold text-3xl">C</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">CampusFlow - Offline Mode</h1>
          <p className="text-gray-600 mb-6">
            You're now in offline mode. Some features may be limited, but you can still explore the interface.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => {
                localStorage.removeItem('campusflow-offline-mode');
                window.location.reload();
              }}
              className="btn-primary w-full"
            >
              Try Online Mode Again
            </button>
            <button
              onClick={() => {
                // Navigate to a demo dashboard
                window.location.href = '/demo';
              }}
              className="btn-secondary w-full"
            >
              Continue in Offline Mode
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-20 h-20 bg-gradient-to-r from-primary to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl mx-auto mb-6 animate-pulse">
          <span className="text-white font-bold text-3xl">C</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">CampusFlow</h1>
        <p className="text-gray-600 mb-6">
          Having trouble connecting to our servers? You can try offline mode to explore the interface.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="btn-primary w-full"
          >
            Try Again
          </button>
          <button
            onClick={handleOfflineMode}
            className="btn-secondary w-full"
          >
            Continue in Offline Mode
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfflineMode;
