import { execFileSync } from 'child_process';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENGINE_PATH = path.resolve(__dirname, 'engine/build/concurrency_lab_engine.exe');
const API_URL = 'http://localhost:3001/api';

const SCENARIOS = [
  'race_counter_2',
  'race_counter_3',
  'mutex_counter_2',
  'mutex_contention',
  'counting_semaphore',
  'producer_consumer_3',
  'dining_philosophers_deadlock',
  'dining_philosophers_safe',
  'deadlock_circular_wait',
  'deadlock_free_hierarchy',
];

const SCHEDULERS = [
  { name: 'rr_q1', scheduler: 'rr', quantum: 1, seed: 42, expectedPattern: '1,2,1,2,1,2' },
  { name: 'rr_q2', scheduler: 'rr', quantum: 2, seed: 42, expectedPattern: '1,1,2,2,1,2' },
  { name: 'fifo', scheduler: 'fifo', quantum: 1, seed: 42, expectedPattern: '1,1,1,2,2,2' },
  { name: 'random_s42', scheduler: 'random', quantum: 1, seed: 42, expectedPattern: '1,2,2,1,2,1' },
];

function postJson(endpoint, data) {
  return new Promise((resolve, reject) => {
    const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
    const req = http.request(
      `${API_URL}${endpoint}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(dataStr),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body), raw: body });
          } catch (e) {
            resolve({ status: res.statusCode, data: null, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(dataStr);
    req.end();
  });
}

async function runAudit() {
  console.log('=== STARTING EXHAUSTIVE CONCURRENCYLAB QA AUDIT ===\n');
  const results = {
    engineDirect: [],
    schedulerMatrix: [],
    randomReproducibility: null,
    ipcScenarios: [],
    ipcResilience: [],
    concurrentLoad: null,
    timeTravelIntegrity: [],
  };

  // 1. Direct Engine Executable Tests (All 10 Scenarios)
  console.log('--- 1. Testing C++ Engine Direct Execution (10 Scenarios) ---');
  for (const scen of SCENARIOS) {
    try {
      const out = execFileSync(ENGINE_PATH, ['--scenario', scen, '--scheduler', 'rr', '--quantum', '1', '--run'], {
        encoding: 'utf-8',
        maxBuffer: 25 * 1024 * 1024,
      });
      const parsed = JSON.parse(out);
      const hasEvents = Array.isArray(parsed.events) && parsed.events.length > 0;
      const hasSnapshots = Array.isArray(parsed.snapshots) && parsed.snapshots.length === parsed.events.length + 1;
      const hasInitial = !!parsed.snapshots[0] && parsed.snapshots[0].sequence === 0;
      const hasFinal = !!parsed.finalSnapshot && parsed.finalSnapshot.sequence === parsed.events.length;
      const hasTitle = !!parsed.scenarioTitle;
      
      const raceDetected = parsed.events.some(e => e.raceDetected);
      const deadlockDetected = parsed.snapshots.some(s => s.deadlockReport?.isDeadlocked);
      
      const pass = hasEvents && hasSnapshots && hasInitial && hasFinal && hasTitle;
      results.engineDirect.push({
        scenario: scen,
        title: parsed.scenarioTitle,
        events: parsed.events.length,
        snapshots: parsed.snapshots.length,
        raceDetected,
        deadlockDetected,
        status: pass ? 'PASS' : 'FAIL',
      });
      console.log(`[${pass ? 'PASS' : 'FAIL'}] Direct Engine: ${scen} (${parsed.scenarioTitle}) -> ${parsed.events.length} events, ${parsed.snapshots.length} snapshots, race=${raceDetected}, deadlock=${deadlockDetected}`);
    } catch (err) {
      console.error(`[FAIL] Direct Engine: ${scen}:`, err.message);
      results.engineDirect.push({ scenario: scen, status: 'FAIL', error: err.message });
    }
  }

  // 2. Multi-Scheduler Execution Matrix
  console.log('\n--- 2. Multi-Scheduler Execution Matrix (RoundRobin q=1, RoundRobin q=2, FIFO, Random s=42) ---');
  for (const s of SCHEDULERS) {
    try {
      const args = ['--scenario', 'race_counter_2', '--scheduler', s.scheduler, '--quantum', String(s.quantum), '--seed', String(s.seed), '--run'];
      const out = execFileSync(ENGINE_PATH, args, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
      const parsed = JSON.parse(out);
      const pattern = parsed.events.map(e => e.threadId).join(',');
      const pass = pattern === s.expectedPattern;
      results.schedulerMatrix.push({
        name: s.name,
        scheduler: s.scheduler,
        quantum: s.quantum,
        seed: s.seed,
        pattern,
        expectedPattern: s.expectedPattern,
        status: pass ? 'PASS' : 'FAIL',
      });
      console.log(`[${pass ? 'PASS' : 'FAIL'}] Scheduler ${s.name} -> pattern [${pattern}], expected [${s.expectedPattern}]`);
    } catch (err) {
      console.error(`[FAIL] Scheduler ${s.name}:`, err.message);
      results.schedulerMatrix.push({ name: s.name, status: 'FAIL', error: err.message });
    }
  }

  // 3. Test Seeded Random Reproducibility
  console.log('\n--- 3. Testing Seeded Random Reproducibility ---');
  try {
    const run1 = execFileSync(ENGINE_PATH, ['--scenario', 'race_counter_2', '--scheduler', 'random', '--seed', '42', '--run'], { encoding: 'utf-8' });
    const run2 = execFileSync(ENGINE_PATH, ['--scenario', 'race_counter_2', '--scheduler', 'random', '--seed', '42', '--run'], { encoding: 'utf-8' });
    const runDiff = execFileSync(ENGINE_PATH, ['--scenario', 'race_counter_2', '--scheduler', 'random', '--seed', '99999', '--run'], { encoding: 'utf-8' });

    const obj1 = JSON.parse(run1);
    const obj2 = JSON.parse(run2);
    const objDiff = JSON.parse(runDiff);

    const pattern1 = obj1.events.map(e => e.threadId).join(',');
    const pattern2 = obj2.events.map(e => e.threadId).join(',');
    const patternDiff = objDiff.events.map(e => e.threadId).join(',');

    const identicalRuns = run1 === run2;
    const differentRuns = pattern1 !== patternDiff;

    const pass = identicalRuns && differentRuns;
    results.randomReproducibility = {
      seed42Match: identicalRuns,
      seedSensitivity: differentRuns,
      seed42Pattern: pattern1,
      seed99999Pattern: patternDiff,
      status: pass ? 'PASS' : 'FAIL',
    };
    console.log(`[${pass ? 'PASS' : 'FAIL'}] Seeded Random Reproducibility: Seed 42 exact byte match = ${identicalRuns} (${pattern1}), Seed 99999 varied = ${differentRuns} (${patternDiff})`);
  } catch (err) {
    console.error('[FAIL] Seeded Random Test:', err.message);
    results.randomReproducibility = { status: 'FAIL', error: err.message };
  }

  // 4. Testing IPC Server /api/run Matrix (All 10 Scenarios)
  console.log('\n--- 4. Testing IPC Server /api/run Matrix ---');
  for (const scen of SCENARIOS) {
    try {
      const res = await postJson('/run', { scenarioId: scen, scheduler: 'rr', quantum: 1 });
      const pass = res.status === 200 && res.data && Array.isArray(res.data.events) && res.data.events.length > 0 && res.data.finalSnapshot;
      if (pass) {
        results.ipcScenarios.push({
          scenario: scen,
          status: 'PASS',
          httpStatus: res.status,
          events: res.data.events.length,
          snapshots: res.data.snapshots.length,
        });
        console.log(`[PASS] IPC /api/run ${scen} -> HTTP 200, Events: ${res.data.events.length}, Snapshots: ${res.data.snapshots.length}`);
      } else {
        results.ipcScenarios.push({ scenario: scen, status: 'FAIL', httpStatus: res.status, error: res.raw });
        console.error(`[FAIL] IPC /api/run ${scen} -> HTTP ${res.status}`);
      }
    } catch (err) {
      console.error(`[FAIL] IPC /api/run ${scen}:`, err.message);
      results.ipcScenarios.push({ scenario: scen, status: 'FAIL', error: err.message });
    }
  }

  // 5. Testing IPC Resilience & Input Validation Edge Cases
  console.log('\n--- 5. Testing IPC Resilience & Edge Cases ---');
  const edgeCases = [
    { name: 'Missing scenarioId', body: {}, expectedStatus: 400 },
    { name: 'Unknown scenarioId', body: { scenarioId: 'non_existent_scenario' }, expectedStatus: 400 },
    { name: 'Malicious scenarioId characters', body: { scenarioId: 'race;calc.exe' }, expectedStatus: 400 },
    { name: 'Invalid scheduler', body: { scenarioId: 'race_counter_2', scheduler: 'super_quantum' }, expectedStatus: 400 },
    { name: 'Negative quantum', body: { scenarioId: 'race_counter_2', quantum: -1 }, expectedStatus: 400 },
    { name: 'Zero quantum', body: { scenarioId: 'race_counter_2', quantum: 0 }, expectedStatus: 400 },
    { name: 'Excessive quantum (>1000)', body: { scenarioId: 'race_counter_2', quantum: 1001 }, expectedStatus: 400 },
    { name: 'Negative seed', body: { scenarioId: 'race_counter_2', scheduler: 'random', seed: -5 }, expectedStatus: 400 },
    { name: 'Malformed JSON string payload', body: '{"scenarioId": "race_counter_2", broken...', isRaw: true, expectedStatus: 400 },
  ];

  for (const tc of edgeCases) {
    try {
      const res = await postJson('/run', tc.body);
      const passed = res.status === tc.expectedStatus;
      results.ipcResilience.push({
        testCase: tc.name,
        expectedStatus: tc.expectedStatus,
        actualStatus: res.status,
        status: passed ? 'PASS' : 'FAIL',
        response: res.data || res.raw,
      });
      console.log(`[${passed ? 'PASS' : 'FAIL'}] ${tc.name} -> expected HTTP ${tc.expectedStatus}, got ${res.status}`);
    } catch (err) {
      console.error(`[FAIL] ${tc.name} encountered error:`, err.message);
      results.ipcResilience.push({ testCase: tc.name, status: 'FAIL', error: err.message });
    }
  }

  // 6. Concurrent Load Test (10 simultaneous requests)
  console.log('\n--- 6. Testing IPC Concurrent Execution ---');
  try {
    const promises = SCENARIOS.map((scen) => postJson('/run', { scenarioId: scen, scheduler: 'rr', quantum: 1 }));
    const responses = await Promise.all(promises);
    const all200 = responses.every((r) => r.status === 200 && r.data?.events);
    results.concurrentLoad = {
      totalRequests: SCENARIOS.length,
      successful: responses.filter((r) => r.status === 200).length,
      status: all200 ? 'PASS' : 'FAIL',
    };
    console.log(`[${results.concurrentLoad.status}] Concurrent Load: ${results.concurrentLoad.successful}/${results.concurrentLoad.totalRequests} succeeded.`);
  } catch (err) {
    console.error('[FAIL] Concurrent Load:', err.message);
    results.concurrentLoad = { status: 'FAIL', error: err.message };
  }

  // 7. Time-Travel Snapshot Determinism & Integrity Check
  console.log('\n--- 7. Testing Time-Travel Snapshot Determinism & Integrity ---');
  for (const scen of ['race_counter_2', 'deadlock_circular_wait', 'counting_semaphore']) {
    try {
      const out = execFileSync(ENGINE_PATH, ['--scenario', scen, '--scheduler', 'rr', '--quantum', '1', '--run'], { encoding: 'utf-8' });
      const parsed = JSON.parse(out);
      
      let integrityPass = true;
      let failureReason = '';

      // Sequence numbers must be monotonic 0, 1, ..., N
      if (parsed.snapshots[0].sequence !== 0) {
        integrityPass = false;
        failureReason = 'initialSnapshot sequence is not 0';
      }

      parsed.snapshots.forEach((snap, idx) => {
        if (snap.sequence !== idx) {
          integrityPass = false;
          failureReason = `Snapshot index ${idx} has sequence ${snap.sequence}, expected ${idx}`;
        }
      });

      // Events sequence matching
      parsed.events.forEach((ev, idx) => {
        if (ev.sequence !== idx + 1) {
          integrityPass = false;
          failureReason = `Event index ${idx} has sequence ${ev.sequence}, expected ${idx + 1}`;
        }
      });

      // Snapshot thread state consistency with event
      for (let i = 0; i < parsed.events.length; i++) {
        const ev = parsed.events[i];
        const snapAfter = parsed.snapshots[i + 1]; // snapshot after event i
        const threadInSnap = snapAfter.threads[String(ev.threadId)];
        if (!threadInSnap) {
          integrityPass = false;
          failureReason = `Thread ${ev.threadId} missing from snapshot at sequence ${snapAfter.sequence}`;
          break;
        }
        if (threadInSnap.pc !== ev.newPc) {
          integrityPass = false;
          failureReason = `Thread ${ev.threadId} PC mismatch at step ${ev.sequence}: event newPc=${ev.newPc}, snapshot pc=${threadInSnap.pc}`;
          break;
        }
      }

      results.timeTravelIntegrity.push({
        scenario: scen,
        totalSteps: parsed.events.length,
        status: integrityPass ? 'PASS' : 'FAIL',
        reason: failureReason || 'Monotonic sequences 0..N, state transitions & PC match 100%',
      });
      console.log(`[${integrityPass ? 'PASS' : 'FAIL'}] Time-Travel Integrity (${scen}): ${integrityPass ? 'Full Invariance Confirmed' : failureReason}`);
    } catch (err) {
      results.timeTravelIntegrity.push({ scenario: scen, status: 'FAIL', error: err.message });
      console.error(`[FAIL] Time-Travel Integrity (${scen}):`, err.message);
    }
  }

  console.log('\n=== ALL QA AUDITS FINISHED ===');
  return results;
}

runAudit()
  .then((res) => {
    fs.writeFileSync('test_audit_results.json', JSON.stringify(res, null, 2));
    console.log('\nDetailed QA audit results saved to test_audit_results.json');
  })
  .catch((err) => {
    console.error('Fatal audit failure:', err);
    process.exit(1);
  });
