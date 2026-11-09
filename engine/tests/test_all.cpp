#include "core/ExecutionEngine.hpp"
#include "scenarios/ScenarioRegistry.hpp"
#include "scheduler/RoundRobinScheduler.hpp"
#include "scheduler/FIFOScheduler.hpp"
#include "scheduler/SeededRandomScheduler.hpp"

#include <iostream>
#include <cassert>
#include <vector>
#include <string>

using namespace concurrency_lab;

int g_passedTests = 0;
int g_failedTests = 0;

#define TEST_ASSERT(cond, msg) \
    do { \
        if (!(cond)) { \
            std::cerr << "[-] FAILED: " << msg << " (" << __FILE__ << ":" << __LINE__ << ")\n"; \
            g_failedTests++; \
            return; \
        } \
    } while(0)

#define RUN_TEST(fn) \
    do { \
        std::cout << "[RUNNING] " << #fn << "...\n"; \
        int before = g_failedTests; \
        fn(); \
        if (g_failedTests == before) { \
            std::cout << "  [PASS] " << #fn << "\n"; \
            g_passedTests++; \
        } \
    } while(0)

// 1. Thread State Transition Tests
void test_thread_state_transitions() {
    ThreadManager tm;
    Program p("TestProg");
    p.addInstruction({Opcode::NOOP, "", "", 0, "", ""});

    uint32_t tid = tm.createThread("Worker-1", p);
    Thread* t = tm.getThread(tid);
    TEST_ASSERT(t != nullptr, "Thread should exist");
    TEST_ASSERT(t->state == ThreadState::READY, "Initial state must be READY");

    TEST_ASSERT(tm.transitionState(tid, ThreadState::RUNNING), "Transition to RUNNING");
    TEST_ASSERT(t->state == ThreadState::RUNNING, "State must be RUNNING");

    TEST_ASSERT(tm.transitionState(tid, ThreadState::BLOCKED, "mutex:test"), "Transition to BLOCKED");
    TEST_ASSERT(t->state == ThreadState::BLOCKED, "State must be BLOCKED");
    TEST_ASSERT(t->blockedOn == "mutex:test", "Blocked reason recorded");
    TEST_ASSERT(!tm.isInReadyQueue(tid), "Blocked thread must not be in ready queue");

    TEST_ASSERT(tm.transitionState(tid, ThreadState::READY), "Transition to READY");
    TEST_ASSERT(t->state == ThreadState::READY, "State must be READY");
    TEST_ASSERT(tm.isInReadyQueue(tid), "Ready thread must be back in ready queue");

    TEST_ASSERT(tm.transitionState(tid, ThreadState::TERMINATED), "Transition to TERMINATED");
    TEST_ASSERT(t->state == ThreadState::TERMINATED, "State must be TERMINATED");
    TEST_ASSERT(!tm.transitionState(tid, ThreadState::RUNNING), "Cannot transition out of TERMINATED");
}

// 2. Scheduler Selection Tests
void test_scheduler_round_robin() {
    ThreadManager tm;
    Program p("Prog");
    p.addInstruction({Opcode::NOOP, "", "", 0, "", ""});
    p.addInstruction({Opcode::NOOP, "", "", 0, "", ""});

    uint32_t t1 = tm.createThread("T1", p);
    uint32_t t2 = tm.createThread("T2", p);

    RoundRobinScheduler rr(1); // quantum = 1
    auto eligible = tm.getEligibleThreads();

    auto next1 = rr.selectNextThread(eligible, tm);
    TEST_ASSERT(next1 == t1, "RR first selection should be T1");
    rr.onThreadStepped(t1);

    auto next2 = rr.selectNextThread(eligible, tm);
    TEST_ASSERT(next2 == t2, "RR second selection should be T2 with quantum=1");
    rr.onThreadStepped(t2);

    auto next3 = rr.selectNextThread(eligible, tm);
    TEST_ASSERT(next3 == t1, "RR third selection cycles back to T1");
}

