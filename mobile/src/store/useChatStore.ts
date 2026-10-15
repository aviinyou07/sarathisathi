import { create } from 'zustand';
import { TreasuryVerse } from '../data/gitaTreasury';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'krishna';
  text: string;
  isCrisis?: boolean;
  timestamp: number;
}

export type AppTab = 'counsel' | 'treasury' | 'sadhana';

interface ChatStore {
  // Navigation & Onboarding
  hasCompletedOnboarding: boolean;
  activeTab: AppTab;
  setHasCompletedOnboarding: (val: boolean) => void;
  setActiveTab: (tab: AppTab) => void;

  // Chat Counsel
  messages: ChatMessage[];
  isStreaming: boolean;
  activePlayingId: string | null;
  dailyQuotaLeft: number;
  addMessage: (msg: ChatMessage) => void;
  appendStreamChunk: (botMsgId: string, chunk: string) => void;
  markCrisis: (botMsgId: string, text: string) => void;
  setIsStreaming: (val: boolean) => void;
  setActivePlayingId: (id: string | null) => void;
  decrementQuota: () => void;
  clearHistory: () => void;

  // Bookmarks & Sadhana Practice
  savedVerses: TreasuryVerse[];
  toggleSaveVerse: (verse: TreasuryVerse) => void;
  isVerseSaved: (reference: string) => boolean;

  // Micro-Sadhana Daily Checklist
  sadhanaChecked: boolean[];
  toggleSadhanaTask: (index: number) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // Defaults to false so new seekers experience the sacred onboarding
  hasCompletedOnboarding: false,
  activeTab: 'counsel',
  setHasCompletedOnboarding: (val) => set({ hasCompletedOnboarding: val }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  messages: [
    {
      id: 'welcome',
      sender: 'krishna',
      text: 'Pranam, Partha. What storm clouds your inner mind today? Speak without hesitation; I am listening as your Sakha.',
      timestamp: Date.now(),
    },
  ],
  isStreaming: false,
  activePlayingId: null,
  dailyQuotaLeft: 10,

  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, msg],
    })),

  appendStreamChunk: (botMsgId, chunk) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === botMsgId ? { ...m, text: m.text + chunk } : m,
      ),
    })),

  markCrisis: (botMsgId, text) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === botMsgId ? { ...m, text, isCrisis: true } : m,
      ),
    })),

  setIsStreaming: (val) => set({ isStreaming: val }),
  setActivePlayingId: (id) => set({ activePlayingId: id }),
  decrementQuota: () =>
    set((state) => ({
      dailyQuotaLeft: Math.max(0, state.dailyQuotaLeft - 1),
    })),
  clearHistory: () =>
    set({
      messages: [
        {
          id: 'welcome-' + Date.now(),
          sender: 'krishna',
          text: 'Pranam, Partha. What storm clouds your inner mind today? Speak without hesitation; I am listening as your Sakha.',
          timestamp: Date.now(),
        },
      ],
    }),

  // Bookmarks
  savedVerses: [],
  toggleSaveVerse: (verse) =>
    set((state) => {
      const exists = state.savedVerses.some((v) => v.reference === verse.reference);
      if (exists) {
        return { savedVerses: state.savedVerses.filter((v) => v.reference !== verse.reference) };
      }
      return { savedVerses: [...state.savedVerses, verse] };
    }),
  isVerseSaved: (reference) => get().savedVerses.some((v) => v.reference === reference),

  // 3 daily tasks: Pranayama, Contemplation, Nishkama Intent
  sadhanaChecked: [false, false, false],
  toggleSadhanaTask: (index) =>
    set((state) => {
      const next = [...state.sadhanaChecked];
      next[index] = !next[index];
      return { sadhanaChecked: next };
    }),
}));
