import React from 'react';
import { 
  Bell, 
  HelpCircle,
  Crown
} from 'lucide-react';
import { UserProfile } from './AuthProfileModal';

interface HeaderProps {
  onOpenHelp?: () => void;
  onOpenUpgrade?: () => void;
  onOpenProfile?: () => void;
  userProfile?: UserProfile;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHelp,
  onOpenUpgrade,
  onOpenProfile,
  userProfile,
}) => {
  const initial = userProfile?.isLoggedIn && userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'R';

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between gap-4 shrink-0 z-10 select-none">
      {/* Left title area: Clean empty or brand context per Request 2 */}
      <div className="flex items-center gap-3">
        {/* Empty left side - removed heading per user request */}
      </div>

      {/* Right Actions: Help, Bell, Upgrade Button, Profile Avatar */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Help Icon */}
        <button
          onClick={onOpenHelp}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          title="Help & Support"
        >
          <HelpCircle className="w-5 h-5 text-slate-600" />
        </button>

        {/* Notification Bell with Red Badge "3" */}
        <button
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          title="3 Notifications"
        >
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center font-mono border-2 border-white">
            3
          </span>
        </button>

        {/* Upgrade Button next to Bell icon per Request 4 */}
        <button
          onClick={onOpenUpgrade}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
          title="Upgrade Plan: Basic (₹99/mo) or Gold (₹299/mo)"
        >
          <Crown className="w-3.5 h-3.5 fill-white text-white" />
          <span>Upgrade</span>
        </button>

        {/* User Profile Avatar with Clickable Modal per Request 3 */}
        <div className="flex items-center gap-2 pl-1">
          <button
            type="button"
            onClick={onOpenProfile}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold text-xs select-none shadow-xs border border-slate-700 cursor-pointer transition-all active:scale-95 group relative"
            title={`Account: ${userProfile?.name || 'Raju Das'} (${userProfile?.plan || 'Gold'} Plan)`}
          >
            <span>{initial}</span>
            {userProfile?.plan === 'Gold' && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center">
                <Crown className="w-2 h-2 text-white fill-white" />
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
