# CampusFlow - Student Dashboard

A modern, responsive student dashboard built with Next.js, React, and Firebase. Features include assignment management, deadline tracking, progress analytics, and Google OAuth authentication.

## ✨ Features

- **🎯 Hero Countdown Card** - Large text showing nearest deadline with urgency-based colors
- **📚 Assignment Management** - Upload, track, and manage assignments with status tracking
- **⏰ Deadline Tracking** - Smart countdown system with visual indicators
- **📊 Progress Analytics** - Visual insights into academic performance
- **📅 Interactive Calendar** - Month view with assignment highlights
- **🔐 Google OAuth** - Secure authentication powered by NextAuth.js
- **📱 Responsive Design** - Works perfectly on all devices
- **🎨 Modern UI** - Orange-accented theme with smooth animations

## 🛠️ Tech Stack

- **Frontend**: React + Next.js (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Authentication**: NextAuth.js + Google OAuth
- **Database**: Firebase Firestore (NoSQL)
- **Storage**: Firebase Storage
- **Charts**: Recharts for progress tracking
- **Icons**: Lucide React + Heroicons
- **Deployment**: Firebase Hosting

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Prince-Tagadiya/campus-flow.git
   cd campus-flow/student-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env.local
   
   # Edit .env.local with your actual values
   nano .env.local
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Environment Variables

### Required Variables
Create a `.env.local` file with the following variables:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### 🔒 Security Important Notes
- **NEVER commit `.env.local` to GitHub** - it contains your secrets!
- The `.env*` files are already in `.gitignore` for security
- Use `.env.example` as a template (safe to commit)
- Keep your actual secrets private and secure

## 🔥 Firebase Setup

1. **Create a Firebase project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Follow the setup wizard

2. **Enable required services**
   - **Authentication** → Enable Google sign-in
   - **Firestore Database** → Create database
   - **Storage** → Enable storage

3. **Get your Firebase config**
   - Project settings → General → Your apps
   - Copy the config object

4. **Set up Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs

## 🚀 Deployment

### Firebase Hosting
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init hosting

# Deploy to Firebase
firebase deploy --only hosting
```

### Environment Variables in Production
- Set environment variables in your hosting platform
- For Firebase, use Firebase Functions or set them in the hosting configuration
- Never expose secrets in client-side code

## 📁 Project Structure

```
student-dashboard/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/          # React components
│   │   ├── dashboard/       # Dashboard-specific components
│   │   ├── providers/       # Context providers
│   │   └── ui/             # Reusable UI components
│   ├── lib/                 # Utility functions
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets
├── .env.example            # Environment template (safe to commit)
├── .env.local              # Your actual secrets (NEVER commit)
└── .gitignore              # Git ignore rules
```

## 🔒 Security Best Practices

1. **Environment Variables**
   - Use `.env.local` for local development
   - Use `.env.example` as a template
   - Never commit actual secrets

2. **Firebase Security Rules**
   - Set up proper Firestore security rules
   - Restrict access to authenticated users only
   - Validate data on both client and server

3. **Authentication**
   - Use NextAuth.js for secure authentication
   - Implement proper session management
   - Add rate limiting for auth endpoints

## 🎨 UI Components

- **HeroCountdown** - Deadline countdown with urgency colors
- **AssignmentsCard** - Assignment management table
- **StorageCard** - Storage usage progress bar
- **ProgressCard** - Circular progress chart
- **CalendarCard** - Interactive month view calendar
- **UploadModal** - File upload interface

## 🐛 Troubleshooting

### Common Issues

1. **Environment variables not loading**
   - Ensure `.env.local` exists in root directory
   - Restart your development server
   - Check variable names match exactly

2. **Firebase connection errors**
   - Verify API keys are correct
   - Check Firebase project settings
   - Ensure services are enabled

3. **Build errors**
   - Clear `.next` folder: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔐 Security

If you discover any security-related issues, please email security@campusflow.com instead of using the issue tracker.

---

**Remember: Keep your secrets safe and never commit them to version control! 🔐**
