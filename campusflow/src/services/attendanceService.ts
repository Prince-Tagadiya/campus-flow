import { 
  addDoc, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp, 
  setDoc, 
  updateDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { 
  AttendanceSession, 
  AttendanceRecord, 
  StudentAttendance, 
  Course, 
  StudentScore, 
  ParentNotification,
  Branch 
} from '../types';

// Generate random attendance code
const generateCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

// Create attendance session
export const createAttendanceSession = async (
  facultyId: string,
  courseId: string,
  courseName: string,
  durationMinutes: number = 60,
  sectionId?: string
): Promise<string> => {
  const now = new Date();
  const endsAt = new Date(now.getTime() + durationMinutes * 60 * 1000);
  const initialCode = generateCode();
  
  const sessionsRef = collection(db, 'attendanceSessions');
  const docRef = await addDoc(sessionsRef, {
    facultyId,
    courseId,
    courseName,
    sectionId: sectionId || null,
    startedAt: now,
    endsAt,
    currentCode: initialCode,
    lastCodeAt: now,
    isActive: true,
    totalStudents: 0,
    presentStudents: 0,
    createdAt: serverTimestamp(),
  });
  
  return docRef.id;
};

// Update session code (every 3 seconds)
export const updateSessionCode = async (sessionId: string): Promise<string> => {
  const newCode = generateCode();
  const sessionRef = doc(db, 'attendanceSessions', sessionId);
  await updateDoc(sessionRef, {
    currentCode: newCode,
    lastCodeAt: new Date(),
  });
  return newCode;
};

// End attendance session
export const endAttendanceSession = async (sessionId: string): Promise<void> => {
  const sessionRef = doc(db, 'attendanceSessions', sessionId);
  await updateDoc(sessionRef, {
    isActive: false,
    endsAt: new Date(),
  });
};

// Submit attendance (student scans QR)
export const submitAttendance = async (
  sessionId: string,
  studentId: string,
  studentName: string,
  scannedCode: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Verify session and code
    const sessionRef = doc(db, 'attendanceSessions', sessionId);
    const sessionSnap = await getDoc(sessionRef);
    
    if (!sessionSnap.exists()) {
      return { success: false, message: 'Session not found' };
    }
    
    const sessionData = sessionSnap.data() as any;
    const now = new Date();
    const endsAt: Date = sessionData.endsAt?.toDate ? (sessionData.endsAt as Timestamp).toDate() : new Date(sessionData.endsAt);
    
    if (!sessionData.isActive || now > endsAt) {
      return { success: false, message: 'Session has ended' };
    }
    
    if (sessionData.currentCode !== scannedCode) {
      return { success: false, message: 'Invalid or expired code' };
    }
    
    // Check if already marked present
    const existingRecord = await getDocs(
      query(
        collection(db, 'attendanceRecords'),
        where('sessionId', '==', sessionId),
        where('studentId', '==', studentId)
      )
    );
    
    if (!existingRecord.empty) {
      return { success: false, message: 'Already marked present for this session' };
    }
    
    // Create attendance record
    const recordsRef = collection(db, 'attendanceRecords');
    await addDoc(recordsRef, {
      sessionId,
      studentId,
      studentName,
      scannedAt: serverTimestamp(),
      status: 'present',
    });
    
    // Update session present count
    await updateDoc(sessionRef, {
      presentStudents: sessionData.presentStudents + 1,
    });
    
    return { success: true, message: 'Attendance marked successfully' };
    
  } catch (error: any) {
    console.error('Error submitting attendance:', error);
    return { success: false, message: 'Failed to mark attendance' };
  }
};

