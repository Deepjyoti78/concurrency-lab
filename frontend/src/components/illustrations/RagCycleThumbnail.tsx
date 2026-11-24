import React from 'react';

export const RagCycleThumbnail: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg viewBox="0 0 240 140" className={`w-full h-full ${className}`} preserveAspectRatio="xMidYMid meet">
      {/* Ground Cast Shadow */}
      <ellipse cx="120" cy="80" rx="75" ry="34" fill="rgba(24, 24, 27, 0.06)" />

      {/* Directed Graph Markers */}
      <defs>
        <marker id="rag-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 1 1 L 7 4 L 1 7 z" fill="#18181B" />
        </marker>
        <marker id="rag-arrow-alert" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 1 1 L 7 4 L 1 7 z" fill="#DC2626" />
        </marker>
      </defs>

      {/* Cycle Directed Edges */}
      {/* Thread 1 -> Lock A (Requests / Waits) */}
      <line x1="82" y1="46" x2="114" y2="34" stroke="#18181B" strokeWidth="1.4" markerEnd="url(#rag-arrow)" />
      {/* Lock A -> Thread 2 (Held by) */}
      <line x1="126" y1="34" x2="158" y2="46" stroke="#18181B" strokeWidth="1.4" markerEnd="url(#rag-arrow)" />
      {/* Thread 2 -> Lock B (Requests / Waits) */}
      <line x1="162" y1="58" x2="148" y2="92" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="3,3" markerEnd="url(#rag-arrow-alert)" />
      {/* Lock B -> Thread 1 (Held by) -> Deadlock cycle closed! */}
      <line x1="134" y1="96" x2="88" y2="58" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="3,3" markerEnd="url(#rag-arrow-alert)" />

      {/* Node 1: Thread 1 (Circle, Lavender) */}
      <g transform="translate(76, 52)">
        <circle cx="0" cy="0" r="14" fill="#DDD6FE" stroke="#18181B" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="5" fill="#7C3AED" />
        <text x="0" y="24" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="7.5" fontWeight="bold" fill="#18181B">T1</text>
      </g>

      {/* Node 2: Resource Lock A (Square Box, Amber) */}
      <g transform="translate(120, 32)">
        <rect x="-11" y="-11" width="22" height="22" rx="4" fill="#FEF3C7" stroke="#18181B" strokeWidth="1.5" />
        <text x="0" y="3.5" textAnchor="middle" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#92400E">R1</text>
      </g>

      {/* Node 3: Thread 2 (Circle, Sage Green) */}
      <g transform="translate(164, 52)">
        <circle cx="0" cy="0" r="14" fill="#A7F3D0" stroke="#18181B" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="5" fill="#059669" />
        <text x="0" y="24" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="7.5" fontWeight="bold" fill="#18181B">T2</text>
      </g>

      {/* Node 4: Resource Lock B (Square Box, Peach) */}
      <g transform="translate(140, 100)">
        <rect x="-11" y="-11" width="22" height="22" rx="4" fill="#FED7AA" stroke="#DC2626" strokeWidth="1.5" />
        <text x="0" y="3.5" textAnchor="middle" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#9A3412">R2</text>
      </g>

      {/* Center Deadlock Cycle Alert Badge */}
      <g transform="translate(120, 68)">
        <rect x="-26" y="-8" width="52" height="16" rx="8" fill="#FEE2E2" stroke="#DC2626" strokeWidth="1.2" />
        <text x="0" y="3.5" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="7" fontWeight="bold" fill="#991B1B">CYCLE</text>
      </g>
    </svg>
  );
};
