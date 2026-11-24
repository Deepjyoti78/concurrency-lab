import React from 'react';

export const StageDecorations: React.FC = () => {
  return (
    <g className="stage-decorations" pointerEvents="none">
      {/* 1. Left Monstera Potted Plant */}
      <g transform="translate(295, 360)">
        {/* Pot Shadow */}
        <ellipse cx="0" cy="18" rx="14" ry="6" fill="rgba(24, 24, 27, 0.08)" />
        {/* Ceramic Pot */}
        <polygon
          points="-12,0 12,0 9,16 -9,16"
          fill="#FAF6EE"
          stroke="#18181B"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
        {/* Rim */}
        <ellipse cx="0" cy="0" rx="12" ry="3.5" fill="#EFEAE2" stroke="#18181B" strokeWidth="1.25" />
        {/* Soil */}
        <ellipse cx="0" cy="0" rx="10" ry="2.5" fill="#78716C" />
        {/* Plant Stems & Monstera Leaves */}
        <path d="M 0,0 Q -6,-14 -16,-22" fill="none" stroke="#059669" strokeWidth="1.5" />
        <ellipse cx="-16" cy="-22" rx="9" ry="6" fill="#A7F3D0" stroke="#18181B" strokeWidth="1.25" transform="rotate(-30, -16, -22)" />
        <path d="M 0,0 Q 2,-18 0,-30" fill="none" stroke="#059669" strokeWidth="1.5" />
        <ellipse cx="0" cy="-30" rx="8" ry="10" fill="#6EE7B7" stroke="#18181B" strokeWidth="1.25" />
        <path d="M 0,0 Q 8,-12 18,-18" fill="none" stroke="#059669" strokeWidth="1.5" />
        <ellipse cx="18" cy="-18" rx="9" ry="6" fill="#A7F3D0" stroke="#18181B" strokeWidth="1.25" transform="rotate(25, 18, -18)" />
      </g>

      {/* 2. Right Tall Ficus Potted Plant */}
      <g transform="translate(745, 230)">
        {/* Pot Shadow */}
        <ellipse cx="0" cy="22" rx="16" ry="7" fill="rgba(24, 24, 27, 0.08)" />
        {/* Ceramic Pot */}
        <polygon
          points="-14,0 14,0 11,20 -11,20"
          fill="#FAF6EE"
          stroke="#18181B"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
        <ellipse cx="0" cy="0" rx="14" ry="4" fill="#EFEAE2" stroke="#18181B" strokeWidth="1.25" />
        {/* Tall Stems & Leaves */}
        <path d="M 0,0 Q -4,-24 -6,-46" fill="none" stroke="#059669" strokeWidth="1.5" />
        <ellipse cx="-6" cy="-46" rx="6" ry="12" fill="#6EE7B7" stroke="#18181B" strokeWidth="1.25" transform="rotate(-15, -6, -46)" />
        <path d="M 0,0 Q 6,-18 10,-36" fill="none" stroke="#059669" strokeWidth="1.5" />
        <ellipse cx="10" cy="-36" rx="6" ry="10" fill="#A7F3D0" stroke="#18181B" strokeWidth="1.25" transform="rotate(20, 10, -36)" />
      </g>

      {/* 3. Hardcover CS Textbooks Stack (bottom right) */}
      <g transform="translate(705, 375)">
        <ellipse cx="12" cy="14" rx="20" ry="8" fill="rgba(24, 24, 27, 0.08)" />
        {/* Book 1 (bottom green book) */}
        <polygon points="0,6 20,-4 32,2 12,12" fill="#10B981" stroke="#18181B" strokeWidth="1.2" />
        <polygon points="0,6 12,12 12,15 0,9" fill="#059669" stroke="#18181B" strokeWidth="1.2" />
        <polygon points="12,12 32,2 32,5 12,15" fill="#E4E4E7" stroke="#18181B" strokeWidth="1.2" />
        {/* Book 2 (top beige book) */}
        <polygon points="-2,1 18,-9 30,-3 10,7" fill="#F4EFE7" stroke="#18181B" strokeWidth="1.2" />
        <polygon points="-2,1 10,7 10,10 -2,4" fill="#D4CCC0" stroke="#18181B" strokeWidth="1.2" />
        <polygon points="10,7 30,-3 30,0 10,10" fill="#E4E4E7" stroke="#18181B" strokeWidth="1.2" />
      </g>

      {/* 4. Ceramic Coffee Mug */}
      <g transform="translate(745, 360)">
        <ellipse cx="0" cy="8" rx="8" ry="4" fill="rgba(24, 24, 27, 0.08)" />
        <polygon points="-6,0 6,0 5,8 -5,8" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.2" />
        <ellipse cx="0" cy="0" rx="6" ry="2" fill="#78350F" stroke="#18181B" strokeWidth="1.2" />
        {/* Mug Handle */}
        <path d="M 6,2 Q 10,4 6,7" fill="none" stroke="#18181B" strokeWidth="1.2" />
      </g>
    </g>
  );
};
