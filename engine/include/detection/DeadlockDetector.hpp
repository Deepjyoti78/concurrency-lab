#pragma once

#include "core/ThreadManager.hpp"
#include "synchronization/MutexManager.hpp"
#include <string>
#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <optional>
#include <sstream>

namespace concurrency_lab {

struct ResourceAllocationEdge {
    enum class Type {
        HOLDING, // Resource -> Thread (Assignment)
        REQUESTING // Thread -> Resource (Request)
    };
    Type type{Type::HOLDING};
    uint32_t threadId{0};
    std::string threadName;
    std::string resourceName;
};

struct WaitForEdge {
    uint32_t waitingThreadId{0};
    std::string waitingThreadName;
    uint32_t holdingThreadId{0};
    std::string holdingThreadName;
    std::string resourceName;
};

struct DeadlockReport {
    bool isDeadlocked{false};
    std::vector<uint32_t> deadlockedThreadIds;
    std::vector<std::string> involvedResources;
    std::vector<WaitForEdge> cycleEdges;
    std::string cycleDescription;
    std::string explanation;
    std::string remediation;
};

class DeadlockDetector {
public:
    DeadlockDetector() = default;

    DeadlockReport detectDeadlock(const ThreadManager& threadManager, const MutexManager& mutexManager) {
        DeadlockReport report;
        
        // 1. Build Wait-For Graph (WFG)
        // threadId -> list of {holdingThreadId, resourceName}
        std::unordered_map<uint32_t, std::vector<WaitForEdge>> wfg;
        std::unordered_set<uint32_t> allWfgNodes;

        for (const auto& [mutexName, mutex] : mutexManager.getAllMutexes()) {
            if (mutex.locked && mutex.ownerThreadId.has_value()) {
                uint32_t holderId = mutex.ownerThreadId.value();
                const Thread* holderThread = threadManager.getThread(holderId);
                std::string holderName = holderThread ? holderThread->name : ("Thread-" + std::to_string(holderId));

                for (uint32_t waitingId : mutex.waitingQueue) {
                    const Thread* waiter = threadManager.getThread(waitingId);
                    std::string waiterName = waiter ? waiter->name : ("Thread-" + std::to_string(waitingId));

                    WaitForEdge edge;
                    edge.waitingThreadId = waitingId;
                    edge.waitingThreadName = waiterName;
                    edge.holdingThreadId = holderId;
                    edge.holdingThreadName = holderName;
                    edge.resourceName = mutexName;

                    wfg[waitingId].push_back(edge);
                    allWfgNodes.insert(waitingId);
                    allWfgNodes.insert(holderId);
                }
            }
        }

        // 2. DFS cycle detection on WFG
        std::unordered_set<uint32_t> visited;
        std::unordered_set<uint32_t> inStack;
        std::vector<WaitForEdge> currentPath;
        std::vector<WaitForEdge> detectedCycle;

        for (uint32_t startNode : allWfgNodes) {
            if (visited.find(startNode) == visited.end()) {
                if (dfsFindCycle(startNode, wfg, visited, inStack, currentPath, detectedCycle)) {
                    break;
                }
            }
        }

        if (!detectedCycle.empty()) {
            report.isDeadlocked = true;
            report.cycleEdges = detectedCycle;

            std::ostringstream cycleDesc;
            std::unordered_set<uint32_t> threadSet;
            std::unordered_set<std::string> resourceSet;

            for (size_t i = 0; i < detectedCycle.size(); ++i) {
                const auto& edge = detectedCycle[i];
                threadSet.insert(edge.waitingThreadId);
                threadSet.insert(edge.holdingThreadId);
                resourceSet.insert(edge.resourceName);

                cycleDesc << edge.waitingThreadName << " (waiting for '" << edge.resourceName << "') ➔ ";
            }
            if (!detectedCycle.empty()) {
                cycleDesc << detectedCycle.front().waitingThreadName;
            }

            report.deadlockedThreadIds.assign(threadSet.begin(), threadSet.end());
            report.involvedResources.assign(resourceSet.begin(), resourceSet.end());
            report.cycleDescription = cycleDesc.str();
            
            report.explanation = "Deadlock detected via circular wait! " + 
                std::to_string(report.deadlockedThreadIds.size()) + 
                " threads are mutually blocked waiting for resources held by each other. " +
                "None of these threads can proceed without an external intervention or preemption.";

            report.remediation = "To eliminate deadlock, establish a strict global lock hierarchy (always acquire resources in a predetermined order, e.g. Lock A before Lock B), or use try-lock with backoff.";
        }

        lastReport_ = report;
        return report;
    }

    const DeadlockReport& getLastReport() const { return lastReport_; }

    std::vector<ResourceAllocationEdge> buildResourceAllocationGraph(
        const ThreadManager& threadManager,
        const MutexManager& mutexManager
    ) const {
        std::vector<ResourceAllocationEdge> edges;

        for (const auto& [mutexName, mutex] : mutexManager.getAllMutexes()) {
            // Assignment edges (Mutex -> Owner Thread)
            if (mutex.locked && mutex.ownerThreadId.has_value()) {
                uint32_t holderId = mutex.ownerThreadId.value();
                const Thread* holder = threadManager.getThread(holderId);
                ResourceAllocationEdge edge;
                edge.type = ResourceAllocationEdge::Type::HOLDING;
                edge.threadId = holderId;
                edge.threadName = holder ? holder->name : ("Thread-" + std::to_string(holderId));
                edge.resourceName = mutexName;
                edges.push_back(edge);
            }

            // Request edges (Waiting Thread -> Mutex)
            for (uint32_t waiterId : mutex.waitingQueue) {
                const Thread* waiter = threadManager.getThread(waiterId);
                ResourceAllocationEdge edge;
                edge.type = ResourceAllocationEdge::Type::REQUESTING;
                edge.threadId = waiterId;
                edge.threadName = waiter ? waiter->name : ("Thread-" + std::to_string(waiterId));
                edge.resourceName = mutexName;
                edges.push_back(edge);
            }
        }

        return edges;
    }

    void reset() {
        lastReport_ = DeadlockReport{};
    }

private:
    bool dfsFindCycle(
        uint32_t u,
        const std::unordered_map<uint32_t, std::vector<WaitForEdge>>& adj,
        std::unordered_set<uint32_t>& visited,
        std::unordered_set<uint32_t>& inStack,
        std::vector<WaitForEdge>& currentPath,
        std::vector<WaitForEdge>& detectedCycle
    ) {
        visited.insert(u);
        inStack.insert(u);

        auto it = adj.find(u);
        if (it != adj.end()) {
            for (const auto& edge : it->second) {
                uint32_t v = edge.holdingThreadId;
                currentPath.push_back(edge);

                if (inStack.find(v) != inStack.end()) {
                    // Back-edge found -> extract the cycle starting from v
                    detectedCycle.clear();
                    bool capturing = false;
                    for (const auto& pathEdge : currentPath) {
                        if (pathEdge.waitingThreadId == v) {
                            capturing = true;
                        }
                        if (capturing) {
                            detectedCycle.push_back(pathEdge);
                        }
                    }
                    return true;
                }

                if (visited.find(v) == visited.end()) {
                    if (dfsFindCycle(v, adj, visited, inStack, currentPath, detectedCycle)) {
                        return true;
                    }
                }

                currentPath.pop_back();
            }
        }

        inStack.erase(u);
        return false;
    }

    DeadlockReport lastReport_;
};

} // namespace concurrency_lab
