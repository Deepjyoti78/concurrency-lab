import React from 'react';

const ASSET_SCHED = encodeURI('/assets/ChatGPT Image Nov 25, 2026, 11_53_31 PM-2.png');

export const CpuCoreSocket: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg viewBox="0 0 240 130" className={`w-full h-full ${className}`} preserveAspectRatio="xMidYMid meet">
      <image
        href={ASSET_SCHED}
        x={12.3}
        y={-45.4}
        width={215.9}
        height={215.9}
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  );
};
