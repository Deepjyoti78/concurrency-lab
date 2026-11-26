import React from 'react';

export const StageDecorations: React.FC = () => {
  return (
    <g className="stage-decorations" pointerEvents="none">
      {/* 1. Left Botanical Potted Plant (Soft muted sage & cream ceramic pot) */}
      <g transform="translate(52, 372) scale(1.12)">
        {/* Soft Ground Cast Shadow */}
        <ellipse cx="0" cy="36" rx="22" ry="9" fill="rgba(24, 24, 27, 0.05)" />

        {/* Stems */}
        <path d="M -2,0 Q -12,-28 -20,-42" fill="none" stroke="#9AA994" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 0,0 Q 0,-34 -2,-54" fill="none" stroke="#9AA994" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 2,0 Q 12,-26 20,-38" fill="none" stroke="#9AA994" strokeWidth="1.5" strokeLinecap="round" />

        {/* Left Leaf */}
        <path
          d="M -20,-42 C -32,-48 -30,-68 -16,-62 C -8,-58 -12,-46 -20,-42 Z"
          fill="#C2CEBD"
          stroke="#95A38F"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <line x1="-20" y1="-44" x2="-21" y2="-58" stroke="#95A38F" strokeWidth="0.75" />

        {/* Center Tall Leaf */}
        <path
          d="M -2,-54 C -10,-68 -4,-88 2,-88 C 8,-88 12,-68 0,-54 Z"
          fill="#B3C2AD"
          stroke="#95A38F"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <line x1="-1" y1="-56" x2="1" y2="-82" stroke="#95A38F" strokeWidth="0.75" />

        {/* Right Leaf */}
        <path
          d="M 20,-38 C 32,-46 30,-66 16,-58 C 10,-54 12,-42 20,-38 Z"
          fill="#CBD6C7"
          stroke="#95A38F"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <line x1="19" y1="-40" x2="21" y2="-54" stroke="#95A38F" strokeWidth="0.75" />

        {/* Ceramic Pot Body */}
        <path
          d="M -16,0 L -13,30 C -13,34 13,34 13,30 L 16,0 Z"
          fill="#EAE3D7"
          stroke="#BFB7AA"
          strokeWidth="1.15"
          strokeLinejoin="round"
        />
        {/* Pot Rim & Soil */}
        <ellipse cx="0" cy="0" rx="16" ry="5" fill="#DFD7C8" stroke="#BFB7AA" strokeWidth="1.15" />
        <ellipse cx="0" cy="0" rx="12" ry="3.2" fill="#A99F91" />
      </g>

      {/* 2. Right Botanical Potted Plant (Beside Thread B) */}
      <g transform="translate(998, 212) scale(1.12)">
        {/* Soft Ground Cast Shadow */}
        <ellipse cx="0" cy="34" rx="20" ry="8" fill="rgba(24, 24, 27, 0.05)" />

        {/* Stems */}
        <path d="M -2,0 Q -12,-28 -18,-44" fill="none" stroke="#9AA994" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 0,0 Q 2,-36 4,-56" fill="none" stroke="#9AA994" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 3,0 Q 14,-24 20,-36" fill="none" stroke="#9AA994" strokeWidth="1.5" strokeLinecap="round" />

        {/* Leaves */}
        <path
          d="M -18,-44 C -28,-52 -24,-72 -12,-64 C -6,-60 -10,-48 -18,-44 Z"
          fill="#C2CEBD"
          stroke="#95A38F"
          strokeWidth="1"
        />
        <path
          d="M 4,-56 C -4,-70 4,-90 10,-88 C 16,-86 18,-66 4,-56 Z"
          fill="#B3C2AD"
          stroke="#95A38F"
          strokeWidth="1"
        />
        <path
          d="M 20,-36 C 32,-42 30,-60 18,-54 C 12,-50 14,-40 20,-36 Z"
          fill="#CBD6C7"
          stroke="#95A38F"
          strokeWidth="1"
        />

        {/* Ceramic Pot Body */}
        <path
          d="M -15,0 L -12,28 C -12,32 12,32 12,28 L 15,0 Z"
          fill="#EAE3D7"
          stroke="#BFB7AA"
          strokeWidth="1.15"
          strokeLinejoin="round"
        />
        <ellipse cx="0" cy="0" rx="15" ry="4.5" fill="#DFD7C8" stroke="#BFB7AA" strokeWidth="1.15" />
        <ellipse cx="0" cy="0" rx="11" ry="2.8" fill="#A99F91" />
      </g>

      {/* 3. Isometric Stacked Books (Bottom Right Foreground) */}
      <g transform="translate(905, 396) scale(1.1)">
        <ellipse cx="22" cy="18" rx="28" ry="11" fill="rgba(24, 24, 27, 0.06)" />

        {/* Bottom Book (Muted Sage-Gray) */}
        <polygon points="0,10 26,-4 46,7 20,21" fill="#D8DDD4" stroke="#9E978B" strokeWidth="1.1" strokeLinejoin="round" />
        <polygon points="0,10 20,21 20,27 0,16" fill="#C2C8BE" stroke="#9E978B" strokeWidth="1.1" strokeLinejoin="round" />
        <polygon points="20,21 46,7 46,13 20,27" fill="#F2EDE4" stroke="#9E978B" strokeWidth="1.1" strokeLinejoin="round" />

        {/* Top Book (Warm Cream) */}
        <polygon points="-3,3 23,-11 43,0 17,14" fill="#EFEAE0" stroke="#9E978B" strokeWidth="1.1" strokeLinejoin="round" />
        <polygon points="-3,3 17,14 17,19 -3,8" fill="#DCD5C9" stroke="#9E978B" strokeWidth="1.1" strokeLinejoin="round" />
        <polygon points="17,14 43,0 43,5 17,19" fill="#FAF6EE" stroke="#9E978B" strokeWidth="1.1" strokeLinejoin="round" />
      </g>

      {/* 4. Ceramic Coffee Cup (Beside Books) */}
      <g transform="translate(976, 366) scale(1.1)">
        <ellipse cx="0" cy="18" rx="14" ry="6" fill="rgba(24, 24, 27, 0.06)" />
        {/* Cup Handle */}
        <path d="M 10,4 Q 17,6 14,12 Q 11,16 9,14" fill="none" stroke="#A69F93" strokeWidth="2.2" strokeLinecap="round" />
        {/* Cup Body */}
        <path
          d="M -10,0 L -8,15 C -8,19 8,19 8,15 L 10,0 Z"
          fill="#F5F0E6"
          stroke="#A69F93"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
        {/* Cup Rim & Coffee */}
        <ellipse cx="0" cy="0" rx="10" ry="3.8" fill="#FAF6EE" stroke="#A69F93" strokeWidth="1.1" />
        <ellipse cx="0" cy="0.5" rx="7.5" ry="2.4" fill="#7A5A46" />
      </g>
    </g>
  );
};
