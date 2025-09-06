import React, { useState } from 'react';
import { auth, db } from '../firebase/config';
import { signInAnonymously, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const FirebaseTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runFirebaseTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      addResult('Starting Firebase configuration tests...');
      
      // Test 1: Check if auth is initialized
      addResult(`Auth initialized: ${auth ? 'Yes' : 'No'}`);
      
      // Test 2: Check if db is initialized
      addResult(`Database initialized: ${db ? 'Yes' : 'No'}`);
      
      // Test 3: Try anonymous sign-in
      addResult('Testing anonymous sign-in...');
      const anonymousResult = await signInAnonymously(auth);
      addResult(`Anonymous sign-in: Success (UID: ${anonymousResult.user.uid})`);
      
      // Test 4: Try to write to Firestore
      addResult('Testing Firestore write...');
      const testDoc = doc(db, 'test', 'connection');
      await setDoc(testDoc, { 
        timestamp: new Date(),
        test: 'Firebase connection test'
      });
      addResult('Firestore write: Success');
      
      // Test 5: Try to read from Firestore
      addResult('Testing Firestore read...');
      const docSnap = await getDoc(testDoc);
      if (docSnap.exists()) {
        addResult('Firestore read: Success');
      } else {
        addResult('Firestore read: Failed - Document not found');
      }
      
      // Test 6: Sign out
      addResult('Testing sign out...');
      await signOut(auth);
      addResult('Sign out: Success');
      
      addResult('All Firebase tests completed successfully!');
      
    } catch (error: any) {
      addResult(`Test failed: ${error.message}`);
      addResult(`Error code: ${error.code}`);
      console.error('Firebase test error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Firebase Configuration Test</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Firebase Connection</h2>
          <button
            onClick={runFirebaseTests}
            className="btn-primary mb-4"
            disabled={isRunning}
          >
            {isRunning ? 'Running Tests...' : 'Run Firebase Tests'}
          </button>
          <p className="text-sm text-gray-600">
            This will test Firebase Authentication and Firestore connectivity.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="bg-gray-100 rounded p-4 h-64 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">No test results yet. Click "Run Firebase Tests" to start.</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono text-gray-700 mb-1">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseTest;
