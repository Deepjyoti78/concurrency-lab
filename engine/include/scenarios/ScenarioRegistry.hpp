#pragma once

#include "IScenario.hpp"
#include "scheduler/RoundRobinScheduler.hpp"
#include "scheduler/FIFOScheduler.hpp"
#include <vector>
#include <memory>
#include <string>
#include <unordered_map>

namespace concurrency_lab {

// 1. Two-Thread Shared Counter Race Condition
class RaceCounter2Scenario : public IScenario {
public:
    ScenarioMetadata getMetadata() const override {
        return {
            "race_counter_2",
            "Two-Thread Shared Counter Race",
            "race-conditions",
            "Race Conditions",
            "Beginner",
            "Demonstrate a lost update when two threads concurrently increment a shared variable without synchronization.",
            "Two worker threads execute a decomposed increment (READ -> ADD LOCAL -> WRITE) on a shared counter. With round-robin interleaving, both read the initial value 0 before either writes, causing one update to be completely lost.",
            "Expected: counter = 2. Actual: counter = 1 (Lost Update).",
            "Unsynchronized reads and writes across threads cause data races and lost updates. Decomposing high-level operations exposes their non-atomic nature.",
            "ROUND_ROBIN",
            1
        };
    }

    void setup(ExecutionEngine& engine) override {
        engine.getSharedMemory().declareVariable("counter", 0);

        // Thread 1
        Program p1("Worker-A-Program");
        p1.addInstruction({Opcode::READ_SHARED, "counter", "r0", 0, "Read shared 'counter' into local register r0", "int temp = counter;"});
        p1.addInstruction({Opcode::ADD_IMM, "r0", "", 1, "Increment local register r0 by 1", "temp = temp + 1;"});
        p1.addInstruction({Opcode::WRITE_SHARED, "counter", "r0", 0, "Write local r0 back to shared 'counter'", "counter = temp;"});

        // Thread 2
        Program p2("Worker-B-Program");
        p2.addInstruction({Opcode::READ_SHARED, "counter", "r0", 0, "Read shared 'counter' into local register r0", "int temp = counter;"});
        p2.addInstruction({Opcode::ADD_IMM, "r0", "", 1, "Increment local register r0 by 1", "temp = temp + 1;"});
        p2.addInstruction({Opcode::WRITE_SHARED, "counter", "r0", 0, "Write local r0 back to shared 'counter'", "counter = temp;"});

        engine.getThreadManager().createThread("Worker-A", p1, "#6366F1");
        engine.getThreadManager().createThread("Worker-B", p2, "#EC4899");
        engine.setScheduler(std::make_unique<RoundRobinScheduler>(1));
        engine.captureInitialSnapshot();
    }
};

// 2. Three-Thread Shared Counter Race
class RaceCounter3Scenario : public IScenario {
public:
    ScenarioMetadata getMetadata() const override {
        return {
            "race_counter_3",
            "Three-Thread Shared Counter Race",
            "race-conditions",
            "Race Conditions",
            "Intermediate",
            "Observe severe state corruption when three concurrent threads increment the same shared counter.",
            "Three concurrent worker threads interleave reads and writes to 'counter'. Expected final result is 3, but interleavings produce 1 or 2.",
            "Expected: counter = 3. Actual: counter = 1 or 2 depending on interleaving.",
            "Contention escalates rapidly with more threads. Without synchronization, multiple updates get overwritten.",
            "ROUND_ROBIN",
            1
        };
    }

    void setup(ExecutionEngine& engine) override {
        engine.getSharedMemory().declareVariable("counter", 0);

        for (int i = 1; i <= 3; ++i) {
            std::string name = "Worker-" + std::to_string(i);
            Program p(name + "-Program");
            p.addInstruction({Opcode::READ_SHARED, "counter", "r0", 0, "Read shared 'counter' into local r0", "int local = counter;"});
            p.addInstruction({Opcode::ADD_IMM, "r0", "", 1, "Increment local r0", "local += 1;"});
            p.addInstruction({Opcode::WRITE_SHARED, "counter", "r0", 0, "Write local r0 to 'counter'", "counter = local;"});

            std::string color = (i == 1) ? "#6366F1" : ((i == 2) ? "#EC4899" : "#10B981");
            engine.getThreadManager().createThread(name, p, color);
        }

        engine.setScheduler(std::make_unique<RoundRobinScheduler>(1));
        engine.captureInitialSnapshot();
    }
};

// 3. Mutex-Protected Shared Counter
class MutexCounter2Scenario : public IScenario {
public:
    ScenarioMetadata getMetadata() const override {
        return {
            "mutex_counter_2",
            "Mutex-Protected Shared Counter",
            "mutex",
            "Mutex & Synchronization",
            "Beginner",
            "Verify that acquiring a mutex lock guarantees atomic execution of critical sections and eliminates lost updates.",
            "Two threads increment 'counter', but enclose the read, compute, and write instructions inside a mutex lock and unlock pair.",
            "Expected: counter = 2. Actual: counter = 2 (Correct result!).",
            "Mutual exclusion ensures only one thread executes inside the critical section at any given time, preventing data races.",
            "ROUND_ROBIN",
            1
        };
    }

