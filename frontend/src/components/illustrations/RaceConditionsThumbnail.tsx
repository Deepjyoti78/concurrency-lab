import React from 'react';

const ASSET_RACE = encodeURI('/assets/ChatGPT Image Nov 25, 2026, 11_53_29 PM-1.png');

export const RaceConditionsThumbnail: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg viewBox="0 0 240 130" className={`w-full h-full ${className}`} preserveAspectRatio="xMidYMid meet">
      <image
        href={ASSET_RACE}
        x={16.5}
        y={-39.1}
        width={207.2}
        height={207.2}
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  );
};
