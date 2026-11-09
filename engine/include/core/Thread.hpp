#pragma once

#include <cstdint>
#include <string>
#include <vector>
#include <unordered_map>
#include <optional>

namespace concurrency_lab {

enum class ThreadState {
    NEW,
    READY,
    RUNNING,
    BLOCKED,
    TERMINATED
};

inline std::string threadStateToString(ThreadState state) {
    switch (state) {
        case ThreadState::NEW: return "NEW";
        case ThreadState::READY: return "READY";
        case ThreadState::RUNNING: return "RUNNING";
        case ThreadState::BLOCKED: return "BLOCKED";
        case ThreadState::TERMINATED: return "TERMINATED";
        default: return "UNKNOWN";
    }
}

inline ThreadState stringToThreadState(const std::string& str) {
    if (str == "NEW") return ThreadState::NEW;
    if (str == "READY") return ThreadState::READY;
    if (str == "RUNNING") return ThreadState::RUNNING;
    if (str == "BLOCKED") return ThreadState::BLOCKED;
    return ThreadState::TERMINATED;
}

struct Thread {
    uint32_t id{0};
    std::string name;
    ThreadState state{ThreadState::NEW};
    size_t pc{0}; // Program Counter (instruction index)
    std::unordered_map<std::string, int64_t> registers;
    std::vector<std::string> heldMutexes;
    std::string blockedOn; // e.g. "mutex:m1" or "sem:empty"
    std::string color{"#6366F1"}; // Visualization thread color

    int64_t getRegister(const std::string& regName) const {
        auto it = registers.find(regName);
        if (it != registers.end()) return it->second;
        return 0;
    }

    void setRegister(const std::string& regName, int64_t value) {
        registers[regName] = value;
    }

    bool holdsMutex(const std::string& mutexName) const {
        for (const auto& m : heldMutexes) {
            if (m == mutexName) return true;
        }
        return false;
    }

    void addHeldMutex(const std::string& mutexName) {
        if (!holdsMutex(mutexName)) {
            heldMutexes.push_back(mutexName);
        }
    }

    void removeHeldMutex(const std::string& mutexName) {
        for (auto it = heldMutexes.begin(); it != heldMutexes.end(); ++it) {
            if (*it == mutexName) {
                heldMutexes.erase(it);
                break;
            }
        }
    }
};

} // namespace concurrency_lab
