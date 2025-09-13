const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyAeoH9hhNKEVUnL4yTKEbsVGSeI15Adjis',
  authDomain: 'trackmate-d3d35.firebaseapp.com',
  projectId: 'trackmate-d3d35',
  storageBucket: 'trackmate-d3d35.firebasestorage.app',
  messagingSenderId: '616295273838',
  appId: '1:616295273838:web:bf5b77dff5ce17f94add7f',
  measurementId: 'G-49NYMP5KKS'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const accounts = [
  {
    email: 'faculty@college.edu',
    password: 'faculty123',
    name: 'Dr. John Smith',
    role: 'faculty',
    branch: 'Computer Science'
  },
  {
    email: 'student@college.edu',
    password: 'student123',
    name: 'Alice Johnson',
    role: 'student',
    branch: 'Computer Science',
    semester: 'Fall 2024',
    year: '2024'
  },
  {
    email: 'parent@college.edu',
    password: 'parent123',
    name: 'Robert Johnson',
    role: 'parent'
  }
];

async function createAccounts() {
  console.log('Creating additional test accounts...\n');
  
  for (const account of accounts) {
    try {
      const result = await createUserWithEmailAndPassword(auth, account.email, account.password);
      const user = result.user;
      
      const userData = {
        id: user.uid,
        name: account.name,
        email: account.email,
        role: account.role,
        createdAt: new Date(),
        phone: '+1234567890',
        college: 'TrackMate University',
        ...(account.branch && { branch: account.branch }),
        ...(account.semester && { semester: account.semester }),
        ...(account.year && { year: account.year })
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      console.log(`✅ ${account.role} account created: ${account.email}`);
      
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠️  ${account.role} account already exists: ${account.email}`);
      } else {
        console.error(`❌ Error creating ${account.role}:`, error.message);
      }
    }
  }
  
  console.log('\n🎉 All accounts ready!');
  console.log('\n📋 Test Credentials:');
  console.log('┌─────────────┬─────────────────────┬─────────────┐');
  console.log('│ Role        │ Email               │ Password    │');
  console.log('├─────────────┼─────────────────────┼─────────────┤');
  console.log('│ Admin       │ admin@college.edu   │ admin123    │');
  console.log('│ Faculty     │ faculty@college.edu │ faculty123  │');
  console.log('│ Student     │ student@college.edu │ student123  │');
  console.log('│ Parent      │ parent@college.edu  │ parent123   │');
  console.log('└─────────────┴─────────────────────┴─────────────┘');
  console.log('\n🌐 Website: https://trackmate-d3d35.web.app');
}

createAccounts();
