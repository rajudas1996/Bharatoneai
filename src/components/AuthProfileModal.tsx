import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  ShieldCheck, 
  CheckCircle, 
  Crown, 
  LogOut, 
  ArrowRight, 
  KeyRound, 
  RefreshCw,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  plan: 'Basic' | 'Gold' | 'Free';
  role: string;
  isLoggedIn: boolean;
}

interface AuthProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onOpenUpgrade: () => void;
}

export const AuthProfileModal: React.FC<AuthProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  onOpenUpgrade,
}) => {
  // Modal mode: 'profile' (if logged in) | 'login' | 'signup' | 'reset_password'
  const [mode, setMode] = useState<'profile' | 'login' | 'signup' | 'reset_password'>(
    userProfile.isLoggedIn ? 'profile' : 'login'
  );

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // OTP Verification state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [generatedTestOtp, setGeneratedTestOtp] = useState('482910');

  // Status/Feedback message
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(userProfile.isLoggedIn ? 'profile' : 'login');
      setFeedback(null);
      setIsOtpVerified(false);
      setOtpSent(false);
      setOtpCode('');
    }
  }, [isOpen, userProfile.isLoggedIn]);

  // Countdown timer for OTP
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  if (!isOpen) return null;

  // Trigger Send OTP
  const handleSendOtp = () => {
    if (!phone || phone.length < 10) {
      setFeedback({ type: 'error', message: 'Please enter a valid 10-digit mobile number before requesting OTP.' });
      return;
    }
    const testCode = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedTestOtp(testCode);
    setOtpSent(true);
    setOtpCountdown(30);
    setFeedback({ type: 'success', message: `OTP sent successfully to +91 ${phone}! (Verification Code: ${testCode})` });
  };

  // Verify OTP
  const handleVerifyOtp = () => {
    if (!otpCode || otpCode.trim() !== generatedTestOtp) {
      setFeedback({ type: 'error', message: `Invalid OTP code. Please enter the 6-digit code (${generatedTestOtp}).` });
      return;
    }
    setIsOtpVerified(true);
    setFeedback({ type: 'success', message: 'Mobile number verified successfully!' });
  };

  // Login Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setFeedback({ type: 'error', message: 'Please fill in both email and password.' });
      return;
    }

    const updatedUser: UserProfile = {
      name: email.split('@')[0].replace('.', ' ').toUpperCase(),
      email,
      phone: phone || '+91 98765 43210',
      plan: 'Gold',
      role: 'Administrator',
      isLoggedIn: true,
    };

    onUpdateProfile(updatedUser);
    setFeedback({ type: 'success', message: 'Login successful! Welcome back.' });
    setTimeout(() => {
      onClose();
    }, 600);
  };

  // Sign Up Handler
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      setFeedback({ type: 'error', message: 'Name, Email ID, and Mobile number are required.' });
      return;
    }
    if (!isOtpVerified) {
      setFeedback({ type: 'error', message: 'Please complete mobile OTP verification before creating account.' });
      return;
    }
    if (password.length < 6) {
      setFeedback({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }
    if (password !== confirmPassword) {
      setFeedback({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    const newUser: UserProfile = {
      name,
      email,
      phone: phone.startsWith('+91') ? phone : `+91 ${phone}`,
      plan: 'Basic',
      role: 'User',
      isLoggedIn: true,
    };

    onUpdateProfile(newUser);
    setFeedback({ type: 'success', message: 'Account registered and authenticated successfully!' });
    setTimeout(() => {
      onClose();
    }, 700);
  };

  // Google OAuth Login Simulation
  const handleGoogleAuth = () => {
    const googleUser: UserProfile = {
      name: 'Raju Das',
      email: 'rajudaszoology22@gmail.com',
      phone: '+91 98765 43210',
      plan: 'Gold',
      role: 'Super Admin',
      isLoggedIn: true,
    };
    onUpdateProfile(googleUser);
    setFeedback({ type: 'success', message: 'Google Authentication verified! Signed in as Raju Das.' });
    setTimeout(() => {
      onClose();
    }, 600);
  };

  // Reset Password Handler
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setFeedback({ type: 'error', message: 'Please enter your registered email address.' });
      return;
    }
    setFeedback({ type: 'success', message: `Password reset link and OTP sent to ${email}. Check your inbox!` });
    setTimeout(() => {
      setMode('login');
      setFeedback(null);
    }, 2000);
  };

  // Logout Handler
  const handleLogout = () => {
    const loggedOut: UserProfile = {
      name: 'Guest User',
      email: '',
      phone: '',
      plan: 'Free',
      role: 'Guest',
      isLoggedIn: false,
    };
    onUpdateProfile(loggedOut);
    setMode('login');
    setFeedback({ type: 'success', message: 'Logged out successfully.' });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {userProfile.isLoggedIn ? userProfile.name.charAt(0) : <User className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                {mode === 'profile' ? 'Account & Profile' : mode === 'login' ? 'Sign In to Bharat 1 AI' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
              </h2>
              <p className="text-[11px] text-slate-500">
                {mode === 'profile' ? 'Manage your credentials and subscriptions' : 'Access full AI tools & dashboard workspace'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`px-5 py-2.5 text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200' : 'bg-red-50 text-red-800 border-b border-red-200'
          }`}>
            {feedback.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        )}

        <div className="p-6 overflow-y-auto">
          {/* 1. LOGGED-IN PROFILE VIEW */}
          {mode === 'profile' && userProfile.isLoggedIn && (
            <div className="space-y-5">
              {/* Profile Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-xs">
                      {userProfile.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900 text-sm">{userProfile.name}</div>
                      <div className="text-xs text-slate-500">{userProfile.email}</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 uppercase">
                    {userProfile.role}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Mobile:</span>
                    <span className="font-semibold text-slate-700">{userProfile.phone || '+91 98765 43210'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Active Plan:</span>
                    <span className="font-bold text-amber-600 flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {userProfile.plan} Member
                    </span>
                  </div>
                </div>
              </div>

              {/* Upgrade Banner in Profile */}
              <div className="p-4 bg-gradient-to-r from-red-50 to-amber-50 rounded-2xl border border-amber-200/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Current Subscription</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    {userProfile.plan === 'Gold' ? 'Unlimited access to all AI tools & Veo Video' : 'Basic Tier - Upgrade for unlimited Veo & Lyria'}
                  </div>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenUpgrade();
                  }}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer"
                >
                  Manage Plan
                </button>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-600" />
                  <span>Sign Out</span>
                </button>

                <button
                  onClick={() => setMode('login')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Switch Account
                </button>
              </div>
            </div>
          )}

          {/* 2. LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Google One-Click Login */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-2xs flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-3 my-2">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="text-[11px] font-bold text-slate-400 uppercase">OR</span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email ID or Mobile Number</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rajudaszoology22@gmail.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('reset_password');
                      setFeedback(null);
                    }}
                    className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-98 cursor-pointer mt-1"
              >
                Sign In
              </button>

              <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-600">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setFeedback(null);
                  }}
                  className="font-bold text-red-600 hover:underline cursor-pointer"
                >
                  Create Account (Sign Up)
                </button>
              </div>
            </form>
          )}

          {/* 3. SIGN UP FORM WITH OTP VERIFICATION */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              {/* Google Signup Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-2xs flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign up with Google</span>
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">OR REGISTER WITH MOBILE & EMAIL</span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Raju Das"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email ID *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rajudaszoology22@gmail.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Mobile Number with OTP Verification */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Mobile Number (for OTP verification) *
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-red-500 font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpCountdown > 0 || isOtpVerified}
                    className="px-3 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold disabled:opacity-50 whitespace-nowrap cursor-pointer transition-colors"
                  >
                    {isOtpVerified ? 'Verified' : otpCountdown > 0 ? `Resend (${otpCountdown}s)` : 'Send OTP'}
                  </button>
                </div>
              </div>

              {/* OTP Input Section */}
              {otpSent && !isOtpVerified && (
                <div className="p-3 bg-red-50/60 rounded-xl border border-red-200/80 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">Enter 6-digit OTP code</span>
                    <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-red-200 text-red-700 font-bold">
                      Code: {generatedTestOtp}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter OTP"
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono tracking-widest text-center outline-none focus:border-red-500 font-bold"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              )}

              {/* Verified Badge */}
              {isOtpVerified && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <CheckCircle className="w-4 h-4" />
                  <span>Mobile Number Verified (+91 {phone})</span>
                </div>
              )}

              {/* Password */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Confirm *</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type password"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!isOtpVerified}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-98 cursor-pointer disabled:opacity-50 mt-1"
              >
                Complete Registration & Sign In
              </button>

              <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setFeedback(null);
                  }}
                  className="font-bold text-red-600 hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* 4. RESET PASSWORD VIEW */}
          {mode === 'reset_password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-xs text-slate-500 leading-normal">
                Enter your registered email address or mobile number. We will send a secure verification OTP to reset your password.
              </p>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email ID or Mobile</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rajudaszoology22@gmail.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-98 cursor-pointer"
              >
                Send Password Reset OTP
              </button>

              <div className="text-center pt-2 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setFeedback(null);
                  }}
                  className="font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
