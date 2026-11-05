import { create } from 'zustand';

export interface SettingsState {
  general: {
    projectName: string;
    autoSave: boolean;
    telemetryVerbosity: 'minimal' | 'normal' | 'verbose';
    canvasFpsCap: number;
  };
  appearance: {
    accentColor: 'cyan' | 'indigo' | 'emerald';
    uiDensity: 'compact' | 'comfortable';
    showGridGuides: boolean;
  };
  aiProvider: {
    activeProvider: 'anthropic' | 'openai' | 'gemini' | 'local';
    generatorModel: string;
    testerModel: string;
    diagnosticianModel: string;
    repairModel: string;
    apiKeyConfigured: {
      anthropic: boolean;
      openai: boolean;
      gemini: boolean;
    };
  };
  localModel: {
    endpoint: string;
    contextLength: number;
    gpuLayers: number;
    temperature: number;
  };
  testing: {
    headless: boolean;
    workers: number;
    timeoutSeconds: number;
    captureScreenshotOnFail: boolean;
    videoRecording: boolean;
  };

  updateGeneral: (fields: Partial<SettingsState['general']>) => void;
  updateAppearance: (fields: Partial<SettingsState['appearance']>) => void;
  updateAiProvider: (fields: Partial<SettingsState['aiProvider']>) => void;
  updateLocalModel: (fields: Partial<SettingsState['localModel']>) => void;
  updateTesting: (fields: Partial<SettingsState['testing']>) => void;
  resetDefaults: () => void;
}

const DEFAULT_SETTINGS = {
  general: {
    projectName: 'Cyberpunk Game Engine Experiment',
    autoSave: true,
    telemetryVerbosity: 'normal' as const,
    canvasFpsCap: 60,
  },
  appearance: {
    accentColor: 'cyan' as const,
    uiDensity: 'comfortable' as const,
    showGridGuides: true,
  },
  aiProvider: {
    activeProvider: 'anthropic' as const,
    generatorModel: 'claude-3-5-sonnet-20241022',
    testerModel: 'claude-3-5-haiku-20241022',
    diagnosticianModel: 'claude-3-5-sonnet-20241022',
    repairModel: 'claude-3-5-sonnet-20241022',
    apiKeyConfigured: {
      anthropic: true,
      openai: false,
      gemini: true,
    },
  },
  localModel: {
    endpoint: 'http://localhost:11434',
    contextLength: 8192,
    gpuLayers: 33,
    temperature: 0.2,
  },
  testing: {
    headless: true,
    workers: 2,
    timeoutSeconds: 30,
    captureScreenshotOnFail: true,
    videoRecording: false,
  },
};

export const useSettingsStore = create<SettingsState>((set) => ({
  ...DEFAULT_SETTINGS,

  updateGeneral: (fields) =>
    set((state) => ({ general: { ...state.general, ...fields } })),
  updateAppearance: (fields) =>
    set((state) => ({ appearance: { ...state.appearance, ...fields } })),
  updateAiProvider: (fields) =>
    set((state) => ({ aiProvider: { ...state.aiProvider, ...fields } })),
  updateLocalModel: (fields) =>
    set((state) => ({ localModel: { ...state.localModel, ...fields } })),
  updateTesting: (fields) =>
    set((state) => ({ testing: { ...state.testing, ...fields } })),
  resetDefaults: () => set(DEFAULT_SETTINGS),
}));

