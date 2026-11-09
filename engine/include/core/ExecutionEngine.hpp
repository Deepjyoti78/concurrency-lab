#pragma once

#include "ThreadManager.hpp"
#include "scheduler/IScheduler.hpp"
#include "scheduler/RoundRobinScheduler.hpp"
#include "memory/SharedMemory.hpp"
#include "synchronization/MutexManager.hpp"
#include "synchronization/SemaphoreManager.hpp"
#include "detection/RaceDetector.hpp"
#include "detection/DeadlockDetector.hpp"
#include "events/ExecutionEvent.hpp"
#include "events/SimulationSnapshot.hpp"

#include <memory>
#include <vector>
#include <string>
#include <optional>
#include <iostream>

namespace concurrency_lab {

class ExecutionEngine {
public:
    ExecutionEngine() {
        scheduler_ = std::make_unique<RoundRobinScheduler>(1);
    }

    void setScheduler(std::unique_ptr<IScheduler> scheduler) {
        scheduler_ = std::move(scheduler);
    }

    IScheduler* getScheduler() { return scheduler_.get(); }
    const IScheduler* getScheduler() const { return scheduler_.get(); }

    ThreadManager& getThreadManager() { return threadManager_; }
    const ThreadManager& getThreadManager() const { return threadManager_; }

    SharedMemory& getSharedMemory() { return sharedMemory_; }
    const SharedMemory& getSharedMemory() const { return sharedMemory_; }

    MutexManager& getMutexManager() { return mutexManager_; }
    const MutexManager& getMutexManager() const { return mutexManager_; }

    SemaphoreManager& getSemaphoreManager() { return semaphoreManager_; }
    const SemaphoreManager& getSemaphoreManager() const { return semaphoreManager_; }

    RaceDetector& getRaceDetector() { return raceDetector_; }
    const RaceDetector& getRaceDetector() const { return raceDetector_; }

    DeadlockDetector& getDeadlockDetector() { return deadlockDetector_; }
    const DeadlockDetector& getDeadlockDetector() const { return deadlockDetector_; }

    const std::vector<ExecutionEvent>& getEventHistory() const { return eventHistory_; }
    const std::vector<SimulationSnapshot>& getSnapshots() const { return snapshots_; }

    size_t getCurrentStep() const { return currentStep_; }
    bool isCompleted() const { return isCompleted_; }

    void captureInitialSnapshot() {
        if (snapshots_.empty()) {
            SimulationSnapshot snap;
            snap.sequence = 0;
            snap.timestamp = 0;
            snap.threads = threadManager_.getThreads();
            snap.readyQueue = threadManager_.getReadyQueue();
            snap.sharedVariables = sharedMemory_.getAllVariables();
            snap.memoryAccessHistory = sharedMemory_.getAccessHistory();
            snap.mutexes = mutexManager_.getAllMutexes();
            snap.semaphores = semaphoreManager_.getAllSemaphores();
            snap.raceAccessHistory = raceDetector_.getAccessHistory();
            snap.raceConflicts = raceDetector_.getDetectedConflicts();
            snap.deadlockReport = deadlockDetector_.getLastReport();
            snapshots_.push_back(snap);
        }
    }

