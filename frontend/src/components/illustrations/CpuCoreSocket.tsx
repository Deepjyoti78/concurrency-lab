import React from 'react';

export const CpuCoreSocket: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg viewBox="0 0 240 140" className={`w-full h-full ${className}`} preserveAspectRatio="xMidYMid meet">
      {/* Ground Cast Shadow */}
      <ellipse cx="120" cy="100" rx="80" ry="24" fill="rgba(24, 24, 27, 0.08)" />

      {/* Outer Ceramic Socket Base */}
      <polygon
        points="120,30 185,65 120,100 55,65"
        fill="#DDD6CB"
        stroke="#18181B"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <polygon
        points="55,65 120,100 120,108 55,73"
        fill="#C4BCB0"
        stroke="#18181B"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <polygon
        points="120,100 185,65 185,73 120,108"
        fill="#B5ACA0"
        stroke="#18181B"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />

      {/* Gold Edge Connector Pins */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line
          key={`pin-l-${i}`}
          x1={68 + i * 9}
          y1={72 + i * 4.8}
          x2={68 + i * 9}
          y2={80 + i * 4.8}
          stroke="#D97706"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line
          key={`pin-r-${i}`}
          x1={128 + i * 9}
          y1={96 - i * 4.8}
          x2={128 + i * 9}
          y2={104 - i * 4.8}
          stroke="#D97706"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ))}

      {/* Raised Multi-Core Silicon Die / CPU Package */}
      <polygon
        points="120,38 168,64 120,90 72,64"
        fill="#FAF6EE"
        stroke="#18181B"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <polygon
        points="72,64 120,90 120,96 72,70"
        fill="#E8E2D8"
        stroke="#18181B"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <polygon
        points="120,90 168,64 168,70 120,96"
        fill="#D6CFC4"
        stroke="#18181B"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* Dual Core Division Line across die */}
      <line x1="120" y1="42" x2="120" y2="86" stroke="#18181B" strokeWidth="1" strokeDasharray="2,2" />

      {/* Core 0 label */}
      <text
        x="98"
        y="62"
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="7.5"
        fontWeight="bold"
        fill="#18181B"
      >
        CORE 0
      </text>
      <circle cx="98" cy="72" r="3" fill="#8B5CF6" />

      {/* Core 1 label */}
      <text
        x="142"
        y="62"
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="7.5"
        fontWeight="bold"
        fill="#18181B"
      >
        CORE 1
      </text>
      <circle cx="142" cy="72" r="3" fill="#10B981" />

      {/* Task Queue Influx: Left Queue (Thread A queue task) */}
      <g transform="translate(36, 42)">
        <rect x="0" y="0" width="28" height="13" rx="3" fill="#EDE9FE" stroke="#8B5CF6" strokeWidth="1" />
        <text x="14" y="9" textAnchor="middle" fontFamily="monospace" fontSize="6.5" fontWeight="bold" fill="#6D28D9">T1 [Q1]</text>
      </g>
      <line x1="64" y1="48" x2="80" y2="54" stroke="#8B5CF6" strokeWidth="1.2" strokeDasharray="2,2" />

      {/* Task Queue Influx: Right Queue (Thread B queue task) */}
      <g transform="translate(176, 42)">
        <rect x="0" y="0" width="28" height="13" rx="3" fill="#DCFCE7" stroke="#10B981" strokeWidth="1" />
        <text x="14" y="9" textAnchor="middle" fontFamily="monospace" fontSize="6.5" fontWeight="bold" fill="#047857">T2 [Q2]</text>
      </g>
      <line x1="176" y1="48" x2="160" y2="54" stroke="#10B981" strokeWidth="1.2" strokeDasharray="2,2" />
    </svg>
  );
};
