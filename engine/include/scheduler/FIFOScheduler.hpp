#pragma once

#include "IScheduler.hpp"

namespace concurrency_lab {

class FIFOScheduler : public IScheduler {
public:
    FIFOScheduler() = default;

    std::optional<uint32_t> selectNextThread(
        const std::vector<uint32_t>& eligibleThreadIds,
        const ThreadManager& /*threadManager*/
    ) override {
        if (eligibleThreadIds.empty()) return std::nullopt;

        // If current thread is still eligible, keep running it (non-preemptive FIFO)
        if (currentThreadId_.has_value()) {
            for (uint32_t id : eligibleThreadIds) {
                if (id == currentThreadId_.value()) {
                    return id;
                }
            }
        }

        // Otherwise pick the first eligible thread
        currentThreadId_ = eligibleThreadIds.front();
        return currentThreadId_;
    }

    void onThreadStepped(uint32_t /*threadId*/) override {}

    void onThreadBlocked(uint32_t threadId) override {
        if (currentThreadId_ == threadId) {
            currentThreadId_ = std::nullopt;
        }
    }

    void onThreadTerminated(uint32_t threadId) override {
        if (currentThreadId_ == threadId) {
            currentThreadId_ = std::nullopt;
        }
    }

    void reset() override {
        currentThreadId_ = std::nullopt;
    }

    SchedulerType getType() const override {
        return SchedulerType::FIFO;
    }

private:
    std::optional<uint32_t> currentThreadId_{std::nullopt};
};

} // namespace concurrency_lab