    bool step() {
        if (isCompleted_) return false;

        captureInitialSnapshot();

        // 1. Check if all terminated
        if (threadManager_.allTerminated()) {
            isCompleted_ = true;
            return false;
        }

        // 2. Check if system is deadlocked (no eligible runnable threads, but active blocked threads exist)
        std::vector<uint32_t> eligible = threadManager_.getEligibleThreads();
        if (eligible.empty()) {
            deadlockDetector_.detectDeadlock(threadManager_, mutexManager_);
            isCompleted_ = true;
            return false;
        }

        // 3. Scheduler chooses next thread
        std::optional<uint32_t> scheduledId = scheduler_->selectNextThread(eligible, threadManager_);
        if (!scheduledId.has_value()) {
            return false;
        }

        uint32_t threadId = scheduledId.value();
        Thread* thread = threadManager_.getThread(threadId);
        const Program* program = threadManager_.getProgram(threadId);

        if (!thread || !program) return false;

        if (thread->pc >= program->size()) {
            threadManager_.transitionState(threadId, ThreadState::TERMINATED, "Completed all instructions");
            scheduler_->onThreadTerminated(threadId);
            return true;
        }

        const Instruction* instrPtr = program->getInstructionAt(thread->pc);
        if (!instrPtr) return false;
        Instruction instr = *instrPtr;

        // Prepare event
        ExecutionEvent event;
        event.sequence = currentStep_ + 1;
        event.timestamp = timestamp_ + 1;
        event.threadId = threadId;
        event.threadName = thread->name;
        event.instruction = instr;
        event.previousThreadState = thread->state;
        event.previousPc = thread->pc;

        thread->state = ThreadState::RUNNING;

        bool advancePc = true;
        std::string explanation;

        // 4. Instruction execution
        switch (instr.opcode) {
            case Opcode::NOOP:
                explanation = "Executed NOOP (no operation).";
                break;

            case Opcode::YIELD:
                explanation = "Voluntarily yielded remaining quantum.";
                break;

            case Opcode::LOAD_CONST: {
                thread->setRegister(instr.arg1, instr.immediate);
                explanation = "Loaded immediate value " + std::to_string(instr.immediate) + " into register " + instr.arg1 + ".";
                break;
            }

            case Opcode::READ_SHARED: {
                int64_t val = sharedMemory_.read(threadId, thread->name, instr.arg1, event.timestamp, event.sequence);
                thread->setRegister(instr.arg2, val);

                MemoryDelta delta;
                delta.variable = instr.arg1;
                delta.oldValue = val;
                delta.newValue = val;
                delta.type = "READ";
                event.memoryDeltas.push_back(delta);

                explanation = "Read shared variable '" + instr.arg1 + "' (value: " + std::to_string(val) + 
                    ") into register " + instr.arg2 + ".";

                auto conflict = raceDetector_.recordAndCheckAccess(
                    threadId, thread->name, instr.arg1, MemoryAccessType::READ, val,
                    thread->heldMutexes, event.sequence, event.timestamp
                );
                if (conflict.has_value()) {
                    event.raceDetected = true;
                    event.raceDetails = conflict;
                }
                break;
            }

            case Opcode::WRITE_SHARED: {
                int64_t writeVal = 0;
                if (!instr.arg2.empty()) {
                    writeVal = thread->getRegister(instr.arg2);
                } else {
                    writeVal = instr.immediate;
                }

                int64_t oldVal = sharedMemory_.getValue(instr.arg1);
                sharedMemory_.write(threadId, thread->name, instr.arg1, writeVal, event.timestamp, event.sequence);

                MemoryDelta delta;
                delta.variable = instr.arg1;
                delta.oldValue = oldVal;
                delta.newValue = writeVal;
                delta.type = "WRITE";
                event.memoryDeltas.push_back(delta);

                explanation = "Wrote value " + std::to_string(writeVal) + " from " + 
                    (instr.arg2.empty() ? "immediate" : ("register " + instr.arg2)) + 
                    " to shared variable '" + instr.arg1 + "'.";

                auto conflict = raceDetector_.recordAndCheckAccess(
                    threadId, thread->name, instr.arg1, MemoryAccessType::WRITE, writeVal,
                    thread->heldMutexes, event.sequence, event.timestamp
                );
                if (conflict.has_value()) {
                    event.raceDetected = true;
                    event.raceDetails = conflict;
                }
                break;
            }

            case Opcode::ADD: {
                int64_t v1 = thread->getRegister(instr.arg1);
                int64_t v2 = thread->getRegister(instr.arg2);
                thread->setRegister(instr.arg1, v1 + v2);
                explanation = "Computed " + instr.arg1 + " = " + std::to_string(v1) + " + " + std::to_string(v2) + 
                    " (" + std::to_string(v1 + v2) + ").";
                break;
            }

            case Opcode::ADD_IMM: {
                int64_t v1 = thread->getRegister(instr.arg1);
                int64_t result = v1 + instr.immediate;
                thread->setRegister(instr.arg1, result);
                explanation = "Locally incremented " + instr.arg1 + " (" + std::to_string(v1) + 
                    " + " + std::to_string(instr.immediate) + " = " + std::to_string(result) + ").";
                break;
            }

            case Opcode::SUB: {
                int64_t v1 = thread->getRegister(instr.arg1);
                int64_t v2 = thread->getRegister(instr.arg2);
                thread->setRegister(instr.arg1, v1 - v2);
                explanation = "Computed " + instr.arg1 + " = " + std::to_string(v1) + " - " + std::to_string(v2) + 
                    " (" + std::to_string(v1 - v2) + ").";
                break;
            }

            case Opcode::SUB_IMM: {
                int64_t v1 = thread->getRegister(instr.arg1);
                int64_t result = v1 - instr.immediate;
                thread->setRegister(instr.arg1, result);
                explanation = "Locally decremented " + instr.arg1 + " (" + std::to_string(v1) + 
                    " - " + std::to_string(instr.immediate) + " = " + std::to_string(result) + ").";
                break;
            }

            case Opcode::MUTEX_LOCK: {
                bool blocked = false;
                bool acquired = mutexManager_.lock(threadId, thread->name, instr.arg1, blocked);

                event.synchronization.type = "MUTEX";
                event.synchronization.resourceName = instr.arg1;

                if (acquired) {
                    thread->addHeldMutex(instr.arg1);
                    event.synchronization.action = "LOCK_SUCCESS";
                    event.synchronization.success = true;
                    explanation = "Successfully acquired mutex '" + instr.arg1 + "'. Thread entered critical section.";
                } else if (blocked) {
                    event.synchronization.action = "LOCK_BLOCKED";
                    event.synchronization.success = false;
                    threadManager_.transitionState(threadId, ThreadState::BLOCKED, "mutex:" + instr.arg1);
                    scheduler_->onThreadBlocked(threadId);
                    advancePc = false; // Stay on LOCK instruction until awakened!
                    explanation = "Mutex '" + instr.arg1 + "' is currently held. Thread is BLOCKED and placed in mutex wait queue.";
                }
                break;
            }

            case Opcode::MUTEX_UNLOCK: {
                event.synchronization.type = "MUTEX";
                event.synchronization.resourceName = instr.arg1;
                event.synchronization.action = "UNLOCK";

                thread->removeHeldMutex(instr.arg1);
                auto awakened = mutexManager_.unlock(threadId, instr.arg1);

                if (awakened.has_value()) {
                    uint32_t wId = awakened.value();
                    Thread* wThread = threadManager_.getThread(wId);
                    if (wThread) {
                        wThread->addHeldMutex(instr.arg1);
                        threadManager_.transitionState(wId, ThreadState::READY);
                        wThread->pc++; // Advance the unblocked thread past its lock instruction
                    }
                    event.synchronization.unblockedThreadId = wId;
                    explanation = "Unlocked mutex '" + instr.arg1 + "'. Transferred lock ownership and awakened waiting thread '" + 
                        (wThread ? wThread->name : std::to_string(wId)) + "'.";
                } else {
                    explanation = "Unlocked mutex '" + instr.arg1 + "'. Mutex is now free.";
                }
                break;
            }

            case Opcode::SEM_WAIT: {
                bool blocked = false;
                bool passed = semaphoreManager_.wait(threadId, instr.arg1, blocked);

                event.synchronization.type = "SEMAPHORE";
                event.synchronization.resourceName = instr.arg1;

                const Semaphore* sem = semaphoreManager_.getSemaphore(instr.arg1);
                int32_t cnt = sem ? sem->currentCount : 0;

                if (passed) {
                    event.synchronization.action = "WAIT_SUCCESS";
                    event.synchronization.success = true;
                    explanation = "Semaphore '" + instr.arg1 + "' wait() succeeded (counter decremented to " + 
                        std::to_string(cnt) + "). Thread continues.";
                } else {
                    event.synchronization.action = "WAIT_BLOCKED";
                    event.synchronization.success = false;
                    threadManager_.transitionState(threadId, ThreadState::BLOCKED, "sem:" + instr.arg1);
                    scheduler_->onThreadBlocked(threadId);
                    advancePc = false;
                    explanation = "Semaphore '" + instr.arg1 + "' wait() blocked (counter decremented to " + 
                        std::to_string(cnt) + "). Thread is queued in semaphore wait list.";
                }
                break;
            }

            case Opcode::SEM_SIGNAL: {
                event.synchronization.type = "SEMAPHORE";
                event.synchronization.resourceName = instr.arg1;
                event.synchronization.action = "SIGNAL";

                auto awakened = semaphoreManager_.signal(threadId, instr.arg1);
                const Semaphore* sem = semaphoreManager_.getSemaphore(instr.arg1);
                int32_t cnt = sem ? sem->currentCount : 0;

                if (awakened.has_value()) {
                    uint32_t wId = awakened.value();
                    Thread* wThread = threadManager_.getThread(wId);
                    if (wThread) {
                        threadManager_.transitionState(wId, ThreadState::READY);
                        wThread->pc++; // Advance past wait instruction
                    }
                    event.synchronization.unblockedThreadId = wId;
                    explanation = "Semaphore '" + instr.arg1 + "' signal() awakened thread '" + 
                        (wThread ? wThread->name : std::to_string(wId)) + "' (counter is now " + std::to_string(cnt) + ").";
                } else {
                    explanation = "Semaphore '" + instr.arg1 + "' signal() incremented counter to " + std::to_string(cnt) + ".";
                }
                break;
            }

            case Opcode::PRODUCE_ITEM:
                explanation = "Produced new data packet into bounded buffer queue.";
                break;

            case Opcode::CONSUME_ITEM:
                explanation = "Consumed data packet from bounded buffer queue.";
                break;

            case Opcode::PHIL_THINK:
                explanation = "Philosopher is contemplating (THINKING).";
                break;

            case Opcode::PHIL_EAT:
                explanation = "Philosopher acquired both forks and is now EATING.";
                break;

            case Opcode::CUSTOM_ACTION:
                explanation = instr.description;
                break;
        }

        // Advance PC if not blocked
        if (advancePc) {
            thread->pc++;
            if (thread->state == ThreadState::RUNNING) {
                thread->state = ThreadState::READY;
            }
        }

        // Check if thread reached end of program
        if (thread->pc >= program->size()) {
            threadManager_.transitionState(threadId, ThreadState::TERMINATED, "Completed all instructions");
            scheduler_->onThreadTerminated(threadId);
        }

        event.newThreadState = thread->state;
        event.newPc = thread->pc;
        event.explanation = explanation;

        // Check deadlock detection
        DeadlockReport dReport = deadlockDetector_.detectDeadlock(threadManager_, mutexManager_);
        if (dReport.isDeadlocked) {
            event.deadlockDetected = true;
            event.deadlockDetails = dReport;
        }

        // Scheduler bookkeeping
        scheduler_->onThreadStepped(threadId);

        // Record event and update step counters
        currentStep_++;
        timestamp_++;
        eventHistory_.push_back(event);

        // Record snapshot
        SimulationSnapshot snap;
        snap.sequence = currentStep_;
        snap.timestamp = timestamp_;
        snap.threads = threadManager_.getThreads();
        snap.readyQueue = threadManager_.getReadyQueue();
        snap.sharedVariables = sharedMemory_.getAllVariables();
        snap.memoryAccessHistory = sharedMemory_.getAccessHistory();
        snap.mutexes = mutexManager_.getAllMutexes();
        snap.semaphores = semaphoreManager_.getAllSemaphores();
        snap.raceAccessHistory = raceDetector_.getAccessHistory();
        snap.raceConflicts = raceDetector_.getDetectedConflicts();
        snap.deadlockReport = dReport;
        snapshots_.push_back(snap);

        if (threadManager_.allTerminated()) {
            isCompleted_ = true;
        }

        return true;
    }

