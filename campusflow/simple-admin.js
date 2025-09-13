// Simple admin account creation with timeout
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

console.log('🚀 Starting admin account creation...');

const firebaseConfig = {
  apiKey: 'AIzaSyAeoH9hhNKEVUnL4yTKEbsVGSeI15Adjis',
  authDomain: 'trackmate-d3d35.firebaseapp.com',
  projectId: 'trackmate-d3d35',
  storageBucket: 'trackmate-d3d35.firebasestorage.app',
  messagingSenderId: '616295273838',
  appId: '1:616295273838:web:bf5b77dff5ce17f94add7f',
  measurementId: 'G-49NYMP5KKS'
};

try {
  console.log('📡 Initializing Firebase...');
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  
  console.log('✅ Firebase initialized successfully');
  
  // Set a timeout for the entire operation
  const timeout = setTimeout(() => {
    console.log('⏰ Operation timed out after 30 seconds');
    process.exit(1);
  }, 30000);
  
  createAdminAccount(auth, db).then(() => {
    clearTimeout(timeout);
    console.log('🎉 Script completed successfully');
    process.exit(0);
  }).catch((error) => {
    clearTimeout(timeout);
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  });
  
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  process.exit(1);
}

async function createAdminAccount(auth, db) {
  try {
    console.log('👤 Creating admin account...');
    
    const result = await createUserWithEmailAndPassword(auth, 'admin@college.edu', 'admin123');
    const user = result.user;
    console.log('✅ Admin user created in Firebase Auth');
    
    const adminData = {
      id: user.uid,
      name: 'System Administrator',
      email: 'admin@college.edu',
      role: 'admin',
      createdAt: new Date(),
      phone: '+1234567890',
      college: 'TrackMate University'
    };
    
    console.log('💾 Saving admin data to Firestore...');
    await setDoc(doc(db, 'users', user.uid), adminData);
    console.log('✅ Admin data saved to Firestore');
    
    console.log('\n🎉 ADMIN ACCOUNT CREATED SUCCESSFULLY!');
    console.log('┌─────────────────────┬─────────────┬─────────────────┐');
    console.log('│ Email               │ Password    │ Role            │');
    console.log('├─────────────────────┼─────────────┼─────────────────┤');
    console.log('│ admin@college.edu   │ admin123    │ admin           │');
    console.log('└─────────────────────┴─────────────┴─────────────────┘');
    console.log('\n🌐 Login at: https://trackmate-d3d35.web.app');
    console.log('🔑 Use the credentials above to login as admin');
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('⚠️  Admin account already exists!');
      console.log('\n🎉 ADMIN ACCOUNT READY!');
      console.log('┌─────────────────────┬─────────────┬─────────────────┐');
      console.log('│ Email               │ Password    │ Role            │');
      console.log('├─────────────────────┼─────────────┼─────────────────┤');
      console.log('│ admin@college.edu   │ admin123    │ admin           │');
      console.log('└─────────────────────┴─────────────┴─────────────────┘');
      console.log('\n🌐 Login at: https://trackmate-d3d35.web.app');
      console.log('🔑 Use the credentials above to login as admin');
    } else {
      console.error('❌ Error creating admin account:', error.message);
      throw error;
    }
  }
}
