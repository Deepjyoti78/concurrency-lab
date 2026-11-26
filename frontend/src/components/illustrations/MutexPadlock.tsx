import React from 'react';

const ASSET_MUTEX = encodeURI('/assets/ChatGPT Image Nov 25, 2026, 11_53_32 PM-3.png');

export const MutexPadlock: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg viewBox="0 0 240 130" className={`w-full h-full ${className}`} preserveAspectRatio="xMidYMid meet">
      <image
        href={ASSET_MUTEX}
        x={37.6}
        y={-16.9}
        width={164.7}
        height={164.7}
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  );
};
