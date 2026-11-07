import { Router, Request, Response } from 'express';
import { storage, StoredUser } from '../services/storage';
import { orchestrator } from '../orchestrator';
import { testPlannerAgent } from '../agents/test-planner';
import {
  exportGameToStandaloneHtml,
  UserRegistrationSchema,
  UserLoginSchema,
  BootstrapAdminSchema,
  UserAccount,
  UserSession,
} from '@shared/core';
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  extractSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_MS,
  checkLoginRateLimit,
  recordFailedLogin,
  clearLoginAttempts,
  requireAuth,
  requireAdmin,
} from '../services/auth';

export const apiRouter = Router();

// 1. Health & LLM Status
apiRouter.get('/health', (_req: Request, res: Response): void => {
  res.json({
    status: 'ok',
    service: 'Novus Backend API',
    persistence: storage.getPersistenceMode(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

apiRouter.get('/llm/test', async (_req: Request, res: Response): Promise<void> => {
  try {
    const { llmService } = await import('../services/llm');
    const result = await llmService.testConnection();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Projects
apiRouter.get('/projects', async (_req: Request, res: Response): Promise<void> => {
  try {
    const projects = await storage.getProjects();
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/projects/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    const project = await storage.getProjectById(id);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/projects/:id/export', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    const project = await storage.getProjectById(id);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    const embedOffline = req.query['offline'] === 'true';
    const exportData = exportGameToStandaloneHtml(project.specification, { embedOfflineEngine: embedOffline });
    res.json(exportData);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. AI Game Generation
apiRouter.post('/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, genre = 'platformer', difficulty = 'medium', theme } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Valid prompt is required' });
      return;
    }

    const outcome = await orchestrator.generateGame(prompt, genre, difficulty, theme);
    res.status(201).json(outcome);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Game Specifications
apiRouter.get('/specs/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    const spec = await storage.getSpecification(id);
    if (!spec) {
      res.status(404).json({ error: 'Specification not found' });
      return;
    }
    res.json(spec);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/specs/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    const existing = await storage.getSpecification(id);
    if (!existing) {
      res.status(404).json({ error: 'Specification not found' });
      return;
    }

    const updated = {
      ...existing,
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    await storage.saveSpecification(updated);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Automated Testing
apiRouter.get('/tests', async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = req.query['projectId'] as string | undefined;
    const projects = await storage.getProjects();
    const targetProject = projectId
      ? projects.find((p) => p.id === projectId)
      : projects[0];

    if (!targetProject) {
      res.json([]);
      return;
    }
    const tests = await testPlannerAgent.planTests(targetProject.specification);
    res.json(tests);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/tests/run', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.body;
    const projects = await storage.getProjects();
    const targetProject = projectId
      ? projects.find((p) => p.id === projectId)
      : projects[0];

    if (!targetProject) {
      res.status(404).json({ error: 'No active project to verify' });
      return;
    }

    const result = await orchestrator.executeVerification(targetProject.id);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/tests/history', async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = req.query['projectId'] as string | undefined;
    const history = await storage.getTestResults(projectId);
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Controlled Test Fixture Defect Trigger
apiRouter.post('/tests/trigger-defect', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, defectType = 'kinematic' } = req.body;
    const projects = await storage.getProjects();
    const targetProject = projectId
      ? projects.find((p) => p.id === projectId)
      : projects[0];

    if (!targetProject) {
      res.status(404).json({ error: 'Target project not found' });
      return;
    }

    const outcome = await orchestrator.triggerControlledDefect(targetProject.id, defectType);
    res.status(201).json(outcome);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Bug Reports
apiRouter.get('/bugs', async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = req.query['projectId'] as string | undefined;
    const bugs = await storage.getBugReports(projectId);
    res.json(bugs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/bugs/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    const bug = await storage.getBugReportById(id);
    if (!bug) {
      res.status(404).json({ error: 'Bug report not found' });
      return;
    }
    res.json(bug);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.patch('/bugs/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    const bug = await storage.getBugReportById(id);
    if (!bug) {
      res.status(404).json({ error: 'Bug report not found' });
      return;
    }

    if (req.body.repairStatus) {
      bug.repairStatus = req.body.repairStatus;
      bug.updatedAt = new Date().toISOString();
      await storage.saveBugReport(bug);
    }
    res.json(bug);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Autonomous Repair
apiRouter.post('/repair/:bugId', async (req: Request, res: Response): Promise<void> => {
  try {
    const bugId = req.params['bugId'] as string;
    const outcome = await orchestrator.diagnoseAndRepair(bugId);
    res.json(outcome);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/repairs', async (req: Request, res: Response): Promise<void> => {
  try {
    const bugId = req.query['bugId'] as string | undefined;
    const repairs = await storage.getRepairIterations(bugId);
    res.json(repairs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Agent Telemetry
apiRouter.get('/agents/status', (_req: Request, res: Response): void => {
  res.json(orchestrator.getAgentStatuses());
});

// 9. Settings
apiRouter.get('/settings', async (_req: Request, res: Response): Promise<void> => {
  try {
    const settings = await storage.getSettings();
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/settings', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    await storage.saveSettings(req.body);
    res.json({ success: true, settings: req.body });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 10. Authentication & Session Management
// ==========================================

// Helper to remove passwordHash from user object
function sanitizeUser(user: StoredUser): UserAccount {
  const { passwordHash: _hash, ...safe } = user;
  return safe;
}

apiRouter.post('/auth/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = UserRegistrationSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { username, password } = parseResult.data;
    const normalizedUsername = username.toLowerCase().trim();

    // Check uniqueness
    const existing = await storage.getUserByUsername(normalizedUsername);
    if (existing) {
      res.status(409).json({ error: 'Username is already taken' });
      return;
    }

    // Hash password with salt
    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();

    const newUser: StoredUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      username: normalizedUsername,
      displayName: username.trim(),
      passwordHash,
      role: 'USER',
      termsAccepted: true,
      termsAcceptedAt: now,
      termsVersion: 'v1.0.0',
      createdAt: now,
      updatedAt: now,
      lastActiveAt: now,
      isActive: true,
    };

    await storage.saveUser(newUser);

    // Create session
    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
    const session: UserSession = {
      sessionId: token,
      userId: newUser.id,
      username: newUser.username,
      role: newUser.role,
      expiresAt,
      createdAt: now,
    };
    await storage.saveSession(session);

    // Set HttpOnly cookie
    res.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION_MS,
      path: '/',
    });

    res.status(201).json({
      success: true,
      user: sanitizeUser(newUser),
      token,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

apiRouter.post('/auth/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const rateLimitKey = `${req.ip || 'ip'}:${req.body.username || 'unknown'}`;
    const rateLimit = checkLoginRateLimit(rateLimitKey);

    if (!rateLimit.allowed) {
      res.status(429).json({
        error: `Too many failed login attempts. Please try again in ${rateLimit.retryAfterSec} seconds.`,
      });
      return;
    }

    const parseResult = UserLoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    const { username, password } = parseResult.data;
    const normalizedUsername = username.toLowerCase().trim();

    const user = await storage.getUserByUsername(normalizedUsername);
    if (!user || !user.isActive) {
      recordFailedLogin(rateLimitKey);
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    const passwordValid = await verifyPassword(password, user.passwordHash);
    if (!passwordValid) {
      recordFailedLogin(rateLimitKey);
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    // Success - clear failed login counter
    clearLoginAttempts(rateLimitKey);

    // Session rotation
    const token = generateSessionToken();
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();

    const session: UserSession = {
      sessionId: token,
      userId: user.id,
      username: user.username,
      role: user.role,
      expiresAt,
      createdAt: now,
    };
    await storage.saveSession(session);

    // Update user activity
    user.lastActiveAt = now;
    await storage.saveUser(user);

    // Set HttpOnly cookie
    res.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION_MS,
      path: '/',
    });

    res.json({
      success: true,
      user: sanitizeUser(user),
      token,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

apiRouter.get('/auth/me', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await storage.getUserById(req.user.userId);
    if (!user || !user.isActive) {
      res.status(401).json({ error: 'User session invalid or user deactivated' });
      return;
    }

    res.json({
      user: sanitizeUser(user),
      session: req.user,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/auth/logout', async (req: Request, res: Response): Promise<void> => {
  try {
    const token = extractSessionToken(req);
    if (token) {
      await storage.deleteSession(token);
    }
    res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Bootstrap Endpoint - One time setup, permanently disabled once any ADMIN exists
apiRouter.post('/auth/bootstrap-admin', async (req: Request, res: Response): Promise<void> => {
  try {
    const existingUsers = await storage.getUsers();
    const hasAdmin = existingUsers.some((u) => u.role === 'ADMIN');

    if (hasAdmin) {
      res.status(403).json({
        error: 'Bootstrap disabled: An administrator account has already been initialized.',
      });
      return;
    }

    const parseResult = BootstrapAdminSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { username, password, displayName } = parseResult.data;
    const normalizedUsername = username.toLowerCase().trim();

    // Check if username taken
    const existingUser = await storage.getUserByUsername(normalizedUsername);
    if (existingUser) {
      res.status(409).json({ error: 'Username already in use' });
      return;
    }

    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();

    const adminUser: StoredUser = {
      id: `admin-${Date.now()}`,
      username: normalizedUsername,
      displayName: displayName?.trim() || username.trim(),
      passwordHash,
      role: 'ADMIN',
      termsAccepted: true,
      termsAcceptedAt: now,
      termsVersion: 'v1.0.0',
      createdAt: now,
      updatedAt: now,
      lastActiveAt: now,
      isActive: true,
    };

    await storage.saveUser(adminUser);

    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
    const session: UserSession = {
      sessionId: token,
      userId: adminUser.id,
      username: adminUser.username,
      role: 'ADMIN',
      expiresAt,
      createdAt: now,
    };
    await storage.saveSession(session);

    res.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION_MS,
      path: '/',
    });

    res.status(201).json({
      success: true,
      message: 'Initial administrator account created successfully',
      user: sanitizeUser(adminUser),
      token,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to bootstrap administrator' });
  }
});

// ==========================================
// 11. Administrator Operations (Protected)
// ==========================================

apiRouter.get('/admin/users', requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await storage.getUsers();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/admin/users/:id/role', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    const { role } = req.body;

    if (role !== 'USER' && role !== 'ADMIN') {
      res.status(400).json({ error: 'Role must be either USER or ADMIN' });
      return;
    }

    const user = await storage.getUserById(id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // If demoting self, verify at least one other admin exists
    if (req.user?.userId === id && role === 'USER') {
      const allUsers = await storage.getUsers();
      const adminCount = allUsers.filter((u) => u.role === 'ADMIN').length;
      if (adminCount <= 1) {
        res.status(400).json({ error: 'Cannot demote the sole remaining administrator' });
        return;
      }
    }

    user.role = role;
    user.updatedAt = new Date().toISOString();
    await storage.saveUser(user);

    res.json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/admin/users/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params['id'] as string;

    if (req.user?.userId === id) {
      res.status(400).json({ error: 'Cannot delete your own administrative account' });
      return;
    }

    const deleted = await storage.deleteUser(id);
    if (!deleted) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Invalidate sessions for deleted user
    await storage.deleteSessionsForUser(id);

    res.json({ success: true, message: 'User account removed successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/admin/system', requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await storage.getUsers();
    const sessions = await storage.getSessions();
    const projects = await storage.getProjects();
    const memory = process.memoryUsage();

    res.json({
      status: 'operational',
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
      persistenceMode: storage.getPersistenceMode(),
      counts: {
        totalUsers: users.length,
        adminUsers: users.filter((u) => u.role === 'ADMIN').length,
        activeSessions: sessions.length,
        projects: projects.length,
      },
      memory: {
        heapUsedMb: Math.round(memory.heapUsed / (1024 * 1024)),
        heapTotalMb: Math.round(memory.heapTotal / (1024 * 1024)),
        rssMb: Math.round(memory.rss / (1024 * 1024)),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

