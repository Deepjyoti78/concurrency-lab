# ConcurrencyLab — Master Architecture, Engineering & UI/UX Refactoring Report
## An Interactive Operating Systems & Multithreading Simulation Platform

> **Project Name**: ConcurrencyLab  
> **Core Engine**: C++20 Native Deterministic Simulation Engine  
> **Bridge / Adapter**: Node.js / Express / TypeScript IPC Streaming Server  
> **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Motion for React, Zustand  
> **Design Theme**: Warm Ivory (`#FBF4EA`), Surface (`#F4EFE7`), Structural Borders (`#DDD6CB` / `#E6E0D6`), Primary (`#171717`)  
> **Repository Path**: `concurrency project`  
> **Author / Maintainer**: Engineering Pair Programming Team  

---

## 1. Executive Summary & Product Vision

**ConcurrencyLab** is an educational operating systems engineering workstation designed to demystify multithreading, concurrent execution interleavings, and classical synchronization anomalies. Rather than presenting abstract animations or mock frontend state, ConcurrencyLab couples a **native compiled C++20 concurrency simulation engine** directly to an interactive, high-fidelity visual debugger.

Students, educators, and systems engineers can:
1. **Observe instruction-by-instruction thread interleavings** across configurable virtual CPU cores.
2. **Inspect shared memory, local register states, and program counters** at every discrete simulation cycle.
3. **Trigger and dissect classical concurrency anomalies**:
   - **Data Races & Lost Updates** ($T_1 \parallel T_2 \parallel T_3$).
   - **Mutex Contention** and FIFO wait-queue formation.
   - **Resource Pool Regulation** via Dijkstra's counting semaphores.
   - **Producer-Consumer Coordination** using bounded circular buffers.
   - **Circular Wait Deadlocks** in the Dining Philosophers problem ($5$-node wait-for cycle).
   - **Coffman Condition Cycle Detection** on bipartite Resource Allocation Graphs (RAG).
4. **Time-travel and scrub deterministically** backward and forward through execution history with snapshot-based state restoration.

---

## 2. System Architecture & Data Flow

The platform maintains a strict boundary: **the C++ simulation engine is the single source of truth for all simulation states and events**. The frontend never invents execution states.

```mermaid
flowchart TD
    subgraph Engine ["Native C++20 Simulation Core (CMake / GCC / Clang / MSVC)"]
        TM["ThreadManager\n(Virtual Threads & States)"]
        SCH["Deterministic Schedulers\n(Round Robin, FIFO, Seeded Random, Manual)"]
        SM["SharedMemory\n(Variable Store & Access Audit Log)"]
        MM["MutexManager\n(Lock Ownership & FIFO Waiters)"]
        SEM["SemaphoreManager\n(Counting Semaphores & Queues)"]
        RAG["DeadlockDetector\n(Tarjan's DFS Cycle Detection & Wait-For Graphs)"]
        RD["RaceDetector\n(Unsynchronized R/W & Lost Updates)"]
        EE["ExecutionEngine\n(Virtual Instruction Stepper & Snapshot History)"]

        TM --> EE
        SCH --> EE
        SM --> EE
        MM --> EE
        SEM --> EE
        EE --> RAG
        EE --> RD
    end

    subgraph IPC ["Bridge Layer (Node.js / Express / TypeScript)"]
        CLI["concurrency_lab_engine.exe\n(Native CLI Process)"]
        SRV["server.ts\n(REST API & Streaming JSON Adapter)"]
        CLI <-->|Standard I/O Streams / JSON| SRV
    end

    subgraph Frontend ["Debugger Workstation (React 19 / Vite / Tailwind / Zustand)"]
        STORE["Zustand Simulation Store\n(State, Replay History, Inspector Selection)"]
        HEADER["Global Compact Header\n(Brand, Nav, Live IPC Status, Theme)"]
        TOOLBAR["Unified Simulation Toolbar\n(Scenario, Combined Playback, Scheduler Popover)"]
        STAGE["Visualization Stage\n(Thread Lanes, Memory, RAG, Dining Table, Buffer)"]
        INSPECTOR["320px Contextual Inspector\n(Thread Accordions, Memory Journal, Guide)"]
        TIMELINE["Precision Debugger Timeline\n(Step Ribbon, Quick Navigation, Disassembly)"]
        MODAL["Race Analysis Modal\n(Automated Diagnostic Explanations)"]

        SRV <-->|HTTP REST / Live IPC| STORE
        STORE --> HEADER
        STORE --> TOOLBAR
        STORE --> STAGE
        STORE --> INSPECTOR
        STORE --> TIMELINE
        STORE --> MODAL
    end
```

