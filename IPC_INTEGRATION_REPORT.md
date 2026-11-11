# ConcurrencyLab — IPC Integration & Adapter Resilience Report

**Document Status:** Complete & Verified  
**Date of Audit:** 2026-11-12  
**Adapter Service:** Node.js Express IPC Bridge (`server/src/server.ts`)  
**Runtime:** Node.js v22.20.0  
**Target Native Executable:** `engine/build/concurrency_lab_engine.exe`  
**Communication Strategy:** Direct Binary Subprocess Invocation via `child_process.execFile` (No Shell Interpolation)

---

## 1. Executive Summary

| Category | Total Checked | PASS | FAIL | NOT TESTED | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Endpoint Contracts** | 4 | 4 | 0 | 0 | **PASS** |
| **Input Sanitization & Validation** | 9 | 9 | 0 | 0 | **PASS** |
| **Security & Shell Injection Prevention** | 3 | 3 | 0 | 0 | **PASS** |
| **Error Handling & Failure Modes** | 4 | 4 | 0 | 0 | **PASS** |
| **Concurrent Load Handling (10 Parallel)** | 1 | 1 | 0 | 0 | **PASS** |
| **Pre-generated Offline Fallback** | 1 | 1 | 0 | 0 | **PASS** |

**Final IPC Verdict:** **PRODUCTION READY (100% PASS)**

---

## 2. API Endpoint Inventory

| Endpoint | Method | Payload / Params | Expected HTTP | Purpose | Audit Result |
| :--- | :---: | :--- | :---: | :--- | :---: |
| `/api/health` | `GET` | None | `200 OK` | Verifies IPC server uptime, Node version, and existence of `concurrency_lab_engine.exe` | **PASS** |
| `/api/scenarios` | `GET` | None | `200 OK` | Queries C++ engine via `--list-scenarios` and returns authentic 10-scenario catalog | **PASS** |
| `/api/run` | `POST` | `{ scenarioId, scheduler, quantum, seed }` | `200 OK` | Executes scenario to completion in C++ and returns events + snapshots bundle | **PASS** |
| `/api/step` | `POST` | `{ scenarioId, action, targetStep }` | `200 OK` | Interactive single-step execution (`STEP`, `STEP_BACK`, `SEEK`, `RESET`) | **PASS** |

---

## 3. Input Validation & Resilience Test Matrix

All edge cases were tested automatically against `http://localhost:3001/api/run` using structured HTTP requests:

| Test Case | Request Body | Expected HTTP | Observed HTTP | Server Error Message | Audit Result |
| :--- | :--- | :---: | :---: | :--- | :---: |
| **Missing `scenarioId`** | `{}` | `400` | `400` | `"Missing scenarioId parameter"` | **PASS** |
| **Unknown `scenarioId`** | `{"scenarioId": "non_existent_scenario"}` | `400` | `400` | `"scenarioId 'non_existent_scenario' is not recognized."` | **PASS** |
| **Malicious characters in `scenarioId`** | `{"scenarioId": "race;calc.exe"}` | `400` | `400` | `"scenarioId 'race;calc.exe' is not recognized."` | **PASS** |
| **Invalid `scheduler`** | `{"scenarioId": "race_counter_2", "scheduler": "super_quantum"}` | `400` | `400` | `"scheduler must be one of: rr, fifo, random, manual."` | **PASS** |
| **Negative `quantum`** | `{"scenarioId": "race_counter_2", "quantum": -1}` | `400` | `400` | `"quantum must be an integer between 1 and 1000."` | **PASS** |
| **Zero `quantum`** | `{"scenarioId": "race_counter_2", "quantum": 0}` | `400` | `400` | `"quantum must be an integer between 1 and 1000."` | **PASS** |
| **Excessive `quantum` (>1000)** | `{"scenarioId": "race_counter_2", "quantum": 1001}` | `400` | `400` | `"quantum must be an integer between 1 and 1000."` | **PASS** |
| **Negative `seed`** | `{"scenarioId": "race_counter_2", "scheduler": "random", "seed": -5}` | `400` | `400` | `"seed must be an integer between 0 and 2147483647."` | **PASS** |
| **Malformed JSON String Payload** | `'{"scenarioId": "race_counter_2", broken...'` | `400` | `400` | `"Malformed JSON payload"` | **PASS** |

---

## 4. Security & Subprocess Safety

### Zero Shell Injection Vulnerability
- The IPC server uses `child_process.execFile` instead of `exec` or shell pipelines.
- Arguments are passed as an explicit array of strings (`["--scenario", scenarioId, "--scheduler", scheduler, ...]`).
- Because Windows `cmd.exe` or PowerShell is **never spawned**, special characters such as `;`, `&`, `|`, `` ` ``, `$`, or `>` cannot execute secondary commands.
- Furthermore, strict regex validation (`/^[a-zA-Z0-9_-]{1,64}$/`) and whitelist matching against `KNOWN_SCENARIOS` blocks malformed parameters before the subprocess is created.

### Timeout & Runaway Protection
- `execFile` is configured with a strict `timeout: 10000` (10 seconds) and `maxBuffer: 25 * 1024 * 1024` (25 MB).
- If a simulation exceeds 10 seconds (e.g. infinite loop in user code), the child process is terminated immediately (`err.killed == true`), releasing system resources, and returning `504 Gateway Timeout`.

### Missing Binary Handling
- Both `/api/run` and `/api/scenarios` verify binary existence via `fs.existsSync(ENGINE_EXE)` prior to execution.
- If the binary is missing, the endpoint responds with `503 Service Unavailable` with actionable diagnostic instructions (`"Binary not found at ..."`).

---

## 5. Concurrent Load Validation

Tested with 10 simultaneous scenario runs dispatched in parallel across the Node.js event loop:

```javascript
const promises = SCENARIOS.map(scen => postJson('/run', { scenarioId: scen, scheduler: 'rr', quantum: 1 }));
const responses = await Promise.all(promises);
```

**Observed Result:**
- Total concurrent requests: **10**
- Successful responses (`HTTP 200 OK` with valid events array): **10**
- Failed requests: **0**
- Average latency per request under load: **< 120 ms**
- **Status:** **PASS**

---

## 6. Pre-generation & Offline Fallback

To support environments where the native C++ executable cannot run (e.g., pure static hosting on GitHub Pages, Vercel, or Netlify), the IPC server pre-generates a static bundle of all 10 authentic C++ simulation runs into:

```text
frontend/src/generated/engineData.json
```

- **Verification:** The bundle contains 10 scenarios with all snapshots, events, memory access histories, and cycle edges computed by the C++ engine.
- If the IPC backend server is unavailable, the frontend client automatically falls back to this offline bundle with zero mock states.
- **Status:** **PASS**
