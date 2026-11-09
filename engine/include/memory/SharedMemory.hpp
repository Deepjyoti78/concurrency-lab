#pragma once

#include "MemoryAccess.hpp"
#include <unordered_map>
#include <vector>
#include <string>
#include <optional>

namespace concurrency_lab {

struct VariableMetadata {
    int64_t value{0};
    int64_t previousValue{0};
    uint32_t lastModifiedByThreadId{0};
    uint64_t lastModifiedTimestamp{0};
    size_t writeCount{0};
    size_t readCount{0};
};

class SharedMemory {
public:
    SharedMemory() = default;

    void declareVariable(const std::string& name, int64_t initialValue = 0) {
        VariableMetadata meta;
        meta.value = initialValue;
        meta.previousValue = initialValue;
        variables_[name] = meta;
    }

    bool hasVariable(const std::string& name) const {
        return variables_.find(name) != variables_.end();
    }

    int64_t read(uint32_t threadId, const std::string& threadName, const std::string& name, uint64_t timestamp, size_t sequence) {
        auto it = variables_.find(name);
        if (it == variables_.end()) {
            declareVariable(name, 0);
            it = variables_.find(name);
        }

        it->second.readCount++;

        MemoryAccessRecord record;
        record.sequence = sequence;
        record.timestamp = timestamp;
        record.threadId = threadId;
        record.threadName = threadName;
        record.variable = name;
        record.type = MemoryAccessType::READ;
        record.value = it->second.value;
        record.previousValue = it->second.previousValue;

        accessHistory_.push_back(record);
        return it->second.value;
    }

    void write(uint32_t threadId, const std::string& threadName, const std::string& name, int64_t value, uint64_t timestamp, size_t sequence) {
        auto it = variables_.find(name);
        if (it == variables_.end()) {
            declareVariable(name, 0);
            it = variables_.find(name);
        }

        it->second.previousValue = it->second.value;
        it->second.value = value;
        it->second.lastModifiedByThreadId = threadId;
        it->second.lastModifiedTimestamp = timestamp;
        it->second.writeCount++;

        MemoryAccessRecord record;
        record.sequence = sequence;
        record.timestamp = timestamp;
        record.threadId = threadId;
        record.threadName = threadName;
        record.variable = name;
        record.type = MemoryAccessType::WRITE;
        record.value = value;
        record.previousValue = it->second.previousValue;

        accessHistory_.push_back(record);
    }

    int64_t getValue(const std::string& name) const {
        auto it = variables_.find(name);
        if (it != variables_.end()) return it->second.value;
        return 0;
    }

    const VariableMetadata* getMetadata(const std::string& name) const {
        auto it = variables_.find(name);
        if (it != variables_.end()) return &it->second;
        return nullptr;
    }

    const std::unordered_map<std::string, VariableMetadata>& getAllVariables() const {
        return variables_;
    }

    const std::vector<MemoryAccessRecord>& getAccessHistory() const {
        return accessHistory_;
    }

    void restore(const std::unordered_map<std::string, VariableMetadata>& vars, const std::vector<MemoryAccessRecord>& history) {
        variables_ = vars;
        accessHistory_ = history;
    }

private:
    std::unordered_map<std::string, VariableMetadata> variables_;
    std::vector<MemoryAccessRecord> accessHistory_;
};

} // namespace concurrency_lab