### Deterministic State & Snapshot Protocol
1. **Engine Invocations**: When an experiment is selected or re-run, `POST /api/run` executes `concurrency_lab_engine.exe --scenario <id> --scheduler <sched> --quantum <q> --json`.
2. **Payload Structure**: The native engine emits a `SimulationRunResult`:
   - `events[]`: Discrete chronological execution events (`sequence`, `threadId`, `instruction`, `previousThreadState`, `newThreadState`, `memoryDeltas`, `raceDetected`, `deadlockDetected`, `explanation`).
   - `snapshots[]`: Immutable state snapshots for every step $0 \le i \le N$ (`threads`, `sharedVariables`, `mutexes`, `semaphores`, `deadlockReport`, `memoryAccessHistory`).
3. **Deterministic Replay**: Clicking any step on the timeline or scrubbing calls `seek(step)`, instantly restoring `snapshots[step]` with zero simulation drift.

---

## 3. Core Simulation Engine (C++20 Implementation)

The engine resides in `engine/` and is built using modern C++20 features:

### 3.1 Subsystem Breakdown

| Subsystem | Source Files | Key Features & Implementation |
| :--- | :--- | :--- |
| **ThreadManager** | `include/ThreadManager.h`<br>`src/ThreadManager.cpp` | Virtual thread creation, thread state machine (`NEW`, `READY`, `RUNNING`, `BLOCKED`, `TERMINATED`), register allocation (`r0`, `r1`), and PC tracking. |
| **Scheduler** | `include/Scheduler.h`<br>`src/Scheduler.cpp` | Deterministic scheduling: **Round Robin** (preemptive after quantum instructions), **FIFO** (run-to-completion), **Seeded Random** (deterministic pseudo-random interleaving), and **Manual**. |
| **SharedMemory** | `include/SharedMemory.h`<br>`src/SharedMemory.cpp` | Thread-safe memory access recording with full audit logging: reader/writer TID, instruction sequence, old value, and new value. |
| **MutexManager** | `include/MutexManager.h`<br>`src/MutexManager.cpp` | Mutex lock acquisition/release, owner tracking, contention metrics, and FIFO blocked queue management. |
| **SemaphoreManager** | `include/SemaphoreManager.h`<br>`src/SemaphoreManager.cpp` | Dijkstra's counting semaphores with `wait()` (blocks when $\le 0$) and `signal()` (wakes head waiter). |
| **DeadlockDetector** | `include/DeadlockDetector.h`<br>`src/DeadlockDetector.cpp` | Bipartite Resource Allocation Graph (RAG) and Wait-For Graph (WFG) maintenance. Tarjan's DFS algorithm detects circular wait cycles and reports participating threads and mutexes. |
| **RaceDetector** | `include/RaceDetector.h`<br>`src/RaceDetector.cpp` | Analyzes access history to detect: (1) Unsynchronized concurrent read/write overlaps, and (2) **Lost Updates** where two threads read the same initial value before either writes back. |
| **ExecutionEngine** | `include/ExecutionEngine.h`<br>`src/ExecutionEngine.cpp` | Instruction dispatch loop, state snapshot capture per step, and JSON serialization. |

### 3.2 Virtual Instruction Set Architecture (ISA)

The engine models concurrent execution via a clean virtual assembly instruction set:
- `READ_SHARED <var>, <reg>`: Loads shared variable into a thread-local CPU register.
- `WRITE_SHARED <var>, <reg>`: Flushes thread-local register to shared memory.
- `ADD_IMM <reg>, <val>`: Increments/decrements local register.
- `LOCK_MUTEX <mutex_id>`: Requests mutex ownership; blocks if held by another thread.
- `UNLOCK_MUTEX <mutex_id>`: Releases mutex ownership and unblocks the head FIFO waiter.
- `SEM_WAIT <sem_id>`: Decrements counting semaphore; blocks if count is 0.
- `SEM_POST <sem_id>`: Increments counting semaphore and wakes a sleeping thread.
- `ACQUIRE_RESOURCE <res_id>`: Allocates a discrete hardware resource.
- `RELEASE_RESOURCE <res_id>`: Releases an allocated hardware resource.
- `SLEEP <cycles>`: Yields the CPU for simulated duration.

