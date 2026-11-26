import React from 'react';
import { Terminal, Cpu, ShieldCheck, GitBranch } from 'lucide-react';

export const DocsView: React.FC = () => {
  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-8 space-y-8 text-[#141413] w-full">
      {/* Header Sheet */}
      <div className="border-b border-[#141413]/25 pb-5 space-y-2.5">
        <div className="flex items-center gap-2.5 text-[10px] font-mono tracking-[0.12em] uppercase">
          <span className="w-4 h-[1.5px] bg-[#9E381E]" />
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#FAF9F5] border border-[#141413]/30 text-[#141413] font-semibold">
            <Terminal className="w-3 h-3" />
            <span>TECH_SPEC // ARCHITECTURE MANUAL</span>
          </span>
          <span className="flex-1 h-[1px] bg-[#141413]/20" />
          <span className="text-[#595751]">REV. 2026</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-grotesk font-semibold tracking-tight text-[#141413]">
          ConcurrencyLab <span className="font-editorial-italic font-normal text-[#9E381E]">Systems Manual</span>
        </h1>
        <p className="font-mono text-xs text-[#595751]">
          Formal execution models, scheduling strategies, and C++20 deterministic engine mechanics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Section 1 */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-dashed border-[#141413]/20 pb-1.5">
              <h2 className="text-base font-grotesk font-semibold text-[#141413] flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#141413]" />
                <span>01 // Deterministic Instruction-Level Simulation Model</span>
              </h2>
              <span className="font-mono text-[10px] text-[#8C8982]">SPEC_01</span>
            </div>
            <div className="text-xs font-mono text-[#595751] leading-relaxed space-y-3 bg-[#FAF9F5] p-5 border border-[#141413]/25">
              <p>
                Real operating system thread scheduling is non-deterministic, governed by hardware timer interrupts,
                kernel priority queues, CPU load, and cache topologies. While authentic, this non-determinism makes
                demonstrating subtle concurrency bugs (like a lost update or circular wait) notoriously flaky in educational settings.
              </p>
              <p>
                <strong className="text-[#141413]">ConcurrencyLab</strong> resolves this by implementing a{' '}
                <strong className="text-[#141413]">deterministic instruction-level virtual thread engine in C++20</strong>.
                Instead of spawning OS threads (<code>std::thread</code>), the engine implements virtual threads with explicit program counters,
                private registers, and state queues:
              </p>
              <div className="p-3 bg-[#ECEAE3] font-mono text-[#141413] text-[11px] border border-[#141413]/25">
                ThreadState ∈ &#123; NEW, READY, RUNNING, BLOCKED, TERMINATED &#125;
              </div>
              <p>
                Every step executed by the engine advances a single instruction for the currently scheduled thread,
                producing an immutable execution event and capturing a complete state snapshot for deterministic time travel.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-dashed border-[#141413]/20 pb-1.5">
              <h2 className="text-base font-grotesk font-semibold text-[#141413] flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-[#141413]" />
                <span>02 // Schedulers & Interleaving Strategies</span>
              </h2>
              <span className="font-mono text-[10px] text-[#8C8982]">SPEC_02</span>
            </div>
            <div className="text-xs font-mono text-[#595751] leading-relaxed space-y-3 bg-[#FAF9F5] p-5 border border-[#141413]/25">
              <ul className="space-y-2.5">
                <li className="border-l-2 border-[#141413] pl-3">
                  <strong className="text-[#141413]">Round Robin (RR):</strong> Rotates among eligible threads in a circular queue.
                  Configurable quantum (default = 1 instruction) creates fine-grained interleavings that reliably surface race conditions.
                </li>
                <li className="border-l-2 border-[#141413]/40 pl-3">
                  <strong className="text-[#141413]">FIFO (First-In, First-Out):</strong> Non-preemptive scheduling where a thread runs
                  until it voluntarily yields, terminates, or blocks on a mutex or semaphore.
                </li>
                <li className="border-l-2 border-[#141413]/40 pl-3">
                  <strong className="text-[#141413]">Seeded Random:</strong> Uses <code>std::mt19937</code> with an explicit 32-bit seed.
                  Enables stochastic interleaving while guaranteeing 100% reproducible execution runs.
                </li>
                <li className="border-l-2 border-[#9E381E] pl-3">
                  <strong className="text-[#141413]">Manual:</strong> Allows the operator to select which specific virtual thread takes the next instruction step.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-dashed border-[#141413]/20 pb-1.5">
              <h2 className="text-base font-grotesk font-semibold text-[#141413] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#9E381E]" />
                <span>03 // Educational Race & Deadlock Detection</span>
              </h2>
              <span className="font-mono text-[10px] text-[#8C8982]">SPEC_03</span>
            </div>
            <div className="text-xs font-mono text-[#595751] leading-relaxed space-y-3 bg-[#FAF9F5] p-5 border border-[#141413]/25">
              <p>
                <strong className="text-[#141413]">Educational Race Detector:</strong> Tracks variable read/write histories across threads.
                When thread <code>T1</code> writes to variable <code>V</code>, the detector checks whether another thread <code>T2</code> previously read <code>V</code>{' '}
                without a common mutex lock. If <code>T2</code> overwrites based on a stale read, it formally flags a <strong className="text-[#9E381E]">LOST_UPDATE</strong>.
              </p>
              <p>
                <strong className="text-[#141413]">Deadlock Detector:</strong> Constructs the dynamic Wait-For Graph (WFG) from active
                mutex ownerships and waiting queues. It evaluates directed graph cycles using DFS back-edge traversal.
                When a cycle is detected, it reports the exact circular wait chain (e.g. <code>T1 → M_B → T2 → M_A → T1</code>).
              </p>
            </div>
          </section>
        </div>

        {/* Sidebar Telemetry */}
        <div className="space-y-5">
          <div className="border border-[#141413]/25 bg-[#FAF9F5] p-4 space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between border-b border-dashed border-[#141413]/20 pb-2">
              <span className="text-[#595751] uppercase font-bold text-[10px]">CLI // BUILD & VERIFICATION</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#141413]" />
            </div>
            <div className="space-y-2.5 text-[#141413]">
              <div className="p-2.5 bg-white border border-[#141413]/20">
                <div className="text-[#8C8982] text-[9px] uppercase mb-0.5">Build Command</div>
                <code className="text-[#141413] font-bold text-[11px] block break-all">cmake -G Ninja .. && ninja</code>
              </div>
              <div className="p-2.5 bg-white border border-[#141413]/20">
                <div className="text-[#8C8982] text-[9px] uppercase mb-0.5">Test Suite</div>
                <code className="text-[#047857] font-bold text-[11px] block break-all">.\concurrency_lab_tests.exe</code>
              </div>
              <div className="p-2.5 bg-white border border-[#141413]/20">
                <div className="text-[#8C8982] text-[9px] uppercase mb-0.5">CLI Run</div>
                <code className="text-[#9E381E] font-bold text-[11px] block break-all">.\concurrency_lab_engine.exe --scenario race_counter_2 --run</code>
              </div>
            </div>
          </div>

          <div className="border border-[#141413]/25 bg-[#FAF9F5] p-4 space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between border-b border-dashed border-[#141413]/20 pb-2">
              <h4 className="font-bold text-[#141413] text-[11px] uppercase">ARCHITECTURE INVARIANTS</h4>
              <span className="text-[9px] text-[#8C8982]">////</span>
            </div>
            <ul className="space-y-2 text-[11px] text-[#595751]">
              <li>[+] C++20 engine is the single source of truth</li>
              <li>[+] Immutable event-sourced history</li>
              <li>[+] Full deterministic state restoration</li>
              <li>[+] Strict Coffman condition verification</li>
              <li>[+] Zero synthetic or mocked execution paths</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
