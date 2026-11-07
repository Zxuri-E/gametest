# Novus Phase 3: Architecture & Engineering Decisions Record

This document records the architectural and operational decisions adopted during Phase 3.

---

## ADR-001: Repository Protection & Feature Branching
- **Context**: Working inside an existing team codebase with committed baseline `b92aa84`.
- **Decision**: Created dedicated feature branch `feature/phase-3` to isolate Phase 3 deliverables. No force-pushes or destructive resets (`git reset --hard`, `git clean -fd`) are permitted.

## ADR-002: React & Phaser DOM Ownership Separation
- **Context**: Selecting projects from Dashboard frequently throws `Node.removeChild: The node to be removed is not a child of this node` because React DOM unmounts and Phaser's internal `game.destroy(true)` race to remove the same `<canvas>`.
- **Decision**: React strictly owns the DOM container element (`HTMLDivElement`). Phaser is initialized asynchronously into a dedicated inner wrapper or canvas element created and cleaned up through a deterministic ref controller. During component unmount, Phaser's game instance is halted (`game.destroy(true, false)` where `false` avoids Phaser trying to remove a canvas already unmounted or managed by React), event listeners and RAF loops are terminated, and pending async initializations abort if the ref is detached.

## ADR-003: Deterministic Game State Machine
- **Context**: Generating a game immediately launched runtime without a clear "READY / Start Game" phase; terminal states (Game Over, Victory) risked unrecoverable freezes.
- **Decision**: Implement explicit finite state machine:
  `INITIALIZING -> READY -> PLAYING -> PAUSED -> LEVEL_COMPLETE / VICTORY / GAME_OVER / ERROR`.
  Generation transitions to `READY`. The user clicks "Start Game" to begin `PLAYING`. Terminal states display interactive HUD overlays with "Restart", "New World", and "Return to Workspace".

## ADR-004: Seeded Procedural World Generation
- **Context**: Level generation had pseudo-random coordinates with potential unreachable gaps or frozen finish gates.
- **Decision**: Implement pseudo-random number generator (PRNG, Mulberry32 / splitmix) with explicit seed strings. A given seed produces identical platform/obstacle layouts. Four clear actions are exposed:
  1. **Restart**: Replay current level/run with identical seed.
  2. **New World / Regenerate**: Re-generate layout with a newly generated random seed.
  3. **Reset Level**: Re-spawn player at level start.
  4. **Next Level**: Increment level index and generate a distinct seeded layout.

## ADR-005: Multi-Tier Defect Repair Scope
- **Context**: AI bug repair previously focused only on a simulated level reachability or inverted jump logic defect without distinguishing repair layers.
- **Decision**: The Diagnostician and Repair Agent must classify bugs into four distinct repair scopes:
  - **A. Project Specification Defect**: Mutates only the target project's `GameSpecification`.
  - **B. Generated Artifact Defect**: Repairs the individual project's generated bundle.
  - **C. Shared Engine Defect**: Modifies core Phaser scene templates only when evidence proves an engine-wide bug, tested in an isolated copy before committing.
  - **D. Frontend/Backend Application Defect**: Isolated code changes to app services or UI components.
  Test assertions are strictly immutable.

## ADR-006: Server-Side Authentication & Zero Keystroke Tracking
- **Context**: User authentication must not be frontend-only state. Security and user privacy must be rigorously maintained.
- **Decision**: Backend Express router manages session cookies (`httpOnly`, `sameSite: 'lax'`, `secure: process.env.NODE_ENV === 'production'`) with bcrypt/argon2id password hashing. No keystroke recording, form input logging, or password logging will ever be implemented. First administrator account is bootstrapped securely via CLI or one-time configuration with no hardcoded credentials.
