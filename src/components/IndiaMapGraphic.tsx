import React from 'react';
import { INDIA_STATE_PATHS } from '../data/indiaStateSvgPaths';

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
          {/* Authentic vibrant India gradient matching Bharat 1 AI red theme */}
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
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#dc2626" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Ambient Glow */}
        <circle cx="165" cy="85" r="70" fill="url(#mapGlow)" />

        {/* Soft flowing wave ribbon across bottom right */}
        <path
          d="M 60 160 C 110 130, 160 170, 210 145 C 235 132, 250 140, 260 150 L 260 180 L 40 180 Z"
          fill="url(#waveRibbon)"
        />

        {/* Official India Map with all 36 States/UTs vector boundaries matching simplemaps.com/svg/country/in */}
        <g transform="translate(90, 4) scale(0.205)" filter="url(#indiaShadow)">
          {Object.entries(INDIA_STATE_PATHS).map(([stateName, pathD], idx) => {
            // Subtle shade variation for distinct adjacent states
            const fillOpacity = 0.88 + (idx % 4) * 0.04;
            return (
              <path
                key={stateName}
                d={pathD}
                fill="url(#bharatMapGrad)"
                fillOpacity={fillOpacity}
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinejoin="round"
                className="hover:brightness-110 transition-all cursor-pointer"
              />
            );
          })}

          {/* Major Tech Hub Constellation Nodes */}
          {/* Delhi */}
          <circle cx="310" cy="275" r="7" fill="#ffffff" />
          <circle cx="310" cy="275" r="14" stroke="#ffffff" strokeWidth="2" opacity="0.6" />

          {/* Mumbai */}
          <circle cx="215" cy="485" r="7" fill="#ffffff" />
          <circle cx="215" cy="485" r="13" stroke="#ffffff" strokeWidth="2" opacity="0.6" />

          {/* Bengaluru */}
          <circle cx="315" cy="620" r="7" fill="#ffffff" />
          <circle cx="315" cy="620" r="13" stroke="#ffffff" strokeWidth="2" opacity="0.6" />

          {/* Hyderabad */}
          <circle cx="340" cy="510" r="6" fill="#ffffff" />

          {/* Kolkata */}
          <circle cx="560" cy="400" r="6" fill="#ffffff" />

          {/* Thin connection lines between nodes */}
          <line x1="310" y1="275" x2="215" y2="485" stroke="#ffffff" strokeWidth="2" opacity="0.45" strokeDasharray="5 5" />
          <line x1="310" y1="275" x2="560" y2="400" stroke="#ffffff" strokeWidth="2" opacity="0.45" strokeDasharray="5 5" />
          <line x1="215" y1="485" x2="340" y2="510" stroke="#ffffff" strokeWidth="2" opacity="0.45" strokeDasharray="5 5" />
          <line x1="340" y1="510" x2="315" y2="620" stroke="#ffffff" strokeWidth="2" opacity="0.45" strokeDasharray="5 5" />
        </g>
      </svg>
    </div>
  );
};
