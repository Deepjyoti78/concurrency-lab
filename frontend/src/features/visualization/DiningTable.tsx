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

  const width = 560;
  const height = 400;
  const centerX = width / 2;
  const centerY = height / 2;
  const tableRadius = 90;
  const philRadius = 145;
  const forkRadius = 100;

  // 5 Philosophers positions
  const philCount = 5;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Utensils className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold tracking-tight text-slate-200">Dining Philosophers Round Table</h3>
          {isDeadlocked ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              DEADLOCK: 5-WAY CIRCULAR WAIT
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              PROGRESS MAINTAINED
            </span>
          )}
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          5 Philosophers • 5 Shared Forks
        </div>
      </div>

      <div className="rounded-xl border border-[#1F2E4D] bg-[#0A0F1D] p-4 flex items-center justify-center overflow-x-auto shadow-inner">
        <svg width={width} height={height} className="select-none">
          {/* Table Background */}
          <circle
            cx={centerX}
            cy={centerY}
            r={tableRadius}
            fill="#121A2F"
            stroke="#1F2E4D"
            strokeWidth="3"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r={tableRadius - 15}
            fill="none"
            stroke="#162035"
            strokeWidth="1.5"
            strokeDasharray="4,4"
          />
          <text
            x={centerX}
            y={centerY + 4}
            fill="#64748B"
            fontSize="11"
            fontFamily="monospace"
            textAnchor="middle"
          >
            SHARED TABLE
          </text>

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
                  x="-14"
                  y="-8"
                  width="28"
                  height="16"
                  rx="3"
                  fill={isHeld ? "#064E3B" : "#1E293B"}
                  stroke={isHeld ? "#10B981" : "#475569"}
                  strokeWidth="1.5"
                />
                <text
                  y="3"
                  fill="#F1F5F9"
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
                    fill="#10B981"
                    fontSize="7"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    held by P{holderId - 1}
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

            return (
              <g key={`phil-${t.id}`} transform={`translate(${px}, ${py})`}>
                <circle
                  r="26"
                  fill={isEating ? "#064E3B" : isDeadlocked ? "#450A0A" : isHungry ? "#451A03" : "#111A2E"}
                  stroke={isEating ? "#10B981" : isDeadlocked ? "#EF4444" : isHungry ? "#F59E0B" : t.color}
                  strokeWidth={isEating || isDeadlocked ? 3 : 2}
                  className="transition-colors"
                />
                <text
                  y="-4"
                  fill="#F1F5F9"
                  fontSize="10"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  Phil-{i}
                </text>
                <text
                  y="10"
                  fill={isEating ? "#6EE7B7" : isDeadlocked ? "#FCA5A5" : isHungry ? "#FCD34D" : "#94A3B8"}
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {isEating ? 'EATING' : isDeadlocked ? 'DEADLOCK' : isHungry ? 'HUNGRY' : 'THINKING'}
                </text>

                {/* Held forks indicators */}
                {heldForks.length > 0 && (
                  <text
                    y="36"
                    fill="#A7F3D0"
                    fontSize="8"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    Forks: {heldForks.join(', ')}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-400 p-2.5 bg-[#0E1524] rounded-lg border border-[#1F2E4D]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#111A2E] border border-indigo-400" />
          <span>Thinking (Contemplating)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#451A03] border border-amber-500" />
          <span>Hungry (Acquiring Forks)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#064E3B] border border-emerald-500" />
          <span>Eating (Both Forks Held)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#450A0A] border border-rose-500" />
          <span>Deadlocked (Circular Wait)</span>
        </div>
      </div>
    </div>
  );
};
