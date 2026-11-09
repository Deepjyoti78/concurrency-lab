#pragma once

#include "core/Instruction.hpp"
#include "core/Thread.hpp"
#include "memory/MemoryAccess.hpp"
#include "detection/RaceDetector.hpp"
#include "detection/DeadlockDetector.hpp"
#include <string>
#include <vector>
#include <optional>

namespace concurrency_lab {

struct MemoryDelta {
    std::string variable;
    int64_t oldValue{0};
    int64_t newValue{0};
    std::string type; // "READ" or "WRITE"
};

struct SynchronizationInfo {
    std::string type{"NONE"}; // "NONE", "MUTEX", "SEMAPHORE", "BUFFER"
    std::string resourceName;
    std::string action; // "LOCK_SUCCESS", "LOCK_BLOCKED", "UNLOCK", "WAIT_SUCCESS", "WAIT_BLOCKED", "SIGNAL"
    bool success{true};
    std::optional<uint32_t> unblockedThreadId{std::nullopt};
};

struct ExecutionEvent {
    size_t sequence{0};
    uint64_t timestamp{0};
    uint32_t threadId{0};
    std::string threadName;
    Instruction instruction;
    
    ThreadState previousThreadState{ThreadState::READY};
    size_t previousPc{0};

    ThreadState newThreadState{ThreadState::RUNNING};
    size_t newPc{0};

    std::vector<MemoryDelta> memoryDeltas;
    SynchronizationInfo synchronization;

    bool raceDetected{false};
    std::optional<RaceConflict> raceDetails{std::nullopt};

    bool deadlockDetected{false};
    std::optional<DeadlockReport> deadlockDetails{std::nullopt};

    std::string explanation; // Detailed contextual description of what happened in this step
};

} // namespace concurrency_lab
