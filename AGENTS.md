# AGENTS.md — Architecture, Conventions & Operational Guidelines

This document outlines the core architectural boundaries, code conventions, agent roles, and engineering principles for the AI-Powered 2D Game Generation & Automated Verification Platform.

---

## 1. Project Philosophy & Core Principles

1. **Independent Frontend with High Fidelity**:
   - The frontend is the central control plane and command center for all game generation, inspection, verification, and debugging.
   - It runs completely standalone in mock mode when backend services are not running, with zero degraded visual states or broken flows.
2. **Strict Modular Boundaries**:
   - Monolithic files are prohibited. UI features, business logic, domain models, and service clients remain segregated.
   - Feature folders (`src/features/*`) encapsulate their own components, state hooks, and presentation sub-components.
3. **Deterministic Shared Contracts**:
   - Data models and exchange schemas reside in `@shared` and are imported by both frontend and backend modules.
   - Schema validation is powered by Zod to guarantee runtime type safety at boundary layers.
4. **No Premature Complexity**:
   - Do not invent speculative team management, enterprise RBAC, or unneeded microservices. This is a personal software development system.

---

## 2. Multi-Agent System Roles & Contracts

The platform orchestrates five specialized AI agent roles:

```text
       ┌────────────────────────┐
       │     User Prompt        │
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │   Generator Agent      │ ──> Produces GameSpecification & Phaser Code
       └───────────┬────────────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
┌──────────────────┐  ┌──────────────────┐
│  Test Planner    │  │  Playtester Bot  │
│  Synthesizes     │  │  Executes actions│
│  Playwright plans│  │  & collects logs │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         └─────────┬───────────┘
                   ▼
       ┌────────────────────────┐
       │  Diagnostician Agent   │ ──> Categorizes failures & Pinpoints root cause
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │     Repair Agent       │ ──> Synthesizes patches & triggers re-tests
       └────────────────────────┘
```

1. **Generator Agent (`agents/generator`)**:
   - Parses natural-language game prompts and constraints.
   - Outputs standardized `GameSpecification` JSON and clean Phaser 3 scene classes conforming to `GameRuntimeAdapter`.
2. **Test Planner Agent (`agents/test-planner`)**:
   - Analyzes game mechanics (jumping, gravity, collision, score, boundaries).
   - Generates deterministic test cases with Playwright scenarios and assertion predicates.
3. **Playtester Agent (`agents/playtester`)**:
   - Drives game input via automated synthetic controls (keyboard/touch vectors).
   - Records physics telemetry, FPS rates, collision events, and screenshot traces.
4. **Diagnostician Agent (`agents/diagnostician`)**:
   - Ingests test failure traces, assertion mismatches, and console logs.
   - Cross-references game source code to identify offending lines, state mutations, or math discrepancies.
5. **Repair Agent (`agents/repair`)**:
   - Generates minimal diff patches to fix diagnosed bugs without breaking unrelated mechanics.
   - Re-queues the test suite to verify the fix.

---

## 3. Technology Stack & Directory Conventions

- **Frontend**: React 18+, Vite, TypeScript (strict), Tailwind CSS, React Router v6+, Zustand, Zod, Lucide React.
- **Shared**: Pure TypeScript types, Zod schemas, and runtime contract interfaces.
- **Game Engine**: Phaser 3 runtime adapter, scene lifecycle hooks, and physics telemetry emitters.
- **Backend (Future)**: Node.js, Express, Firebase Firestore.
- **Automated Testing (Future)**: Playwright, Chromium headless runner, canvas pixel & state inspection.

### File Naming Conventions
- React Components: PascalCase (e.g., `PromptEditor.tsx`, `BugDetailModal.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useGameStudio.ts`, `useTestRunner.ts`)
- Stores: camelCase with `use...Store` convention (e.g., `useStudioStore.ts`, `useTestingStore.ts`)
- Types & Interfaces: PascalCase for types (e.g., `GameProject`, `TestCase`); files named `types.ts` or `[domain].types.ts`
- Utilities & Services: camelCase (e.g., `mockApiService.ts`, `formatters.ts`)

---

## 4. Coding & Architecture Rules

- **Zero Untyped Any**: All inputs, outputs, store states, and API responses must be strictly typed.
- **Centralized Mock Data**: Never hardcode inline dummy data directly into JSX elements. All mock data lives in `src/services/mock/` and is exposed via simulated async services.
- **Design System Consistency**:
  - Dark developer-tool interface: charcoal (`#090d16` / `#0f172a`), deep slate (`#1e293b`), borders (`#334155`), translucent surfaces (`backdrop-blur-md bg-slate-900/60`).
  - Accent colors:
    - Primary Action / Generation: Cyan/Sky (`#38bdf8`) & Indigo (`#6366f1`)
    - Success / Passed: Emerald (`#10b981`)
    - Warning / Diagnosing: Amber (`#f59e0b`)
    - Error / Failed / Critical: Rose/Crimson (`#f43f5e`)
  - Typography: Clean sans-serif with high contrast mono for code, logs, and telemetry.
- **Security & Hygiene**: Never hardcode API keys, secrets, or credential tokens. Mask all inputs.

