#pragma once

#include "IScheduler.hpp"

namespace concurrency_lab {

class ManualScheduler : public IScheduler {
public:
    ManualScheduler() = default;

    void setNextThread(uint32_t threadId) {
        manualNextThreadId_ = threadId;
    }

    std::optional<uint32_t> selectNextThread(
        const std::vector<uint32_t>& eligibleThreadIds,
        const ThreadManager& /*threadManager*/
    ) override {
        if (eligibleThreadIds.empty()) return std::nullopt;

        if (manualNextThreadId_.has_value()) {
            uint32_t target = manualNextThreadId_.value();
            manualNextThreadId_ = std::nullopt; // Consume manual choice
            for (uint32_t id : eligibleThreadIds) {
                if (id == target) {
                    return id;
                }
            }
        }

        // Fallback: first eligible
        return eligibleThreadIds.front();
    }

    void onThreadStepped(uint32_t /*threadId*/) override {}
    void onThreadBlocked(uint32_t /*threadId*/) override {}
    void onThreadTerminated(uint32_t /*threadId*/) override {}

    void reset() override {
        manualNextThreadId_ = std::nullopt;
    }

    SchedulerType getType() const override {
        return SchedulerType::MANUAL;
    }

private:
    std::optional<uint32_t> manualNextThreadId_{std::nullopt};
};

} // namespace concurrency_lab
