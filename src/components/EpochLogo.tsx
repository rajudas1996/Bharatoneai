import React from 'react';

interface EpochLogoProps {
  className?: string;
  showTagline?: boolean;
}

export const EpochLogo: React.FC<EpochLogoProps> = ({ 
  className = 'h-10', 
  showTagline = true 
}) => {
  return (
    <div className={`flex items-center ${className} select-none`}>
      <svg
        viewBox="0 0 380 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto max-w-full"
        aria-label="EPOCH - We Serve Ontime Everytime"
      >
        <defs>
          {/* Silver metallic gradient for outer ring */}
          <linearGradient id="silverRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="50%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>

          {/* Deep Red 3D Swoosh Gradient */}
          <linearGradient id="redSwoosh" x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="40%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>

          {/* Globe Ocean Gradient */}
          <radialGradient id="globeBlue" cx="45%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="60%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </radialGradient>
        </defs>

        {/* --- LEFT ICON: GLOBE WITH STYLIZED "E" ENCLOSURE --- */}
        <g transform="translate(4, 2)">
          {/* Outer Silver Ring Arc */}
          <path
            d="M 44 4 
               A 42 42 0 1 0 76 68 
               L 66 61 
               A 32 32 0 1 1 44 14 
               Z"
            fill="url(#silverRing)"
          />

          {/* Red 3D Inner Swoosh forming top of the 'E' and arrow pointing to India */}
          <path
            d="M 44 14
               A 32 32 0 0 1 78 36
               L 88 38
               A 42 42 0 0 0 44 4
               Z"
            fill="url(#redSwoosh)"
          />
          <path
            d="M 78 36
               L 48 44
               L 70 52
               C 74 46 76 41 78 36 Z"
            fill="url(#redSwoosh)"
          />

          {/* Lower Red Accent Curve */}
          <path
            d="M 44 74
               A 32 32 0 0 0 70 58
               L 76 68
               A 42 42 0 0 1 44 84
               Z"
            fill="url(#redSwoosh)"
          />

          {/* Globe Base Circle */}
          <circle cx="44" cy="44" r="28" fill="url(#globeBlue)" />

          {/* Latitude & Longitude Meridian Lines */}
          <ellipse cx="44" cy="44" rx="20" ry="28" stroke="rgba(255,255,255,0.35)" strokeWidth="1" fill="none" />
          <ellipse cx="44" cy="44" rx="10" ry="28" stroke="rgba(255,255,255,0.35)" strokeWidth="1" fill="none" />
          <line x1="16" y1="44" x2="72" y2="44" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <line x1="20" y1="30" x2="68" y2="30" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
          <line x1="20" y1="58" x2="68" y2="58" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />

          {/* Simplified Continents Outline (Asia / India / Middle East / Africa) */}
          <path
            d="M 38 24 
               C 42 22, 52 22, 56 26 
               C 58 30, 64 32, 60 38 
               C 56 42, 52 38, 48 40 
               C 46 44, 44 48, 42 44 
               C 38 42, 34 38, 36 32 
               C 34 28, 36 26, 38 24 Z"
            fill="rgba(255, 255, 255, 0.85)"
          />
          {/* Indian Subcontinent Silhouette Highlight */}
          <path
            d="M 44 36 
               L 48 38 
               L 47 45 
               L 44 48 
               L 41 42 
               Z"
            fill="#ffffff"
          />

          {/* Red Target Pinpoint on India */}
          <circle cx="46" cy="40" r="2.5" fill="#dc2626" />
          <circle cx="46" cy="40" r="4.5" stroke="#dc2626" strokeWidth="0.8" fill="none" opacity="0.8" />
        </g>

        {/* --- RIGHT TYPOGRAPHY: "EPOCH" & "WE SERVE ONTIME EVERYTIME" --- */}
        {/* Main "EPOCH" Wordmark in Authentic Red */}
        <g fill="#E31E24" transform="translate(108, 12)">
          {/* E */}
          <path d="M 0 0 H 26 V 11 H 11 V 23 H 24 V 33 H 11 V 47 H 26 V 58 H 0 Z" />
          
          {/* P */}
          <path d="M 34 0 H 54 C 64 0 71 6 71 18 C 71 30 64 36 54 36 H 45 V 58 H 34 Z M 45 10 V 26 H 53 C 58 26 60 23 60 18 C 60 13 58 10 53 10 Z" />
          
          {/* O */}
          <path d="M 78 29 C 78 11 87 0 102 0 C 117 0 126 11 126 29 C 126 47 117 58 102 58 C 87 58 78 47 78 29 Z M 89 29 C 89 42 94 48 102 48 C 110 48 115 42 115 29 C 115 16 110 10 102 10 C 94 10 89 16 89 29 Z" />
          
          {/* C */}
          <path d="M 160 11 L 153 17 C 149 12 144 10 138 10 C 129 10 124 17 124 29 C 124 41 129 48 138 48 C 144 48 149 46 153 41 L 160 47 C 154 54 147 58 137 58 C 122 58 113 47 113 29 C 113 11 122 0 137 0 C 147 0 154 4 160 11 Z" />
          
          {/* H */}
          <path d="M 168 0 H 179 V 23 H 197 V 0 H 208 V 58 H 197 V 34 H 179 V 58 H 168 Z" />
        </g>

        {/* Subtitle / Tagline: WE SERVE ONTIME EVERYTIME */}
        {showTagline && (
          <text
            x="108"
            y="86"
            fill="#334155"
            fontSize="15"
            fontWeight="700"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="2.2"
          >
            WE SERVE ONTIME EVERYTIME
          </text>
        )}
      </svg>
    </div>
  );
};
