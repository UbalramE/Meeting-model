// src/components/Logo.jsx

import React from 'react';

const Logo = ({ className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {/* This SVG is custom-drawn to match the logo design. 
        It's split into multiple paths to handle different colors.
      */}
      <svg
        width="80"
        height="60" // Adjusted height for a wider aspect ratio
        viewBox="0 0 100 75"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Jervis Logo Icon"
      >
        {/* Dark blue part forming the 'J' and left side of the bubble */}
        <path 
          d="M45 65C45 68.3137 42.3137 71 39 71C35.6863 71 33 68.3137 33 65L33 35C33 21.1929 44.1929 10 58 10L60 10C61.1046 10 62 10.8954 62 12L62 65C62 68.3137 59.3137 71 56 71L45 71"
          fill="#0F172A" // Using a dark slate color (slate-900)
        />

        {/* Bright turquoise part for the right side of the bubble and soundwave */}
        <path
          d="M62 12C62 10.8954 61.1046 10 60 10L65 10C78.8071 10 90 21.1929 90 35V40C90 53.8071 78.8071 65 65 65L62 65L62 12Z"
          fill="#2DD4BF" // Using a bright teal color (teal-400)
        />

        {/* The soundwave inside the bubble */}
        <g stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round">
          <path d="M45 42L45 33" />
          <path d="M51 45L51 29" />
          <path d="M57 49L57 25" />
          <path d="M63 45L63 29" />
          <path d="M69 42L69 33" />
          <path d="M75 39L75 36" />
        </g>
      </svg>

      {/* App Name */}
      <h1 className="text-3xl font-bold text-slate-800">
        Jervis
      </h1>
    </div>
  );
};

export default Logo;
