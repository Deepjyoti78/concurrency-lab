#pragma once

#include "Semaphore.hpp"
#include <unordered_map>
#include <string>
#include <vector>
#include <optional>

namespace concurrency_lab {

class SemaphoreManager {
public:
    SemaphoreManager() = default;

    void declareSemaphore(const std::string& name, int32_t initialCount = 1) {
        if (semaphores_.find(name) == semaphores_.end()) {
            Semaphore s;
            s.name = name;
            s.initialCount = initialCount;
            s.currentCount = initialCount;
            semaphores_[name] = s;
        }
    }

    bool hasSemaphore(const std::string& name) const {
        return semaphores_.find(name) != semaphores_.end();
    }

    const Semaphore* getSemaphore(const std::string& name) const {
        auto it = semaphores_.find(name);
        if (it != semaphores_.end()) return &it->second;
        return nullptr;
    }

    // Classic semaphore wait (P operation)
    // If count > 0, decrement and continue.
    // If count <= 0, decrement and block.
    bool wait(uint32_t threadId, const std::string& name, bool& outBlocked) {
        declareSemaphore(name, 1);
        Semaphore& s = semaphores_[name];
        s.waitOpsCount++;

        if (s.currentCount > 0) {
            s.currentCount--;
            outBlocked = false;
            return true;
        }

        s.currentCount--;
        s.waitingQueue.push_back(threadId);
        outBlocked = true;
        return false;
    }

    // Classic semaphore signal (V operation)
    // Increments count. If there are waiting threads, wakes one up.
    std::optional<uint32_t> signal(uint32_t /*threadId*/, const std::string& name) {
        declareSemaphore(name, 1);
        Semaphore& s = semaphores_[name];
        s.signalOpsCount++;

        s.currentCount++;
        if (!s.waitingQueue.empty()) {
            uint32_t unblocked = s.waitingQueue.front();
            s.waitingQueue.pop_front();
            return unblocked;
        }

        return std::nullopt;
    }

    const std::unordered_map<std::string, Semaphore>& getAllSemaphores() const {
        return semaphores_;
    }

    void restore(const std::unordered_map<std::string, Semaphore>& sems) {
        semaphores_ = sems;
    }

private:
    std::unordered_map<std::string, Semaphore> semaphores_;
};

} // namespace concurrency_lab
