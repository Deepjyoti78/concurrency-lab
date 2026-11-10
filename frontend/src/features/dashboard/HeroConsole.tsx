import React from 'react';

interface HeroConsoleProps {
  onEnterWorkspace: () => void;
}

export const HeroConsole: React.FC<HeroConsoleProps> = ({ onEnterWorkspace }) => {
  return (
    <div 
      onClick={onEnterWorkspace}
      title="Click to enter Laboratory Workspace"
      className="group relative w-full max-w-[500px] select-none flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-[1.01] px-2 sm:px-0"
    >
      <img 
        src="/assets/Thread%20Interleaving%20Shared%20Memory%20UI.png" 
        alt="ConcurrencyLab 3D Physical Concurrency Simulation Console" 
        className="w-full h-auto max-w-full object-contain select-none cursor-pointer"
        loading="eager"
      />
    </div>
  );
};
