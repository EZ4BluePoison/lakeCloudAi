import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ConversationSession,
  ConversationMessage,
  ContextWindowConfig,
  LLMConfig
} from '@/types';
import { createModelService } from '@/services/modelService';

interface SimpleChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  metadata?: Record<string, unknown>;
}

interface ConversationState {
  sessions: ConversationSession[];
  currentSessionId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createSession: (agentId: string, title?: string) => string;
  selectSession: (sessionId: string) => void;
  addMessage: (sessionId: string, role: 'user' | 'assistant', content: string) => void;
  sendMessage: (sessionId: string, content: string, llmConfig: LLMConfig) => Promise<void>;
  getContextForLLM: (sessionId: string, config: ContextWindowConfig) => SimpleChatMessage[];
  deleteSession: (sessionId: string) => void;
  clearAllSessions: () => void;
  getCurrentSession: () => ConversationSession | null;
}

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: null,
      isLoading: false,
      error: null,
      
      createSession: (agentId: string, title?: string) => {
        const id = 'session-' + Date.now();
        const newSession: ConversationSession = {
          id,
          agentId,
          title: title || '新对话',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          messages: [],
          metadata: {
            tokenCount: 0,
            messageCount: 0
          }
        };
        
        set(state => ({
          sessions: [...state.sessions, newSession],
          currentSessionId: id
        }));
        
        return id;
      },
      
      selectSession: (sessionId: string) => {
        set({ currentSessionId: sessionId });
      },
      
      addMessage: (sessionId: string, role: 'user' | 'assistant', content: string) => {
        const message: ConversationMessage = {
          id: 'msg-' + Date.now(),
          role,
          content,
          timestamp: new Date(),
          metadata: {}
        };
        
        set(state => ({
          sessions: state.sessions.map(session => {
            if (session.id === sessionId) {
              const updatedMessages = [...session.messages, message];
              return {
                ...session,
                messages: updatedMessages,
                updatedAt: new Date(),
                metadata: {
                  ...session.metadata,
                  messageCount: updatedMessages.length
                }
              };
            }
            return session;
          })
        }));
      },
      
      sendMessage: async (sessionId: string, content: string, llmConfig: LLMConfig) => {
        // 添加用户消息
        get().addMessage(sessionId, 'user', content);
        set({ isLoading: true, error: null });
        
        try {
          const state = get();
          const session = state.sessions.find(s => s.id === sessionId);
          
          if (!session) {
            throw new Error('Session not found');
          }
          
          // 准备对话上下文
          const chatMessages: SimpleChatMessage[] = session.messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }));
          
          // 调用模型服务
          const modelService = createModelService(llmConfig);
          const response = await modelService.chat(chatMessages);
          
          // 添加助手响应
          get().addMessage(sessionId, 'assistant', response.content);
          
        } catch (error) {
          console.error('Error sending message:', error);
          set({ error: error instanceof Error ? error.message : 'Unknown error' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      getContextForLLM: (sessionId: string, config: ContextWindowConfig): SimpleChatMessage[] => {
        const state = get();
        const session = state.sessions.find(s => s.id === sessionId);
        
        if (!session) return [];
        
        let messages = [...session.messages];
        
        // 限制消息数量
        if (config.maxMessages && messages.length > config.maxMessages) {
          messages = messages.slice(-config.maxMessages);
        }
        
        // 转换为ChatMessage格式
        return messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      },
      
      deleteSession: (sessionId: string) => {
        set(state => ({
          sessions: state.sessions.filter(s => s.id !== sessionId),
          currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId
        }));
      },
      
      clearAllSessions: () => {
        set({ sessions: [], currentSessionId: null });
      },
      
      getCurrentSession: () => {
        const state = get();
        return state.sessions.find(s => s.id === state.currentSessionId) || null;
      }
    }),
    {
      name: 'conversation-storage',
      version: 1
    }
  )
);