---

## 4. Laboratory Modules & Scenarios Matrix

ConcurrencyLab provides 6 specialized laboratory modules comprising 10 pre-configured, academically rigorous experiments:

```
[Module 1: Race Conditions]
  ├── Scenario 1: Two-Thread Shared Counter Race (Classic lost-update anomaly)
  └── Scenario 2: Three-Thread Shared Counter Race (Multi-thread race amplification)

[Module 2: Mutex & Synchronization]
  ├── Scenario 3: Mutex-Protected Shared Counter (Critical section isolation)
  └── Scenario 4: High Lock Contention (FIFO wait-queue inspection)

[Module 3: Semaphores]
  └── Scenario 5: Counting Semaphore Resource Limiter (Capacity = 2 pool regulation)

[Module 4: Producer-Consumer]
  └── Scenario 6: Producer-Consumer Bounded Buffer (Slots = 3, empty/full semaphores)

[Module 5: Dining Philosophers]
  ├── Scenario 7: Dining Philosophers Deadlock (5-way circular wait deadlock)
  └── Scenario 8: Dining Philosophers Deadlock-Free (Asymmetric fork ordering)

[Module 6: Deadlock Detection]
  ├── Scenario 9: Two-Mutex Circular Wait Deadlock (Wait-for graph cycle)
  └── Scenario 10: Deadlock-Free Lock Hierarchy (Global total lock ordering)
```

---

## 5. Major Workspace UI/UX Refactoring & Second-Pass Corrections

The laboratory workspace underwent a comprehensive two-pass UI/UX refactoring to transform it into a precision operating-system debugging workstation.

### 5.1 First-Pass Shell & Workspace Redesign
1. **Header De-duplication**:
   - Removed the duplicate scenario dropdown from `Header.tsx`. The scenario selector now lives solely in the unified simulation toolbar.
   - Clean, compact navigation pill bar (`Dashboard`, `Laboratory Workspace`, `Architecture & Docs`) with engine connection indicator (`Live C++ IPC`).
2. **Unified Simulation Toolbar (`TopToolbar.tsx`)**:
   - Combined `Reset (R)`, `Step Backward (◀)`, `Play/Pause (Space)`, `Step Forward (▶)`, and Speed multipliers (`0.5x`, `1x`, `2x`, `4x`) into a single tactile control group.
   - Replaced bloated settings cards with a compact **Scheduler Engine Popover** (`⚙ Round Robin (q=1)`), featuring algorithm selection, an interactive time quantum slider, and a native C++ re-run trigger.
   - Clean status badges: `STEP X/Y`, `RUNNING`, `COMPLETED`, `RACE DETECTED`, `DEADLOCK`.
3. **Contextual Inspector (`InspectorPanel.tsx`)**:
   - Fixed width of **320px** on desktop (fitting the 300–330px requirement).
   - Three clean tabs: **Thread**, **Memory**, **Guide**.
   - Collapsible accordions for Thread Overview, Local CPU Registers, and Disassembly listing with active `◀ PC` marker.
   - On mobile/tablet screens (< 1024px), converts into an accessible drawer view with a single-click "Back to Visualizer" button.

