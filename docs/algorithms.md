# ConcurrencyLab Algorithms & Formal Models

---

## 1. Educational Race Condition Detection

### Theoretical Model
In formal concurrency theory (e.g. C++11 memory model, POSIX pthreads), a data race occurs when:
1. Two or more concurrent threads access the same memory location simultaneously.
2. At least one access is a write.
3. The threads do not hold a common synchronization lock or establish a happens-before relationship.

### Educational Implementation
ConcurrencyLab's `RaceDetector` models variable access records:
$$\text{AccessRecord} = \langle T_{id}, \text{Type} \in \{\text{READ}, \text{WRITE}\}, \tau, \mathcal{L} \rangle$$
where $\mathcal{L}$ is the set of locks currently held by thread $T_{id}$.

When thread $T_1$ writes to variable $V$:
1. We iterate backward through recent accesses to $V$ performed by other threads $T_2 \ne T_1$.
2. We verify whether:
   $$\mathcal{L}_1 \cap \mathcal{L}_2 \ne \emptyset$$
3. If no common lock exists, a race condition is flagged.
4. If $T_1$ writes based on a stale local read while $T_2$ also modified $V$, the detector explicitly classifies the conflict as **`LOST_UPDATE`**, reporting:
   - Initial read value
   - Overwritten write value
   - The exact interleaving sequence
   - Concrete remediation (`mtx.lock()`)

---

## 2. Deadlock Detection via Wait-For Graph Cycle Traversal

### Coffman Conditions
Deadlock can occur if and only if all four Coffman conditions hold:
1. **Mutual Exclusion**: Resources cannot be shared simultaneously.
2. **Hold and Wait**: Threads hold allocated resources while requesting additional ones.
3. **No Preemption**: Resources cannot be forcibly revoked from a thread.
4. **Circular Wait**: A closed chain of threads exists where each holds a resource requested by the next.

### Algorithm
The `DeadlockDetector` builds the dynamic directed **Wait-For Graph** $G = (V, E)$:
- $V$: Set of all active threads
- $E$: Directed edges $T_i \to T_j$ indicating $T_i$ is queued waiting for mutex $M$, which is currently owned by $T_j$.

### Cycle Detection (DFS Back-Edge Traversal)
We perform a Depth-First Search over $G$:
1. Maintain `visited` set and active recursion `inStack` set.
2. For each unvisited node $u \in V$:
   - Mark $u$ as visited and add to `inStack`.
   - For each edge $u \to v$:
     - If $v \in \text{inStack}$, a directed cycle is identified!
     - Reconstruct the cycle path:
       $$T_1 \xrightarrow{M_B} T_2 \xrightarrow{M_A} T_1$$
     - Emit a `DeadlockReport` containing deadlocked thread IDs, involved mutexes, and cycle path.
3. Time complexity: $O(|V| + |E|)$, which executes in sub-millisecond time for interactive simulations.

---

## 3. Dijkstra Counting Semaphore

### Formal Semantics
A counting semaphore $S$ maintains an integer counter $C$ initialized to $N \ge 0$, and a FIFO wait queue $Q$:

$$\text{wait}(S): \quad C \leftarrow C - 1; \quad \text{if } C < 0 \text{ then block current thread on } Q$$
$$\text{signal}(S): \quad C \leftarrow C + 1; \quad \text{if } C \le 0 \text{ then unblock front thread from } Q$$

### Invariants Maintained
In the Bounded Buffer experiment ($N = 3$):
$$\text{empty\_slots}.\text{count} + \text{full\_slots}.\text{count} = N$$
$$\text{buffer\_count} = \text{full\_slots}.\text{count}$$
$$\forall t \in \text{Simulation}: \quad 0 \le \text{buffer\_count}(t) \le N$$
Engine tests continuously assert this invariant across all execution steps.