// 3. Mutex Ownership, Blocking, and Wake-up Tests
void test_mutex_blocking_and_wakeup() {
    MutexManager mm;
    mm.declareMutex("lockA");

    bool blocked = false;
    bool acq1 = mm.lock(1, "T1", "lockA", blocked);
    TEST_ASSERT(acq1 == true && blocked == false, "T1 acquires lockA");

    const Mutex* m = mm.getMutex("lockA");
    TEST_ASSERT(m->locked == true, "lockA must be locked");
    TEST_ASSERT(m->ownerThreadId == 1, "T1 is owner");

    // T2 attempts to acquire -> must block
    bool acq2 = mm.lock(2, "T2", "lockA", blocked);
    TEST_ASSERT(acq2 == false && blocked == true, "T2 must be blocked on locked mutex");
    TEST_ASSERT(m->waitingQueue.size() == 1, "T2 is in wait queue");
    TEST_ASSERT(m->waitingQueue.front() == 2, "T2 is front of wait queue");

    // T1 releases -> T2 awakened and becomes new owner
    auto unblocked = mm.unlock(1, "lockA");
    TEST_ASSERT(unblocked.has_value() && unblocked.value() == 2, "T2 must be awakened and transferred ownership");
    TEST_ASSERT(m->ownerThreadId == 2, "T2 is now the owner");
    TEST_ASSERT(m->waitingQueue.empty(), "Wait queue is now empty");

    // T2 releases
    auto unblocked2 = mm.unlock(2, "lockA");
    TEST_ASSERT(!unblocked2.has_value(), "No waiting threads left");
    TEST_ASSERT(m->locked == false, "Mutex is now unlocked");
}

// 4. Semaphore Behavior Tests
void test_semaphore_counting_and_queuing() {
    SemaphoreManager sm;
    sm.declareSemaphore("sem", 1); // Binary semaphore

    bool blocked = false;
    bool w1 = sm.wait(1, "sem", blocked);
    TEST_ASSERT(w1 == true && blocked == false, "T1 acquires semaphore");
    TEST_ASSERT(sm.getSemaphore("sem")->currentCount == 0, "Counter decremented to 0");

    bool w2 = sm.wait(2, "sem", blocked);
    TEST_ASSERT(w2 == false && blocked == true, "T2 must block");
    TEST_ASSERT(sm.getSemaphore("sem")->currentCount == -1, "Counter is -1");
    TEST_ASSERT(sm.getSemaphore("sem")->waitingQueue.size() == 1, "T2 is queued");

    auto awakened = sm.signal(1, "sem");
    TEST_ASSERT(awakened.has_value() && awakened.value() == 2, "T2 must be awakened by signal");
    TEST_ASSERT(sm.getSemaphore("sem")->currentCount == 0, "Counter is now 0");

    auto awakened2 = sm.signal(2, "sem");
    TEST_ASSERT(!awakened2.has_value(), "No threads waiting");
    TEST_ASSERT(sm.getSemaphore("sem")->currentCount == 1, "Counter is back to 1");
}

// 5. Shared Memory Access & History Tests
void test_shared_memory() {
    SharedMemory sm;
    sm.declareVariable("counter", 10);
    TEST_ASSERT(sm.getValue("counter") == 10, "Initial value is 10");

    int64_t r = sm.read(1, "Worker-1", "counter", 1, 1);
    TEST_ASSERT(r == 10, "Read value matches");

    sm.write(2, "Worker-2", "counter", 25, 2, 2);
    TEST_ASSERT(sm.getValue("counter") == 25, "Updated value matches");
    TEST_ASSERT(sm.getMetadata("counter")->previousValue == 10, "Previous value is 10");
    TEST_ASSERT(sm.getMetadata("counter")->lastModifiedByThreadId == 2, "Last modified by T2");
    TEST_ASSERT(sm.getAccessHistory().size() == 2, "Two access records logged");
}

// 6. Test A: Race Condition with Lost Update
void test_race_condition_lost_update() {
    ExecutionEngine engine;
    auto scenario = ScenarioRegistry::instance().createScenario("race_counter_2");
    TEST_ASSERT(scenario != nullptr, "Scenario exists");

    scenario->setup(engine);
    engine.runToCompletion();

    // Verify lost update: expected 2, but interleaved reads produce 1
    int64_t finalCounter = engine.getSharedMemory().getValue("counter");
    TEST_ASSERT(finalCounter == 1, "Final counter must be 1 due to lost update");
    TEST_ASSERT(engine.getRaceDetector().hasRaceCondition(), "Race condition must be detected");

    const auto& conflicts = engine.getRaceDetector().getDetectedConflicts();
    TEST_ASSERT(!conflicts.empty(), "Conflicts list must not be empty");
    TEST_ASSERT(conflicts[0].conflictType == "LOST_UPDATE", "Conflict type must be LOST_UPDATE");
}

