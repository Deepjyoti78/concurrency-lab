# Simulation Model & Virtual Instruction Set

ConcurrencyLab avoids nondeterministic OS threads in favor of **instruction-level virtual threads**. This formal design guarantees repeatable debugging, deterministic replay, and step-by-step state inspection.

---

## 1. Virtual Thread Model

Each virtual thread encapsulates:
- `id`: Unique 32-bit integer identifier
- `name`: Human-readable identifier (e.g. `Worker-A`, `Philosopher-2`)
- `state`: Finite state machine node:
  - `NEW`: Thread instantiated, not yet in ready queue
  - `READY`: Runnable, queued in the scheduler's active ready set
  - `RUNNING`: Currently active thread executing the current instruction
  - `BLOCKED`: Suspended awaiting a synchronization primitive (`mutex` or `semaphore`)
  - `TERMINATED`: Program completed, thread permanently retired
- `pc`: Program Counter indexing the instruction vector
- `registers`: Named register bank (`r0`, `r1`, `r2`...) storing 64-bit signed integers
- `heldMutexes`: Vector of mutex IDs currently owned by this thread
- `blockedOn`: String describing blocked resource (e.g. `mutex:m1`, `sem:empty_slots`)

---

## 2. Virtual Instruction Set Architecture (ISA)

| Opcode | Operands | Description |
|---|---|---|
| `NOOP` | none | No operation; advances program counter |
| `YIELD` | none | Voluntarily yields remaining scheduler quantum |
| `LOAD_CONST` | `destReg, immediate` | Sets `destReg = immediate` |
| `READ_SHARED` | `varName, destReg` | Reads shared variable from `SharedMemory` into register; records access & checks data races |
| `WRITE_SHARED` | `varName, srcRegOrImm` | Writes register/immediate into `SharedMemory`; updates delta & checks data races |
| `ADD` | `destReg, srcReg` | Computes `destReg += srcReg` |
| `ADD_IMM` | `destReg, imm` | Locally increments `destReg += imm` |
| `SUB` | `destReg, srcReg` | Computes `destReg -= srcReg` |
| `SUB_IMM` | `destReg, imm` | Locally decrements `destReg -= imm` |
| `MUTEX_LOCK` | `mutexName` | Attempts acquisition; if already locked, transitions thread to `BLOCKED` |
| `MUTEX_UNLOCK` | `mutexName` | Releases lock; wakes front thread in FIFO wait queue to `READY` |
| `SEM_WAIT` | `semName` | Decrements semaphore count; if $\le 0$, blocks thread in wait queue |
| `SEM_SIGNAL` | `semName` | Increments semaphore count; wakes queued thread if present |
| `PRODUCE_ITEM` | none | High-level bounded buffer produce hook |
| `CONSUME_ITEM` | none | High-level bounded buffer consume hook |
| `PHIL_THINK` | none | Sets philosopher thread state to THINKING |
| `PHIL_EAT` | none | Sets philosopher thread state to EATING |

---

## 3. Snapshotting & Deterministic Time Travel

At step $S = 0$:
The initial snapshot is created.

At each step $S_k$:
1. Eligible threads are identified.
2. The active scheduler selects thread $T_i$.
3. The instruction at $T_i.\text{pc}$ executes.
4. An immutable `ExecutionEvent` record is generated.
5. A complete `SimulationSnapshot` containing deep copies of all threads, registers, memory variables, mutex queues, and detector diagnostics is recorded.

Time-travel seeking:
Seeking to step $k$ restores the simulation state from $\text{snapshots}[k]$ in $O(1)$ time complexity without re-executing non-deterministic code.
