/**
 * BFF Service 抽象层
 *
 * 当前为 mock 实现，所有方法均返回本地模拟数据。
 * 后续替换原则：保持接口签名不变，仅把方法体替换为 fetch('/api/v1/...') 调用。
 */

const API_BASE_URL = 'http://10.110.10.33:9090';

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
  inputs?: Record<string, string>;
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

    // 统一使用国联 AI 80B 模型（Qwen3-Next）
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

    try {
      const modelService = createModelService(wuxidataConfig);
      const response = await modelService.chat(messages);
      const answer = response.content || '抱歉，我无法回答这个问题。';
      return {
        conversationId,
        messageId,
        answer,
      };
    } catch (error) {
      console.warn('[BFF] 国联 AI 80B 模型调用失败，使用兜底 mock 回复:', error);
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

function formatBytes(value?: number): string {
  if (value == null) return '-';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function toISO(ts?: number): string | undefined {
  if (ts == null) return undefined;
  return new Date(ts * 1000).toISOString();
}

function toBffDataset(raw: unknown): BffDataset {
  const r = raw as Record<string, unknown>;
  return {
    id: r.id as string,
    name: r.name as string,
    description: (r.description as string | undefined) || '',
    documentCount: (r.document_count as number | undefined) ?? 0,
    createdAt: toISO(r.created_at as number | undefined) || '',
    updatedAt: toISO(r.updated_at as number | undefined) || '',
  };
}

function toBffDocument(raw: unknown): BffDocument {
  const r = raw as Record<string, unknown>;
  const detail = (r.data_source_detail_dict as Record<string, unknown> | undefined) || {};
  const uploadFile = (detail.upload_file as Record<string, unknown> | undefined) || {};
  return {
    id: r.id as string,
    datasetId: (r.dataset_id as string | undefined) || '',
    name: r.name as string,
    size: formatBytes(uploadFile.size as number | undefined),
    status: ((r.indexing_status as string | undefined) || 'pending') as BffDocument['status'],
    statusText: (r.display_status as string | undefined) || (r.indexing_status as string | undefined) || 'pending',
    createdAt: toISO(r.created_at as number | undefined) || '',
    updatedAt: toISO(r.created_at as number | undefined) || '',
  };
}

async function unwrap<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`request failed: ${res.status}`);
  const json = (await res.json()) as unknown;
  // list APIs wrap with { data: [...] }; create/update return the object directly
  if (json && typeof json === 'object' && 'data' in json && !('id' in json)) {
    return (json as { data: T }).data;
  }
  return json as T;
}

class BffKnowledgeService {
  async listDatasets(): Promise<BffDataset[]> {
    const res = await fetch(`${API_BASE_URL}/api/console/knowledge/datasets?limit=1000`);
    const data = await unwrap<unknown[]>(res);
    return (data || []).map(item => toBffDataset(item));
  }

  async createDataset(payload: { name: string; description?: string }): Promise<BffDataset> {
    const res = await fetch(`${API_BASE_URL}/api/console/knowledge/datasets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return toBffDataset(await unwrap<unknown>(res));
  }

  async updateDataset(datasetId: string, payload: Partial<BffDataset>): Promise<BffDataset> {
    const res = await fetch(`${API_BASE_URL}/api/console/knowledge/datasets/${datasetId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return toBffDataset(await unwrap<unknown>(res));
  }

  async deleteDataset(datasetId: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/api/console/knowledge/datasets/${datasetId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`deleteDataset failed: ${res.status}`);
  }

  async listDocuments(datasetId: string): Promise<BffDocument[]> {
    const res = await fetch(`${API_BASE_URL}/api/console/knowledge/datasets/${datasetId}/documents?limit=1000`);
    const data = await unwrap<unknown[]>(res);
    return (data || []).map(item => toBffDocument(item));
  }

  async uploadDocument(params: UploadDocumentParams): Promise<BffDocument> {
    const formData = new FormData();
    formData.append('file', params.file);
    const res = await fetch(`${API_BASE_URL}/api/console/knowledge/datasets/${params.datasetId}/documents/file`, {
      method: 'POST',
      body: formData,
    });
    const json = await unwrap<{ documents?: unknown[] }>(res);
    const docs = json.documents || [];
    return toBffDocument(docs[0] ?? json);
  }

  async downloadDocument(datasetId: string, documentId: string): Promise<Blob> {
    const res = await fetch(`${API_BASE_URL}/api/console/knowledge/datasets/${datasetId}/documents/${documentId}/download`);
    if (!res.ok) throw new Error(`downloadDocument failed: ${res.status}`);
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const text = await res.text();
      throw new Error(`downloadDocument failed: ${text}`);
    }
    return res.blob();
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
