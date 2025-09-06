import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AnimatedLoader from './AnimatedLoader';
import LoadingSpinner from './LoadingSpinner';

const LoginDebug: React.FC = () => {
  const { signInWithGoogle, currentUser, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const addDebugInfo = (message: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      addDebugInfo('Login button clicked');
      addDebugInfo('Starting Google sign-in process...');
      
      await signInWithGoogle();
      
      addDebugInfo('Login successful!');
    } catch (error: any) {
      addDebugInfo(`Login failed: ${error.message}`);
      addDebugInfo(`Error code: ${error.code}`);
      console.error('Login error details:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const clearDebugInfo = () => {
    setDebugInfo([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">CampusFlow Login Debug</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>Current User:</strong> {currentUser ? `${currentUser.name} (${currentUser.email})` : 'Not logged in'}</p>
            <p><strong>User Role:</strong> {currentUser?.role || 'N/A'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Login</h2>
          <button
            onClick={handleGoogleSignIn}
            className="btn-primary mb-4 flex items-center justify-center space-x-2"
            disabled={loading || isSigningIn}
          >
            {isSigningIn ? (
              <>
                <LoadingSpinner size="sm" color="white" />
                <span>Signing in...</span>
              </>
            ) : loading ? (
              <>
                <LoadingSpinner size="sm" color="white" />
                <span>Loading...</span>
              </>
            ) : (
              'Test Google Login'
            )}
          </button>
          <p className="text-sm text-gray-600">
            Click the button above to test the Google login process. Check the debug log below for any errors.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Debug Log</h2>
            <button
              onClick={clearDebugInfo}
              className="btn-secondary text-sm"
            >
              Clear Log
            </button>
          </div>
          <div className="bg-gray-100 rounded p-4 h-64 overflow-y-auto">
            {debugInfo.length === 0 ? (
              <p className="text-gray-500">No debug information yet. Click "Test Google Login" to start.</p>
            ) : (
              debugInfo.map((info, index) => (
                <div key={index} className="text-sm font-mono text-gray-700 mb-1">
                  {info}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Common Issues & Solutions</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• <strong>Popup blocked:</strong> Allow popups for localhost:3000 in your browser</li>
            <li>• <strong>Unauthorized domain:</strong> Check Firebase console for authorized domains</li>
            <li>• <strong>Network error:</strong> Check internet connection and firewall settings</li>
            <li>• <strong>JavaScript disabled:</strong> Enable JavaScript in your browser</li>
            <li>• <strong>Cookies blocked:</strong> Allow cookies for localhost:3000</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginDebug;
