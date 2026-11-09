import React from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { AlertTriangle, ShieldCheck, X, Zap, ArrowRight } from 'lucide-react';

interface RaceAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RaceAnalysisModal: React.FC<RaceAnalysisModalProps> = ({ isOpen, onClose }) => {
  const { getCurrentEvent, loadScenario } = useSimulationStore();
  const currentEvent = getCurrentEvent();

  if (!isOpen || !currentEvent || !currentEvent.raceDetected || !currentEvent.raceDetails) {
    return null;
  }

  const race = currentEvent.raceDetails;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="max-w-2xl w-full rounded-2xl bg-[#0E1524] border border-[#1F2E4D] shadow-2xl overflow-hidden text-xs">
        {/* Header */}
        <div className="px-6 py-4 bg-[#111A2E] border-b border-[#1F2E4D] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Race Condition Diagnostic</h3>
              <p className="text-[11px] font-mono text-amber-400">
                {race.conflictType}: Conflicting concurrent access on '{race.variable}'
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#162035] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Explanation Banner */}
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-600/40 text-amber-200 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-amber-300">
              <AlertTriangle className="w-4 h-4" />
              <span>What Happened Internally?</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-300">
              {race.explanation}
            </p>
          </div>

          {/* Decomposed Interleaving Diagram */}
          <div className="rounded-xl border border-[#1F2E4D] bg-[#0A0F1D] p-4 space-y-3">
            <div className="text-[11px] uppercase font-mono text-slate-400 font-semibold">
              Instruction Interleaving Timeline
            </div>

            <div className="space-y-2 font-mono">
              <div className="flex items-center justify-between p-2 rounded bg-[#111A2E] border border-blue-500/30 text-blue-300">
                <span>1. {race.firstThreadName} reads '{race.variable}'</span>
                <span className="font-bold">value = {race.firstValue}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#111A2E] border border-purple-500/30 text-purple-300">
                <span>2. {race.secondThreadName} reads '{race.variable}'</span>
                <span className="font-bold">value = {race.firstValue} (Stale Read!)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#111A2E] border border-blue-500/30 text-blue-300">
                <span>3. {race.firstThreadName} writes {race.firstValue + 1} to '{race.variable}'</span>
                <span className="font-bold">{race.variable} = {race.firstValue + 1}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#111A2E] border border-amber-500/50 text-amber-300 font-bold">
                <span>4. {race.secondThreadName} writes {race.secondValue} to '{race.variable}'</span>
                <span>OVERWRITES prior write!</span>
              </div>
            </div>

            <div className="text-[11px] font-mono text-rose-400 pt-1">
              Result: Expected counter = 2, Actual counter = 1. Update from {race.firstThreadName} was lost!
            </div>
          </div>

          {/* Remediation & Comparison */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2">
            <div className="font-bold text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>How to Fix: Mutual Exclusion</span>
            </div>
            <p className="text-slate-300 text-xs">
              {race.remediation}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#0A101C] border-t border-[#1F2E4D] flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-500">
            C++ Educational Race Detection Subsystem
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                loadScenario('mutex_counter_2');
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <span>Compare with Mutex Fix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-[#162035] hover:bg-[#1E2B47] text-slate-300 border border-[#1F2E4D] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
