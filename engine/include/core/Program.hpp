#pragma once

#include "Instruction.hpp"
#include <vector>
#include <string>

namespace concurrency_lab {

class Program {
public:
    Program() = default;
    explicit Program(std::string name) : name_(std::move(name)) {}

    void addInstruction(Instruction instr) {
        instructions_.push_back(std::move(instr));
    }

    const std::vector<Instruction>& getInstructions() const { return instructions_; }
    size_t size() const { return instructions_.size(); }
    const std::string& getName() const { return name_; }

    const Instruction* getInstructionAt(size_t index) const {
        if (index < instructions_.size()) {
            return &instructions_[index];
        }
        return nullptr;
    }

private:
    std::string name_{"DefaultProgram"};
    std::vector<Instruction> instructions_;
};

} // namespace concurrency_lab