### 5.2 Second-Pass Targeted Corrections (Priorities 1 to 6)
1. **PRIORITY 1 — Instruction-Level Thread Execution Lanes (`ThreadLanes.tsx`)**:
   - **Architectural Structure**: Rebuilt each thread card into a strict two-column grid (`grid-cols-1 md:grid-cols-[210px_minmax(0,1fr)]`).
   - **Left Rail (`210px`)**: Displays Thread Identity, Thread State badge (`READY`, `RUNNING`, `BLOCKED`, `TERMINATED`), Program Counter (`PC: X`), held mutex count (`Held Mutexes: N`), and compact CPU registers (`r0: 0`, `r1: 0`).
   - **Right Track (`minmax(0,1fr)`)**: Full-width instruction ribbon with global sequence numbers (`Step #1`, `Step #2`...).
   - **Instruction States**:
     - *Active Instruction*: High-contrast `#171717` card, amber `Step #N` badge, bright `ACTIVE` pill, full opcode disassembly, and inline outcome preview.
     - *Completed Instructions*: Subtle muted `#EFEAE2` card with green `DONE` checkmark.
     - *Pending Instructions*: Neutral dashed `#FBF4EA` card with `PENDING` badge.
     - *PC Associated Indicator*: Explicit `PC:X` badge on the instruction matching the thread's current program counter.
   - **Multi-thread Scalability**: Seamlessly scales across 2, 3, or 5+ threads without horizontal card distortion.
   - **Historical vs. CPU Distinction**: Clearly distinguishes between a thread that is currently scheduled `ON CPU` versus a thread that executed the currently inspected historical step (`STEP #N`).
2. **PRIORITY 2 — Single Source of Scenario Selection**:
   - Verified complete removal of the `<select>` dropdown from `Header.tsx`. The scenario selector lives exclusively in `TopToolbar.tsx`.
3. **PRIORITY 3 — Execution Timeline Auto-Scroll Safeguard**:
   - In `ExecutionTimeline.tsx`, constrained automatic scrolling behavior exclusively to `isPlaying === true`.
   - When a user scrubs manually or clicks steps, the scroller never fights manual user input, ensuring deterministic historical state restoration.
4. **PRIORITY 4 — Mobile Dashboard Left-Side Clipping Resolution**:
   - **Root Cause**: Identified that `Header.tsx`'s non-wrapping right action controls had rigid elements that expanded the document width to `425px` on `390px` viewports, causing the browser to scroll horizontally right by ~35px and clip the hero heading and paragraph on the left.
   - **Fix**: Re-architected mobile header to show compact brand, mobile nav, and theme toggle, reducing mobile header footprint to `~296px`.
   - **Verified Result**: `document.documentElement.scrollWidth` measures `385px` on `390px` and `370px` on `375px` viewports. `hasHorizontalOverflow: false`. Zero left-side clipping.
5. **PRIORITY 5 — Mobile Workspace Fluidity**:
   - Workspace tab navigation uses `min-w-0 flex-1 overflow-x-auto` for smooth horizontal touch scrolling.
   - Thread lanes stack the Left Rail above the Right Execution Track on small viewports with independent horizontal instruction touch scrolling.
   - Overall page remains strictly locked to `390px` and `375px` with zero viewport-level horizontal overflow.
6. **PRIORITY 6 — Specialized Visualizers Polish**:
   - **Shared Memory (`SharedMemoryView.tsx`)**: Full stage space utilization, descriptive empty state helper ("Initial state: no memory operations recorded yet..."), previous vs. current values, read/write counters, and chronological memory journal.
   - **Resource Allocation Graph (`ResourceAllocationGraph.tsx`)**: Scaled SVG with Zoom In / Zoom Out / Reset controls, distinct holding (`#10B981`) and request (`#F59E0B`) edges, and pulsing red circular wait deadlock cycles (`#EF4444`).
   - **Dining Table (`DiningTable.tsx`)**: Circular 5-philosopher table with distinct representation of `THINKING`, `HUNGRY`, `EATING`, and `DEADLOCKED` states, with held-fork connector lines.
   - **Bounded Buffer (`BoundedBuffer.tsx`)**: Clear separation between physical buffer occupancy (array slots) and counting semaphores (`empty_slots`, `full_slots`) and mutex locks (`buffer_mutex`), accurately showing negative counting semaphore values when threads are queued.

---

## 6. Complete Visual Walkthrough & Gallery

Every screenshot below captures actual screens of ConcurrencyLab with compiled C++20 engine state.

### 6.1 Homepage & Simulation Laboratories Dashboard
The dashboard introduces the platform, showcases the physical 3D concurrency simulation console, features core engineering capabilities, and renders interactive cards for all 6 laboratory modules.

![ConcurrencyLab Dashboard](./docs/screenshots/doc_01_desktop_dashboard.png)

---

### 6.2 Laboratory Workspace: Thread Execution Lanes (Intermediate State)
The redesigned two-column instruction-level execution lanes during runtime (Step 2 of the Two-Thread Race). Worker-A's Step #1 is completed (`DONE`), while Worker-B's Step #2 is actively executing with a prominent dark card, amber step badge, and inline disassembly preview.

