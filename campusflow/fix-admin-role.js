const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');

console.log('🔧 Fixing admin account role...');

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

async function fixAdminRole() {
  try {
    console.log('🔐 Signing in as admin...');
    
    // Sign in as admin
    const result = await signInWithEmailAndPassword(auth, 'admin@college.edu', 'admin123');
    const user = result.user;
    console.log('✅ Admin signed in successfully');
    
    // Check current user data
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('📋 Current user data:', userData);
      
      // Update user role to admin
      const updatedUserData = {
        ...userData,
        role: 'admin',
        name: 'System Administrator',
        email: 'admin@college.edu',
        phone: '+1234567890',
        college: 'TrackMate University'
      };
      
      await setDoc(doc(db, 'users', user.uid), updatedUserData);
      console.log('✅ Admin role updated successfully');
      console.log('📋 Updated user data:', updatedUserData);
      
    } else {
      console.log('📝 Creating new admin user document...');
      const adminData = {
        id: user.uid,
        name: 'System Administrator',
        email: 'admin@college.edu',
        role: 'admin',
        createdAt: new Date(),
        phone: '+1234567890',
        college: 'TrackMate University'
      };
      
      await setDoc(doc(db, 'users', user.uid), adminData);
      console.log('✅ Admin user document created');
      console.log('📋 Admin data:', adminData);
    }
    
    console.log('\n🎉 ADMIN ACCOUNT FIXED!');
    console.log('┌─────────────────────┬─────────────┬─────────────────┐');
    console.log('│ Email               │ Password    │ Role            │');
    console.log('├─────────────────────┼─────────────┼─────────────────┤');
    console.log('│ admin@college.edu   │ admin123    │ admin           │');
    console.log('└─────────────────────┴─────────────┴─────────────────┘');
    console.log('\n🌐 Login at: https://trackmate-d3d35.web.app');
    console.log('🔑 You should now be redirected to admin dashboard');
    
  } catch (error) {
    console.error('❌ Error fixing admin role:', error.message);
  }
}

fixAdminRole().then(() => {
  console.log('✅ Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});
