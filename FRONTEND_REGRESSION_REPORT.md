# ConcurrencyLab — Frontend Regression & Accessibility Report

**Document Status:** Complete & Verified  
**Date of Audit:** 2026-11-12  
**Frontend Application:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite 8  
**Design Identity:** Warm Ivory Editorial Aesthetic (`#FBF8F3` background, `#9E3A24` terracotta accents, `#18181B` typography, monospaced register readouts)  
**Testing Modality:** Automated Playwright browser tests, DOM inspection, and manual interaction verification

---

## 1. Executive Summary

| Category | Total Checked | PASS | FAIL | NOT TESTED | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Execution State Semantics Alignment** | 5 | 5 | 0 | 0 | **PASS** |
| **Time-Travel Scrubbing & Determinism** | 4 | 4 | 0 | 0 | **PASS** |
| **Keyboard Navigation Shortcuts** | 4 | 4 | 0 | 0 | **PASS** |
| **Multi-Device Viewport Responsiveness** | 5 | 5 | 0 | 0 | **PASS** |
| **Accessibility & Interactive Controls** | 4 | 4 | 0 | 0 | **PASS** |

**Final Frontend Verdict:** **PRODUCTION READY (100% PASS)**

---

## 2. Engine Truth vs. UI Execution Semantics Alignment

The ConcurrencyLab UI distinguishes execution state semantics to avoid misleading the student during educational debugging:

| Semantic Concept | UI Presentation | Engine State Reference | Verification / Behavior | Status |
| :--- | :--- | :--- | :--- | :---: |
| **CURRENT PC** | Displayed in thread rail badge: `PC: N` | `snapshot.threads[tid].pc` | Shows next instruction scheduled to execute on the CPU. | **PASS** |
| **EXECUTED PC** | Shown in event explanation and historical chip | `event.previousPc` | Shows program counter at the instant the instruction executed. | **PASS** |
| **SELECTED EVENT** | Highlighted chip in timeline and dark border on lane card | Currently scrubbed `step` index | Clearly labeled with global sequence (`#1`, `#2`, etc.); completed instructions are **never** labeled "ACTIVE". | **PASS** |
| **ON CPU STATE** | Pulsing green ring + `RUNNING` badge | `engine.getScheduler()->getCurrentThread()` | Indicates the thread currently occupying the CPU core for execution. | **PASS** |
| **DONE vs UPCOMING** | Subtly muted terracotta/warm-sand vs neutral border | `instrIndex < currentPc` vs `instrIndex >= currentPc` | Clear visual progress through the thread's instruction track. | **PASS** |
| **TERMINATED STATE** | Gray badge `TERMINATED` | `ThreadState::TERMINATED` | Properly renders `TERMINATED` instead of `HALTED`, following engine enum truth. | **PASS** |

### Inspector Synchronization: Following vs Pinned Mode
- **Following Mode (Default):** The inspector automatically tracks the thread that executed the currently selected timeline step. The button displays `"Follow Event"` with tooltip `"Following: Inspector automatically tracks currently executing thread"`.
- **Pinned Mode:** Clicking any thread lane pins the inspector to that specific thread, allowing deep register inspection without losing focus during auto-playback. Clicking the pin button reverts to following mode.
- **Status:** **PASS**

---

## 3. Time-Travel Scrubbing & Determinism

Scrubbing was tested via Playwright across `race_counter_2` (steps 0 to 6):

1. **Step 0 (Initial State):** Both threads at `PC: 0`, counter = 0, registers empty.
2. **Step Forward (Steps 1 → 2 → 3):**
   - Step 1: Worker-A executes `READ_SHARED counter, r0`. Register `r0` = 0.
   - Step 2: Worker-B executes `READ_SHARED counter, r0`. Register `r0` = 0.
   - Step 3: Worker-A executes `ADD_IMM r0, 1`. Register `r0` = 1.
3. **Step Backward (Step 3 → Step 2):**
   - Scrubbing backward immediately restores snapshot 2: Worker-A register reverts to 0, PC reverts to 1.
4. **Scrub to Completion (Step 6) and Reset:**
   - Pressing Reset (`R`) restores Step 0 immediately with zero residual state.
- **Status:** **PASS**

---

## 4. Keyboard Navigation Shortcuts

All global keyboard shortcuts were verified on `http://localhost:5180`:

| Key | Action | Observed Result | Audit Result |
| :---: | :--- | :--- | :---: |
| <kbd>Space</kbd> | Toggle Play / Pause playback | Toggles simulation autoplay loop smoothly; auto-scrolls timeline. | **PASS** |
| <kbd>→</kbd> (Right Arrow) | Step forward one instruction | Steps forward deterministically from Step 0 → Step 1 → Step 2. | **PASS** |
| <kbd>←</kbd> (Left Arrow) | Step backward one instruction | Steps backward deterministically from Step 2 → Step 1. | **PASS** |
| <kbd>R</kbd> | Reset simulation to Step 0 | Instantly rewinds timeline and snapshot to Step 0. | **PASS** |

---

## 5. Multi-Device Viewport Responsiveness Matrix

Tested on both Landing Page (`/`) and Workspace view across 5 standard device viewports:

| Viewport Width | Device Archetype | `scrollWidth` | `clientWidth` | Overflow Detected? | Visual Result | Status |
| :---: | :--- | :---: | :---: | :---: | :--- | :---: |
| **375px** | iPhone SE / Compact Mobile | 375px | 375px | **None (`false`)** | Cards wrap cleanly; no horizontal clipping | **PASS** |
| **390px** | iPhone 12 / 13 / 14 / Pro | 390px | 390px | **None (`false`)** | Padding 16px; editorial typography wraps | **PASS** |
| **768px** | iPad Portrait / Small Tablet | 768px | 768px | **None (`false`)** | Two-column grid wraps cleanly; toolbar responsive | **PASS** |
| **1024px** | iPad Landscape / Small Laptop | 1024px | 1024px | **None (`false`)** | Full workspace with collapsible inspector | **PASS** |
| **1440px** | Desktop / High-Res Monitor | 1440px | 1440px | **None (`false`)** | Centered canvas, full-width execution tracks | **PASS** |

**Zero horizontal overflow confirmed across all tested resolutions (`scrollWidth <= clientWidth`).**

---

## 6. Accessibility & Interactive Controls Audit

| Criterion | Implementation | Audit Result |
| :--- | :--- | :---: |
| **Accessible Buttons & Titles** | Every icon button includes `title` and/or `aria-label` (e.g. `"Reset to Step 0 (R)"`, `"Step Forward (Right Arrow)"`, `"Play (Space)"`). | **PASS** |
| **Focus Rings** | Interactive elements have visible focus outlines with warm contrast (`focus-visible:ring-2 focus-visible:ring-[#9E3A24]`). | **PASS** |
| **Semantic Structure** | Uses semantic HTML `<header>`, `<main>`, `<nav>`, `<button>`, and `<section>` tags. | **PASS** |
| **Color Independence** | Thread states are indicated by both distinct colors and clear textual badges (`READY`, `RUNNING`, `BLOCKED`, `TERMINATED`). | **PASS** |
