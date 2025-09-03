import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  AcademicCapIcon,
  ClockIcon,
  CreditCardIcon,
  ChartBarIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

const LandingPage: React.FC = () => {
  const { signInWithGoogle } = useAuth();

  const features = [
    {
      icon: AcademicCapIcon,
      title: 'Assignment Tracker',
      description:
        'Upload and track all your assignments with deadlines and progress monitoring.',
    },
    {
      icon: ClockIcon,
      title: 'Deadline Reminders',
      description:
        'Never miss a deadline with smart notifications and countdown timers.',
    },
    {
      icon: CreditCardIcon,
      title: 'Parent Recharge',
      description:
        'Seamless payment system for parents to recharge student accounts.',
    },
    {
      icon: ChartBarIcon,
      title: 'Smart Dashboard',
      description:
        'Personalized dashboard with analytics and performance insights.',
    },
  ];

  const pricingPlans = [
    {
      name: 'Student Plan',
      price: '$9.99',
      period: '/month',
      features: [
        'Assignment tracking',
        'Deadline reminders',
        'PDF uploads',
        'Basic analytics',
        'Email support',
      ],
      popular: false,
    },
    {
      name: 'Premium Plan',
      price: '$19.99',
      period: '/month',
      features: [
        'Everything in Student Plan',
        'Advanced analytics',
        'Priority support',
        'Custom dashboard',
        'Parent portal access',
        'Unlimited storage',
      ],
      popular: true,
    },
    {
      name: 'Institution Plan',
      price: 'Custom',
      period: '/year',
      features: [
        'Everything in Premium Plan',
        'Admin dashboard',
        'User management',
        'Bulk operations',
        'API access',
        'Dedicated support',
      ],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-orange-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                ampusFlow
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={signInWithGoogle} className="btn-primary">
                Login with Google
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Manage Your Campus Life
              <span className="text-primary block">With Ease</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              CampusFlow is the ultimate student management platform that helps
              you track assignments, manage deadlines, and stay organized
              throughout your academic journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={signInWithGoogle}
                className="btn-primary text-lg px-8 py-4"
              >
                Get Started Free
              </button>
              <button className="btn-secondary text-lg px-8 py-4">
                Watch Demo
              </button>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-orange-200 rounded-full opacity-20"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-orange-300 rounded-full opacity-30"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-orange-400 rounded-full opacity-40"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed specifically for students to manage
              their academic life effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card text-center hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Flexible pricing plans designed to meet the needs of students and
              institutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`card relative ${
                  plan.popular ? 'ring-2 ring-primary scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-primary">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 ml-1">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={signInWithGoogle}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-200 ${
                    plan.popular
                      ? 'bg-primary hover:bg-orange-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Academic Life?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Join thousands of students who are already using CampusFlow to stay
            organized and succeed.
          </p>
          <button
            onClick={signInWithGoogle}
            className="bg-white text-primary hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200"
          >
            Start Your Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">C</span>
                </div>
                <span className="text-xl font-bold">ampusFlow</span>
              </div>
              <p className="text-gray-400">
                The ultimate student management platform for modern education.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button className="hover:text-white transition-colors text-left">
                    Features
                  </button>
                </li>
                <li>
                  <button className="hover:text-white transition-colors text-left">
                    Pricing
                  </button>
                </li>
                <li>
                  <button className="hover:text-white transition-colors text-left">
                    API
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button className="hover:text-white transition-colors text-left">
                    About
                  </button>
                </li>
                <li>
                  <button className="hover:text-white transition-colors text-left">
                    Contact
                  </button>
                </li>
                <li>
                  <button className="hover:text-white transition-colors text-left">
                    Careers
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button className="hover:text-white transition-colors text-left">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button className="hover:text-white transition-colors text-left">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button className="hover:text-white transition-colors text-left">
                    Cookie Policy
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CampusFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