    void setup(ExecutionEngine& engine) override {
        engine.getSharedMemory().declareVariable("counter", 0);
        engine.getMutexManager().declareMutex("mtx_counter");

        // Thread 1
        Program p1("Worker-A-Program");
        p1.addInstruction({Opcode::MUTEX_LOCK, "mtx_counter", "", 0, "Acquire mutex 'mtx_counter'", "mtx_counter.lock();"});
        p1.addInstruction({Opcode::READ_SHARED, "counter", "r0", 0, "Read shared 'counter' into r0", "int temp = counter;"});
        p1.addInstruction({Opcode::ADD_IMM, "r0", "", 1, "Increment local r0", "temp += 1;"});
        p1.addInstruction({Opcode::WRITE_SHARED, "counter", "r0", 0, "Write r0 to shared 'counter'", "counter = temp;"});
        p1.addInstruction({Opcode::MUTEX_UNLOCK, "mtx_counter", "", 0, "Release mutex 'mtx_counter'", "mtx_counter.unlock();"});

        // Thread 2
        Program p2("Worker-B-Program");
        p2.addInstruction({Opcode::MUTEX_LOCK, "mtx_counter", "", 0, "Acquire mutex 'mtx_counter'", "mtx_counter.lock();"});
        p2.addInstruction({Opcode::READ_SHARED, "counter", "r0", 0, "Read shared 'counter' into r0", "int temp = counter;"});
        p2.addInstruction({Opcode::ADD_IMM, "r0", "", 1, "Increment local r0", "temp += 1;"});
        p2.addInstruction({Opcode::WRITE_SHARED, "counter", "r0", 0, "Write r0 to shared 'counter'", "counter = temp;"});
        p2.addInstruction({Opcode::MUTEX_UNLOCK, "mtx_counter", "", 0, "Release mutex 'mtx_counter'", "mtx_counter.unlock();"});

        engine.getThreadManager().createThread("Worker-A", p1, "#6366F1");
        engine.getThreadManager().createThread("Worker-B", p2, "#EC4899");
        engine.setScheduler(std::make_unique<RoundRobinScheduler>(1));
        engine.captureInitialSnapshot();
    }
};

// 4. Mutex Contention
class MutexContentionScenario : public IScenario {
public:
    ScenarioMetadata getMetadata() const override {
        return {
            "mutex_contention",
            "High Lock Contention",
            "mutex",
            "Mutex & Synchronization",
            "Intermediate",
            "Observe thread blocking, FIFO queue formation, and wake-up transitions under high mutex contention.",
            "Three threads contend for the same mutex 'printer_lock'. Watch the second and third threads become BLOCKED and enter the waiting queue.",
            "All threads complete in FIFO queue order without data corruption.",
            "When a lock is held, contending threads sleep in the wait queue, preserving CPU cycles and guaranteeing ordered resumption.",
            "ROUND_ROBIN",
            1
        };
    }

