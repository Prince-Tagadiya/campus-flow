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

async function createAdminAccount() {
  try {
    console.log('Creating admin account...');
    
    // Create admin user in Firebase Auth
    const result = await createUserWithEmailAndPassword(auth, 'admin@trackmate.com', 'admin123');
    const user = result.user;
    console.log('Admin user created in Firebase Auth:', user.email);

    // Create admin user document in Firestore
    const adminUser = {
      id: user.uid,
      name: 'System Administrator',
      email: 'admin@trackmate.com',
      role: 'admin',
      createdAt: new Date(),
      phone: '+1234567890',
      college: 'TrackMate University'
    };

    await setDoc(doc(db, 'users', user.uid), adminUser);
    console.log('Admin user document created in Firestore');

    console.log('\n✅ Admin account created successfully!');
    console.log('📧 Email: admin@trackmate.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: admin');
    console.log('\nYou can now login to the system and create other accounts.');

  } catch (error) {
    console.error('Error creating admin account:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('\n⚠️  Admin account already exists!');
      console.log('📧 Email: admin@trackmate.com');
      console.log('🔑 Password: admin123');
    }
  }
}

createAdminAccount();
