import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Feather,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { validatePassword, PasswordValidationResult } from '../lib/security';
import { UserRole } from '../types';

interface AuthPageProps {
  initialMode?: 'signin' | 'signup' | 'forgot';
  onNavigate: (view: string, params?: any) => void;
  onOpenLegal: (tab: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'signup',
  onNavigate,
  onOpenLegal,
}) => {
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    sendPasswordReset,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [accountType, setAccountType] = useState<'reader' | 'author'>('reader');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);

  // Real-time password validation
  const passwordValidation: PasswordValidationResult = validatePassword(password);
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  const resetErrors = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSwitchMode = (newMode: 'signin' | 'signup' | 'forgot') => {
    resetErrors();
    setMode(newMode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetErrors();

    // 1. SIGN UP VALIDATION & SUBMISSION
    if (mode === 'signup') {
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full name or pen name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
      if (!passwordValidation.valid) {
        setErrorMessage(
          passwordValidation.message ||
            'Password must be at least 8 characters long with letters and numbers.'
        );
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify your password entry.');
        return;
      }
      if (!agreedToTerms) {
        setErrorMessage('Please agree to the Terms of Service and Privacy Policy to create your account.');
        return;
      }

      setIsLoading(true);
      try {
        const res = await signUpWithEmail(fullName, email, password, accountType);
        if (!res.success) {
          setErrorMessage(res.error || "That email or password doesn't look right. Please try again.");
          setIsLoading(false);
        } else {
          setEmailVerificationSent(true);
          setSuccessMessage(
            `Welcome to LitVault, ${fullName.trim()}! Your ${
              accountType === 'author' ? 'Author Studio' : 'Reading Sanctuary'
            } is ready.`
          );

          // Route after registration based on account type
          setTimeout(() => {
            if (res.role === 'author' || accountType === 'author') {
              onNavigate('author');
            } else {
              onNavigate('dashboard');
            }
          }, 1400);
        }
      } catch (err: any) {
        setErrorMessage("That email or password doesn't look right. Please try again.");
        setIsLoading(false);
      }
    }

    // 2. SIGN IN SUBMISSION
    else if (mode === 'signin') {
      if (!email.trim() || !email.includes('@')) {
        setErrorMessage('Please enter your registered email address.');
        return;
      }
      if (!password) {
        setErrorMessage('Please enter your account password.');
        return;
      }

      setIsLoading(true);
      try {
        const res = await signInWithEmail(email, password);
        if (!res.success) {
          setErrorMessage(res.error || "That email or password doesn't look right. Please try again.");
          setIsLoading(false);
        } else {
          setSuccessMessage('Welcome back! Loading your reading library...');
          setTimeout(() => {
            if (res.role === 'admin') {
              onNavigate('admin');
            } else if (res.role === 'author') {
              onNavigate('author');
            } else {
              onNavigate('dashboard');
            }
          }, 1000);
        }
      } catch (err: any) {
        setErrorMessage("That email or password doesn't look right. Please try again.");
        setIsLoading(false);
      }
    }

    // 3. FORGOT PASSWORD SUBMISSION
    else if (mode === 'forgot') {
      if (!email.trim() || !email.includes('@')) {
        setErrorMessage('Please enter a valid email address to receive reset instructions.');
        return;
      }

      setIsLoading(true);
      try {
        const res = await sendPasswordReset(email);
        if (!res.success) {
          setErrorMessage(res.error || 'Unable to send password reset link. Please check your email address.');
        } else {
          setSuccessMessage(
            res.message ||
              `Password reset instructions have been sent to ${email.trim()}. Please check your inbox.`
          );
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleAuth = async () => {
    resetErrors();
    setIsLoading(true);
    try {
      const res = await signInWithGoogle();
      if (!res.success) {
        setErrorMessage(res.error || 'Google sign-in was cancelled. Please try again.');
        setIsLoading(false);
      } else {
        setSuccessMessage('Signed in with Google successfully!');
        setTimeout(() => {
          if (res.role === 'admin') {
            onNavigate('admin');
          } else if (res.role === 'author') {
            onNavigate('author');
          } else {
            onNavigate('dashboard');
          }
        }, 1000);
      }
    } catch {
      setErrorMessage('Google sign-in could not be completed. Please use email and password.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col justify-center py-10 sm:py-16 px-4 sm:px-6 lg:px-8 bg-[#faf8f5]">
      {/* Return to home link */}
      <div className="max-w-5xl mx-auto w-full mb-6">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to LitVault Home</span>
        </button>
      </div>

      <div className="max-w-5xl mx-auto w-full bg-white rounded-3xl border border-stone-200/90 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Panel: Literary Atmosphere & International Editorial Brand */}
        <div className="lg:col-span-5 bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle warm ambient background glow */}
          <div className="absolute -right-16 -top-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-stone-700/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-display font-black text-xl shadow-md">
                L
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-2xl tracking-tight text-white leading-none">
                  LitVault
                </span>
                <span className="text-[10px] uppercase font-sans tracking-widest text-amber-300 font-semibold mt-1">
                  Read · Discover · Publish
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                The Literary Sanctuary
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold leading-snug">
                Where extraordinary stories find unforgettable voices.
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 font-editorial leading-relaxed">
                Connect with acclaimed African and international authors, build your reading sanctuary, and experience novels crafted for the modern reader.
              </p>
            </div>
          </div>

          {/* Social Proof Quote / Platform Principles */}
          <div className="relative z-10 pt-8 mt-8 border-t border-stone-700/80 space-y-4">
            <blockquote className="text-xs text-stone-300 font-editorial italic leading-relaxed">
              "LitVault has created a dignified, beautiful international home for African literature and storytelling."
            </blockquote>

            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                alt="Chinelo Okonkwo"
                className="w-9 h-9 rounded-full object-cover border border-amber-400/60"
              />
              <div className="text-left">
                <div className="text-xs font-bold text-white leading-tight">Chinelo Okonkwo</div>
                <div className="text-[10px] text-stone-400 font-sans">Author of Echoes of the Savanna</div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-4 text-[11px] text-stone-400 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Verified & Secure
              </span>
              <span>·</span>
              <span>Fair Author Royalties</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Primary Form Container */}
        <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            {/* Header Titles */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">
                LitVault International
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                {mode === 'signup' && 'Start Your Reading Journey'}
                {mode === 'signin' && 'Welcome Back'}
                {mode === 'forgot' && 'Reset Your Password'}
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 font-editorial leading-relaxed">
                {mode === 'signup' && "Join LitVault and discover stories you'll want to remember."}
                {mode === 'signin' && 'Continue your reading journey.'}
                {mode === 'forgot' && 'Enter your registered email and we will send you instructions to recover your account.'}
              </p>
            </div>

            {/* Error & Success Feedback Banners */}
            {errorMessage && (
              <div
                role="alert"
                className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div
                role="status"
                className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="leading-relaxed font-medium block">{successMessage}</span>
                  {emailVerificationSent && (
                    <span className="text-[11px] text-emerald-700 block">
                      A verification message has also been dispatched to your email for security.
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Google Social Authentication */}
            {mode !== 'forgot' && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-xl border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold shadow-2xs transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="relative flex items-center justify-center pt-1 pb-1">
                  <div className="border-t border-stone-200 w-full" />
                  <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-stone-400 font-medium">
                    or continue with email
                  </span>
                </div>
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Account Type Selection (Sign Up only) */}
              {mode === 'signup' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-stone-800">
                    Account type:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Reader Option */}
                    <button
                      type="button"
                      onClick={() => setAccountType('reader')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        accountType === 'reader'
                          ? 'border-stone-900 bg-stone-900 text-white shadow-md'
                          : 'border-stone-200 hover:border-stone-300 text-stone-800 bg-[#faf8f5]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen
                          className={`w-4 h-4 ${
                            accountType === 'reader' ? 'text-amber-400' : 'text-stone-600'
                          }`}
                        />
                        <span className="text-xs font-bold">Reader</span>
                      </div>
                      <p
                        className={`text-[11px] leading-relaxed ${
                          accountType === 'reader' ? 'text-stone-300' : 'text-stone-500'
                        }`}
                      >
                        Discover and read stories.
                      </p>
                    </button>

                    {/* Author Option */}
                    <button
                      type="button"
                      onClick={() => setAccountType('author')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        accountType === 'author'
                          ? 'border-stone-900 bg-stone-900 text-white shadow-md'
                          : 'border-stone-200 hover:border-stone-300 text-stone-800 bg-[#faf8f5]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Feather
                          className={`w-4 h-4 ${
                            accountType === 'author' ? 'text-amber-400' : 'text-stone-600'
                          }`}
                        />
                        <span className="text-xs font-bold">Author</span>
                      </div>
                      <p
                        className={`text-[11px] leading-relaxed ${
                          accountType === 'author' ? 'text-stone-300' : 'text-stone-500'
                        }`}
                      >
                        Publish your stories and build your readership.
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* Full Name (Sign Up only) */}
              {mode === 'signup' && (
                <div>
                  <label
                    htmlFor="signup-full-name"
                    className="block text-xs font-semibold text-stone-700 mb-1"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="signup-full-name"
                      type="text"
                      required
                      autoComplete="name"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. Chinelo Okonkwo"
                      className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-stone-300 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label
                  htmlFor="auth-email-address"
                  className="block text-xs font-semibold text-stone-700 mb-1"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="auth-email-address"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="reader@example.com"
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-stone-300 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600 transition-colors"
                  />
                </div>
              </div>

              {/* Password Field */}
              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="auth-password"
                      className="block text-xs font-semibold text-stone-700"
                    >
                      Password
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => handleSwitchMode('forgot')}
                        className="text-[11px] font-semibold text-amber-900 hover:text-amber-950 hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder={mode === 'signup' ? 'Minimum 8 characters' : 'Enter your password'}
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-stone-300 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator (Sign Up only) */}
                  {mode === 'signup' && password.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-stone-500">Password strength:</span>
                        <span
                          className={`font-semibold ${
                            passwordValidation.strengthLabel === 'Strong'
                              ? 'text-emerald-700'
                              : passwordValidation.strengthLabel === 'Good'
                              ? 'text-blue-700'
                              : passwordValidation.strengthLabel === 'Fair'
                              ? 'text-amber-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {passwordValidation.strengthLabel}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 h-1.5">
                        {[1, 2, 3, 4].map(idx => (
                          <div
                            key={idx}
                            className={`h-full rounded-full transition-all duration-300 ${
                              idx <= passwordValidation.score
                                ? passwordValidation.score >= 4
                                  ? 'bg-emerald-600'
                                  : passwordValidation.score === 3
                                  ? 'bg-blue-600'
                                  : passwordValidation.score === 2
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                                : 'bg-stone-200'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-[10px] text-stone-500 flex flex-wrap gap-x-3 gap-y-1 pt-0.5">
                        <span className={passwordValidation.hasMinLength ? 'text-emerald-700 font-medium' : ''}>
                          {passwordValidation.hasMinLength ? '✓' : '○'} 8+ chars
                        </span>
                        <span className={passwordValidation.hasLetter ? 'text-emerald-700 font-medium' : ''}>
                          {passwordValidation.hasLetter ? '✓' : '○'} Letter
                        </span>
                        <span className={passwordValidation.hasNumber ? 'text-emerald-700 font-medium' : ''}>
                          {passwordValidation.hasNumber ? '✓' : '○'} Number
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Confirm Password (Sign Up only) */}
              {mode === 'signup' && (
                <div>
                  <label
                    htmlFor="auth-confirm-password"
                    className="block text-xs font-semibold text-stone-700 mb-1"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="auth-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-stone-300 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && (
                    <div className="mt-1 text-[11px]">
                      {passwordsMatch ? (
                        <span className="text-emerald-700 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                        </span>
                      ) : (
                        <span className="text-rose-600">Passwords do not match yet</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Remember me (Sign In only) */}
              {mode === 'signin' && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="page-remember-me"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-900 focus:ring-amber-500 border-stone-300 cursor-pointer"
                  />
                  <label htmlFor="page-remember-me" className="text-xs text-stone-600 cursor-pointer">
                    Remember me
                  </label>
                </div>
              )}

              {/* Terms and Privacy Agreement (Sign Up only) */}
              {mode === 'signup' && (
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="page-terms-agree"
                    checked={agreedToTerms}
                    onChange={e => setAgreedToTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-amber-900 focus:ring-amber-500 border-stone-300 cursor-pointer"
                  />
                  <label htmlFor="page-terms-agree" className="text-xs text-stone-600 leading-relaxed cursor-pointer">
                    I agree to LitVault's{' '}
                    <button
                      type="button"
                      onClick={() => onOpenLegal('terms')}
                      className="font-bold text-stone-900 hover:text-amber-900 underline cursor-pointer"
                    >
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button
                      type="button"
                      onClick={() => onOpenLegal('privacy')}
                      className="font-bold text-stone-900 hover:text-amber-900 underline cursor-pointer"
                    >
                      Privacy Policy
                    </button>
                    .
                  </label>
                </div>
              )}

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === 'signup' && 'Create My Account'}
                      {mode === 'signin' && 'Sign In'}
                      {mode === 'forgot' && 'Send Reset Instructions'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </>
                )}
              </button>
            </form>

            {/* Sub-Actions & Mode Navigation */}
            <div className="pt-4 border-t border-stone-100 text-center text-xs text-stone-600">
              {mode === 'signup' && (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('signin')}
                    className="font-bold text-amber-900 hover:text-amber-950 hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              )}

              {mode === 'signin' && (
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('signup')}
                    className="font-bold text-amber-900 hover:text-amber-950 hover:underline cursor-pointer"
                  >
                    Create one
                  </button>
                </p>
              )}

              {mode === 'forgot' && (
                <p>
                  Remembered your credentials?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('signin')}
                    className="font-bold text-amber-900 hover:text-amber-950 hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
