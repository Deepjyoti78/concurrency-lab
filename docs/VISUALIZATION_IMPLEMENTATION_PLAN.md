# ConcurrencyLab — Phase 1: Illustrated Educational Visualization Plan

**Document Status:** Complete & Ready for Review  
**Date:** 2026-11-24  
**Author:** Senior Frontend Architect, Creative Developer & CS Visualization Engineer  
**Reference Design:** [Designed to Scale](https://designed-to-scale.vercel.app/#/) & Attached Design Mockup (`media_1795522786611_b0e1610c.jpg`)  
**Design Philosophy:** Editorial Computer Science Visualization • Tactile Isometric Vector Illustration • Zero Mock Simulation • C++20 Ground Truth

---

## 1. Visual Architecture & Design System

### 1.1 Aesthetic Identity & Palette
Inspired by the warm editorial feel of the attached mockup and the clean line-art diagrams of modern engineering publications:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ ConcurrencyLab Color System                                            │
├───────────────────┬───────────┬────────────────────────────────────────┤
│ Token Name        │ Hex Code  │ Semantic Role                          │
├───────────────────┼───────────┼────────────────────────────────────────┤
│ Canvas Base       │ #FBF8F3   │ Warm cream foundation (page background)│
│ Surface Warm      │ #F4EFE7   │ Sub-canvases, pedestals, cards         │
│ Surface Muted     │ #EFEAE2   │ Inset bays, chip backgrounds           │
│ Hairline Border   │ #18181B   │ Crisp 1px / 1.5px dark line-art stroke │
│ Subtle Hairline   │ #DDD6CB   │ Secondary wireframes, grid lines       │
│ Ink Primary       │ #18181B   │ High-contrast headings, active text    │
│ Ink Secondary     │ #57534E   │ Technical subheadings, labels          │
│ Ink Muted         │ #78716C   │ Disassembly notes, timestamps          │
│ Editorial Brand   │ #9E381E   │ Terracotta primary CTA, hero accent    │
│ Thread A (Worker) │ #7C3AED   │ Muted Lavender / Indigo hoodie & aura  │
│ Thread B (Worker) │ #059669   │ Sage Green / Emerald hoodie & aura     │
│ Thread C (Worker) │ #D97706   │ Warm Amber / Ochre hoodie              │
│ Memory Vault      │ #E0E7FF   │ Soft lilac-tinted cubic storage block   │
│ Mutex / Lock      │ #FBBF24   │ Golden brass lock & key tokens         │
│ Race Conflict     │ #F59E0B   │ Amber hazard flash & crack highlight   │
│ Deadlock Danger   │ #EF4444   │ Crimson cycle stroke & blocked ring    │
└───────────────────┴───────────┴────────────────────────────────────────┘
```

### 1.2 Typography Hierarchy
- **Editorial Headings:** `'Newsreader'`, `'Playfair Display'`, `'Instrument Serif'`, serif. Used for landing page headlines ("Concurrency, made visible.") with italicized editorial accents.
- **Controls & Navigation:** `'Inter'`, sans-serif. Clean, unopinionated, legible at small point sizes (11px–13px).
- **Registers, Memory & Disassembly:** `'JetBrains Mono'`, monospace. High tabular legibility with zero glyph jitter when values mutate.

### 1.3 Design System Principles
1. **Line-Art Precision:** All vector objects feature thin dark outlines (`#18181B`, stroke-width: 1.5px or 2px) with flat, pastel fill tones, mimicking tactile technical pen illustrations.
2. **Restrained Depth:** Isometric $30^\circ$ axonometric projections give physical mass to workstations, memory blocks, and conveyor belts without heavy 3D rendering or glossy textures.
3. **Restrained Shadows:** Minimal flat contact shadows (`rgba(24, 24, 27, 0.08)`) directly beneath pedestals to anchor components to the ground plane. Zero heavy blurred glows or neon glassmorphism.
4. **Subtle Isometric Ground Grid:** Low-contrast dotted or hairline diamond grid (`stroke="#DDD6CB" strokeWidth="0.75" strokeDasharray="3 3"`) creating an expansive architectural drafting table effect.

---

## 2. Visualization Implementation Strategy

### 2.1 Isometric Projection Mathematics
To maintain geometric consistency across all illustration assets, all spatial components share a unified $30^\circ$ isometric coordinate transform:

$$\begin{aligned}
x_{\text{screen}} &= (x_{\text{iso}} - y_{\text{iso}}) \cdot \cos(30^\circ) = (x_{\text{iso}} - y_{\text{iso}}) \cdot \frac{\sqrt{3}}{2} \\
y_{\text{screen}} &= (x_{\text{iso}} + y_{\text{iso}}) \cdot \sin(30^\circ) - z_{\text{iso}} = (x_{\text{iso}} + y_{\text{iso}}) \cdot 0.5 - z_{\text{iso}}
\end{aligned}$$

- **Standard Grid Spacing:** 40px $\times$ 40px isometric grid units.
- **Pedestal Dimensions:** Height: 24px, Top Face Width: 160px, Depth: 120px.
- **Vector viewBox:** Standardized SVG viewBox `0 0 800 480` ensuring responsive scaling across any device aspect ratio via CSS `w-full h-auto max-w-full`.

### 2.2 Vector Composition Layer & State Transitions
Every visual object is authored as a native SVG component constructed from semantic layers:
```text
<g id="workstation-pedestal">   <!-- Static isometric slab with contact shadow -->
<g id="worker-character">        <!-- Character body, hoodie, hair, arms -->
<g id="computer-terminal">       <!-- Laptop screen with active instruction readout -->
<g id="register-pill">           <!-- Floating local register badge: r0 = 0 -->
<g id="packet-emitter">          <!-- Egress/ingress point for animated data packets -->
```

### 2.3 Motion & Animation Engine (Framer Motion v14)
Framer Motion is already installed in `frontend/package.json` (`framer-motion@14.10.1`). It provides first-class support for SVG element animation:
- **Packet Travel:** Smooth bezier motion along SVG paths using `<motion.path>` and `<motion.circle>` with cubic-bezier easing (`ease: [0.22, 1, 0.36, 1]`).
- **Register Flips:** Number changes animate with smooth vertical spring transforms.
- **Lock Engagement:** Padlock shackle transforms between $0^\circ$ (unlocked) and $180^\circ$ (locked snap) on `MUTEX_LOCK` / `MUTEX_UNLOCK`.
- **Zero Simulation Delay:** Animations dynamically scale duration based on the active playback speed multiplier:
  - 1x Speed: 400ms duration.
  - 2x Speed: 200ms duration.
  - 4x Speed: 100ms duration.
  - Manual Seek / Step: 0ms (instant jump to snapshot state for crisp debugger scrubbing).

### 2.4 React Flow Evaluation vs. Native SVG
We evaluated whether to introduce `@xyflow/react` (React Flow v12) for the Resource Allocation and Deadlock graphs:
- **Evaluation Finding:** React Flow is designed for generic flowcharts with DOM-heavy HTML nodes, drag-and-drop handles, and mini-maps. However, ConcurrencyLab's diagrams are fixed, mathematically precise, isometric-styled pedagogical graphs that must visually match the editorial line-art aesthetic.
- **Architectural Decision:** Implement the illustrated graphs as **Native Isometric SVG Components**. This avoids adding 150+ kB of third-party bundle weight, ensures 100% aesthetic cohesion with the rest of the application, and allows direct declarative path rendering from C++ Tarjan SCC cycle edges. If interactive node dragging is ever requested in future phases, a lightweight SVG pointer drag handler can be attached directly without external dependencies.

---

## 3. Proposed Component & Directory Structure

```text
frontend/src/
├── components/
│   ├── layout/
│   │   └── Header.tsx                         # Global navigation header
│   ├── illustrations/                         # REUSABLE SVG ILLUSTRATION ASSETS
│   │   ├── characters/
│   │   │   ├── WorkerCharacter.tsx            # Thread worker (customizable color, pose, laptop)
│   │   │   ├── PhilosopherCharacter.tsx       # Dining philosopher (thinking/eating poses)
│   │   │   └── ProducerConsumerCharacter.tsx  # Producer & consumer characters
│   │   ├── hardware/
│   │   │   ├── IsometricPedestal.tsx          # 3D isometric base plinth with drop shadow
│   │   │   ├── WorkstationDesk.tsx            # Desk, laptop terminal, task chair
│   │   │   ├── CpuCoreSocket.tsx              # Multiprocessor CPU chip & ALU registers
│   │   │   └── MemoryVaultCube.tsx            # Isometric shared memory storage cube
│   │   ├── synchronization/
│   │   │   ├── MutexPadlock.tsx               # 3D golden brass padlock (locked/unlocked)
│   │   │   ├── SemaphoreDispenser.tsx         # Token dispenser & capacity gate
│   │   │   └── DiningTableForks.tsx           # Round table, 5 plates, 5 shared forks
│   │   └── flow/
│   │       ├── DataPacket.tsx                 # Floating diamond/cubic data packet
│   │       ├── ConveyorBuffer.tsx             # 3-slot bounded buffer conveyor belt
│   │       └── AnimatedConnector.tsx          # Dotted isometric bezier pipeline
│   └── isometric/
│       ├── IsometricGrid.tsx                  # Subtle background drafting grid
│       └── IsometricStage.tsx                 # Responsive SVG viewport container
├── features/
│   ├── dashboard/
│   │   ├── Dashboard.tsx                      # Redesigned editorial landing page
│   │   └── HeroIsometricScene.tsx             # Interactive Two-Thread Race Hero Scene
│   ├── workspace/
│   │   ├── Workspace.tsx                      # Master workspace canvas & split-view
│   │   ├── TopToolbar.tsx                     # Controls, scenarios, speed, schedulers
│   │   ├── ExecutionTimeline.tsx              # Bottom debugger timeline scrubber
│   │   └── InspectorPanel.tsx                 # Technical inspector (Thread/Memory/Guide)
│   └── visualization/
│       ├── adapters/
│       │   └── useVisualStateAdapter.ts       # Maps C++ snapshots/events to visual props
│       ├── stages/                            # SCENARIO-SPECIFIC ILLUSTRATED STAGES
│       │   ├── IllustratedRaceStage.tsx       # Two & Three-thread shared counter race
│       │   ├── IllustratedMutexStage.tsx      # Mutex contention & lock hierarchy
│       │   ├── IllustratedDeadlockStage.tsx   # Circular wait RAG / WFG isometric graph
│       │   ├── IllustratedDiningStage.tsx     # 5 Philosophers round table
│       │   └── IllustratedBufferStage.tsx     # Bounded buffer conveyor pipeline
│       └── forensic/                          # DEEP-DIVE TECHNICAL VIEWS (PRESERVED)
│           ├── ThreadLanes.tsx                # Instruction tracks & PC debugger
│           ├── SharedMemoryView.tsx           # Atomic memory cards & access history
│           ├── ResourceAllocationGraph.tsx    # Bipartite RAG / WFG node graph
│           ├── DiningTable.tsx                # Classic dining table view
│           └── BoundedBuffer.tsx              # Classic buffer slots view
├── store/
│   └── simulationStore.ts                     # Central Zustand store (unmodified C++ contract)
└── types/
    └── simulation.ts                          # TypeScript types (unmodified C++ contract)
```

---

## 4. Dependency Recommendations & Justification

| Dependency | Current Version | Recommended Action | Technical Justification |
| :--- | :---: | :---: | :--- |
| **`react` & `react-dom`** | `^19.3.1` | **Keep as is** | Latest stable concurrent React runtime. |
| **`framer-motion`** | `^14.10.1` | **Keep as is** | Already installed. Full SVG motion support, layout transitions, keyframes, spring physics. Perfect fit for the illustration layer. |
| **`zustand`** | `^5.1.0` | **Keep as is** | Already installed. High-performance, zero-boilerplate state store for rapid time-travel scrubbing. |
| **`lucide-react`** | `^1.70.0` | **Keep as is** | Already installed. Standardized iconography for controls and debugger UI. |
| **`tailwindcss`** | `^4.3.5` | **Keep as is** | Modern CSS utility framework powering the warm ivory design system. |
| **`@xyflow/react`** | N/A | **Do NOT Add** | Unnecessary dependency bloat. Native isometric SVG delivers 100% visual consistency with 0 extra bundle overhead. |

---

## 5. Reusable Illustration Asset Inventory

Every asset is decomposed into independent vector layers for programmatic runtime state control:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ Reusable Illustration Vector Asset Inventory                           │
├────┬────────────────────────┬──────────────────────────────────────────┤
│ #  │ Asset Component Name   │ Visual Composition & Layer Decomposition │
├────┼────────────────────────┼──────────────────────────────────────────┤
│ 01 │ `WorkerCharacter`      │ • Base isometric shadow                  │
│    │                        │ • Torso with customizable hoodie color   │
│    │                        │ • Hair (auburn/dark), face profile       │
│    │                        │ • Articulated arms (typing / resting)    │
│    │                        │ • State aura (pulsing RUNNING / BLOCKED) │
├────┼────────────────────────┼──────────────────────────────────────────┤
│ 02 │ `WorkstationDesk`      │ • Chamfered isometric desk pedestal      │
│    │                        │ • Laptop with angled terminal screen     │
│    │                        │ • Screen shows active opcode text        │
│    │                        │ • Floating local register pill (r0: 0)   │
│    │                        │ • Ergonomic mesh task chair              │
├────┼────────────────────────┼──────────────────────────────────────────┤
│ 03 │ `MemoryVaultCube`      │ • Isometric 3D cubic storage vault       │
│    │                        │ • Top face: variable name label pill     │
│    │                        │ • Front face: large value counter (x: 0) │
│    │                        │ • Right face: read/write access diodes   │
│    │                        │ • Crack/lightning overlay on race hazard │
├────┼────────────────────────┼──────────────────────────────────────────┤
│ 04 │ `MutexPadlock`         │ • Heavy brass isometric padlock body     │
│    │                        │ • Articulated steel shackle (open/shut)  │
│    │                        │ • Keyhole with glowing ownership badge   │
│    │                        │ • Lock owner thread color indicator      │
├────┼────────────────────────┼──────────────────────────────────────────┤
│ 05 │ `SemaphoreDispenser`   │ • Isometric rotary token dispenser       │
│    │                        │ • Glass token chamber showing count      │
│    │                        │ • Barrier gate: OPEN (green), SHUT (red) │
│    │                        │ • Waiting queue platform for workers     │
├────┼────────────────────────┼──────────────────────────────────────────┤
│ 06 │ `PhilosopherCharacter` │ • Robed seated figure (5 color variants) │
│    │                        │ • Thinking pose: hand on chin + bubble   │
│    │                        │ • Hungry pose: looking at table          │
│    │                        │ • Eating pose: holding forks, animated   │
│    │                        │ • Deadlocked pose: frozen crimson aura   │
├────┼────────────────────────┼──────────────────────────────────────────┤
│ 07 │ `DiningTableForks`     │ • Round banquet table on central column  │
│    │                        │ • 5 porcelain plates with rice bowls     │
│    │                        │ • 5 individual fork assets with states:  │
│    │                        │   - On Table (neutral)                   │
│    │                        │   - Held by Left Neighbor (amber)        │
│    │                        │   - Held by Right Neighbor (amber)       │
├────┼────────────────────────┼──────────────────────────────────────────┤
│ 08 │ `ConveyorBuffer`       │ • Industrial segmented isometric belt    │
│    │                        │ • 3 discrete buffer slots with outlines  │
│    │                        │ • Slot occupancy LEDs (green/empty)      │
│    │                        │ • Animated roller gears                  │
├────┼────────────────────────┼──────────────────────────────────────────┤
│ 09 │ `DataPacket`           │ • Isometric diamond/octahedron crystal   │
│    │                        │ • Numeric payload value on top facet     │
│    │                        │ • Floating motion trail along path       │
├────┼────────────────────────┼──────────────────────────────────────────┤
│ 10 │ `CpuCoreSocket`        │ • Isometric ceramic PGA/BGA silicon die  │
│    │                        │ • Gold pin array and copper bus lines    │
│    │                        │ • ALU calculation spark effect on ADD    │
├────┼────────────────────────┼──────────────────────────────────────────┤
│ 11 │ `AnimatedConnector`    │ • Isometric bezier curved trajectory     │
│    │                        │ • Animated marching dashes (READ/WRITE)  │
│    │                        │ • Flow arrows indicating direction       │
├────┼────────────────────────┼──────────────────────────────────────────┤
│ 12 │ `StageDecorations`     │ • Isometric potted monsteras and ficus   │
│    │                        │ • Ceramic coffee mug on desk             │
│    │                        │ • Hardcover CS textbook stack on floor   │
└────┴────────────────────────┴──────────────────────────────────────────┘
```

---

## 6. Engine Event to Visual Animation Mapping

The visual adapter maps C++ engine events into reactive animations in real time:

| Engine Event / Opcode | Parameters | Physical Visual Animation | Target Visual Components |
| :--- | :--- | :--- | :--- |
| **`READ_SHARED`** | `var: "counter", reg: "r0"` | A glowing diamond packet spawns from `MemoryVaultCube`, travels along `AnimatedConnector` to the executing worker's laptop; the workstation register pill flips from old to new value. | `MemoryVaultCube` $\to$ `DataPacket` $\to$ `WorkstationDesk` |
| **`WRITE_SHARED`** | `var: "counter", reg: "r0"` | A data packet spawns from the worker's laptop, glides along the connector, and absorbs into `MemoryVaultCube`. The cube flashes green, and the counter updates. | `WorkstationDesk` $\to$ `DataPacket` $\to$ `MemoryVaultCube` |
| **`ADD_IMM` / `SUB_IMM`** | `reg: "r0", imm: 1` | Local workstation ALU pulse; the laptop screen flashes arithmetic notation (`+1`), and the register pill springs to the incremented value. No packets travel to memory. | `WorkstationDesk` (ALU Spark) |
| **`MUTEX_LOCK` (Acquired)** | `mutex: "Mutex_A"` | Padlock shackle snaps closed with a tactile click; padlock body shifts to the thread's color; a solid holding beam links padlock to worker. | `MutexPadlock` (Shackle Snap) |
| **`MUTEX_LOCK` (Blocked)** | `mutex: "Mutex_A"` | Padlock remains locked; shackle flashes red; a dashed red request arrow connects worker to lock; worker character enters `BLOCKED` pose with lock badge. | `WorkerCharacter` (Blocked Pose) |
| **`MUTEX_UNLOCK`** | `mutex: "Mutex_A"` | Padlock snaps open; holding beam dissolves; if a waiting thread exists, the lock transitions to the awakened worker. | `MutexPadlock` (Shackle Release) |
| **`SEM_WAIT`** | `sem: "pool"` | Dispenser token counter decrements; gate slides open; worker advances past the barrier into the critical zone. | `SemaphoreDispenser` |
| **`SEM_SIGNAL`** | `sem: "pool"` | Dispenser token counter increments; gate flashes green; unblocked worker is released from the waiting bay. | `SemaphoreDispenser` |
| **`PRODUCE_ITEM`** | `item: packet` | Producer character places a newly minted data packet into slot $k$ of `ConveyorBuffer`; conveyor belt steps forward. | `ConveyorBuffer` |
| **`CONSUME_ITEM`** | `item: packet` | Consumer character retrieves packet from slot 0; slot LED extinguishes; consumer workstation processes packet. | `ConveyorBuffer` |
| **`PHIL_THINK`** | `id: 0..4` | Thought bubble containing abstract mathematical notation expands above philosopher character. | `PhilosopherCharacter` (Think Bubble) |
| **`PHIL_EAT`** | `id: 0..4` | Left and right forks lift from table into philosopher's hands; plate glows emerald; eating animation activates. | `DiningTableForks` & `Philosopher` |
| **`RACE CONFLICT`** | `LOST_UPDATE` | `MemoryVaultCube` flashes amber with a cracked vector overlay; a floating warning tag appears: *"LOST UPDATE: Thread B overwrote Thread A without seeing its write!"*. | `MemoryVaultCube` (Hazard Aura) |
| **`DEADLOCK CYCLE`** | Circular Wait | A pulsating crimson loop highlights all involved threads and locks; exclamation badge activates over deadlocked workers. | `IllustratedDeadlockStage` |

---

## 7. Phased Implementation Plan

```text
┌────────────────────────────────────────────────────────────────────────┐
│ Phased Implementation Roadmap                                          │
├─────────┬──────────────────────────────────────────────────────────────┤
│ Phase 0 │ Architecture Audit & Baseline Verification (COMPLETED)       │
│         │ • System inventory, IPC audit, CTest 10/10 passing           │
│         │ • Release readiness & regression documents published         │
├─────────┼──────────────────────────────────────────────────────────────┤
│ Phase 1 │ Visual Architecture & Illustration System Plan (CURRENT)     │
│         │ • Complete deliverables 1-10 documentation                   │
│         │ • Reusable asset inventory & mathematical projection spec    │
│         │ • Presentation of plan for user approval                     │
├─────────┼──────────────────────────────────────────────────────────────┤
│ Phase 2 │ Reusable SVG Illustration Primitives & Landing Page Hero     │
│         │ • Build `WorkerCharacter`, `WorkstationDesk`, `MemoryVault`  │
│         │ • Build `DataPacket`, `AnimatedConnector`, `IsometricGrid`   │
│         │ • Replace landing page dark terminal hero with interactive   │
│         │   illustrated Two-Thread Race isometric hero scene           │
│         │ • Update featured experiment cards with illustrated thumbs   │
├─────────┼──────────────────────────────────────────────────────────────┤
│ Phase 3 │ Visual State Adapter & Workspace Core Illustrated Stages     │
│         │ • Implement `useVisualStateAdapter`                          │
│         │ • Implement `IllustratedRaceStage` (2 & 3 thread races)      │
│         │ • Implement `IllustratedMutexStage` (Contention & Hierarchy) │
│         │ • Integrate Stage/Forensic toggle in Workspace tab bar       │
├─────────┼──────────────────────────────────────────────────────────────┤
│ Phase 4 │ Classical Labs Illustrated Stages                            │
│         │ • Implement `IllustratedDiningStage` (5 philosophers & forks)│
│         │ • Implement `IllustratedBufferStage` (Conveyor & semaphores) │
│         │ • Implement `IllustratedDeadlockStage` (Isometric RAG graph) │
├─────────┼──────────────────────────────────────────────────────────────┤
│ Phase 5 │ Verification, Playwright Regression & Polish                 │
│         │ • Automated Playwright viewport audits (375px to 1440px)     │
│         │ • Scrubbing & reverse time-travel verification               │
│         │ • Autoplay speed stress test (0.5x, 1x, 2x, 4x)              │
│         │ • Final production build & GitHub push                       │
└─────────┴──────────────────────────────────────────────────────────────┘
```

---

## 8. Known Risks & Mitigation Strategies

1. **DOM Churn During Fast Playback (4x Speed):**
   - *Risk:* Spawning and unmounting complex SVG elements 10 times per second during 4x playback could cause frame drops.
   - *Mitigation:* Reusable SVG nodes are permanently mounted; Framer Motion operates on CSS/SVG attribute transforms (`transform: translate3d(...)`, `opacity`), which are GPU-accelerated and avoid layout reflows. At 4x speed, packet animation durations automatically clamp to 80ms.
2. **Mobile Viewport Constraints (375px / 390px):**
   - *Risk:* 3D isometric scenes can clip or overflow on narrow mobile screens.
   - *Mitigation:* All SVG scenes use an adaptive `viewBox="0 0 800 480"` with `preserveAspectRatio="xMidYMid meet"` and horizontal margin-safe container padding (`px-3 sm:px-6`). On viewports $< 480$px, the isometric stage scales proportionally without horizontal overflow (`scrollWidth <= clientWidth`).
3. **Time-Travel Scrubbing Consistency:**
   - *Risk:* Scrubbing backward might leave forward-traveling packet animations orphaned.
   - *Mitigation:* The `useVisualStateAdapter` tracks step transition direction. If $\Delta t < 0$ or $|t_{\text{target}} - t_{\text{current}}| > 1$ (seek), animations are bypassed with immediate snap-to-state.
4. **Preservation of C++ Engine Authority:**
   - *Risk:* Accidental introduction of mock state transitions in the UI adapter.
   - *Mitigation:* The adapter is strictly a pure selector over `SimulationSnapshot` and `ExecutionEvent`. It has zero internal mutable state and zero synthetic timers.

---

## 9. Testing Strategy

1. **Visual State Adapter Unit Testing:**
   Validate that `useVisualStateAdapter(snapshot, event)` produces the exact expected visual state across all 10 scenarios for every step.
2. **Time-Travel Invariance Testing:**
   Using Playwright, navigate to Step $K$ via forward stepping, seek forward, and seek backward. Assert that the rendered SVG attributes (packet count, register text, memory value, lock states) are bitwise identical regardless of path taken.
3. **Multi-Scheduler Visual Verification:**
   Verify that changing the scheduler from Round Robin to FIFO or Seeded Random visibly changes the sequence of thread character animations.
4. **Viewport Responsiveness Matrix:**
   Automated Playwright checks on 375px, 390px, 768px, 1024px, and 1440px confirming `scrollWidth <= clientWidth` on both Landing Page and Workspace.

---

## 10. Existing Functionality That Must Be Preserved

The following features must remain 100% operational and regression-free throughout and following the redesign:

- **C++ Engine CLI & CTest:** `concurrency_lab_engine.exe` and `concurrency_lab_tests.exe` (10 passed, 0 failed).
- **Node.js IPC Bridge:** All 4 endpoints (`/api/health`, `/api/scenarios`, `/api/run`, `/api/step`) with input validation, timeout protection, and health checks.
- **Offline Fallback Data:** Complete offline execution via `frontend/src/generated/engineData.json`.
- **All 10 Simulation Scenarios:** Race conditions, mutual exclusion, contention, semaphores, bounded buffer, and dining philosophers.
- **Dynamic Schedulers:** Round Robin (q=1..1000), FIFO, Seeded Random, and Manual.
- **Time-Travel Debugger:** Stepping forward, stepping backward, seeking to any step, reset, pause, play, and speed multipliers.
- **Forensic Inspector & Timeline:** Technical thread registers, disassembly viewer, memory audit log, guide tab, following/pinned modes, and execution timeline opcode chips.
- **Multi-Device Responsiveness:** Zero horizontal overflow on mobile, tablet, and desktop.