![Refactored Thread Lanes Active State](./docs/screenshots/doc_02_workspace_lanes.png)

---

### 6.3 Lost-Update Race Condition Detected
At Step 6, both Worker-A and Worker-B have written back to `counter` using stale read values. The native C++ engine automatically detects the lost-update race condition, illuminating amber status badges across the toolbar, view navigation, and thread lanes.

![Thread Lanes Race Detected](./docs/screenshots/doc_13_race_detected_lanes.png)

---

### 6.4 Compact Scheduler Engine Popover
Clicking the scheduler trigger opens a compact popover allowing users to change the scheduling algorithm (`Round Robin`, `FIFO`, `Seeded Random`, `Manual`), adjust the time quantum slider, and trigger a fresh C++ simulation run without cluttering the toolbar.

![Scheduler Engine Popover](./docs/screenshots/doc_12_scheduler_popover.png)

---

### 6.5 Shared Memory Subsystem & Access Audit Log
The shared memory visualizer displays real-time variable cards with previous vs. current values, read/write counters, and an immutable chronological memory access journal.

![Shared Memory Subsystem](./docs/screenshots/doc_03_workspace_memory.png)

---

### 6.6 Resource Allocation Graph (RAG) & Circular Wait Deadlock
In scenario 9 (`deadlock_circular_wait`), Thread-1 and Thread-2 hold one mutex while requesting the other. The C++ DeadlockDetector highlights the circular wait cycle with bold pulsing red arrows on the bipartite graph.

![Resource Allocation Graph Deadlock](./docs/screenshots/doc_04_workspace_rag.png)

---

### 6.7 Dining Philosophers Round Table Visualizer
The 5-philosopher round table visualization in a circular wait deadlock state. All 5 philosophers show `DEADLOCKED`, with red connector lines tracing the circular hold on each shared fork.

![Dining Philosophers Table](./docs/screenshots/doc_05_workspace_dining.png)

---

### 6.8 Producer-Consumer Bounded Buffer Subsystem
The bounded buffer visualizer separates the physical buffer array occupancy (slots 0–2) from Dijkstra's counting semaphores (`empty_slots`, `full_slots`) and the mutual exclusion lock (`buffer_mutex`).

![Producer-Consumer Bounded Buffer](./docs/screenshots/doc_06_workspace_buffer.png)

---

### 6.9 Contextual Inspector: Educational Guide Tab
The right-side inspector displays academic scenario descriptions, objectives, expected vs. actual outcomes, and key takeaways for students.

![Contextual Inspector Guide Tab](./docs/screenshots/doc_08_workspace_guide_tab.png)

---

### 6.10 Architecture & Systems Documentation View
The interactive technical documentation center detailing the virtual ISA, scheduling algorithms, synchronization primitives, and C++ engine mechanics.

![Architecture Documentation View](./docs/screenshots/doc_11_architecture_docs.png)

---

### 6.11 Mobile Responsive Layouts (390px Viewport)
Full mobile responsiveness verified on mobile and tablet viewports, featuring stacked thread lanes, horizontal instruction ribbons, wrapped toolbar controls, and a dedicated inspector drawer view.

| Mobile Dashboard (390px) | Mobile Workspace (390px) |
| :---: | :---: |
| ![Mobile Dashboard](./docs/screenshots/doc_10_mobile_dashboard.png) | ![Mobile Workspace](./docs/screenshots/doc_11_mobile_workspace.png) |

---

## 7. Responsive Verification Matrix across Viewports

| Viewport | Device Class | Width x Height | `scrollWidth <= innerWidth` | Status | Notes |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Desktop** | Large Display / Workstation | 1440 × 920 | Yes (1440px) | **Pass** | Full 320px Inspector, 2-column Thread Lanes, RAG zoom controls |
| **Desktop Small** | Laptop / Tablet Landscape | 1024 × 768 | Yes (1018px) | **Pass** | Fluid container, inspector intact, compact toolbar controls |
| **Tablet Portrait** | iPad / Surface Portrait | 768 × 1024 | Yes (762px) | **Pass** | Tab navigation wraps cleanly, full lane width distribution |
| **Mobile Standard** | iPhone 12 / 13 / 14 / 15 | 390 × 844 | Yes (385px / 390px) | **Pass** | 0px page overflow, no left clipping, touch scrollable ribbons |
| **Mobile Compact** | iPhone SE / Small Android | 375 × 812 | Yes (370px) | **Pass** | Strict fit, responsive font sizes, collapsible controls |

