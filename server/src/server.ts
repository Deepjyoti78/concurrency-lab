import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { execFile } from "child_process";
import path from "path";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// JSON Body Parser Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ 
      error: "Malformed JSON payload", 
      message: "The request body could not be parsed as valid JSON." 
    });
  }
  next(err);
});

const MINGW_BIN = "C:\\Users\\deepjyoti\\AppData\\Local\\Microsoft\\WinGet\\Packages\\BrechtSanders.WinLibs.POSIX.UCRT_Microsoft.Winget.Source_8wekyb3d8bbwe\\mingw64\\bin";
const ENGINE_EXE = path.resolve(__dirname, "../../engine/build/concurrency_lab_engine.exe");

const env = {
  ...process.env,
  PATH: `${MINGW_BIN};${process.env.PATH || ""}`
};

// Known valid schedulers
const VALID_SCHEDULERS = new Set(["rr", "fifo", "random", "manual"]);
const SCENARIO_ID_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;

const KNOWN_SCENARIOS = new Set([
  "race_counter_2",
  "race_counter_3",
  "mutex_counter_2",
  "mutex_contention",
  "counting_semaphore",
  "producer_consumer_3",
  "dining_philosophers_deadlock",
  "dining_philosophers_safe",
  "deadlock_circular_wait",
  "deadlock_free_hierarchy",
]);

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  const engineFound = fs.existsSync(ENGINE_EXE);
  res.json({
    status: engineFound ? "healthy" : "degraded",
    engineFound,
    enginePath: ENGINE_EXE,
    serverUptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version
  });
});

// List scenarios catalog directly from C++ engine
app.get("/api/scenarios", (req: Request, res: Response) => {
  if (!fs.existsSync(ENGINE_EXE)) {
    return res.status(503).json({ 
      error: "Native engine unavailable", 
      details: `Binary not found at ${ENGINE_EXE}` 
    });
  }

  execFile(
    ENGINE_EXE, 
    ["--list-scenarios"], 
    { env, maxBuffer: 10 * 1024 * 1024, timeout: 10000 }, 
    (err, stdout, stderr) => {
      if (err) {
        console.error("[ConcurrencyLab IPC] Error listing scenarios:", err, stderr);
        return res.status(500).json({ 
          error: "Failed to execute C++ engine", 
          details: stderr || err.message 
        });
      }
      try {
        const data = JSON.parse(stdout);
        res.json(data);
      } catch (parseErr: any) {
        res.status(502).json({ 
          error: "Failed to parse engine catalog JSON output", 
          details: parseErr.message, 
          raw: stdout.slice(0, 500) 
        });
      }
    }
  );
});

// Execute scenario simulation with strict validation and timeout
app.post("/api/run", (req: Request, res: Response) => {
  if (!fs.existsSync(ENGINE_EXE)) {
    return res.status(503).json({ 
      error: "Native engine unavailable", 
      details: `Binary not found at ${ENGINE_EXE}` 
    });
  }

  if (!req.body || typeof req.body.scenarioId !== "string" || !req.body.scenarioId.trim()) {
    return res.status(400).json({
      error: "Missing scenarioId parameter",
      message: "A non-empty string scenarioId must be provided in the request body."
    });
  }

  const { 
    scenarioId, 
    scheduler = "rr", 
    quantum = 1, 
    seed = 42 
  } = req.body;

  // 1. Validate scenarioId format and whitelist
  if (!SCENARIO_ID_REGEX.test(scenarioId) || !KNOWN_SCENARIOS.has(scenarioId)) {
    return res.status(400).json({ 
      error: "Invalid scenarioId parameter", 
      message: `scenarioId '${scenarioId}' is not recognized. Valid scenarios: ${Array.from(KNOWN_SCENARIOS).join(", ")}.` 
    });
  }

  // 2. Validate scheduler
  const normalizedScheduler = String(scheduler).toLowerCase();
  if (!VALID_SCHEDULERS.has(normalizedScheduler)) {
    return res.status(400).json({ 
      error: "Invalid scheduler parameter", 
      message: `scheduler must be one of: ${Array.from(VALID_SCHEDULERS).join(", ")}.` 
    });
  }

  // 3. Validate quantum
  const parsedQuantum = Number(quantum);
  if (!Number.isInteger(parsedQuantum) || parsedQuantum < 1 || parsedQuantum > 1000) {
    return res.status(400).json({ 
      error: "Invalid quantum parameter", 
      message: "quantum must be an integer between 1 and 1000." 
    });
  }

  // 4. Validate seed
  const parsedSeed = Number(seed);
  if (!Number.isInteger(parsedSeed) || parsedSeed < 0 || parsedSeed > 2147483647) {
    return res.status(400).json({ 
      error: "Invalid seed parameter", 
      message: "seed must be an integer between 0 and 2147483647." 
    });
  }

  // ExecFile executes binary directly (no shell interpolation)
  const args = [
    "--scenario", scenarioId,
    "--scheduler", normalizedScheduler,
    "--quantum", String(parsedQuantum),
    "--seed", String(parsedSeed),
    "--run"
  ];

  execFile(
    ENGINE_EXE, 
    args, 
    { env, maxBuffer: 25 * 1024 * 1024, timeout: 10000 }, 
    (err: any, stdout: string, stderr: string) => {
      if (err) {
        if (err.killed) {
          console.error("[ConcurrencyLab IPC] Engine execution timed out (10s)");
          return res.status(504).json({ 
            error: "Simulation execution timed out", 
            message: "The C++ simulation engine exceeded the 10-second runtime limit." 
          });
        }
        console.error("[ConcurrencyLab IPC] Execution failed:", err.message, stderr);
        return res.status(500).json({ 
          error: "Execution failed", 
          details: stderr || err.message 
        });
      }

      try {
        const result = JSON.parse(stdout);
        res.json(result);
      } catch (parseErr: any) {
        console.error("[ConcurrencyLab IPC] Malformed JSON from engine:", parseErr.message);
        res.status(502).json({ 
          error: "Failed to parse engine JSON output", 
          details: parseErr.message,
          raw: stdout.slice(0, 1000) 
        });
      }
    }
  );
});

