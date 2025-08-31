// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAlt64M4TtqwtzGiLnOhKcCK8FUz2yAx3E",
  authDomain: "campus-flow-a01a1.firebaseapp.com",
  projectId: "campus-flow-a01a1",
  storageBucket: "campus-flow-a01a1.firebasestorage.app",
  messagingSenderId: "1072114090918",
  appId: "1:1072114090918:web:a5d30fc6f9010941df4567"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = firebase.auth();

// Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Authentication state observer
auth.onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in
    console.log('User signed in:', user.displayName);
    showUserDashboard(user);
  } else {
    // User is signed out
    console.log('User signed out');
    showLoginPage();
  }
});

// Function to handle Google Sign In
function signInWithGoogle() {
  auth.signInWithPopup(googleProvider)
    .then((result) => {
      // This gives you a Google Access Token
      const credential = result.credential;
      const token = credential.accessToken;
      const user = result.user;
      console.log('Successfully signed in:', user);
    })
    .catch((error) => {
      console.error('Error signing in:', error);
      alert('Sign in failed: ' + error.message);
    });
}

// Function to sign out
function signOut() {
  auth.signOut()
    .then(() => {
      console.log('User signed out');
    })
    .catch((error) => {
      console.error('Error signing out:', error);
    });
}

// Function to show user dashboard
function showUserDashboard(user) {
  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    mainContent.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-orange-50 to-white p-8">
        <div class="max-w-6xl mx-auto">
          <!-- Header -->
          <div class="flex justify-between items-center mb-8">
            <h1 class="text-3xl font-bold text-gray-800">Welcome, ${user.displayName}!</h1>
            <button onclick="signOut()" class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors">
              Sign Out
            </button>
          </div>
          
          <!-- Dashboard Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Hero Countdown Card -->
            <div class="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
              <h3 class="text-xl font-semibold text-gray-800 mb-4">⏰ Next Deadline</h3>
              <div class="text-center">
                <div class="text-4xl font-bold text-orange-500 mb-2">5 days</div>
                <p class="text-gray-600">Physics Assignment</p>
              </div>
            </div>
            
            <!-- Assignments Card -->
            <div class="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
              <h3 class="text-xl font-semibold text-gray-800 mb-4">📚 Assignments</h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-gray-700">Total</span>
                  <span class="font-semibold">12</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-700">Pending</span>
                  <span class="text-orange-500 font-semibold">5</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-700">Completed</span>
                  <span class="text-green-500 font-semibold">7</span>
                </div>
              </div>
            </div>
            
            <!-- Storage Card -->
            <div class="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
              <h3 class="text-xl font-semibold text-gray-800 mb-4">💾 Storage</h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-gray-700">Used</span>
                  <span class="font-semibold">450MB</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-orange-500 h-2 rounded-full" style="width: 90%"></div>
                </div>
                <p class="text-sm text-gray-500">90% of 500MB used</p>
              </div>
            </div>
            
            <!-- Progress Card -->
            <div class="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
              <h3 class="text-xl font-semibold text-gray-800 mb-4">📊 Progress</h3>
              <div class="text-center">
                <div class="text-4xl font-bold text-purple-500 mb-2">85%</div>
                <p class="text-gray-600">Course Completion</p>
              </div>
            </div>
            
            <!-- Calendar Card -->
            <div class="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-indigo-500">
              <h3 class="text-xl font-semibold text-gray-800 mb-4">📅 This Week</h3>
              <div class="space-y-2">
                <div class="flex items-center space-x-2">
                  <div class="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span class="text-sm text-gray-700">3 assignments due</span>
                </div>
                <div class="flex items-center space-x-2">
                  <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span class="text-sm text-gray-700">2 exams scheduled</span>
                </div>
              </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">
              <h3 class="text-xl font-semibold text-gray-800 mb-4">⚡ Quick Actions</h3>
              <div class="space-y-3">
                <button class="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition-colors">
                  Upload Assignment
                </button>
                <button class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors">
                  View Calendar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

// Function to show login page
function showLoginPage() {
  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    // This will show the original landing page content
    // The page will reload and show the original content
    window.location.reload();
  }
}
