const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

console.log('🔧 Force updating admin role...');

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

async function forceAdminRole() {
  try {
    console.log('🔐 Signing in as admin...');
    
    const result = await signInWithEmailAndPassword(auth, 'admin@college.edu', 'admin123');
    const user = result.user;
    console.log('✅ Admin signed in successfully');
    console.log('🆔 UID:', user.uid);
    
    // Force create/update admin user with correct role
    const adminData = {
      id: user.uid,
      name: 'System Administrator',
      email: 'admin@college.edu',
      role: 'admin',
      createdAt: new Date(),
      phone: '+1234567890',
      college: 'TrackMate University'
    };
    
    console.log('💾 Force updating admin data in Firestore...');
    await setDoc(doc(db, 'users', user.uid), adminData, { merge: false });
    console.log('✅ Admin data force updated');
    console.log('📋 Admin data:', JSON.stringify(adminData, null, 2));
    
    console.log('\n🎉 ADMIN ROLE FORCE UPDATED!');
    console.log('┌─────────────────────┬─────────────┬─────────────────┐');
    console.log('│ Email               │ Password    │ Role            │');
    console.log('├─────────────────────┼─────────────┼─────────────────┤');
    console.log('│ admin@college.edu   │ admin123    │ admin           │');
    console.log('└─────────────────────┴─────────────┴─────────────────┘');
    console.log('\n🌐 Login at: https://trackmate-d3d35.web.app');
    console.log('🔑 You should now be redirected to admin dashboard');
    
  } catch (error) {
    console.error('❌ Error force updating admin role:', error.message);
  }
}

forceAdminRole().then(() => {
  console.log('✅ Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});
