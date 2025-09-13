// Setup script for test accounts
// Run this with: node setup-test-accounts.js

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAeoH9hhNKEVUnL4yTKEbsVGSeI15Adjis",
  authDomain: "trackmate-d3d35.firebaseapp.com",
  projectId: "trackmate-d3d35",
  storageBucket: "trackmate-d3d35.firebasestorage.app",
  messagingSenderId: "616295273838",
  appId: "1:616295273838:web:bf5b77dff5ce17f94add7f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const testAccounts = [
  {
    email: 'admin@college.edu',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin'
  },
  {
    email: 'faculty@college.edu',
    password: 'faculty123',
    name: 'Dr. John Smith',
    role: 'faculty'
  },
  {
    email: 'student@college.edu',
    password: 'student123',
    name: 'Alice Johnson',
    role: 'student',
    branch: 'Computer Science'
  },
  {
    email: 'parent@college.edu',
    password: 'parent123',
    name: 'Robert Johnson',
    role: 'parent',
    studentId: 'student@college.edu'
  }
];

async function createTestAccounts() {
  console.log('🚀 Creating test accounts...');
  
  for (const account of testAccounts) {
    try {
      console.log(`Creating ${account.role} account: ${account.email}`);
      
      // Create authentication account
      const userCredential = await createUserWithEmailAndPassword(auth, account.email, account.password);
      const user = userCredential.user;
      
      // Create Firestore document
      const userData = {
        id: user.uid,
        name: account.name,
        email: account.email,
        role: account.role,
        createdAt: new Date(),
        ...(account.branch && { branch: account.branch }),
        ...(account.studentId && { studentId: account.studentId })
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      console.log(`✅ Created ${account.role} account: ${account.email}`);
      
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠️  Account already exists: ${account.email}`);
      } else {
        console.error(`❌ Error creating ${account.email}:`, error.message);
      }
    }
  }
  
  console.log('\n🎉 Test accounts setup complete!');
  console.log('\n📋 Test Credentials:');
  console.log('Admin: admin@college.edu / admin123');
  console.log('Faculty: faculty@college.edu / faculty123');
  console.log('Student: student@college.edu / student123');
  console.log('Parent: parent@college.edu / parent123');
  console.log('\n🌐 Login at: https://trackmate-d3d35.web.app');
}

createTestAccounts().catch(console.error);
