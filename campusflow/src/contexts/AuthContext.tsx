import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google sign-in process...');
      setLoading(true); // Show loading during sign-in
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log('Google sign-in successful:', user.email);

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (!userDoc.exists()) {
        // Create new user document
        const newUser: User = {
          id: user.uid,
          name: user.displayName || '',
          email: user.email || '',
          role: 'student', // Default role
          createdAt: new Date(),
          photoURL: user.photoURL || undefined,
        };

        await setDoc(doc(db, 'users', user.uid), newUser);
        setCurrentUser(newUser);
        console.log('New user created:', newUser);
      } else {
        // User exists, get their data
        const userData = userDoc.data() as User;
        setCurrentUser(userData);
        console.log('Existing user logged in:', userData);
      }
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Login was cancelled. Please try again.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked by your browser. Please allow popups for this site and try again.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized for Google sign-in. Please contact support.';
      }
      
      alert(errorMessage);
      throw error;
    } finally {
      setLoading(false); // Hide loading after sign-in attempt
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
      setFirebaseUser(user);

      if (user) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setCurrentUser(userData);
            console.log('User data loaded from Firestore:', userData);
          } else {
            // If user doesn't exist in Firestore, create them
            const newUser: User = {
              id: user.uid,
              name: user.displayName || '',
              email: user.email || '',
              role: 'student',
              createdAt: new Date(),
              photoURL: user.photoURL || undefined,
            };
            await setDoc(doc(db, 'users', user.uid), newUser);
            setCurrentUser(newUser);
            console.log('New user created in Firestore:', newUser);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          // Fallback: create user without Firestore
          const fallbackUser: User = {
            id: user.uid,
            name: user.displayName || '',
            email: user.email || '',
            role: 'student',
            createdAt: new Date(),
            photoURL: user.photoURL || undefined,
          };
          setCurrentUser(fallbackUser);
        }
      } else {
        setCurrentUser(null);
      }

      setLoading(false);
    });

    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Auth timeout - setting loading to false');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [loading]);

  const value: AuthContextType = {
    currentUser,
    firebaseUser,
    loading,
    signInWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