    void setup(ExecutionEngine& engine) override {
        engine.getSharedMemory().declareVariable("jobs_printed", 0);
        engine.getMutexManager().declareMutex("printer_lock");

        for (int i = 1; i <= 3; ++i) {
            std::string name = "PrintJob-" + std::to_string(i);
            Program p(name + "-Program");
            p.addInstruction({Opcode::MUTEX_LOCK, "printer_lock", "", 0, "Acquire printer lock", "printer_lock.lock();"});
            p.addInstruction({Opcode::READ_SHARED, "jobs_printed", "r0", 0, "Read printed job counter", "int current = jobs_printed;"});
            p.addInstruction({Opcode::ADD_IMM, "r0", "", 1, "Increment job counter", "current++;"});
            p.addInstruction({Opcode::WRITE_SHARED, "jobs_printed", "r0", 0, "Update printed job counter", "jobs_printed = current;"});
            p.addInstruction({Opcode::MUTEX_UNLOCK, "printer_lock", "", 0, "Release printer lock", "printer_lock.unlock();"});

            std::string color = (i == 1) ? "#3B82F6" : ((i == 2) ? "#8B5CF6" : "#EC4899");
            engine.getThreadManager().createThread(name, p, color);
        }

        engine.setScheduler(std::make_unique<RoundRobinScheduler>(1));
        engine.captureInitialSnapshot();
    }
};

// 5. Counting Semaphore
class CountingSemaphoreScenario : public IScenario {
public:
    ScenarioMetadata getMetadata() const override {
        return {
            "counting_semaphore",
            "Counting Semaphore Resource Limiter",
            "semaphores",
            "Semaphores",
            "Intermediate",
            "Demonstrate how a counting semaphore regulates concurrent access to a resource pool with capacity = 2.",
            "Four worker threads attempt to access a database connection pool with only 2 available connections. Two threads acquire immediately; the remaining two block until connections are released.",
            "At most 2 threads hold connections concurrently. Counter never exceeds limits.",
            "Unlike binary mutexes, counting semaphores maintain a counter, permitting multiple concurrent holders up to capacity.",
            "ROUND_ROBIN",
            1
        };
    }

    void setup(ExecutionEngine& engine) override {
        engine.getSharedMemory().declareVariable("active_connections", 0);
        engine.getSemaphoreManager().declareSemaphore("db_pool", 2); // Initial count 2

        for (int i = 1; i <= 4; ++i) {
            std::string name = "Client-" + std::to_string(i);
            Program p(name + "-Program");
            p.addInstruction({Opcode::SEM_WAIT, "db_pool", "", 0, "Acquire database connection permit", "db_pool.wait();"});
            p.addInstruction({Opcode::READ_SHARED, "active_connections", "r0", 0, "Read active connections", "int conns = active_connections;"});
            p.addInstruction({Opcode::ADD_IMM, "r0", "", 1, "Increment active connections", "conns++;"});
            p.addInstruction({Opcode::WRITE_SHARED, "active_connections", "r0", 0, "Update active connections", "active_connections = conns;"});
            p.addInstruction({Opcode::READ_SHARED, "active_connections", "r0", 0, "Read active connections before exit", "conns = active_connections;"});
            p.addInstruction({Opcode::SUB_IMM, "r0", "", 1, "Decrement active connections", "conns--;"});
            p.addInstruction({Opcode::WRITE_SHARED, "active_connections", "r0", 0, "Write decremented active connections", "active_connections = conns;"});
            p.addInstruction({Opcode::SEM_SIGNAL, "db_pool", "", 0, "Release database connection permit", "db_pool.signal();"});

            std::string colors[] = {"#3B82F6", "#10B981", "#F59E0B", "#EC4899"};
            engine.getThreadManager().createThread(name, p, colors[i - 1]);
        }

        engine.setScheduler(std::make_unique<RoundRobinScheduler>(1));
        engine.captureInitialSnapshot();
    }
};

// 6. Producer-Consumer Problem
class ProducerConsumerScenario : public IScenario {
public:
    ScenarioMetadata getMetadata() const override {
        return {
            "producer_consumer_3",
            "Producer-Consumer Bounded Buffer",
            "producer-consumer",
            "Producer-Consumer",
            "Advanced",
            "Implement the classic bounded-buffer problem using empty/full counting semaphores and a mutex.",
            "A producer generates items into a 3-slot buffer. A consumer extracts items. Counting semaphores prevent buffer overflow and underflow.",
            "Buffer size strictly remains between 0 and 3. Producers block when full, consumers block when empty.",
            "Coordination requires both mutual exclusion (buffer access) and condition signaling (space available vs item available).",
            "ROUND_ROBIN",
            1
        };
    }

