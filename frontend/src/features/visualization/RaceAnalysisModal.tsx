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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-fade-in">
      <div className="max-w-2xl w-full rounded-none bg-[#F6F4EF] border border-[#141413] overflow-hidden text-xs text-[#141413]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#ECEAE3] border-b border-[#141413]/25 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-none bg-[#FAF9F5] border border-[#9E381E] flex items-center justify-center text-[#9E381E]">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-grotesk font-semibold text-[#141413] tracking-tight">RACE_DIAGNOSTIC // REPORT</h3>
              <p className="text-[11px] font-mono text-[#9E381E]">
                {race.conflictType}: Conflicting concurrent access on '{race.variable}'
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-none text-[#595751] hover:text-[#141413] hover:bg-[#E4E1D9] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Explanation Banner */}
          <div className="p-4 rounded-none bg-[#FAF9F5] border border-[#9E381E]/40 text-[#141413] space-y-1.5">
            <div className="font-mono font-bold flex items-center gap-1.5 text-[#9E381E]">
              <AlertTriangle className="w-4 h-4 text-[#9E381E]" />
              <span>INTERNAL_TRACE_ANALYSIS</span>
            </div>
            <p className="text-xs font-mono leading-relaxed text-[#595751]">
              {race.explanation}
            </p>
          </div>

          {/* Decomposed Interleaving Diagram */}
          <div className="rounded-none border border-[#141413]/25 bg-white p-4 space-y-3">
            <div className="text-[11px] uppercase font-mono text-[#595751] font-bold">
              INSTRUCTION INTERLEAVING TIMELINE
            </div>

            <div className="space-y-2 font-mono">
              <div className="flex items-center justify-between p-2.5 rounded-none bg-[#FAF9F5] border border-[#141413]/20 text-[#141413]">
                <span>1. {race.firstThreadName} reads '{race.variable}'</span>
                <span className="font-bold text-[#141413]">value = {race.firstValue}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-none bg-[#FEF3C7]/45 border border-[#D97706]/50 text-[#92400E] font-semibold">
                <span>2. {race.secondThreadName} reads '{race.variable}'</span>
                <span className="font-bold">value = {race.firstValue} (STALE_READ)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-none bg-[#FAF9F5] border border-[#141413]/20 text-[#141413]">
                <span>3. {race.firstThreadName} writes {race.firstValue + 1} to '{race.variable}'</span>
                <span className="font-bold text-[#141413]">{race.variable} = {race.firstValue + 1}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-none bg-[#9E381E]/10 border border-[#9E381E]/50 text-[#9E381E] font-bold">
                <span>4. {race.secondThreadName} writes {race.secondValue} to '{race.variable}'</span>
                <span>OVERWRITES PRIOR WRITE</span>
              </div>
            </div>

            <div className="text-[11px] font-mono text-[#9E381E] pt-1 font-semibold">
              Result: Expected counter = 2, Actual counter = 1. Update from {race.firstThreadName} was lost!
            </div>
          </div>

          {/* Remediation & Comparison */}
          <div className="rounded-none border border-[#047857]/40 bg-[#FAF9F5] p-4 space-y-1.5">
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
        <div className="px-6 py-3.5 bg-[#FAF9F5] border-t border-[#D5D1C7] flex items-center justify-between">
          <span className="text-[11px] font-mono text-[#78716C]">
            C++ Educational Race Detection Subsystem
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                loadScenario('mutex_counter_2');
              }}
              className="px-3.5 py-1.5 rounded-full bg-[#141413] hover:bg-black text-white font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <span>Compare with Mutex Fix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[#ECEAE3] text-[#141413] border border-[#D5D1C7] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
