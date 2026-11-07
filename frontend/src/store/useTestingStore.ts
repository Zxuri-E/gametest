import { create } from 'zustand';
import { TestCase, TestResult, AgentStatus } from '@shared/core';
import { api } from '../services/api/apiClient';
import { useProjectStore } from './useProjectStore';

interface TestingState {
  testCases: TestCase[];
  testResult: TestResult | null;
  isRunningTests: boolean;
  activeRunningTestId: string | null;
  selectedTestCase: TestCase | null;
  agentStatuses: AgentStatus[];
  isLoading: boolean;
  filterMechanic: string;

  fetchTests: () => Promise<void>;
  runAllTests: () => Promise<void>;
  triggerControlledDefect: () => Promise<void>;
  setSelectedTestCase: (test: TestCase | null) => void;
  setFilterMechanic: (mechanic: string) => void;
  fetchAgentStatuses: () => Promise<void>;
}

export const useTestingStore = create<TestingState>((set, get) => ({
  testCases: [],
  testResult: null,
  isRunningTests: false,
  activeRunningTestId: null,
  selectedTestCase: null,
  agentStatuses: [],
  isLoading: false,
  filterMechanic: 'all',

  fetchTests: async () => {
    set({ isLoading: true });
    try {
      const activeProj = useProjectStore.getState().activeProject;
      const tests = await api.getTests(activeProj?.id);
      const agents = await api.getAgentStatuses();
      set({ testCases: tests, agentStatuses: agents, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  runAllTests: async () => {
    const activeProj = useProjectStore.getState().activeProject;
    if (!activeProj) return;

    set({ isRunningTests: true });
    try {
      const result = await api.runTests(activeProj.id);
      set({
        testResult: result,
        testCases: result.tests,
        isRunningTests: false,
        activeRunningTestId: null,
      });
      await get().fetchAgentStatuses();
      await useProjectStore.getState().fetchProjects();
    } catch {
      set({ isRunningTests: false, activeRunningTestId: null });
    }
  },

  triggerControlledDefect: async () => {
    const activeProj = useProjectStore.getState().activeProject;
    if (!activeProj) return;

    set({ isRunningTests: true });
    try {
      const outcome = await api.triggerControlledDefect(activeProj.id);
      set({
        testResult: outcome.testResult,
        testCases: outcome.testResult.tests,
        isRunningTests: false,
      });
      await get().fetchAgentStatuses();
      await useProjectStore.getState().fetchProjects();
    } catch {
      set({ isRunningTests: false });
    }
  },

  setSelectedTestCase: (test) => set({ selectedTestCase: test }),
  setFilterMechanic: (mechanic) => set({ filterMechanic: mechanic }),

  fetchAgentStatuses: async () => {
    try {
      const statuses = await api.getAgentStatuses();
      set({ agentStatuses: statuses });
    } catch (err) {
      console.error(err);
    }
  },
}));
