import React from 'react';

export const RagCycleThumbnail: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg viewBox="0 0 160 100" className={`w-full h-full max-h-[90px] ${className}`}>
      {/* Background shadow */}
      <ellipse cx="80" cy="55" rx="50" ry="26" fill="rgba(24, 24, 27, 0.05)" />

      {/* Directed Cycle Edges */}
      <defs>
        <marker id="arrow-head" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 z" fill="#18181B" />
        </marker>
      </defs>

      {/* Cycle paths connecting nodes */}
      <line x1="50" y1="35" x2="80" y2="22" stroke="#18181B" strokeWidth="1.25" markerEnd="url(#arrow-head)" />
      <line x1="80" y1="22" x2="115" y2="35" stroke="#18181B" strokeWidth="1.25" markerEnd="url(#arrow-head)" />
      <line x1="115" y1="35" x2="105" y2="65" stroke="#18181B" strokeWidth="1.25" markerEnd="url(#arrow-head)" />
      <line x1="105" y1="65" x2="70" y2="72" stroke="#18181B" strokeWidth="1.25" markerEnd="url(#arrow-head)" />
      <line x1="70" y1="72" x2="50" y2="35" stroke="#18181B" strokeWidth="1.25" markerEnd="url(#arrow-head)" />

      {/* Node 1: Lavender Thread Node (top left) */}
      <circle cx="50" cy="35" r="9" fill="#DDD6FE" stroke="#18181B" strokeWidth="1.5" />
      <circle cx="50" cy="35" r="3" fill="#7C3AED" />

      {/* Node 2: Mutex Resource Box (top center) */}
      <rect x="73" y="15" width="14" height="14" rx="3" fill="#C7D2FE" stroke="#18181B" strokeWidth="1.5" />

      {/* Node 3: Sage Green Thread Node (top right) */}
      <circle cx="115" cy="35" r="9" fill="#A7F3D0" stroke="#18181B" strokeWidth="1.5" />
      <circle cx="115" cy="35" r="3" fill="#059669" />

      {/* Node 4: Mutex Resource Box (bottom right) */}
      <rect x="98" y="58" width="14" height="14" rx="3" fill="#FED7AA" stroke="#18181B" strokeWidth="1.5" />

      {/* Node 5: Thread Node (bottom center) */}
      <circle cx="70" cy="72" r="9" fill="#E9D5FF" stroke="#18181B" strokeWidth="1.5" />
      <circle cx="70" cy="72" r="3" fill="#9333EA" />
    </svg>
  );
};
