import React from 'react';

interface IndiaMapGraphicProps {
  className?: string;
}

export const IndiaMapGraphic: React.FC<IndiaMapGraphicProps> = ({ className = '' }) => {
  return (
    <div className={`relative flex items-center justify-end select-none ${className}`}>
      <svg
        viewBox="0 0 260 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-h-[160px]"
      >
        <defs>
          {/* Authentic vibrant India gradient matching reference screenshot */}
          <linearGradient id="bharatMapGrad" x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="45%" stopColor="#dc2626" />
            <stop offset="85%" stopColor="#b91c1c" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>

          {/* Ambient red glow behind India */}
          <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fca5a5" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#fee2e2" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {/* Soft wave ribbon gradient */}
          <linearGradient id="waveRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fecaca" stopOpacity="0.5" />
            <stop offset="70%" stopColor="#ef4444" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          <filter id="indiaShadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#dc2626" floodOpacity="0.28" />
          </filter>
        </defs>

        {/* Ambient Glow */}
        <circle cx="165" cy="85" r="70" fill="url(#mapGlow)" />

        {/* Soft flowing wave ribbon across bottom right */}
        <path
          d="M 60 160 C 110 130, 160 170, 210 145 C 235 132, 250 140, 260 150 L 260 180 L 40 180 Z"
          fill="url(#waveRibbon)"
        />

        {/* India Map Geometric Silhouette matching Attachment 2 */}
        <g transform="translate(100, 8) scale(0.48)" filter="url(#indiaShadow)">
          {/* Main India Landmass & Northeast */}
          <path
            d="M 125 0
               C 132 10, 142 16, 148 28
               C 152 38, 165 42, 172 38
               C 180 34, 188 40, 182 50
               C 176 58, 185 66, 194 65
               C 205 63, 218 68, 226 62
               C 235 56, 245 62, 254 65
               C 264 68, 275 75, 270 85
               C 265 92, 250 90, 246 98
               C 242 104, 250 114, 260 112
               C 270 110, 280 118, 275 128
               C 270 135, 258 138, 252 148
               C 246 156, 238 165, 230 176
               C 216 195, 204 218, 192 240
               C 180 262, 168 285, 158 310
               C 154 320, 146 322, 144 312
               C 135 288, 124 262, 114 240
               C 102 212, 94 195, 82 178
               C 70 160, 52 148, 42 136
               C 32 124, 20 118, 14 106
               C 8 92, 22 85, 34 88
               C 45 92, 54 84, 60 74
               C 65 62, 56 54, 62 42
               C 68 30, 82 34, 94 25
               C 105 16, 116 2, 125 0 Z"
            fill="url(#bharatMapGrad)"
          />

          {/* Northeast Horn (Seven Sisters) */}
          <path
            d="M 246 98
               C 256 88, 272 90, 284 86
               C 292 83, 304 88, 316 85
               C 328 82, 334 94, 324 104
               C 316 114, 322 126, 310 132
               C 298 138, 286 130, 280 120
               C 274 110, 262 114, 254 106 Z"
            fill="url(#bharatMapGrad)"
          />

          {/* Internal Curved Neural Pathways (as seen in Attachment 2) */}
          <path
            d="M 140 35 C 150 70, 162 110, 152 150 C 142 190, 128 230, 146 295"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.35"
          />
          <path
            d="M 125 70 C 140 105, 148 145, 140 185 C 132 225, 115 255, 145 305"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.25"
          />

          {/* Constellation Nodes / Major Tech Hubs */}
          {/* Delhi */}
          <circle cx="128" cy="85" r="4.5" fill="#ffffff" />
          <circle cx="128" cy="85" r="8" stroke="#ffffff" strokeWidth="1.2" opacity="0.6" />

          {/* Mumbai */}
          <circle cx="82" cy="180" r="4" fill="#ffffff" />
          <circle cx="82" cy="180" r="7" stroke="#ffffff" strokeWidth="1" opacity="0.5" />

          {/* Bengaluru */}
          <circle cx="125" cy="245" r="4" fill="#ffffff" />
          <circle cx="125" cy="245" r="7" stroke="#ffffff" strokeWidth="1" opacity="0.5" />

          {/* Hyderabad */}
          <circle cx="138" cy="195" r="3.5" fill="#ffffff" />

          {/* Kolkata */}
          <circle cx="225" cy="135" r="3.5" fill="#ffffff" />

          {/* Northeast node */}
          <circle cx="285" cy="105" r="3.5" fill="#ffffff" />

          {/* Thin connection lines between nodes */}
          <line x1="128" y1="85" x2="82" y2="180" stroke="#ffffff" strokeWidth="1" opacity="0.4" strokeDasharray="3 3" />
          <line x1="128" y1="85" x2="225" y2="135" stroke="#ffffff" strokeWidth="1" opacity="0.4" strokeDasharray="3 3" />
          <line x1="82" y1="180" x2="138" y2="195" stroke="#ffffff" strokeWidth="1" opacity="0.4" strokeDasharray="3 3" />
          <line x1="138" y1="195" x2="125" y2="245" stroke="#ffffff" strokeWidth="1" opacity="0.4" strokeDasharray="3 3" />
          <line x1="225" y1="135" x2="285" y2="105" stroke="#ffffff" strokeWidth="1" opacity="0.4" strokeDasharray="3 3" />
        </g>
      </svg>
    </div>
  );
};
