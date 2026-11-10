import React from 'react';
import { Terminal, Cpu, ShieldCheck, GitBranch } from 'lucide-react';

export const DocsView: React.FC = () => {
  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-8 text-[#18181B]">
      {/* Title */}
      <div className="border-b border-[#E6E0D6] pb-5 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4EFE7] border border-[#DDD6CB] text-[#18181B] font-mono text-xs font-semibold">
          <Terminal className="w-3.5 h-3.5" />
          Technical Specification & Architecture
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#18181B]">
          ConcurrencyLab <span className="font-serif-italic font-normal">Systems Manual</span>
        </h1>
        <p className="text-sm text-[#57534E]">
          Architecture, formal execution models, scheduling algorithms, and C++20 engine mechanics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-8">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#18181B] flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#18181B]" />
              1. Deterministic Instruction-Level Simulation Model
            </h2>
            <div className="text-xs text-[#57534E] leading-relaxed space-y-3 bg-[#F8F5EE] p-6 rounded-2xl border border-[#E6E0D6] shadow-xs">
              <p>
                Real operating system thread scheduling is non-deterministic, governed by hardware timer interrupts, 
                kernel priority queues, CPU load, and cache topologies. While authentic, this non-determinism makes 
                demonstrating subtle concurrency bugs (like a lost update or circular wait) notoriously flaky in educational settings.
              </p>
              <p>
                <strong className="text-[#18181B]">ConcurrencyLab</strong> resolves this by implementing a 
                <strong className="text-[#18181B]"> deterministic instruction-level virtual thread engine in C++20</strong>. 
                Instead of spawning OS threads (`std::thread`), the engine implements virtual threads with explicit program counters, 
                private registers, and state queues:
              </p>
              <div className="p-3 bg-[#EFEAE2] rounded-xl font-mono text-[#18181B] text-[11px] border border-[#DDD6CB]">
                ThreadState ∈ &#123; NEW, READY, RUNNING, BLOCKED, TERMINATED &#125;
              </div>
              <p>
                Every step executed by the engine advances a single instruction for the currently scheduled thread, 
                producing an immutable execution event and taking a full state snapshot for deterministic time travel.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#18181B] flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-[#18181B]" />
              2. Schedulers & Interleaving Strategies
            </h2>
            <div className="text-xs text-[#57534E] leading-relaxed space-y-3 bg-[#F8F5EE] p-6 rounded-2xl border border-[#E6E0D6] shadow-xs">
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-[#18181B]">Round Robin (RR):</strong> Rotates among eligible threads in a circular queue. 
                  Configurable quantum (default = 1 instruction) creates fine-grained interleavings that reliably surface race conditions.
                </li>
                <li>
                  <strong className="text-[#18181B]">FIFO (First-In, First-Out):</strong> Non-preemptive scheduling where a thread runs 
                  until it voluntarily yields, terminates, or blocks on a mutex or semaphore.
                </li>
                <li>
                  <strong className="text-[#18181B]">Seeded Random:</strong> Uses `std::mt19937` with an explicit 32-bit seed. 
                  Enables stochastic interleaving while guaranteeing 100% reproducible execution runs.
                </li>
                <li>
                  <strong className="text-[#18181B]">Manual:</strong> Allows the user to select which specific virtual thread takes the next instruction step.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#18181B] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#18181B]" />
              3. Educational Race & Deadlock Detection
            </h2>
            <div className="text-xs text-[#57534E] leading-relaxed space-y-3 bg-[#F8F5EE] p-6 rounded-2xl border border-[#E6E0D6] shadow-xs">
              <p>
                <strong className="text-[#18181B]">Educational Race Detector:</strong> Tracks variable read/write histories across threads. 
                When thread $T_1$ writes to variable $V$, the detector checks whether another thread $T_2$ previously read $V$ 
                without a common mutex lock. If $T_2$ overwrites based on a stale read, it formally flags a <strong className="text-amber-800">LOST UPDATE</strong>.
              </p>
              <p>
                <strong className="text-[#18181B]">Deadlock Detector:</strong> Constructs the dynamic Wait-For Graph (WFG) from active 
                mutex ownerships and waiting queues. It evaluates directed graph cycles using DFS back-edge traversal. 
                When a cycle is detected, it reports the exact circular wait chain (e.g. $T_1 \to M_B \to T_2 \to M_A \to T_1$).
              </p>
            </div>
          </section>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#E6E0D6] bg-[#F8F5EE] p-5 space-y-4 text-xs font-mono shadow-xs">
            <div className="text-[#78716C] uppercase font-bold text-[10px]">C++ Build & Verification</div>
            <div className="space-y-2 text-[#18181B]">
              <div className="p-3 rounded-xl bg-white border border-[#E6E0D6] shadow-xs">
                <div className="text-[#78716C] text-[10px] font-sans font-semibold">Build Command</div>
                <code className="text-[#18181B] font-bold block break-all">cmake -G Ninja .. && ninja</code>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#E6E0D6] shadow-xs">
                <div className="text-[#78716C] text-[10px] font-sans font-semibold">Test Suite</div>
                <code className="text-emerald-800 font-bold block break-all">.\concurrency_lab_tests.exe</code>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#E6E0D6] shadow-xs">
                <div className="text-[#78716C] text-[10px] font-sans font-semibold">CLI Run</div>
                <code className="text-amber-900 font-bold block break-all">.\concurrency_lab_engine.exe --scenario race_counter_2 --run</code>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E6E0D6] bg-[#F8F5EE] p-5 space-y-3 text-xs shadow-xs">
            <h4 className="font-bold text-[#18181B] text-sm">Architecture Principles</h4>
            <ul className="space-y-2 text-[#57534E]">
              <li>✓ C++20 engine is the single source of truth</li>
              <li>✓ Immutable event-sourced history</li>
              <li>✓ Full deterministic state restoration</li>
              <li>✓ Strict Coffman condition verification</li>
              <li>✓ Zero decorative or fake animations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
