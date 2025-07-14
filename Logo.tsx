// src/components/Logo.jsx

import React from 'react';

const Logo = ({ className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {/* SVG Icon: Using camelCase for attributes like strokeWidth */}
      <svg
        width="80"
        height="80"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Jervis Logo Icon"
      >
        <path
          d="M12 2C10.3431 2 9 3.34315 9 5V11C9 12.6569 10.3431 14 12 14C13.6569 14 15 12.6569 15 11V5C15 3.34315 13.6569 2 12 2Z"
          fill="#2563EB"
        />
        <path
          d="M5 11C5 14.866 8.13401 18 12 18C15.866 18 19 14.866 19 11H17C17 13.7614 14.7614 16 12 16C9.23858 16 7 13.7614 7 11H5Z"
          fill="#374151"
        />
        <path
          d="M12 18V22M8 22H16"
          stroke="#374151"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 9L11 11L12 9L13 11L14 9"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* App Name */}
      <h1 className="text-4xl font-bold text-gray-800">
        Jervis
      </h1>
    </div>
  );
};

export default Logo;
