# Novus — Cloud Firestore Production Persistence & Security Specification

This document details the configuration, security rules, environment setup, and deployment procedure for enabling remote Cloud Firestore persistence in Novus while preserving zero-degradation fallback to local JSON storage.

---

## 1. Dual-Mode Architecture

Novus automatically detects persistence mode at server boot:

```text
┌────────────────────────────────────────────────────────┐
│               Novus Storage Service                    │
└──────────────────────────┬─────────────────────────────┘
                           │
       ┌───────────────────┴───────────────────┐
       ▼                                       ▼
FIREBASE_PROJECT_ID present?         Default / Local Fallback
       │                                       │
       ▼                                       ▼
┌──────────────────────────────┐     ┌──────────────────────────────┐
│ Remote Cloud Firestore       │     │ Local File Persistence       │
│ Mode: 'firestore'            │     │ Mode: 'local-json'           │
│ Real-time cloud sync         │     │ Location: backend/data/      │
└──────────────────────────────┘     └──────────────────────────────┘
```

---

## 2. Environment Configuration

To enable remote Firestore synchronization, set the following environment variables in `backend/.env` or your production runtime container:

```bash
# Production Firebase Project ID
FIREBASE_PROJECT_ID="novus-2d-studio"

# Method A: Service Account Key File (Recommended for Containerized Deploys)
GOOGLE_APPLICATION_CREDENTIALS="/etc/secrets/firebase-service-account.json"

# Method B: Direct Inline Environment Variables
FIREBASE_CLIENT_EMAIL="novus-backend@novus-2d-studio.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASC...\n-----END PRIVATE KEY-----"
```

> [!NOTE]
> When these variables are unset, Novus operates in `local-json` mode without throwing runtime errors or network connection timeouts.

---

## 3. Least-Privilege Firestore Security Rules (`firestore.rules`)

The following rules enforce strict least-privilege document access, preventing unauthorized client writes and separating public specifications from authenticated developer workspaces:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && request.auth.token.role == 'ADMIN';
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // 1. User Profiles: readable by authenticated users; writable by owner or admin
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && isOwner(userId);
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin() && !isOwner(userId);
    }

    // 2. Active Sessions: internal backend write only
    match /sessions/{sessionId} {
      allow read, write: if false; // Managed exclusively via server-side admin SDK
    }

    // 3. Projects & Specifications: read public; write restricted to project owner or admin
    match /projects/{projectId} {
      allow read: if true;
      allow create, update, delete: if isAuthenticated();
    }

    match /specifications/{specId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }

    // 4. Test Runs & Telemetry: read public; write authenticated
    match /test_results/{testId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }

    // 5. Bug Reports & Autonomous Repair Iterations
    match /bug_reports/{bugId} {
      allow read: if true;
      allow create, update: if isAuthenticated();
      allow delete: if isAdmin();
    }

    match /repair_iterations/{repairId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }

    // 6. Platform Settings: read all; write strictly admin
    match /settings/{doc=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

---

## 4. Collection Schema Reference

| Collection | Document ID | Description |
|---|---|---|
| `users` | `user-{timestamp}-{random}` | User account records (usernames, hashed passwords, roles, terms acceptance) |
| `sessions` | `session-{token-hash}` | Server session indices with expiration timestamps |
| `projects` | `proj-{id}` | Top-level project metadata, active version, status, bug counters |
| `specifications` | `spec-{id}` | Game specifications (mechanics, dimensions, physics constants, entity arrays) |
| `test_results` | `tr-{timestamp}` | Playwright & playtester execution results with assertion breakdowns |
| `bug_reports` | `bug-{timestamp}-{rand}` | Diagnosed defects with evidence, suspected source files, and status |
| `repair_iterations` | `rep-{bugId}-{iter}` | AST patch diffs, affected file list, and verification logs |
| `settings` | `global` | Platform engine configuration, LLM parameters, theme defaults |

---

## 5. Local to Firestore Migration Procedure

When transitioning a deployed instance from local JSON to remote Firestore:

1. Export the active `backend/data/novus_db.json` file.
2. Initialize the Google Cloud SDK:
   ```bash
   gcloud auth application-default login
   gcloud config set project <PROJECT_ID>
   ```
3. Deploy Firestore Security Rules:
   ```bash
   firebase deploy --only firestore:rules
   ```
4. Start the backend with `FIREBASE_PROJECT_ID` configured. Novus will automatically verify the remote connection during startup telemetry checks.
