import React from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import type { ThreadState, ExecutionEvent } from '../../types/simulation';
import { 
  CheckCircle2, 
  Clock, 
  Lock, 
  Play, 
  Check,
  ChevronRight,
  Cpu
} from 'lucide-react';

export const ThreadLanes: React.FC = () => {
  const { 
    getCurrentSnapshot, 
    getCurrentEvent, 
    selectedThreadId, 
    selectThread,
    currentRun,
    currentStep
  } = useSimulationStore();

  const snapshot = getCurrentSnapshot();
  const currentEvent = getCurrentEvent();

  if (!snapshot || !snapshot.threads) {
    return (
      <div className="p-8 text-center text-[#78716C] font-mono text-sm bg-[#F4EFE7] rounded border border-[#E6E0D6]">
        No active threads in simulation.
      </div>
    );
  }

  const threads = Object.values(snapshot.threads);

  // Design system colors: Thread 1 = Indigo #6366F1, Thread 2 = Emerald #10B981
  const getThreadColor = (threadId: number, rawColor?: string) => {
    if (threadId === 1) return '#6366F1';
    if (threadId === 2) return '#10B981';
    if (threadId === 3) return '#8B5CF6';
    if (threadId === 4) return '#F59E0B';
    if (threadId === 5) return '#06B6D4';
    return rawColor || '#6366F1';
  };

  const getStateBadge = (state: ThreadState, blockedOn?: string) => {
    switch (state) {
      case 'RUNNING':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#171717] text-white">
            <Play className="w-2.5 h-2.5 fill-white" />
            RUNNING
          </span>
        );
      case 'READY':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-[#10B981]/15 text-[#047857] border border-[#10B981]/30">
            <Clock className="w-2.5 h-2.5 text-[#10B981]" />
            READY
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
            <Lock className="w-2.5 h-2.5" />
            BLOCKED {blockedOn ? `(${blockedOn})` : ''}
          </span>
        );
      case 'TERMINATED':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-[#EAE4D9] text-[#78716C] border border-[#DDD6CB]">
            <CheckCircle2 className="w-2.5 h-2.5" />
            HALTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-[#EAE4D9] text-[#78716C]">
            NEW
          </span>
        );
    }
  };

  return (
    <div className="space-y-2.5 w-full max-w-full min-w-0">
      {/* Top Lane Header Info Bar */}
      <div className="flex items-center justify-between pb-1 border-b border-[#E6E0D6]">
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-[#171717]" />
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#171717]">
            Virtual Thread Execution Lanes
          </h3>
          <span className="text-[10px] font-mono text-[#57534E] px-1.5 py-0.2 rounded bg-[#EFEAE2] border border-[#DDD6CB]">
            {threads.length} {threads.length === 1 ? 'Thread' : 'Threads'}
          </span>
        </div>
        <div className="text-[10px] font-mono text-[#78716C] hidden sm:block">
          Click lane to inspect registers & call history
        </div>
      </div>

      {/* Thread Lanes Grid */}
      <div className="space-y-2.5 w-full min-w-0">
        {threads.map((thread) => {
          const isSelected = selectedThreadId === thread.id;
          const isThreadRunningNow = thread.state === 'RUNNING';
          const executedHistoricalEvent = currentEvent?.threadId === thread.id;
          const threadColor = getThreadColor(thread.id, thread.color);

          // All instruction execution events for this thread across the scenario
          const threadEvents: ExecutionEvent[] = currentRun?.events?.filter(e => e.threadId === thread.id) || [];

          return (
            <div
              key={thread.id}
              onClick={() => selectThread(thread.id)}
              className={`rounded-none border transition-all cursor-pointer overflow-hidden w-full min-w-0 ${
                isSelected
                  ? 'border-[#171717] bg-[#F4EFE7] ring-1 ring-[#171717]/30 shadow-xs'
                  : 'border-[#DDD6CB] bg-[#FBF4EA] hover:border-[#171717] hover:bg-[#F8F5EE]'
              }`}
            >
              {/* Two-Column Structure: LEFT RAIL + RIGHT EXECUTION TRACK */}
              <div className="grid grid-cols-1 md:grid-cols-[210px_minmax(0,1fr)] items-stretch w-full min-w-0">
                {/* 1. LEFT RAIL: Thread identity, ID, state, PC, registers, mutexes */}
                <div 
                  className="p-2.5 border-b md:border-b-0 md:border-r border-[#E6E0D6] bg-[#F8F5EE]/80 flex flex-col justify-between min-w-0"
                  style={{ borderLeftColor: threadColor, borderLeftWidth: '4px' }}
                >
                  <div className="space-y-1.5">
                    {/* Thread identity and state badge */}
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span 
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: threadColor }}
                        />
                        <span className="font-bold text-[#171717] text-xs font-mono truncate">
                          {thread.name}
                        </span>
                        <span className="text-[9px] font-mono text-[#78716C] flex-shrink-0">
                          #{thread.id}
                        </span>
                      </div>
                      <div className="flex-shrink-0">
                        {getStateBadge(thread.state, thread.blockedOn)}
                      </div>
                    </div>

                    {/* Program Counter & Historical Event / CPU Running Status */}
                    <div className="flex items-center justify-between gap-1 text-[10px] font-mono">
                      <div className="flex items-center gap-1 bg-[#EFEAE2] px-1.5 py-0.5 rounded border border-[#DDD6CB]">
                        <span className="text-[#78716C]">PC</span>
                        <strong className="text-[#171717]">{thread.pc}</strong>
                      </div>

                      {/* Distinct badges for currently running vs executed historical event */}
                      {isThreadRunningNow ? (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#171717] text-white animate-pulse">
                          ON CPU
                        </span>
                      ) : executedHistoricalEvent ? (
                        <span 
                          className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold text-white shadow-xs"
                          style={{ backgroundColor: threadColor }}
                        >
                          STEP #{currentEvent.sequence}
                        </span>
                      ) : null}
                    </div>

                    {/* Held Mutex / Resource Count */}
                    <div className="flex items-center gap-1 text-[10px] font-mono text-[#78716C]">
                      <Lock className="w-2.5 h-2.5 text-[#57534E]" />
                      <span>Held Mutexes:</span>
                      <strong className="text-[#171717]">
                        {thread.heldMutexes?.length || 0}
                      </strong>
                      {thread.heldMutexes && thread.heldMutexes.length > 0 && (
                        <span className="text-[9px] text-[#B45309] font-bold truncate">
                          ({thread.heldMutexes.join(',')})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Compact CPU Registers */}
                  <div className="mt-2 pt-1.5 border-t border-[#E6E0D6] font-mono text-[10px]">
                    <div className="text-[9px] uppercase font-bold text-[#78716C] mb-0.5">
                      Registers
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {Object.keys(thread.registers).length === 0 ? (
                        <span className="text-[#A8A29E] text-[10px] italic">none</span>
                      ) : (
                        Object.entries(thread.registers).map(([reg, val]) => (
                          <span 
                            key={reg} 
                            className="px-1.5 py-0.2 rounded bg-[#EFEAE2] border border-[#DDD6CB] text-[#171717] flex items-center gap-1"
                          >
                            <span className="text-[#78716C]">{reg}:</span>
                            <strong className="text-[#171717]">{val}</strong>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. RIGHT EXECUTION TRACK: Full-width instruction ribbon */}
                <div className="p-2.5 flex flex-col justify-center min-w-0 overflow-hidden bg-[#FBF4EA]/40">
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1 text-[#78716C]">
                    <span className="uppercase font-bold">
                      Execution Track
                    </span>
                    <span>
                      {threadEvents.filter(e => e.sequence <= currentStep).length} of {threadEvents.length} executed
                    </span>
                  </div>

                  {/* Horizontal Scrollable Instruction Ribbon */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-thin min-w-0">
                    {threadEvents.length === 0 ? (
                      <div className="text-[11px] font-mono text-[#A8A29E] italic py-1">
                        No instruction stream registered for this thread.
                      </div>
                    ) : (
                      threadEvents.map((ev, idx) => {
                        const isExecuted = ev.sequence <= currentStep;
                        const isActive = ev.sequence === currentStep;
                        const isAssociatedWithPC = ev.previousPc === thread.pc || (isExecuted && ev.newPc === thread.pc);

                        return (
                          <div
                            key={ev.sequence}
                            className={`flex-shrink-0 flex items-center gap-1 ${
                              isActive ? 'z-10' : ''
                            }`}
                          >
                            {/* Instruction Card */}
                            <div
                              className={`w-38 sm:w-42 p-1.5 rounded-none border font-mono text-left transition-all ${
                                isActive
                                  ? 'bg-[#171717] text-white border-[#171717] shadow-xs ring-1 ring-offset-1 ring-offset-[#FBF4EA]'
                                  : isExecuted
                                  ? 'bg-[#EFEAE2] text-[#171717] border-[#DDD6CB]'
                                  : 'bg-[#FBF4EA] text-[#78716C] border-[#DDD6CB] border-dashed'
                              }`}
                              style={isActive ? { borderColor: threadColor, outlineColor: threadColor } : undefined}
                              title={`${ev.instruction.disassembly} — ${ev.explanation}`}
                            >
                              {/* Top Bar: Sequence & Status */}
                              <div className="flex items-center justify-between text-[9px] mb-0.5">
                                <span className={isActive ? 'text-amber-300 font-bold' : isExecuted ? 'text-[#78716C]' : 'text-[#A8A29E]'}>
                                  Step #{ev.sequence}
                                </span>

                                <div className="flex items-center gap-1">
                                  {isAssociatedWithPC && (
                                    <span className={`text-[8px] px-1 py-0.2 rounded font-bold ${
                                      isActive ? 'bg-amber-300 text-[#171717]' : 'bg-[#DDD6CB] text-[#171717]'
                                    }`}>
                                      PC:{ev.previousPc}
                                    </span>
                                  )}
                                  {isActive ? (
                                    <span className="px-1 py-0.2 bg-amber-400 text-[#171717] font-bold rounded text-[8px]">
                                      ACTIVE
                                    </span>
                                  ) : isExecuted ? (
                                    <span className="flex items-center text-[#047857] font-semibold text-[8px]">
                                      <Check className="w-2.5 h-2.5" />
                                      DONE
                                    </span>
                                  ) : (
                                    <span className="text-[#A8A29E] text-[8px]">
                                      PENDING
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Opcode */}
                              <div className={`font-bold text-[11px] truncate ${isActive ? 'text-white' : isExecuted ? 'text-[#171717]' : 'text-[#57534E]'}`}>
                                {ev.instruction.opcode}
                              </div>

                              {/* Instruction Disassembly */}
                              <div className={`text-[9px] truncate ${isActive ? 'text-stone-300' : isExecuted ? 'text-[#57534E]' : 'text-[#78716C]'}`}>
                                {ev.instruction.arg1 ? `${ev.instruction.arg1}${ev.instruction.arg2 ? `, ${ev.instruction.arg2}` : ''}` : '—'}
                              </div>

                              {/* Outcome Preview if active */}
                              {isActive && ev.explanation && (
                                <div className="mt-1 pt-0.5 border-t border-stone-700 text-[8px] text-amber-200 truncate font-sans">
                                  {ev.explanation}
                                </div>
                              )}
                            </div>

                            {/* Chevron between instructions if not last */}
                            {idx < threadEvents.length - 1 && (
                              <ChevronRight className={`w-3 h-3 flex-shrink-0 ${
                                isExecuted ? 'text-[#78716C]' : 'text-[#DDD6CB]'
                              }`} />
                            )}
                          </div>
                        );
                      })
                    )}

                    {/* Lane Terminator */}
                    {thread.state === 'TERMINATED' && (
                      <div className="flex-shrink-0 px-1.5 py-1 rounded bg-[#EAE4D9] text-[#78716C] border border-[#DDD6CB] font-mono text-[9px] font-bold">
                        HALT
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
