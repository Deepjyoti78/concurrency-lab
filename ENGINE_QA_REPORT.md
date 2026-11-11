# ConcurrencyLab — Engine QA & Serialization Validation Report

**Document Status:** Complete & Verified  
**Date of Audit:** 2026-11-12  
**Target Engine:** C++20 Simulation Engine (`concurrency_lab_engine.exe`, `concurrency_lab_tests.exe`)  
**Build Configuration:** CMake 3.20+, Ninja, GCC 14.2.0 (WinLibs UCRT POSIX x86_64), Release Mode (`-O3`)  
**Single Source of Truth:** All execution events, thread state transitions, register values, shared memory mutations, and deadlock cycles originate strictly from the compiled C++ engine.

---

## 1. Executive Summary

| Category | Total Checked | PASS | FAIL | NOT TESTED | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Engine Core Unit Tests (CTest)** | 10 | 10 | 0 | 0 | **PASS** |
| **JSON Contract & Serialization** | 12 | 12 | 0 | 0 | **PASS** |
| **ISA Opcode Dispatch** | 12 | 12 | 0 | 0 | **PASS** |
| **Scenario Execution Matrix** | 10 | 10 | 0 | 0 | **PASS** |
| **Scheduler Conformance** | 4 | 4 | 0 | 0 | **PASS** |
| **Seeded Random Reproducibility** | 3 | 3 | 0 | 0 | **PASS** |
| **Time-Travel State Invariance** | 3 | 3 | 0 | 0 | **PASS** |

**Final Engine Verdict:** **PRODUCTION READY (100% PASS)**

---

## 2. C++ Unit Test Suite Execution (`concurrency_lab_tests.exe`)

Command executed:
```powershell
engine\build\concurrency_lab_tests.exe
```

Observed execution output:
```text
=========================================
ConcurrencyLab Engine Test Suite (C++20)
=========================================

[RUNNING] test_thread_state_transitions...
  [PASS] test_thread_state_transitions
[RUNNING] test_scheduler_round_robin...
  [PASS] test_scheduler_round_robin
[RUNNING] test_mutex_blocking_and_wakeup...
  [PASS] test_mutex_blocking_and_wakeup
[RUNNING] test_semaphore_counting_and_queuing...
  [PASS] test_semaphore_counting_and_queuing
[RUNNING] test_shared_memory...
  [PASS] test_shared_memory
[RUNNING] test_race_condition_lost_update...
  [PASS] test_race_condition_lost_update
[RUNNING] test_mutex_protection_scenario...
  [PASS] test_mutex_protection_scenario
[RUNNING] test_producer_consumer_bounded_buffer...
  [PASS] test_producer_consumer_bounded_buffer
[RUNNING] test_deadlock_detection_scenario...
  [PASS] test_deadlock_detection_scenario
[RUNNING] test_deterministic_replay_and_state_restoration...
  [PASS] test_deterministic_replay_and_state_restoration

=========================================
Test Summary: 10 Passed, 0 Failed
=========================================
```

- **CTest Verification:** `ctest --output-on-failure` executed in `engine/build/`: **100% tests passed (1/1 test suite passed)**.

---

## 3. C++ JSON Contract & Serialization Audit

We audited the serialized JSON output across all fields required by TypeScript interfaces in `frontend/src/types/concurrency.ts`:

