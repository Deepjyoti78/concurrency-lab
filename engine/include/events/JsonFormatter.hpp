#pragma once

#include "ExecutionEvent.hpp"
#include "SimulationSnapshot.hpp"
#include <string>
#include <sstream>
#include <vector>
#include <iomanip>

namespace concurrency_lab {

class JsonFormatter {
public:
    static std::string escape(const std::string& s) {
        std::ostringstream o;
        for (char c : s) {
            switch (c) {
                case '"': o << "\\\""; break;
                case '\\': o << "\\\\"; break;
                case '\b': o << "\\b"; break;
                case '\f': o << "\\f"; break;
                case '\n': o << "\\n"; break;
                case '\r': o << "\\r"; break;
                case '\t': o << "\\t"; break;
                default:
                    if ('\x00' <= c && c <= '\x1f') {
                        o << "\\u" << std::hex << std::setw(4) << std::setfill('0') << static_cast<int>(c);
                    } else {
                        o << c;
                    }
            }
        }
        return o.str();
    }

    static std::string formatInstruction(const Instruction& instr) {
        std::ostringstream ss;
        ss << "{"
           << "\"opcode\":\"" << escape(opcodeToString(instr.opcode)) << "\","
           << "\"arg1\":\"" << escape(instr.arg1) << "\","
           << "\"arg2\":\"" << escape(instr.arg2) << "\","
           << "\"immediate\":" << instr.immediate << ","
           << "\"description\":\"" << escape(instr.description) << "\","
           << "\"sourceCode\":\"" << escape(instr.sourceCode) << "\","
           << "\"disassembly\":\"" << escape(instr.disassemble()) << "\""
           << "}";
        return ss.str();
    }

    static std::string formatEvent(const ExecutionEvent& ev) {
        std::ostringstream ss;
        ss << "{"
           << "\"sequence\":" << ev.sequence << ","
           << "\"timestamp\":" << ev.timestamp << ","
           << "\"threadId\":" << ev.threadId << ","
           << "\"threadName\":\"" << escape(ev.threadName) << "\","
           << "\"instruction\":" << formatInstruction(ev.instruction) << ","
           << "\"previousThreadState\":\"" << escape(threadStateToString(ev.previousThreadState)) << "\","
           << "\"previousPc\":" << ev.previousPc << ","
           << "\"newThreadState\":\"" << escape(threadStateToString(ev.newThreadState)) << "\","
           << "\"newPc\":" << ev.newPc << ",";

        // Memory deltas
        ss << "\"memoryDeltas\":[";
        for (size_t i = 0; i < ev.memoryDeltas.size(); ++i) {
            const auto& d = ev.memoryDeltas[i];
            ss << "{"
               << "\"variable\":\"" << escape(d.variable) << "\","
               << "\"oldValue\":" << d.oldValue << ","
               << "\"newValue\":" << d.newValue << ","
               << "\"type\":\"" << escape(d.type) << "\""
               << "}" << (i + 1 < ev.memoryDeltas.size() ? "," : "");
        }
        ss << "],";

        // Synchronization
        ss << "\"synchronization\":{"
           << "\"type\":\"" << escape(ev.synchronization.type) << "\","
           << "\"resourceName\":\"" << escape(ev.synchronization.resourceName) << "\","
           << "\"action\":\"" << escape(ev.synchronization.action) << "\","
           << "\"success\":" << (ev.synchronization.success ? "true" : "false") << ",";
        if (ev.synchronization.unblockedThreadId.has_value()) {
            ss << "\"unblockedThreadId\":" << ev.synchronization.unblockedThreadId.value();
        } else {
            ss << "\"unblockedThreadId\":null";
        }
        ss << "},";

        // Race diagnostics
        ss << "\"raceDetected\":" << (ev.raceDetected ? "true" : "false") << ",";
        if (ev.raceDetails.has_value()) {
            const auto& r = ev.raceDetails.value();
            ss << "\"raceDetails\":{"
               << "\"variable\":\"" << escape(r.variable) << "\","
               << "\"firstThreadId\":" << r.firstThreadId << ","
               << "\"firstThreadName\":\"" << escape(r.firstThreadName) << "\","
               << "\"firstAccessType\":\"" << escape(memoryAccessTypeToString(r.firstAccessType)) << "\","
               << "\"firstValue\":" << r.firstValue << ","
               << "\"secondThreadId\":" << r.secondThreadId << ","
               << "\"secondThreadName\":\"" << escape(r.secondThreadName) << "\","
               << "\"secondAccessType\":\"" << escape(memoryAccessTypeToString(r.secondAccessType)) << "\","
               << "\"secondValue\":" << r.secondValue << ","
               << "\"conflictType\":\"" << escape(r.conflictType) << "\","
               << "\"explanation\":\"" << escape(r.explanation) << "\","
               << "\"remediation\":\"" << escape(r.remediation) << "\""
               << "},";
        } else {
            ss << "\"raceDetails\":null,";
        }

        // Deadlock diagnostics
        ss << "\"deadlockDetected\":" << (ev.deadlockDetected ? "true" : "false") << ",";
        if (ev.deadlockDetails.has_value()) {
            const auto& d = ev.deadlockDetails.value();
            ss << "\"deadlockDetails\":{"
               << "\"isDeadlocked\":" << (d.isDeadlocked ? "true" : "false") << ",";

            ss << "\"deadlockedThreadIds\":[";
            for (size_t i = 0; i < d.deadlockedThreadIds.size(); ++i) {
                ss << d.deadlockedThreadIds[i] << (i + 1 < d.deadlockedThreadIds.size() ? "," : "");
            }
            ss << "],";

            ss << "\"involvedResources\":[";
            for (size_t i = 0; i < d.involvedResources.size(); ++i) {
                ss << "\"" << escape(d.involvedResources[i]) << "\"" << (i + 1 < d.involvedResources.size() ? "," : "");
            }
            ss << "],";

            ss << "\"cycleEdges\":[";
            for (size_t i = 0; i < d.cycleEdges.size(); ++i) {
                const auto& edge = d.cycleEdges[i];
                ss << "{"
                   << "\"waitingThreadId\":" << edge.waitingThreadId << ","
                   << "\"waitingThreadName\":\"" << escape(edge.waitingThreadName) << "\","
                   << "\"holdingThreadId\":" << edge.holdingThreadId << ","
                   << "\"holdingThreadName\":\"" << escape(edge.holdingThreadName) << "\","
                   << "\"resourceName\":\"" << escape(edge.resourceName) << "\""
                   << "}" << (i + 1 < d.cycleEdges.size() ? "," : "");
            }
            ss << "],";

            ss << "\"cycleDescription\":\"" << escape(d.cycleDescription) << "\","
               << "\"explanation\":\"" << escape(d.explanation) << "\","
               << "\"remediation\":\"" << escape(d.remediation) << "\""
               << "},";
        } else {
            ss << "\"deadlockDetails\":null,";
        }

        ss << "\"explanation\":\"" << escape(ev.explanation) << "\"";
        ss << "}";
        return ss.str();
    }