// 7. Test B: Mutex Protection Scenario
void test_mutex_protection_scenario() {
    ExecutionEngine engine;
    auto scenario = ScenarioRegistry::instance().createScenario("mutex_counter_2");
    TEST_ASSERT(scenario != nullptr, "Scenario exists");

    scenario->setup(engine);
    engine.runToCompletion();

    int64_t finalCounter = engine.getSharedMemory().getValue("counter");
    TEST_ASSERT(finalCounter == 2, "Final counter must be 2 when protected by mutex");
    TEST_ASSERT(!engine.getRaceDetector().hasRaceCondition(), "No race condition when synchronized");
}

// 8. Test C: Producer-Consumer Buffer Invariant
void test_producer_consumer_bounded_buffer() {
    ExecutionEngine engine;
    auto scenario = ScenarioRegistry::instance().createScenario("producer_consumer_3");
    TEST_ASSERT(scenario != nullptr, "Scenario exists");

    scenario->setup(engine);

    // Verify invariant at every single step!
    while (!engine.isCompleted()) {
        int64_t bufferCount = engine.getSharedMemory().getValue("buffer_count");
        TEST_ASSERT(bufferCount >= 0 && bufferCount <= 3, "Buffer count must remain within [0, 3]");
        if (!engine.step()) break;
    }

    TEST_ASSERT(engine.getSharedMemory().getValue("buffer_count") == 0, "All items consumed at end");
}

// 9. Test D: Deadlock Circular Wait Detection
void test_deadlock_detection_scenario() {
    ExecutionEngine engine;
    auto scenario = ScenarioRegistry::instance().createScenario("deadlock_circular_wait");
    TEST_ASSERT(scenario != nullptr, "Scenario exists");

    scenario->setup(engine);
    engine.runToCompletion();

    DeadlockReport report = engine.getDeadlockDetector().detectDeadlock(
        engine.getThreadManager(),
        engine.getMutexManager()
    );
    TEST_ASSERT(report.isDeadlocked == true, "Deadlock circular wait must be detected");
    TEST_ASSERT(report.deadlockedThreadIds.size() == 2, "Exactly 2 threads deadlocked");
    TEST_ASSERT(report.involvedResources.size() == 2, "Both Mutex_A and Mutex_B involved");
}

// 10. Test E: Deterministic Replay & State Restoration
void test_deterministic_replay_and_state_restoration() {
    ExecutionEngine engine;
    auto scenario = ScenarioRegistry::instance().createScenario("race_counter_2");
    scenario->setup(engine);
    engine.runToCompletion();

    size_t totalSteps = engine.getCurrentStep();
    TEST_ASSERT(totalSteps >= 6, "Must have recorded multiple execution steps");

    // Capture state at end
    int64_t finalVal = engine.getSharedMemory().getValue("counter");

    // Seek back to step 1
    engine.seek(1);
    TEST_ASSERT(engine.getCurrentStep() == 1, "Step position must be 1");
    // At step 1, only Worker-A has read counter, counter is still 0
    TEST_ASSERT(engine.getSharedMemory().getValue("counter") == 0, "Counter restored to 0 at step 1");

    // Seek back to final step
    engine.seek(totalSteps);
    TEST_ASSERT(engine.getCurrentStep() == totalSteps, "Step position restored to end");
    TEST_ASSERT(engine.getSharedMemory().getValue("counter") == finalVal, "Counter restored to final value");
}

int main() {
    std::cout << "=========================================\n";
    std::cout << "ConcurrencyLab Engine Test Suite (C++20)\n";
    std::cout << "=========================================\n\n";

    RUN_TEST(test_thread_state_transitions);
    RUN_TEST(test_scheduler_round_robin);
    RUN_TEST(test_mutex_blocking_and_wakeup);
    RUN_TEST(test_semaphore_counting_and_queuing);
    RUN_TEST(test_shared_memory);
    RUN_TEST(test_race_condition_lost_update);
    RUN_TEST(test_mutex_protection_scenario);
    RUN_TEST(test_producer_consumer_bounded_buffer);
    RUN_TEST(test_deadlock_detection_scenario);
    RUN_TEST(test_deterministic_replay_and_state_restoration);

    std::cout << "\n=========================================\n";
    std::cout << "Test Summary: " << g_passedTests << " Passed, " << g_failedTests << " Failed\n";
    std::cout << "=========================================\n";

    return (g_failedTests == 0) ? 0 : 1;
}
