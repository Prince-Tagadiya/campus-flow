import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    try {
      console.log('Starting email/password login...');
      setLoading(true);
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      console.log('Login successful:', user.email);

      // Check if user exists in Firestore
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setCurrentUser(userData);
          console.log('User data loaded:', userData);
        } else {
          // Create new user document
          const newUser: User = {
            id: user.uid,
            name: user.displayName || 'User',
            email: user.email || '',
            role: 'student',
            createdAt: new Date(),
            photoURL: user.photoURL || undefined,
          };

          await setDoc(doc(db, 'users', user.uid), newUser);
          setCurrentUser(newUser);
          console.log('New user created:', newUser);
        }
      } catch (firestoreError) {
        console.log('Firestore error, using fallback user data');
        const fallbackUser: User = {
          id: user.uid,
          name: user.displayName || 'User',
          email: user.email || '',
          role: 'student',
          createdAt: new Date(),
          photoURL: user.photoURL || undefined,
        };
        setCurrentUser(fallbackUser);
      }
    } catch (error: any) {
      console.error('Error logging in:', error);
      
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password authentication is not enabled.';
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      console.log('Starting registration...');
      setLoading(true);
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      console.log('Registration successful:', user.email);

      // Create user document in Firestore
      const newUser: User = {
        id: user.uid,
        name: name,
        email: user.email || '',
        role: 'student', // Default role
        createdAt: new Date(),
        photoURL: user.photoURL || undefined,
      };

      try {
        await setDoc(doc(db, 'users', user.uid), newUser);
      } catch (firestoreError) {
        console.log('Could not save to Firestore, using local data');
      }
      
      setCurrentUser(newUser);
      console.log('New user created:', newUser);
    } catch (error: any) {
      console.error('Error registering:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google sign-in...');
      setLoading(true);
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log('Google sign-in successful:', user.email);

      // Check if user exists in Firestore
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setCurrentUser(userData);
          console.log('User data loaded:', userData);
        } else {
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
        }
      } catch (firestoreError) {
        console.log('Firestore error, using fallback user data');
        const fallbackUser: User = {
          id: user.uid,
          name: user.displayName || 'User',
          email: user.email || '',
          role: 'student',
          createdAt: new Date(),
          photoURL: user.photoURL || undefined,
        };
        setCurrentUser(fallbackUser);
      }
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      
      let errorMessage = 'Google sign-in failed. Please try again.';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled. Please try again.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups and try again.';
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
      setFirebaseUser(user);

      if (user) {
        setLoading(true);
        try {
          // Get user data from Firestore with timeout
          const userDoc = await Promise.race([
            getDoc(doc(db, 'users', user.uid)),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 3000)
            )
          ]) as any;
          
          if (userDoc && userDoc.exists()) {
            const userData = userDoc.data() as User;
            setCurrentUser(userData);
            console.log('User data loaded from Firestore:', userData);
          } else {
            // If user doesn't exist in Firestore, create them
            const newUser: User = {
              id: user.uid,
              name: user.displayName || 'User',
              email: user.email || '',
              role: 'student',
              createdAt: new Date(),
              photoURL: user.photoURL || undefined,
            };

            try {
              await setDoc(doc(db, 'users', user.uid), newUser);
            } catch (error) {
              console.log('Could not save user to Firestore, using local data');
            }
            setCurrentUser(newUser);
            console.log('New user created:', newUser);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          // Set a default user if Firestore fails
          const defaultUser: User = {
            id: user.uid,
            name: user.displayName || 'User',
            email: user.email || '',
            role: 'student',
            createdAt: new Date(),
            photoURL: user.photoURL || undefined,
          };
          setCurrentUser(defaultUser);
        } finally {
          setLoading(false);
        }
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    currentUser,
    firebaseUser,
    loading,
    login,
    register,
    signInWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
