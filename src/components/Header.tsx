import React from 'react';
import { 
  Bell, 
  HelpCircle,
  Crown,
  Menu,
  User
} from 'lucide-react';
import { UserProfile } from './AuthProfileModal';
import { BharatLogo } from './BharatLogo';

interface HeaderProps {
  onOpenHelp?: () => void;
  onOpenUpgrade?: () => void;
  onOpenProfile?: () => void;
  onToggleMobileMenu?: () => void;
  userProfile?: UserProfile;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHelp,
  onOpenUpgrade,
  onOpenProfile,
  onToggleMobileMenu,
  userProfile,
}) => {
  const isUserLoggedIn = Boolean(userProfile?.isLoggedIn);
  const displayName = userProfile?.name || (userProfile?.rollNumber ? `Roll #${userProfile.rollNumber}` : '');
  const initial = isUserLoggedIn && displayName ? displayName.charAt(0).toUpperCase() : null;

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-slate-200/90 px-2 sm:px-6 flex items-center justify-between gap-1 sm:gap-3 shrink-0 z-10 select-none w-full">
      {/* Left: Mobile Hamburger Toggle + Bharat 1 AI mini-badge on mobile */}
      <div className="flex items-center gap-1 sm:gap-2 shrink min-w-0">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl md:hidden transition-colors cursor-pointer shrink-0"
          title="Open Navigation Menu"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="md:hidden min-w-0 shrink">
          <BharatLogo size="sm" showSubtitle={false} />
        </div>
      </div>

      {/* Right Actions: Bell, Upgrade Button, Profile Avatar (Guaranteed spacing so profile icon is always visible) */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Notification Bell with Red Badge "3" */}
        <button
          className="relative p-1.5 sm:p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors cursor-pointer shrink-0"
          title="3 Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
          <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-red-600 text-white rounded-full text-[8px] sm:text-[9px] font-bold flex items-center justify-center font-mono border-2 border-white">
            3
          </span>
        </button>

        {/* Upgrade Button next to Bell icon */}
        <button
          onClick={onOpenUpgrade}
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-extrabold text-[11px] sm:text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
          title="Upgrade Plan: Basic (₹99/mo) or Gold (₹299/mo)"
          aria-label="Upgrade Plan"
        >
          <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white text-white shrink-0" />
          <span className="inline">Upgrade</span>
        </button>

        {/* User Profile Avatar with Clickable Modal - High visibility on all mobile screens */}
        <div className="flex items-center shrink-0 pl-0.5">
          <button
            type="button"
            onClick={onOpenProfile}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center font-bold text-xs select-none shadow-xs border-2 border-slate-200 ring-2 ring-slate-100/90 cursor-pointer transition-all active:scale-95 group relative shrink-0"
            title={isUserLoggedIn ? `Account: ${displayName} (${userProfile?.plan || 'Gold'} Plan)` : 'Sign In / Profile'}
            aria-label="User Profile"
          >
            {isUserLoggedIn && initial ? (
              <span className="font-extrabold text-xs">{initial}</span>
            ) : (
              <User className="w-4 h-4 text-white" />
            )}
            {isUserLoggedIn && userProfile?.plan === 'Gold' && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center">
                <Crown className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white fill-white" />
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
