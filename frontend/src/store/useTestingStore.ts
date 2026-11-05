import { create } from 'zustand';
import { TestCase, TestResult, AgentStatus } from '@shared/core';
import { mockApi } from '../services/mock/mockApiService';

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
      const tests = await mockApi.getTestCases();
      const agents = await mockApi.getAgentStatuses();
      set({ testCases: tests, agentStatuses: agents, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  runAllTests: async () => {
    set({ isRunningTests: true });
    try {
      const result = await mockApi.executeTestSuite((testId, status) => {
        set((state) => ({
          activeRunningTestId: status === 'running' ? testId : null,
          testCases: state.testCases.map((t) =>
            t.id === testId ? { ...t, status } : t
          ),
        }));
      });
      set({
        testResult: result,
        testCases: result.tests,
        isRunningTests: false,
        activeRunningTestId: null,
      });
      await get().fetchAgentStatuses();
    } catch {
      set({ isRunningTests: false, activeRunningTestId: null });
    }
  },

  setSelectedTestCase: (test) => set({ selectedTestCase: test }),
  setFilterMechanic: (mechanic) => set({ filterMechanic: mechanic }),

  fetchAgentStatuses: async () => {
    try {
      const statuses = await mockApi.getAgentStatuses();
      set({ agentStatuses: statuses });
    } catch (err) {
      console.error(err);
    }
  },
}));

