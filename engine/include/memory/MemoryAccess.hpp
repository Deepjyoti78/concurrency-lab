#pragma once

#include <cstdint>
#include <string>

namespace concurrency_lab {

enum class MemoryAccessType {
    READ,
    WRITE
};

inline std::string memoryAccessTypeToString(MemoryAccessType type) {
    return (type == MemoryAccessType::READ) ? "READ" : "WRITE";
}

struct MemoryAccessRecord {
    size_t sequence{0};
    uint64_t timestamp{0};
    uint32_t threadId{0};
    std::string threadName;
    std::string variable;
    MemoryAccessType type{MemoryAccessType::READ};
    int64_t value{0};
    int64_t previousValue{0};
};

} // namespace concurrency_lab
