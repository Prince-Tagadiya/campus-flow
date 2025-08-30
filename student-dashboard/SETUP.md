# 🚀 Quick Setup Guide

## Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

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

## Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables** (see above)

3. **Run the development server:**

   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `http://localhost:3000/auth/signin`

## MongoDB Setup

1. Create MongoDB Atlas account or use local MongoDB
2. Get connection string
3. Update `MONGODB_URI` in `.env.local`

## Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Then add it to `NEXTAUTH_SECRET` in your `.env.local` file.
