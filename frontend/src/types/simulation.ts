export type ThreadState = 'NEW' | 'READY' | 'RUNNING' | 'BLOCKED' | 'TERMINATED';

export interface Instruction {
  opcode: string;
  arg1: string;
  arg2: string;
  immediate: number;
  description: string;
  sourceCode: string;
  disassembly: string;
}

export interface Thread {
  id: number;
  name: string;
  state: ThreadState;
  pc: number;
  color: string;
  blockedOn: string;
  registers: Record<string, number>;
  heldMutexes: string[];
}

export interface VariableMetadata {
  value: number;
  previousValue: number;
  lastModifiedByThreadId: number;
  lastModifiedTimestamp: number;
  writeCount: number;
  readCount: number;
}

export interface MutexState {
  name: string;
  locked: boolean;
  ownerThreadId: number | null;
  ownerThreadName: string;
  acquisitionCount: number;
  contentionCount: number;
  waitingQueue: number[];
}

export interface SemaphoreState {
  name: string;
  initialCount: number;
  currentCount: number;
  waitOpsCount: number;
  signalOpsCount: number;
  waitingQueue: number[];
}

export interface MemoryDelta {
  variable: string;
  oldValue: number;
  newValue: number;
  type: 'READ' | 'WRITE';
}

export interface MemoryAccessRecord {
  sequence: number;
  timestamp: number;
  threadId: number;
  threadName: string;
  variable: string;
  type: 'READ' | 'WRITE';
  value: number;
  previousValue: number;
}

export interface SynchronizationInfo {
  type: string;
  resourceName: string;
  action: string;
  success: boolean;
  unblockedThreadId: number | null;
}

export interface RaceConflict {
  variable: string;
  firstThreadId: number;
  firstThreadName: string;
  firstAccessType: string;
  firstValue: number;
  secondThreadId: number;
  secondThreadName: string;
  secondAccessType: string;
  secondValue: number;
  conflictType: string;
  explanation: string;
  remediation: string;
}

export interface WaitForEdge {
  waitingThreadId: number;
  waitingThreadName: string;
  holdingThreadId: number;
  holdingThreadName: string;
  resourceName: string;
}

export interface DeadlockReport {
  isDeadlocked: boolean;
  deadlockedThreadIds: number[];
  involvedResources: string[];
  cycleEdges: WaitForEdge[];
  cycleDescription: string;
  explanation: string;
  remediation: string;
}

export interface ExecutionEvent {
  sequence: number;
  timestamp: number;
  threadId: number;
  threadName: string;
  instruction: Instruction;
  previousThreadState: ThreadState;
  previousPc: number;
  newThreadState: ThreadState;
  newPc: number;
  memoryDeltas: MemoryDelta[];
  synchronization: SynchronizationInfo;
  raceDetected: boolean;
  raceDetails: RaceConflict | null;
  deadlockDetected: boolean;
  deadlockDetails: DeadlockReport | null;
  explanation: string;
}

export interface SimulationSnapshot {
  sequence: number;
  timestamp: number;
  threads: Record<string, Thread>;
  readyQueue: number[];
  sharedVariables: Record<string, VariableMetadata>;
  memoryAccessHistory?: MemoryAccessRecord[];
  mutexes: Record<string, MutexState>;
  semaphores: Record<string, SemaphoreState>;
  deadlockReport: DeadlockReport;
}

export interface SimulationRunResult {
  scenarioId: string;
  scenarioTitle: string;
  totalSteps: number;
  isCompleted: boolean;
  events: ExecutionEvent[];
  snapshots: SimulationSnapshot[];
  finalSnapshot: SimulationSnapshot | null;
}

export interface ScenarioMetadata {
  id: string;
  title: string;
  moduleId: string;
  moduleTitle: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  objective: string;
  description: string;
  expectedOutcome: string;
  keyTakeaway: string;
  defaultScheduler: string;
  defaultQuantum: number;
}
