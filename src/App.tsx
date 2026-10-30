/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Users,
  Zap,
} from 'lucide-react';
import { OffsleekLogo } from './components/OffsleekLogo';
import { SchoolBrandLogo } from './components/SchoolBrandLogo';
import { FeatureCard } from './components/FeatureCard';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import { Dashboard } from './components/Dashboard';
import { SchoolDataProvider } from './data/schoolContext';
import { getCurrentYearIST } from './utils/dateTime';

// Session storage key for demo authentication
const DEMO_SESSION_KEY = 'offsleek_school_os_session';

export default function App() {
  // Session State (persisted across reloads)
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isSessionChecked, setIsSessionChecked] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Validation & Loading State
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Check persisted session on initial mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(DEMO_SESSION_KEY) || localStorage.getItem(DEMO_SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.email) {
          setCurrentUserEmail(parsed.email);
        }
      }
    } catch {
      // Ignore storage errors in restricted contexts
    } finally {
      setIsSessionChecked(true);
    }
  }, []);

  // Validate email address format
  const validateEmail = (val: string): boolean => {
    if (!val.trim()) {
      setEmailError('Please enter your email address');
      return false;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(val.trim())) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Validate password
  const validatePassword = (val: string): boolean => {
    if (!val) {
      setPasswordError('Please enter your password');
      return false;
    }
    setPasswordError('');
    return true;
  };

  /**
   * DEMO AUTHENTICATION HANDLER
   * Validates non-empty valid email and non-empty password, stores session,
   * and routes user directly to the destination School OS Dashboard.
   */
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsLoading(true);

    // Simulated short authentication latency
    setTimeout(() => {
      setIsLoading(false);
      const userSession = {
        email: email.trim(),
        role: 'School Administrator',
        signedInAt: new Date().toISOString(),
      };

      // Persist session across page refresh
      try {
        const serialized = JSON.stringify(userSession);
        sessionStorage.setItem(DEMO_SESSION_KEY, serialized);
        if (rememberMe) {
          localStorage.setItem(DEMO_SESSION_KEY, serialized);
        }
      } catch {
        // Fallback for private mode
      }

      setCurrentUserEmail(email.trim());
    }, 600);
  };

  /**
   * Sign Out Handler
   * Clears persisted session and returns to login page
   */
  const handleSignOut = () => {
    try {
      sessionStorage.removeItem(DEMO_SESSION_KEY);
      localStorage.removeItem(DEMO_SESSION_KEY);
    } catch {
      // Ignore
    }
    setCurrentUserEmail(null);
    setPassword('');
  };

  // While checking initial storage session, render blank white canvas to prevent flicker
  if (!isSessionChecked) {
    return <div className="min-h-screen bg-white" />;
  }

  // If user is authenticated, render the functional destination Dashboard wrapped in the shared data provider
  if (currentUserEmail) {
    return (
      <SchoolDataProvider>
        <Dashboard
          userEmail={currentUserEmail}
          onSignOut={handleSignOut}
        />
      </SchoolDataProvider>
    );
  }

  return (
    <div
      className="w-full bg-white text-neutral-900 flex flex-col justify-center items-center select-none px-4 sm:px-6 md:px-8 lg:px-10 xl:px-16 py-4 sm:py-6 lg:py-4 xl:py-6 overflow-y-auto"
      style={{ minHeight: '100vh', height: '100dvh' }}
    >
      {/* Centered Main 2-Column Composition occupying the available viewport */}
      <div className="w-full max-w-6xl xl:max-w-7xl 2xl:max-w-[1500px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 xl:gap-14 2xl:gap-20 my-auto shrink-0">
        
        {/* ========================================================= */}
        {/* LEFT SECTION: OFFSLEEK BRANDING & CONTENT                 */}
        {/* ========================================================= */}
        <div className="w-full lg:flex-1 lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl flex flex-col justify-center">
          
          {/* 1. Original OFFSLEEK Logo (Using original uploaded asset) */}
          <div className="mb-2 sm:mb-2.5 lg:mb-3 xl:mb-3.5 -ml-1 sm:-ml-2 lg:-ml-3 shrink-0">
            <OffsleekLogo size="xl" />
          </div>

          {/* 2. Main Heading (Exact copy & proportional typography) */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.65rem] 2xl:text-[4.25rem] font-black text-black tracking-tight leading-[1.05] mb-2 sm:mb-2.5 lg:mb-3">
            Manage.<br />
            Track. Grow.
          </h1>

          {/* 3. Supporting Text */}
          <p className="text-xs sm:text-sm lg:text-[15px] xl:text-base text-neutral-500 font-normal leading-relaxed max-w-xl mb-3.5 sm:mb-4 lg:mb-4.5 xl:mb-5">
            A complete school management platform to keep your students, staff, fees, and communication in one place.
          </p>

          {/* 4. Four Feature Cards in a Balanced 2-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 lg:gap-3.5 mb-3.5 sm:mb-4 lg:mb-4.5 xl:mb-5 max-w-2xl">
            {/* Card 1: Students & Admissions */}
            <FeatureCard
              icon={<Users className="w-4 h-4 sm:w-5 sm:h-5 text-black stroke-[1.8]" />}
              title="Students & Admissions"
              description="Manage student records, classes, sections and admissions effortlessly."
            />

            {/* Card 2: Fees & Payments */}
            <FeatureCard
              icon={<CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-black stroke-[1.8]" />}
              title="Fees & Payments"
              description="Track fee collection, outstanding dues and send payment reminders."
            />

            {/* Card 3: Analytics & Reports */}
            <FeatureCard
              icon={<BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-black stroke-[1.8]" />}
              title="Analytics & Reports"
              description="Get insights on attendance, fees, academics and overall performance."
            />

            {/* Card 4: Automation */}
            <FeatureCard
              icon={<Zap className="w-4 h-4 sm:w-5 sm:h-5 text-black stroke-[1.8]" />}
              title="Automation"
              description="Save time with automated notifications, reports and workflows."
            />
          </div>

          {/* 5. Slogan at the bottom with short horizontal black line */}
          <div className="pt-0.5 shrink-0">
            <div className="w-8 sm:w-9 h-[2.5px] bg-black mb-1.5 sm:mb-2" />
            <p className="font-black text-[11px] sm:text-xs lg:text-[13px] xl:text-[14px] text-black tracking-[0.2em] leading-snug uppercase">
              DISCIPLINE TODAY.<br />
              A BRIGHTER TOMORROW.
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* THIN VERTICAL DIVIDER (Aligned with main content)        */}
        {/* ========================================================= */}
        <div
          className="hidden lg:block w-[1px] bg-neutral-200 self-stretch my-2 shrink-0"
          aria-hidden="true"
        />

        {/* ========================================================= */}
        {/* RIGHT SECTION: SCHOOL LOGIN CARD                          */}
        {/* ========================================================= */}
        <div className="w-full lg:w-auto flex justify-center shrink-0">
          <div className="w-full sm:w-[400px] md:w-[420px] lg:w-[420px] xl:w-[450px] 2xl:w-[480px] bg-white border border-neutral-200/90 rounded-3xl p-6 sm:p-7 lg:p-7 xl:p-8 shadow-[0_16px_45px_rgb(0,0,0,0.06)]">
            
            {/* Neutral School Administrator Emblem & Identity */}
            <div className="pb-0.5">
              <SchoolBrandLogo />
            </div>

            {/* Sign In Form */}
            <form onSubmit={handleSignIn} noValidate className="space-y-3 sm:space-y-3.5 mt-3.5 sm:mt-4">
              
              {/* 1. Email Address Field */}
              <div>
                <label
                  htmlFor="email-input"
                  className="block text-xs sm:text-[13px] font-semibold text-neutral-800 mb-1"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="email-input"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    onBlur={() => {
                      if (email) validateEmail(email);
                    }}
                    placeholder="you@yourdomain.com"
                    className={`w-full pl-10 pr-3.5 py-2 sm:py-2.5 text-xs sm:text-sm bg-white border rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition-colors ${
                      emailError
                        ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                        : 'border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900'
                    }`}
                    autoComplete="email"
                  />
                </div>
                {emailError && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{emailError}</p>
                )}
              </div>

              {/* 2. Password Field */}
              <div>
                <label
                  htmlFor="password-input"
                  className="block text-xs sm:text-[13px] font-semibold text-neutral-800 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    onBlur={() => {
                      if (password) validatePassword(password);
                    }}
                    placeholder="Enter your password"
                    className={`w-full pl-10 pr-10 py-2 sm:py-2.5 text-xs sm:text-sm bg-white border rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition-colors ${
                      passwordError
                        ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                        : 'border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900'
                    }`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors p-1 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{passwordError}</p>
                )}
              </div>

              {/* 3. Remember Me Checkbox & Forgot Password Link */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 accent-neutral-900 cursor-pointer"
                  />
                  <span className="text-xs sm:text-[13px] font-medium text-neutral-600">
                    Remember me
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-xs sm:text-[13px] font-semibold text-neutral-800 hover:text-black transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* 4. Full-width Black Sign In Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black text-white hover:bg-neutral-800 active:scale-[0.99] font-bold text-xs sm:text-sm py-2.5 sm:py-3 px-5 rounded-xl flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-60 cursor-pointer shadow-xs"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign in</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* 5. Thin Horizontal Divider below Button */}
            <div className="w-full h-[1px] bg-neutral-100 my-4 sm:my-4.5" aria-hidden="true" />

            {/* 6. Exact Correct Copyright Text inside the Login Card */}
            <p className="text-[11px] sm:text-xs text-neutral-400 text-center tracking-normal font-medium">
              © {getCurrentYearIST()} OFFSLEEK. All rights reserved.
            </p>
          </div>
        </div>

      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        defaultEmail={email}
      />
    </div>
  );
}
