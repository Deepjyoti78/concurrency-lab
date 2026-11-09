#include "core/ExecutionEngine.hpp"
#include "scenarios/ScenarioRegistry.hpp"
#include "events/JsonFormatter.hpp"
#include "scheduler/RoundRobinScheduler.hpp"
#include "scheduler/FIFOScheduler.hpp"
#include "scheduler/ManualScheduler.hpp"
#include "scheduler/SeededRandomScheduler.hpp"

#include <iostream>
#include <string>
#include <vector>
#include <memory>

using namespace concurrency_lab;

void printUsage() {
    std::cout << "ConcurrencyLab C++20 Simulation Engine\n";
    std::cout << "Usage:\n";
    std::cout << "  --list-scenarios           List all pre-configured experiments in JSON\n";
    std::cout << "  --scenario <id>            Select scenario by id\n";
    std::cout << "  --scheduler <type>         Scheduler: rr, fifo, manual, random (default: rr)\n";
    std::cout << "  --quantum <n>              Quantum for round-robin (default: 1)\n";
    std::cout << "  --seed <n>                 Seed for random scheduler (default: 42)\n";
    std::cout << "  --run                      Run scenario to completion and print JSON\n";
    std::cout << "  --interactive              Enter interactive stdin/stdout JSON protocol\n";
}

void listScenarios() {
    const auto& catalog = ScenarioRegistry::instance().getCatalog();
    std::cout << "{\"scenarios\":[";
    for (size_t i = 0; i < catalog.size(); ++i) {
        const auto& m = catalog[i];
        std::cout << "{"
                  << "\"id\":\"" << JsonFormatter::escape(m.id) << "\","
                  << "\"title\":\"" << JsonFormatter::escape(m.title) << "\","
                  << "\"moduleId\":\"" << JsonFormatter::escape(m.moduleId) << "\","
                  << "\"moduleTitle\":\"" << JsonFormatter::escape(m.moduleTitle) << "\","
                  << "\"difficulty\":\"" << JsonFormatter::escape(m.difficulty) << "\","
                  << "\"objective\":\"" << JsonFormatter::escape(m.objective) << "\","
                  << "\"description\":\"" << JsonFormatter::escape(m.description) << "\","
                  << "\"expectedOutcome\":\"" << JsonFormatter::escape(m.expectedOutcome) << "\","
                  << "\"keyTakeaway\":\"" << JsonFormatter::escape(m.keyTakeaway) << "\","
                  << "\"defaultScheduler\":\"" << JsonFormatter::escape(m.defaultScheduler) << "\","
                  << "\"defaultQuantum\":" << m.defaultQuantum
                  << "}" << (i + 1 < catalog.size() ? "," : "");
    }
    std::cout << "]}\n";
}

void runScenario(const std::string& scenarioId, const std::string& schedulerType, uint32_t quantum, uint32_t seed) {
    auto scenario = ScenarioRegistry::instance().createScenario(scenarioId);
    if (!scenario) {
        std::cerr << "{\"error\":\"Scenario not found: " << scenarioId << "\"}\n";
        return;
    }

    ExecutionEngine engine;
    if (schedulerType == "fifo") {
        engine.setScheduler(std::make_unique<FIFOScheduler>());
    } else if (schedulerType == "random") {
        engine.setScheduler(std::make_unique<SeededRandomScheduler>(seed));
    } else if (schedulerType == "manual") {
        engine.setScheduler(std::make_unique<ManualScheduler>());
    } else {
        engine.setScheduler(std::make_unique<RoundRobinScheduler>(quantum));
    }

    scenario->setup(engine);
    engine.runToCompletion();

    const auto& events = engine.getEventHistory();
    const auto& snapshots = engine.getSnapshots();
    auto meta = scenario->getMetadata();

    std::cout << "{"
              << "\"scenarioId\":\"" << JsonFormatter::escape(meta.id) << "\","
              << "\"scenarioTitle\":\"" << JsonFormatter::escape(meta.title) << "\","
              << "\"totalSteps\":" << engine.getCurrentStep() << ","
              << "\"isCompleted\":" << (engine.isCompleted() ? "true" : "false") << ",";

    // Events
    std::cout << "\"events\":[";
    for (size_t i = 0; i < events.size(); ++i) {
        std::cout << JsonFormatter::formatEvent(events[i]) << (i + 1 < events.size() ? "," : "");
    }
    std::cout << "],";

    // Snapshots
    std::cout << "\"snapshots\":[";
    for (size_t i = 0; i < snapshots.size(); ++i) {
        std::cout << JsonFormatter::formatSnapshot(snapshots[i]) << (i + 1 < snapshots.size() ? "," : "");
    }
    std::cout << "],";

    // Final Snapshot
    if (!snapshots.empty()) {
        std::cout << "\"finalSnapshot\":" << JsonFormatter::formatSnapshot(snapshots.back());
    } else {
        std::cout << "\"finalSnapshot\":null";
    }

    std::cout << "}\n";
}

