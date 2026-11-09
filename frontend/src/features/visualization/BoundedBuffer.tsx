import React from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { RefreshCw, Lock, ShieldCheck, Box } from 'lucide-react';

export const BoundedBuffer: React.FC = () => {
  const { getCurrentSnapshot } = useSimulationStore();
  const snapshot = getCurrentSnapshot();

  if (!snapshot) return null;

  const bufferCount = snapshot.sharedVariables?.buffer_count?.value ?? 0;
  const capacity = snapshot.sharedVariables?.capacity?.value ?? 3;
  const emptySem = snapshot.semaphores?.empty_slots;
  const fullSem = snapshot.semaphores?.full_slots;
  const bufferMutex = snapshot.mutexes?.buffer_mutex;

  const producerThread = Object.values(snapshot.threads).find(t => t.name === 'Producer');
  const consumerThread = Object.values(snapshot.threads).find(t => t.name === 'Consumer');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold tracking-tight text-slate-200">Producer-Consumer Bounded Buffer</h3>
          <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded bg-[#162035] border border-[#1F2E4D]">
            Capacity: {capacity} Slots
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Invariant: 0 ≤ buffer_count ≤ {capacity} (Maintained)</span>
        </div>
      </div>

      {/* Main Visual Arena */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-6 rounded-xl border border-[#1F2E4D] bg-[#0A0F1D] shadow-inner">
        {/* Producer Column */}
        <div className="rounded-xl border border-[#1F2E4D] bg-[#0E1524] p-4 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center font-bold">
            P
          </div>
          <div>
            <div className="font-semibold text-slate-100 text-sm">Producer Thread</div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
              State: <strong className="text-emerald-400">{producerThread?.state || 'READY'}</strong>
            </div>
            {producerThread?.blockedOn && (
              <div className="text-[10px] font-mono text-rose-400 mt-1">
                Blocked on: {producerThread.blockedOn}
              </div>
            )}
          </div>
          <div className="text-[11px] font-mono text-slate-500 bg-[#162035] p-2 rounded border border-[#1F2E4D]">
            Produces items when empty_slots &gt; 0
          </div>
        </div>

        {/* Center: Bounded Buffer Slots */}
        <div className="space-y-4 text-center">
          <div className="text-xs font-mono text-slate-400 uppercase font-semibold">
            Bounded Buffer Queue ({bufferCount} / {capacity})
          </div>

          <div className="flex items-center justify-center gap-3">
            {Array.from({ length: capacity }).map((_, i) => {
              const isOccupied = i < bufferCount;
              return (
                <div
                  key={i}
                  className={`w-20 h-24 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                    isOccupied
                      ? 'border-emerald-500 bg-emerald-950/40 shadow-lg shadow-emerald-950/50 scale-105'
                      : 'border-dashed border-slate-700 bg-[#0E1524]'
                  }`}
                >
                  <span className="text-[9px] font-mono text-slate-500 mb-1">Slot #{i}</span>
                  {isOccupied ? (
                    <div className="flex flex-col items-center">
                      <Box className="w-6 h-6 text-emerald-400" />
                      <span className="text-[10px] font-mono text-emerald-300 font-bold mt-1">Item {i + 1}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-600">EMPTY</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Buffer Mutex Indicator */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#162035] border border-[#1F2E4D] text-xs font-mono">
            <Lock className={`w-3.5 h-3.5 ${bufferMutex?.locked ? 'text-amber-400' : 'text-slate-500'}`} />
            <span className="text-slate-400">buffer_mutex:</span>
            <span className={bufferMutex?.locked ? 'text-amber-300 font-bold' : 'text-emerald-400 font-bold'}>
              {bufferMutex?.locked ? `LOCKED (${bufferMutex.ownerThreadName})` : 'UNLOCKED'}
            </span>
          </div>
        </div>

        {/* Consumer Column */}
        <div className="rounded-xl border border-[#1F2E4D] bg-[#0E1524] p-4 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 mx-auto flex items-center justify-center font-bold">
            C
          </div>
          <div>
            <div className="font-semibold text-slate-100 text-sm">Consumer Thread</div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
              State: <strong className="text-indigo-400">{consumerThread?.state || 'READY'}</strong>
            </div>
            {consumerThread?.blockedOn && (
              <div className="text-[10px] font-mono text-rose-400 mt-1">
                Blocked on: {consumerThread.blockedOn}
              </div>
            )}
          </div>
          <div className="text-[11px] font-mono text-slate-500 bg-[#162035] p-2 rounded border border-[#1F2E4D]">
            Consumes items when full_slots &gt; 0
          </div>
        </div>
      </div>

      {/* Synchronization Primitives Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Empty Slots Semaphore */}
        <div className="rounded-xl border border-[#1F2E4D] bg-[#0E1524] p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-mono text-slate-500 font-semibold">Counting Semaphore</div>
            <div className="text-sm font-bold text-slate-200 font-mono">empty_slots</div>
            <div className="text-[11px] text-slate-400 mt-1">Tracks available slots for producer</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono font-bold text-emerald-400">
              {emptySem?.currentCount ?? 3}
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              Wait queue: {emptySem?.waitingQueue?.length ?? 0}
            </span>
          </div>
        </div>

        {/* Full Slots Semaphore */}
        <div className="rounded-xl border border-[#1F2E4D] bg-[#0E1524] p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-mono text-slate-500 font-semibold">Counting Semaphore</div>
            <div className="text-sm font-bold text-slate-200 font-mono">full_slots</div>
            <div className="text-[11px] text-slate-400 mt-1">Tracks ready items for consumer</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono font-bold text-indigo-400">
              {fullSem?.currentCount ?? 0}
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              Wait queue: {fullSem?.waitingQueue?.length ?? 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
