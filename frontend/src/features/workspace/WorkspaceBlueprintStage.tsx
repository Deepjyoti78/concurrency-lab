import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { IsometricGrid } from '../../components/illustrations/IsometricGrid';
import { DataPacket } from '../../components/illustrations/DataPacket';
import type { ExecutionEvent, SimulationSnapshot } from '../../types/simulation';

interface WorkspaceBlueprintStageProps {
  scenarioId: string;
  snapshot: SimulationSnapshot | null;
  currentEvent: ExecutionEvent | null;
  currentStep: number;
  totalSteps: number;
  quantum: number;
  scheduler: string;
}

const ASSET_SHARED = '/assets/race-shared-state.png';
const ASSET_CPU_SCHED = '/assets/cpu-scheduler.png';

// Losslessly cropped 4-component set for Race Conditions
const RACE_T1 = '/assets/ws-race-t1.png';
const RACE_T2 = '/assets/ws-race-t2.png';
const RACE_SHARED = '/assets/ws-race-shared.png';
const RACE_CUBE = '/assets/ws-race-cube.png';

// Smooth 12-point circular orbital path for Shared State coin discs
const RACE_COIN_ORBIT_X = Array.from({ length: 13 }, (_, i) => +(Math.cos((i / 12) * Math.PI * 2) * 11).toFixed(2));
const RACE_COIN_ORBIT_Y = Array.from({ length: 13 }, (_, i) => +(Math.sin((i / 12) * Math.PI * 2) * 6.2).toFixed(2));

type ConceptKind = 'race' | 'scheduling' | 'mutex' | 'deadlock';

function resolveConcept(scenarioId: string): ConceptKind {
  if (scenarioId === 'race_counter_3') return 'scheduling';
  if (scenarioId.includes('mutex') || scenarioId.includes('semaphore') || scenarioId.includes('producer')) {
    return 'mutex';
  }
  if (scenarioId.includes('deadlock') || scenarioId.includes('dining')) {
    return 'deadlock';
  }
  return 'race';
}

