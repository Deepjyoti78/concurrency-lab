# ConcurrencyLab — Phase 0: System Architecture & Technical Audit

**Document Status:** Complete & Verified  
**Date of Audit:** 2026-11-24  
**Author:** Senior Frontend Architect, Creative Developer & CS Visualization Engineer  
**Purpose:** Comprehensive baseline audit of the ConcurrencyLab codebase prior to implementing the illustrated educational visualization system inspired by the [Designed to Scale](https://designed-to-scale.vercel.app/#/) reference design.

---

## 1. Executive Summary

ConcurrencyLab is an interactive, browser-based operating systems and multithreading laboratory. It pairs a compiled native C++20 simulation engine with a React 19 / TypeScript / Vite frontend via a Node.js Express IPC bridge, supplemented by a pre-generated offline fallback bundle (`engineData.json`).

The purpose of this audit is to inspect every layer of the existing system—from C++ memory allocation and scheduler dispatch to React state stores, timeline scrubbers, and DOM layout containers—to ensure that the upcoming Phase 1 illustrated visualization layer integrates seamlessly as an authoritative visual projection of C++ engine truth, with **zero mock logic**, **zero backend breaking changes**, and **100% preservation of existing functionality**.

---

## 2. Repository Structure & Codebase Inventory

```text
concurrency-project/
├── .github/workflows/ci.yml       # GitHub Actions CI build & test workflow
├── docs/                          # Architecture specs, algorithms, and documentation
│   ├── algorithms.md              # Documentation of race/deadlock detection algorithms
│   ├── architecture.md            # Master system architecture reference
│   ├── simulation-model.md        # Mathematical simulation state model
│   └── screenshots/               # Architectural verification screenshots
├── engine/                        # Authoritative C++20 Simulation Engine
│   ├── CMakeLists.txt             # Modern CMake 3.20+ configuration
│   ├── build/                     # Compiled binaries (Release mode)
│   │   ├── concurrency_lab_engine.exe   # Headless simulation CLI & JSON emitter
│   │   └── concurrency_lab_tests.exe    # C++ unit test suite (10/10 passing)
│   ├── include/                   # Header-only modular engine implementation
│   │   ├── core/                  # ExecutionEngine, Thread, Program, ThreadManager
│   │   ├── detection/             # RaceDetector (lost updates, RW conflicts), DeadlockDetector (Tarjan SCC)
│   │   ├── events/                # ExecutionEvent, SimulationSnapshot, JsonFormatter
│   │   ├── memory/                # SharedMemory, VariableMetadata, AccessRecord
│   │   ├── scenarios/             # ScenarioRegistry, 10 classic concurrent lab scenarios
│   │   ├── scheduler/             # IScheduler, RoundRobin, FIFO, SeededRandom, Manual
│   │   └── synchronization/       # MutexManager, SemaphoreManager, WaitQueue
│   └── src/main.cpp               # CLI entrypoint, argument parsing, IPC JSON driver
├── server/                        # Hardened Node.js IPC Bridge
│   ├── package.json               # Express, CORS, tsx
│   └── src/server.ts              # /api/health, /api/scenarios, /api/run, /api/step
├── frontend/                      # Interactive Web Client
│   ├── package.json               # React 19, TypeScript 7, Vite 8, Tailwind v4, Zustand 5, Framer Motion 14
│   ├── index.html                 # HTML shell with Google Fonts preloads
│   ├── src/
│   │   ├── types/simulation.ts    # TypeScript interfaces mirroring C++ JSON schema exactly
│   │   ├── store/simulationStore.ts # Central Zustand state management with playback & time-travel
│   │   ├── generated/engineData.json # Authentic pre-compiled C++ runs for offline execution
│   │   ├── components/layout/     # Global Header, theme toggle, navigation
│   │   ├── features/dashboard/    # Landing page, editorial hero, lab catalog
│   │   ├── features/workspace/    # Workspace canvas, TopToolbar, ExecutionTimeline, InspectorPanel
│   │   └── features/visualization/# Forensic views: ThreadLanes, SharedMemory, RAG, DiningTable, Buffer
│   └── index.css                  # Tailwind v4 configuration, editorial fonts, warm ivory theme
├── ENGINE_QA_REPORT.md            # C++ engine QA report (100% pass)
├── FRONTEND_REGRESSION_REPORT.md  # Multi-device viewport & semantics report (100% pass)
├── IPC_INTEGRATION_REPORT.md      # Node.js adapter resilience report (100% pass)
└── RELEASE_READINESS.md           # Production build & deployment documentation
```

---

## 3. Frontend Framework, Dependencies & Styling Architecture

### 3.1 Framework & Core Dependencies
- **React 19 (`19.3.1`) & React DOM (`19.3.1`):** Latest concurrent React runtime.
- **TypeScript (`~7.0.2`):** Strict typing throughout. All simulation structures are strictly typed against engine output.
- **Vite (`8.3.6`):** Rapid HMR development and optimized production bundling with `@vitejs/plugin-react` and `@tailwindcss/vite`.
- **Zustand (`5.1.0`):** Lightweight, unopinionated, selector-based state management (`useSimulationStore`). Controls playback timers, scenario loading, stepping, and thread selection.
- **Framer Motion (`14.10.1`):** Production-grade declarative animation library for React, supporting SVG layout animations, spring transitions, path morphing, and gesture controls.
- **Lucide React (`1.70.0`):** Clean, consistent technical icons for controls, diagnostics, and status indicators.
- **clsx (`2.1.1`) & tailwind-merge (`3.7.0`):** Conflict-free conditional className concatenation.

### 3.2 Styling & Design Tokens (`index.css`)
- **Tailwind CSS v4 (`4.3.5`):** Uses modern `@import "tailwindcss";` without legacy `tailwind.config.js`.
- **Color Identity:**
  - Base Background: `--bg-base: #FBF4EA` (warm cream / ivory).
  - Subtle Surface: `--bg-subtle: #F4EFE7` (warm paper).
  - Muted Container: `--bg-muted: #EFEAE2` (sand).
  - Hairline Borders: `--border-subtle: #E6E0D6` (warm neutral hairline, 1px).
  - Primary Text: `--text-primary: #18181B` (deep charcoal).
  - Secondary Text: `--text-secondary: #57534E` (stone).
  - Editorial Brand Accent: `#9E381E` / `#9E3A24` (terracotta).
  - Thread 1 Accent: `#6366F1` (lavender / indigo).
  - Thread 2 Accent: `#10B981` (sage green / emerald).
  - Thread 3 Accent: `#8B5CF6` (violet).
  - Warning / Race Accent: `#F59E0B` (amber / warm gold).
  - Deadlock / Blocked Accent: `#EF4444` (crimson).
- **Typography:**
  - Headings / Editorial: `'Newsreader'`, `'Playfair Display'`, `'Instrument Serif'`, Georgia, serif.
  - Controls & UI: `'Inter'`, system-ui, sans-serif.
  - Registers, Memory & Assembly: `'JetBrains Mono'`, monospace.

---

## 4. C++20 Simulation Engine & IPC Communication

### 4.1 Authoritative Engine Truth
The C++ simulation engine (`engine/src/main.cpp` and `engine/include/`) is the **sole source of truth**. It executes an authentic virtual instruction set architecture (ISA) simulating CPU execution, memory barriers, thread scheduling, mutex acquisition, and semaphore synchronization:
- **Zero Mock Logic:** The frontend does **not** calculate lost updates, invent thread ordering, or fabricate deadlock graphs. All states are received directly from compiled C++ code.
- **State Serialization (`JsonFormatter.hpp`):**
  - `SimulationRunResult`: Contains `scenarioId`, `totalSteps`, `events[]`, `snapshots[]`, and `finalSnapshot`.
  - `ExecutionEvent`: Step sequence, thread ID, opcode, disassembly, previous & new PC, state transitions, memory delta, synchronization action, and race/deadlock diagnostic flags.
  - `SimulationSnapshot`: Full system snapshot at step $t \in [0, N]$ capturing all thread states, CPU registers, shared memory variables, memory access history, mutex lock ownership & wait queues, semaphore counts & queues, and Tarjan cycle edges.

### 4.2 IPC Bridge & Execution Pipeline (`server/src/server.ts`)
- **Subprocess Invocation:** Executes `concurrency_lab_engine.exe` directly via `child_process.execFile` (zero shell interpolation, eliminating command injection).
- **Security & Validation:**
  - Strict regex `/^[a-zA-Z0-9_-]{1,64}$/` and whitelist checking against `KNOWN_SCENARIOS`.
  - Integer range clamping: $1 \le \text{quantum} \le 1000$, $0 \le \text{seed} \le 2147483647$.
  - 10-second hard execution timeout (`504 Gateway Timeout`) to prevent runaway simulations.
  - Missing binary detection (`503 Service Unavailable`).
- **Offline Fallback Architecture:**
  On server startup or CI build, the backend pre-generates `frontend/src/generated/engineData.json` containing authentic simulation data for all 10 scenarios. If the backend is offline (e.g. static hosting on GitHub Pages or Vercel), the frontend client transparently falls back to this bundle without loss of fidelity.

---

## 5. Existing Scenarios & Visualization Modules

ConcurrencyLab currently features 10 classic computer science laboratory scenarios grouped across 6 modules:

| # | Scenario ID | Module | Educational Focus | Current Visualization View |
| :-: | :--- | :--- | :--- | :--- |
| 1 | `race_counter_2` | Race Conditions | Two-thread unsynchronized lost update on shared `counter` | `ThreadLanes`, `SharedMemoryView` |
| 2 | `race_counter_3` | Race Conditions | Three-thread concurrent race with multiple stale reads | `ThreadLanes`, `SharedMemoryView` |
| 3 | `mutex_counter_2` | Synchronization | Mutual exclusion: `Mutex_1` eliminates race condition | `ThreadLanes`, `SharedMemoryView` |
| 4 | `mutex_contention` | Synchronization | High contention: 3 threads queue on a single lock | `ThreadLanes`, `SharedMemoryView` |
| 5 | `counting_semaphore` | Semaphores | Bounded resource pool limiter (capacity: 2) | `ThreadLanes`, `SharedMemoryView` |
| 6 | `producer_consumer_3` | Producer-Consumer | 3-slot bounded buffer with dual semaphores & mutex | `BoundedBuffer` |
| 7 | `dining_philosophers_deadlock` | Dining Philosophers | 5 philosophers, 5 forks, symmetric circular wait | `DiningTable` |
| 8 | `dining_philosophers_safe` | Dining Philosophers | Asymmetric fork acquisition order prevents deadlock | `DiningTable` |
| 9 | `deadlock_circular_wait` | Deadlocks | Two-mutex circular dependency (`Mutex_A` & `Mutex_B`) | `ResourceAllocationGraph` |
| 10 | `deadlock_free_hierarchy` | Deadlocks | Strict lock hierarchy prevents cycle formation | `ResourceAllocationGraph` |

---

## 6. Time-Travel, Playback & Scheduling Functionality

The store (`useSimulationStore.ts`) provides complete deterministic time-travel and playback orchestration:

- **Time-Travel Scrubbing:**
  - `seek(step)`: Instantaneously restores snapshot $S_t$ from the snapshots array. Restores thread states, CPU registers, variable values, mutex owners, and graph edges with $O(1)$ indexing.
  - `stepForward()`: Advances $t \to t+1$, advancing program counters and tracking active threads.
  - `stepBackward()`: Decrements $t \to t-1$, cleanly restoring previous state with zero historical drift.
  - `reset()`: Rewinds instantly to $t = 0$.
- **Playback Controls:**
  - `play()` / `pause()`: Controlled by an interval loop timer:
    $$\Delta t = \max(150\text{ ms}, \lfloor 1000 / \text{speed} \rfloor)$$
  - Speed Multipliers: `0.5x`, `1x`, `2x`, `4x`.
  - Global Keyboard Shortcuts: <kbd>Space</kbd> (Play/Pause), <kbd>→</kbd> (Step forward), <kbd>←</kbd> (Step backward), <kbd>R</kbd> (Reset).
- **Dynamic Schedulers:**
  - **Round Robin (`rr`):** Preemptive scheduling with configurable quantum $q \in [1, 1000]$.
  - **FIFO (`fifo`):** Non-preemptive run-to-completion / block scheduling.
  - **Seeded Random (`random`):** Deterministic pseudo-random interleaving parameterized by seed integer.
  - **Manual (`manual`):** User-guided stepping.
- **Inspector Synchronization:**
  - **Following Mode:** Automatically shifts inspection focus to whichever thread executed the current step.
  - **Pinned Mode:** Allows manual lock-in on a specific thread's registers and call history during automated playback.

---

## 7. Reusable Components & Architectural Limitations

### 7.1 Existing Reusable Assets
1. **Zustand State Store:** Mature, thoroughly tested state management with time-travel and playback loop.
2. **TopToolbar & ExecutionTimeline:** Reliable, accessible debugger controls with step counters, navigation buttons, and opcode chips.
3. **InspectorPanel:** Thorough tabular views of CPU registers, disassembly, and variable history.
4. **C++ Engine IPC Layer:** Hardened subprocess invoker with offline pre-generation.

### 7.2 Architectural Limitations of Current UI
1. **Over-reliance on Tabular / Card Displays:** The current landing page hero is a dark code-like terminal table (`TRY A TRACE / Two-thread race`). It lacks spatial intuition, character embodiment, and visual warmth.
2. **Disjointed Scenario Visualizations:** The workspace visualizers (`ThreadLanes`, `SharedMemoryView`, `ResourceAllocationGraph`, `DiningTable`, `BoundedBuffer`) are rendered in separate isolated tabs. A beginner viewing `race_counter_2` must flip between `ThreadLanes` and `SharedMemory` to see the relationship between thread registers and memory.
3. **Absence of an Illustrated Macro View:** The user lacks a bird's-eye isometric view where threads appear as physical worker characters sitting at workstations, reading and writing to an illustrated central memory pedestal via animated packet streams (as seen in the reference mockup).
4. **Static Visualizations:** Existing SVG diagrams (such as the bipartite RAG or Dining Philosophers table) use basic geometry without layered SVG components, subtle isometric depth, or animated packet flow.

---

## 8. Integration Strategy: Preserving Engine Truth

To achieve the illustrated educational vision of [Designed to Scale](https://designed-to-scale.vercel.app/#/) without corrupting simulation truth:

1. **Non-Invasive Visual Adapter (`useVisualStateAdapter`):**
   A pure mapping function will translate the active `SimulationSnapshot` and `ExecutionEvent` into reactive props for the illustrated SVG components. It does **not** alter engine state.
2. **Coexistence of Illustrated & Forensic Views:**
   The new **Illustrated Isometric Stage** will become the primary visual canvas for high-level educational intuition, while the existing detailed tabs (`Thread Lanes`, `Shared Memory`, `RAG Graph`, `Dining Table`, `Bounded Buffer`) remain available as forensic deep-dive views.
3. **Complete State Synchronization:**
   When a user clicks Step Forward or drags the timeline scrubber, the illustrated characters, floating packets, memory vault, register pills, and technical inspector will update in lockstep from the exact same snapshot.
