'use client';

import { signIn } from 'next-auth/react';
import { GraduationCap, BookOpen, Calendar, BarChart3 } from 'lucide-react';

export function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-2xl">
              <GraduationCap className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-orange-600">CampusFlow</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your modern student dashboard for organizing assignments, tracking
            deadlines, and managing academic progress.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
            <div className="flex items-center mb-4">
              <BookOpen className="h-8 w-8 text-orange-500 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">
                Assignment Management
              </h3>
            </div>
            <p className="text-gray-600">
              Upload, track, and manage all your assignments in one place.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
            <div className="flex items-center mb-4">
              <Calendar className="h-8 w-8 text-orange-500 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">
                Deadline Tracking
              </h3>
            </div>
            <p className="text-gray-600">
              Never miss a deadline with our smart countdown system.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
            <div className="flex items-center mb-4">
              <BarChart3 className="h-8 w-8 text-orange-500 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">
                Progress Analytics
              </h3>
            </div>
            <p className="text-gray-600">
              Visual insights into your academic performance and progress.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
            <div className="flex items-center mb-4">
              <GraduationCap className="h-8 w-8 text-orange-500 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">
                Smart Organization
              </h3>
            </div>
            <p className="text-gray-600">
              AI-powered suggestions for better study planning and organization.
            </p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="btn-primary text-lg px-8 py-4 flex items-center justify-center mx-auto"
          >
            <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>
          <p className="text-gray-500 mt-4">
            Secure authentication powered by Google OAuth
          </p>
        </div>
      </div>
    </div>
  );
}
