#pragma once

#include "memory/MemoryAccess.hpp"
#include <string>
#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <optional>

namespace concurrency_lab {

struct VariableAccessInfo {
    uint32_t threadId{0};
    std::string threadName;
    MemoryAccessType type{MemoryAccessType::READ};
    size_t sequence{0};
    uint64_t timestamp{0};
    int64_t value{0};
    std::vector<std::string> heldLocks;
};

struct RaceConflict {
    std::string variable;
    uint32_t firstThreadId{0};
    std::string firstThreadName;
    MemoryAccessType firstAccessType{MemoryAccessType::READ};
    int64_t firstValue{0};

    uint32_t secondThreadId{0};
    std::string secondThreadName;
    MemoryAccessType secondAccessType{MemoryAccessType::WRITE};
    int64_t secondValue{0};

    std::string conflictType; // "LOST_UPDATE", "UNSYNCHRONIZED_WRITE", "UNSYNCHRONIZED_READ"
    std::string explanation;
    std::string remediation;
    size_t sequence{0};
};

class RaceDetector {
public:
    RaceDetector() = default;

    // Checks an access for potential race conditions against prior accesses
    std::optional<RaceConflict> recordAndCheckAccess(
        uint32_t threadId,
        const std::string& threadName,
        const std::string& variable,
        MemoryAccessType accessType,
        int64_t value,
        const std::vector<std::string>& heldLocks,
        size_t sequence,
        uint64_t timestamp
    ) {
        VariableAccessInfo currentAccess;
        currentAccess.threadId = threadId;
        currentAccess.threadName = threadName;
        currentAccess.type = accessType;
        currentAccess.sequence = sequence;
        currentAccess.timestamp = timestamp;
        currentAccess.value = value;
        currentAccess.heldLocks = heldLocks;

        auto& history = accessHistory_[variable];
        std::optional<RaceConflict> conflict = std::nullopt;

        // Inspect previous accesses to this variable
        for (auto it = history.rbegin(); it != history.rend(); ++it) {
            const auto& prev = *it;
            if (prev.threadId == threadId) {
                continue; // Same thread access is not a race
            }

            // Check if they share any common held lock
            bool shareCommonLock = false;
            for (const auto& l1 : heldLocks) {
                for (const auto& l2 : prev.heldLocks) {
                    if (l1 == l2) {
                        shareCommonLock = true;
                        break;
                    }
                }
                if (shareCommonLock) break;
            }

            if (shareCommonLock) {
                // Properly synchronized by mutual exclusion
                continue;
            }

            // If at least one is a WRITE and no common lock is held -> Race condition!
            if (accessType == MemoryAccessType::WRITE || prev.type == MemoryAccessType::WRITE) {
                RaceConflict c;
                c.variable = variable;
                c.firstThreadId = prev.threadId;
                c.firstThreadName = prev.threadName;
                c.firstAccessType = prev.type;
                c.firstValue = prev.value;
                c.secondThreadId = threadId;
                c.secondThreadName = threadName;
                c.secondAccessType = accessType;
                c.secondValue = value;
                c.sequence = sequence;

                if (prev.type == MemoryAccessType::READ && accessType == MemoryAccessType::WRITE) {
                    // Check if second thread read a stale value before first thread's write
                    // E.g., T1 reads 0, T2 reads 0, T1 writes 1, T2 writes 1 => Lost update!
                    bool foundStaleRead = false;
                    for (const auto& prior : history) {
                        if (prior.threadId == threadId && prior.type == MemoryAccessType::READ) {
                            if (prior.value == prev.value) {
                                foundStaleRead = true;
                                break;
                            }
                        }
                    }

                    if (foundStaleRead) {
                        c.conflictType = "LOST_UPDATE";
                        c.explanation = "Lost Update detected: Thread '" + threadName + 
                            "' wrote " + std::to_string(value) + " to '" + variable + 
                            "' based on a stale read (" + std::to_string(prev.value) + 
                            ") while Thread '" + prev.threadName + "' also modified it, overwriting prior work!";
                    } else {
                        c.conflictType = "UNSYNCHRONIZED_WRITE";
                        c.explanation = "Unsynchronized Write: Thread '" + threadName + 
                            "' wrote to '" + variable + "' while Thread '" + prev.threadName + 
                            "' previously accessed it without mutual exclusion lock protection.";
                    }
                } else if (prev.type == MemoryAccessType::WRITE && accessType == MemoryAccessType::READ) {
                    c.conflictType = "UNSYNCHRONIZED_READ";
                    c.explanation = "Unsynchronized Read: Thread '" + threadName + 
                        "' read '" + variable + "' without acquiring a lock, observing uncoordinated state from Thread '" + 
                        prev.threadName + "'.";
                } else {
                    c.conflictType = "UNSYNCHRONIZED_WRITE";
                    c.explanation = "Concurrent Write Hazard: Thread '" + threadName + 
                        "' and Thread '" + prev.threadName + "' wrote to '" + variable + 
                        "' with no common mutex held.";
                }

                c.remediation = "Acquire a mutex lock (e.g. mtx.lock()) before reading or modifying '" + 
                    variable + "' and release it after writing (mtx.unlock()).";

                detectedConflicts_.push_back(c);
                conflict = c;
                break;
            }
        }

        history.push_back(currentAccess);
        return conflict;
    }

    const std::vector<RaceConflict>& getDetectedConflicts() const {
        return detectedConflicts_;
    }

    bool hasRaceCondition() const {
        return !detectedConflicts_.empty();
    }

    void reset() {
        accessHistory_.clear();
        detectedConflicts_.clear();
    }

    void restore(const std::unordered_map<std::string, std::vector<VariableAccessInfo>>& history,
                 const std::vector<RaceConflict>& conflicts) {
        accessHistory_ = history;
        detectedConflicts_ = conflicts;
    }

    const std::unordered_map<std::string, std::vector<VariableAccessInfo>>& getAccessHistory() const {
        return accessHistory_;
    }

private:
    std::unordered_map<std::string, std::vector<VariableAccessInfo>> accessHistory_;
    std::vector<RaceConflict> detectedConflicts_;
};

} // namespace concurrency_lab
