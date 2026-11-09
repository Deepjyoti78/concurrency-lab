#pragma once

#include "core/Thread.hpp"
#include "memory/SharedMemory.hpp"
#include "synchronization/Mutex.hpp"
#include "synchronization/Semaphore.hpp"
#include "detection/RaceDetector.hpp"
#include "detection/DeadlockDetector.hpp"
#include <unordered_map>
#include <vector>
#include <deque>

namespace concurrency_lab {

struct SimulationSnapshot {
    size_t sequence{0};
    uint64_t timestamp{0};
    std::unordered_map<uint32_t, Thread> threads;
    std::deque<uint32_t> readyQueue;
    std::unordered_map<std::string, VariableMetadata> sharedVariables;
    std::vector<MemoryAccessRecord> memoryAccessHistory;
    std::unordered_map<std::string, Mutex> mutexes;
    std::unordered_map<std::string, Semaphore> semaphores;
    std::unordered_map<std::string, std::vector<VariableAccessInfo>> raceAccessHistory;
    std::vector<RaceConflict> raceConflicts;
    DeadlockReport deadlockReport;
};

} // namespace concurrency_lab