    bool stepBack() {
        if (currentStep_ == 0 || snapshots_.size() <= 1) return false;
        seek(currentStep_ - 1);
        return true;
    }

    void seek(size_t targetStep) {
        if (targetStep >= snapshots_.size()) return;

        const SimulationSnapshot& snap = snapshots_[targetStep];
        threadManager_.restoreThreads(snap.threads, snap.readyQueue);
        sharedMemory_.restore(snap.sharedVariables, snap.memoryAccessHistory);
        mutexManager_.restore(snap.mutexes);
        semaphoreManager_.restore(snap.semaphores);
        raceDetector_.restore(snap.raceAccessHistory, snap.raceConflicts);

        currentStep_ = targetStep;
        timestamp_ = snap.timestamp;
        isCompleted_ = threadManager_.allTerminated();
    }

    void runToCompletion(size_t maxSteps = 2000) {
        while (!isCompleted_ && currentStep_ < maxSteps) {
            if (!step()) break;
        }
    }

    void reset() {
        if (!snapshots_.empty()) {
            seek(0);
        }
        eventHistory_.clear();
        snapshots_.clear();
        currentStep_ = 0;
        timestamp_ = 0;
        isCompleted_ = false;
        raceDetector_.reset();
        deadlockDetector_.reset();
        if (scheduler_) scheduler_->reset();
        captureInitialSnapshot();
    }

private:
    ThreadManager threadManager_;
    std::unique_ptr<IScheduler> scheduler_;
    SharedMemory sharedMemory_;
    MutexManager mutexManager_;
    SemaphoreManager semaphoreManager_;
    RaceDetector raceDetector_;
    DeadlockDetector deadlockDetector_;

    std::vector<ExecutionEvent> eventHistory_;
    std::vector<SimulationSnapshot> snapshots_;
    size_t currentStep_{0};
    uint64_t timestamp_{0};
    bool isCompleted_{false};
};

} // namespace concurrency_lab
