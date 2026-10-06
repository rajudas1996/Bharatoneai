import React from 'react';

interface BharatLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const BharatLogo: React.FC<BharatLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = false,
}) => {
  const iconHeight = size === 'sm' ? 24 : size === 'lg' ? 36 : 30;

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Stylized Red Geometric 'A' Ribbon / Delta Icon from reference image */}
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

      {/* Bold Red "Bharat 1 AI" Typography */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center text-red-600 font-extrabold tracking-tight text-xl font-sans">
          <span>Bharat</span>
          <span className="text-red-700 ml-1">1</span>
          <span className="text-red-600 ml-1">AI</span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5">
            Create • Analyze • Automate
          </span>
        )}
      </div>
    </div>
  );
};