---

## 8. How to Build and Run ConcurrencyLab

### Prerequisites
- **C++ Compiler**: GCC 11+, Clang 13+, or MSVC 2022 supporting C++20.
- **CMake**: Version 3.20+.
- **Node.js**: v18+ with `npm`.

### 1. Compile Native C++ Simulation Engine
```powershell
cd engine
mkdir build
cd build
cmake ..
cmake --build . --config Release
```
Output executable: `engine/build/concurrency_lab_engine.exe` (Windows) or `concurrency_lab_engine` (Linux/macOS).

### 2. Start IPC Backend Server
```powershell
cd server
npm install
npm start
```
Runs at: `http://localhost:3001` (Health check: `http://localhost:3001/api/health`).

### 3. Start Frontend Development Server
```powershell
cd frontend
npm install
npx vite --port 5180 --strictPort --host
```
Runs at: `http://localhost:5180` (accessible from local browser and local network devices).

### 4. Build Production Bundle
```powershell
cd frontend
npm run build
```
Vite transforms and bundles all 2,078 modules with **0 TypeScript errors**.

---

## 9. Summary of Milestones Achieved

1. **Native C++20 Engine**: Fully implemented with ThreadManager, 4 Schedulers, SharedMemory, MutexManager, SemaphoreManager, DeadlockDetector (Tarjan's cycle detection), RaceDetector, and 10 scenarios across 6 modules.
2. **IPC Integration**: Robust Node.js process orchestration executing native binaries with JSON streaming and graceful error boundaries.
3. **Workspace Shell Redesign**: Compact global header, single scenario selector in toolbar, 320px contextual inspector, and unified toolbar.
4. **Instruction-Level Thread Lanes**: High-contrast, horizontal debugger execution tracks with clear active, completed, and pending instruction states.
5. **Debugger Timeline**: High-density interactive step ribbon with auto-scroll and deterministic time-travel.
6. **Refactored Specialized Visualizers**: Zoomable RAG, clear Dining Table states with connector lines, independent Bounded Buffer semaphores, and responsive Shared Memory variable cards.
7. **Complete Mobile Responsiveness**: Fluid, overflow-free layouts tested across 375px, 390px, 768px, 1024px, and 1440px viewports.
8. **Documentation & Screenshots**: Complete gallery integrating all runtime captures.

---

## 10. Appendix: Ready-to-Share Prompt for ChatGPT

When sharing this project report with ChatGPT, copy and paste the prompt below:

```markdown
Hello ChatGPT! I am sharing the complete architectural and engineering report for **ConcurrencyLab**, an educational Operating Systems & Multithreading Simulation Platform.

Here is the high-level summary of the codebase:
- **C++20 Engine** (`engine/`): Implements virtual threads, deterministic schedulers (Round Robin with quantum, FIFO, Seeded Random, Manual), shared memory with audit trail, mutexes, Dijkstra's counting semaphores, Tarjan's DFS deadlock detection (RAG/WFG), and lost-update race detection across 10 scenarios and 6 modules.
- **Node.js IPC Bridge** (`server/`): REST API wrapping `concurrency_lab_engine.exe` via stdin/stdout JSON streams.
- **Frontend** (`frontend/`): React 19, TypeScript, Vite, Tailwind CSS, Motion for React, and Zustand store. Features instruction-level thread execution lanes, deterministic time-travel timeline scrubber, 320px contextual inspector, and specialized visualizers for Shared Memory, Bounded Buffer, Dining Philosophers, and Resource Allocation Graphs.
- **Theme**: Warm Ivory (`#FBF4EA`), Surface (`#F4EFE7`), Borders (`#DDD6CB`), and Matte Black (`#171717`).

Please review the attached `PROJECT_MASTER_REPORT.md` (which includes all screenshots and architecture specs). I would like your feedback, suggestions for additional academic concurrency scenarios (such as Reader-Writer locks, Peterson's algorithm, or Condition Variables), and advice on future extensions!
```
