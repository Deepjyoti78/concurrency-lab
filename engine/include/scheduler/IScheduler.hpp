#pragma once

#include "core/ThreadManager.hpp"
#include <string>
#include <vector>
#include <cstdint>
#include <optional>

namespace concurrency_lab {

enum class SchedulerType {
    ROUND_ROBIN,
    FIFO,
    MANUAL,
    SEEDED_RANDOM
};

inline std::string schedulerTypeToString(SchedulerType type) {
    switch (type) {
        case SchedulerType::ROUND_ROBIN: return "ROUND_ROBIN";
        case SchedulerType::FIFO: return "FIFO";
        case SchedulerType::MANUAL: return "MANUAL";
        case SchedulerType::SEEDED_RANDOM: return "SEEDED_RANDOM";
        default: return "UNKNOWN";
    }
}

class IScheduler {
public:
    virtual ~IScheduler() = default;

    // Returns the ID of the thread to execute next, or std::nullopt if none is ready
    virtual std::optional<uint32_t> selectNextThread(
        const std::vector<uint32_t>& eligibleThreadIds,
        const ThreadManager& threadManager
    ) = 0;

    virtual void onThreadStepped(uint32_t threadId) = 0;
    virtual void onThreadBlocked(uint32_t threadId) = 0;
    virtual void onThreadTerminated(uint32_t threadId) = 0;
    virtual void reset() = 0;
    virtual SchedulerType getType() const = 0;
};

} // namespace concurrency_lab
