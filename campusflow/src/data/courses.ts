import { Course, SemesterSubject, Branch } from '../types';

export const branches: Branch[] = [
  {
    id: 'cse',
    name: 'Computer Science and Engineering',
    code: 'CSE',
    description: 'Computer Science and Engineering branch',
    createdAt: new Date()
  },
  {
    id: 'ece',
    name: 'Electronics and Communication Engineering',
    code: 'ECE',
    description: 'Electronics and Communication Engineering branch',
    createdAt: new Date()
  },
  {
    id: 'me',
    name: 'Mechanical Engineering',
    code: 'ME',
    description: 'Mechanical Engineering branch',
    createdAt: new Date()
  },
  {
    id: 'ce',
    name: 'Civil Engineering',
    code: 'CE',
    description: 'Civil Engineering branch',
    createdAt: new Date()
  },
  {
    id: 'ee',
    name: 'Electrical Engineering',
    code: 'EE',
    description: 'Electrical Engineering branch',
    createdAt: new Date()
  }
];

export const courses: Course[] = [
  {
    id: 'btech-cse',
    name: 'Bachelor of Technology - Computer Science and Engineering',
    code: 'BTECH-CSE',
    description: '4-year undergraduate program in Computer Science and Engineering',
    duration: 8,
    branchId: 'cse',
    branchName: 'Computer Science and Engineering',
    createdAt: new Date()
  },
  {
    id: 'btech-ece',
    name: 'Bachelor of Technology - Electronics and Communication Engineering',
    code: 'BTECH-ECE',
    description: '4-year undergraduate program in Electronics and Communication Engineering',
    duration: 8,
    branchId: 'ece',
    branchName: 'Electronics and Communication Engineering',
    createdAt: new Date()
  },
  {
    id: 'btech-me',
    name: 'Bachelor of Technology - Mechanical Engineering',
    code: 'BTECH-ME',
    description: '4-year undergraduate program in Mechanical Engineering',
    duration: 8,
    branchId: 'me',
    branchName: 'Mechanical Engineering',
    createdAt: new Date()
  },
  {
    id: 'btech-ce',
    name: 'Bachelor of Technology - Civil Engineering',
    code: 'BTECH-CE',
    description: '4-year undergraduate program in Civil Engineering',
    duration: 8,
    branchId: 'ce',
    branchName: 'Civil Engineering',
    createdAt: new Date()
  },
  {
    id: 'btech-ee',
    name: 'Bachelor of Technology - Electrical Engineering',
    code: 'BTECH-EE',
    description: '4-year undergraduate program in Electrical Engineering',
    duration: 8,
    branchId: 'ee',
    branchName: 'Electrical Engineering',
    createdAt: new Date()
  }
];

