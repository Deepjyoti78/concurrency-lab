import React, { useState } from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { AlertTriangle, ShieldCheck, GitFork } from 'lucide-react';

export const ResourceAllocationGraph: React.FC = () => {
  const { getCurrentSnapshot, getCurrentEvent } = useSimulationStore();
  const [graphMode, setGraphMode] = useState<'rag' | 'wfg'>('rag');

  const snapshot = getCurrentSnapshot();
  const currentEvent = getCurrentEvent();

  if (!snapshot) return null;

  const threads = Object.values(snapshot.threads || {});
  const mutexes = Object.values(snapshot.mutexes || {});
  const deadlockReport = snapshot.deadlockReport || currentEvent?.deadlockDetails;
  const isDeadlocked = deadlockReport?.isDeadlocked;

  // SVG dimensions
  const width = 640;
  const height = 360;

  const threadCount = threads.length;
  const mutexCount = mutexes.length;

  const threadPositions: Record<number, { x: number; y: number }> = {};
  const mutexPositions: Record<string, { x: number; y: number }> = {};

  threads.forEach((t, i) => {
    const angle = (i / Math.max(1, threadCount)) * 2 * Math.PI - Math.PI / 2;
    const radius = 130;
    threadPositions[t.id] = {
      x: width / 2 + radius * Math.cos(angle),
      y: height / 2 + radius * Math.sin(angle)
    };
  });

  mutexes.forEach((m, i) => {
    const angle = ((i + 0.5) / Math.max(1, mutexCount)) * 2 * Math.PI - Math.PI / 2;
    const radius = 65;
    mutexPositions[m.name] = {
      x: width / 2 + radius * Math.cos(angle),
      y: height / 2 + radius * Math.sin(angle)
    };
  });

  return (
    <div className="space-y-4">
      {/* Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <GitFork className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold tracking-tight text-slate-200">
            {graphMode === 'rag' ? 'Resource Allocation Graph (RAG)' : 'Wait-For Graph (WFG)'}
          </h3>
          {isDeadlocked ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              CYCLE DETECTED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              CYCLE FREE
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 bg-[#162035] p-1 rounded-lg border border-[#1F2E4D] text-xs font-mono">
          <button
            onClick={() => setGraphMode('rag')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              graphMode === 'rag' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            RAG (Bipartite)
          </button>
          <button
            onClick={() => setGraphMode('wfg')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              graphMode === 'wfg' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Wait-For Graph
          </button>
        </div>
      </div>

      {/* Deadlock Alert Banner */}
      {isDeadlocked && deadlockReport && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-700/60 text-xs space-y-2 text-rose-200 shadow-lg">
          <div className="flex items-center gap-2 font-bold text-rose-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Deadlock Cycle Detected: Circular Wait</span>
          </div>
          <p className="font-mono text-[11px] text-rose-300">
            {deadlockReport.cycleDescription || "Circular wait among threads."}
          </p>
          <p className="text-[11px] text-slate-300">
            {deadlockReport.explanation}
          </p>
          <div className="pt-1 text-[11px] text-emerald-400 font-mono">
            <strong>Remediation:</strong> {deadlockReport.remediation}
          </div>
        </div>
      )}

      {/* SVG Canvas */}
      <div className="rounded-xl border border-[#1F2E4D] bg-[#0A0F1D] p-4 flex items-center justify-center overflow-x-auto shadow-inner">
        <svg width={width} height={height} className="select-none">
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

          {/* Background grid */}
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#1F2E4D" opacity="0.3" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />

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
                      strokeWidth={isInCycle ? 3 : 2}
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
                      strokeWidth={isInCycle ? 3 : 2}
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
                        strokeWidth={isCycleEdge ? 3.5 : 2}
                        markerEnd={isCycleEdge ? "url(#arrow-cycle)" : "url(#arrow-request)"}
                        className={isCycleEdge ? "animate-pulse" : ""}
                      />
                      <text
                        x={(waiterPos.x + holderPos.x) / 2}
                        y={(waiterPos.y + holderPos.y) / 2 - 8}
                        fill="#94A3B8"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        for {m.name}
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
                    x="-24"
                    y="-16"
                    width="48"
                    height="32"
                    rx="4"
                    fill={isInCycle ? "#450A0A" : isHeld ? "#064E3B" : "#1E293B"}
                    stroke={isInCycle ? "#EF4444" : isHeld ? "#10B981" : "#475569"}
                    strokeWidth={isInCycle ? 2 : 1.5}
                    className="transition-colors"
                  />
                  <text
                    y="4"
                    fill="#F1F5F9"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {m.name.length > 8 ? m.name.substring(0, 7) + '…' : m.name}
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

            return (
              <g key={`node-t-${t.id}`} transform={`translate(${pos.x}, ${pos.y})`}>
                <circle
                  r="24"
                  fill={isDeadlockedThread ? "#450A0A" : isBlocked ? "#31102A" : "#111A2E"}
                  stroke={isDeadlockedThread ? "#EF4444" : t.color}
                  strokeWidth={isDeadlockedThread ? 3 : 2}
                  className="transition-all"
                />
                <text
                  y="-4"
                  fill="#F1F5F9"
                  fontSize="10"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {t.name}
                </text>
                <text
                  y="10"
                  fill={isDeadlockedThread ? "#FCA5A5" : "#94A3B8"}
                  fontSize="8"
                  fontFamily="monospace"
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
      <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-mono text-slate-400 p-2 bg-[#0E1524] rounded-lg border border-[#1F2E4D]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border border-indigo-400 bg-[#111A2E]" />
          <span>Thread Node (Circle)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border border-emerald-500 bg-[#064E3B]" />
          <span>Mutex Resource (Box)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-emerald-500" />
          <span>Holding Edge (Resource → Thread)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 border-t border-dashed border-amber-500" />
          <span>Request Edge (Thread → Resource)</span>
        </div>
        {isDeadlocked && (
          <div className="flex items-center gap-1.5 text-rose-400 font-bold">
            <div className="w-4 h-1 bg-rose-500 animate-pulse" />
            <span>Deadlock Cycle</span>
          </div>
        )}
      </div>
    </div>
  );
};
