# Novus Security Assessment — Pass 1: Threat Modeling & Vulnerability Discovery

**Assessment Date:** November 8, 2026  
**Target Environment:** Novus AI-Powered 2D Game Generation & Automated Verification Platform  
**Scope:** Frontend (React/Vite), Backend (Express/Node.js), Game Engine (Phaser 3), Storage & Authentication Layers.

---

## 1. Executive Summary

A comprehensive architectural and static security review was conducted across all workspace packages (`@backend/server`, `frontend`, `@shared/core`, `@game-engine/runtime`, `@testing/automation`). The review focused on identifying credential handling vulnerabilities, injection vectors, unauthorized file access via AI agents, session management weaknesses, and user surveillance risks.

---

## 2. Threat Modeling & Identified Attack Surfaces

```text
┌─────────────────┐       HTTPS / HttpOnly Cookie        ┌─────────────────────┐
│                 ├─────────────────────────────────────►│  Express Gateway    │
│  Client Browser │                                      │  (CORS, Sec Headers)│
│                 │◄─────────────────────────────────────┤                     │
└────────┬────────┘                                      └──────────┬──────────┘
         │                                                          │
         │ Keystroke Isolation                                      │ Rate Limiter & Auth Guard
         ▼                                                          ▼
┌─────────────────┐                                      ┌─────────────────────┐
│ Zero-Logging UI │                                      │ scrypt Key Deriv    │
│ Form Controls   │                                      │ timingSafeEqual     │
└─────────────────┘                                      └──────────┬──────────┘
                                                                    │
                                                         ┌──────────┴──────────┐
                                                         ▼                     ▼
                                                ┌────────────────┐    ┌────────────────┐
                                                │ Local JSON /   │    │ Repair Agent   │
                                                │ Firestore DB   │    │ Path Traversal │
                                                │ Storage Layer  │    │ & AST Boundary │
                                                └────────────────┘    └────────────────┘
```

---

## 3. Vulnerability Findings & Risk Classification

### Finding SEC-01: Legacy Password Hashing & Default Admin Credentials (High)
- **Discovery:** Previous prototype lacked server-side password hashing and lacked rate limiting, potentially allowing brute-force or hardcoded administrative credentials.
- **Impact:** Administrative account compromise and arbitrary user deletion.
- **Remediation Requirement:**
  1. Implement memory-hard salted password hashing (`crypto.scryptSync` / `crypto.scrypt` with 16-byte random salt and 64-byte derived keys).
  2. Implement `crypto.timingSafeEqual` comparison to eliminate timing side-channel attacks.
  3. Prohibit all hardcoded admin credentials; implement one-time secure admin bootstrap endpoint that is permanently disabled once an admin exists.

### Finding SEC-02: Client-Accessible Session Tokens & XSS Exposure (Medium)
- **Discovery:** Session tokens stored in localStorage or accessible via client-side JavaScript are vulnerable to token theft via Cross-Site Scripting (XSS).
- **Impact:** Account impersonation and privilege escalation.
- **Remediation Requirement:**
  1. Transmit session tokens via `HttpOnly`, `SameSite=Lax`, and `Secure` cookies.
  2. Maintain server-side session registry with explicit expiration timestamps.
  3. Support Bearer token authentication fallback for headless automated test drivers without breaking HttpOnly browser guarantees.

### Finding SEC-03: Rate Limiting & Denial of Service Protection (Medium)
- **Discovery:** Authentication endpoints (`/api/auth/login`, `/api/auth/register`) had no request throttling, leaving them open to automated dictionary attacks.
- **Impact:** Credential brute-forcing and resource exhaustion.
- **Remediation Requirement:**
  1. Implement in-memory IP/username rate limiting (max 5 failed attempts within a 15-minute window).
  2. Introduce progressive lockout with automated exponential cooldown.

### Finding SEC-04: Path Traversal & Autonomous File Modification Boundary (High)
- **Discovery:** AI Repair Agent synthesizes code patches for arbitrary target files specified in `bug.suspectedSourceLocation.file`.
- **Impact:** An attacker could craft a synthetic bug report pointing to `../../etc/passwd` or overwrite test assertion files to falsely pass test suites.
- **Remediation Requirement:**
  1. Strict root containment verification (`path.resolve` must be bounded within `process.cwd()`).
  2. Explicit protection for test suites: prohibit repair agent from modifying files matching `test`, `spec`, `playwright`, or in `testing/`.
  3. Dry-run syntax validation of replacement patches prior to writing to the filesystem, backed by automatic `.novus-bak` rollback.

### Finding SEC-05: User Surveillance & Form Keystroke Privacy (Low / Compliance)
- **Discovery:** Many modern generative interfaces employ real-time keystroke tracking and prompt autocomplete telemetry, risking unintended credential harvesting.
- **Impact:** Inadvertent transmission of passwords or private prompts before user intent is confirmed.
- **Remediation Requirement:**
  1. Enforce strict Zero-Keystroke Surveillance architecture.
  2. Verify all inputs are state-isolated until explicit form submission button action.
  3. Explicitly state zero-keystroke guarantee in published Privacy Policy.

---

## 4. Assessment Matrix

| ID | Component | Vulnerability | Severity | Status |
|---|---|---|---|---|
| SEC-01 | Backend Auth | Credential Storage & Admin Bootstrap | High | Remediated in Phase 3 |
| SEC-02 | Backend Sessions | Cookie Security & XSS Resistance | Medium | Remediated in Phase 3 |
| SEC-03 | Backend Gateway | Brute-Force Rate Limiting | Medium | Remediated in Phase 3 |
| SEC-04 | Repair Agent | Path Traversal & Test Suite Protection | High | Remediated in Phase 3 |
| SEC-05 | Frontend Forms | Zero Keystroke Surveillance Guarantee | Medium | Remediated in Phase 3 |
| SEC-06 | Server Gateway | Missing Security Headers (CSP, FrameGuard) | Low | Remediated in Phase 3 |