export const semesterSubjects: SemesterSubject[] = [
  // BTECH-CSE Subjects
  // Semester 1
  {
    id: 'cse-s1-math1',
    courseId: 'btech-cse',
    semester: 1,
    subjectName: 'Mathematics-I',
    subjectCode: 'MATH101',
    credits: 4,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'cse-s1-physics',
    courseId: 'btech-cse',
    semester: 1,
    subjectName: 'Physics',
    subjectCode: 'PHY101',
    credits: 4,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'cse-s1-chemistry',
    courseId: 'btech-cse',
    semester: 1,
    subjectName: 'Chemistry',
    subjectCode: 'CHEM101',
    credits: 3,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'cse-s1-english',
    courseId: 'btech-cse',
    semester: 1,
    subjectName: 'English Communication',
    subjectCode: 'ENG101',
    credits: 2,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'cse-s1-programming',
    courseId: 'btech-cse',
    semester: 1,
    subjectName: 'Programming Fundamentals',
    subjectCode: 'CS101',
    credits: 3,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'cse-s1-lab1',
    courseId: 'btech-cse',
    semester: 1,
    subjectName: 'Programming Lab',
    subjectCode: 'CS101L',
    credits: 1,
    isElective: false,
    createdAt: new Date()
  },

  // Semester 2
  {
    id: 'cse-s2-math2',
    courseId: 'btech-cse',
    semester: 2,
    subjectName: 'Mathematics-II',
    subjectCode: 'MATH102',
    credits: 4,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'cse-s2-mechanics',
    courseId: 'btech-cse',
    semester: 2,
    subjectName: 'Engineering Mechanics',
    subjectCode: 'ME101',
    credits: 3,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'cse-s2-electrical',
    courseId: 'btech-cse',
    semester: 2,
    subjectName: 'Basic Electrical Engineering',
    subjectCode: 'EE101',
    credits: 3,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'cse-s2-economics',
    courseId: 'btech-cse',
    semester: 2,
    subjectName: 'Engineering Economics',
    subjectCode: 'ECON101',
    credits: 2,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'cse-s2-dsa',
    courseId: 'btech-cse',
    semester: 2,
    subjectName: 'Data Structures and Algorithms',
    subjectCode: 'CS102',
    credits: 3,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'cse-s2-lab2',
    courseId: 'btech-cse',
    semester: 2,
    subjectName: 'Data Structures Lab',
    subjectCode: 'CS102L',
    credits: 1,
    isElective: false,
    createdAt: new Date()
  },

  // Semester 3
  {
    id: 'cse-s3-math3',
    courseId: 'btech-cse',
    semester: 3,
    subjectName: 'Mathematics-III',
    subjectCode: 'MATH201',
    credits: 4,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'cse-s3-oop',
    courseId: 'btech-cse',
    semester: 3,
    subjectName: 'Object-Oriented Programming',
    subjectCode: 'CS201',
    credits: 3,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'cse-s3-dbms',
    courseId: 'btech-cse',
    semester: 3,
    subjectName: 'Database Management Systems',
    subjectCode: 'CS202',
    credits: 3,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'cse-s3-computer-org',
    courseId: 'btech-cse',
    semester: 3,
    subjectName: 'Computer Organization',
    subjectCode: 'CS203',
    credits: 3,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'cse-s3-lab3',
    courseId: 'btech-cse',
    semester: 3,
    subjectName: 'OOP and DBMS Lab',
    subjectCode: 'CS201L',
    credits: 2,
    isElective: false,
    createdAt: new Date()
  },

  // Semester 4
  {
    id: 'cse-s4-daa',
    courseId: 'btech-cse',
    semester: 4,
    subjectName: 'Design and Analysis of Algorithms',
    subjectCode: 'CS301',
    credits: 3,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'cse-s4-os',
    courseId: 'btech-cse',
    semester: 4,
    subjectName: 'Operating Systems',
    subjectCode: 'CS302',
    credits: 3,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'cse-s4-networks',
    courseId: 'btech-cse',
    semester: 4,
    subjectName: 'Computer Networks',
    subjectCode: 'CS303',
    credits: 3,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'cse-s4-software-eng',
    courseId: 'btech-cse',
    semester: 4,
    subjectName: 'Software Engineering',
    subjectCode: 'CS304',
    credits: 3,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'cse-s4-lab4',
    courseId: 'btech-cse',
    semester: 4,
    subjectName: 'Networks and OS Lab',
    subjectCode: 'CS301L',
    credits: 2,
    isElective: false,
    createdAt: new Date()
  },

  // Semester 5
  {
    id: 'cse-s5-compiler',
    courseId: 'btech-cse',
    semester: 5,
    subjectName: 'Compiler Design',
    subjectCode: 'CS401',
    credits: 3,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'cse-s5-ai',
    courseId: 'btech-cse',
    semester: 5,
    subjectName: 'Artificial Intelligence',
    subjectCode: 'CS402',
    credits: 3,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'cse-s5-web-tech',
    courseId: 'btech-cse',
    semester: 5,
    subjectName: 'Web Technologies',
    subjectCode: 'CS403',
    credits: 3,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'cse-s5-elective1',
    courseId: 'btech-cse',
    semester: 5,
    subjectName: 'Elective I',
    subjectCode: 'CS404',
    credits: 3,
    isElective: true,
    createdAt: new Date()
  },
  {
    id: 'cse-s5-lab5',
    courseId: 'btech-cse',
    semester: 5,
    subjectName: 'Web Technologies Lab',
    subjectCode: 'CS401L',
    credits: 2,
    isElective: false,
    createdAt: new Date()
  },

  // Semester 6
  {
    id: 'cse-s6-ml',
    courseId: 'btech-cse',
    semester: 6,
    subjectName: 'Machine Learning',
    subjectCode: 'CS501',
    credits: 3,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'cse-s6-cyber',
    courseId: 'btech-cse',
    semester: 6,
    subjectName: 'Cybersecurity',
    subjectCode: 'CS502',
    credits: 3,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'cse-s6-mobile',
    courseId: 'btech-cse',
    semester: 6,
    subjectName: 'Mobile Application Development',
    subjectCode: 'CS503',
    credits: 3,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'cse-s6-elective2',
    courseId: 'btech-cse',
    semester: 6,
    subjectName: 'Elective II',
    subjectCode: 'CS504',
    credits: 3,
    isElective: true,
    createdAt: new Date()
  },
  {
    id: 'cse-s6-lab6',
    courseId: 'btech-cse',
    semester: 6,
    subjectName: 'Mobile App Lab',
    subjectCode: 'CS501L',
    credits: 2,
    isElective: false,
    createdAt: new Date()
  },

  // Semester 7
  {
    id: 'cse-s7-project1',
    courseId: 'btech-cse',
    semester: 7,
    subjectName: 'Major Project I',
    subjectCode: 'CS601',
    credits: 4,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'cse-s7-cloud',
    courseId: 'btech-cse',
    semester: 7,
    subjectName: 'Cloud Computing',
    subjectCode: 'CS602',
    credits: 3,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'cse-s7-bigdata',
    courseId: 'btech-cse',
    semester: 7,
    subjectName: 'Big Data Analytics',
    subjectCode: 'CS603',
    credits: 3,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'cse-s7-elective3',
    courseId: 'btech-cse',
    semester: 7,
    subjectName: 'Elective III',
    subjectCode: 'CS604',
    credits: 3,
    isElective: true,
    createdAt: new Date()
  },
  {
    id: 'cse-s7-lab7',
    courseId: 'btech-cse',
    semester: 7,
    subjectName: 'Cloud Computing Lab',
    subjectCode: 'CS601L',
    credits: 2,
    isElective: false,
    createdAt: new Date()
  },

  // Semester 8
  {
    id: 'cse-s8-project2',
    courseId: 'btech-cse',
    semester: 8,
    subjectName: 'Major Project II',
    subjectCode: 'CS701',
    credits: 4,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'cse-s8-iot',
    courseId: 'btech-cse',
    semester: 8,
    subjectName: 'Internet of Things',
    subjectCode: 'CS702',
    credits: 3,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'cse-s8-blockchain',
    courseId: 'btech-cse',
    semester: 8,
    subjectName: 'Blockchain Technology',
    subjectCode: 'CS703',
    credits: 3,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'cse-s8-elective4',
    courseId: 'btech-cse',
    semester: 8,
    subjectName: 'Elective IV',
    subjectCode: 'CS704',
    credits: 3,
    isElective: true,
    createdAt: new Date()
  },
  {
    id: 'cse-s8-lab8',
    courseId: 'btech-cse',
    semester: 8,
    subjectName: 'IoT Lab',
    subjectCode: 'CS701L',
    credits: 2,
    isElective: false,
    createdAt: new Date()
  },

  // BTECH-ECE Subjects (Sample)
  // Semester 1
  {
    id: 'ece-s1-math1',
    courseId: 'btech-ece',
    semester: 1,
    subjectName: 'Mathematics-I',
    subjectCode: 'MATH101',
    credits: 4,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'ece-s1-physics',
    courseId: 'btech-ece',
    semester: 1,
    subjectName: 'Physics',
    subjectCode: 'PHY101',
    credits: 4,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'ece-s1-chemistry',
    courseId: 'btech-ece',
    semester: 1,
    subjectName: 'Chemistry',
    subjectCode: 'CHEM101',
    credits: 3,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'ece-s1-english',
    courseId: 'btech-ece',
    semester: 1,
    subjectName: 'English Communication',
    subjectCode: 'ENG101',
    credits: 2,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'ece-s1-programming',
    courseId: 'btech-ece',
    semester: 1,
    subjectName: 'Programming Fundamentals',
    subjectCode: 'ECE101',
    credits: 3,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'ece-s1-lab1',
    courseId: 'btech-ece',
    semester: 1,
    subjectName: 'Programming Lab',
    subjectCode: 'ECE101L',
    credits: 1,
    isElective: false,
    createdAt: new Date()
  },

  // Add more ECE subjects for other semesters...
  // For brevity, I'll add a few more key subjects

  // Semester 2
  {
    id: 'ece-s2-math2',
    courseId: 'btech-ece',
    semester: 2,
    subjectName: 'Mathematics-II',
    subjectCode: 'MATH102',
    credits: 4,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'ece-s2-circuits',
    courseId: 'btech-ece',
    semester: 2,
    subjectName: 'Basic Electrical Circuits',
    subjectCode: 'ECE102',
    credits: 3,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'ece-s2-electronics',
    courseId: 'btech-ece',
    semester: 2,
    subjectName: 'Basic Electronics',
    subjectCode: 'ECE103',
    credits: 3,
    isElective: false,
    createdAt: new Date()
  },
  {
    id: 'ece-s2-lab2',
    courseId: 'btech-ece',
    semester: 2,
    subjectName: 'Electronics Lab',
    subjectCode: 'ECE102L',
    credits: 2,
    isElective: false,
    createdAt: new Date()
  },

  // Add more subjects for other courses and semesters as needed...
];

export const getSubjectsByCourseAndSemester = (courseId: string, semester: number): SemesterSubject[] => {
  return semesterSubjects.filter(subject => 
    subject.courseId === courseId && subject.semester === semester
  );
};

export const getSubjectsByCourse = (courseId: string): SemesterSubject[] => {
  return semesterSubjects.filter(subject => subject.courseId === courseId);
};

export const getCourseById = (courseId: string): Course | undefined => {
  return courses.find(course => course.id === courseId);
};

export const getBranchById = (branchId: string): Branch | undefined => {
  return branches.find(branch => branch.id === branchId);
};
