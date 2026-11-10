import React, { useState } from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { AlertTriangle, ShieldCheck, GitFork, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export const ResourceAllocationGraph: React.FC = () => {
  const { getCurrentSnapshot, getCurrentEvent } = useSimulationStore();
  const [graphMode, setGraphMode] = useState<'rag' | 'wfg'>('rag');
  const [zoomLevel, setZoomLevel] = useState(1);

  const snapshot = getCurrentSnapshot();
  const currentEvent = getCurrentEvent();

  if (!snapshot) return null;

  const threads = Object.values(snapshot.threads || {});
  const mutexes = Object.values(snapshot.mutexes || {});
  const deadlockReport = snapshot.deadlockReport || currentEvent?.deadlockDetails;
  const isDeadlocked = deadlockReport?.isDeadlocked;

  // SVG viewBox coordinates
  const width = 720;
  const height = 400;

  const threadCount = threads.length;
  const mutexCount = mutexes.length;

  const threadPositions: Record<number, { x: number; y: number }> = {};
  const mutexPositions: Record<string, { x: number; y: number }> = {};

  threads.forEach((t, i) => {
    const angle = (i / Math.max(1, threadCount)) * 2 * Math.PI - Math.PI / 2;
    const radius = 140;
    threadPositions[t.id] = {
      x: width / 2 + radius * Math.cos(angle),
      y: height / 2 + radius * Math.sin(angle)
    };
  });

  mutexes.forEach((m, i) => {
    const angle = ((i + 0.5) / Math.max(1, mutexCount)) * 2 * Math.PI - Math.PI / 2;
    const radius = 70;
    mutexPositions[m.name] = {
      x: width / 2 + radius * Math.cos(angle),
      y: height / 2 + radius * Math.sin(angle)
    };
  });

  const getThreadColor = (id: number) => {
    if (id === 1) return '#6366F1';
    if (id === 2) return '#10B981';
    if (id === 3) return '#8B5CF6';
    if (id === 4) return '#F59E0B';
    return '#171717';
  };

  return (
    <div className="space-y-3">
      {/* Header, Mode Switcher & Zoom Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1 border-b border-[#E6E0D6]">
        <div className="flex items-center gap-2">
          <GitFork className="w-4 h-4 text-[#171717]" />
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#171717]">
            {graphMode === 'rag' ? 'Resource Allocation Graph' : 'Wait-For Graph'}
          </h3>
          {isDeadlocked ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 animate-pulse">
              <AlertTriangle className="w-3 h-3 text-[#EF4444]" />
              CIRCULAR WAIT DETECTED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#10B981]/15 text-[#047857] border border-[#10B981]/30">
              <ShieldCheck className="w-3 h-3 text-[#10B981]" />
              CYCLE FREE
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-[#EFEAE2] border border-[#DDD6CB] rounded p-0.5">
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.15))}
              title="Zoom Out"
              className="p-1 rounded text-[#57534E] hover:text-[#171717] hover:bg-[#E5DFD4] cursor-pointer"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="font-mono text-[10px] px-1.5 text-[#57534E] font-bold">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.15))}
              title="Zoom In"
              className="p-1 rounded text-[#57534E] hover:text-[#171717] hover:bg-[#E5DFD4] cursor-pointer"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              title="Reset Zoom"
              className="p-1 rounded text-[#57534E] hover:text-[#171717] hover:bg-[#E5DFD4] cursor-pointer border-l border-[#DDD6CB] ml-0.5"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-0.5 bg-[#EFEAE2] p-0.5 rounded border border-[#DDD6CB] text-xs font-mono">
            <button
              onClick={() => setGraphMode('rag')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer text-xs ${
                graphMode === 'rag' ? 'bg-[#171717] text-white font-bold' : 'text-[#57534E] hover:text-[#171717]'
              }`}
            >
              RAG
            </button>
            <button
              onClick={() => setGraphMode('wfg')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer text-xs ${
                graphMode === 'wfg' ? 'bg-[#171717] text-white font-bold' : 'text-[#57534E] hover:text-[#171717]'
              }`}
            >
              Wait-For Graph
            </button>
          </div>
        </div>
      </div>

      {/* Deadlock Alert Banner */}
      {isDeadlocked && deadlockReport && (
        <div className="p-3 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs space-y-1 text-[#EF4444]">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Deadlock Cycle: {deadlockReport.cycleDescription || "Circular wait among threads"}</span>
          </div>
          <p className="text-[11px] text-[#57534E]">
            {deadlockReport.explanation}
          </p>
          <div className="text-[11px] text-[#047857] font-mono font-semibold pt-0.5">
            <strong>Remediation:</strong> {deadlockReport.remediation}
          </div>
        </div>
      )}

      {/* SVG Canvas with Zoom Scaling */}
      <div className="rounded-lg border border-[#E6E0D6] bg-[#F4EFE7] p-2 flex items-center justify-center overflow-hidden min-h-[360px]">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-auto max-w-[720px] max-h-[380px] select-none transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <defs>
            <marker
              id="arrow-holding"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#10B981" />
            </marker>
            <marker
              id="arrow-request"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#F59E0B" />
            </marker>
            <marker
              id="arrow-cycle"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#EF4444" />
            </marker>
          </defs>

          {/* Subtle Grid Background */}
          <pattern id="warm-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#DDD6CB" opacity="0.7" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#warm-grid)" />

          {/* Edges in RAG Mode */}
          {graphMode === 'rag' && (
            <g>
              {mutexes.map((m) => {
                const mPos = mutexPositions[m.name];
                if (!mPos) return null;

                let holdingEdge = null;
                if (m.locked && m.ownerThreadId !== null && threadPositions[m.ownerThreadId]) {
                  const tPos = threadPositions[m.ownerThreadId];
                  const isInCycle = isDeadlocked && deadlockReport?.involvedResources.includes(m.name);

                  holdingEdge = (
                    <line
                      key={`hold-${m.name}`}
                      x1={mPos.x}
                      y1={mPos.y}
                      x2={tPos.x}
                      y2={tPos.y}
                      stroke={isInCycle ? "#EF4444" : "#10B981"}
                      strokeWidth={isInCycle ? 3.5 : 2}
                      markerEnd={isInCycle ? "url(#arrow-cycle)" : "url(#arrow-holding)"}
                      className={isInCycle ? "animate-pulse" : ""}
                    />
                  );
                }

                const requestEdges = m.waitingQueue.map((wId) => {
                  const tPos = threadPositions[wId];
                  if (!tPos) return null;
                  const isInCycle = isDeadlocked && deadlockReport?.deadlockedThreadIds.includes(wId);

                  return (
                    <line
                      key={`req-${wId}-${m.name}`}
                      x1={tPos.x}
                      y1={tPos.y}
                      x2={mPos.x}
                      y2={mPos.y}
                      stroke={isInCycle ? "#EF4444" : "#F59E0B"}
                      strokeWidth={isInCycle ? 3.5 : 2}
                      strokeDasharray={isInCycle ? "none" : "5,4"}
                      markerEnd={isInCycle ? "url(#arrow-cycle)" : "url(#arrow-request)"}
                      className={isInCycle ? "animate-pulse" : ""}
                    />
                  );
                });

                return (
                  <React.Fragment key={m.name}>
                    {holdingEdge}
                    {requestEdges}
                  </React.Fragment>
                );
              })}
            </g>
          )}

          {/* Edges in Wait-For Graph (WFG) Mode */}
          {graphMode === 'wfg' && (
            <g>
              {mutexes.map((m) => {
                if (!m.locked || m.ownerThreadId === null) return null;
                const holderPos = threadPositions[m.ownerThreadId];
                if (!holderPos) return null;

                return m.waitingQueue.map((waiterId) => {
                  const waiterPos = threadPositions[waiterId];
                  if (!waiterPos) return null;

                  const isCycleEdge = isDeadlocked && deadlockReport?.deadlockedThreadIds.includes(waiterId);

                  return (
                    <g key={`wfg-${waiterId}-${m.ownerThreadId}`}>
                      <line
                        x1={waiterPos.x}
                        y1={waiterPos.y}
                        x2={holderPos.x}
                        y2={holderPos.y}
                        stroke={isCycleEdge ? "#EF4444" : "#F59E0B"}
                        strokeWidth={isCycleEdge ? 4 : 2}
                        markerEnd={isCycleEdge ? "url(#arrow-cycle)" : "url(#arrow-request)"}
                        className={isCycleEdge ? "animate-pulse" : ""}
                      />
                      <text
                        x={(waiterPos.x + holderPos.x) / 2}
                        y={(waiterPos.y + holderPos.y) / 2 - 8}
                        fill="#57534E"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        waits for {m.name}
                      </text>
                    </g>
                  );
                });
              })}
            </g>
          )}

          {/* Mutex Nodes (Only in RAG mode) */}
          {graphMode === 'rag' &&
            mutexes.map((m) => {
              const pos = mutexPositions[m.name];
              if (!pos) return null;
              const isHeld = m.locked;
              const isInCycle = isDeadlocked && deadlockReport?.involvedResources.includes(m.name);

              return (
                <g key={`node-m-${m.name}`} transform={`translate(${pos.x}, ${pos.y})`}>
                  <rect
                    x="-28"
                    y="-18"
                    width="56"
                    height="36"
                    rx="4"
                    fill={isInCycle ? "#FEE2E2" : isHeld ? "#D1FAE5" : "#EFEAE2"}
                    stroke={isInCycle ? "#EF4444" : isHeld ? "#10B981" : "#DDD6CB"}
                    strokeWidth={isInCycle ? 2.5 : 1.5}
                  />
                  <text
                    y="4"
                    fill={isInCycle ? "#EF4444" : isHeld ? "#047857" : "#171717"}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {m.name.length > 9 ? m.name.substring(0, 8) + '…' : m.name}
                  </text>
                </g>
              );
            })}

          {/* Thread Nodes */}
          {threads.map((t) => {
            const pos = threadPositions[t.id];
            if (!pos) return null;
            const isDeadlockedThread = isDeadlocked && deadlockReport?.deadlockedThreadIds.includes(t.id);
            const isBlocked = t.state === 'BLOCKED';
            const threadAccent = getThreadColor(t.id);

            return (
              <g key={`node-t-${t.id}`} transform={`translate(${pos.x}, ${pos.y})`}>
                <circle
                  r="26"
                  fill={isDeadlockedThread ? "#FEE2E2" : isBlocked ? "#FEF3C7" : "#171717"}
                  stroke={isDeadlockedThread ? "#EF4444" : isBlocked ? "#F59E0B" : threadAccent}
                  strokeWidth={isDeadlockedThread ? 3.5 : 2.5}
                />
                <text
                  y="-4"
                  fill={isDeadlockedThread ? "#EF4444" : isBlocked ? "#B45309" : "#FFFFFF"}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {t.name}
                </text>
                <text
                  y="11"
                  fill={isDeadlockedThread ? "#EF4444" : isBlocked ? "#B45309" : "#A8A29E"}
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {t.state}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-[#57534E] p-2 bg-[#F4EFE7] rounded border border-[#E6E0D6]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#171717] border border-[#DDD6CB]" />
          <span>Thread Node</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#EFEAE2] border border-[#DDD6CB]" />
          <span>Mutex Resource</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-[#10B981]" />
          <span>Holding Edge</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 border-t-2 border-dashed border-[#F59E0B]" />
          <span>Request Edge</span>
        </div>
        {isDeadlocked && (
          <div className="flex items-center gap-1.5 text-[#EF4444] font-bold">
            <div className="w-4 h-1 bg-[#EF4444] animate-pulse" />
            <span>Deadlock Cycle Edge</span>
          </div>
        )}
      </div>
    </div>
  );
};
