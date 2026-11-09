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
      <div className="p-8 text-center text-slate-500 font-mono text-sm">
        No shared memory variables declared in this scenario.
      </div>
    );
  }

  const variables = Object.entries(snapshot.sharedVariables);
  const accessHistory: MemoryAccessRecord[] = snapshot.memoryAccessHistory || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold tracking-tight text-slate-200">Shared Memory State</h3>
          <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded bg-[#162035] border border-[#1F2E4D]">
            {variables.length} Variables
          </span>
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          State maintained by C++ SharedMemory subsystem
        </div>
      </div>

      {/* Variables Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {variables.map(([name, meta]) => {
          const delta = currentEvent?.memoryDeltas?.find(d => d.variable === name);
          const hasDelta = !!delta;
          const isRaceOnVar = currentEvent?.raceDetected && currentEvent?.raceDetails?.variable === name;

          return (
            <div
              key={name}
              className={`rounded-xl border p-5 transition-all bg-[#0E1524] ${
                isRaceOnVar
                  ? 'border-amber-500/80 shadow-lg shadow-amber-950/30'
                  : hasDelta
                  ? 'border-indigo-500/80 shadow-lg shadow-indigo-950/30'
                  : 'border-[#1F2E4D]'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#1F2E4D]">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-100 text-sm">{name}</span>
                  {hasDelta && (
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      delta.type === 'WRITE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {delta.type}
                    </span>
                  )}
                </div>
                {isRaceOnVar && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    RACE CONFLICT
                  </span>
                )}
              </div>

              {/* Big Value Display */}
              <div className="my-4 flex items-baseline justify-between">
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-500">Current Value</div>
                  <div className={`text-4xl font-mono font-bold tracking-tight transition-transform ${
                    hasDelta ? 'scale-110 text-indigo-400' : 'text-slate-100'
                  }`}>
                    {meta.value}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase font-mono text-slate-500">Previous</div>
                  <div className="text-sm font-mono text-slate-400">
                    {meta.previousValue}
                  </div>
                </div>
              </div>

              {/* Stats Footer */}
              <div className="pt-3 border-t border-[#1F2E4D]/80 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                <div>
                  <span className="text-slate-500">Writes:</span> <strong className="text-slate-200">{meta.writeCount}</strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Reads:</span> <strong className="text-slate-200">{meta.readCount}</strong>
                </div>
                <div className="col-span-2 truncate">
                  <span className="text-slate-500">Last modified by:</span>{' '}
                  <strong className="text-indigo-300">
                    {meta.lastModifiedByThreadId > 0 ? `Thread #${meta.lastModifiedByThreadId}` : 'Initial State'}
                  </strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Memory Access History Feed */}
      <div className="rounded-xl border border-[#1F2E4D] bg-[#0E1524] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1F2E4D] bg-[#111A2E] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span>Memory Access Log</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Sequence of reads and writes up to current step
          </span>
        </div>

        <div className="max-h-56 overflow-y-auto divide-y divide-[#1F2E4D]/60 text-xs font-mono">
          {accessHistory.length === 0 ? (
            <div className="p-4 text-center text-slate-500 italic">No memory accesses recorded yet.</div>
          ) : (
            accessHistory.map((rec: MemoryAccessRecord, i: number) => (
              <div key={i} className="px-4 py-2 flex items-center justify-between hover:bg-[#162035]/50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="text-slate-500 text-[10px]">#{rec.sequence}</span>
                  <span className="font-semibold text-slate-200">{rec.threadName}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    rec.type === 'WRITE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {rec.type}
                  </span>
                  <span className="text-indigo-300 font-bold">{rec.variable}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="text-slate-500">{rec.previousValue}</span>
                  <ArrowRight className="w-3 h-3 text-slate-600" />
                  <span className="font-bold text-white">{rec.value}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
