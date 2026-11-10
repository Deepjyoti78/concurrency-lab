import React from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { RefreshCw, Lock, ShieldCheck, Box, UserCheck } from 'lucide-react';

export const BoundedBuffer: React.FC = () => {
  const { getCurrentSnapshot } = useSimulationStore();
  const snapshot = getCurrentSnapshot();

  if (!snapshot) return null;

  const bufferCount = snapshot.sharedVariables?.buffer_count?.value ?? 0;
  const capacity = snapshot.sharedVariables?.capacity?.value ?? 3;
  const emptySem = snapshot.semaphores?.empty_slots;
  const fullSem = snapshot.semaphores?.full_slots;
  const bufferMutex = snapshot.mutexes?.buffer_mutex;

  const producerThread = Object.values(snapshot.threads).find(t => t.name.toLowerCase().includes('producer'));
  const consumerThread = Object.values(snapshot.threads).find(t => t.name.toLowerCase().includes('consumer'));

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1 border-b border-[#E6E0D6]">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-[#171717]" />
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#171717]">
            Producer-Consumer Bounded Buffer Subsystem
          </h3>
          <span className="text-[10px] font-mono text-[#57534E] px-2 py-0.5 rounded bg-[#EFEAE2] border border-[#DDD6CB]">
            Capacity: {capacity} Slots
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#047857] bg-[#10B981]/10 px-2.5 py-0.5 rounded border border-[#10B981]/30">
          <ShieldCheck className="w-3 h-3 text-[#10B981]" />
          <span>Safety Invariant: 0 ≤ buffer_count ≤ {capacity} (Maintained)</span>
        </div>
      </div>

      {/* Main Visual Arena: Producer | Buffer Slots | Consumer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch p-3.5 rounded-lg border border-[#E6E0D6] bg-[#F4EFE7]">
        {/* Producer Column */}
        <div className="rounded-md border border-[#E6E0D6] bg-[#FBF4EA] p-3 text-center flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-full bg-[#10B981] text-white mx-auto flex items-center justify-center font-bold text-xs shadow-xs mb-2">
              P
            </div>
            <div className="font-bold text-[#171717] text-xs font-mono">
              {producerThread?.name || 'Producer'} (TID {producerThread?.id ?? 1})
            </div>
            <div className="text-[10px] font-mono text-[#57534E] mt-1">
              State:{' '}
              <span className={`font-bold px-1.5 py-0.2 rounded ${
                producerThread?.state === 'BLOCKED' 
                  ? 'bg-[#EF4444]/15 text-[#EF4444]' 
                  : 'bg-[#10B981]/15 text-[#047857]'
              }`}>
                {producerThread?.state || 'READY'}
              </span>
            </div>
            {producerThread?.blockedOn && (
              <div className="text-[10px] font-mono text-[#EF4444] mt-1 font-semibold">
                Blocked on: {producerThread.blockedOn}
              </div>
            )}
            <div className="mt-2 text-[10px] font-mono text-[#78716C] bg-[#EFEAE2] p-1.5 rounded border border-[#DDD6CB]">
              PC: {producerThread?.pc ?? 0}
            </div>
          </div>
          <div className="text-[10px] font-mono text-[#57534E] bg-white p-2 rounded border border-[#E6E0D6] mt-3">
            Acquires <code className="font-bold text-[#171717]">empty_slots</code> then locks buffer
          </div>
        </div>

        {/* Center: Bounded Buffer Slots Array */}
        <div className="flex flex-col justify-between items-center text-center space-y-3 p-2 bg-[#F8F5EE] rounded-md border border-[#E6E0D6]">
          <div>
            <div className="text-[10px] font-mono text-[#78716C] uppercase font-bold tracking-wider">
              Buffer Array Occupancy ({bufferCount} / {capacity})
            </div>
            <span className="text-[9px] font-mono text-[#78716C]">
              Physical memory queue in shared heap
            </span>
          </div>

          {/* Slots Array visualization */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {Array.from({ length: capacity }).map((_, i) => {
              const isOccupied = i < bufferCount;
              return (
                <div
                  key={i}
                  className={`w-18 h-22 rounded border flex flex-col items-center justify-center transition-all ${
                    isOccupied
                      ? 'border-[#10B981] bg-[#10B981]/10 shadow-xs'
                      : 'border-dashed border-[#DDD6CB] bg-[#FBF4EA]'
                  }`}
                >
                  <span className="text-[9px] font-mono text-[#78716C] mb-1">Slot [{i}]</span>
                  {isOccupied ? (
                    <div className="flex flex-col items-center">
                      <Box className="w-5 h-5 text-[#047857]" />
                      <span className="text-[9px] font-mono text-[#047857] font-bold mt-1">Item #{i + 1}</span>
                    </div>
                  ) : (
                    <span className="text-[9px] font-mono text-[#A8A29E] font-medium">EMPTY</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Buffer Mutex Indicator */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-[#DDD6CB] text-[11px] font-mono">
            <Lock className={`w-3 h-3 ${bufferMutex?.locked ? 'text-[#F59E0B]' : 'text-[#78716C]'}`} />
            <span className="text-[#57534E]">buffer_mutex:</span>
            <span className={bufferMutex?.locked ? 'text-[#B45309] font-bold' : 'text-[#047857] font-bold'}>
              {bufferMutex?.locked ? `LOCKED (${bufferMutex.ownerThreadName})` : 'UNLOCKED'}
            </span>
          </div>
        </div>

        {/* Consumer Column */}
        <div className="rounded-md border border-[#E6E0D6] bg-[#FBF4EA] p-3 text-center flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-full bg-[#6366F1] text-white mx-auto flex items-center justify-center font-bold text-xs shadow-xs mb-2">
              C
            </div>
            <div className="font-bold text-[#171717] text-xs font-mono">
              {consumerThread?.name || 'Consumer'} (TID {consumerThread?.id ?? 2})
            </div>
            <div className="text-[10px] font-mono text-[#57534E] mt-1">
              State:{' '}
              <span className={`font-bold px-1.5 py-0.2 rounded ${
                consumerThread?.state === 'BLOCKED' 
                  ? 'bg-[#EF4444]/15 text-[#EF4444]' 
                  : 'bg-[#6366F1]/15 text-[#4338CA]'
              }`}>
                {consumerThread?.state || 'READY'}
              </span>
            </div>
            {consumerThread?.blockedOn && (
              <div className="text-[10px] font-mono text-[#EF4444] mt-1 font-semibold">
                Blocked on: {consumerThread.blockedOn}
              </div>
            )}
            <div className="mt-2 text-[10px] font-mono text-[#78716C] bg-[#EFEAE2] p-1.5 rounded border border-[#DDD6CB]">
              PC: {consumerThread?.pc ?? 0}
            </div>
          </div>
          <div className="text-[10px] font-mono text-[#57534E] bg-white p-2 rounded border border-[#E6E0D6] mt-3">
            Acquires <code className="font-bold text-[#171717]">full_slots</code> then locks buffer
          </div>
        </div>
      </div>

      {/* Synchronization Primitives Dashboard: Independent Semaphores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Empty Slots Semaphore */}
        <div className="rounded-md border border-[#E6E0D6] bg-white p-3 flex items-center justify-between">
          <div>
            <div className="text-[9px] uppercase font-mono text-[#78716C] font-bold">Counting Semaphore</div>
            <div className="text-xs font-bold text-[#171717] font-mono">empty_slots</div>
            <div className="text-[10px] text-[#57534E] mt-0.5">
              Available empty slots for Producer (<code className="text-[#171717]">sem_wait</code> blocks if 0)
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono font-bold text-[#171717]">
              {emptySem?.currentCount ?? 3}
            </div>
            <span className="text-[9px] font-mono text-[#78716C] flex items-center gap-1 justify-end">
              <UserCheck className="w-2.5 h-2.5" />
              Waiting: {emptySem?.waitingQueue?.length ?? 0}
            </span>
          </div>
        </div>

        {/* Full Slots Semaphore */}
        <div className="rounded-md border border-[#E6E0D6] bg-white p-3 flex items-center justify-between">
          <div>
            <div className="text-[9px] uppercase font-mono text-[#78716C] font-bold">Counting Semaphore</div>
            <div className="text-xs font-bold text-[#171717] font-mono">full_slots</div>
            <div className="text-[10px] text-[#57534E] mt-0.5">
              Ready filled items for Consumer (<code className="text-[#171717]">sem_wait</code> blocks if 0)
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono font-bold text-[#171717]">
              {fullSem?.currentCount ?? 0}
            </div>
            <span className="text-[9px] font-mono text-[#78716C] flex items-center gap-1 justify-end">
              <UserCheck className="w-2.5 h-2.5" />
              Waiting: {fullSem?.waitingQueue?.length ?? 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
