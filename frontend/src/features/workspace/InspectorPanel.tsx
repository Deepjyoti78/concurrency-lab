import React, { useState } from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import type { MemoryAccessRecord } from '../../types/simulation';
import { 
  Cpu, 
  Database, 
  BookOpen, 
  Lock, 
  CheckCircle2, 
  FileCode,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const InspectorPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'thread' | 'memory' | 'guide'>('thread');
  
  // Collapsible section states for Thread tab
  const [isOverviewOpen, setIsOverviewOpen] = useState(true);
  const [isRegistersOpen, setIsRegistersOpen] = useState(true);
  const [isDisassemblyOpen, setIsDisassemblyOpen] = useState(true);

  const { 
    getCurrentSnapshot, 
    selectedThreadId, 
    currentRun, 
    currentScenarioId, 
    scenarios,
    currentStep
  } = useSimulationStore();

  const snapshot = getCurrentSnapshot();
  const scenario = scenarios.find(s => s.id === currentScenarioId);

  const threads = snapshot?.threads ? Object.values(snapshot.threads) : [];
  const selectedThread = threads.find(t => t.id === selectedThreadId) || threads[0];
  const memoryVars = snapshot?.sharedVariables ? Object.entries(snapshot.sharedVariables) : [];
  const accessHistory: MemoryAccessRecord[] = snapshot?.memoryAccessHistory || [];

  const threadEvents = currentRun?.events?.filter(e => e.threadId === selectedThread?.id) || [];

  const getThreadColor = (threadId?: number) => {
    if (threadId === 1) return '#6366F1';
    if (threadId === 2) return '#10B981';
    if (threadId === 3) return '#8B5CF6';
    if (threadId === 4) return '#F59E0B';
    return '#171717';
  };

  return (
    <div className="w-full flex-1 bg-[#F4EFE7] lg:border-l border-[#E6E0D6] flex flex-col h-full text-xs text-[#171717] overflow-hidden select-none">
      {/* Contextual Inspector Tabs */}
      <div className="flex items-center border-b border-[#E6E0D6] bg-[#EFEAE2] p-1 gap-1 flex-shrink-0">
        <button
          onClick={() => setActiveTab('thread')}
          className={`flex-1 py-1 rounded text-center font-mono font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'thread'
              ? 'bg-[#171717] text-white font-bold'
              : 'text-[#57534E] hover:text-[#171717] hover:bg-[#E6E0D6]/70'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Thread</span>
        </button>
        <button
          onClick={() => setActiveTab('memory')}
          className={`flex-1 py-1 rounded text-center font-mono font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'memory'
              ? 'bg-[#171717] text-white font-bold'
              : 'text-[#57534E] hover:text-[#171717] hover:bg-[#E6E0D6]/70'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Memory</span>
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`flex-1 py-1 rounded text-center font-mono font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'guide'
              ? 'bg-[#171717] text-white font-bold'
              : 'text-[#57534E] hover:text-[#171717] hover:bg-[#E6E0D6]/70'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Guide</span>
        </button>
      </div>

      {/* Tab 1: Thread Inspector */}
      {activeTab === 'thread' && (
        <div className="p-3 space-y-3 overflow-y-auto flex-1 scrollbar-thin">
          {!selectedThread ? (
            <div className="text-center py-8 text-[#78716C] font-mono text-xs">
              No thread selected.
            </div>
          ) : (
            <>
              {/* Section 1: Thread Overview (Collapsible) */}
              <div className="rounded-md border border-[#E6E0D6] bg-[#FBF4EA] overflow-hidden">
                <button
                  onClick={() => setIsOverviewOpen(!isOverviewOpen)}
                  className="w-full px-2.5 py-1.5 bg-[#EFEAE2] flex items-center justify-between text-left cursor-pointer border-b border-[#E6E0D6]"
                >
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: getThreadColor(selectedThread.id) }} 
                    />
                    <span className="font-bold text-[#171717] font-mono text-xs">
                      {selectedThread.name} (TID {selectedThread.id})
                    </span>
                  </div>
                  {isOverviewOpen ? <ChevronUp className="w-3.5 h-3.5 text-[#78716C]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#78716C]" />}
                </button>

                {isOverviewOpen && (
                  <div className="p-2.5 space-y-2">
                    <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                      <div className="bg-white p-2 rounded border border-[#E6E0D6]">
                        <span className="text-[10px] text-[#78716C] uppercase font-bold block">State</span>
                        <strong className="text-[#171717]">{selectedThread.state}</strong>
                      </div>
                      <div className="bg-white p-2 rounded border border-[#E6E0D6]">
                        <span className="text-[10px] text-[#78716C] uppercase font-bold block">Program Counter</span>
                        <strong className="text-[#171717]">PC: {selectedThread.pc}</strong>
                      </div>
                    </div>

                    {selectedThread.blockedOn && (
                      <div className="p-2 rounded bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] font-mono text-[10px] font-bold">
                        Blocked on: {selectedThread.blockedOn}
                      </div>
                    )}

                    {/* Held Mutexes */}
                    <div className="pt-1">
                      <span className="text-[10px] uppercase font-mono text-[#78716C] font-bold block mb-1">
                        Held Mutexes ({selectedThread.heldMutexes?.length || 0})
                      </span>
                      {selectedThread.heldMutexes && selectedThread.heldMutexes.length > 0 ? (
                        <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                          {selectedThread.heldMutexes.map(m => (
                            <span key={m} className="px-2 py-0.5 rounded bg-[#F59E0B]/20 text-[#B45309] border border-[#F59E0B]/40 font-bold flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              {m}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[#78716C] italic text-[10px] font-mono">None</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Local CPU Registers (Collapsible) */}
              <div className="rounded-md border border-[#E6E0D6] bg-[#FBF4EA] overflow-hidden">
                <button
                  onClick={() => setIsRegistersOpen(!isRegistersOpen)}
                  className="w-full px-2.5 py-1.5 bg-[#EFEAE2] flex items-center justify-between text-left cursor-pointer border-b border-[#E6E0D6]"
                >
                  <span className="font-bold text-[#171717] font-mono text-xs uppercase tracking-wide">
                    CPU Registers
                  </span>
                  {isRegistersOpen ? <ChevronUp className="w-3.5 h-3.5 text-[#78716C]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#78716C]" />}
                </button>

                {isRegistersOpen && (
                  <div className="p-2.5">
                    {Object.keys(selectedThread.registers).length === 0 ? (
                      <div className="text-[#78716C] italic text-[11px] font-mono py-1">
                        No registers assigned
                      </div>
                    ) : (
                      <div className="bg-white rounded border border-[#E6E0D6] divide-y divide-[#E6E0D6] font-mono text-xs">
                        {Object.entries(selectedThread.registers).map(([reg, val]) => (
                          <div key={reg} className="flex items-center justify-between px-2.5 py-1">
                            <span className="text-[#171717] font-bold">{reg}</span>
                            <span className="text-[#57534E] font-semibold">{val}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Section 3: Instruction Disassembly (Collapsible) */}
              <div className="rounded-md border border-[#E6E0D6] bg-[#FBF4EA] overflow-hidden">
                <button
                  onClick={() => setIsDisassemblyOpen(!isDisassemblyOpen)}
                  className="w-full px-2.5 py-1.5 bg-[#EFEAE2] flex items-center justify-between text-left cursor-pointer border-b border-[#E6E0D6]"
                >
                  <div className="flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-[#171717]" />
                    <span className="font-bold text-[#171717] font-mono text-xs uppercase tracking-wide">
                      Disassembly ({threadEvents.length})
                    </span>
                  </div>
                  {isDisassemblyOpen ? <ChevronUp className="w-3.5 h-3.5 text-[#78716C]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#78716C]" />}
                </button>

                {isDisassemblyOpen && (
                  <div className="p-2 space-y-1 font-mono text-[11px] max-h-60 overflow-y-auto scrollbar-thin">
                    {threadEvents.length === 0 ? (
                      <div className="text-[#78716C] italic text-[10px] py-1">
                        No disassembly instructions.
                      </div>
                    ) : (
                      threadEvents.map((ev, idx) => {
                        const isActive = ev.sequence === currentStep;
                        const isExecuted = ev.sequence <= currentStep;

                        return (
                          <div
                            key={idx}
                            className={`p-1.5 rounded border flex items-center justify-between transition-colors ${
                              isActive
                                ? 'bg-[#171717] border-[#171717] text-white font-bold'
                                : isExecuted
                                ? 'bg-white border-[#E6E0D6] text-[#171717]'
                                : 'bg-[#F4EFE7] border-[#E6E0D6]/60 text-[#78716C]'
                            }`}
                          >
                            <div className="truncate">
                              <span className={`text-[9px] mr-1.5 ${isActive ? 'text-amber-300' : 'text-[#78716C]'}`}>
                                #{ev.sequence}
                              </span>
                              <span>{ev.instruction.disassembly}</span>
                            </div>
                            {isActive && (
                              <span className="text-[9px] text-amber-300 font-bold ml-1 flex-shrink-0">
                                ◀ PC
                              </span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 2: Shared Memory Inspector */}
      {activeTab === 'memory' && (
        <div className="p-3 space-y-3 overflow-y-auto flex-1 scrollbar-thin">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-mono text-[#78716C] font-bold block">
              Shared Variables ({memoryVars.length})
            </span>
            <div className="space-y-2 font-mono">
              {memoryVars.map(([name, meta]) => (
                <div key={name} className="p-2.5 rounded-md bg-white border border-[#E6E0D6] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#171717]">{name}</span>
                    <span className="text-base font-bold text-[#171717]">{meta.value}</span>
                  </div>
                  <div className="text-[10px] text-[#78716C] flex items-center justify-between border-t border-[#E6E0D6]/60 pt-1">
                    <span>Prev: {meta.previousValue}</span>
                    <span>W:{meta.writeCount} | R:{meta.readCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Access History */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] uppercase font-mono text-[#78716C] font-bold block">
              Recent Access Log
            </span>
            <div className="space-y-1 font-mono text-[10px] max-h-60 overflow-y-auto scrollbar-thin">
              {accessHistory.slice(-10).reverse().map((rec: MemoryAccessRecord, i: number) => (
                <div key={i} className="p-1.5 rounded bg-white border border-[#E6E0D6] flex items-center justify-between">
                  <div>
                    <span className={`font-bold mr-1 ${rec.type === 'WRITE' ? 'text-[#047857]' : 'text-[#171717]'}`}>
                      {rec.type}
                    </span>
                    <span className="text-[#171717] font-semibold">{rec.variable}</span>
                    <span className="text-[#78716C] text-[9px] ml-1">({rec.threadName})</span>
                  </div>
                  <span className="font-bold text-[#171717]">{rec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Concept Guide & Educational Explanations */}
      {activeTab === 'guide' && scenario && (
        <div className="p-3 space-y-3 overflow-y-auto flex-1 scrollbar-thin">
          <div className="pb-2 border-b border-[#E6E0D6]">
            <h4 className="font-bold text-[#171717] text-xs font-mono">{scenario.title}</h4>
            <div className="flex items-center gap-1.5 pt-1 font-mono text-[10px]">
              <span className="px-1.5 py-0.2 rounded bg-[#EFEAE2] text-[#171717] border border-[#DDD6CB] font-semibold">
                {scenario.moduleTitle}
              </span>
              <span className="text-[#78716C]">{scenario.difficulty}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono text-[#78716C] font-bold flex items-center gap-1">
              <Info className="w-3 h-3 text-[#171717]" />
              Objective
            </span>
            <p className="text-[#57534E] text-[11px] leading-relaxed bg-white p-2 rounded border border-[#E6E0D6]">
              {scenario.objective}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono text-[#78716C] font-bold block">
              Expected Outcome
            </span>
            <div className="p-2 rounded bg-white border border-[#DDD6CB] font-mono text-[10px] text-[#171717]">
              {scenario.expectedOutcome}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono text-[#047857] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
              Key Takeaway
            </span>
            <p className="text-[#047857] text-[11px] leading-relaxed bg-[#10B981]/10 p-2 rounded border border-[#10B981]/25">
              {scenario.keyTakeaway}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
