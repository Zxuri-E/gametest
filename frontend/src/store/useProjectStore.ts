import { create } from 'zustand';
import { GameProject, GameSpecification } from '@shared/core';
import { api } from '../services/api/apiClient';

interface ProjectState {
  projects: GameProject[];
  activeProject: GameProject | null;
  activeSpec: GameSpecification | null;
  isLoading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  selectProject: (id: string) => Promise<void>;
  updateActiveSpec: (spec: Partial<GameSpecification>) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  activeProject: null,
  activeSpec: null,
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await api.getProjects();
      const currentActive = get().activeProject;
      const activeProj = currentActive
        ? projects.find((p) => p.id === currentActive.id) || projects[0]
        : projects[0];

      set({
        projects,
        activeProject: activeProj || null,
        activeSpec: activeProj?.specification || null,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch projects', isLoading: false });
    }
  },

  selectProject: async (id: string) => {
    const found = get().projects.find((p) => p.id === id);
    if (found) {
      set({ activeProject: found, activeSpec: found.specification });
    }
  },

  updateActiveSpec: async (updatedFields: Partial<GameSpecification>) => {
    const current = get().activeSpec;
    if (!current) return;
    try {
      const updated = await api.updateSpecification(current.id, updatedFields);
      set({ activeSpec: updated });
    } catch (err: any) {
      set({ error: err.message || 'Failed to update specification' });
    }
  },
}));
