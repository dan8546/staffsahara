import { create } from 'zustand';

interface ConfigState {
  language: 'fr' | 'ar';
  setLanguage: (lang: 'fr' | 'ar') => void;
}

export const useConfigStore = create<ConfigState>((set) => ({
  language: 'fr',
  setLanguage: (lang) => set({ language: lang }),
}));