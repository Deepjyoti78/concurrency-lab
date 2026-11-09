import express from "express";
import cors from "cors";
import { execFile, spawn } from "child_process";
import path from "path";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const MINGW_BIN = "C:\\Users\\deepjyoti\\AppData\\Local\\Microsoft\\WinGet\\Packages\\BrechtSanders.WinLibs.POSIX.UCRT_Microsoft.Winget.Source_8wekyb3d8bbwe\\mingw64\\bin";
const ENGINE_EXE = path.resolve(__dirname, "../../engine/build/concurrency_lab_engine.exe");

const env = {
  ...process.env,
  PATH: `${MINGW_BIN};${process.env.PATH || ""}`
};

// Check engine exists
const engineExists = fs.existsSync(ENGINE_EXE);
console.log(`[ConcurrencyLab Adapter] Engine executable at: ${ENGINE_EXE} (Exists: ${engineExists})`);

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    engineFound: fs.existsSync(ENGINE_EXE),
    enginePath: ENGINE_EXE
  });
});

app.get("/api/scenarios", (req, res) => {
  execFile(ENGINE_EXE, ["--list-scenarios"], { env, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
    if (err) {
      console.error("Error listing scenarios:", err, stderr);
      return res.status(500).json({ error: "Failed to execute C++ engine", details: stderr || err.message });
    }
    try {
      const data = JSON.parse(stdout);
      res.json(data);
    } catch (parseErr) {
      res.status(500).json({ error: "Failed to parse engine output", raw: stdout });
    }
  });
});

app.post("/api/run", (req, res) => {
  const { scenarioId = "race_counter_2", scheduler = "rr", quantum = 1, seed = 42 } = req.body;

  const args = [
    "--scenario", scenarioId,
    "--scheduler", scheduler,
    "--quantum", String(quantum),
    "--seed", String(seed),
    "--run"
  ];

  execFile(ENGINE_EXE, args, { env, maxBuffer: 25 * 1024 * 1024 }, (err, stdout, stderr) => {
    if (err) {
      console.error("Error executing engine:", err, stderr);
      return res.status(500).json({ error: "Execution failed", details: stderr || err.message });
    }
    try {
      const result = JSON.parse(stdout);
      res.json(result);
    } catch (parseErr) {
      res.status(500).json({ error: "Failed to parse engine JSON output", raw: stdout });
    }
  });
});

// Endpoint to generate full offline static bundle from C++ engine into frontend
app.post("/api/generate-all", async (req, res) => {
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
    execFile(ENGINE_EXE, args, { env, maxBuffer: 30 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr || err.message));
      resolve(stdout);
    });
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
