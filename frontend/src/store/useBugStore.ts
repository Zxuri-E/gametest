import { create } from 'zustand';
import { BugReport, RepairIteration, BugSeverity, BugCategory, BugRepairStatus } from '@shared/core';
import { mockApi } from '../services/mock/mockApiService';

interface BugState {
  bugs: BugReport[];
  selectedBug: BugReport | null;
  filterSeverity: string;
  filterCategory: string;
  filterStatus: string;
  searchQuery: string;
  isRepairing: boolean;
  repairResult: { iteration: RepairIteration; success: boolean } | null;
  isLoading: boolean;

  fetchBugs: () => Promise<void>;
  setSelectedBug: (bug: BugReport | null) => void;
  setFilterSeverity: (sev: string) => void;
  setFilterCategory: (cat: string) => void;
  setFilterStatus: (stat: string) => void;
  setSearchQuery: (query: string) => void;
  updateBugStatus: (id: string, status: BugRepairStatus) => Promise<void>;
  triggerAutoRepair: (bugId: string) => Promise<boolean>;
  clearRepairResult: () => void;
}

export const useBugStore = create<BugState>((set, get) => ({
  bugs: [],
  selectedBug: null,
  filterSeverity: 'all',
  filterCategory: 'all',
  filterStatus: 'all',
  searchQuery: '',
  isRepairing: false,
  repairResult: null,
  isLoading: false,

  fetchBugs: async () => {
    set({ isLoading: true });
    try {
      const bugs = await mockApi.getBugReports();
      set({ bugs, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setSelectedBug: (bug) => set({ selectedBug: bug }),
  setFilterSeverity: (filterSeverity) => set({ filterSeverity }),
  setFilterCategory: (filterCategory) => set({ filterCategory }),
  setFilterStatus: (filterStatus) => set({ filterStatus }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  updateBugStatus: async (id, status) => {
    try {
      const updated = await mockApi.updateBugStatus(id, status);
      if (updated) {
        set((state) => ({
          bugs: state.bugs.map((b) => (b.id === id ? updated : b)),
          selectedBug: state.selectedBug?.id === id ? updated : state.selectedBug,
        }));
      }
    } catch (err) {
      console.error(err);
    }
  },

  triggerAutoRepair: async (bugId: string) => {
    set({ isRepairing: true, repairResult: null });
    try {
      const result = await mockApi.triggerAutoRepair(bugId);
      set((state) => ({
        isRepairing: false,
        repairResult: { iteration: result.iteration, success: result.success },
        bugs: state.bugs.map((b) => (b.id === bugId ? result.updatedBug : b)),
        selectedBug: state.selectedBug?.id === bugId ? result.updatedBug : state.selectedBug,
      }));
      return true;
    } catch (err) {
      set({ isRepairing: false });
      return false;
    }
  },

  clearRepairResult: () => set({ repairResult: null }),
}));

