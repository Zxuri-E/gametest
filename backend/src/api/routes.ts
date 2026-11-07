import { Router, Request, Response } from 'express';
import { storage } from '../services/storage';
import { orchestrator } from '../orchestrator';
import { testPlannerAgent } from '../agents/test-planner';
import { exportGameToStandaloneHtml } from '@shared/core';

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
    const { projectId } = req.body;
    const projects = await storage.getProjects();
    const targetProject = projectId
      ? projects.find((p) => p.id === projectId)
      : projects[0];

    if (!targetProject) {
      res.status(404).json({ error: 'Target project not found' });
      return;
    }

    const outcome = await orchestrator.triggerControlledDefect(targetProject.id);
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

apiRouter.post('/settings', async (req: Request, res: Response): Promise<void> => {
  try {
    await storage.saveSettings(req.body);
    res.json({ success: true, settings: req.body });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
