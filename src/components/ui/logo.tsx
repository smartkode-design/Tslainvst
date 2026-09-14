import React from 'react';

export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="tsla-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" /> {/* Indigo */}
          <stop offset="100%" stopColor="#0ea5e9" /> {/* Sky Blue */}
        </linearGradient>
      </defs>
      
      {/* Sleek, sharp geometric 'T' / abstract lightning aesthetic */}
      <path 
        d="M15 25 h70 v15 h-25 v45 h-20 v-45 h-25 z" 
        fill="url(#tsla-gradient)" 
      />
      
      {/* Dynamic accent polygon */}
      <path 
        d="M60 40 l15 -15 v15 z"
        fill="#f97316" 
      />
    </svg>
  );
}
