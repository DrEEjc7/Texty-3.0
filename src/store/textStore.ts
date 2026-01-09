import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TextStats, LoremConfig } from '@/features/text/types'

interface TextStore {
  text: string
  loremText: string
  stats: TextStats
  loremConfig: LoremConfig
  theme: 'light' | 'dark'

  setText: (text: string) => void
  setLoremText: (text: string) => void
  setStats: (stats: TextStats) => void
  setLoremConfig: (config: Partial<LoremConfig>) => void
  toggleTheme: () => void
  clearText: () => void
  clearLoremText: () => void
}

const initialStats: TextStats = {
  words: 0,
  uniqueWords: 0,
  characters: 0,
  sentences: 0,
  paragraphs: 0,
  avgWordLength: '—',
  readingTime: 0,
  fleschScore: 0,
  gradeLevel: '—',
  keywords: [],
  keywordDensity: [],
  readability: {
    flesch: 0,
    fleschGrade: '—',
    gunningFog: 0,
    smog: 0,
    colemanLiau: 0,
    automatedReadability: 0,
  },
  writingStyle: {
    passiveVoicePercentage: 0,
    adverbCount: 0,
    complexSentencePercentage: 0,
    avgSentenceLength: 0,
    toneIndicator: 'neutral',
  },
  seoScore: 0,
}

const initialLoremConfig: LoremConfig = {
  type: 'paragraphs',
  count: 3,
  style: 'english',
}

export const useTextStore = create<TextStore>()(
  persist(
    (set) => ({
      text: '',
      loremText: '',
      stats: initialStats,
      loremConfig: initialLoremConfig,
      theme: 'light',

      setText: (text) => set({ text }),

      setLoremText: (loremText) => set({ loremText }),

      setStats: (stats) => set({ stats }),

      setLoremConfig: (config) =>
        set((state) => ({
          loremConfig: { ...state.loremConfig, ...config },
        })),

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),

      clearText: () =>
        set({
          text: '',
          stats: initialStats,
        }),

      clearLoremText: () => set({ loremText: '' }),
    }),
    {
      name: 'texty-storage',
      partialize: (state) => ({
        theme: state.theme,
        text: state.text,
      }),
    }
  )
)
