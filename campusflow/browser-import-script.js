// Data import script for CampusFlow
// Run this in the browser console after logging into CampusFlow

const examData = [
  {
    courseCode: '202003402',
    courseName: 'FUNDAMENTALS OF ECONOMICS AND BUSINESS MANAGEMENT',
    examDate: '2025-09-19',
    examTime: '09:30 AM to 10:30 AM',
    startTime: '09:30',
    endTime: '10:30'
  },
  {
    courseCode: '202230302',
    courseName: 'SIGNALS SYSTEMS AND APPLICATIONS',
    examDate: '2025-09-19',
    examTime: '02:00 PM to 03:00 PM',
    startTime: '14:00',
    endTime: '15:00'
  },
  {
    courseCode: '202230301',
    courseName: 'DISCRETE MATHEMATICS AND APPLICATIONS',
    examDate: '2025-09-20',
    examTime: '09:30 AM to 10:30 AM',
    startTime: '09:30',
    endTime: '10:30'
  },
  {
    courseCode: '202230303',
    courseName: 'DIGITAL COMPUTER ORGANIZATION',
    examDate: '2025-09-20',
    examTime: '09:30 AM to 10:30 AM',
    startTime: '09:30',
    endTime: '10:30'
  },
  {
    courseCode: '202003403',
    courseName: 'INDIAN ETHOS AND VALUE EDUCATION',
    examDate: '2025-09-22',
    examTime: '02:00 PM to 03:00 PM',
    startTime: '14:00',
    endTime: '15:00'
  },
  {
    courseCode: '202230304',
    courseName: 'DATA STRUCTURES AND ALGORITHMS',
    examDate: '2025-09-22',
    examTime: '09:30 AM to 10:30 AM',
    startTime: '09:30',
    endTime: '10:30'
  }
];

// Function to add subjects and exams
async function importExamData() {
  console.log('Starting data import...');
  
  // Get the current user ID (you need to be logged in)
  const currentUser = window.currentUser || { id: '1' };
  
  try {
    // First add subjects
    const subjects = [];
    for (const exam of examData) {
      console.log(`Adding subject: ${exam.courseName}`);
      
      // Add subject using the app's function
      const subject = {
        name: exam.courseName,
        code: exam.courseCode,
        studentId: currentUser.id,
        createdAt: new Date(),
      };
      
      // You can manually add each subject through the Subjects page
      console.log(`Please add subject manually:`, subject);
      subjects.push(subject);
    }
    
    // Then add exams
    for (const exam of examData) {
      console.log(`Please add exam manually:`, {
        subjectName: exam.courseName,
        examType: 'mid',
        examDate: exam.examDate,
        startTime: exam.startTime,
        endTime: exam.endTime,
        room: 'TBD',
        notes: `Mid Exam - ${exam.examTime}`
      });
    }
    
    console.log('✅ Data import instructions completed!');
    console.log('Please add the subjects and exams manually through the web interface.');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the import
importExamData();
