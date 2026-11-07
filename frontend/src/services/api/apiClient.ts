import {
  GameProject,
  GameSpecification,
  TestCase,
  TestResult,
  BugReport,
  RepairIteration,
  AgentStatus,
  ProjectExportData,
  UserAccount,
  UserRegistrationInput,
  UserLoginInput,
  BootstrapAdminInput,
} from '@shared/core';
import { mockApi } from '../mock/mockApiService';

const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

export class ApiClient {
  private isBackendOnline: boolean | null = null;

  private async fetchWithFallback<T>(url: string, options?: RequestInit, fallbackFn?: () => Promise<T>): Promise<T> {
    try {
      const res = await fetch(`${BASE_URL}${url}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        ...options,
      });
      if (res.ok) {
        this.isBackendOnline = true;
        return await res.json();
      }
      const errorBody = await res.json().catch(() => null);
      const msg = errorBody?.error || `HTTP error ${res.status}: ${res.statusText}`;
      throw new Error(msg);
    } catch (err) {
      if (fallbackFn) {
        this.isBackendOnline = false;
        console.warn(`[ApiClient] Backend unavailable at ${BASE_URL}${url}. Using local fallback.`, err);
        return fallbackFn();
      }
      throw err;
    }
  }

  public getBackendStatus(): boolean {
    return this.isBackendOnline ?? false;
  }

  // --- Projects ---
  async getProjects(): Promise<GameProject[]> {
    return this.fetchWithFallback<GameProject[]>('/projects', undefined, () => mockApi.getProjects());
  }

  async getProjectById(id: string): Promise<GameProject | null> {
    return this.fetchWithFallback<GameProject | null>(`/projects/${id}`, undefined, () => mockApi.getProjectById(id));
  }

  async exportProject(id: string, offline = false): Promise<ProjectExportData> {
    const query = offline ? '?offline=true' : '';
    return this.fetchWithFallback<ProjectExportData>(`/projects/${id}/export${query}`, undefined, async () => {
      const proj = await mockApi.getProjectById(id);
      if (!proj) throw new Error('Project not found');
      const { exportGameToStandaloneHtml } = await import('@shared/core');
      return exportGameToStandaloneHtml(proj.specification, { embedOfflineEngine: offline });
    });
  }

  // --- AI Game Generation ---
  async generateGame(payload: {
    prompt: string;
    genre: string;
    difficulty: string;
    theme?: string;
  }): Promise<{ project: GameProject; specification: GameSpecification }> {
    return this.fetchWithFallback<{ project: GameProject; specification: GameSpecification }>(
      '/generate',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      async () => {
        const spec = await mockApi.generateGame({
          prompt: payload.prompt,
          genre: payload.genre as any,
          difficulty: payload.difficulty as any,
          mechanics: ['player-movement', 'jumping', 'collectibles'],
          dimensions: { width: 800, height: 600 },
          physics: { gravityY: 800, playerSpeed: 280, jumpVelocity: 550 },
        });
        const proj: GameProject = {
          id: `proj-${Date.now()}`,
          name: spec.title,
          description: spec.prompt,
          status: 'ready',
          currentVersion: spec.version,
          genre: spec.genre,
          specification: spec,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          totalRuns: 0,
          testsPassed: 8,
          testsFailed: 0,
          openBugsCount: 0,
        };
        return { project: proj, specification: spec };
      }
    );
  }

  // --- Specifications ---
  async getSpecification(id: string): Promise<GameSpecification> {
    return this.fetchWithFallback<GameSpecification>(`/specs/${id}`, undefined, () => mockApi.getActiveSpecification());
  }

  async updateSpecification(id: string, fields: Partial<GameSpecification>): Promise<GameSpecification> {
    return this.fetchWithFallback<GameSpecification>(
      `/specs/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(fields),
      },
      () => mockApi.updateSpecification(fields)
    );
  }

  // --- Automated Testing ---
  async getTests(projectId?: string): Promise<TestCase[]> {
    const query = projectId ? `?projectId=${projectId}` : '';
    return this.fetchWithFallback<TestCase[]>(`/tests${query}`, undefined, () => mockApi.getTestCases());
  }

  async runTests(projectId: string): Promise<TestResult> {
    return this.fetchWithFallback<TestResult>(
      '/tests/run',
      {
        method: 'POST',
        body: JSON.stringify({ projectId }),
      },
      () => mockApi.executeTestSuite()
    );
  }