    void setup(ExecutionEngine& engine) override {
        engine.getSharedMemory().declareVariable("buffer_count", 0);
        engine.getSharedMemory().declareVariable("capacity", 3);
        engine.getMutexManager().declareMutex("buffer_mutex");
        engine.getSemaphoreManager().declareSemaphore("empty_slots", 3); // Starts with 3 empty slots
        engine.getSemaphoreManager().declareSemaphore("full_slots", 0);  // Starts with 0 full slots

        // Producer: produces 2 items
        Program prod("Producer-Program");
        for (int i = 0; i < 2; ++i) {
            prod.addInstruction({Opcode::PRODUCE_ITEM, "", "", 0, "Prepare new item data", "Item item = produce();"});
            prod.addInstruction({Opcode::SEM_WAIT, "empty_slots", "", 0, "Wait for empty slot in buffer", "empty_slots.wait();"});
            prod.addInstruction({Opcode::MUTEX_LOCK, "buffer_mutex", "", 0, "Lock buffer critical section", "buffer_mutex.lock();"});
            prod.addInstruction({Opcode::READ_SHARED, "buffer_count", "r0", 0, "Read buffer item count", "int count = buffer.size();"});
            prod.addInstruction({Opcode::ADD_IMM, "r0", "", 1, "Enqueue item", "buffer.push(item);"});
            prod.addInstruction({Opcode::WRITE_SHARED, "buffer_count", "r0", 0, "Update buffer count", "buffer_count = count + 1;"});
            prod.addInstruction({Opcode::MUTEX_UNLOCK, "buffer_mutex", "", 0, "Unlock buffer critical section", "buffer_mutex.unlock();"});
            prod.addInstruction({Opcode::SEM_SIGNAL, "full_slots", "", 0, "Signal item is available", "full_slots.signal();"});
        }

        // Consumer: consumes 2 items
        Program cons("Consumer-Program");
        for (int i = 0; i < 2; ++i) {
            cons.addInstruction({Opcode::SEM_WAIT, "full_slots", "", 0, "Wait for available item in buffer", "full_slots.wait();"});
            cons.addInstruction({Opcode::MUTEX_LOCK, "buffer_mutex", "", 0, "Lock buffer critical section", "buffer_mutex.lock();"});
            cons.addInstruction({Opcode::READ_SHARED, "buffer_count", "r0", 0, "Read buffer item count", "int count = buffer.size();"});
            cons.addInstruction({Opcode::SUB_IMM, "r0", "", 1, "Dequeue item", "Item item = buffer.pop();"});
            cons.addInstruction({Opcode::WRITE_SHARED, "buffer_count", "r0", 0, "Update buffer count", "buffer_count = count - 1;"});
            cons.addInstruction({Opcode::MUTEX_UNLOCK, "buffer_mutex", "", 0, "Unlock buffer critical section", "buffer_mutex.unlock();"});
            cons.addInstruction({Opcode::SEM_SIGNAL, "empty_slots", "", 0, "Signal empty slot is available", "empty_slots.signal();"});
            cons.addInstruction({Opcode::CONSUME_ITEM, "", "", 0, "Process consumed item", "process(item);"});
        }

        engine.getThreadManager().createThread("Producer", prod, "#10B981");
        engine.getThreadManager().createThread("Consumer", cons, "#6366F1");
        engine.setScheduler(std::make_unique<RoundRobinScheduler>(1));
        engine.captureInitialSnapshot();
    }
};

// 7. Dining Philosophers Deadlock
class DiningPhilosophersDeadlockScenario : public IScenario {
public:
    ScenarioMetadata getMetadata() const override {
        return {
            "dining_philosophers_deadlock",
            "Dining Philosophers Deadlock",
            "dining-philosophers",
            "Dining Philosophers",
            "Advanced",
            "Demonstrate a five-way circular wait deadlock when all philosophers pick up their left fork simultaneously.",
            "Five philosophers sit at a round table with 5 shared forks. Each philosopher first acquires their left fork, then their right fork. Under round-robin scheduling, all pick up their left fork simultaneously and freeze waiting for their right fork.",
            "Deadlock detected! Wait-for graph forms a 5-node directed cycle.",
            "Circular wait is the 4th Coffman condition for deadlock. Symmetrical resource acquisition leads directly to livelock or deadlock.",
            "ROUND_ROBIN",
            1
        };
    }

