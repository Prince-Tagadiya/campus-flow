import { initializeApp } from 'firebase/app';
import { browserLocalPersistence, getAuth, setPersistence, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import app, { db } from '../firebase/config';

// Initialize a secondary app for admin operations so current admin stays signed in
const secondaryApp = initializeApp(app.options as any, 'secondary');
const secondaryAuth = getAuth(secondaryApp);

export const adminCreateUser = async (
  email: string,
  password: string,
  name: string,
  role: 'student' | 'faculty' | 'admin' | 'parent',
  studentId?: string, // For parent role
  parentId?: string,   // For student role
  additionalData?: any // For comprehensive student data
) => {
  // Avoid persisting secondary auth session
  await setPersistence(secondaryAuth, browserLocalPersistence);
  const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
  const uid = cred.user.uid;
  
  const userData = {
    id: uid,
    name,
    email,
    role,
    studentId: studentId || null,
    parentId: parentId || null,
    branch: null, // Will be set separately
    createdAt: new Date(),
    ...additionalData // Merge any additional data (comprehensive student details)
  };
  
  await setDoc(doc(db, 'users', uid), userData);
  // sign out secondary user to keep context clean
  try { await signOut(secondaryAuth); } catch {}
  return uid;
};

export const adminUpdateUserRole = async (
  userId: string,
  role: 'student' | 'faculty' | 'admin' | 'parent'
) => {
  await updateDoc(doc(db, 'users', userId), { role });
};