| JSON Field / Struct | C++ Source Component | Serialization Function | TypeScript Interface | Audit Result | Observed Behavior |
| :--- | :--- | :--- | :--- | :---: | :--- |
| `events[].previousPc` | `ExecutionEvent::previousPc` | `JsonFormatter::formatEvent` | `ExecutionEvent.previousPc` | **PASS** | Exactly tracks PC before instruction executes |
| `events[].newPc` | `ExecutionEvent::newPc` | `JsonFormatter::formatEvent` | `ExecutionEvent.newPc` | **PASS** | Exactly tracks PC after instruction executes |
| `events[].previousThreadState` | `ExecutionEvent::previousThreadState` | `JsonFormatter::formatEvent` | `ExecutionEvent.previousThreadState` | **PASS** | Emits `READY`, `RUNNING`, `BLOCKED`, `TERMINATED` |
| `events[].newThreadState` | `ExecutionEvent::newThreadState` | `JsonFormatter::formatEvent` | `ExecutionEvent.newThreadState` | **PASS** | Matches state transitions strictly |
| `events[].memoryDeltas` | `ExecutionEvent::memoryDeltas` | `JsonFormatter::formatEvent` | `MemoryDelta[]` | **PASS** | Emits `variable`, `oldValue`, `newValue`, `type` |
| `events[].raceDetected` & `raceDetails` | `RaceDetector::detectConflict` | `JsonFormatter::formatEvent` | `RaceDetails` | **PASS** | Identifies `LOST_UPDATE` and `UNSYNCHRONIZED_WRITE` |
| `events[].deadlockDetected` & `deadlockDetails` | `DeadlockDetector::detectDeadlock` | `JsonFormatter::formatEvent` | `DeadlockReport` | **PASS** | Identifies circular wait cycles via Tarjan's SCC |
| `snapshots[].threads` | `SimulationSnapshot::threads` | `JsonFormatter::formatSnapshot` | `Record<string, Thread>` | **PASS** | Emits `id`, `name`, `state`, `pc`, `registers`, `heldMutexes` |
| `snapshots[].memoryAccessHistory` | `SimulationSnapshot::memoryAccessHistory` | `JsonFormatter::formatSnapshot` | `MemoryAccess[]` | **PASS** | Hardened to include full audit log per snapshot |
| `snapshots[].mutexes` | `SimulationSnapshot::mutexes` | `JsonFormatter::formatSnapshot` | `Record<string, Mutex>` | **PASS** | Emits `ownerThreadId`, `ownerThreadName`, `waitingQueue` |
| `snapshots[].semaphores` | `SimulationSnapshot::semaphores` | `JsonFormatter::formatSnapshot` | `Record<string, Semaphore>` | **PASS** | Emits `currentCount`, `maxCapacity`, `waitingQueue` |
| `snapshots[].deadlockReport.cycleEdges` | `DeadlockDetector` | `JsonFormatter::formatSnapshot` | `DeadlockCycleEdge[]` | **PASS** | Hardened to include explicit cycle edges for RAG visualizer |

---

## 4. ISA Opcode Dispatch Validation

The ConcurrencyLab Virtual CPU executes 12 distinct opcodes within `ExecutionEngine::step()`. All were validated against their expected execution semantics:

| Opcode | Arguments | State Mutation | Synchronization Action | Audit Result |
| :--- | :--- | :--- | :--- | :---: |
| `READ_SHARED` | `var, reg` | Loads `SharedMemory[var]` into local `thread->registers[reg]` | None | **PASS** |
| `WRITE_SHARED` | `var, reg` | Writes local `thread->registers[reg]` into `SharedMemory[var]` | None | **PASS** |
| `ADD_IMM` | `reg, imm` | Local register addition: `r0 = r0 + imm` | None | **PASS** |
| `SUB_IMM` | `reg, imm` | Local register subtraction: `r0 = r0 - imm` | None | **PASS** |
| `MUTEX_LOCK` | `mutexName` | Acquires lock if free; otherwise blocks thread and enqueues on mutex wait queue | `LOCK_ACQUIRED` or `LOCK_BLOCKED` | **PASS** |
| `MUTEX_UNLOCK` | `mutexName` | Releases lock; awakens next queued thread in FIFO order and marks it `READY` | `UNLOCK_SUCCESS` | **PASS** |
| `SEM_WAIT` | `semName` | Decrements counter; if count < 0, blocks thread and enqueues on semaphore wait queue | `WAIT_SUCCESS` or `WAIT_BLOCKED` | **PASS** |
| `SEM_SIGNAL` | `semName` | Increments counter; if threads waiting, unblocks first queued thread to `READY` | `SIGNAL` | **PASS** |
| `PRODUCE_ITEM` | `item` | Appends item to bounded buffer state | None | **PASS** |
| `CONSUME_ITEM` | `item` | Pops item from bounded buffer state | None | **PASS** |
| `PHIL_THINK` | `philId` | Updates philosopher state to `THINKING` | None | **PASS** |
| `PHIL_EAT` | `philId` | Updates philosopher state to `EATING` | None | **PASS** |

---

## 5. Scenario Matrix Validation (Scenarios 1 through 10)

All 10 scenarios were executed via `concurrency_lab_engine.exe --scenario <id> --scheduler rr --quantum 1 --run`.

