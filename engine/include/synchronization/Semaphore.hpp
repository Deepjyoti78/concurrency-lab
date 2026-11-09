#pragma once

#include <string>
#include <deque>
#include <cstdint>

namespace concurrency_lab {

struct Semaphore {
    std::string name;
    int32_t initialCount{0};
    int32_t currentCount{0};
    std::deque<uint32_t> waitingQueue;
    size_t waitOpsCount{0};
    size_t signalOpsCount{0};
};

} // namespace concurrency_lab
