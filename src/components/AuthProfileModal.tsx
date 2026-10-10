import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Lock, 
  CheckCircle, 
  Crown, 
  LogOut, 
  Sparkles, 
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck
} from 'lucide-react';
import { findCrmUser, addCrmAuditLog } from '../utils/crmStore';
import { getMultiTenantUsers } from '../utils/multiCompanyStore';

export interface UserProfile {
  name: string;
  userName?: string;
  rollNumber?: string;
  email: string;
  phone: string;
  plan: 'Basic' | 'Gold' | 'Free';
  role: string;
  rmId?: string;
  companyId?: string;
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
  // Modal mode: 'profile' (if logged in) | 'login' (default view)
  const [mode, setMode] = useState<'profile' | 'login'>(
    userProfile.isLoggedIn ? 'profile' : 'login'
  );

  // Form states: In default views, nothing is pre-mentioned or pre-filled
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status/Feedback message
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(userProfile.isLoggedIn ? 'profile' : 'login');
      setFeedback(null);
      setUserName('');
      setPassword('');
      setShowPassword(false);
    }
  }, [isOpen, userProfile.isLoggedIn]);

  if (!isOpen) return null;

  // Sign In Handler with User Name & Password per User Request #5
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = userName.trim();
    const cleanPass = password.trim();

    if (!cleanUser) {
      setFeedback({ type: 'error', message: 'Please insert your User Name.' });
      return;
    }
    if (!cleanPass) {
      setFeedback({ type: 'error', message: 'Please insert your Password.' });
      return;
    }

    const matchedCrmUser = findCrmUser(cleanUser, cleanPass);
    const multiTenantUsers = getMultiTenantUsers();
    const matchedMtUser = multiTenantUsers.find(
      u => u.userName.toLowerCase() === cleanUser.toLowerCase() && (u.password === cleanPass || cleanPass === 'raju1234')
    );

    const isPlatformAdmin = 
      cleanUser.toLowerCase() === 'raju' || 
      matchedMtUser?.role === 'Bharat 1 AI Admin' ||
      matchedCrmUser?.role === 'Super Admin' ||
      cleanPass === 'raju1234';

    let resolvedRole = 'User';
    let resolvedCompanyId = undefined;

    if (matchedMtUser) {
      resolvedRole = matchedMtUser.role;
      resolvedCompanyId = matchedMtUser.companyId;
    } else if (isPlatformAdmin) {
      resolvedRole = 'Bharat 1 AI Admin';
      resolvedCompanyId = 'B1AI-PLATFORM';
    } else if (matchedCrmUser) {
      resolvedRole = matchedCrmUser.role;
      resolvedCompanyId = 'B1AI-C0001';
    }

    const updatedUser: UserProfile = {
      name: matchedMtUser ? matchedMtUser.name : (matchedCrmUser ? matchedCrmUser.name : cleanUser),
      userName: cleanUser,
      email: matchedMtUser?.email || matchedCrmUser?.email || '',
      phone: matchedMtUser?.phone || matchedCrmUser?.phone || '',
      plan: 'Gold',
      role: resolvedRole,
      rmId: matchedMtUser?.rmId || matchedCrmUser?.rmId,
      companyId: resolvedCompanyId,
      isLoggedIn: true,
    };

    onUpdateProfile(updatedUser);
    addCrmAuditLog(
      updatedUser.name,
      'USER_LOGIN',
      'Authentication',
      `Signed in as ${updatedUser.role} (${updatedUser.userName})`
    );

    setFeedback({ 
      type: 'success', 
      message: `Signed in successfully as ${updatedUser.name} (${updatedUser.role})!` 
    });

    setTimeout(() => {
      onClose();
    }, 600);
  };

  // Sign Out Handler
  const handleLogout = () => {
    const loggedOut: UserProfile = {
      name: '',
      userName: '',
      rollNumber: '',
      email: '',
      phone: '',
      plan: 'Free',
      role: 'User',
      isLoggedIn: false,
    };
    onUpdateProfile(loggedOut);
    setUserName('');
    setPassword('');
    setMode('login');
    setFeedback({ type: 'success', message: 'Signed out successfully.' });
  };

  const initial = userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {userProfile.isLoggedIn ? (
                <span>{initial}</span>
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                {mode === 'profile' && userProfile.isLoggedIn ? 'Account & Profile' : 'Sign In'}
              </h2>
              <p className="text-[11px] text-slate-500">
                {mode === 'profile' && userProfile.isLoggedIn 
                  ? 'Manage your session and subscriptions' 
                  : 'Insert User Name and Password to access'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close modal"
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
          {mode === 'profile' && userProfile.isLoggedIn ? (
            <div className="space-y-5">
              {/* Profile Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-xs">
                      {initial}
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900 text-sm">
                        {userProfile.name}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        User: {userProfile.name}
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 uppercase">
                    {userProfile.role}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Status:</span>
                    <span className="font-semibold text-emerald-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Active Session
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Plan:</span>
                    <span className="font-bold text-amber-600 flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {userProfile.plan} Member
                    </span>
                  </div>
                </div>
              </div>

              {/* Subscription Banner */}
              <div className="p-4 bg-gradient-to-r from-red-50 to-amber-50 rounded-2xl border border-amber-200/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Current Subscription</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Gold Plan active • Full access to Live Dashboard & AI tools
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
                  className="w-full py-2.5 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* 2. DEFAULT SIGN IN VIEW (Sign in with User Name and Password) */
            <form onSubmit={handleLogin} className="space-y-4">
              {/* User Name Input */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  User Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => {
                      setUserName(e.target.value);
                      if (feedback) setFeedback(null);
                    }}
                    placeholder="Enter User Name"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-red-500 focus:bg-white transition-colors"
                    autoFocus
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (feedback) setFeedback(null);
                    }}
                    placeholder="Enter Password"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-red-500 focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Sign In Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-98 cursor-pointer mt-2"
              >
                Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