    void setup(ExecutionEngine& engine) override {
        for (int i = 0; i < 5; ++i) {
            engine.getMutexManager().declareMutex("Fork-" + std::to_string(i));
        }

        std::string colors[] = {"#6366F1", "#EC4899", "#F59E0B", "#10B981", "#06B6D4"};

        for (int i = 0; i < 5; ++i) {
            std::string name = "Philosopher-" + std::to_string(i);
            int leftFork = i;
            int rightFork = (i + 1) % 5;

            Program p(name + "-Program");
            p.addInstruction({Opcode::PHIL_THINK, "", "", 0, "Philosopher is thinking", "think();"});
            p.addInstruction({Opcode::MUTEX_LOCK, "Fork-" + std::to_string(leftFork), "", 0, "Pick up left fork " + std::to_string(leftFork), "fork[" + std::to_string(leftFork) + "].lock();"});
            p.addInstruction({Opcode::MUTEX_LOCK, "Fork-" + std::to_string(rightFork), "", 0, "Pick up right fork " + std::to_string(rightFork), "fork[" + std::to_string(rightFork) + "].lock();"});
            p.addInstruction({Opcode::PHIL_EAT, "", "", 0, "Philosopher is eating", "eat();"});
            p.addInstruction({Opcode::MUTEX_UNLOCK, "Fork-" + std::to_string(rightFork), "", 0, "Put down right fork " + std::to_string(rightFork), "fork[" + std::to_string(rightFork) + "].unlock();"});
            p.addInstruction({Opcode::MUTEX_UNLOCK, "Fork-" + std::to_string(leftFork), "", 0, "Put down left fork " + std::to_string(leftFork), "fork[" + std::to_string(leftFork) + "].unlock();"});

            engine.getThreadManager().createThread(name, p, colors[i]);
        }

        engine.setScheduler(std::make_unique<RoundRobinScheduler>(1));
        engine.captureInitialSnapshot();
    }
};

// 8. Dining Philosophers Safe (Asymmetric / Resource Hierarchy)
class DiningPhilosophersSafeScenario : public IScenario {
public:
    ScenarioMetadata getMetadata() const override {
        return {
            "dining_philosophers_safe",
            "Dining Philosophers Deadlock-Free",
            "dining-philosophers",
            "Dining Philosophers",
            "Advanced",
            "Eliminate deadlock in Dining Philosophers using an asymmetric resource ordering strategy.",
            "By making the last philosopher pick up their forks in reverse order (right before left, or lowest-index first), the circular wait condition is permanently broken.",
            "All philosophers successfully think, eat, and release forks without deadlock.",
            "Breaking symmetry prevents circular wait, ensuring at least one philosopher can always acquire both forks and make progress.",
            "ROUND_ROBIN",
            1
        };
    }

    void setup(ExecutionEngine& engine) override {
        for (int i = 0; i < 5; ++i) {
            engine.getMutexManager().declareMutex("Fork-" + std::to_string(i));
        }

        std::string colors[] = {"#6366F1", "#EC4899", "#F59E0B", "#10B981", "#06B6D4"};

        for (int i = 0; i < 5; ++i) {
            std::string name = "Philosopher-" + std::to_string(i);
            int leftFork = i;
            int rightFork = (i + 1) % 5;

            // Resource hierarchy: always acquire lower index fork first
            int firstFork = std::min(leftFork, rightFork);
            int secondFork = std::max(leftFork, rightFork);

            Program p(name + "-Program");
            p.addInstruction({Opcode::PHIL_THINK, "", "", 0, "Philosopher is thinking", "think();"});
            p.addInstruction({Opcode::MUTEX_LOCK, "Fork-" + std::to_string(firstFork), "", 0, "Pick up first fork (lower index: " + std::to_string(firstFork) + ")", "fork[" + std::to_string(firstFork) + "].lock();"});
            p.addInstruction({Opcode::MUTEX_LOCK, "Fork-" + std::to_string(secondFork), "", 0, "Pick up second fork (higher index: " + std::to_string(secondFork) + ")", "fork[" + std::to_string(secondFork) + "].lock();"});
            p.addInstruction({Opcode::PHIL_EAT, "", "", 0, "Philosopher is eating", "eat();"});
            p.addInstruction({Opcode::MUTEX_UNLOCK, "Fork-" + std::to_string(secondFork), "", 0, "Put down higher index fork " + std::to_string(secondFork), "fork[" + std::to_string(secondFork) + "].unlock();"});
            p.addInstruction({Opcode::MUTEX_UNLOCK, "Fork-" + std::to_string(firstFork), "", 0, "Put down lower index fork " + std::to_string(firstFork), "fork[" + std::to_string(firstFork) + "].unlock();"});

            engine.getThreadManager().createThread(name, p, colors[i]);
        }

        engine.setScheduler(std::make_unique<RoundRobinScheduler>(1));
        engine.captureInitialSnapshot();
    }
};

// 9. Two-Mutex Circular Wait
class TwoMutexCircularWaitScenario : public IScenario {
public:
    ScenarioMetadata getMetadata() const override {
        return {
            "deadlock_circular_wait",
            "Two-Mutex Circular Wait Deadlock",
            "deadlocks",
            "Deadlock Detection",
            "Intermediate",
            "Illustrate textbook circular wait deadlock between two threads acquiring two locks in opposite order.",
            "Thread 1 acquires Mutex A, then requests Mutex B. Thread 2 acquires Mutex B, then requests Mutex A. Both threads become permanently blocked.",
            "Deadlock detected! Wait-for graph displays a 2-node cycle: Thread 1 <-> Thread 2.",
            "When locks are acquired in arbitrary or reverse order, circular dependencies can freeze the system.",
            "ROUND_ROBIN",
            1
        };
    }

