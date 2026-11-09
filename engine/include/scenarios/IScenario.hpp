#pragma once

#include "core/ExecutionEngine.hpp"
#include <string>
#include <memory>

namespace concurrency_lab {

struct ScenarioMetadata {
    std::string id;
    std::string title;
    std::string moduleId;
    std::string moduleTitle;
    std::string difficulty; // "Beginner", "Intermediate", "Advanced"
    std::string objective;
    std::string description;
    std::string expectedOutcome;
    std::string keyTakeaway;
    std::string defaultScheduler{"ROUND_ROBIN"};
    uint32_t defaultQuantum{1};
};

class IScenario {
public:
    virtual ~IScenario() = default;
    virtual ScenarioMetadata getMetadata() const = 0;
    virtual void setup(ExecutionEngine& engine) = 0;
};

} // namespace concurrency_lab
