#pragma once

#include <string>
#include <vector>
#include <sstream>

namespace concurrency_lab {

enum class Opcode {
    NOOP,
    YIELD,
    LOAD_CONST,       // rA = imm
    READ_SHARED,      // rA = Shared[var]
    WRITE_SHARED,     // Shared[var] = rA or imm
    ADD,              // rA = rB + rC
    ADD_IMM,          // rA = rB + imm
    SUB,              // rA = rB - rC
    SUB_IMM,          // rA = rB - imm
    MUTEX_LOCK,       // lock(mutex)
    MUTEX_UNLOCK,     // unlock(mutex)
    SEM_WAIT,         // sem.wait()
    SEM_SIGNAL,       // sem.signal()
    PRODUCE_ITEM,     // generate buffer payload
    CONSUME_ITEM,     // process buffer payload
    PHIL_THINK,       // simulate thinking phase
    PHIL_EAT,         // simulate eating phase
    CUSTOM_ACTION     // metadata action for custom visualizer hooks
};

inline std::string opcodeToString(Opcode op) {
    switch (op) {
        case Opcode::NOOP: return "NOOP";
        case Opcode::YIELD: return "YIELD";
        case Opcode::LOAD_CONST: return "LOAD_CONST";
        case Opcode::READ_SHARED: return "READ_SHARED";
        case Opcode::WRITE_SHARED: return "WRITE_SHARED";
        case Opcode::ADD: return "ADD";
        case Opcode::ADD_IMM: return "ADD_IMM";
        case Opcode::SUB: return "SUB";
        case Opcode::SUB_IMM: return "SUB_IMM";
        case Opcode::MUTEX_LOCK: return "MUTEX_LOCK";
        case Opcode::MUTEX_UNLOCK: return "MUTEX_UNLOCK";
        case Opcode::SEM_WAIT: return "SEM_WAIT";
        case Opcode::SEM_SIGNAL: return "SEM_SIGNAL";
        case Opcode::PRODUCE_ITEM: return "PRODUCE_ITEM";
        case Opcode::CONSUME_ITEM: return "CONSUME_ITEM";
        case Opcode::PHIL_THINK: return "PHIL_THINK";
        case Opcode::PHIL_EAT: return "PHIL_EAT";
        case Opcode::CUSTOM_ACTION: return "CUSTOM_ACTION";
        default: return "UNKNOWN";
    }
}

struct Instruction {
    Opcode opcode{Opcode::NOOP};
    std::string arg1; // Variable name, mutex name, or register
    std::string arg2; // Source register or value
    int64_t immediate{0}; // Numeric immediate if applicable
    std::string description; // Human-readable high-level code annotation
    std::string sourceCode;  // Equivalent pseudo-C++ line (e.g. "counter++;" or "m.lock();")

    std::string disassemble() const {
        std::ostringstream ss;
        ss << opcodeToString(opcode);
        if (!arg1.empty()) ss << " " << arg1;
        if (!arg2.empty()) ss << ", " << arg2;
        if (immediate != 0 || opcode == Opcode::LOAD_CONST || opcode == Opcode::ADD_IMM || opcode == Opcode::SUB_IMM) {
            ss << " [" << immediate << "]";
        }
        return ss.str();
    }
};

} // namespace concurrency_lab
