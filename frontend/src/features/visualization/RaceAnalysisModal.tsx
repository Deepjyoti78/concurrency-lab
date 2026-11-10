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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="max-w-2xl w-full rounded-2xl bg-[#FBF4EA] border border-[#DDD6CB] shadow-2xl overflow-hidden text-xs text-[#18181B]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#F8F5EE] border-b border-[#E6E0D6] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#18181B] tracking-tight">Race Condition Diagnostic</h3>
              <p className="text-[11px] font-mono text-amber-900">
                {race.conflictType}: Conflicting concurrent access on '{race.variable}'
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#78716C] hover:text-[#18181B] hover:bg-[#EFEAE2] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Explanation Banner */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>What Happened Internally?</span>
            </div>
            <p className="text-xs leading-relaxed text-[#57534E]">
              {race.explanation}
            </p>
          </div>

          {/* Decomposed Interleaving Diagram */}
          <div className="rounded-xl border border-[#E6E0D6] bg-white p-4 space-y-3 shadow-xs">
            <div className="text-[11px] uppercase font-mono text-[#78716C] font-bold">
              Instruction Interleaving Timeline
            </div>

            <div className="space-y-2 font-mono">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8F5EE] border border-[#E6E0D6] text-[#18181B]">
                <span>1. {race.firstThreadName} reads '{race.variable}'</span>
                <span className="font-bold text-[#18181B]">value = {race.firstValue}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-semibold">
                <span>2. {race.secondThreadName} reads '{race.variable}'</span>
                <span className="font-bold">value = {race.firstValue} (Stale Read!)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8F5EE] border border-[#E6E0D6] text-[#18181B]">
                <span>3. {race.firstThreadName} writes {race.firstValue + 1} to '{race.variable}'</span>
                <span className="font-bold text-[#18181B]">{race.variable} = {race.firstValue + 1}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-100 border border-amber-300 text-amber-950 font-bold">
                <span>4. {race.secondThreadName} writes {race.secondValue} to '{race.variable}'</span>
                <span>OVERWRITES prior write!</span>
              </div>
            </div>

            <div className="text-[11px] font-mono text-rose-700 pt-1 font-semibold">
              Result: Expected counter = 2, Actual counter = 1. Update from {race.firstThreadName} was lost!
            </div>
          </div>

          {/* Remediation & Comparison */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-1.5">
            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>How to Fix: Mutual Exclusion</span>
            </div>
            <p className="text-[#57534E] text-xs">
              {race.remediation}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#F8F5EE] border-t border-[#E6E0D6] flex items-center justify-between">
          <span className="text-[11px] font-mono text-[#78716C]">
            C++ Educational Race Detection Subsystem
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                loadScenario('mutex_counter_2');
              }}
              className="px-3.5 py-1.5 rounded-full bg-[#18181B] hover:bg-black text-white font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <span>Compare with Mutex Fix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[#F4EFE7] text-[#18181B] border border-[#DDD6CB] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