/* Shared Corner L-Brackets & '+' Registration Marks */
const BlueprintFrame: React.FC<{ prefersReducedMotion: boolean | null }> = ({ prefersReducedMotion }) => (
  <>
    <defs>
      <marker id="ws-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto">
        <path d="M 1 2 L 8 5 L 1 8 z" fill="#141413" />
      </marker>
      <marker id="ws-arrow-accent" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto">
        <path d="M 1 2 L 8 5 L 1 8 z" fill="#9E381E" />
      </marker>
    </defs>

    <IsometricGrid width={760} height={305} />

    <g stroke="#141413" strokeWidth="1" fill="none" opacity="0.7">
      <polyline points="20,40 20,26 34,26" />
      <polyline points="726,26 740,26 740,40" />
      <polyline points="20,268 20,282 34,282" />
      <polyline points="726,282 740,282 740,268" />
    </g>

    <motion.g
      stroke="#141413"
      strokeWidth="1"
      animate={prefersReducedMotion ? undefined : { opacity: [0.45, 0.85, 0.45] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      <line x1="380" y1="6" x2="380" y2="16" />
      <line x1="375" y1="11" x2="385" y2="11" />
      <line x1="650" y1="276" x2="650" y2="286" />
      <line x1="645" y1="281" x2="655" y2="281" />
    </motion.g>
  </>
);

/* ==================== 1. RACE CONDITIONS STAGE ==================== */
const RaceConditionsBlueprint: React.FC<WorkspaceBlueprintStageProps & { prefersReducedMotion: boolean | null }> = ({
  snapshot,
  currentEvent,
  currentStep,
  totalSteps,
  prefersReducedMotion
}) => {
  // Exact 30-degree isometric ground-plane floor tracks sized for medium models (tan 30° ≈ 0.577)
  const PATH_T1_TO_SHARED = 'M 178,188 L 250,230 Q 256,233.5 262,230 L 334,188';
  const PATH_SHARED_TO_T1 = 'M 334,188 L 262,230 Q 256,233.5 250,230 L 178,188';
  const PATH_T2_TO_SHARED = 'M 582,188 L 510,230 Q 504,233.5 498,230 L 426,188';
  const PATH_SHARED_TO_T2 = 'M 426,188 L 498,230 Q 504,233.5 510,230 L 582,188';

  const threads = snapshot?.threads ? Object.values(snapshot.threads) : [];
  const t1 = threads[0];
  const t2 = threads[1];

  const sharedEntries = snapshot?.sharedVariables ? Object.entries(snapshot.sharedVariables) : [];
  const primaryVar = sharedEntries[0];
  const varName = primaryVar ? (primaryVar[0] === 'counter' ? 'X' : primaryVar[0]) : 'X';
  const varValue = primaryVar ? primaryVar[1].value : 0;

  const isT1Active = currentEvent?.threadId === t1?.id;
  const isT2Active = currentEvent?.threadId === t2?.id;
  const isT1Read = isT1Active && currentEvent?.memoryDeltas?.some((d) => d.type === 'READ');
  const isT2Read = isT2Active && currentEvent?.memoryDeltas?.some((d) => d.type === 'READ');
  const isWriteEvent = !!currentEvent?.memoryDeltas?.some((d) => d.type === 'WRITE');
  const isRace = !!currentEvent?.raceDetected;

  const statusLine = isRace
    ? 'UNSYNCHRONIZED WRITE // LOST_UPDATE'
    : currentEvent
    ? `${currentEvent.threadName.toUpperCase()} // ${currentEvent.instruction.disassembly}`
    : `READY_STATE // STEP ${currentStep} OF ${totalSteps}`;

  const leftActivePath = isT1Read ? PATH_SHARED_TO_T1 : PATH_T1_TO_SHARED;
  const rightActivePath = isT2Read ? PATH_SHARED_TO_T2 : PATH_T2_TO_SHARED;

  const leftTrackColor = isT1Active ? '#9E381E' : '#141413';
  const rightTrackColor = isT2Active ? '#9E381E' : '#141413';

  return (
    <>
      {/* 1. Fixed Isometric Ground-Lying Dotted Tracks + Floor-Projected Arrowheads */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Floor Contact Shadow Ribbons */}
        <path d={PATH_T1_TO_SHARED} stroke="rgba(20, 20, 19, 0.07)" strokeWidth="4.5" />
        <path d={PATH_T2_TO_SHARED} stroke="rgba(20, 20, 19, 0.07)" strokeWidth="4.5" />

        {/* Fixed Isometric Ground Tracks */}
        <path
          d={PATH_T1_TO_SHARED}
          stroke={leftTrackColor}
          strokeOpacity={isT1Active ? 0.95 : 0.68}
          strokeWidth={isT1Active ? '1.5' : '1.25'}
          strokeDasharray="2.5, 4.2"
        />
        <path
          d={PATH_T2_TO_SHARED}
          stroke={rightTrackColor}
          strokeOpacity={isT2Active ? 0.95 : 0.68}
          strokeWidth={isT2Active ? '1.5' : '1.25'}
          strokeDasharray="2.5, 4.2"
        />
      </g>

      {/* Flat Isometric Ground-Plane Arrowheads (lying directly on the 30° floor plane!) */}
      {isT1Read ? (
        <polygon points="175,186 186,187 181,194" fill={leftTrackColor} />
      ) : (
        <polygon points="338,186 327,187 332,194" fill={leftTrackColor} />
      )}
      {isT2Read ? (
        <polygon points="585,186 574,187 579,194" fill={rightTrackColor} />
      ) : (
        <polygon points="422,186 433,187 428,194" fill={rightTrackColor} />
      )}

      {/* 2. MODEL: T1 [R1] — MEDIUM SCALE, FIXED BASE + SMOOTH INTERNAL CAP PRESS */}
      <svg x={74} y={64} width={122} height={155} viewBox="0 0 673 854" overflow="visible">
        <defs>
          <clipPath id="ws-r-t1-base">
            <path d="M 0,435 L 116,435 L 116,492 L 336,612 L 556,492 L 556,435 L 673,435 L 673,854 L 0,854 Z" />
          </clipPath>
          <clipPath id="ws-r-t1-cap">
            <path d="M 0,0 L 673,0 L 673,435 L 556,435 L 556,492 L 336,612 L 116,492 L 116,435 L 0,435 Z" />
          </clipPath>
        </defs>

        <image href={RACE_T1} x="0" y="0" width="673" height="854" clipPath="url(#ws-r-t1-base)" />
        <polygon points="336,280 554,398 336,516 118,398" fill="#FAF9F7" />

        <motion.g
          animate={prefersReducedMotion ? undefined : isT1Active ? { y: [0, 14, 0] } : { y: [0, 7, 0] }}
          transition={{ duration: isT1Active ? 0.7 : 2.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <image href={RACE_T1} x="0" y="0" width="673" height="854" clipPath="url(#ws-r-t1-cap)" />
          <motion.circle
            cx="171"
            cy="90"
            r="20"
            fill="#7C3AED"
            animate={prefersReducedMotion ? undefined : { scale: isT1Active ? [1, 1.28, 1] : [1, 1.1, 1] }}
            transition={{ duration: isT1Active ? 0.6 : 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.g>
      </svg>

      {t1 && Object.keys(t1.registers).length > 0 && (
        <g transform="translate(135, 224)">
          <rect x="-24" y="-8.5" width="48" height="17" rx="3.5" fill="#FFFFFF" stroke={isT1Active ? '#7C3AED' : '#141413'} strokeWidth="1" />
          <text x="0" y="2.8" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8.8" fontWeight="700" fill={isT1Active ? '#6D28D9' : '#141413'}>
            r1 = {Object.values(t1.registers)[0]}
          </text>
        </g>
      )}

      {/* 3. MODEL: SHARED STATE (X) — MEDIUM SCALE, FIXED BODY + CIRCULARLY ORBITING COINS + LIVE VALUE */}
      <svg x={316} y={42} width={128} height={178} viewBox="0 0 749 1040" overflow="visible">
        <defs>
          <clipPath id="ws-r-sh-body" clipRule="evenodd">
            <path
              clipRule="evenodd"
              d="M 0,0 L 749,0 L 749,1040 L 0,1040 Z M 284,324 L 464,324 L 464,492 Q 374,560 284,492 Z"
            />
          </clipPath>
          <clipPath id="ws-r-sh-coin-bot">
            <path d="M 284,464 Q 374,522 464,464 L 464,558 Q 374,606 284,558 Z" />
          </clipPath>
          <clipPath id="ws-r-sh-coin-mid">
            <path d="M 284,424 Q 374,482 464,424 L 464,468 Q 374,524 284,468 Z" />
          </clipPath>
          <clipPath id="ws-r-sh-coin-top">
            <path d="M 284,326 L 464,326 L 464,426 Q 374,484 284,426 Z" />
          </clipPath>
        </defs>

        <image href={RACE_SHARED} x="0" y="0" width="749" height="1040" clipPath="url(#ws-r-sh-body)" />
        <path
          d="M 280,418 L 368,364 Q 374,360 380,364 L 468,418 L 468,522 L 280,522 Z"
          fill="#FAF9F7"
          stroke="#141413"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <ellipse cx="374" cy="495" rx="94" ry="44" fill="#FAF9F7" />
        <line x1="374" y1="224" x2="374" y2="365" stroke="#141413" strokeWidth="6" />

        <motion.g
          animate={prefersReducedMotion ? undefined : { x: RACE_COIN_ORBIT_X, y: RACE_COIN_ORBIT_Y }}
          transition={{ duration: isWriteEvent || isRace ? 1.8 : 3.4, repeat: Infinity, ease: 'linear', delay: 0 }}
        >
          <image href={RACE_SHARED} x="0" y="0" width="749" height="1040" clipPath="url(#ws-r-sh-coin-bot)" />
        </motion.g>
        <motion.g
          animate={prefersReducedMotion ? undefined : { x: RACE_COIN_ORBIT_X, y: RACE_COIN_ORBIT_Y }}
          transition={{ duration: isWriteEvent || isRace ? 1.8 : 3.4, repeat: Infinity, ease: 'linear', delay: 0.25 }}
        >
          <image href={RACE_SHARED} x="0" y="0" width="749" height="1040" clipPath="url(#ws-r-sh-coin-mid)" />
        </motion.g>
        <motion.g
          animate={prefersReducedMotion ? undefined : { x: RACE_COIN_ORBIT_X, y: RACE_COIN_ORBIT_Y }}
          transition={{ duration: isWriteEvent || isRace ? 1.8 : 3.4, repeat: Infinity, ease: 'linear', delay: 0.5 }}
        >
          <image href={RACE_SHARED} x="0" y="0" width="749" height="1040" clipPath="url(#ws-r-sh-coin-top)" />
        </motion.g>

        {/* Zero-ghosting opaque live shared state value inside riveted plate */}
        <rect x="278" y="694" width="192" height="96" rx="8" fill={isRace ? '#FEF3C7' : '#FFFFFF'} />
        <text
          x="374"
          y="760"
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
          fontSize="52"
          fontWeight="700"
          fill={isRace ? '#9E381E' : '#141413'}
        >
          {varName} = {varValue}
        </text>
      </svg>

      {/* 4. MODEL: T2 [R2] — MEDIUM SCALE, FIXED BASE + SMOOTH INTERNAL CAP PRESS */}
      <svg x={564} y={64} width={122} height={155} viewBox="0 0 686 856" overflow="visible">
        <defs>
          <clipPath id="ws-r-t2-base">
            <path d="M 0,435 L 118,435 L 118,492 L 343,612 L 568,492 L 568,435 L 686,435 L 686,856 L 0,856 Z" />
          </clipPath>
          <clipPath id="ws-r-t2-cap">
            <path d="M 0,0 L 686,0 L 686,435 L 568,435 L 568,492 L 343,612 L 118,492 L 118,435 L 0,435 Z" />
          </clipPath>
        </defs>

        <image href={RACE_T2} x="0" y="0" width="686" height="856" clipPath="url(#ws-r-t2-base)" />
        <polygon points="343,280 566,398 343,516 120,398" fill="#FAF9F7" />

        <motion.g
          animate={prefersReducedMotion ? undefined : isT2Active ? { y: [0, 14, 0] } : { y: [0, 7, 0] }}
          transition={{ duration: isT2Active ? 0.7 : 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}
        >
          <image href={RACE_T2} x="0" y="0" width="686" height="856" clipPath="url(#ws-r-t2-cap)" />
          <motion.circle
            cx="167"
            cy="91"
            r="20"
            fill="#059669"
            animate={prefersReducedMotion ? undefined : { scale: isT2Active ? [1, 1.28, 1] : [1, 1.1, 1] }}
            transition={{ duration: isT2Active ? 0.6 : 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          />
        </motion.g>
      </svg>

      {t2 && Object.keys(t2.registers).length > 0 && (
        <g transform="translate(625, 224)">
          <rect x="-24" y="-8.5" width="48" height="17" rx="3.5" fill="#FFFFFF" stroke={isT2Active ? '#059669' : '#141413'} strokeWidth="1" />
          <text x="0" y="2.8" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8.8" fontWeight="700" fill={isT2Active ? '#047857' : '#141413'}>
            r2 = {Object.values(t2.registers)[0]}
          </text>
        </g>
      )}

      {/* 5. COMPACT ISOMETRIC CUBE PACKETS FLOWING SLOWLY ALONG THE GROUND FLOOR TRACKS */}
      {!prefersReducedMotion && (
        <>
          {[0, -1.5, -3.0].map((delay, idx) => (
            <g key={`rl-${idx}-${isT1Read ? 'r' : 'w'}`} opacity={isT1Active || (!isT1Active && !isT2Active) ? 1 : 0.45}>
              <animateMotion path={leftActivePath} dur={isT1Active ? '2.4s' : '4.5s'} begin={`${delay}s`} repeatCount="indefinite" />
              <ellipse cx="0" cy="5.5" rx="4.8" ry="1.9" fill="rgba(20, 20, 19, 0.16)" />
              <image href={RACE_CUBE} x={-6.5} y={-8} width={13} height={15} preserveAspectRatio="xMidYMid meet" />
            </g>
          ))}
          {[0, -1.5, -3.0].map((delay, idx) => (
            <g key={`rr-${idx}-${isT2Read ? 'r' : 'w'}`} opacity={isT2Active || (!isT1Active && !isT2Active) ? 1 : 0.45}>
              <animateMotion path={rightActivePath} dur={isT2Active ? '2.4s' : '4.5s'} begin={`${delay}s`} repeatCount="indefinite" />
              <ellipse cx="0" cy="5.5" rx="4.8" ry="1.9" fill="rgba(20, 20, 19, 0.16)" />
              <image href={RACE_CUBE} x={-6.5} y={-8} width={13} height={15} preserveAspectRatio="xMidYMid meet" />
            </g>
          ))}
        </>
      )}

      <text x="380" y="282" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fontWeight="600" fill={isRace ? '#9E381E' : '#595751'} letterSpacing="0.08em">
        {statusLine}
      </text>
    </>
  );
};

/* ==================== 2. THREAD SCHEDULING STAGE ==================== */
const SchedulingBlueprint: React.FC<WorkspaceBlueprintStageProps & { prefersReducedMotion: boolean | null }> = ({
  snapshot,
  currentEvent,
  currentStep,
  totalSteps,
  quantum,
  scheduler,
  prefersReducedMotion
}) => {
  const threads = snapshot?.threads ? Object.values(snapshot.threads).slice(0, 3) : [];
  const activeThreadId = currentEvent?.threadId;
  const sharedEntries = snapshot?.sharedVariables ? Object.entries(snapshot.sharedVariables) : [];
  const primaryVarVal = sharedEntries[0] ? sharedEntries[0][1].value : 0;

  // Fixed floor tracks from T1/T2/T3 ready-queue plinths -> CPU Scheduler -> Output Shared Register
  const queuePaths = [
    'M 182,74 L 236,74 Q 254,74 266,110 L 298,144',
    'M 182,146 L 236,146 L 292,158',
    'M 182,218 L 236,218 Q 254,218 266,192 L 298,172'
  ];
  const cpuToMemPath = 'M 476,158 L 570,158';
  const queueColors = ['#A78BFA', '#6EE7B7', '#FBBF24'];

  const statusLine = currentEvent
    ? `DISPATCH // ${currentEvent.threadName.toUpperCase()} (${scheduler.toUpperCase()}, q=${quantum}) // ${currentStep}/${totalSteps}`
    : `READY_QUEUE [${threads.length} THREADS] // QUANTUM q=${quantum}`;

  return (
    <>
      {/* Left Ready Queue Isometric Plinths (T1, T2, T3) */}
      {threads.map((t, idx) => {
        const cy = 74 + idx * 72;
        const isOnCpu = activeThreadId === t.id;
        const dotColor = idx === 0 ? '#7C3AED' : idx === 1 ? '#059669' : '#D97706';

        return (
          <g key={t.id} transform={`translate(118, ${cy})`}>
            <motion.g
              animate={prefersReducedMotion ? undefined : isOnCpu ? { x: 6, y: -2 } : { x: 0, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              {isOnCpu && (
                <ellipse cx="0" cy="18" rx="64" ry="20" fill="rgba(158, 56, 30, 0.14)" />
              )}
              <ellipse cx="0" cy="22" rx="56" ry="16" fill="rgba(20, 20, 19, 0.06)" />
              {/* Isometric Queue Card Plinth */}
              <polygon points="-58,0 0,24 0,32 -58,8" fill="#E6E3DA" stroke="#141413" strokeWidth="1.25" strokeLinejoin="round" />
              <polygon points="0,24 58,0 58,8 0,32" fill="#D5D1C7" stroke="#141413" strokeWidth="1.25" strokeLinejoin="round" />
              <polygon points="0,-22 58,0 0,24 -58,0" fill={isOnCpu ? '#FAF0E8' : '#FFFFFF'} stroke={isOnCpu ? '#9E381E' : '#141413'} strokeWidth="1.3" strokeLinejoin="round" />

              {/* Floating Thread Pill above Plinth */}
              <line x1="0" y1="-24" x2="0" y2="-10" stroke="#141413" strokeWidth="1" />
              <g transform="translate(0, -34)">
                <rect x="-48" y="-10" width="96" height="20" rx="10" fill="#FFFFFF" stroke={isOnCpu ? '#9E381E' : '#141413'} strokeWidth="1.15" />
                <circle cx="-36" cy="0" r="3" fill={dotColor} />
                <text x="5" y="3.5" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fontWeight="700" fill="#141413">
                  {t.name}
                </text>
              </g>

              {/* Centered PC Counter on Plinth Top */}
              <text x="0" y="4" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9.5" fontWeight="700" fill={isOnCpu ? '#9E381E' : '#595751'}>
                PC:{t.pc}
              </text>
            </motion.g>
          </g>
        );
      })}

      {/* Fixed Dotted Floor Tracks from Queue Slots -> CPU Scheduler -> Shared Counter */}
      <g fill="none" strokeLinecap="round">
        {threads.map((t, idx) => {
          const isOnCpu = activeThreadId === t.id;
          return (
            <g key={`qp-${t.id}`}>
              <path d={queuePaths[idx]} stroke="rgba(20, 20, 19, 0.07)" strokeWidth="4" />
              <path
                d={queuePaths[idx]}
                stroke={isOnCpu ? '#141413' : '#78716C'}
                strokeWidth={isOnCpu ? '1.5' : '1.2'}
                strokeDasharray="3.5,3.5"
                markerEnd={isOnCpu ? 'url(#ws-arrow-accent)' : 'url(#ws-arrow)'}
              />
            </g>
          );
        })}

        <path d={cpuToMemPath} stroke="rgba(20, 20, 19, 0.07)" strokeWidth="4" />
        <path
          d={cpuToMemPath}
          stroke={currentEvent ? '#141413' : '#78716C'}
          strokeWidth="1.4"
          strokeDasharray="3.5,3.5"
          markerEnd={currentEvent ? 'url(#ws-arrow-accent)' : 'url(#ws-arrow)'}
        />
      </g>

      {/* Center CPU Scheduler IC Package + Quantum Time-Slice Meter */}
      <motion.g
        animate={prefersReducedMotion ? undefined : currentEvent ? { y: [0, -3, 0] } : { y: [0, -1.2, 0] }}
        transition={currentEvent ? { duration: 0.4 } : { duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Top Time-Slice Gauge */}
        <g transform="translate(384, 56)">
          <text x="0" y="-12" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fontWeight="700" fill="#595751" letterSpacing="0.08em">
            TIME_SLICE (q={quantum})
          </text>
          <rect x="-54" y="-4" width="108" height="12" rx="2" fill="#FFFFFF" stroke="#141413" strokeWidth="1.15" />
          <motion.rect
            x="-51" y="-1.5" height="7" rx="1" fill="#9E381E"
            animate={prefersReducedMotion ? { width: 32 } : { width: [18, 102, 18] }}
            transition={{ duration: Math.max(1.2, quantum * 0.9), repeat: Infinity, ease: 'linear' }}
          />
        </g>
        <line x1="384" y1="68" x2="384" y2="86" stroke="#141413" strokeWidth="1" strokeDasharray="2,2" />

        {currentEvent && (
          <motion.ellipse
            key={`sched-ring-${currentStep}`}
            cx="384" cy="162" rx="88" ry="38" fill="none" stroke="#9E381E" strokeWidth="1.2" strokeDasharray="4,4"
            initial={{ opacity: 0.85, scale: 0.9 }} animate={{ opacity: 0, scale: 1.18 }} transition={{ duration: 0.85 }}
          />
        )}

        <image href={ASSET_CPU_SCHED} x={292} y={80} width={185} height={159} preserveAspectRatio="xMidYMid meet" />
      </motion.g>

      {/* Right Shared Output Counter Block */}
      <g transform="translate(634, 154)">
        <motion.g
          animate={prefersReducedMotion ? undefined : currentEvent ? { y: [0, 3, 0] } : undefined}
          transition={{ duration: 0.35 }}
        >
          <ellipse cx="0" cy="48" rx="54" ry="18" fill="rgba(20, 20, 19, 0.07)" />
          <polygon points="-50,-6 0,20 0,56 -50,30" fill="#F2E6DF" stroke="#141413" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="0,20 50,-6 50,30 0,56" fill="#E6D2C7" stroke="#141413" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="0,-32 50,-6 0,20 -50,-6" fill="#FAF0E8" stroke="#141413" strokeWidth="1.3" strokeLinejoin="round" />
          <rect x="-32" y="14" width="64" height="22" rx="4" fill="#FFFFFF" stroke="#141413" strokeWidth="1.15" />
          <text x="0" y="28.5" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11.5" fontWeight="700" fill="#9E381E">
            X = {primaryVarVal}
          </text>
          <text x="0" y="-42" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9.5" fontWeight="700" fill="#141413">
            SHARED COUNTER
          </text>
        </motion.g>
      </g>

      {/* Moving Cubes Only along Queue Tracks & Output Track */}
      {!prefersReducedMotion && (
        <>
          {threads.map((t, idx) => {
            const isOnCpu = activeThreadId === t.id;
            return (
              <g key={`sq-${t.id}`} opacity={isOnCpu || !activeThreadId ? 1 : 0.35}>
                <animateMotion path={queuePaths[idx]} dur={isOnCpu ? '1.2s' : '2.8s'} begin={`${-idx * 0.7}s`} repeatCount="indefinite" />
                <ellipse cx="0" cy="7" rx="5.5" ry="2.2" fill="rgba(20, 20, 19, 0.16)" />
                <DataPacket x={0} y={0} size={5.5} color={queueColors[idx]} />
              </g>
            );
          })}
          {[0, -1.1].map((delay, idx) => (
            <g key={`so-${idx}`}>
              <animateMotion path={cpuToMemPath} dur="1.5s" begin={`${delay}s`} repeatCount="indefinite" />
              <ellipse cx="0" cy="7" rx="5.5" ry="2.2" fill="rgba(20, 20, 19, 0.16)" />
              <DataPacket x={0} y={0} size={5.8} color="#9E381E" />
            </g>
          ))}
        </>
      )}

      <text x="380" y="282" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10.5" fontWeight="600" fill="#595751" letterSpacing="0.08em">
        {statusLine}
      </text>
    </>
  );
};

/* ==================== 3. MUTUAL EXCLUSION STAGE ==================== */
const MutexBlueprint: React.FC<WorkspaceBlueprintStageProps & { prefersReducedMotion: boolean | null }> = ({
  snapshot,
  currentStep,
  totalSteps,
  prefersReducedMotion
}) => {
  const threads = snapshot?.threads ? Object.values(snapshot.threads).slice(0, 2) : [];
  const t1 = threads[0];
  const t2 = threads[1];

  const mutexList = snapshot?.mutexes ? Object.values(snapshot.mutexes) : [];
  const semList = snapshot?.semaphores ? Object.values(snapshot.semaphores) : [];
  const primaryMutex = mutexList[0];
  const isLocked = primaryMutex ? primaryMutex.locked : false;
  const ownerId = primaryMutex?.ownerThreadId ?? null;

  const sharedEntries = snapshot?.sharedVariables ? Object.entries(snapshot.sharedVariables) : [];
  const primaryVar = sharedEntries[0];
  const varName = primaryVar ? (primaryVar[0] === 'counter' ? 'X' : primaryVar[0]) : 'CS';
  const varVal = primaryVar ? primaryVar[1].value : 0;

  const pathT1ToGate = 'M 180,104 Q 248,104 294,142';
  const pathT2ToGate = 'M 180,214 Q 248,214 294,174';
  const pathGateToCS = 'M 426,158 L 538,158';

  const statusLine = primaryMutex
    ? isLocked
      ? `LOCK_HELD BY ${primaryMutex.ownerThreadName.toUpperCase()} // CS PROTECTED`
      : `MUTEX_${primaryMutex.name.toUpperCase()} UNLOCKED // READY`
    : semList[0]
    ? `SEMAPHORE_${semList[0].name.toUpperCase()} COUNT = ${semList[0].currentCount}`
    : `CRITICAL_SECTION // STEP ${currentStep} OF ${totalSteps}`;

  return (
    <>
      {/* Left Threads (T1 & T2) */}
      {[t1, t2].map((t, idx) => {
        if (!t) return null;
        const cy = idx === 0 ? 104 : 214;
        const isOwner = ownerId === t.id;
        const isBlocked = t.state === 'BLOCKED';
        const dotColor = idx === 0 ? '#7C3AED' : '#059669';

        return (
          <g key={t.id} transform={`translate(118, ${cy})`}>
            <motion.g
              animate={prefersReducedMotion ? undefined : isOwner ? { y: -3 } : { y: 0 }}
              transition={{ duration: 0.35 }}
            >
              {isOwner && <ellipse cx="0" cy="18" rx="64" ry="20" fill="rgba(4, 120, 87, 0.14)" />}
              {isBlocked && <ellipse cx="0" cy="18" rx="64" ry="20" fill="rgba(220, 38, 38, 0.12)" />}
              <ellipse cx="0" cy="22" rx="56" ry="16" fill="rgba(20, 20, 19, 0.06)" />

              <polygon points="-58,0 0,24 0,32 -58,8" fill="#E6E3DA" stroke="#141413" strokeWidth="1.25" strokeLinejoin="round" />
              <polygon points="0,24 58,0 58,8 0,32" fill="#D5D1C7" stroke="#141413" strokeWidth="1.25" strokeLinejoin="round" />
              <polygon points="0,-22 58,0 0,24 -58,0" fill={isBlocked ? '#FEF2F2' : isOwner ? '#ECFDF5' : '#FFFFFF'} stroke={isBlocked ? '#DC2626' : isOwner ? '#047857' : '#141413'} strokeWidth="1.3" strokeLinejoin="round" />

              {/* Floating Thread Pill above Plinth */}
              <line x1="0" y1="-24" x2="0" y2="-10" stroke="#141413" strokeWidth="1" />
              <g transform="translate(0, -34)">
                <rect x="-48" y="-10" width="96" height="20" rx="10" fill="#FFFFFF" stroke={isBlocked ? '#DC2626' : isOwner ? '#047857' : '#141413'} strokeWidth="1.15" />
                <circle cx="-36" cy="0" r="3" fill={dotColor} />
                <text x="5" y="3.5" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fontWeight="700" fill="#141413">
                  {t.name}
                </text>
              </g>

              {/* Centered Thread Lock Status on Plinth Top */}
              <text x="0" y="4" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fontWeight="700" fill={isBlocked ? '#DC2626' : isOwner ? '#047857' : '#595751'}>
                {isBlocked ? 'WAIT' : isOwner ? 'OWN' : t.state.slice(0, 5)}
              </text>
            </motion.g>
          </g>
        );
      })}

      {/* Fixed Dotted Floor Tracks */}
      <g fill="none" strokeLinecap="round">
        <path d={pathT1ToGate} stroke="rgba(20, 20, 19, 0.07)" strokeWidth="4" />
        <path d={pathT2ToGate} stroke="rgba(20, 20, 19, 0.07)" strokeWidth="4" />
        <path d={pathGateToCS} stroke="rgba(20, 20, 19, 0.07)" strokeWidth="4" />

        <path d={pathT1ToGate} stroke={ownerId === t1?.id ? '#047857' : '#595751'} strokeWidth="1.35" strokeDasharray="3.5,3.5" markerEnd="url(#ws-arrow)" />
        <path d={pathT2ToGate} stroke={ownerId === t2?.id ? '#047857' : '#595751'} strokeWidth="1.35" strokeDasharray="3.5,3.5" markerEnd="url(#ws-arrow)" />
        <path d={pathGateToCS} stroke={isLocked ? '#047857' : '#78716C'} strokeWidth="1.4" strokeDasharray="3.5,3.5" markerEnd="url(#ws-arrow)" />
      </g>

      {/* Center Isometric Mutex Lock Gate */}
      <g transform="translate(360, 158)">
        <motion.g
          animate={prefersReducedMotion ? undefined : isLocked ? { scale: [1, 1.03, 1] } : undefined}
          transition={{ duration: 0.4 }}
        >
        <ellipse cx="0" cy="48" rx="68" ry="22" fill="rgba(20, 20, 19, 0.07)" />
        {/* Gate Platform */}
        <polygon points="-66,8 0,38 0,46 -66,16" fill="#E6E3DA" stroke="#141413" strokeWidth="1.25" strokeLinejoin="round" />
        <polygon points="0,38 66,8 66,16 0,46" fill="#D5D1C7" stroke="#141413" strokeWidth="1.25" strokeLinejoin="round" />
        <polygon points="0,-24 66,8 0,38 -66,8" fill="#FAF9F5" stroke="#141413" strokeWidth="1.25" strokeLinejoin="round" />

        {/* Isometric Padlock Shackle (Opens when unlocked, closes when locked) */}
        <motion.path
          d="M -14,-18 L -14,-36 C -14,-52 14,-52 14,-36 L 14,-16"
          fill="none"
          stroke="#141413"
          strokeWidth="6"
          strokeLinecap="round"
          animate={{ y: isLocked ? 4 : -6 }}
          transition={{ duration: 0.35 }}
        />
        <motion.path
          d="M -14,-18 L -14,-36 C -14,-52 14,-52 14,-36 L 14,-16"
          fill="none"
          stroke="#FAF9F5"
          strokeWidth="2.5"
          strokeLinecap="round"
          animate={{ y: isLocked ? 4 : -6 }}
          transition={{ duration: 0.35 }}
        />

        {/* Padlock Isometric Body */}
        <polygon points="-24,-14 0,0 0,28 -24,14" fill={isLocked ? '#FDE68A' : '#ECEAE3'} stroke="#141413" strokeWidth="1.3" strokeLinejoin="round" />
        <polygon points="0,0 24,-14 24,14 0,28" fill={isLocked ? '#F59E0B' : '#D5D1C7'} stroke="#141413" strokeWidth="1.3" strokeLinejoin="round" />
        <polygon points="0,-28 24,-14 0,0 -24,-14" fill={isLocked ? '#FEF3C7' : '#FFFFFF'} stroke="#141413" strokeWidth="1.3" strokeLinejoin="round" />

        {/* Keyhole */}
        <circle cx="-12" cy="4" r="3" fill="#141413" />
        <polygon points="-13.5,4 -10.5,4 -9.5,12 -14.5,12" fill="#141413" />

        {/* Gate State Pill */}
        <g transform="translate(0, -68)">
          <rect x="-52" y="-12" width="104" height="24" rx="12" fill="#FFFFFF" stroke="#141413" strokeWidth="1.2" />
          <circle cx="-38" cy="0" r="3.5" fill={isLocked ? '#9E381E' : '#10B981'} />
          <text x="6" y="3.5" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9.5" fontWeight="700" fill="#141413">
            {isLocked ? 'MUTEX LOCKED' : 'MUTEX OPEN'}
          </text>
        </g>
        </motion.g>
      </g>

      {/* Right Protected Critical Section Vault */}
      <image href={ASSET_SHARED} x={522} y={40} width={190} height={206} preserveAspectRatio="xMidYMid meet" />
      <rect x={578} y={165} width={77} height={25} rx={6} fill="#F9EDE5" />
      <text x={616.5} y={182} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12.5" fontWeight="700" fill="#141413">
        {varName} = {varVal}
      </text>

      {/* Moving Cubes Only: Waiting threads hold outside gate, Lock Owner glides into CS */}
      {!prefersReducedMotion && (
        <>
          {t1 && t1.state !== 'BLOCKED' && (
            <g>
              <animateMotion path={pathT1ToGate} dur={ownerId === t1.id ? '1.3s' : '2.8s'} repeatCount="indefinite" />
              <ellipse cx="0" cy="7" rx="5.5" ry="2.2" fill="rgba(20, 20, 19, 0.16)" />
              <DataPacket x={0} y={0} size={5.5} color="#A78BFA" />
            </g>
          )}
          {t2 && t2.state !== 'BLOCKED' && (
            <g>
              <animateMotion path={pathT2ToGate} dur={ownerId === t2.id ? '1.3s' : '2.8s'} begin="-0.9s" repeatCount="indefinite" />
              <ellipse cx="0" cy="7" rx="5.5" ry="2.2" fill="rgba(20, 20, 19, 0.16)" />
              <DataPacket x={0} y={0} size={5.5} color="#6EE7B7" />
            </g>
          )}
          {isLocked && (
            <g>
              <animateMotion path={pathGateToCS} dur="1.3s" repeatCount="indefinite" />
              <ellipse cx="0" cy="7" rx="5.5" ry="2.2" fill="rgba(20, 20, 19, 0.16)" />
              <DataPacket x={0} y={0} size={6} color={ownerId === t1?.id ? '#A78BFA' : '#6EE7B7'} />
            </g>
          )}
        </>
      )}

      <text x="380" y="282" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10.5" fontWeight="600" fill="#595751" letterSpacing="0.08em">
        {statusLine}
      </text>
    </>
  );
};

/* ==================== 4. DEADLOCKS / CIRCULAR WAIT STAGE ==================== */
const DeadlockBlueprint: React.FC<WorkspaceBlueprintStageProps & { prefersReducedMotion: boolean | null }> = ({
  snapshot,
  currentEvent,
  currentStep,
  totalSteps,
  prefersReducedMotion
}) => {
  const threads = snapshot?.threads ? Object.values(snapshot.threads).slice(0, 2) : [];
  const rawMutexes = snapshot?.mutexes ? Object.values(snapshot.mutexes) : [];
  const mutexes = [...rawMutexes].sort((a, b) => a.name.localeCompare(b.name)).slice(0, 2);

  const t1 = threads[0];
  const t2 = threads[1];
  const m1 = mutexes[0];
  const m2 = mutexes[1];

  const isDeadlocked = !!(snapshot?.deadlockReport?.isDeadlocked || currentEvent?.deadlockDetected);

  // Check real C++ ownership & wait edges
  const t1HoldsM1 = m1?.ownerThreadId === t1?.id;
  const t2HoldsM2 = m2?.ownerThreadId === t2?.id;
  const t1WaitsM2 = t1?.blockedOn === m2?.name;
  const t2WaitsM1 = t2?.blockedOn === m1?.name;

  // Cycle paths around the diamond (T1 left, M1 top, T2 right, M2 bottom)
  const pathT1ToM1 = 'M 196,132 Q 260,72 340,68';
  const pathM1ToT2 = 'M 420,68 Q 500,72 564,132';
  const pathT2ToM2 = 'M 564,168 Q 500,224 420,228';
  const pathM2ToT1 = 'M 340,228 Q 260,224 196,168';

  const rawCycle = snapshot?.deadlockReport?.cycleDescription || 'T1 -> M2 -> T2 -> M1 -> T1';
  const compactCycle = rawCycle.length > 52 ? `${rawCycle.slice(0, 49)}...` : rawCycle;
  const statusLine = isDeadlocked
    ? `DEADLOCK_DETECTED // ${compactCycle}`
    : currentEvent
    ? `${currentEvent.threadName.toUpperCase()} // ${currentEvent.instruction.disassembly}`
    : `RESOURCE_ALLOCATION_GRAPH // STEP ${currentStep} OF ${totalSteps}`;

  return (
    <>
      {/* Center SCC / Deadlock Reticle */}
      <g transform="translate(380, 148)">
        <motion.g
          animate={prefersReducedMotion ? undefined : isDeadlocked ? { scale: [1, 1.06, 1] } : undefined}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <circle
            cx="0" cy="0" r="34"
            fill={isDeadlocked ? 'rgba(158, 56, 30, 0.08)' : 'none'}
            stroke={isDeadlocked ? '#9E381E' : '#8C8982'}
            strokeWidth={isDeadlocked ? '1.5' : '1'}
            strokeDasharray="3,3"
          />
          <text x="0" y="4" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="700" fill={isDeadlocked ? '#9E381E' : '#595751'}>
            {isDeadlocked ? 'SCC' : 'RAG'}
          </text>
        </motion.g>
      </g>

      {/* Fixed Circular Floor Tracks */}
      <g fill="none" strokeLinecap="round">
        <path d={pathT1ToM1} stroke={t1HoldsM1 ? '#141413' : '#9E9B94'} strokeWidth={t1HoldsM1 ? '1.6' : '1.15'} strokeDasharray={t1HoldsM1 ? undefined : '3.5,3.5'} markerEnd="url(#ws-arrow)" />
        <path d={pathM1ToT2} stroke={t2WaitsM1 ? '#9E381E' : '#9E9B94'} strokeWidth={t2WaitsM1 ? '1.6' : '1.15'} strokeDasharray="3.5,3.5" markerEnd={t2WaitsM1 ? 'url(#ws-arrow-accent)' : 'url(#ws-arrow)'} />
        <path d={pathT2ToM2} stroke={t2HoldsM2 ? '#141413' : '#9E9B94'} strokeWidth={t2HoldsM2 ? '1.6' : '1.15'} strokeDasharray={t2HoldsM2 ? undefined : '3.5,3.5'} markerEnd="url(#ws-arrow)" />
        <path d={pathM2ToT1} stroke={t1WaitsM2 ? '#9E381E' : '#9E9B94'} strokeWidth={t1WaitsM2 ? '1.6' : '1.15'} strokeDasharray="3.5,3.5" markerEnd={t1WaitsM2 ? 'url(#ws-arrow-accent)' : 'url(#ws-arrow)'} />
      </g>

      {/* Left Thread Cylinder (T1) */}
      <g transform="translate(154, 150)">
        <ellipse cx="0" cy="24" rx="44" ry="16" fill="rgba(20, 20, 19, 0.07)" />
        <path d="M -38,-4 L -38,14 A 38,16 0 0 0 38,14 L 38,-4 Z" fill="#E6E3DA" stroke="#141413" strokeWidth="1.3" />
        <ellipse cx="0" cy="-4" rx="38" ry="16" fill={t1?.state === 'BLOCKED' ? '#F7ECE6' : '#FFFFFF'} stroke={t1?.state === 'BLOCKED' ? '#9E381E' : '#141413'} strokeWidth="1.3" />
        <text x="0" y="0" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="700" fill="#141413">
          {t1?.name || 'T1'}
        </text>
      </g>

      {/* Right Thread Cylinder (T2) */}
      <g transform="translate(606, 150)">
        <ellipse cx="0" cy="24" rx="44" ry="16" fill="rgba(20, 20, 19, 0.07)" />
        <path d="M -38,-4 L -38,14 A 38,16 0 0 0 38,14 L 38,-4 Z" fill="#E6E3DA" stroke="#141413" strokeWidth="1.3" />
        <ellipse cx="0" cy="-4" rx="38" ry="16" fill={t2?.state === 'BLOCKED' ? '#F7ECE6' : '#FFFFFF'} stroke={t2?.state === 'BLOCKED' ? '#9E381E' : '#141413'} strokeWidth="1.3" />
        <text x="0" y="0" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="700" fill="#141413">
          {t2?.name || 'T2'}
        </text>
      </g>

      {/* Top Resource Mutex Block (M1) */}
      <g transform="translate(380, 68)">
        <ellipse cx="0" cy="26" rx="46" ry="16" fill="rgba(20, 20, 19, 0.07)" />
        <polygon points="-42,0 0,20 0,32 -42,12" fill="#E6E3DA" stroke="#141413" strokeWidth="1.3" strokeLinejoin="round" />
        <polygon points="0,20 42,0 42,12 0,32" fill="#D5D1C7" stroke="#141413" strokeWidth="1.3" strokeLinejoin="round" />
        <polygon points="0,-20 42,0 0,20 -42,0" fill="#FAF9F5" stroke="#141413" strokeWidth="1.3" strokeLinejoin="round" />
        <text x="0" y="3" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fontWeight="700" fill="#141413">
          {m1?.name || 'M1'}
        </text>
      </g>

      {/* Bottom Resource Mutex Block (M2) */}
      <g transform="translate(380, 224)">
        <ellipse cx="0" cy="26" rx="46" ry="16" fill="rgba(20, 20, 19, 0.07)" />
        <polygon points="-42,0 0,20 0,32 -42,12" fill={isDeadlocked ? '#E6C2B5' : '#E6E3DA'} stroke={isDeadlocked ? '#9E381E' : '#141413'} strokeWidth="1.3" strokeLinejoin="round" />
        <polygon points="0,20 42,0 42,12 0,32" fill={isDeadlocked ? '#D6A899' : '#D5D1C7'} stroke={isDeadlocked ? '#9E381E' : '#141413'} strokeWidth="1.3" strokeLinejoin="round" />
        <polygon points="0,-20 42,0 0,20 -42,0" fill={isDeadlocked ? '#F7ECE6' : '#FAF9F5'} stroke={isDeadlocked ? '#9E381E' : '#141413'} strokeWidth="1.3" strokeLinejoin="round" />
        <text x="0" y="3" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fontWeight="700" fill={isDeadlocked ? '#9E381E' : '#141413'}>
          {m2?.name || 'M2'}
        </text>
      </g>

      {/* Moving Cubes Only along the Resource Allocation Tracks */}
      {!prefersReducedMotion && (
        <>
          <g opacity={t1HoldsM1 ? 1 : 0.45}>
            <animateMotion path={pathT1ToM1} dur="2.2s" repeatCount="indefinite" />
            <DataPacket x={0} y={0} size={5.5} color="#A78BFA" />
          </g>
          <g opacity={t2WaitsM1 || isDeadlocked ? 1 : 0.45}>
            <animateMotion path={pathM1ToT2} dur="2.2s" begin="-0.55s" repeatCount="indefinite" />
            <DataPacket x={0} y={0} size={5.5} color={t2WaitsM1 ? '#9E381E' : '#6EE7B7'} />
          </g>
          <g opacity={t2HoldsM2 ? 1 : 0.45}>
            <animateMotion path={pathT2ToM2} dur="2.2s" begin="-1.1s" repeatCount="indefinite" />
            <DataPacket x={0} y={0} size={5.5} color="#6EE7B7" />
          </g>
          <g opacity={t1WaitsM2 || isDeadlocked ? 1 : 0.45}>
            <animateMotion path={pathM2ToT1} dur="2.2s" begin="-1.65s" repeatCount="indefinite" />
            <DataPacket x={0} y={0} size={5.5} color={t1WaitsM2 ? '#9E381E' : '#A78BFA'} />
          </g>
        </>
      )}

      <text x="380" y="282" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10.5" fontWeight="600" fill={isDeadlocked ? '#9E381E' : '#595751'} letterSpacing="0.08em">
        {statusLine}
      </text>
    </>
  );
};

export const WorkspaceBlueprintStage: React.FC<WorkspaceBlueprintStageProps> = (props) => {
  const prefersReducedMotion = useReducedMotion();
  const concept = resolveConcept(props.scenarioId);

  return (
    <div className="w-full bg-[#FAF9F5] border border-[#141413]/22 rounded-[4px] px-3 py-1.5 flex flex-col items-center justify-center select-none">
      <svg
        viewBox="0 0 760 305"
        className="w-full h-auto select-none block max-h-[268px]"
        preserveAspectRatio="xMidYMid meet"
      >
        <BlueprintFrame prefersReducedMotion={prefersReducedMotion} />
        {concept === 'race' && <RaceConditionsBlueprint {...props} prefersReducedMotion={prefersReducedMotion} />}
        {concept === 'scheduling' && <SchedulingBlueprint {...props} prefersReducedMotion={prefersReducedMotion} />}
        {concept === 'mutex' && <MutexBlueprint {...props} prefersReducedMotion={prefersReducedMotion} />}
        {concept === 'deadlock' && <DeadlockBlueprint {...props} prefersReducedMotion={prefersReducedMotion} />}
      </svg>
    </div>
  );
};
