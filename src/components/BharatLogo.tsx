import React from 'react';

interface BharatLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  customLogoUrl?: string | null;
  companyName?: string | null;
  onEditLogo?: () => void;
  canEditLogo?: boolean;
}

export const BharatLogo: React.FC<BharatLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = false,
  customLogoUrl,
  companyName,
  onEditLogo,
  canEditLogo = false,
}) => {
  const iconHeight = size === 'sm' ? 20 : size === 'lg' ? 36 : 30;
  const textSize = size === 'sm' ? 'text-sm sm:text-base' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const gapSize = size === 'sm' ? 'gap-1.5' : 'gap-2.5';

  return (
    <div className={`flex items-center ${gapSize} select-none shrink-0 ${className} group/logo relative`}>
      {/* If custom logo is provided, display it inside exact fixed container without shifting sidebar */}
      {customLogoUrl ? (
        <div 
          className="shrink-0 flex items-center justify-center overflow-hidden rounded-lg bg-white"
          style={{ height: iconHeight, width: iconHeight }}
        >
          <img
            src={customLogoUrl}
            alt={companyName || "Logo"}
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        /* Default Bharat 1 AI Stylized Red Geometric Ribbon Icon */
        <svg
          height={iconHeight}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 drop-shadow-2xs"
        >
          <defs>
            <linearGradient id="bharatRed1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            <linearGradient id="bharatRed2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>
            <linearGradient id="bharatRed3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#b91c1c" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>
          </defs>

          {/* Left diagonal ribbon */}
          <path
            d="M 20 4 L 5 36 L 13 36 L 20 20 L 27 36 L 35 36 Z"
            fill="url(#bharatRed1)"
          />
          {/* Inner cross facet notch */}
          <path
            d="M 20 11 L 11 31 L 17 31 L 20 23 L 23 31 L 29 31 Z"
            fill="#ffffff"
            opacity="0.95"
          />
          {/* Central red core */}
          <path
            d="M 20 15 L 14 29 L 26 29 Z"
            fill="url(#bharatRed2)"
          />
          {/* Diagonal dynamic slash accent */}
          <path
            d="M 12 36 L 20 20 L 22 24 L 16 36 Z"
            fill="url(#bharatRed3)"
            opacity="0.6"
          />
        </svg>
      )}

      {/* Brand Typography */}
      <div className="flex flex-col leading-none min-w-0">
        <div className={`flex items-center text-red-600 font-extrabold tracking-tight ${textSize} font-sans truncate`}>
          {companyName ? (
            <span className="truncate max-w-[140px] text-slate-900 font-extrabold text-sm sm:text-base" title={companyName}>
              {companyName}
            </span>
          ) : (
            <>
              <span>Bharat</span>
              <span className="text-red-700 ml-1">1</span>
              <span className="text-red-600 ml-1">AI</span>
            </>
          )}
        </div>
        {showSubtitle && (
          <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5 truncate">
            {companyName ? 'Corporate Workspace' : 'Create • Analyze • Automate'}
          </span>
        )}
      </div>

      {/* Authorized Small Edit Picture/Logo Icon (Section 12.3 & 12.6) */}
      {canEditLogo && onEditLogo && (
        <button
          type="button"
          onClick={onEditLogo}
          className="ml-1 p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
          title="Upload or Replace Logo"
          aria-label="Upload or Replace Logo"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      )}
    </div>
  );
};
