# 🎓 CampusFlow - Student Dashboard

A modern, responsive student management dashboard built with Next.js, React, and the MERN stack. Features Google OAuth authentication, assignment tracking, deadline countdowns, and comprehensive progress analytics.

## ✨ Features

### 🚀 Core Functionality

- **Google OAuth Authentication** - Secure login with Google accounts
- **Assignment Management** - Upload, track, and manage assignments
- **Deadline Countdown** - Real-time countdown for upcoming deadlines
- **Progress Tracking** - Visual progress charts and statistics
- **Storage Management** - Monitor file storage usage with alerts
- **Interactive Calendar** - Month view with assignment highlights

### 🎨 Design Features

- **Modern UI/UX** - Clean, card-based design inspired by Notion/Trello
- **Orange Theme** - Consistent orange accent colors throughout
- **Responsive Design** - Works perfectly on all devices
- **Smooth Animations** - Hover effects and transitions
- **Professional Typography** - Inter and Poppins font families

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router) + React + TypeScript
- **Styling**: Tailwind CSS + Custom CSS Variables
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: MongoDB with Mongoose
- **Charts**: Recharts for progress visualization
- **Icons**: Lucide React + Heroicons
- **Date Handling**: date-fns

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database
- Google OAuth credentials

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd student-dashboard
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# MongoDB
MONGODB_URI=your_mongodb_connection_string_here

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `http://localhost:3000/auth/signin`

### 5. MongoDB Setup

1. Create a MongoDB Atlas account or use local MongoDB
2. Get your connection string
3. Update `MONGODB_URI` in `.env.local`

### 6. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Application Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── auth/          # NextAuth configuration
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/             # React components
│   ├── dashboard/         # Dashboard components
│   │   ├── HeroCountdown.tsx
│   │   ├── AssignmentsCard.tsx
│   │   ├── StorageCard.tsx
│   │   ├── ProgressCard.tsx
│   │   ├── CalendarCard.tsx
│   │   └── UploadModal.tsx
│   ├── providers/         # Context providers
│   │   └── AuthProvider.tsx
│   ├── ui/                # UI components
│   │   └── LoadingSpinner.tsx
│   ├── Dashboard.tsx      # Main dashboard
│   └── LoginPage.tsx      # Login page
├── lib/                    # Utility functions
│   └── mongodb.ts         # MongoDB connection
└── types/                  # TypeScript types
    └── index.ts           # Type definitions
```

## 🎯 Key Components

### Hero Countdown

- Full-width countdown timer for nearest deadline
- Color-coded urgency levels (normal, urgent, overdue)
- Real-time countdown with days, hours, minutes, seconds

### Assignments Management

- Table view with title, due date, status, and actions
- Status chips: Pending (gray), Submitted (green), Overdue (red)
- Action buttons: Upload, View, Submit Now
- Search functionality and summary statistics

### Storage Usage

- Progress bar showing used vs. total storage
- Color-coded alerts (green: normal, orange: warning, red: exceeded)
- Helpful storage tips when near limit

### Progress Tracker

- Circular progress chart with orange fill
- Statistics for submitted, pending, and total assignments
- Motivational messages based on completion percentage

### Interactive Calendar

- Month view with assignment indicators
- Hover details showing assignment information
- Navigation between months
- Color-coded event indicators

## 🔐 Authentication Flow

1. User visits the application
2. Redirected to login page if not authenticated
3. Google OAuth sign-in process
4. Redirected to dashboard upon successful authentication
5. Session management with NextAuth.js

## 📊 Data Models

### Assignment

```typescript
interface Assignment {
  id: string;
  title: string;
  dueDate: Date;
  status: 'pending' | 'submitted' | 'overdue';
  fileUrl?: string;
  fileName?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### User

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}
```

## 🎨 Customization

### Colors

The application uses CSS custom properties for easy theming:

```css
:root {
  --primary-orange: #ff6b35;
  --primary-orange-light: #ff8c42;
  --primary-orange-dark: #e55a2b;
  --background: #ffffff;
  --background-secondary: #f8fafc;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
}
```

### Components

Custom Tailwind components are defined in `globals.css`:

- `.btn-primary` - Orange gradient buttons
- `.btn-secondary` - Outline buttons
- `.card` - Card containers
- `.input-field` - Form inputs
- `.status-chip` - Status indicators

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy automatically

### Other Platforms

- Update `NEXTAUTH_URL` in environment variables
- Ensure MongoDB connection is accessible
- Configure Google OAuth redirect URIs

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Adding New Features

1. Create component in appropriate directory
2. Add TypeScript types if needed
3. Update main Dashboard component
4. Test with mock data
5. Integrate with backend when ready

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For questions or issues:

1. Check the documentation
2. Search existing issues
3. Create a new issue with details

---

**Built with ❤️ for modern student management solutions**