// Endpoint to generate full offline static bundle from C++ engine into frontend
app.post("/api/generate-all", async (req: Request, res: Response) => {
  try {
    const listRaw = await runEngine(["--list-scenarios"]);
    const { scenarios } = JSON.parse(listRaw);

    const bundle: Record<string, any> = {
      generatedAt: new Date().toISOString(),
      scenariosList: scenarios,
      runs: {}
    };

    for (const sc of scenarios) {
      const runRaw = await runEngine([
        "--scenario", sc.id,
        "--scheduler", sc.defaultScheduler.toLowerCase().replace("_", ""),
        "--quantum", String(sc.defaultQuantum || 1),
        "--run"
      ]);
      bundle.runs[sc.id] = JSON.parse(runRaw);
    }

    const targetDir = path.resolve(__dirname, "../../frontend/src/generated");
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    const targetFile = path.join(targetDir, "engineData.json");
    fs.writeFileSync(targetFile, JSON.stringify(bundle, null, 2), "utf8");

    console.log(`[ConcurrencyLab Adapter] Successfully exported all 10 engine runs to: ${targetFile}`);
    res.json({ success: true, count: scenarios.length, targetFile });
  } catch (err: any) {
    res.status(500).json({ error: "Export failed", message: err.message });
  }
});

function runEngine(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      ENGINE_EXE, 
      args, 
      { env, maxBuffer: 30 * 1024 * 1024, timeout: 15000 }, 
      (err, stdout, stderr) => {
        if (err) return reject(new Error(stderr || err.message));
        resolve(stdout);
      }
    );
  });
}

// Generate the engineData.json immediately on startup
runEngine(["--list-scenarios"]).then(async (listRaw) => {
  try {
    const { scenarios } = JSON.parse(listRaw);
    const bundle: Record<string, any> = {
      generatedAt: new Date().toISOString(),
      scenariosList: scenarios,
      runs: {}
    };

    for (const sc of scenarios) {
      const schedulerArg = sc.defaultScheduler === "ROUND_ROBIN" ? "rr" : sc.defaultScheduler.toLowerCase();
      const runRaw = await runEngine([
        "--scenario", sc.id,
        "--scheduler", schedulerArg,
        "--quantum", String(sc.defaultQuantum || 1),
        "--run"
      ]);
      bundle.runs[sc.id] = JSON.parse(runRaw);
    }

    const targetDir = path.resolve(__dirname, "../../frontend/src/generated");
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    fs.writeFileSync(path.join(targetDir, "engineData.json"), JSON.stringify(bundle, null, 2), "utf8");
    console.log(`[ConcurrencyLab] Pre-generated 10 authentic C++ engine simulation runs into frontend!`);
  } catch (e) {
    console.error("Initial generation failed:", e);
  }
}).catch(console.error);

app.listen(PORT, () => {
  console.log(`[ConcurrencyLab Engine Adapter] Server running at http://localhost:${PORT}`);
});
