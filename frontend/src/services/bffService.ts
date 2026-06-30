/**
 * BFF Service 抽象层
 * 
 * 当前为 mock 实现，所有方法均返回本地模拟数据。
 * 后续替换原则：保持接口签名不变，仅把方法体替换为 fetch('/api/v1/...') 调用。
 */

import { createModelService } from './modelService';
import { getAgentPrompt } from '@/data/agentPrompts';
import type {
  Citation,
  TokenUsage,
  LLMConfig,
  PromptTemplate,
  KnowledgeSource,
  ChatMessage,
} from '@/types';
import {
  mockConversations,
  mockConversationMessages,
  generateMockAssistantReply,
  mockAgents,
  mockAgentVersions,
  mockDatasets,
  mockDocuments,
  mockDocumentChunks,
  mockModelConfigs,
  mockMcpServers,
  mockMcpTools,
  defaultBffLlmConfig,
  type BffConversation,
  type BffChatMessage,
  type BffAgent,
  type BffAgentVersion,
  type BffDataset,
  type BffDocument,
  type BffDocumentChunk,
  type BffRetrievalTestResult,
  type BffModelConfig,
  type BffMcpServer,
  type BffMcpTool,
} from '@/data/mockBffData';

// ==================== Chat API ====================

export interface SendChatMessageParams {
  agentId: string;
  query: string;
  conversationId?: string;
  inputs?: Record<string, any>;
  responseMode?: 'blocking' | 'streaming';
}

export interface SendChatMessageResult {
  conversationId: string;
  messageId: string;
  answer: string;
  metadata?: {
    citations?: Citation[];
    tokenUsage?: TokenUsage;
  };
}

class BffChatService {
  async listConversations(agentId?: string): Promise<BffConversation[]> {
    await delay(200);
    if (!agentId) return [...mockConversations];
    return mockConversations.filter(c => c.agentId === agentId);
  }

  async getMessages(conversationId: string): Promise<BffChatMessage[]> {
    await delay(200);
    return mockConversationMessages[conversationId] ? [...mockConversationMessages[conversationId]] : [];
  }

  async sendMessage(params: SendChatMessageParams): Promise<SendChatMessageResult> {
    const conversationId = params.conversationId || `conv-${Date.now()}`;
    const messageId = `msg-${Date.now()}`;

    const agentPrompt = getAgentPrompt(params.agentId);
    const systemPrompt = agentPrompt?.systemPrompt || '你是一个专业的企业智能体助手。';
    const userPromptTemplate = agentPrompt?.userPromptTemplate || '{{user_question}}';

    // 替换 prompt 模板变量
    const userPrompt = userPromptTemplate.replace('{{user_question}}', params.query);
    const finalSystemPrompt = systemPrompt
      .replace(/\{\{knowledge_context\}\}/g, params.inputs?.knowledge_context || '');

    const messages: ChatMessage[] = [
      { role: 'system', content: finalSystemPrompt },
      { role: 'user', content: userPrompt },
    ];

    // 第一优先级：后端 BFF 代理的国联 AI 80B 模型（Qwen3-Next）
    const wuxidataConfig: LLMConfig = {
      provider: 'wuxidata',
      model: '/model/Qwen3-Next',
      apiEndpoint: 'http://localhost:8080',
      temperature: 0.6,
      topP: 0.9,
      maxTokens: 2048,
      presencePenalty: 0,
      frequencyPenalty: 0,
    };

    // 第二优先级：本地 Ollama（无需后端/数据库）
    const ollamaConfig: LLMConfig = {
      provider: 'ollama',
      model: 'glm4:9b',
      apiEndpoint: 'http://localhost:11434',
      temperature: 0.6,
      topP: 0.9,
      maxTokens: 2048,
      presencePenalty: 0,
      frequencyPenalty: 0,
      ollamaBaseUrl: 'http://localhost:11434',
    };

    const tryChat = async (config: LLMConfig): Promise<string> => {
      const modelService = createModelService(config);
      const response = await modelService.chat(messages);
      return response.content || '抱歉，我无法回答这个问题。';
    };

    try {
      const answer = await tryChat(wuxidataConfig);
      return {
        conversationId,
        messageId,
        answer,
      };
    } catch (wuxidataError) {
      console.warn('[BFF] 国联 AI 80B 模型调用失败，尝试本地 Ollama:', wuxidataError);
      try {
        const answer = await tryChat(ollamaConfig);
        return {
          conversationId,
          messageId,
          answer,
        };
      } catch (ollamaError) {
        console.warn('[BFF] 本地 Ollama 也失败，使用兜底 mock 回复:', ollamaError);
        const answer = generateMockAssistantReply(params.query);
        return {
          conversationId,
          messageId,
          answer,
          metadata: {
            tokenUsage: {
              promptTokens: Math.floor(params.query.length * 1.5),
              completionTokens: Math.floor(answer.length * 0.5),
              totalTokens: Math.floor(params.query.length * 1.5 + answer.length * 0.5),
            },
          },
        };
      }
    }
  }

