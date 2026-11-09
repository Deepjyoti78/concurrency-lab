#pragma once

#include "Mutex.hpp"
#include <unordered_map>
#include <string>
#include <vector>
#include <optional>
#include <stdexcept>

namespace concurrency_lab {

class MutexManager {
public:
    MutexManager() = default;

    void declareMutex(const std::string& name) {
        if (mutexes_.find(name) == mutexes_.end()) {
            Mutex m;
            m.name = name;
            mutexes_[name] = m;
        }
    }

    bool hasMutex(const std::string& name) const {
        return mutexes_.find(name) != mutexes_.end();
    }

    const Mutex* getMutex(const std::string& name) const {
        auto it = mutexes_.find(name);
        if (it != mutexes_.end()) return &it->second;
        return nullptr;
    }

    // Attempt to lock.
    // Returns: true if acquired immediately, false if thread must be blocked.
    bool lock(uint32_t threadId, const std::string& threadName, const std::string& name, bool& outBlocked) {
        declareMutex(name);
        Mutex& m = mutexes_[name];

        if (!m.locked) {
            m.locked = true;
            m.ownerThreadId = threadId;
            m.ownerThreadName = threadName;
            m.acquisitionCount++;
            outBlocked = false;
            return true;
        }

        if (m.ownerThreadId == threadId) {
            // Already owned by this thread (non-reentrant)
            outBlocked = false;
            return true;
        }

        // Lock is contended
        m.contentionCount++;
        m.waitingQueue.push_back(threadId);
        outBlocked = true;
        return false;
    }

    // Unlock operation.
    // Returns std::optional<uint32_t> of thread awakened (if any waiting)
    std::optional<uint32_t> unlock(uint32_t threadId, const std::string& name) {
        auto it = mutexes_.find(name);
        if (it == mutexes_.end()) return std::nullopt;

        Mutex& m = it->second;
        if (!m.locked || m.ownerThreadId != threadId) {
            // Not held by this thread
            return std::nullopt;
        }

        if (!m.waitingQueue.empty()) {
            uint32_t nextOwner = m.waitingQueue.front();
            m.waitingQueue.pop_front();
            m.ownerThreadId = nextOwner;
            m.acquisitionCount++;
            // The lock remains locked, but ownership shifts to the next thread in queue
            return nextOwner;
        }

        m.locked = false;
        m.ownerThreadId = std::nullopt;
        m.ownerThreadName.clear();
        return std::nullopt;
    }

    const std::unordered_map<std::string, Mutex>& getAllMutexes() const {
        return mutexes_;
    }

    void restore(const std::unordered_map<std::string, Mutex>& mutexes) {
        mutexes_ = mutexes;
    }

private:
    std::unordered_map<std::string, Mutex> mutexes_;
};

} // namespace concurrency_lab
