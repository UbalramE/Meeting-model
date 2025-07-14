// src/components/Logo.jsx

import React from 'react';

const Logo = ({ className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {/* This is a much more detailed SVG, hand-coded to better match the source image.
        The icon is composed of multiple layers for colors and details.
      */}
      <svg
        width="90"
        height="54"
        viewBox="0 0 150 90"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Jervis Logo Icon"
      >
        {/* Soundwave Dots (background) */}
        <g fill="#0F172A">
          <circle cx="28" cy="45" r="1.5" />
          <circle cx="34" cy="45" r="1.5" />
          <circle cx="40" cy="45" r="1.5" />
        </g>
        <g fill="#2DD4BF">
          <circle cx="122" cy="45" r="1.5" />
          <circle cx="116" cy="45" r="1.5" />
          <circle cx="110" cy="45" r="1.5" />
        </g>

        {/* Microphone Stand */}
        <path d="M75 70 V 82 M 65 82 H 85" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
        <path d="M75 60 C 85 60, 85 70, 75 70 C 65 70, 65 60, 75 60 Z" fill="#0F172A" />

        {/* Microphone Body (Left Half - Dark) */}
        <path
          d="M75 10 C 60 10, 60 58, 75 58"
          fill="#0F172A"
        />
        {/* Microphone Body (Right Half - Turquoise) */}
        <path
          d="M75 10 C 90 10, 90 58, 75 58"
          fill="#2DD4BF"
        />

        {/* Microphone Grille Lines (Dark Side) */}
        <g stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round">
          <path d="M69 20 V 48" />
          <path d="M64 25 V 43" />
        </g>
        
        {/* Soundwave (Foreground) */}
        <g strokeWidth="4" strokeLinecap="round">
          {/* Dark Part */}
          <path d="M48 45 h 8" stroke="#0F172A" />
          <path d="M56 45 C 58 45, 58 35, 60 35 S 62 45, 64 45" stroke="#0F172A" />
          <path d="M64 45 h -4" stroke="#0F172A" />

          {/* Turquoise Part */}
          <path d="M94 45 C 92 45, 92 30, 90 30 S 88 45, 86 45" stroke="#2DD4BF" />
          <path d="M102 45 h -8" stroke="#2DD4BF" />
          <path d="M86 45 C 88 45, 88 55, 86 55" stroke="#2DD4BF" />
          <path d="M94 45 h -2 C 90 45, 90 60, 86 60 S 82 45, 84 45" stroke="#2DD4BF" />
        </g>
      </svg>

      {/* App Name */}
      <h1 className="text-3xl font-bold text-slate-800 tracking-wide">
        Jervis
      </h1>
    </div>
  );
};

export default Logo;

