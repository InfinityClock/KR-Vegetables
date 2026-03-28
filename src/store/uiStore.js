import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUiStore = create(
  persist(
    (set) => ({
      onboardingDone: false,
      setOnboardingDone: () => set({ onboardingDone: true }),
      isOffline: false,
      setOffline: (val) => set({ isOffline: val }),
    }),
    {
      name: 'kr-ui',
      partialize: (s) => ({ onboardingDone: s.onboardingDone }),
    }
  )
)
