const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: 'AIzaSyAeoH9hhNKEVUnL4yTKEbsVGSeI15Adjis',
  authDomain: 'trackmate-d3d35.firebaseapp.com',
  projectId: 'trackmate-d3d35',
  storageBucket: 'trackmate-d3d35.firebasestorage.app',
  messagingSenderId: '616295273838',
  appId: '1:616295273838:web:bf5b77dff5ce17f94add7f',
  measurementId: 'G-49NYMP5KKS'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const testAccounts = [
  {
    email: 'admin@college.edu',
    password: 'admin123',
    name: 'System Administrator',
    role: 'admin',
    phone: '+1234567890',
    college: 'TrackMate University'
  },
  {
    email: 'faculty@college.edu',
    password: 'faculty123',
    name: 'Dr. John Smith',
    role: 'faculty',
    phone: '+1234567891',
    college: 'TrackMate University',
    branch: 'Computer Science'
  },
  {
    email: 'student@college.edu',
    password: 'student123',
    name: 'Alice Johnson',
    role: 'student',
    phone: '+1234567892',
    college: 'TrackMate University',
    branch: 'Computer Science',
    semester: 'Fall 2024',
    year: '2024',
    parentId: 'parent-uid-will-be-set'
  },
  {
    email: 'parent@college.edu',
    password: 'parent123',
    name: 'Robert Johnson',
    role: 'parent',
    phone: '+1234567893',
    college: 'TrackMate University',
    studentId: 'student-uid-will-be-set'
  }
];

async function createAllAccounts() {
  console.log('🚀 Creating all test accounts...\n');
  
  const createdAccounts = [];
  
  for (const account of testAccounts) {
    try {
      console.log(`Creating ${account.role} account: ${account.email}`);
      
      // Create user in Firebase Auth
      const result = await createUserWithEmailAndPassword(auth, account.email, account.password);
      const user = result.user;
      
      // Prepare user data for Firestore
      const userData = {
        id: user.uid,
        name: account.name,
        email: account.email,
        role: account.role,
        createdAt: new Date(),
        phone: account.phone,
        college: account.college,
        ...(account.branch && { branch: account.branch }),
        ...(account.semester && { semester: account.semester }),
        ...(account.year && { year: account.year }),
        ...(account.parentId && { parentId: account.parentId }),
        ...(account.studentId && { studentId: account.studentId })
      };
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), userData);
      
      createdAccounts.push({ ...userData, password: account.password });
      console.log(`✅ ${account.role} account created: ${account.email}`);
      
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠️  ${account.role} account already exists: ${account.email}`);
        createdAccounts.push({ ...account, id: 'existing' });
      } else {
        console.error(`❌ Error creating ${account.role} account:`, error.message);
      }
    }
  }
  
  // Link parent and student
  const studentAccount = createdAccounts.find(acc => acc.role === 'student');
  const parentAccount = createdAccounts.find(acc => acc.role === 'parent');
  
  if (studentAccount && parentAccount && studentAccount.id !== 'existing' && parentAccount.id !== 'existing') {
    try {
      // Update student with parent ID
      await setDoc(doc(db, 'users', studentAccount.id), {
        ...studentAccount,
        parentId: parentAccount.id
      }, { merge: true });
      
      // Update parent with student ID
      await setDoc(doc(db, 'users', parentAccount.id), {
        ...parentAccount,
        studentId: studentAccount.id
      }, { merge: true });
      
      console.log('✅ Parent and student linked successfully');
    } catch (error) {
      console.log('⚠️  Could not link parent and student:', error.message);
    }
  }
  
  console.log('\n🎉 Account creation complete!');
  console.log('\n📋 Login Credentials:');
  console.log('┌─────────────┬─────────────────────┬─────────────┬─────────────────────────────┐');
  console.log('│ Role        │ Email               │ Password    │ Purpose                     │');
  console.log('├─────────────┼─────────────────────┼─────────────┼─────────────────────────────┤');
  console.log('│ Admin       │ admin@college.edu   │ admin123    │ Manage users, create data   │');
  console.log('│ Faculty     │ faculty@college.edu │ faculty123  │ Start attendance sessions   │');
  console.log('│ Student     │ student@college.edu │ student123  │ Scan QR codes, view records │');
  console.log('│ Parent      │ parent@college.edu  │ parent123   │ Monitor child\'s progress    │');
  console.log('└─────────────┴─────────────────────┴─────────────┴─────────────────────────────┘');
  
  console.log('\n🌐 Website: https://trackmate-d3d35.web.app');
  console.log('🔑 Use admin@college.edu / admin123 to login as admin');
}

createAllAccounts().catch(console.error);
