#pragma once

#include "IScheduler.hpp"
#include <random>

namespace concurrency_lab {

class SeededRandomScheduler : public IScheduler {
public:
    explicit SeededRandomScheduler(uint32_t seed = 42) : seed_(seed), rng_(seed) {}

    std::optional<uint32_t> selectNextThread(
        const std::vector<uint32_t>& eligibleThreadIds,
        const ThreadManager& /*threadManager*/
    ) override {
        if (eligibleThreadIds.empty()) return std::nullopt;
        if (eligibleThreadIds.size() == 1) return eligibleThreadIds.front();

        std::uniform_int_distribution<size_t> dist(0, eligibleThreadIds.size() - 1);
        size_t chosenIdx = dist(rng_);
        return eligibleThreadIds[chosenIdx];
    }

    void onThreadStepped(uint32_t /*threadId*/) override {}
    void onThreadBlocked(uint32_t /*threadId*/) override {}
    void onThreadTerminated(uint32_t /*threadId*/) override {}

    void reset() override {
        rng_.seed(seed_);
    }

    void setSeed(uint32_t seed) {
        seed_ = seed;
        rng_.seed(seed_);
    }

    uint32_t getSeed() const { return seed_; }

    SchedulerType getType() const override {
        return SchedulerType::SEEDED_RANDOM;
    }

private:
    uint32_t seed_{42};
    std::mt19937 rng_;
};

} // namespace concurrency_lab
