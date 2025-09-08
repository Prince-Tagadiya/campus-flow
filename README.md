# 🎓 CampusFlow - Modern Student Management System

[![React](https://img.shields.io/badge/React-18.0+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0+-38B2AC.svg)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Hosting-orange.svg)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Transform your academic life with CampusFlow** - A comprehensive, modern student management system built with React, TypeScript, and Firebase.

![CampusFlow Dashboard](https://via.placeholder.com/800x400/ff6b35/ffffff?text=CampusFlow+Dashboard)

## ✨ Features

### 🎯 **Smart Dashboard**
- **Dynamic Widget System**: Customizable dashboard with draggable cards
- **Real-time Updates**: Live data synchronization across all components
- **Responsive Design**: Beautiful UI that works on all devices
- **Customization Mode**: Add/remove widgets with a simple toggle

### 📚 **Assignment Management**
- **Smart Priority System**: Automatic priority calculation based on deadlines
- **PDF Support**: Upload and view PDF assignments directly in the app
- **Deadline Tracking**: Visual countdown timers with color-coded urgency
- **Subject Organization**: Categorize assignments by subject for better organization
- **Status Management**: Track pending, completed, and overdue assignments

### 📝 **Exam Planning**
- **Exam Calendar**: Visual timeline of upcoming exams
- **Room & Time Details**: Complete exam information at a glance
- **Subject Integration**: Link exams to specific subjects
- **Countdown Widgets**: Days remaining until next exam prominently displayed

### 📖 **Study Materials**
- **File Management**: Upload and organize study materials
- **Subject Filtering**: Filter materials by subject for quick access
- **Upload Date Sorting**: Sort materials by newest/oldest
- **Storage Tracking**: Monitor your storage usage with visual indicators

### 🔔 **Smart Notifications**
- **Real-time Alerts**: Instant notifications for deadlines and updates
- **Unread Count**: Track pending notifications with badge indicators
- **Action Buttons**: Mark as read, delete, or mark all as read
- **Priority Notifications**: High-priority alerts for urgent deadlines

### 💾 **Storage Management**
- **Visual Storage Bar**: Real-time storage usage with color-coded alerts
- **File Size Tracking**: Monitor individual file sizes and total usage
- **Storage Limits**: Set and track storage quotas
- **Cleanup Tools**: Easy file management and deletion

### ⚙️ **Advanced Settings**
- **Priority Thresholds**: Configure automatic priority calculation rules
- **Semester Management**: Switch between semesters with data backup
- **Export Functionality**: Download your data as backup files
- **Customizable UI**: Personalize dashboard layout and appearance

### 🔐 **Authentication & Security**
- **Google Sign-in**: Secure authentication with Google accounts
- **User Profiles**: Personalized experience for each student
- **Data Privacy**: Secure data storage with Firebase
- **Session Management**: Automatic login state management

## 🚀 **Quick Start**

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Firebase account

### Installation

```bash
# Clone the repository
git clone https://github.com/Prince-Tagadiya/campus-flow.git

# Navigate to the project
cd campus-flow/campusflow

# Install dependencies
npm install

# Start development server
npm start
```

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and Hosting
3. Copy your Firebase config to `src/firebase/config.ts`
4. Deploy to Firebase:

```bash
npm run build
firebase deploy
```

## 🎨 **UI/UX Features**

### **Modern Design Language**
- **Clean Interface**: Minimalist design with focus on usability
- **Orange Theme**: Professional color scheme (#ff6b35)
- **Smooth Animations**: CSS transitions and hover effects
- **Responsive Grid**: Adaptive layout for all screen sizes

### **Interactive Elements**
- **Hover Effects**: Subtle animations on interactive elements
- **Clickable Widgets**: Dashboard cards that navigate to detailed views
- **Drag & Drop**: Reorder dashboard widgets in customization mode
- **Smooth Transitions**: Fluid page transitions and state changes

### **Accessibility**
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels and semantic HTML
- **High Contrast**: Readable text and clear visual hierarchy
- **Mobile Optimized**: Touch-friendly interface elements

## 📱 **Responsive Design**

- **Desktop**: Full-featured dashboard with sidebar navigation
- **Tablet**: Optimized layout for medium screens
- **Mobile**: Collapsible sidebar with touch-optimized controls
- **Cross-Platform**: Consistent experience across all devices

## 🔧 **Technical Architecture**

### **Frontend Stack**
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development with interfaces and types
- **Tailwind CSS**: Utility-first CSS framework for rapid development
- **Heroicons**: Beautiful SVG icons for consistent design

### **State Management**
- **React Hooks**: useState, useEffect for local state management
- **Context API**: Global state for authentication and user data
- **Local Storage**: Persistent dashboard configurations
- **Firebase Realtime**: Live data synchronization

### **Performance Features**
- **Code Splitting**: Lazy loading for optimal performance
- **Optimized Builds**: Production-ready builds with minification
- **Image Optimization**: Responsive images and lazy loading
- **Caching**: Smart caching strategies for better UX

## 🌟 **Key Benefits**

### **For Students**
- **Organization**: Keep all academic tasks in one place
- **Productivity**: Never miss deadlines with smart reminders
- **Accessibility**: Access your dashboard from any device
- **Customization**: Personalize your learning experience

### **For Educators**
- **Student Tracking**: Monitor student progress and engagement
- **Assignment Management**: Easy assignment creation and tracking
- **Communication**: Direct notification system for updates
- **Analytics**: Insights into student performance patterns

## 📊 **Dashboard Widgets**

### **Core Widgets**
1. **Welcome Card**: Personalized greeting with upcoming assignments
2. **Deadlines Widget**: Visual countdown for next assignment
3. **Next Exam**: Days remaining with subject information
4. **Quick Stats**: Overview of assignments and completion rates
5. **Storage Usage**: Visual storage consumption indicator
6. **Notifications**: Recent alerts and updates

### **Customization Options**
- **Add/Remove**: Toggle widgets on/off as needed
- **Reorder**: Drag and drop to arrange widgets
- **Size Control**: Different widget sizes for layout flexibility
- **Personal Layout**: Save your preferred dashboard configuration

## 🔄 **Data Management**

### **Backup & Export**
- **Semester Backup**: Automatic data backup when switching semesters
- **JSON Export**: Download your complete data for safekeeping
- **Import Support**: Restore data from backup files
- **Cloud Sync**: Automatic synchronization across devices

### **Data Persistence**
- **Local Storage**: Dashboard preferences and settings
- **Firebase Database**: Secure cloud storage for academic data
- **Real-time Updates**: Live synchronization of all changes
- **Offline Support**: Basic functionality when offline

## 🚀 **Deployment**

### **Firebase Hosting**
- **Automatic Deploy**: GitHub Actions for continuous deployment
- **Global CDN**: Fast loading from anywhere in the world
- **SSL Security**: HTTPS by default for all connections
- **Custom Domain**: Support for custom domain names

### **CI/CD Pipeline**
- **GitHub Actions**: Automated testing and deployment
- **Build Optimization**: Production-ready builds on every push
- **Quality Checks**: Linting and type checking before deployment
- **Rollback Support**: Easy rollback to previous versions

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### **Development Setup**
```bash
# Fork the repository
# Create a feature branch
git checkout -b feature/amazing-feature

# Make your changes
# Commit with descriptive messages
git commit -m "feat: add amazing feature"

# Push to your fork
git push origin feature/amazing-feature

# Create a Pull Request
```

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **React Team**: For the amazing framework
- **Tailwind CSS**: For the utility-first CSS approach
- **Firebase**: For the robust backend services
- **Heroicons**: For the beautiful icon set

## 📞 **Support & Contact**

- **GitHub Issues**: [Report bugs or request features](https://github.com/Prince-Tagadiya/campus-flow/issues)
- **Discussions**: [Join the community](https://github.com/Prince-Tagadiya/campus-flow/discussions)
- **Email**: [Contact the team](mailto:support@campusflow.com)

---

<div align="center">

**Built with ❤️ by the CampusFlow Team**

[![GitHub stars](https://img.shields.io/github/stars/Prince-Tagadiya/campus-flow?style=social)](https://github.com/Prince-Tagadiya/campus-flow)
[![GitHub forks](https://img.shields.io/github/forks/Prince-Tagadiya/campus-flow?style=social)](https://github.com/Prince-Tagadiya/campus-flow)
[![GitHub issues](https://img.shields.io/github/issues/Prince-Tagadiya/campus-flow)](https://github.com/Prince-Tagadiya/campus-flow/issues)

**Star this repository if it helped you! ⭐**

</div>

## 🔧 Environment Variables

Create a `.env` file inside `campusflow/` (not committed):

```
REACT_APP_GEMINI_API_KEY=your_gemini_key
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
```

Tip: For local testing you can also set the Gemini key at runtime in DevTools:

```js
localStorage.setItem('REACT_APP_GEMINI_API_KEY','your_gemini_key');
location.reload();
```

## 🚀 Firebase Deployment (from `campusflow/`)

```bash
npm run build
firebase deploy
```

## 🛡️ Anti‑cloning Guidance

You cannot make a pure frontend truly unclonable, but you can raise the bar:

- Use a restrictive license and keep the repo private where possible
- Gate premium/AI features via a backend token and origin allowlist
- Never ship secrets in the repo; load from env or server and rotate keys
- Enforce strict Firebase security rules for authenticated access only
- Optional obfuscation/watermarking can deter casual copying (not bulletproof)
