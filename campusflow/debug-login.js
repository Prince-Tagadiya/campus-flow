const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');

console.log('🔍 Debugging admin login...');

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

async function debugLogin() {
  try {
    console.log('🔐 Signing in as admin...');
    
    const result = await signInWithEmailAndPassword(auth, 'admin@college.edu', 'admin123');
    const user = result.user;
    console.log('✅ Admin signed in successfully');
    console.log('📧 Email:', user.email);
    console.log('🆔 UID:', user.uid);
    
    // Check if user exists in Firestore
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('📋 Current Firestore data:', JSON.stringify(userData, null, 2));
        console.log('👤 Role from Firestore:', userData.role);
      } else {
        console.log('❌ No user document in Firestore');
      }
    } catch (firestoreError) {
      console.log('❌ Firestore error:', firestoreError.message);
    }
    
    // Test the logic from AuthContext
    const isAdmin = user.email === 'admin@college.edu';
    console.log('🔍 Email check result:', isAdmin);
    console.log('📧 User email:', user.email);
    console.log('📧 Expected email:', 'admin@college.edu');
    console.log('📧 Emails match:', user.email === 'admin@college.edu');
    
    if (isAdmin) {
      console.log('✅ Email-based admin detection works');
    } else {
      console.log('❌ Email-based admin detection failed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugLogin().then(() => {
  console.log('✅ Debug completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Debug failed:', error.message);
  process.exit(1);
});
