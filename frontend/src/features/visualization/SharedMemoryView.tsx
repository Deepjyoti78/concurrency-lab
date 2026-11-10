import React from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import type { MemoryAccessRecord } from '../../types/simulation';
import { Database, ArrowRight, History, Zap } from 'lucide-react';

export const SharedMemoryView: React.FC = () => {
  const { getCurrentSnapshot, getCurrentEvent } = useSimulationStore();
  const snapshot = getCurrentSnapshot();
  const currentEvent = getCurrentEvent();

  if (!snapshot || !snapshot.sharedVariables) {
    return (
      <div className="p-8 text-center text-[#78716C] font-mono text-sm bg-[#F4EFE7] rounded-lg border border-[#E6E0D6]">
        No shared memory variables declared in this scenario.
      </div>
    );
  }

  const variables = Object.entries(snapshot.sharedVariables);
  const accessHistory: MemoryAccessRecord[] = snapshot.memoryAccessHistory || [];

  const getThreadColor = (threadId: number) => {
    if (threadId === 1) return '#6366F1';
    if (threadId === 2) return '#10B981';
    if (threadId === 3) return '#8B5CF6';
    if (threadId === 4) return '#F59E0B';
    return '#171717';
  };

  return (
    <div className="space-y-4">
      {/* Subsystem Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-[#E6E0D6]">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#171717]" />
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#171717]">
            Shared Memory Subsystem
          </h3>
          <span className="text-[10px] font-mono text-[#57534E] px-2 py-0.5 rounded bg-[#EFEAE2] border border-[#DDD6CB]">
            {variables.length} {variables.length === 1 ? 'Variable' : 'Variables'}
          </span>
        </div>
        <div className="text-[11px] font-mono text-[#78716C]">
          Atomic memory state synced from C++ engine core
        </div>
      </div>

      {/* Responsive Variable Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {variables.map(([name, meta]) => {
          const delta = currentEvent?.memoryDeltas?.find(d => d.variable === name);
          const hasDelta = !!delta;
          const isRaceOnVar = currentEvent?.raceDetected && currentEvent?.raceDetails?.variable === name;
          const threadColor = meta.lastModifiedByThreadId > 0 ? getThreadColor(meta.lastModifiedByThreadId) : '#78716C';

          return (
            <div
              key={name}
              className={`rounded-lg border p-3.5 transition-all bg-[#F4EFE7] ${
                isRaceOnVar
                  ? 'border-[#F59E0B] ring-1 ring-[#F59E0B] bg-[#F59E0B]/10'
                  : hasDelta
                  ? 'border-[#171717] ring-1 ring-[#171717]/30 bg-white'
                  : 'border-[#E6E0D6] hover:border-[#DDD6CB]'
              }`}
            >
              {/* Card Header: Variable Name & Flags */}
              <div className="flex items-center justify-between pb-2 border-b border-[#E6E0D6]">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-[#171717] text-xs">{name}</span>
                  <span className="text-[9px] font-mono text-[#78716C] bg-[#EFEAE2] px-1.5 py-0.2 rounded border border-[#DDD6CB]">
                    int32
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  {hasDelta && (
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      delta.type === 'WRITE' 
                        ? 'bg-[#10B981]/15 text-[#047857] border border-[#10B981]/30' 
                        : 'bg-[#6366F1]/15 text-[#4338CA] border border-[#6366F1]/30'
                    }`}>
                      {delta.type}
                    </span>
                  )}
                  {isRaceOnVar && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#F59E0B]/20 text-[#B45309] border border-[#F59E0B]/40 flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5 text-[#F59E0B]" />
                      RACE CONFLICT
                    </span>
                  )}
                </div>
              </div>

              {/* Variable Value Display */}
              <div className="my-3 flex items-baseline justify-between">
                <div>
                  <div className="text-[9px] uppercase font-mono font-bold text-[#78716C]">Current Value</div>
                  <div className={`text-3xl font-mono font-bold tracking-tight transition-transform ${
                    hasDelta ? 'scale-105 text-[#171717]' : 'text-[#171717]'
                  }`}>
                    {meta.value}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[9px] uppercase font-mono font-bold text-[#78716C]">Previous</div>
                  <div className="text-sm font-mono text-[#57534E] font-semibold flex items-center gap-1 justify-end">
                    <span>{meta.previousValue}</span>
                    <ArrowRight className="w-3 h-3 text-[#78716C]" />
                    <span className="font-bold text-[#171717]">{meta.value}</span>
                  </div>
                </div>
              </div>

              {/* Stats Footer */}
              <div className="pt-2 border-t border-[#E6E0D6] grid grid-cols-2 gap-1.5 text-[10px] font-mono text-[#57534E]">
                <div>
                  <span className="text-[#78716C]">Writes:</span> <strong className="text-[#171717]">{meta.writeCount}</strong>
                </div>
                <div className="text-right">
                  <span className="text-[#78716C]">Reads:</span> <strong className="text-[#171717]">{meta.readCount}</strong>
                </div>
                <div className="col-span-2 truncate pt-1 flex items-center gap-1.5 border-t border-[#E6E0D6]/60">
                  <span className="text-[#78716C]">Last accessed by:</span>
                  {meta.lastModifiedByThreadId > 0 ? (
                    <span className="inline-flex items-center gap-1 font-bold text-[#171717]">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: threadColor }} />
                      Thread #{meta.lastModifiedByThreadId}
                    </span>
                  ) : (
                    <span className="text-[#78716C] italic">Init State</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Memory Access History Feed */}
      <div className="rounded-lg border border-[#E6E0D6] bg-[#F4EFE7] overflow-hidden">
        <div className="px-3.5 py-2 border-b border-[#E6E0D6] bg-[#EFEAE2] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#171717] uppercase tracking-wide">
            <History className="w-3.5 h-3.5 text-[#171717]" />
            <span>Memory Access Journal</span>
          </div>
          <span className="text-[10px] font-mono text-[#78716C]">
            {accessHistory.length} total memory operations
          </span>
        </div>

        <div className="max-h-64 overflow-y-auto divide-y divide-[#E6E0D6] text-xs font-mono scrollbar-thin">
          {accessHistory.length === 0 ? (
            <div className="p-6 text-center text-[#78716C] font-mono text-[11px] flex flex-col items-center justify-center gap-1">
              <span className="font-semibold text-[#57534E]">Initial state: no memory operations recorded yet.</span>
              <span>Step forward or run simulation to trace atomic reads, writes, and cache interleavings.</span>
            </div>
          ) : (
            accessHistory.map((rec: MemoryAccessRecord, i: number) => {
              const threadColor = getThreadColor(rec.threadId);
              return (
                <div key={i} className="px-3.5 py-1.5 flex items-center justify-between hover:bg-white/60 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-[#78716C] text-[10px] w-6">#{rec.sequence}</span>
                    <span className="flex items-center gap-1.5 font-bold text-[#171717]">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: threadColor }} />
                      {rec.threadName}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      rec.type === 'WRITE' 
                        ? 'bg-[#10B981]/15 text-[#047857] border border-[#10B981]/30' 
                        : 'bg-[#6366F1]/15 text-[#4338CA] border border-[#6366F1]/30'
                    }`}>
                      {rec.type}
                    </span>
                    <span className="text-[#171717] font-semibold">{rec.variable}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#57534E] text-[11px]">
                    <span className="text-[#78716C]">{rec.previousValue}</span>
                    <ArrowRight className="w-3 h-3 text-[#78716C]" />
                    <span className="font-bold text-[#171717]">{rec.value}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
