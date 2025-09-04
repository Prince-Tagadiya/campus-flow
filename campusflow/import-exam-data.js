const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, query, where, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyAlt64M4TtqwtzGiLnOhKcCK8FUz2yAx3E',
  authDomain: 'campus-flow-a01a1.firebaseapp.com',
  projectId: 'campus-flow-a01a1',
  storageBucket: 'campus-flow-a01a1.firebasestorage.app',
  messagingSenderId: '1072114090918',
  appId: '1:1072114090918:web:a5d30fc6f9010941df4567',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Exam data from the table
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

async function importData() {
  try {
    console.log('Starting data import...');
    
    // First, let's add the subjects
    const subjects = [];
    for (const exam of examData) {
      const subject = {
        name: exam.courseName,
        code: exam.courseCode,
        studentId: '1', // Default student ID
        createdAt: new Date(),
      };
      
      console.log(`Adding subject: ${exam.courseName}`);
      const subjectRef = await addDoc(collection(db, 'subjects'), subject);
      subjects.push({ ...subject, id: subjectRef.id });
      console.log(`✅ Subject added with ID: ${subjectRef.id}`);
    }
    
    // Now add the exams
    for (const exam of examData) {
      const subject = subjects.find(s => s.code === exam.courseCode);
      if (subject) {
        const examData = {
          studentId: '1', // Default student ID
          subjectId: subject.id,
          subjectName: subject.name,
          examType: 'mid', // Mid exam as specified
          examDate: new Date(exam.examDate),
          startTime: exam.startTime,
          endTime: exam.endTime,
          room: 'TBD', // Room to be determined
          notes: `Mid Exam - ${exam.examTime}`,
          createdAt: new Date(),
        };
        
        console.log(`Adding exam: ${exam.courseName}`);
        const examRef = await addDoc(collection(db, 'exams'), examData);
        console.log(`✅ Exam added with ID: ${examRef.id}`);
      }
    }
    
    console.log('🎉 Data import completed successfully!');
    console.log(`Added ${subjects.length} subjects and ${examData.length} exams`);
    
  } catch (error) {
    console.error('Error importing data:', error);
  }
}

// Run the import
importData();
