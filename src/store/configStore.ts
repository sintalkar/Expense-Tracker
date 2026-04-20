import { create } from 'zustand';

interface ConfigState {
  featureFlags: Record<string, boolean>;
  setFeatureFlags: (flags: Record<string, boolean>) => void;
}

export const useConfigStore = create<ConfigState>((set) => ({
  featureFlags: {
    scan_enabled: true,
    gmail_sync_enabled: true,
  },
  setFeatureFlags: (featureFlags) => set({ featureFlags }),
}));
