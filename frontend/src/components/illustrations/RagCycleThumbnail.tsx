import React from 'react';

const ASSET_DEADLOCK = encodeURI('/assets/ChatGPT Image Nov 25, 2026, 11_53_33 PM-4.png');

export const RagCycleThumbnail: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg viewBox="0 0 240 130" className={`w-full h-full ${className}`} preserveAspectRatio="xMidYMid meet">
      <image
        href={ASSET_DEADLOCK}
        x={39.7}
        y={-17.6}
        width={160.9}
        height={160.9}
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  );
};