    static std::string formatSnapshot(const SimulationSnapshot& s) {
        std::ostringstream ss;
        ss << "{"
           << "\"sequence\":" << s.sequence << ","
           << "\"timestamp\":" << s.timestamp << ",";

        // Threads
        ss << "\"threads\":{";
        size_t tCount = 0;
        for (const auto& [tid, t] : s.threads) {
            ss << "\"" << tid << "\":{"
               << "\"id\":" << t.id << ","
               << "\"name\":\"" << escape(t.name) << "\","
               << "\"state\":\"" << escape(threadStateToString(t.state)) << "\","
               << "\"pc\":" << t.pc << ","
               << "\"color\":\"" << escape(t.color) << "\","
               << "\"blockedOn\":\"" << escape(t.blockedOn) << "\","
               << "\"registers\":{";
            size_t rCount = 0;
            for (const auto& [reg, val] : t.registers) {
                ss << "\"" << escape(reg) << "\":" << val << (++rCount < t.registers.size() ? "," : "");
            }
            ss << "},\"heldMutexes\":[";
            for (size_t i = 0; i < t.heldMutexes.size(); ++i) {
                ss << "\"" << escape(t.heldMutexes[i]) << "\"" << (i + 1 < t.heldMutexes.size() ? "," : "");
            }
            ss << "]}";
            if (++tCount < s.threads.size()) ss << ",";
        }
        ss << "},";

        // Ready queue
        ss << "\"readyQueue\":[";
        for (size_t i = 0; i < s.readyQueue.size(); ++i) {
            ss << s.readyQueue[i] << (i + 1 < s.readyQueue.size() ? "," : "");
        }
        ss << "],";

        // Shared variables
        ss << "\"sharedVariables\":{";
        size_t vCount = 0;
        for (const auto& [name, meta] : s.sharedVariables) {
            ss << "\"" << escape(name) << "\":{"
               << "\"value\":" << meta.value << ","
               << "\"previousValue\":" << meta.previousValue << ","
               << "\"lastModifiedByThreadId\":" << meta.lastModifiedByThreadId << ","
               << "\"lastModifiedTimestamp\":" << meta.lastModifiedTimestamp << ","
               << "\"writeCount\":" << meta.writeCount << ","
               << "\"readCount\":" << meta.readCount
               << "}";
            if (++vCount < s.sharedVariables.size()) ss << ",";
        }
        ss << "},";

        // Memory access history
        ss << "\"memoryAccessHistory\":[";
        for (size_t i = 0; i < s.memoryAccessHistory.size(); ++i) {
            const auto& rec = s.memoryAccessHistory[i];
            ss << "{"
               << "\"sequence\":" << rec.sequence << ","
               << "\"timestamp\":" << rec.timestamp << ","
               << "\"threadId\":" << rec.threadId << ","
               << "\"threadName\":\"" << escape(rec.threadName) << "\","
               << "\"variable\":\"" << escape(rec.variable) << "\","
               << "\"type\":\"" << escape(memoryAccessTypeToString(rec.type)) << "\","
               << "\"value\":" << rec.value << ","
               << "\"previousValue\":" << rec.previousValue
               << "}" << (i + 1 < s.memoryAccessHistory.size() ? "," : "");
        }
        ss << "],";

        // Mutexes
        ss << "\"mutexes\":{";
        size_t mCount = 0;
        for (const auto& [name, m] : s.mutexes) {
            ss << "\"" << escape(name) << "\":{"
               << "\"name\":\"" << escape(m.name) << "\","
               << "\"locked\":" << (m.locked ? "true" : "false") << ",";
            if (m.ownerThreadId.has_value()) {
                ss << "\"ownerThreadId\":" << m.ownerThreadId.value() << ",";
            } else {
                ss << "\"ownerThreadId\":null,";
            }
            ss << "\"ownerThreadName\":\"" << escape(m.ownerThreadName) << "\","
               << "\"acquisitionCount\":" << m.acquisitionCount << ","
               << "\"contentionCount\":" << m.contentionCount << ","
               << "\"waitingQueue\":[";
            for (size_t i = 0; i < m.waitingQueue.size(); ++i) {
                ss << m.waitingQueue[i] << (i + 1 < m.waitingQueue.size() ? "," : "");
            }
            ss << "]}";
            if (++mCount < s.mutexes.size()) ss << ",";
        }
        ss << "},";

        // Semaphores
        ss << "\"semaphores\":{";
        size_t semCount = 0;
        for (const auto& [name, sem] : s.semaphores) {
            ss << "\"" << escape(name) << "\":{"
               << "\"name\":\"" << escape(sem.name) << "\","
               << "\"initialCount\":" << sem.initialCount << ","
               << "\"currentCount\":" << sem.currentCount << ","
               << "\"waitOpsCount\":" << sem.waitOpsCount << ","
               << "\"signalOpsCount\":" << sem.signalOpsCount << ","
               << "\"waitingQueue\":[";
            for (size_t i = 0; i < sem.waitingQueue.size(); ++i) {
                ss << sem.waitingQueue[i] << (i + 1 < sem.waitingQueue.size() ? "," : "");
            }
            ss << "]}";
            if (++semCount < s.semaphores.size()) ss << ",";
        }
        ss << "},";

        // Deadlock report
        ss << "\"deadlockReport\":{"
           << "\"isDeadlocked\":" << (s.deadlockReport.isDeadlocked ? "true" : "false") << ",";
        ss << "\"deadlockedThreadIds\":[";
        for (size_t i = 0; i < s.deadlockReport.deadlockedThreadIds.size(); ++i) {
            ss << s.deadlockReport.deadlockedThreadIds[i] << (i + 1 < s.deadlockReport.deadlockedThreadIds.size() ? "," : "");
        }
        ss << "],";
        ss << "\"involvedResources\":[";
        for (size_t i = 0; i < s.deadlockReport.involvedResources.size(); ++i) {
            ss << "\"" << escape(s.deadlockReport.involvedResources[i]) << "\"" << (i + 1 < s.deadlockReport.involvedResources.size() ? "," : "");
        }
        ss << "],";
        ss << "\"cycleEdges\":[";
        for (size_t i = 0; i < s.deadlockReport.cycleEdges.size(); ++i) {
            const auto& edge = s.deadlockReport.cycleEdges[i];
            ss << "{"
               << "\"waitingThreadId\":" << edge.waitingThreadId << ","
               << "\"waitingThreadName\":\"" << escape(edge.waitingThreadName) << "\","
               << "\"holdingThreadId\":" << edge.holdingThreadId << ","
               << "\"holdingThreadName\":\"" << escape(edge.holdingThreadName) << "\","
               << "\"resourceName\":\"" << escape(edge.resourceName) << "\""
               << "}" << (i + 1 < s.deadlockReport.cycleEdges.size() ? "," : "");
        }
        ss << "],";
        ss << "\"cycleDescription\":\"" << escape(s.deadlockReport.cycleDescription) << "\","
           << "\"explanation\":\"" << escape(s.deadlockReport.explanation) << "\","
           << "\"remediation\":\"" << escape(s.deadlockReport.remediation) << "\""
           << "}";

        ss << "}";
        return ss.str();
    }
};

} // namespace concurrency_lab
