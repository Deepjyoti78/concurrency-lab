# ConcurrencyLab 🔬
### An Interactive Operating Systems & Multithreading Visualization Platform

ConcurrencyLab is a computer science simulation platform designed to help students and systems engineers deeply understand concurrent execution. 

Unlike static animations or hardcoded mockups, ConcurrencyLab is powered by a **deterministic C++20 instruction-level simulation engine** paired with a developer-grade React/TypeScript interface.

---

## 🌟 Key Features

- **Authoritative C++20 Simulation Core**: Full virtual thread manager, instruction executor, shared memory subsystem, and synchronization primitives.
- **Deterministic Time-Travel Debugger**: Scrub backward and forward one instruction at a time with $O(1)$ state snapshot restoration.
- **10 Preconfigured Computer Science Experiments**:
  1. *Two-Thread Shared Counter Race* (Lost update demonstration)
  2. *Three-Thread Shared Counter Race* (Escalated contention)
  3. *Mutex-Protected Shared Counter* (Atomic critical sections)
  4. *High Lock Contention* (FIFO queue wait states and handoffs)
  5. *Counting Semaphore Resource Limiter* (Capacity-constrained pool)
  6. *Producer-Consumer Bounded Buffer* (Dual semaphores + mutex)
  7. *Dining Philosophers Deadlock* (5-way circular wait)
  8. *Dining Philosophers Deadlock-Free* (Asymmetric resource hierarchy)
  9. *Two-Mutex Circular Wait Deadlock* (Opposite lock acquisition order)
  10. *Deadlock-Free Lock Hierarchy* (Global lock ordering)
- **Specialized Visualizers**:
  - **Thread Execution Lanes**: PC indicators, registers, state badges, disassembly trace.
  - **Shared Memory Cards**: Live value display, delta glow, read/write counters.
  - **Resource Allocation Graph (RAG) & Wait-For Graph (WFG)**: Interactive SVG directed graph with circular wait cycle highlighting.
  - **Dining Philosophers Round Table**: 5 philosophers with thinking, hungry, eating states and 5 shared forks.
  - **Bounded Buffer Arena**: 3-slot queue with empty/full semaphore gauges.
  - **Educational Race Condition Diagnostic**: Decomposed read/increment/write timeline explaining why lost updates happen and how mutexes resolve them.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Simulation Core** | C++20, CMake, Ninja, Modern OOP, Custom Test Suite |
| **Development Adapter** | Node.js, Express, TypeScript, Child Process IPC |
| **Frontend Framework** | React 19, TypeScript, Vite |
| **Styling & UI** | Tailwind CSS v4, Lucide Icons, Custom Developer Dark Theme |
| **Visualization** | Interactive SVG, Motion for React, Zustand State Management |

---

## 🚀 Quick Start Guide

### 1. Build and Test the C++20 Simulation Engine

```bash
cd engine
mkdir build && cd build
cmake -G "Ninja" -DCMAKE_BUILD_TYPE=Release ..
ninja

# Run the automated 10-point test suite
./concurrency_lab_tests.exe

# Execute a scenario directly via CLI
./concurrency_lab_engine.exe --scenario race_counter_2 --run
```

### 2. Start the Local Adapter Server (Native C++ IPC)

```bash
cd server
npm install
npm start
```
*Runs at `http://localhost:3001`, providing live JSON IPC to the compiled C++ executable.*

### 3. Launch the React Frontend

```bash
cd frontend
npm install
npm run dev
```
*Opens at `http://localhost:5180` (or `http://localhost:5173`).*

---

## 📖 Architecture & Formal Models

Detailed technical documentation is available in the `docs/` directory:
- [`docs/architecture.md`](docs/architecture.md): System decomposition, IPC protocols, and repository structure.
- [`docs/simulation-model.md`](docs/simulation-model.md): Virtual thread finite state machine, snapshotting, and ISA specification.
- [`docs/algorithms.md`](docs/algorithms.md): Educational race condition detection, WFG DFS cycle traversal (Coffman condition #4), and counting semaphore invariants.

---

## 🧪 Verification & Correctness

The engine includes unit tests covering:
- ✅ Thread state transitions (`NEW`, `READY`, `RUNNING`, `BLOCKED`, `TERMINATED`)
- ✅ Schedulers: Round Robin (quantum control), FIFO, Seeded Random (`std::mt19937`), Manual
- ✅ Mutex non-reentrancy, lock contention, and FIFO unblocking
- ✅ Counting semaphore wait/signal operations and wait queue order
- ✅ Shared memory access logging and previous value tracking
- ✅ Test A: Race condition lost update verification ($1 \ne 2$)
- ✅ Test B: Mutex-protected counter verification ($2 = 2$)
- ✅ Test C: Bounded buffer capacity invariant verification ($0 \le \text{count} \le 3$)
- ✅ Test D: Deadlock circular wait cycle detection
- ✅ Test E: Deterministic backward seek and exact state restoration

---

## 📄 License

MIT License. Engineered for computer science education and systems research.
