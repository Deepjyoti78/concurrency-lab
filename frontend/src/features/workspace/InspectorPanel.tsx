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
  Info
} from 'lucide-react';

export const InspectorPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'thread' | 'memory' | 'guide'>('thread');
  const { 
    getCurrentSnapshot, 
    getCurrentEvent, 
    selectedThreadId, 
    currentRun, 
    currentScenarioId, 
    scenarios 
  } = useSimulationStore();

  const snapshot = getCurrentSnapshot();
  const currentEvent = getCurrentEvent();
  const scenario = scenarios.find(s => s.id === currentScenarioId);

  const threads = snapshot?.threads ? Object.values(snapshot.threads) : [];
  const selectedThread = threads.find(t => t.id === selectedThreadId) || threads[0];
  const memoryVars = snapshot?.sharedVariables ? Object.entries(snapshot.sharedVariables) : [];
  const accessHistory: MemoryAccessRecord[] = snapshot?.memoryAccessHistory || [];

  const threadEvents = currentRun?.events?.filter(e => e.threadId === selectedThread?.id) || [];

  return (
    <div className="w-full lg:w-96 flex-shrink-0 bg-[#0E1524] border-l border-[#1F2E4D] flex flex-col h-full text-xs">
      {/* Inspector Tabs */}
      <div className="flex items-center border-b border-[#1F2E4D] bg-[#0A0F1D] p-1 gap-1">
        <button
          onClick={() => setActiveTab('thread')}
          className={`flex-1 py-1.5 rounded text-center font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'thread'
              ? 'bg-[#162035] text-white shadow-sm font-bold border border-[#1F2E4D]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          Thread
        </button>
        <button
          onClick={() => setActiveTab('memory')}
          className={`flex-1 py-1.5 rounded text-center font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'memory'
              ? 'bg-[#162035] text-white shadow-sm font-bold border border-[#1F2E4D]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          Memory
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`flex-1 py-1.5 rounded text-center font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'guide'
              ? 'bg-[#162035] text-white shadow-sm font-bold border border-[#1F2E4D]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Guide
        </button>
      </div>

      {/* Tab 1: Thread Inspector */}
      {activeTab === 'thread' && selectedThread && (
        <div className="p-4 space-y-5 overflow-y-auto flex-1">
          {/* Thread Header Info */}
          <div className="space-y-3 pb-3 border-b border-[#1F2E4D]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3.5 h-3.5 rounded-full" 
                  style={{ backgroundColor: selectedThread.color }} 
                />
                <h4 className="font-bold text-slate-100 text-sm">{selectedThread.name}</h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#162035] text-slate-400 border border-[#1F2E4D]">
                TID #{selectedThread.id}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-[#111A2E] p-2 rounded border border-[#1F2E4D]">
                <div className="text-[10px] text-slate-500 uppercase">State</div>
                <div className="font-bold text-slate-200">{selectedThread.state}</div>
              </div>
              <div className="bg-[#111A2E] p-2 rounded border border-[#1F2E4D]">
                <div className="text-[10px] text-slate-500 uppercase">Program Counter</div>
                <div className="font-bold text-slate-200">{selectedThread.pc}</div>
              </div>
            </div>

            {selectedThread.blockedOn && (
              <div className="p-2 rounded bg-rose-950/40 border border-rose-700/50 text-rose-300 font-mono text-[11px]">
                <strong>Blocked On:</strong> {selectedThread.blockedOn}
              </div>
            )}
          </div>

          {/* Held Mutexes */}
          <div className="space-y-2">
            <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Held Mutexes ({selectedThread.heldMutexes?.length || 0})</span>
            </div>
            {selectedThread.heldMutexes && selectedThread.heldMutexes.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 font-mono">
                {selectedThread.heldMutexes.map(m => (
                  <span key={m} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs">
                    {m}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-slate-500 italic text-[11px]">None currently held</div>
            )}
          </div>

          {/* Local Registers */}
          <div className="space-y-2">
            <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold">
              Local CPU Registers
            </div>
            <div className="bg-[#0A0F1D] rounded-lg border border-[#1F2E4D] p-2.5 font-mono text-xs divide-y divide-[#1F2E4D]/60">
              {Object.keys(selectedThread.registers).length === 0 ? (
                <div className="text-slate-500 italic py-1">No registers assigned</div>
              ) : (
                Object.entries(selectedThread.registers).map(([reg, val]) => (
                  <div key={reg} className="flex items-center justify-between py-1">
                    <span className="text-indigo-400 font-bold">{reg}</span>
                    <span className="text-slate-200">{val}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Program Instructions Disassembly */}
          <div className="space-y-2">
            <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold flex items-center gap-1.5">
              <FileCode className="w-3 h-3 text-indigo-400" />
              <span>Program Disassembly</span>
            </div>
            <div className="space-y-1 font-mono text-[11px]">
              {threadEvents.map((ev, idx) => {
                const isCurrent = ev.sequence === currentEvent?.sequence;
                const isPast = ev.sequence <= (currentEvent?.sequence || 0);

                return (
                  <div
                    key={idx}
                    className={`p-2 rounded border flex items-center justify-between transition-colors ${
                      isCurrent
                        ? 'bg-indigo-950/80 border-indigo-500/80 text-white font-bold'
                        : isPast
                        ? 'bg-[#111A2E] border-[#1F2E4D] text-slate-300'
                        : 'bg-[#0A0F1D] border-[#1F2E4D]/40 text-slate-600'
                    }`}
                  >
                    <div>
                      <span className="text-[9px] text-slate-500 mr-2">[{idx}]</span>
                      <span>{ev.instruction.disassembly}</span>
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] text-indigo-400 font-bold">◄ PC</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Shared Memory Inspector */}
      {activeTab === 'memory' && (
        <div className="p-4 space-y-5 overflow-y-auto flex-1">
          <div className="space-y-2">
            <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold">
              Shared Variables
            </div>
            <div className="space-y-2 font-mono">
              {memoryVars.map(([name, meta]) => (
                <div key={name} className="p-3 rounded-lg bg-[#111A2E] border border-[#1F2E4D] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-300">{name}</span>
                    <span className="text-base font-bold text-white">{meta.value}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Prev: {meta.previousValue}</span>
                    <span>Writes: {meta.writeCount} | Reads: {meta.readCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Access History */}
          <div className="space-y-2">
            <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold">
              Recent Access Records
            </div>
            <div className="space-y-1 font-mono text-[11px] max-h-72 overflow-y-auto">
              {accessHistory.slice(-10).reverse().map((rec: MemoryAccessRecord, i: number) => (
                <div key={i} className="p-2 rounded bg-[#0A0F1D] border border-[#1F2E4D]/60 flex items-center justify-between">
                  <div>
                    <span className={`font-bold mr-1.5 ${rec.type === 'WRITE' ? 'text-emerald-400' : 'text-blue-400'}`}>
                      {rec.type}
                    </span>
                    <span className="text-slate-300">{rec.variable}</span>
                    <span className="text-slate-500 text-[10px] ml-1">({rec.threadName})</span>
                  </div>
                  <span className="font-bold text-slate-100">{rec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Concept Guide & Educational Explanations */}
      {activeTab === 'guide' && scenario && (
        <div className="p-4 space-y-5 overflow-y-auto flex-1">
          <div className="space-y-1 pb-3 border-b border-[#1F2E4D]">
            <h4 className="font-bold text-white text-sm">{scenario.title}</h4>
            <div className="flex items-center gap-2 pt-1 font-mono text-[10px]">
              <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                {scenario.moduleTitle}
              </span>
              <span className="text-slate-400">{scenario.difficulty}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold flex items-center gap-1">
              <Info className="w-3 h-3 text-indigo-400" />
              <span>Objective</span>
            </div>
            <p className="text-slate-300 leading-relaxed bg-[#111A2E] p-3 rounded-lg border border-[#1F2E4D]">
              {scenario.objective}
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold">
              Description
            </div>
            <p className="text-slate-300 leading-relaxed bg-[#111A2E] p-3 rounded-lg border border-[#1F2E4D]">
              {scenario.description}
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold">
              Expected vs Actual Outcome
            </div>
            <div className="p-3 rounded-lg bg-[#0A0F1D] border border-[#1F2E4D] font-mono text-[11px] text-amber-300">
              {scenario.expectedOutcome}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] uppercase font-mono text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Key Takeaway</span>
            </div>
            <p className="text-slate-200 leading-relaxed bg-emerald-950/20 p-3 rounded-lg border border-emerald-500/30">
              {scenario.keyTakeaway}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
