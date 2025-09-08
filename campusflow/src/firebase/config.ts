import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAlt64M4TtqwtzGiLnOhKcCK8FUz2yAx3E',
  authDomain: 'campus-flow-a01a1.firebaseapp.com',
  projectId: 'campus-flow-a01a1',
  storageBucket: 'campus-flow-a01a1.appspot.com',
  messagingSenderId: '1072114090918',
  appId: '1:1072114090918:web:a5d30fc6f9010941df4567',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
