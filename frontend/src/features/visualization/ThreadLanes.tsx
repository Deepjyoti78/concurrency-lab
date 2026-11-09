import React from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import type { ThreadState } from '../../types/simulation';
import { 
  CheckCircle2, 
  Clock, 
  Lock, 
  Play
} from 'lucide-react';

export const ThreadLanes: React.FC = () => {
  const { 
    getCurrentSnapshot, 
    getCurrentEvent, 
    selectedThreadId, 
    selectThread,
    currentRun 
  } = useSimulationStore();

  const snapshot = getCurrentSnapshot();
  const currentEvent = getCurrentEvent();

  if (!snapshot || !snapshot.threads) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono text-sm">
        No active threads in simulation.
      </div>
    );
  }

  const threads = Object.values(snapshot.threads);

  const getStateBadge = (state: ThreadState, blockedOn?: string) => {
    switch (state) {
      case 'RUNNING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 animate-pulse">
            <Play className="w-2.5 h-2.5 fill-indigo-300" />
            RUNNING
          </span>
        );
      case 'READY':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Clock className="w-2.5 h-2.5" />
            READY
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <Lock className="w-2.5 h-2.5" />
            BLOCKED {blockedOn ? `(${blockedOn})` : ''}
          </span>
        );
      case 'TERMINATED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-800 text-slate-400 border border-slate-700">
            <CheckCircle2 className="w-2.5 h-2.5" />
            TERMINATED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-800 text-slate-400">
            NEW
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold tracking-tight text-slate-200">Virtual Thread Execution Lanes</h3>
          <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded bg-[#162035] border border-[#1F2E4D]">
            {threads.length} Virtual Threads
          </span>
        </div>
        <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
          Click a thread lane to inspect registers & call history
        </div>
      </div>

      <div className="space-y-3">
        {threads.map((thread) => {
          const isSelected = selectedThreadId === thread.id;
          const isCurrentActive = currentEvent?.threadId === thread.id;

          const threadEvents = currentRun?.events?.filter(e => e.threadId === thread.id) || [];

          return (
            <div
              key={thread.id}
              onClick={() => selectThread(thread.id)}
              className={`rounded-xl border transition-all p-4 cursor-pointer ${
                isSelected
                  ? 'border-indigo-500/80 bg-[#121A2F] shadow-lg shadow-indigo-950/40'
                  : 'border-[#1F2E4D] bg-[#0E1524] hover:border-[#334A77] hover:bg-[#111A2E]'
              }`}
            >
              {/* Top Row: Thread Identity & Status */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1F2E4D]/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: thread.color }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-100 text-sm">{thread.name}</span>
                      <span className="text-[10px] font-mono text-slate-500">TID #{thread.id}</span>
                      {isCurrentActive && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                          ACTIVE STEP
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Held Mutexes */}
                  {thread.heldMutexes && thread.heldMutexes.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-400" />
                      {thread.heldMutexes.map((m) => (
                        <span key={m} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {m}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Program Counter */}
                  <div className="text-[11px] font-mono text-slate-400 bg-[#162035] px-2 py-0.5 rounded border border-[#1F2E4D]">
                    PC: <strong className="text-slate-200">{thread.pc}</strong>
                  </div>

                  {getStateBadge(thread.state, thread.blockedOn)}
                </div>
              </div>

              {/* Middle Row: Registers Preview & State */}
              <div className="py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[11px] uppercase">Registers:</span>
                  {Object.keys(thread.registers).length === 0 ? (
                    <span className="text-slate-600 text-[11px] italic">none</span>
                  ) : (
                    Object.entries(thread.registers).map(([reg, val]) => (
                      <span key={reg} className="px-2 py-0.5 rounded bg-[#162035] border border-[#1F2E4D] text-slate-200">
                        <strong className="text-indigo-400">{reg}</strong>: {val}
                      </span>
                    ))
                  )}
                </div>

                {isCurrentActive && currentEvent && (
                  <div className="text-indigo-300 text-[11px] flex items-center gap-1.5">
                    <span className="text-slate-500">Last executed:</span>
                    <span className="px-1.5 py-0.5 rounded bg-indigo-950/80 border border-indigo-700/50 font-bold">
                      {currentEvent.instruction.disassembly}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom: Instruction Trace visualization */}
              <div className="pt-2">
                <div className="text-[10px] uppercase font-mono text-slate-500 mb-1.5">
                  Instruction Execution Lane:
                </div>
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  {threadEvents.map((ev, idx) => {
                    const isExecuted = ev.sequence <= (currentEvent?.sequence || 0);
                    const isCurrent = ev.sequence === currentEvent?.sequence;

                    return (
                      <div
                        key={idx}
                        className={`flex-shrink-0 px-2 py-1 rounded text-[11px] font-mono border transition-all ${
                          isCurrent
                            ? 'bg-indigo-600 text-white border-indigo-400 shadow-md font-bold scale-105'
                            : isExecuted
                            ? 'bg-[#162035] text-slate-300 border-[#233557]'
                            : 'bg-[#0A101C] text-slate-600 border-[#1F2E4D]/40'
                        }`}
                        title={`${ev.instruction.disassembly} - ${ev.explanation}`}
                      >
                        <div className="text-[9px] opacity-70">#{ev.sequence}</div>
                        <div>{ev.instruction.opcode}</div>
                      </div>
                    );
                  })}
                  {thread.state === 'TERMINATED' && (
                    <div className="flex-shrink-0 px-2 py-1 rounded text-[10px] font-mono bg-slate-900 text-slate-500 border border-slate-800">
                      END
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
