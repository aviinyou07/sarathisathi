import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'krishna';
  text: string;
  isCrisis?: boolean;
  timestamp: number;
}

interface ChatStore {
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
}

export const useChatStore = create<ChatStore>((set) => ({
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
}));
