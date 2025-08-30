import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Assignment, User } from '@/types';

// Collection names
const COLLECTIONS = {
  ASSIGNMENTS: 'assignments',
  USERS: 'users',
} as const;

// Convert Firestore timestamp to Date
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return timestamp;
};

// Convert Date to Firestore timestamp
const convertToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

// Assignment operations
export const assignmentService = {
  // Create new assignment
  async create(
    assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ) {
    const assignmentData = {
      ...assignment,
      userId,
      dueDate: convertToTimestamp(assignment.dueDate),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, COLLECTIONS.ASSIGNMENTS),
      assignmentData
    );
    return { id: docRef.id, ...assignmentData };
  },

  // Get all assignments for a user
  async getAll(userId: string): Promise<Assignment[]> {
    const q = query(
      collection(db, COLLECTIONS.ASSIGNMENTS),
      where('userId', '==', userId),
      orderBy('dueDate', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dueDate: convertTimestamp(doc.data().dueDate),
      createdAt: convertTimestamp(doc.data().createdAt),
      updatedAt: convertTimestamp(doc.data().updatedAt),
    })) as Assignment[];
  },

  // Get assignment by ID
  async getById(id: string): Promise<Assignment | null> {
    const docRef = doc(db, COLLECTIONS.ASSIGNMENTS, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        dueDate: convertTimestamp(data.dueDate),
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      } as Assignment;
    }

    return null;
  },

  // Update assignment
  async update(id: string, updates: Partial<Omit<Assignment, 'dueDate' | 'createdAt' | 'updatedAt'>> & { dueDate?: Date }) {
    const docRef = doc(db, COLLECTIONS.ASSIGNMENTS, id);
    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    // Convert Date to Timestamp if dueDate is being updated
    if (updates.dueDate) {
      updateData.dueDate = convertToTimestamp(updates.dueDate);
    }

    await updateDoc(docRef, updateData);
  },

  // Delete assignment
  async delete(id: string) {
    const docRef = doc(db, COLLECTIONS.ASSIGNMENTS, id);
    await deleteDoc(docRef);
  },

  // Get assignments with real-time updates
  subscribeToUserAssignments(
    userId: string,
    callback: (assignments: Assignment[]) => void
  ) {
    const q = query(
      collection(db, COLLECTIONS.ASSIGNMENTS),
      where('userId', '==', userId),
      orderBy('dueDate', 'asc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const assignments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        dueDate: convertTimestamp(doc.data().dueDate),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt),
      })) as Assignment[];

      callback(assignments);
    });
  },
};

// User operations
export const userService = {
  // Create or update user
  async createOrUpdate(user: User) {
    const userRef = doc(db, COLLECTIONS.USERS, user.id);
    const userData: any = {
      ...user,
      updatedAt: new Date(),
    };
    await updateDoc(userRef, userData, { merge: true });
  },

  // Get user by ID
  async getById(id: string): Promise<User | null> {
    const docRef = doc(db, COLLECTIONS.USERS, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as User;
    }

    return null;
  },
};

// Storage operations for file uploads
export const storageService = {
  // Upload file and get download URL
  async uploadFile(
    file: File,
    userId: string,
    assignmentId: string
  ): Promise<string> {
    const { ref, uploadBytes, getDownloadURL } = await import(
      'firebase/storage'
    );
    const { storage } = await import('./firebase');

    const fileName = `${userId}/${assignmentId}/${file.name}`;
    const storageRef = ref(storage, fileName);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  },

  // Delete file
  async deleteFile(fileUrl: string) {
    const { ref, deleteObject } = await import('firebase/storage');
    const { storage } = await import('./firebase');

    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
  },
};
