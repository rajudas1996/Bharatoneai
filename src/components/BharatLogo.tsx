import React from 'react';

interface BharatLogoProps {
  className?: string;
  showTagline?: boolean;
  inverted?: boolean;
}

export const BharatLogo: React.FC<BharatLogoProps> = ({
  className = 'h-9',
  showTagline = false,
  inverted = false,
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Red Geometric / Origami 'A' Symbol from screenshot */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          className="w-8 h-8 drop-shadow-2xs"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Left leg of A */}
          <path
            d="M50 12 L18 84 L36 84 L50 48 L64 84 L82 84 Z"
            fill="#dc2626"
          />
          {/* Inner facet / ribbon fold */}
          <path
            d="M50 12 L36 84 L50 56 Z"
            fill="#b91c1c"
          />
          {/* Crossbar accent */}
          <path
            d="M32 64 L68 64 L62 76 L38 76 Z"
            fill="#ef4444"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center tracking-tight">
          <span className={`text-xl font-extrabold ${inverted ? 'text-white' : 'text-slate-900'}`}>
            Bharat
          </span>
          <span className="text-xl font-extrabold text-red-600">
            AI
          </span>
        </div>
        {showTagline && (
          <span className={`text-[8.5px] font-medium tracking-wider mt-0.5 ${inverted ? 'text-slate-300' : 'text-slate-500'}`}>
            Create • Build • Automate • For a Smarter India
          </span>
        )}
      </div>
    </div>
  );
};