  async triggerControlledDefect(projectId: string): Promise<{ bug: BugReport; testResult: TestResult }> {
    return this.fetchWithFallback<{ bug: BugReport; testResult: TestResult }>(
      '/tests/trigger-defect',
      {
        method: 'POST',
        body: JSON.stringify({ projectId }),
      },
      async () => {
        const tests = await mockApi.getTestCases();
        const failing = tests.map((t) => (t.id === 'test-restart-08' ? { ...t, status: 'failed' as const } : t));
        const res: TestResult = {
          runId: `run-defect-${Date.now()}`,
          projectId,
          projectVersion: '0.3.0',
          startedAt: new Date().toISOString(),
          finishedAt: new Date().toISOString(),
          totalTests: failing.length,
          passedCount: failing.length - 1,
          failedCount: 1,
          durationMs: 2400,
          tests: failing,
          overallStatus: 'failed',
        };
        const bugs = await mockApi.getBugReports();
        return { bug: bugs[0]!, testResult: res };
      }
    );
  }

  // --- Bug Reports & Autonomous Repair ---
  async getBugs(projectId?: string): Promise<BugReport[]> {
    const query = projectId ? `?projectId=${projectId}` : '';
    return this.fetchWithFallback<BugReport[]>(`/bugs${query}`, undefined, () => mockApi.getBugReports());
  }

  async getBugById(id: string): Promise<BugReport | null> {
    return this.fetchWithFallback<BugReport | null>(`/bugs/${id}`);
  }

  async updateBugStatus(id: string, status: BugReport['repairStatus']): Promise<BugReport> {
    return this.fetchWithFallback<BugReport>(
      `/bugs/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ repairStatus: status }),
      },
      async () => (await mockApi.updateBugStatus(id, status))!
    );
  }

  async triggerAutoRepair(bugId: string): Promise<{ success: boolean; iteration: RepairIteration; updatedBug: BugReport }> {
    return this.fetchWithFallback<{ success: boolean; iteration: RepairIteration; updatedBug: BugReport }>(
      `/repair/${bugId}`,
      {
        method: 'POST',
      },
      () => mockApi.triggerAutoRepair(bugId)
    );
  }

  async getRepairs(bugId?: string): Promise<RepairIteration[]> {
    const query = bugId ? `?bugId=${bugId}` : '';
    return this.fetchWithFallback<RepairIteration[]>(`/repairs${query}`, undefined, () => mockApi.getRepairIterations());
  }

  async getAgentStatuses(): Promise<AgentStatus[]> {
    return this.fetchWithFallback<AgentStatus[]>('/agents/status', undefined, () => mockApi.getAgentStatuses());
  }

  async getSettings(): Promise<Record<string, any>> {
    return this.fetchWithFallback<Record<string, any>>('/settings', undefined, async () => ({}));
  }

  async saveSettings(settings: Record<string, any>): Promise<void> {
    await this.fetchWithFallback<any>('/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }

  // --- Authentication ---
  async register(data: UserRegistrationInput): Promise<{ user: UserAccount; token: string }> {
    return this.fetchWithFallback<{ user: UserAccount; token: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      async () => {
        // Fallback for mock mode
        const mockUser: UserAccount = {
          id: `user-${Date.now()}`,
          username: data.username.toLowerCase(),
          displayName: data.username,
          role: 'USER',
          termsAccepted: true,
          termsAcceptedAt: new Date().toISOString(),
          termsVersion: 'v1.0.0',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true,
        };
        return { user: mockUser, token: 'mock-session-token' };
      }
    );
  }

  async login(data: UserLoginInput): Promise<{ user: UserAccount; token: string }> {
    return this.fetchWithFallback<{ user: UserAccount; token: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      async () => {
        // Fallback for mock mode
        const mockUser: UserAccount = {
          id: 'user-mock-1',
          username: data.username.toLowerCase(),
          displayName: data.username,
          role: data.username.toLowerCase().includes('admin') ? 'ADMIN' : 'USER',
          termsAccepted: true,
          termsAcceptedAt: new Date().toISOString(),
          termsVersion: 'v1.0.0',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true,
        };
        return { user: mockUser, token: 'mock-session-token' };
      }
    );
  }

  async getCurrentUser(): Promise<{ user: UserAccount } | null> {
    try {
      return await this.fetchWithFallback<{ user: UserAccount }>('/auth/me');
    } catch {
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.fetchWithFallback<any>('/auth/logout', { method: 'POST' });
    } catch {
      // Ignored
    }
  }

  async bootstrapAdmin(data: BootstrapAdminInput): Promise<{ user: UserAccount; token: string }> {
    return this.fetchWithFallback<{ user: UserAccount; token: string }>(
      '/auth/bootstrap-admin',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  // --- Admin Operations ---
  async getAdminUsers(): Promise<UserAccount[]> {
    return this.fetchWithFallback<UserAccount[]>('/admin/users');
  }

  async updateUserRole(userId: string, role: 'USER' | 'ADMIN'): Promise<{ user: UserAccount }> {
    return this.fetchWithFallback<{ user: UserAccount }>(`/admin/users/${userId}/role`, {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  }

  async deleteUser(userId: string): Promise<void> {
    await this.fetchWithFallback<any>(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async getAdminSystem(): Promise<any> {
    return this.fetchWithFallback<any>('/admin/system');
  }
}

export const api = new ApiClient();