// Get student attendance summary
export const getStudentAttendance = async (
  studentId: string,
  courseId?: string
): Promise<StudentAttendance[]> => {
  try {
    let attendanceQuery = query(
      collection(db, 'attendanceRecords'),
      where('studentId', '==', studentId),
      orderBy('scannedAt', 'desc')
    );
    
    if (courseId) {
      // Filter by course through sessions
      const sessionsQuery = query(
        collection(db, 'attendanceSessions'),
        where('courseId', '==', courseId)
      );
      const sessionsSnap = await getDocs(sessionsQuery);
      const sessionIds = sessionsSnap.docs.map(doc => doc.id);
      
      attendanceQuery = query(
        collection(db, 'attendanceRecords'),
        where('studentId', '==', studentId),
        where('sessionId', 'in', sessionIds),
        orderBy('scannedAt', 'desc')
      );
    }
    
    const recordsSnap = await getDocs(attendanceQuery);
    const records = recordsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AttendanceRecord[];
    
    // Group by course
    const courseMap = new Map<string, StudentAttendance>();
    
    for (const record of records) {
      // Get session details to get course info
      const sessionRef = doc(db, 'attendanceSessions', record.sessionId);
      const sessionSnap = await getDoc(sessionRef);
      
      if (sessionSnap.exists()) {
        const sessionData = sessionSnap.data() as any;
        const courseKey = sessionData.courseId;
        
        if (!courseMap.has(courseKey)) {
          courseMap.set(courseKey, {
            studentId,
            studentName: record.studentName,
            totalSessions: 0,
            presentSessions: 0,
            absentSessions: 0,
            attendancePercentage: 0,
            courseId: sessionData.courseId,
            courseName: sessionData.courseName,
          });
        }
        
        const attendance = courseMap.get(courseKey)!;
        attendance.totalSessions++;
        if (record.status === 'present') {
          attendance.presentSessions++;
        } else {
          attendance.absentSessions++;
        }
        attendance.attendancePercentage = (attendance.presentSessions / attendance.totalSessions) * 100;
        attendance.lastAttendance = record.scannedAt instanceof Date ? record.scannedAt : new Date(record.scannedAt);
      }
    }
    
    return Array.from(courseMap.values());
    
  } catch (error) {
    console.error('Error getting student attendance:', error);
    return [];
  }
};

// Get active sessions for faculty
export const getActiveSessions = async (facultyId: string): Promise<AttendanceSession[]> => {
  try {
    const sessionsQuery = query(
      collection(db, 'attendanceSessions'),
      where('facultyId', '==', facultyId),
      where('isActive', '==', true),
      orderBy('startedAt', 'desc')
    );
    
    const sessionsSnap = await getDocs(sessionsQuery);
    return sessionsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startedAt: doc.data().startedAt?.toDate ? (doc.data().startedAt as Timestamp).toDate() : new Date(doc.data().startedAt),
      endsAt: doc.data().endsAt?.toDate ? (doc.data().endsAt as Timestamp).toDate() : new Date(doc.data().endsAt),
      lastCodeAt: doc.data().lastCodeAt?.toDate ? (doc.data().lastCodeAt as Timestamp).toDate() : new Date(doc.data().lastCodeAt),
      createdAt: doc.data().createdAt?.toDate ? (doc.data().createdAt as Timestamp).toDate() : new Date(doc.data().createdAt),
    })) as AttendanceSession[];
    
  } catch (error) {
    console.error('Error getting active sessions:', error);
    return [];
  }
};

// Create branch
export const createBranch = async (
  name: string,
  code: string,
  description?: string
): Promise<string> => {
  const branchesRef = collection(db, 'branches');
  const docRef = await addDoc(branchesRef, {
    name,
    code,
    description: description || null,
    createdAt: serverTimestamp(),
  });
  
  return docRef.id;
};

// Get all branches
export const getBranches = async (): Promise<Branch[]> => {
  try {
    const branchesQuery = query(
      collection(db, 'branches'),
      orderBy('createdAt', 'desc')
    );
    
    const branchesSnap = await getDocs(branchesQuery);
    return branchesSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate ? (doc.data().createdAt as Timestamp).toDate() : new Date(doc.data().createdAt),
    })) as Branch[];
    
  } catch (error) {
    console.error('Error getting branches:', error);
    return [];
  }
};

// Create course
export const createCourse = async (
  name: string,
  code: string,
  facultyId: string,
  facultyName: string,
  semester: string,
  year: string,
  branch: string
): Promise<string> => {
  const coursesRef = collection(db, 'courses');
  const docRef = await addDoc(coursesRef, {
    name,
    code,
    facultyId,
    facultyName,
    semester,
    year,
    branch,
    totalStudents: 0,
    createdAt: serverTimestamp(),
  });
  
  return docRef.id;
};