void runInteractive(const std::string& initialScenarioId) {
    ExecutionEngine engine;
    std::string currentScenarioId = initialScenarioId.empty() ? "race_counter_2" : initialScenarioId;
    auto scenario = ScenarioRegistry::instance().createScenario(currentScenarioId);
    if (scenario) {
        scenario->setup(engine);
    }

    std::string line;
    while (std::getline(std::cin, line)) {
        if (line.empty()) continue;
        if (line == "EXIT" || line == "quit") break;

        if (line == "STEP") {
            bool stepped = engine.step();
            std::cout << "{\"stepped\":" << (stepped ? "true" : "false") << ",";
            if (!engine.getEventHistory().empty()) {
                std::cout << "\"event\":" << JsonFormatter::formatEvent(engine.getEventHistory().back()) << ",";
            }
            if (!engine.getSnapshots().empty()) {
                std::cout << "\"snapshot\":" << JsonFormatter::formatSnapshot(engine.getSnapshots().back()) << ",";
            }
            std::cout << "\"currentStep\":" << engine.getCurrentStep() << ",";
            std::cout << "\"isCompleted\":" << (engine.isCompleted() ? "true" : "false") << "}\n";
            std::cout.flush();
        } else if (line == "STEP_BACK") {
            bool back = engine.stepBack();
            std::cout << "{\"stepBack\":" << (back ? "true" : "false") << ",";
            if (!engine.getSnapshots().empty()) {
                std::cout << "\"snapshot\":" << JsonFormatter::formatSnapshot(engine.getSnapshots().back()) << ",";
            }
            std::cout << "\"currentStep\":" << engine.getCurrentStep() << "}\n";
            std::cout.flush();
        } else if (line.rfind("SEEK:", 0) == 0) {
            size_t stepIdx = std::stoull(line.substr(5));
            engine.seek(stepIdx);
            std::cout << "{\"action\":\"seek\",\"step\":" << engine.getCurrentStep() << ",";
            if (stepIdx < engine.getSnapshots().size()) {
                std::cout << "\"snapshot\":" << JsonFormatter::formatSnapshot(engine.getSnapshots()[stepIdx]) << ",";
            }
            std::cout << "\"success\":true}\n";
            std::cout.flush();
        } else if (line == "RESET") {
            engine.reset();
            std::cout << "{\"action\":\"reset\",\"success\":true,\"snapshot\":" 
                      << JsonFormatter::formatSnapshot(engine.getSnapshots().front()) << "}\n";
            std::cout.flush();
        } else if (line.rfind("LOAD:", 0) == 0) {
            currentScenarioId = line.substr(5);
            auto newScen = ScenarioRegistry::instance().createScenario(currentScenarioId);
            if (newScen) {
                engine = ExecutionEngine();
                newScen->setup(engine);
                std::cout << "{\"action\":\"load\",\"scenarioId\":\"" << currentScenarioId << "\",\"success\":true,"
                          << "\"snapshot\":" << JsonFormatter::formatSnapshot(engine.getSnapshots().front()) << "}\n";
            } else {
                std::cout << "{\"action\":\"load\",\"success\":false,\"error\":\"Not found\"}\n";
            }
            std::cout.flush();
        } else {
            std::cout << "{\"error\":\"Unknown command\"}\n";
            std::cout.flush();
        }
    }
}

int main(int argc, char* argv[]) {
    std::string scenarioId = "race_counter_2";
    std::string schedulerType = "rr";
    uint32_t quantum = 1;
    uint32_t seed = 42;
    bool doList = false;
    bool doRun = false;
    bool doInteractive = false;

    for (int i = 1; i < argc; ++i) {
        std::string arg = argv[i];
        if (arg == "--list-scenarios") {
            doList = true;
        } else if (arg == "--run") {
            doRun = true;
        } else if (arg == "--interactive") {
            doInteractive = true;
        } else if (arg == "--scenario" && i + 1 < argc) {
            scenarioId = argv[++i];
        } else if (arg == "--scheduler" && i + 1 < argc) {
            schedulerType = argv[++i];
        } else if (arg == "--quantum" && i + 1 < argc) {
            quantum = static_cast<uint32_t>(std::stoul(argv[++i]));
        } else if (arg == "--seed" && i + 1 < argc) {
            seed = static_cast<uint32_t>(std::stoul(argv[++i]));
        } else if (arg == "--help" || arg == "-h") {
            printUsage();
            return 0;
        }
    }

    if (doList) {
        listScenarios();
        return 0;
    }

    if (doInteractive) {
        runInteractive(scenarioId);
        return 0;
    }

    if (doRun || !scenarioId.empty()) {
        runScenario(scenarioId, schedulerType, quantum, seed);
        return 0;
    }

    printUsage();
    return 0;
}
