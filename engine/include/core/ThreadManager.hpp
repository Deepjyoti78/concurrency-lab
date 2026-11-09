#pragma once

#include "Thread.hpp"
#include "Program.hpp"
#include <vector>
#include <deque>
#include <unordered_map>
#include <stdexcept>
#include <memory>

namespace concurrency_lab {

class ThreadManager {
public:
    ThreadManager() = default;

    uint32_t createThread(const std::string& name, const Program& program, const std::string& color = "#6366F1") {
        uint32_t id = nextThreadId_++;
        Thread thread;
        thread.id = id;
        thread.name = name;
        thread.state = ThreadState::READY;
        thread.pc = 0;
        thread.color = color;
        
        threads_[id] = thread;
        programs_[id] = program;
        readyQueue_.push_back(id);
        return id;
    }

    Thread* getThread(uint32_t id) {
        auto it = threads_.find(id);
        if (it != threads_.end()) return &it->second;
        return nullptr;
    }

    const Thread* getThread(uint32_t id) const {
        auto it = threads_.find(id);
        if (it != threads_.end()) return &it->second;
        return nullptr;
    }

    const Program* getProgram(uint32_t id) const {
        auto it = programs_.find(id);
        if (it != programs_.end()) return &it->second;
        return nullptr;
    }

    std::vector<uint32_t> getAllThreadIds() const {
        std::vector<uint32_t> ids;
        ids.reserve(threads_.size());
        for (const auto& [id, _] : threads_) {
            ids.push_back(id);
        }
        return ids;
    }

    const std::deque<uint32_t>& getReadyQueue() const { return readyQueue_; }
    
    std::vector<uint32_t> getEligibleThreads() const {
        std::vector<uint32_t> eligible;
        for (uint32_t tid : readyQueue_) {
            const Thread* t = getThread(tid);
            if (t && (t->state == ThreadState::READY || t->state == ThreadState::RUNNING)) {
                eligible.push_back(tid);
            }
        }
        return eligible;
    }

    bool transitionState(uint32_t threadId, ThreadState newState, const std::string& reason = "") {
        Thread* t = getThread(threadId);
        if (!t) return false;

        ThreadState oldState = t->state;
        if (oldState == newState) return true;

        // Validate transitions
        if (oldState == ThreadState::TERMINATED) {
            return false; // Cannot transition out of terminated
        }

        t->state = newState;
        if (newState == ThreadState::BLOCKED) {
            t->blockedOn = reason;
            removeFromReadyQueue(threadId);
        } else if (newState == ThreadState::READY) {
            t->blockedOn.clear();
            if (!isInReadyQueue(threadId)) {
                readyQueue_.push_back(threadId);
            }
        } else if (newState == ThreadState::TERMINATED) {
            t->blockedOn.clear();
            removeFromReadyQueue(threadId);
        }

        return true;
    }

    void removeFromReadyQueue(uint32_t threadId) {
        for (auto it = readyQueue_.begin(); it != readyQueue_.end(); ++it) {
            if (*it == threadId) {
                readyQueue_.erase(it);
                break;
            }
        }
    }

    bool isInReadyQueue(uint32_t threadId) const {
        for (uint32_t id : readyQueue_) {
            if (id == threadId) return true;
        }
        return false;
    }

    bool allTerminated() const {
        if (threads_.empty()) return true;
        for (const auto& [id, thread] : threads_) {
            if (thread.state != ThreadState::TERMINATED) {
                return false;
            }
        }
        return true;
    }

    bool isDeadlocked() const {
        if (threads_.empty()) return false;
        bool hasBlocked = false;
        for (const auto& [id, thread] : threads_) {
            if (thread.state == ThreadState::READY || thread.state == ThreadState::RUNNING) {
                return false; // Still has runnable thread
            }
            if (thread.state == ThreadState::BLOCKED) {
                hasBlocked = true;
            }
        }
        return hasBlocked; // All active threads are blocked
    }

    const std::unordered_map<uint32_t, Thread>& getThreads() const { return threads_; }
    const std::unordered_map<uint32_t, Program>& getPrograms() const { return programs_; }

    void restoreThreads(const std::unordered_map<uint32_t, Thread>& threads, const std::deque<uint32_t>& readyQueue) {
        threads_ = threads;
        readyQueue_ = readyQueue;
    }

private:
    uint32_t nextThreadId_{1};
    std::unordered_map<uint32_t, Thread> threads_;
    std::unordered_map<uint32_t, Program> programs_;
    std::deque<uint32_t> readyQueue_;
};

} // namespace concurrency_lab
