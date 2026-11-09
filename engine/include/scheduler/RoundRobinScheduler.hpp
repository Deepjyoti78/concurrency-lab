#pragma once

#include "IScheduler.hpp"

namespace concurrency_lab {

class RoundRobinScheduler : public IScheduler {
public:
    explicit RoundRobinScheduler(uint32_t quantum = 1) : quantum_(quantum), remainingQuantum_(quantum) {}

    std::optional<uint32_t> selectNextThread(
        const std::vector<uint32_t>& eligibleThreadIds,
        const ThreadManager& /*threadManager*/
    ) override {
        if (eligibleThreadIds.empty()) return std::nullopt;

        // If current thread has remaining quantum and is still eligible, keep it
        if (currentThreadId_.has_value() && remainingQuantum_ > 0) {
            for (uint32_t id : eligibleThreadIds) {
                if (id == currentThreadId_.value()) {
                    return id;
                }
            }
        }

        // Advance to next eligible thread
        if (!currentThreadId_.has_value()) {
            currentIndex_ = 0;
        } else {
            // Find current thread in list
            size_t foundIdx = 0;
            bool found = false;
            for (size_t i = 0; i < eligibleThreadIds.size(); ++i) {
                if (eligibleThreadIds[i] == currentThreadId_.value()) {
                    foundIdx = i;
                    found = true;
                    break;
                }
            }
            if (found) {
                currentIndex_ = (foundIdx + 1) % eligibleThreadIds.size();
            } else {
                currentIndex_ = 0;
            }
        }

        currentThreadId_ = eligibleThreadIds[currentIndex_ % eligibleThreadIds.size()];
        remainingQuantum_ = quantum_;
        return currentThreadId_;
    }

    void onThreadStepped(uint32_t threadId) override {
        if (currentThreadId_ == threadId && remainingQuantum_ > 0) {
            remainingQuantum_--;
        }
    }

    void onThreadBlocked(uint32_t threadId) override {
        if (currentThreadId_ == threadId) {
            currentThreadId_ = std::nullopt;
            remainingQuantum_ = 0;
        }
    }

    void onThreadTerminated(uint32_t threadId) override {
        if (currentThreadId_ == threadId) {
            currentThreadId_ = std::nullopt;
            remainingQuantum_ = 0;
        }
    }

    void reset() override {
        currentThreadId_ = std::nullopt;
        currentIndex_ = 0;
        remainingQuantum_ = quantum_;
    }

    SchedulerType getType() const override {
        return SchedulerType::ROUND_ROBIN;
    }

    void setQuantum(uint32_t q) {
        quantum_ = (q > 0) ? q : 1;
        remainingQuantum_ = quantum_;
    }

    uint32_t getQuantum() const { return quantum_; }

private:
    uint32_t quantum_{1};
    uint32_t remainingQuantum_{1};
    size_t currentIndex_{0};
    std::optional<uint32_t> currentThreadId_{std::nullopt};
};

} // namespace concurrency_lab