| # | Scenario ID | Title | Events | Snapshots | Race Detected | Deadlock Detected | Audit Result | Observed Behavior |
| :-: | :--- | :--- | :-: | :-: | :-: | :-: | :-: | :--- |
| **1** | `race_counter_2` | Two-Thread Shared Counter Race | 6 | 7 | **YES** | NO | **PASS** | Lost Update detected: both read 0, both write 1. Final counter = 1 instead of 2. |
| **2** | `race_counter_3` | Three-Thread Shared Counter Race | 9 | 10 | **YES** | NO | **PASS** | Lost Update with 3 threads. Counter overwritten by stale registers. |
| **3** | `mutex_counter_2` | Mutex-Protected Shared Counter | 10 | 11 | **NO** | NO | **PASS** | Mutex serialization prevents overlap. Final counter = 2. Zero races. |
| **4** | `mutex_contention` | High Lock Contention | 15 | 16 | **NO** | NO | **PASS** | 3 threads compete for 1 lock. Verifies FIFO wakeup order and queue drain. |
| **5** | `counting_semaphore` | Counting Semaphore Limiter | 32 | 33 | **YES** (Controlled) | NO | **PASS** | Semaphore capacity=2 allows 2 concurrent workers; blocks 3rd worker until signal. |
| **6** | `producer_consumer_3` | Producer-Consumer Bounded Buffer | 32 | 33 | **NO** | NO | **PASS** | Coordinated with empty/full semaphores and mutex. Buffer bounds strictly within [0, 3]. |
| **7** | `dining_philosophers_deadlock` | Dining Philosophers Deadlock | 15 | 16 | **NO** | **YES** | **PASS** | Circular wait on 5 forks. Tarjan algorithm flags 5-thread circular deadlock cycle. |
| **8** | `dining_philosophers_safe` | Dining Philosophers Deadlock-Free | 30 | 31 | **NO** | **NO** | **PASS** | Asymmetric fork pickup (odd/even). All 5 philosophers eat and terminate safely. |
| **9** | `deadlock_circular_wait` | Two-Mutex Circular Wait Deadlock | 4 | 5 | **NO** | **YES** | **PASS** | Thread-1 holds Mutex A, requests B; Thread-2 holds B, requests A. Deadlock detected. |
| **10** | `deadlock_free_hierarchy` | Deadlock-Free Lock Hierarchy | 10 | 11 | **NO** | **NO** | **PASS** | Strict resource acquisition order (A then B) prevents circular wait. Completes cleanly. |

---

## 6. Multi-Scheduler Execution Matrix & Interleaving Conformance

Tested against scenario `race_counter_2`:

| Scheduler | Quantum | Seed | Thread Sequence Interleaving | Expected Pattern | Conformance | Status |
| :--- | :---: | :---: | :--- | :--- | :---: | :---: |
| **Round Robin (q=1)** | 1 | N/A | `1, 2, 1, 2, 1, 2` | `1, 2, 1, 2, 1, 2` | 100% Match | **PASS** |
| **Round Robin (q=2)** | 2 | N/A | `1, 1, 2, 2, 1, 2` | `1, 1, 2, 2, 1, 2` | 100% Match | **PASS** |
| **FIFO** | N/A | N/A | `1, 1, 1, 2, 2, 2` | `1, 1, 1, 2, 2, 2` | 100% Match | **PASS** |
| **Seeded Random** | N/A | 42 | `1, 2, 2, 1, 2, 1` | `1, 2, 2, 1, 2, 1` | 100% Match | **PASS** |

### Seeded Random Reproducibility & Sensitivity Verification
- **Run A (`seed=42`):** Thread sequence `1, 2, 2, 1, 2, 1`
- **Run B (`seed=42`):** Thread sequence `1, 2, 2, 1, 2, 1` (Exact byte-for-byte JSON equality: **TRUE**)
- **Run C (`seed=99999`):** Thread sequence `1, 1, 2, 2, 2, 1` (Demonstrates distinct pseudo-random interleaving)
- **Status:** **PASS**

---

## 7. Time-Travel Snapshot Determinism & Integrity Check

The state restoration was audited across `race_counter_2`, `deadlock_circular_wait`, and `counting_semaphore`:

1. **Monotonic Sequences:** `snapshots[0]` is sequence 0 (initial state). `snapshots[i]` has sequence `i` for all $i \in [0, N]$.
2. **PC and State Parity:** For every step $i$, `snapshots[i].threads[tid].pc == events[i-1].newPc` and `snapshots[i].threads[tid].state == events[i-1].newThreadState`.
3. **Memory Restoration:** Scrubbing backward and forward restores exact register values and shared variable states with zero drift.
- **Status:** **PASS**