    void setup(ExecutionEngine& engine) override {
        engine.getMutexManager().declareMutex("Mutex_A");
        engine.getMutexManager().declareMutex("Mutex_B");

        // Thread 1: Locks A then B
        Program p1("Thread-1-Program");
        p1.addInstruction({Opcode::MUTEX_LOCK, "Mutex_A", "", 0, "Acquire Mutex A", "mutex_A.lock();"});
        p1.addInstruction({Opcode::MUTEX_LOCK, "Mutex_B", "", 0, "Acquire Mutex B", "mutex_B.lock();"});
        p1.addInstruction({Opcode::NOOP, "", "", 0, "Critical section work", "// Do work"});
        p1.addInstruction({Opcode::MUTEX_UNLOCK, "Mutex_B", "", 0, "Release Mutex B", "mutex_B.unlock();"});
        p1.addInstruction({Opcode::MUTEX_UNLOCK, "Mutex_A", "", 0, "Release Mutex A", "mutex_A.unlock();"});

        // Thread 2: Locks B then A (Opposite order!)
        Program p2("Thread-2-Program");
        p2.addInstruction({Opcode::MUTEX_LOCK, "Mutex_B", "", 0, "Acquire Mutex B", "mutex_B.lock();"});
        p2.addInstruction({Opcode::MUTEX_LOCK, "Mutex_A", "", 0, "Acquire Mutex A", "mutex_A.lock();"});
        p2.addInstruction({Opcode::NOOP, "", "", 0, "Critical section work", "// Do work"});
        p2.addInstruction({Opcode::MUTEX_UNLOCK, "Mutex_A", "", 0, "Release Mutex A", "mutex_A.unlock();"});
        p2.addInstruction({Opcode::MUTEX_UNLOCK, "Mutex_B", "", 0, "Release Mutex B", "mutex_B.unlock();"});

        engine.getThreadManager().createThread("Thread-1", p1, "#6366F1");
        engine.getThreadManager().createThread("Thread-2", p2, "#EC4899");
        engine.setScheduler(std::make_unique<RoundRobinScheduler>(1));
        engine.captureInitialSnapshot();
    }
};

// 10. Deadlock-Free Resource Acquisition
class DeadlockFreeAcquisitionScenario : public IScenario {
public:
    ScenarioMetadata getMetadata() const override {
        return {
            "deadlock_free_hierarchy",
            "Deadlock-Free Lock Hierarchy",
            "deadlocks",
            "Deadlock Detection",
            "Intermediate",
            "Demonstrate how enforcing a strict lock acquisition hierarchy prevents circular wait deadlocks.",
            "Both Thread 1 and Thread 2 acquire Mutex A first, then Mutex B. Because both respect the global hierarchy, circular waiting is mathematically impossible.",
            "Both threads complete their critical sections successfully without deadlock.",
            "Enforcing a global total order on lock acquisitions eliminates circular wait (one of Coffman's four deadlock conditions).",
            "ROUND_ROBIN",
            1
        };
    }

