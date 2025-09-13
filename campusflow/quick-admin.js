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

async function createAdmin() {
  try {
    console.log('Creating admin account...');
    
    const result = await createUserWithEmailAndPassword(auth, 'admin@college.edu', 'admin123');
    const user = result.user;
    
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
    
    console.log('✅ Admin account created!');
    console.log('📧 Email: admin@college.edu');
    console.log('🔑 Password: admin123');
    console.log('🌐 Login at: https://trackmate-d3d35.web.app');
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('✅ Admin account already exists!');
      console.log('📧 Email: admin@college.edu');
      console.log('🔑 Password: admin123');
      console.log('🌐 Login at: https://trackmate-d3d35.web.app');
    } else {
      console.error('Error:', error.message);
    }
  }
}

createAdmin();
