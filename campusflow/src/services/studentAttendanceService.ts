import { collection, query, where, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { StudentAttendance, AttendanceRecord, Course, SemesterSubject } from '../types';

export class StudentAttendanceService {
  // Get attendance records for a specific student
  static async getStudentAttendance(studentId: string): Promise<StudentAttendance[]> {
    try {
      const attendanceQuery = query(
        collection(db, 'attendance'),
        where('studentId', '==', studentId)
      );
      
      const querySnapshot = await getDocs(attendanceQuery);
      const attendanceRecords: StudentAttendance[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        attendanceRecords.push({
          id: doc.id,
          ...data,
          lastAttendance: data.lastAttendance?.toDate()
        } as StudentAttendance);
      });
      
      return attendanceRecords;
    } catch (error) {
      console.error('Error fetching student attendance:', error);
      return [];
    }
  }

  // Get attendance for specific semester subjects
  static async getAttendanceBySemester(studentId: string, semester: number, subjects: SemesterSubject[]): Promise<StudentAttendance[]> {
    try {
      const attendanceRecords: StudentAttendance[] = [];
      
      for (const subject of subjects) {
        const attendanceQuery = query(
          collection(db, 'attendance'),
          where('studentId', '==', studentId),
          where('subjectId', '==', subject.id)
        );
        
        const querySnapshot = await getDocs(attendanceQuery);
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          attendanceRecords.push({
            id: doc.id,
            studentId: data.studentId,
            studentName: data.studentName,
            totalSessions: data.totalSessions || 0,
            presentSessions: data.presentSessions || 0,
            absentSessions: data.absentSessions || 0,
            attendancePercentage: data.attendancePercentage || 0,
            lastAttendance: data.lastAttendance?.toDate(),
            courseId: subject.courseId,
            courseName: subject.subjectName,
            subjectId: subject.id,
            subjectName: subject.subjectName,
            semester: semester
          });
        });
      }
      
      return attendanceRecords;
    } catch (error) {
      console.error('Error fetching semester attendance:', error);
      return [];
    }
  }

  // Calculate overall attendance percentage for a student
  static calculateOverallAttendance(attendanceRecords: StudentAttendance[]): number {
    if (attendanceRecords.length === 0) return 0;
    
    const totalSessions = attendanceRecords.reduce((sum, record) => sum + record.totalSessions, 0);
    const totalPresent = attendanceRecords.reduce((sum, record) => sum + record.presentSessions, 0);
    
    return totalSessions > 0 ? (totalPresent / totalSessions) * 100 : 0;
  }

  // Get attendance summary by semester
  static getAttendanceBySemesterSummary(attendanceRecords: StudentAttendance[]): Record<number, {
    semester: number;
    subjects: number;
    totalSessions: number;
    presentSessions: number;
    attendancePercentage: number;
  }> {
    const summary: Record<number, any> = {};
    
    attendanceRecords.forEach(record => {
      const semester = record.semester || 1;
      
      if (!summary[semester]) {
        summary[semester] = {
          semester,
          subjects: 0,
          totalSessions: 0,
          presentSessions: 0,
          attendancePercentage: 0
        };
      }
      
      summary[semester].subjects += 1;
      summary[semester].totalSessions += record.totalSessions;
      summary[semester].presentSessions += record.presentSessions;
    });
    
    // Calculate percentage for each semester
    Object.keys(summary).forEach(sem => {
      const semesterData = summary[parseInt(sem)];
      semesterData.attendancePercentage = semesterData.totalSessions > 0 
        ? (semesterData.presentSessions / semesterData.totalSessions) * 100 
        : 0;
    });
    
    return summary;
  }

  // Mark attendance for a student
  static async markAttendance(studentId: string, subjectId: string, isPresent: boolean): Promise<boolean> {
    try {
      const attendanceRef = doc(db, 'attendance', `${studentId}_${subjectId}`);
      
      // Get current attendance record
      const currentAttendance = await this.getStudentAttendance(studentId);
      const subjectAttendance = currentAttendance.find(record => record.subjectId === subjectId);
      
      if (subjectAttendance) {
        // Update existing record
        const newTotalSessions = subjectAttendance.totalSessions + 1;
        const newPresentSessions = subjectAttendance.presentSessions + (isPresent ? 1 : 0);
        const newAbsentSessions = subjectAttendance.absentSessions + (isPresent ? 0 : 1);
        const newAttendancePercentage = (newPresentSessions / newTotalSessions) * 100;
        
        await updateDoc(attendanceRef, {
          totalSessions: newTotalSessions,
          presentSessions: newPresentSessions,
          absentSessions: newAbsentSessions,
          attendancePercentage: newAttendancePercentage,
          lastAttendance: new Date()
        });
      } else {
        // Create new record
        await setDoc(attendanceRef, {
          studentId,
          subjectId,
          totalSessions: 1,
          presentSessions: isPresent ? 1 : 0,
          absentSessions: isPresent ? 0 : 1,
          attendancePercentage: isPresent ? 100 : 0,
          lastAttendance: new Date(),
          createdAt: new Date()
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error marking attendance:', error);
      return false;
    }
  }

  // Generate mock attendance data for testing
  static generateMockAttendanceData(studentId: string, subjects: SemesterSubject[]): StudentAttendance[] {
    return subjects.map(subject => {
      const totalSessions = Math.floor(Math.random() * 30) + 20; // 20-50 sessions
      const presentSessions = Math.floor(totalSessions * (0.6 + Math.random() * 0.4)); // 60-100% attendance
      const absentSessions = totalSessions - presentSessions;
      const attendancePercentage = (presentSessions / totalSessions) * 100;
      
      return {
        studentId,
        studentName: 'Student Name',
        totalSessions,
        presentSessions,
        absentSessions,
        attendancePercentage,
        lastAttendance: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last week
        courseId: subject.courseId,
        courseName: subject.subjectName,
        subjectId: subject.id,
        subjectName: subject.subjectName,
        semester: subject.semester
      };
    });
  }
}
