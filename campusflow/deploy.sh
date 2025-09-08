#!/bin/bash

# CampusFlow Deployment Script
echo "🚀 Starting CampusFlow deployment to Firebase..."

# Build the React app
echo "📦 Building React application..."
npm run build

# Copy backup files to build directory
echo "📋 Copying backup files (if present)..."
[ -f public/backup-manager.html ] && cp public/backup-manager.html build/backup-manager.html || echo "(skip) backup-manager.html not found"
[ -f public/backup-viewer.html ] && cp public/backup-viewer.html build/backup-viewer.html || echo "(skip) backup-viewer.html not found"

# Deploy to Firebase
echo "🔥 Deploying Hosting to Firebase (storage excluded)..."
firebase deploy --only hosting

echo "✅ Deployment complete!"
echo "🌐 Your app is live at: https://campus-flow-a01a1.web.app"
echo "🔧 Backup manager: https://campus-flow-a01a1.web.app/backup-manager.html"
echo "👁️ Backup viewer: https://campus-flow-a01a1.web.app/backup-viewer.html"
