#pragma once

#include <string>
#include <deque>
#include <optional>
#include <cstdint>

namespace concurrency_lab {

struct Mutex {
    std::string name;
    bool locked{false};
    std::optional<uint32_t> ownerThreadId{std::nullopt};
    std::string ownerThreadName;
    std::deque<uint32_t> waitingQueue;
    size_t acquisitionCount{0};
    size_t contentionCount{0};
};

} // namespace concurrency_lab
