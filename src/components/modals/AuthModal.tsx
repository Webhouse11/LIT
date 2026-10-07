import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  X,
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
  Loader2,
} from 'lucide-react';
import { validatePassword, PasswordValidationResult } from '../../lib/security';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'signin' | 'signup' | 'forgot';
  onClose: () => void;
  onNavigate?: (view: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'signup',
  onClose,
  onNavigate,
}) => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, sendPasswordReset } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [accountType, setAccountType] = useState<'reader' | 'author'>('reader');

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const passwordValidation: PasswordValidationResult = validatePassword(password);
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  const resetForm = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleModeChange = (newMode: 'signin' | 'signup' | 'forgot') => {
    resetForm();
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetForm();

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name or pen name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }
      if (!passwordValidation.valid) {
        setErrorMsg(passwordValidation.message || 'Password must be at least 8 characters long with letters and numbers.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please verify your password entry.');
        return;
      }
      if (!agreedToTerms) {
        setErrorMsg('Please agree to the Terms of Service and Privacy Policy to create your account.');
        return;
      }

      setIsLoading(true);
      try {
        const res = await signUpWithEmail(fullName, email, password, accountType);
        if (!res.success) {
          setErrorMsg(res.error || "That email or password doesn't look right. Please try again.");
          setIsLoading(false);
        } else {
          setSuccessMsg(
            `Welcome to LitVault, ${fullName.trim()}! Your ${
              accountType === 'author' ? 'Author Studio' : 'Reading Sanctuary'
            } is ready.`
          );
          setTimeout(() => {
            onClose();
            if (onNavigate) {
              if (res.role === 'author' || accountType === 'author') {
                onNavigate('author');
              } else {
                onNavigate('dashboard');
              }
            }
          }, 1200);
        }
      } catch {
        setErrorMsg("That email or password doesn't look right. Please try again.");
        setIsLoading(false);
      }
    } else if (mode === 'signin') {
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Please enter your registered email address.');
        return;
      }
      if (!password) {
        setErrorMsg('Please enter your account password.');
        return;
      }

      setIsLoading(true);
      try {
        const res = await signInWithEmail(email, password);
        if (!res.success) {
          setErrorMsg(res.error || "That email or password doesn't look right. Please try again.");
          setIsLoading(false);
        } else {
          setSuccessMsg('Welcome back! Continuing your reading journey...');
          setTimeout(() => {
            onClose();
            if (onNavigate) {
              if (res.role === 'admin') onNavigate('admin');
              else if (res.role === 'author') onNavigate('author');
              else onNavigate('dashboard');
            }
          }, 1000);
        }
      } catch {
        setErrorMsg("That email or password doesn't look right. Please try again.");
        setIsLoading(false);
      }
    } else if (mode === 'forgot') {
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }

      setIsLoading(true);
      try {
        const res = await sendPasswordReset(email);
        if (!res.success) {
          setErrorMsg(res.error || 'Unable to send password reset link. Please check your email address.');
        } else {
          setSuccessMsg(res.message || `Password reset instructions have been sent to ${email.trim()}.`);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    resetForm();
    setIsLoading(true);
    try {
      const res = await signInWithGoogle();
      if (!res.success) {
        setErrorMsg(res.error || 'Google sign-in was cancelled. Please try again.');
        setIsLoading(false);
      } else {
        setSuccessMsg('Signed in with Google successfully!');
        setTimeout(() => {
          onClose();
          if (onNavigate) {
            if (res.role === 'admin') onNavigate('admin');
            else if (res.role === 'author') onNavigate('author');
            else onNavigate('dashboard');
          }
        }, 1000);
      }
    } catch {
      setErrorMsg('Google sign-in was interrupted. Please try again or use email.');
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 sm:px-8 pt-7 pb-4 flex items-start justify-between border-b border-stone-100 bg-[#faf8f5]/80">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-amber-900">
              LitVault International
            </span>
            <h2 id="auth-modal-title" className="font-display text-xl sm:text-2xl font-bold text-stone-900 mt-0.5">
              {mode === 'signup' && 'Start Your Reading Journey'}
              {mode === 'signin' && 'Welcome Back'}
              {mode === 'forgot' && 'Reset Your Password'}
            </h2>
            <p className="text-xs text-stone-600 font-editorial mt-1 leading-relaxed">
              {mode === 'signup' && "Join LitVault and discover stories you'll want to remember."}
              {mode === 'signin' && 'Continue your reading journey.'}
              {mode === 'forgot' && 'Enter your registered email to receive recovery instructions.'}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer shrink-0 ml-3"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-4">
          {/* Notifications / Alerts */}
          {errorMsg && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div
              role="status"
              className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{successMsg}</span>
            </div>
          )}

          {/* Social Google Auth CTA */}
          {mode !== 'forgot' && (
            <>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold shadow-2xs transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
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

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-stone-200 w-full" />
                <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-stone-400 font-medium">
                  or continue with email
                </span>
              </div>
            </>
          )}

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Sign-Up Account Type Picker */}
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  Account type:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setAccountType('reader')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      accountType === 'reader'
                        ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-stone-50/60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <BookOpen className={`w-3.5 h-3.5 ${accountType === 'reader' ? 'text-amber-400' : 'text-stone-600'}`} />
                      <span className="text-xs font-bold">Reader</span>
                    </div>
                    <p className={`text-[10px] ${accountType === 'reader' ? 'text-stone-300' : 'text-stone-500'}`}>
                      Discover and read stories.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccountType('author')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      accountType === 'author'
                        ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-stone-50/60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Feather className={`w-3.5 h-3.5 ${accountType === 'author' ? 'text-amber-400' : 'text-stone-600'}`} />
                      <span className="text-xs font-bold">Author</span>
                    </div>
                    <p className={`text-[10px] ${accountType === 'author' ? 'text-stone-300' : 'text-stone-500'}`}>
                      Publish your stories and build your readership.
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Full Name (Sign Up only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Chinelo Okonkwo"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="reader@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600 transition-colors"
                />
              </div>
            </div>

            {/* Password (for Sign In & Sign Up) */}
            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-stone-700">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => handleModeChange('forgot')}
                      className="text-[11px] font-semibold text-amber-900 hover:text-amber-950 cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'Minimum 8 characters' : 'Enter your password'}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600 transition-colors"
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

                {/* Real-time strength meter (Sign Up only) */}
                {mode === 'signup' && password.length > 0 && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex justify-between text-[10px] text-stone-500">
                      <span>Strength: {passwordValidation.strengthLabel}</span>
                      <span>{passwordValidation.hasMinLength ? '✓ 8+ chars' : '○ Needs 8+ chars'}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 h-1">
                      {[1, 2, 3, 4].map(idx => (
                        <div
                          key={idx}
                          className={`h-full rounded-full transition-all ${
                            idx <= passwordValidation.score
                              ? passwordValidation.score >= 4
                                ? 'bg-emerald-600'
                                : passwordValidation.score === 3
                                ? 'bg-blue-600'
                                : 'bg-amber-500'
                              : 'bg-stone-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Confirm Password (Sign Up only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600 transition-colors"
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
                        <CheckCircle2 className="w-3 h-3" /> Passwords match
                      </span>
                    ) : (
                      <span className="text-rose-600">Passwords do not match yet</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Remember Me Option (Sign In only) */}
            {mode === 'signin' && (
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="modal-remember-me-checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded text-amber-900 focus:ring-amber-500 border-stone-300 cursor-pointer"
                />
                <label htmlFor="modal-remember-me-checkbox" className="text-xs text-stone-600 cursor-pointer">
                  Remember me
                </label>
              </div>
            )}

            {/* Terms and Privacy Agreement (Sign Up only) */}
            {mode === 'signup' && (
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="modal-terms-checkbox"
                  checked={agreedToTerms}
                  onChange={e => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded text-amber-900 focus:ring-amber-500 border-stone-300 cursor-pointer"
                />
                <label htmlFor="modal-terms-checkbox" className="text-xs text-stone-600 leading-relaxed cursor-pointer">
                  I agree to LitVault's Terms of Service and Privacy Policy.
                </label>
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
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
                    {mode === 'forgot' && 'Send Reset Link'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </>
              )}
            </button>
          </form>

          {/* Mode Switchers */}
          <div className="pt-2 border-t border-stone-100 text-center text-xs text-stone-600 space-y-1">
            {mode === 'signup' && (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleModeChange('signin')}
                  className="font-bold text-amber-900 hover:underline cursor-pointer"
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
                  onClick={() => handleModeChange('signup')}
                  className="font-bold text-amber-900 hover:underline cursor-pointer"
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
                  onClick={() => handleModeChange('signin')}
                  className="font-bold text-amber-900 hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