  async sendFeedback(messageId: string, rating: 'like' | 'dislike', content?: string): Promise<void> {
    await delay(200);
    console.log('[BFF Mock] feedback', { messageId, rating, content });
  }

  async deleteConversation(conversationId: string): Promise<void> {
    await delay(200);
    console.log('[BFF Mock] delete conversation', conversationId);
  }
}

// ==================== Agent API ====================

export interface SaveAgentParams {
  agentId: string;
  name: string;
  description: string;
  icon?: string;
  iconBg?: string;
  category?: string;
  tags?: string[];
  mode?: 'chat-agent' | 'workflow';
  llmConfig?: LLMConfig;
  prompts?: PromptTemplate[];
  knowledgeSources?: KnowledgeSource[];
  tools?: string[];
}

export interface PublishAgentParams {
  agentId: string;
  changeLog: string;
}

class BffAgentService {
  async listAgents(): Promise<BffAgent[]> {
    await delay(300);
    return [...mockAgents];
  }

  async getAgent(agentId: string): Promise<BffAgent | null> {
    await delay(200);
    return mockAgents.find(a => a.agentId === agentId) || null;
  }

  async saveAgent(params: SaveAgentParams): Promise<BffAgent> {
    await delay(500);
    const existing = mockAgents.find(a => a.agentId === params.agentId);
    const saved: BffAgent = {
      ...(existing || mockAgents[0]),
      ...params,
      id: existing?.id || `agent-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    console.log('[BFF Mock] save agent', saved);
    return saved;
  }

  async publishAgent(params: PublishAgentParams): Promise<BffAgentVersion> {
    await delay(400);
    const version: BffAgentVersion = {
      id: `ver-${Date.now()}`,
      agentId: params.agentId,
      version: `v${(mockAgentVersions.length + 1).toFixed(1).replace('.0', '.0')}`,
      changeLog: params.changeLog,
      createdAt: new Date().toISOString(),
      createdBy: '当前用户',
    };
    console.log('[BFF Mock] publish agent', version);
    return version;
  }

  async listVersions(agentId: string): Promise<BffAgentVersion[]> {
    await delay(200);
    return mockAgentVersions.filter(v => v.agentId === agentId);
  }
}

// ==================== Knowledge API ====================

export interface UploadDocumentParams {
  datasetId: string;
  file: File;
}

class BffKnowledgeService {
  async listDatasets(): Promise<BffDataset[]> {
    await delay(200);
    return [...mockDatasets];
  }

  async listDocuments(datasetId?: string): Promise<BffDocument[]> {
    await delay(200);
    if (!datasetId) return [...mockDocuments];
    return mockDocuments.filter(d => d.datasetId === datasetId);
  }

  async uploadDocument(params: UploadDocumentParams): Promise<BffDocument> {
    await delay(600);
    const doc: BffDocument = {
      id: `doc-${Date.now()}`,
      datasetId: params.datasetId,
      name: params.file.name,
      size: `${(params.file.size / 1024).toFixed(1)} KB`,
      status: 'uploaded',
      statusText: '已上传，等待解析',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    console.log('[BFF Mock] upload document', doc);
    return doc;
  }

  async deleteDocument(documentId: string): Promise<void> {
    await delay(200);
    console.log('[BFF Mock] delete document', documentId);
  }

  async getDocumentChunks(documentId: string): Promise<BffDocumentChunk[]> {
    await delay(300);
    return mockDocumentChunks.filter(c => c.documentId === documentId);
  }

  async testRetrieval(_datasetId: string, query: string): Promise<BffRetrievalTestResult> {
    await delay(500);
    return {
      query,
      results: mockDocumentChunks.map(c => ({ ...c, score: c.score || 0.9 })),
    };
  }
}

// ==================== Model Config API ====================

class BffModelService {
  async listModelConfigs(): Promise<BffModelConfig[]> {
    await delay(200);
    return [...mockModelConfigs];
  }

  async getDefaultModelConfig(): Promise<LLMConfig> {
    await delay(100);
    return { ...defaultBffLlmConfig };
  }
}

// ==================== MCP API ====================

class BffMcpService {
  async listServers(): Promise<BffMcpServer[]> {
    await delay(200);
    return [...mockMcpServers];
  }

  async listTools(serverId?: string): Promise<BffMcpTool[]> {
    await delay(200);
    if (!serverId) return [...mockMcpTools];
    return mockMcpTools.filter(t => t.serverId === serverId);
  }
}

// ==================== Service Facade ====================

class BffService {
  chat = new BffChatService();
  agent = new BffAgentService();
  knowledge = new BffKnowledgeService();
  model = new BffModelService();
  mcp = new BffMcpService();
}

export const bffService = new BffService();

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default bffService;

// Re-export BFF 数据类型，方便组件层统一从 bffService 引入
export type {
  BffConversation,
  BffChatMessage,
  BffAgent,
  BffAgentVersion,
  BffDataset,
  BffDocument,
  BffDocumentChunk,
  BffRetrievalTestResult,
  BffModelConfig,
  BffMcpServer,
  BffMcpTool,
} from '@/data/mockBffData';