    void setup(ExecutionEngine& engine) override {
        engine.getMutexManager().declareMutex("Mutex_A");
        engine.getMutexManager().declareMutex("Mutex_B");

        // Thread 1: Locks A then B
        Program p1("Thread-1-Program");
        p1.addInstruction({Opcode::MUTEX_LOCK, "Mutex_A", "", 0, "Acquire Mutex A (Hierarchy #1)", "mutex_A.lock();"});
        p1.addInstruction({Opcode::MUTEX_LOCK, "Mutex_B", "", 0, "Acquire Mutex B (Hierarchy #2)", "mutex_B.lock();"});
        p1.addInstruction({Opcode::NOOP, "", "", 0, "Critical section work", "// Do work"});
        p1.addInstruction({Opcode::MUTEX_UNLOCK, "Mutex_B", "", 0, "Release Mutex B", "mutex_B.unlock();"});
        p1.addInstruction({Opcode::MUTEX_UNLOCK, "Mutex_A", "", 0, "Release Mutex A", "mutex_A.unlock();"});

        // Thread 2: ALSO Locks A then B (Hierarchy respected!)
        Program p2("Thread-2-Program");
        p2.addInstruction({Opcode::MUTEX_LOCK, "Mutex_A", "", 0, "Acquire Mutex A (Hierarchy #1)", "mutex_A.lock();"});
        p2.addInstruction({Opcode::MUTEX_LOCK, "Mutex_B", "", 0, "Acquire Mutex B (Hierarchy #2)", "mutex_B.lock();"});
        p2.addInstruction({Opcode::NOOP, "", "", 0, "Critical section work", "// Do work"});
        p2.addInstruction({Opcode::MUTEX_UNLOCK, "Mutex_B", "", 0, "Release Mutex B", "mutex_B.unlock();"});
        p2.addInstruction({Opcode::MUTEX_UNLOCK, "Mutex_A", "", 0, "Release Mutex A", "mutex_A.unlock();"});

        engine.getThreadManager().createThread("Thread-1", p1, "#6366F1");
        engine.getThreadManager().createThread("Thread-2", p2, "#10B981");
        engine.setScheduler(std::make_unique<RoundRobinScheduler>(1));
        engine.captureInitialSnapshot();
    }
};

class ScenarioRegistry {
public:
    static ScenarioRegistry& instance() {
        static ScenarioRegistry reg;
        return reg;
    }

    void registerScenario(std::unique_ptr<IScenario> scenario) {
        auto meta = scenario->getMetadata();
        scenarios_[meta.id] = std::move(scenario);
        catalog_.push_back(meta);
    }

    const std::vector<ScenarioMetadata>& getCatalog() const {
        return catalog_;
    }

    std::unique_ptr<IScenario> createScenario(const std::string& id) const {
        if (id == "race_counter_2") return std::make_unique<RaceCounter2Scenario>();
        if (id == "race_counter_3") return std::make_unique<RaceCounter3Scenario>();
        if (id == "mutex_counter_2") return std::make_unique<MutexCounter2Scenario>();
        if (id == "mutex_contention") return std::make_unique<MutexContentionScenario>();
        if (id == "counting_semaphore") return std::make_unique<CountingSemaphoreScenario>();
        if (id == "producer_consumer_3") return std::make_unique<ProducerConsumerScenario>();
        if (id == "dining_philosophers_deadlock") return std::make_unique<DiningPhilosophersDeadlockScenario>();
        if (id == "dining_philosophers_safe") return std::make_unique<DiningPhilosophersSafeScenario>();
        if (id == "deadlock_circular_wait") return std::make_unique<TwoMutexCircularWaitScenario>();
        if (id == "deadlock_free_hierarchy") return std::make_unique<DeadlockFreeAcquisitionScenario>();
        return nullptr;
    }

private:
    ScenarioRegistry() {
        registerScenario(std::make_unique<RaceCounter2Scenario>());
        registerScenario(std::make_unique<RaceCounter3Scenario>());
        registerScenario(std::make_unique<MutexCounter2Scenario>());
        registerScenario(std::make_unique<MutexContentionScenario>());
        registerScenario(std::make_unique<CountingSemaphoreScenario>());
        registerScenario(std::make_unique<ProducerConsumerScenario>());
        registerScenario(std::make_unique<DiningPhilosophersDeadlockScenario>());
        registerScenario(std::make_unique<DiningPhilosophersSafeScenario>());
        registerScenario(std::make_unique<TwoMutexCircularWaitScenario>());
        registerScenario(std::make_unique<DeadlockFreeAcquisitionScenario>());
    }

    std::unordered_map<std::string, std::unique_ptr<IScenario>> scenarios_;
    std::vector<ScenarioMetadata> catalog_;
};

} // namespace concurrency_lab