// Get courses for faculty
export const getFacultyCourses = async (facultyId: string): Promise<Course[]> => {
  try {
    const coursesQuery = query(
      collection(db, 'courses'),
      where('facultyId', '==', facultyId),
      orderBy('createdAt', 'desc')
    );
    
    const coursesSnap = await getDocs(coursesQuery);
    return coursesSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate ? (doc.data().createdAt as Timestamp).toDate() : new Date(doc.data().createdAt),
    })) as Course[];
    
  } catch (error) {
    console.error('Error getting faculty courses:', error);
    return [];
  }
};

// Add student score
export const addStudentScore = async (
  studentId: string,
  studentName: string,
  courseId: string,
  courseName: string,
  marks: number,
  maxMarks: number,
  semester: string,
  assignmentId?: string,
  examId?: string
): Promise<string> => {
  const grade = calculateGrade(marks, maxMarks);
  
  const scoresRef = collection(db, 'studentScores');
  const docRef = await addDoc(scoresRef, {
    studentId,
    studentName,
    courseId,
    courseName,
    assignmentId: assignmentId || null,
    examId: examId || null,
    marks,
    maxMarks,
    grade,
    semester,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  return docRef.id;
};

// Calculate grade based on marks
const calculateGrade = (marks: number, maxMarks: number): string => {
  const percentage = (marks / maxMarks) * 100;
  
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C+';
  if (percentage >= 40) return 'C';
  if (percentage >= 30) return 'D';
  return 'F';
};

// Get student scores
export const getStudentScores = async (studentId: string): Promise<StudentScore[]> => {
  try {
    const scoresQuery = query(
      collection(db, 'studentScores'),
      where('studentId', '==', studentId),
      orderBy('createdAt', 'desc')
    );
    
    const scoresSnap = await getDocs(scoresQuery);
    return scoresSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate ? (doc.data().createdAt as Timestamp).toDate() : new Date(doc.data().createdAt),
      updatedAt: doc.data().updatedAt?.toDate ? (doc.data().updatedAt as Timestamp).toDate() : new Date(doc.data().updatedAt),
    })) as StudentScore[];
    
  } catch (error) {
    console.error('Error getting student scores:', error);
    return [];
  }
};

// Check attendance threshold and send notification
export const checkAttendanceThreshold = async (
  studentId: string,
  parentId: string,
  threshold: number = 75
): Promise<void> => {
  try {
    const attendance = await getStudentAttendance(studentId);
    
    for (const courseAttendance of attendance) {
      if (courseAttendance.attendancePercentage < threshold) {
        // Check if notification already sent recently (within 24 hours)
        const recentNotification = await getDocs(
          query(
            collection(db, 'parentNotifications'),
            where('parentId', '==', parentId),
            where('studentId', '==', studentId),
            where('type', '==', 'attendance'),
            where('threshold', '==', threshold),
            where('createdAt', '>', new Date(Date.now() - 24 * 60 * 60 * 1000))
          )
        );
        
        if (recentNotification.empty) {
          // Send notification
          await addDoc(collection(db, 'parentNotifications'), {
            parentId,
            studentId,
            studentName: courseAttendance.studentName,
            type: 'attendance',
            title: 'Low Attendance Alert',
            message: `${courseAttendance.studentName} has ${courseAttendance.attendancePercentage.toFixed(1)}% attendance in ${courseAttendance.courseName}. This is below the ${threshold}% threshold.`,
            isRead: false,
            threshold,
            createdAt: serverTimestamp(),
          });
        }
      }
    }
  } catch (error) {
    console.error('Error checking attendance threshold:', error);
  }
};

// Get parent notifications
export const getParentNotifications = async (parentId: string): Promise<ParentNotification[]> => {
  try {
    const notificationsQuery = query(
      collection(db, 'parentNotifications'),
      where('parentId', '==', parentId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    const notificationsSnap = await getDocs(notificationsQuery);
    return notificationsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate ? (doc.data().createdAt as Timestamp).toDate() : new Date(doc.data().createdAt),
    })) as ParentNotification[];
    
  } catch (error) {
    console.error('Error getting parent notifications:', error);
    return [];
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  const notificationRef = doc(db, 'parentNotifications', notificationId);
  await updateDoc(notificationRef, {
    isRead: true,
  });
};