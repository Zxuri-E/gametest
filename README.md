<<<<<<< HEAD
# AI-Powered 2D Game Generation & Automated Verification Platform

A developer-focused engineering environment that autonomously synthesizes 2D Phaser games from natural language prompts, generates automated Playwright test suites, playtests game mechanics, diagnoses bugs, and attempts autonomous code repairs.

---

## Architecture Overview

The repository is structured as a clean, modular monorepo:

```text
├── frontend/          # React + Vite + TypeScript + Tailwind CSS developer studio
├── shared/            # Common domain types, Zod schemas, and runtime contracts
├── backend/           # Node.js + Express backend & AI agent orchestrator (scaffolded)
├── game-engine/       # Phaser 3 runtime adapter, scene harnesses, and mechanics (scaffolded)
├── testing/           # Playwright automation harness, assertions, and test scenarios (scaffolded)
├── docs/              # Architectural specs and developer documentation
└── scripts/           # Local development and utility scripts
```

---

## Tech Stack

- **Frontend Application**: React 18, Vite, TypeScript (strict mode), Tailwind CSS, React Router v6, Zustand, Zod, Lucide React.
- **Shared Contracts**: Pure TypeScript domain interfaces & Zod validation schemas.
- **Game Engine (Target)**: Phaser 3 with headless physics testing support.
- **Verification Engine (Target)**: Playwright for browser-level canvas & state automation.
- **AI Agent System (Target)**: Generator, Test-Planner, Playtester, Diagnostician, and Repair agents.

---

## Getting Started (Frontend Development)

### Prerequisites

- Node.js (v20+ recommended)
- npm (v10+)

### 1. Install Dependencies

From the repository root:

```bash
npm install
```

### 2. Start the Frontend Development Server

```bash
npm run dev
```

Or run directly within the frontend workspace:

```bash
npm run dev --workspace=frontend
```

The application will start at `http://localhost:5173/`.

### 3. Run TypeScript Checks & Build

```bash
# Typecheck shared and frontend modules
npm run typecheck

# Build shared and frontend production bundle
npm run build
```

---

## Features Implemented in the Frontend

1. **Dashboard**: High-density engineering overview displaying total games generated, test runs, automated verification success rate, recent projects, test executions, and active bug reports.
2. **Game Studio**: Natural-language game prompt editor, genre selector (2D Platformer, Top-down, Endless runner), mechanics toggles (jumping, gravity, collision, collectibles, scoring, etc.), difficulty levels, dimensions, and simulated asynchronous AI generation pipeline.
3. **Game Workspace**: Full-featured game preview area with interactive canvas simulation, Play/Pause/Stop/Reset controls, fullscreen mode, real-time FPS & physics telemetry monitor, and variable tweaking panel.
4. **Testing Center**: Test runner dashboard with live progress indicators, test suite breakdown (Player movement, Jump mechanics, Platform landing, Collision detection, Coin collection, Game-over detection, Restart functionality, Level completion), assertion logs, and agent activity timeline.
5. **Bug Reports**: Issue management console displaying bug severity, category, affected mechanic, expected vs. actual behavior, suspected source file & line number, trace evidence, and one-click autonomous repair simulation.
6. **Project History**: Version control overview showing game versions (v0.1.0, v0.2.0, etc.), prompt prompts used, generation timestamps, verification status, and repair diff history.
7. **Settings**: Developer preferences, UI appearance options, AI model provider configuration (OpenAI, Anthropic, Gemini, Ollama/Local), and testing worker settings.

---

## Module Status & Boundaries

- **Frontend**: Fully implemented with polished dark developer UI, client-side routing, Zustand state management, and realistic asynchronous mock services.
- **Shared**: Complete TypeScript types, Zod schemas, and runtime contracts for all cross-module data exchange.
- **Backend, Game Engine, Testing**: Clean architectural scaffolding prepared for future implementation.

=======
# gametest
>>>>>>> origin/main
