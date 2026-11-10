import React from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { Utensils, AlertTriangle, ShieldCheck } from 'lucide-react';

export const DiningTable: React.FC = () => {
  const { getCurrentSnapshot, getCurrentEvent } = useSimulationStore();
  const snapshot = getCurrentSnapshot();
  const currentEvent = getCurrentEvent();

  if (!snapshot) return null;

  const threads = Object.values(snapshot.threads || {});
  const mutexes = Object.values(snapshot.mutexes || {});
  const isDeadlocked = snapshot.deadlockReport?.isDeadlocked || currentEvent?.deadlockDetected;

  const width = 640;
  const height = 400;
  const centerX = width / 2;
  const centerY = height / 2;
  const tableRadius = 90;
  const philRadius = 145;
  const forkRadius = 95;

  const philCount = 5;

  return (
    <div className="space-y-3">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1 border-b border-[#E6E0D6]">
        <div className="flex items-center gap-2">
          <Utensils className="w-4 h-4 text-[#171717]" />
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#171717]">
            Dining Philosophers Round Table
          </h3>
          {isDeadlocked ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 animate-pulse">
              <AlertTriangle className="w-3 h-3 text-[#EF4444]" />
              DEADLOCK: 5-WAY CIRCULAR WAIT
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#10B981]/15 text-[#047857] border border-[#10B981]/30">
              <ShieldCheck className="w-3 h-3 text-[#10B981]" />
              PROGRESS MAINTAINED
            </span>
          )}
        </div>
        <div className="text-[11px] font-mono text-[#78716C]">
          5 Philosophers • 5 Shared Forks (Mutexes)
        </div>
      </div>

      {/* Table SVG Container */}
      <div className="rounded-lg border border-[#E6E0D6] bg-[#F4EFE7] p-2 flex items-center justify-center overflow-hidden min-h-[380px]">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-auto max-w-[640px] max-h-[390px] select-none"
        >
          {/* Subtle Grid */}
          <pattern id="table-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#DDD6CB" opacity="0.6" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#table-grid)" />

          {/* Table Background */}
          <circle
            cx={centerX}
            cy={centerY}
            r={tableRadius}
            fill="#EFEAE2"
            stroke="#DDD6CB"
            strokeWidth="2"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r={tableRadius - 15}
            fill="none"
            stroke="#DCD5CA"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
          <text
            x={centerX}
            y={centerY + 4}
            fill="#78716C"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            SHARED TABLE
          </text>

          {/* Fork-to-Philosopher Holding Lines */}
          {Array.from({ length: 5 }).map((_, i) => {
            const forkName = `Fork-${i}`;
            const m = mutexes.find(mx => mx.name === forkName);
            if (!m?.locked || !m.ownerThreadId) return null;

            const fAngle = ((i + 0.5) / philCount) * 2 * Math.PI - Math.PI / 2;
            const fx = centerX + forkRadius * Math.cos(fAngle);
            const fy = centerY + forkRadius * Math.sin(fAngle);

            // Owner philosopher angle
            const ownerIdx = m.ownerThreadId - 1;
            const pAngle = (ownerIdx / philCount) * 2 * Math.PI - Math.PI / 2;
            const px = centerX + philRadius * Math.cos(pAngle);
            const py = centerY + philRadius * Math.sin(pAngle);

            return (
              <line
                key={`hold-line-${i}`}
                x1={fx}
                y1={fy}
                x2={px}
                y2={py}
                stroke={isDeadlocked ? "#EF4444" : "#10B981"}
                strokeWidth={isDeadlocked ? 2.5 : 1.5}
                strokeDasharray={isDeadlocked ? "none" : "3,3"}
              />
            );
          })}

          {/* Forks between philosophers */}
          {Array.from({ length: 5 }).map((_, i) => {
            const angle = ((i + 0.5) / philCount) * 2 * Math.PI - Math.PI / 2;
            const forkName = `Fork-${i}`;
            const m = mutexes.find(mx => mx.name === forkName);
            const isHeld = m?.locked;
            const holderId = m?.ownerThreadId;

            const fx = centerX + forkRadius * Math.cos(angle);
            const fy = centerY + forkRadius * Math.sin(angle);

            return (
              <g key={`fork-${i}`} transform={`translate(${fx}, ${fy})`}>
                <rect
                  x="-16"
                  y="-9"
                  width="32"
                  height="18"
                  rx="3"
                  fill={isDeadlocked ? "#FEE2E2" : isHeld ? "#D1FAE5" : "#FBF4EA"}
                  stroke={isDeadlocked ? "#EF4444" : isHeld ? "#10B981" : "#DDD6CB"}
                  strokeWidth={isDeadlocked || isHeld ? "2" : "1"}
                />
                <text
                  y="3"
                  fill={isDeadlocked ? "#EF4444" : isHeld ? "#047857" : "#171717"}
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  F{i}
                </text>
                {isHeld && holderId && (
                  <text
                    y="18"
                    fill={isDeadlocked ? "#EF4444" : "#047857"}
                    fontSize="7"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    P{holderId - 1}
                  </text>
                )}
              </g>
            );
          })}

          {/* Philosophers */}
          {threads.slice(0, 5).map((t, i) => {
            const angle = (i / philCount) * 2 * Math.PI - Math.PI / 2;
            const px = centerX + philRadius * Math.cos(angle);
            const py = centerY + philRadius * Math.sin(angle);

            const heldForks = t.heldMutexes || [];
            const isEating = heldForks.length === 2;
            const isHungry = t.state === 'BLOCKED' || (heldForks.length === 1 && !isEating);
            const isDeadlockedPhil = isDeadlocked && (t.state === 'BLOCKED' || heldForks.length === 1);

            let statusLabel = 'THINKING';
            let fillColor = '#171717';
            let strokeColor = '#171717';
            let textColor = '#FFFFFF';

            if (isDeadlockedPhil) {
              statusLabel = 'DEADLOCKED';
              fillColor = '#FEE2E2';
              strokeColor = '#EF4444';
              textColor = '#EF4444';
            } else if (isEating) {
              statusLabel = 'EATING';
              fillColor = '#D1FAE5';
              strokeColor = '#10B981';
              textColor = '#047857';
            } else if (isHungry) {
              statusLabel = 'HUNGRY';
              fillColor = '#FEF3C7';
              strokeColor = '#F59E0B';
              textColor = '#B45309';
            }

            return (
              <g key={`phil-${t.id}`} transform={`translate(${px}, ${py})`}>
                <circle
                  r="27"
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isEating || isDeadlockedPhil ? 3 : 1.5}
                />
                <text
                  y="-4"
                  fill={statusLabel === 'THINKING' ? '#FFFFFF' : textColor}
                  fontSize="10"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  Phil-{i}
                </text>
                <text
                  y="10"
                  fill={statusLabel === 'THINKING' ? '#A8A29E' : textColor}
                  fontSize="7"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {statusLabel}
                </text>

                {/* Held forks indicators */}
                {heldForks.length > 0 && (
                  <text
                    y="37"
                    fill={isDeadlocked ? "#EF4444" : "#047857"}
                    fontSize="7"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    Forks: {heldForks.map(f => f.replace('Fork-', 'F')).join(', ')}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-[#57534E] p-2 bg-[#F4EFE7] rounded border border-[#E6E0D6]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#171717]" />
          <span>Thinking (Contemplating)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FEF3C7] border border-[#F59E0B]" />
          <span>Hungry (Waiting for 2nd Fork)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#D1FAE5] border border-[#10B981]" />
          <span>Eating (Both Forks Held)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FEE2E2] border border-[#EF4444]" />
          <span>Deadlocked (Circular Wait)</span>
        </div>
      </div>
    </div>
  );
};
