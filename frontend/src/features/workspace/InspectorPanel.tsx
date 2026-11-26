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
  ChevronUp,
  Pin,
  Check
} from 'lucide-react';

export const InspectorPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'thread' | 'memory' | 'guide'>('thread');
  
  // Collapsible section states for Thread tab
  const [isOverviewOpen, setIsOverviewOpen] = useState(true);
  const [isRegistersOpen, setIsRegistersOpen] = useState(true);
  const [isDisassemblyOpen, setIsDisassemblyOpen] = useState(true);

  const { 
    getCurrentSnapshot, 
    getCurrentEvent,
    selectedThreadId, 
    selectThread,
    isThreadPinned,
    togglePinThread,
    currentRun, 
    currentScenarioId, 
    scenarios,
    currentStep
  } = useSimulationStore();

  const snapshot = getCurrentSnapshot();
  const currentEvent = getCurrentEvent();
  const scenario = scenarios.find(s => s.id === currentScenarioId);

  const threads = snapshot?.threads ? Object.values(snapshot.threads) : [];
  const selectedThread = threads.find(t => t.id === selectedThreadId) || threads[0];
  const memoryVars = snapshot?.sharedVariables ? Object.entries(snapshot.sharedVariables) : [];
  const accessHistory: MemoryAccessRecord[] = snapshot?.memoryAccessHistory || [];

  const threadEvents = currentRun?.events?.filter(e => e.threadId === selectedThread?.id) || [];
  const isExecutingCurrentStep = currentEvent?.threadId === selectedThread?.id;

  const getThreadColor = (threadId?: number) => {
    if (threadId === 1) return '#6366F1';
    if (threadId === 2) return '#10B981';
    if (threadId === 3) return '#8B5CF6';
    if (threadId === 4) return '#F59E0B';
    return '#141413';
  };

  return (
    <div className="w-full flex-1 bg-[#ECEAE3] lg:border-l border-[#141413]/20 flex flex-col h-full text-xs text-[#141413] overflow-hidden select-none">
      {/* Contextual Inspector Tabs */}
      <div className="flex items-center border-b border-[#141413]/20 bg-[#E4E1D9] p-1 gap-1 flex-shrink-0">
        <button
          onClick={() => setActiveTab('thread')}
          className={`flex-1 py-1 rounded-none text-center font-mono font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'thread'
              ? 'bg-[#141413] text-[#F6F4EF] font-bold'
              : 'text-[#595751] hover:text-[#141413] hover:bg-[#D5D1C7]/70'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Thread</span>
        </button>
        <button
          onClick={() => setActiveTab('memory')}
          className={`flex-1 py-1 rounded-none text-center font-mono font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'memory'
              ? 'bg-[#141413] text-[#F6F4EF] font-bold'
              : 'text-[#595751] hover:text-[#141413] hover:bg-[#D5D1C7]/70'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Memory</span>
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`flex-1 py-1 rounded-none text-center font-mono font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'guide'
              ? 'bg-[#141413] text-[#F6F4EF] font-bold'
              : 'text-[#595751] hover:text-[#141413] hover:bg-[#D5D1C7]/70'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Guide</span>
        </button>
      </div>

      {/* Tab 1: Thread Inspector */}
      {activeTab === 'thread' && (
        <div className="p-3 space-y-2.5 overflow-y-auto flex-1 scrollbar-thin">
          {/* Thread Selector & Following/Pinned Mode Controller */}
          <div className="bg-[#E4E1D9] border border-[#D5D1C7] p-2 flex items-center justify-between gap-2 font-mono text-[11px] rounded-none">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[#78716C] font-semibold text-[10px]">INSPECT:</span>
              <select
                value={selectedThread?.id || 1}
                onChange={(e) => selectThread(Number(e.target.value))}
                className="bg-white border border-[#D5D1C7] text-[#141413] font-bold px-1.5 py-0.5 text-[11px] cursor-pointer focus:outline-none"
              >
                {threads.map(t => (
                  <option key={t.id} value={t.id}>{t.name} (TID #{t.id})</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={togglePinThread}
              title={isThreadPinned ? "Pinned: Inspector stays on this thread" : "Following: Inspector automatically tracks currently executing thread"}
              className={`px-2 py-0.5 rounded-none font-bold text-[10px] cursor-pointer flex items-center gap-1 border transition-colors flex-shrink-0 ${
                isThreadPinned 
                  ? 'bg-[#141413] text-amber-300 border-[#141413]' 
                  : 'bg-[#F6F4EF] text-[#57534E] border-[#D5D1C7] hover:bg-[#EAE4D9]'
              }`}
            >
              <Pin className={`w-2.5 h-2.5 ${isThreadPinned ? 'fill-amber-300 text-amber-300' : ''}`} />
              <span>{isThreadPinned ? 'Pinned' : 'Follow Event'}</span>
            </button>
          </div>

          {!selectedThread ? (
            <div className="text-center py-8 text-[#78716C] font-mono text-xs">
              No thread selected.
            </div>
          ) : (
            <>
              {/* Section 1: Thread Overview (Collapsible) */}
              <div className="rounded-none border border-[#D5D1C7] bg-[#F6F4EF] overflow-hidden">
                <button
                  onClick={() => setIsOverviewOpen(!isOverviewOpen)}
                  className="w-full px-2.5 py-1.5 bg-[#E4E1D9] flex items-center justify-between text-left cursor-pointer border-b border-[#D5D1C7]"
                >
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: getThreadColor(selectedThread.id) }} 
                    />
                    <span className="font-bold text-[#141413] font-mono text-xs">
                      {selectedThread.name} (TID #{selectedThread.id})
                    </span>
                  </div>
                  {isOverviewOpen ? <ChevronUp className="w-3.5 h-3.5 text-[#78716C]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#78716C]" />}
                </button>

                {isOverviewOpen && (
                  <div className="p-2.5 space-y-2">
                    <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                      <div className="bg-white p-2 rounded-none border border-[#D5D1C7]">
                        <span className="text-[9px] text-[#78716C] uppercase font-bold block">State</span>
                        <strong className="text-[#141413]">{selectedThread.state}</strong>
                      </div>
                      <div className="bg-white p-2 rounded-none border border-[#D5D1C7]">
                        <span className="text-[9px] text-[#78716C] uppercase font-bold block">Current PC</span>
                        <strong className="text-[#141413]">{selectedThread.pc}</strong>
                      </div>
                    </div>

                    {isExecutingCurrentStep && currentEvent && (
                      <div className="bg-amber-500/10 p-2 rounded-none border border-amber-500/30 font-mono text-[10px] text-amber-900 flex items-center justify-between">
                        <span>PC @ STEP #{currentEvent.sequence}:</span>
                        <strong className="text-[#141413] font-bold">{currentEvent.previousPc}</strong>
                      </div>
                    )}

                    {selectedThread.blockedOn && (
                      <div className="p-2 rounded-none bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] font-mono text-[10px] font-bold">
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
                            <span key={m} className="px-2 py-0.5 rounded-none bg-[#F59E0B]/20 text-[#B45309] border border-[#F59E0B]/40 font-bold flex items-center gap-1">
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
              <div className="rounded-none border border-[#D5D1C7] bg-[#F6F4EF] overflow-hidden">
                <button
                  onClick={() => setIsRegistersOpen(!isRegistersOpen)}
                  className="w-full px-2.5 py-1.5 bg-[#E4E1D9] flex items-center justify-between text-left cursor-pointer border-b border-[#D5D1C7]"
                >
                  <span className="font-bold text-[#141413] font-mono text-xs uppercase tracking-wide">
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
                      <div className="bg-white rounded-none border border-[#D5D1C7] divide-y divide-[#D5D1C7] font-mono text-xs">
                        {Object.entries(selectedThread.registers).map(([reg, val]) => (
                          <div key={reg} className="flex items-center justify-between px-2.5 py-1">
                            <span className="text-[#141413] font-bold">{reg}</span>
                            <span className="text-[#57534E] font-semibold">{val}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Section 3: Instruction Disassembly (Collapsible) */}
              <div className="rounded-none border border-[#D5D1C7] bg-[#F6F4EF] overflow-hidden">
                <button
                  onClick={() => setIsDisassemblyOpen(!isDisassemblyOpen)}
                  className="w-full px-2.5 py-1.5 bg-[#E4E1D9] flex items-center justify-between text-left cursor-pointer border-b border-[#D5D1C7]"
                >
                  <div className="flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-[#141413]" />
                    <span className="font-bold text-[#141413] font-mono text-xs uppercase tracking-wide">
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
                        const isSelected = ev.sequence === currentStep;
                        const isExecuted = ev.sequence <= currentStep;

                        return (
                          <div
                            key={idx}
                            className={`p-1.5 rounded-none border flex items-center justify-between transition-colors ${
                              isSelected
                                ? 'bg-[#141413] border-[#141413] text-white font-bold'
                                : isExecuted
                                ? 'bg-white border-[#D5D1C7] text-[#141413]'
                                : 'bg-[#ECEAE3] border-[#D5D1C7]/60 text-[#78716C]'
                            }`}
                          >
                            <div className="truncate">
                              <span className={`text-[9px] mr-1.5 ${isSelected ? 'text-amber-300' : 'text-[#78716C]'}`}>
                                #{ev.sequence}
                              </span>
                              <span>{ev.instruction.disassembly}</span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                              {isSelected ? (
                                <span className="text-[8px] bg-amber-400 text-[#141413] px-1 py-0.2 font-bold uppercase">
                                  SELECTED
                                </span>
                              ) : isExecuted ? (
                                <span className="text-[8px] text-[#047857] flex items-center gap-0.5 font-semibold">
                                  <Check className="w-2.5 h-2.5" /> DONE
                                </span>
                              ) : (
                                <span className="text-[8px] text-[#A8A29E]">
                                  UPCOMING
                                </span>
                              )}
                            </div>
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
                <div key={name} className="p-2.5 rounded-none bg-white border border-[#D5D1C7] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#141413]">{name}</span>
                    <span className="text-base font-bold text-[#141413]">{meta.value}</span>
                  </div>
                  <div className="text-[10px] text-[#78716C] flex items-center justify-between border-t border-[#D5D1C7]/60 pt-1">
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
                <div key={i} className="p-1.5 rounded-none bg-white border border-[#D5D1C7] flex items-center justify-between">
                  <div>
                    <span className={`font-bold mr-1 ${rec.type === 'WRITE' ? 'text-[#047857]' : 'text-[#141413]'}`}>
                      {rec.type}
                    </span>
                    <span className="text-[#141413] font-semibold">{rec.variable}</span>
                    <span className="text-[#78716C] text-[9px] ml-1">({rec.threadName})</span>
                  </div>
                  <span className="font-bold text-[#141413]">{rec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Concept Guide & Educational Explanations */}
      {activeTab === 'guide' && scenario && (
        <div className="p-3 space-y-3 overflow-y-auto flex-1 scrollbar-thin">
          <div className="pb-2 border-b border-[#D5D1C7]">
            <h4 className="font-bold text-[#141413] text-xs font-mono">{scenario.title}</h4>
            <div className="flex items-center gap-1.5 pt-1 font-mono text-[10px]">
              <span className="px-1.5 py-0.2 rounded-none bg-[#E4E1D9] text-[#141413] border border-[#D5D1C7] font-semibold">
                {scenario.moduleTitle}
              </span>
              <span className="text-[#78716C]">{scenario.difficulty}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono text-[#78716C] font-bold flex items-center gap-1">
              <Info className="w-3 h-3 text-[#141413]" />
              Objective
            </span>
            <p className="text-[#57534E] text-[11px] leading-relaxed bg-white p-2 rounded-none border border-[#D5D1C7]">
              {scenario.objective}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono text-[#78716C] font-bold block">
              Expected Outcome
            </span>
            <div className="p-2 rounded-none bg-white border border-[#D5D1C7] font-mono text-[10px] text-[#141413]">
              {scenario.expectedOutcome}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono text-[#047857] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
              Key Takeaway
            </span>
            <p className="text-[#047857] text-[11px] leading-relaxed bg-[#10B981]/10 p-2 rounded-none border border-[#10B981]/25">
              {scenario.keyTakeaway}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
