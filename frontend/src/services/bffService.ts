/**
 * BFF Service 抽象层
 *
 * 当前为 mock 实现，所有方法均返回本地模拟数据。
 * 后续替换原则：保持接口签名不变，仅把方法体替换为 fetch('/api/v1/...') 调用。
 */

const API_BASE_URL = '/knowledge-api';

const CONSOLE_TOKEN_KEY = 'lakecloud-access-token';
const DIFY_TOKEN_KEY = 'lakecloud-dify-token';

/** 获取平台 Console 接口（/api/console）使用的 JWT */
function getConsoleToken(): string | undefined {
  try {
    return localStorage.getItem(CONSOLE_TOKEN_KEY) || undefined;
  } catch {
    return undefined;
  }
}

/** 获取 Dify 原生调试接口（/debug/dify）使用的 API Key */
function getDifyToken(): string | undefined {
  try {
    const envToken = import.meta.env.VITE_DIFY_API_TOKEN || import.meta.env.VITE_API_TOKEN;
    if (typeof envToken === 'string' && envToken && !envToken.startsWith('YOUR_')) {
      return envToken;
    }
    const storageToken = localStorage.getItem(DIFY_TOKEN_KEY);
    if (storageToken) return storageToken;
  } catch {
    // ignore
  }
  return undefined;
}

function getConsoleAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = getConsoleToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function getDifyAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = getDifyToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function getJsonAuthHeaders(): Record<string, string> {
  return { 'Content-Type': 'application/json', ...getConsoleAuthHeaders() };
}

/** 判断 agentId 是否为后端真实的应用 ID（非 hardcoded 前缀） */
function isBackendAppId(id: string): boolean {
  if (!id || id.length < 4) return false;
  // hardcoded 前端 ID 保持走本地模型兜底
  if (id.startsWith('plaza-') || id.startsWith('my-') || id.startsWith('super')) return false;
  return true;
}

import type {
  Citation,
  TokenUsage,
  LLMConfig,
  BffApplication,
  CreateApplicationRequest,
  BffModelTypeItem,
} from '@/types';
import {
  mockConversations,
  mockConversationMessages,
  mockDocumentChunks,
  mockMcpServers,
  mockMcpTools,
  defaultBffLlmConfig,
  type BffConversation,
  type BffChatMessage,
  type BffDataset,
  type BffDocument,
  type BffDocumentChunk,
  type BffRetrievalTestResult,
  type BffModelConfig,
  type BffMcpServer,
  type BffMcpTool,
} from '@/data/mockBffData';
import { availableLLMs } from '@/data/agentConfigs';

// ==================== Chat API ====================

export interface SendChatMessageParams {
  agentId: string;
  agentName?: string;
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

    // 所有聊天统一走后端流式接口，前端不再直接调用模型
    const workflowAppId = await bffService.workflow.resolveAppId(params.agentId, params.agentName);
    if (!workflowAppId) {
      throw new Error(`未能将智能体 "${params.agentName || params.agentId}" 映射到后端应用，请检查应用名称或 ID。`);
    }

    const mode = await bffService.workflow.getAppMode(workflowAppId);
    console.log('[BFFChat] resolved app:', workflowAppId, 'mode:', mode, 'query:', params.query);
    if (mode === 'workflow') {
      // workflow 类型应用走 SSE 流式接口 /workflows/run
      const answer = await bffService.workflow.runWorkflowBlocking(workflowAppId, {
        query: params.query,
        inputs: params.inputs,
        conversationId,
      });
      return { conversationId, messageId, answer };
    }

    // advanced-chat / chat / chatflow 等使用 chat-messages 接口
    const { answer, conversationId: chatConversationId } = await bffService.workflow.runChatBlocking(workflowAppId, {
      query: params.query,
      inputs: params.inputs,
      conversationId,
    });
    return { conversationId: chatConversationId || conversationId, messageId, answer };
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

// ==================== Workflow API ====================

export interface WorkflowEvent {
  event: string;
  data: unknown;
}

export interface RunWorkflowOptions {
  query: string;
  inputs?: Record<string, string>;
  conversationId?: string;
  user?: string;
}

class BffWorkflowService {
  private appListCache: BffApplication[] | null = null;
  private appListCacheTime = 0;
  private readonly APP_LIST_CACHE_TTL = 60_000;

  /**
   * 将前端的 agentId 解析为可用于工作流运行的后端应用 ID。
   * - 本身是后端 ID 时直接返回；
   * - 否则按 agentName 在后端应用列表中精确/模糊匹配；
   * - 未匹配到则返回 null。
   */
  async resolveAppId(agentId: string, agentName?: string): Promise<string | null> {
    if (isBackendAppId(agentId)) return agentId;
    const targetName = agentName || (agentId === 'plaza-1' ? '知识问答助手' : undefined);
    if (!targetName) return null;
    try {
      const apps = await this.getCachedApplications();
      const app = apps.find(a => a.name === targetName || a.name.includes(targetName));
      return app?.id || null;
    } catch (err) {
      console.warn('[BFFWorkflow] 按名称解析应用失败:', err);
      return null;
    }
  }

  private async getCachedApplications(): Promise<BffApplication[]> {
    const now = Date.now();
    if (this.appListCache && now - this.appListCacheTime < this.APP_LIST_CACHE_TTL) {
      return this.appListCache;
    }
    const apps = await bffService.application.listApplications();
    this.appListCache = apps.list;
    this.appListCacheTime = now;
    return apps.list;
  }

  /** 流式运行指定应用的工作流，以 AsyncGenerator 形式产出 SSE 事件 */
  async *runWorkflowStream(appId: string, options: RunWorkflowOptions): AsyncGenerator<WorkflowEvent> {
    // 与 /workflows/run-all 保持一致的参数：只传 query（及可选 inputs）
    const requestBody = {
      ...(options.inputs || {}),
      query: options.query,
    };
    console.log('[BFFWorkflow] runWorkflowStream request body:', requestBody);

    const res = await fetch(`${API_BASE_URL}/api/console/applications/apps/${appId}/workflows/run`, {
      method: 'POST',
      headers: getJsonAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('[BFFWorkflow] runWorkflow error:', res.status, text);
      let displayMsg = text;
      try {
        const errJson = JSON.parse(text) as { code?: string; message?: string };
        if (errJson.message) {
          displayMsg = `${errJson.code ? `[${errJson.code}] ` : ''}${errJson.message}`;
        }
      } catch {
        // keep raw text
      }
      throw new Error(`workflow run failed: ${res.status} ${displayMsg}`);
    }

    if (!res.body) {
      throw new Error('workflow response body is empty');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let currentEvent = '';
    const currentData: string[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('event:')) {
          currentEvent = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
          currentData.push(line.slice(5).trim());
        } else if (line.trim() === '') {
          if (currentEvent && currentData.length > 0) {
            const dataStr = currentData.join('\n');
            try {
              yield { event: currentEvent, data: JSON.parse(dataStr) };
            } catch {
              // 后端可能直接返回纯文本，作为字符串事件透传
              yield { event: currentEvent, data: dataStr };
            }
          }
          currentEvent = '';
          currentData.length = 0;
        }
      }
    }

    // 兜底：流结束时若还有未刷新的 event/data
    if (currentEvent && currentData.length > 0) {
      const dataStr = currentData.join('\n');
      try {
        yield { event: currentEvent, data: JSON.parse(dataStr) };
      } catch {
        yield { event: currentEvent, data: dataStr };
      }
    }
  }

  /** 阻塞式运行工作流，消费完整 SSE 流后返回最终文本输出 */
  async runWorkflowBlocking(appId: string, options: RunWorkflowOptions): Promise<string> {
    let outputs: Record<string, unknown> | null = null;
    let streamedText = '';

    for await (const ev of this.runWorkflowStream(appId, options)) {
      if (ev.event === 'workflow_finished') {
        const data = ev.data as { outputs?: Record<string, unknown>; status?: string } | undefined;
        outputs = data?.outputs || null;
      } else if (typeof ev.data === 'string') {
        // 后端直接返回纯文本时直接累加
        streamedText += ev.data;
      } else if (ev.event === 'text_chunk' || ev.event === 'agent_message' || ev.event === 'message') {
        const data = ev.data as { answer?: string; text?: string; data?: string } | undefined;
        const chunk = data?.answer || data?.text || data?.data || '';
        if (typeof chunk === 'string') streamedText += chunk;
      }
    }

    if (outputs) {
      const candidates = Object.values(outputs).filter((v): v is string => typeof v === 'string');
      if (candidates.length > 0) return candidates[0];
    }

    return streamedText || '工作流已完成，但未返回文本结果。';
  }

  /**
   * 以 JSON 格式直接运行工作流（/workflows/run-all）。
   * 后端返回 JSON，适合直接获取最终结果，避免消费 SSE。
   */
  async runWorkflowJson(appId: string, options: RunWorkflowOptions): Promise<string> {
    const body: Record<string, unknown> = {
      ...(options.inputs || {}),
      query: options.query,
    };
    console.log('[BFFWorkflow] runWorkflowJson request body:', body);

    const res = await fetch(`${API_BASE_URL}/api/console/applications/apps/${appId}/workflows/run-all`, {
      method: 'POST',
      headers: getJsonAuthHeaders(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('[BFFWorkflow] runWorkflowJson error:', res.status, text);
      let displayMsg = text;
      try {
        const errJson = JSON.parse(text) as { code?: string; message?: string };
        if (errJson.message) {
          displayMsg = `${errJson.code ? `[${errJson.code}] ` : ''}${errJson.message}`;
        }
      } catch {
        // keep raw text
      }
      throw new Error(`workflow run-all failed: ${res.status} ${displayMsg}`);
    }

    const json = (await res.json()) as unknown;
    console.log('[BFFWorkflow] runWorkflowJson response:', json);

    // 兼容直接返回的字符串
    if (typeof json === 'string') return json;

    if (json && typeof json === 'object') {
      const obj = json as Record<string, unknown>;
      // 业务错误码
      if (obj.code && obj.message && obj.code !== 'ok' && obj.code !== '0' && obj.code !== 0) {
        throw new Error(`workflow run-all error: ${obj.message} (${obj.code})`);
      }
      // 优先取 outputs 里的第一个字符串字段
      const outputs = (obj.outputs || obj.data) as Record<string, unknown> | undefined;
      if (outputs && typeof outputs === 'object') {
        const candidates = Object.values(outputs).filter((v): v is string => typeof v === 'string');
        if (candidates.length > 0) return candidates[0];
      }
      if (typeof obj.answer === 'string') return obj.answer;
      if (typeof obj.text === 'string') return obj.text;
      if (typeof obj.result === 'string') return obj.result;
      if (typeof obj.message === 'string' && !obj.code) return obj.message;
    }

    return '工作流已完成，但未返回文本结果。';
  }

  // ==================== Chat (advanced-chat / chat) API ====================

  private modeCache = new Map<string, string>();

  async getAppMode(appId: string): Promise<string> {
    if (this.modeCache.has(appId)) return this.modeCache.get(appId)!;
    try {
      const app = await bffService.application.getApplication(appId);
      const mode = app?.mode || 'workflow';
      this.modeCache.set(appId, mode);
      return mode;
    } catch (err) {
      console.warn('[BFFWorkflow] 获取应用模式失败，默认按 workflow 处理:', err);
      return 'workflow';
    }
  }

  /** 流式运行 Chat 类型应用（advanced-chat / chat） */
  async *runChatStream(appId: string, options: RunWorkflowOptions): AsyncGenerator<WorkflowEvent> {
    const body: Record<string, unknown> = {
      inputs: options.inputs || {},
      query: options.query,
      response_mode: 'streaming',
      user: options.user || 'local-user',
    };
    if (options.conversationId) body.conversation_id = options.conversationId;

    const res = await fetch(`${API_BASE_URL}/api/console/applications/apps/${appId}/chat-messages`, {
      method: 'POST',
      headers: getJsonAuthHeaders(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('[BFFWorkflow] runChat error:', res.status, text);
      let displayMsg = text;
      try {
        const errJson = JSON.parse(text) as { code?: string; message?: string };
        if (errJson.message) {
          displayMsg = `${errJson.code ? `[${errJson.code}] ` : ''}${errJson.message}`;
        }
      } catch {
        // keep raw text
      }
      throw new Error(`chat run failed: ${res.status} ${displayMsg}`);
    }

    if (!res.body) {
      throw new Error('chat response body is empty');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let currentEvent = '';
    const currentData: string[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('event:')) {
          currentEvent = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
          currentData.push(line.slice(5).trim());
        } else if (line.trim() === '') {
          if (currentEvent && currentData.length > 0) {
            const dataStr = currentData.join('\n');
            try {
              yield { event: currentEvent, data: JSON.parse(dataStr) };
            } catch {
              // 后端可能直接返回纯文本，作为字符串事件透传
              yield { event: currentEvent, data: dataStr };
            }
          }
          currentEvent = '';
          currentData.length = 0;
        }
      }
    }

    if (currentEvent && currentData.length > 0) {
      const dataStr = currentData.join('\n');
      try {
        yield { event: currentEvent, data: JSON.parse(dataStr) };
      } catch {
        yield { event: currentEvent, data: dataStr };
      }
    }
  }

  /** 阻塞式运行 Chat 应用，消费完整 SSE 流后返回最终文本与会话 ID */
  async runChatBlocking(appId: string, options: RunWorkflowOptions): Promise<{ answer: string; conversationId?: string }> {
    let answer = '';
    let conversationId: string | undefined;

    for await (const ev of this.runChatStream(appId, options)) {
      if (typeof ev.data === 'string') {
        // 后端直接返回纯文本时直接累加
        answer += ev.data;
      } else if (ev.event === 'agent_message' || ev.event === 'message') {
        const data = ev.data as { answer?: string; text?: string; conversation_id?: string } | undefined;
        const chunk = data?.answer || data?.text || '';
        if (typeof chunk === 'string') answer += chunk;
        if (!conversationId && data?.conversation_id) conversationId = data.conversation_id;
      } else if (ev.event === 'message_end') {
        // 流正常结束
      } else if (ev.event === 'error') {
        const data = ev.data as { message?: string; code?: string } | undefined;
        throw new Error(data?.message || '聊天流返回错误');
      }
    }

    return { answer: answer || '聊天应用未返回文本结果。', conversationId };
  }
}

function toBffApplication(raw: unknown): BffApplication {
  const r = raw as Record<string, unknown>;
  return {
    id: String(r.id || ''),
    name: String(r.name || ''),
    description: (r.description as string | undefined) || '',
    mode: String(r.mode || 'chat'),
    icon: (r.icon as string | undefined) || '🤖',
    iconBackground: (r.icon_background as string | undefined) || (r.iconBackground as string | undefined) || '#3370FF',
    iconType: (r.icon_type as string | undefined) || 'emoji',
    tags: Array.isArray(r.tags) ? r.tags.map(String) : [],
    status: (r.status as string | undefined) || '',
    createdAt: r.created_at as number | string | undefined,
    updatedAt: r.updated_at as number | string | undefined,
    createdBy: (r.created_by as string | undefined) || '',
    authorName: (r.author_name as string | undefined) || (r.create_user_name as string | undefined),
  };
}

// ==================== Application API ====================

class BffApplicationService {
  private async fetchApplicationsPage(params: { page: number; limit: number; keyword?: string; signal?: AbortSignal }): Promise<{ list: BffApplication[]; total: number; hasMore: boolean }> {
    const query = new URLSearchParams();
    query.set('page', String(params.page));
    query.set('limit', String(params.limit));
    if (params.keyword) query.set('keyword', params.keyword);
    const fetchOptions: RequestInit = { headers: getConsoleAuthHeaders() };
    if (params.signal) fetchOptions.signal = params.signal;
    const res = await fetch(`${API_BASE_URL}/api/console/applications?${query.toString()}`, fetchOptions);
    if (!res.ok) throw new Error(`listApplications failed: ${res.status}`);

    const json = (await res.json()) as unknown;
    console.log('[BFF] listApplications response:', json);

    // 后端可能以 HTTP 200 返回业务错误码
    if (json && typeof json === 'object') {
      const obj = json as Record<string, unknown>;
      if (obj.code && obj.message && obj.code !== 'ok' && obj.code !== '0' && obj.code !== 0) {
        throw new Error(`listApplications error: ${obj.message} (${obj.code})`);
      }
    }
    let rawList: unknown[] = [];
    let total = 0;
    let hasMore = false;

    if (Array.isArray(json)) {
      rawList = json;
      total = json.length;
    } else if (json && typeof json === 'object') {
      const obj = json as Record<string, unknown>;
      if (Array.isArray(obj.data)) rawList = obj.data;
      else if (Array.isArray(obj.list)) rawList = obj.list;
      else if (Array.isArray(obj.records)) rawList = obj.records;
      total = typeof obj.total === 'number' ? obj.total : rawList.length;
      hasMore = typeof obj.has_more === 'boolean'
        ? obj.has_more
        : (typeof obj.hasMore === 'boolean' ? obj.hasMore : false);
    }

    return { list: rawList.map(toBffApplication), total, hasMore };
  }

  async listApplications(params?: { page?: number; keyword?: string; limit?: number; signal?: AbortSignal }): Promise<{ list: BffApplication[]; total: number; hasMore: boolean }> {
    // 调用方显式传了 limit，只取单页
    if (params?.limit) {
      return this.fetchApplicationsPage({
        page: params.page || 1,
        limit: params.limit,
        keyword: params.keyword,
        signal: params.signal,
      });
    }

    // 未指定 limit 时自动分页拉取全部，避免单页 limit 过大导致后端异常
    const pageSize = 100;
    let page = 1;
    let total = 0;
    const all: BffApplication[] = [];
    while (true) {
      const result = await this.fetchApplicationsPage({ page, limit: pageSize, keyword: params?.keyword, signal: params?.signal });
      all.push(...result.list);
      total = result.total;
      if (!result.hasMore || result.list.length === 0) break;
      page++;
      // 安全上限，防止异常死循环
      if (page > 100) break;
    }
    return { list: all, total, hasMore: false };
  }

  async createApplication(payload: CreateApplicationRequest): Promise<BffApplication> {
    const res = await fetch(`${API_BASE_URL}/api/console/applications`, {
      method: 'POST',
      headers: getJsonAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`createApplication failed: ${res.status}`);
    const json = (await res.json()) as { data?: Record<string, unknown> };
    if (json?.data?.id) return toBffApplication(json.data);
    // 后端返回 ResultVoid 时，重新拉取列表按名称定位新建应用
    const list = await this.listApplications();
    const found = list.list.find(a => a.name === payload.name);
    if (found) return found;
    return {
      id: `app-${Date.now()}`,
      name: payload.name,
      description: payload.description || '',
      mode: 'chat',
    };
  }

  async getApplication(appId: string): Promise<BffApplication | null> {
    const res = await fetch(`${API_BASE_URL}/api/console/applications/apps/${appId}`, {
      headers: getConsoleAuthHeaders(),
    });
    if (!res.ok) throw new Error(`getApplication failed: ${res.status}`);
    const json = (await res.json()) as unknown;
    return json ? toBffApplication(json) : null;
  }

  async deleteApplication(appId: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/api/console/applications/apps/${appId}`, {
      method: 'DELETE',
      headers: getConsoleAuthHeaders(),
    });
    if (!res.ok) throw new Error(`deleteApplication failed: ${res.status}`);
  }
}

// ==================== Knowledge API ====================

export interface UploadDocumentParams {
  datasetId: string;
  file: File;
}

export interface UploadDocumentsParams {
  datasetId: string;
  files: File[];
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
    const res = await fetch(`${API_BASE_URL}/api/console/knowledge/datasets?limit=1000`, {
      headers: getConsoleAuthHeaders(),
    });
    const data = await unwrap<unknown[]>(res);
    return (data || []).map(item => toBffDataset(item));
  }

  async createDataset(payload: { name: string; description?: string }): Promise<BffDataset> {
    const res = await fetch(`${API_BASE_URL}/api/console/knowledge/datasets`, {
      method: 'POST',
      headers: getJsonAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return toBffDataset(await unwrap<unknown>(res));
  }

  async updateDataset(datasetId: string, payload: Partial<BffDataset>): Promise<BffDataset> {
    const res = await fetch(`${API_BASE_URL}/api/console/knowledge/datasets/${datasetId}`, {
      method: 'PATCH',
      headers: getJsonAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return toBffDataset(await unwrap<unknown>(res));
  }

  async deleteDataset(datasetId: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/api/console/knowledge/datasets/${datasetId}`, {
      method: 'DELETE',
      headers: getConsoleAuthHeaders(),
    });
    if (!res.ok) throw new Error(`deleteDataset failed: ${res.status}`);
  }

  async deleteDocument(datasetId: string, documentId: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/api/console/knowledge/datasets/${datasetId}/documents/${documentId}`, {
      method: 'DELETE',
      headers: getConsoleAuthHeaders(),
    });
    if (!res.ok) throw new Error(`deleteDocument failed: ${res.status}`);
  }

  async listDocuments(datasetId: string): Promise<BffDocument[]> {
    const res = await fetch(`${API_BASE_URL}/api/console/knowledge/datasets/${datasetId}/documents?limit=1000`, {
      headers: getConsoleAuthHeaders(),
    });
    const data = await unwrap<unknown[]>(res);
    return (data || []).map(item => toBffDocument(item));
  }

  async uploadDocument(params: UploadDocumentParams): Promise<BffDocument> {
    const docs = await this.uploadDocuments({ datasetId: params.datasetId, files: [params.file] });
    return docs[0];
  }

  async uploadDocuments(params: UploadDocumentsParams): Promise<BffDocument[]> {
    const formData = new FormData();
    // 后端接口要求字段名为 files（支持多文件）
    for (const file of params.files) {
      formData.append('files', file);
    }
    const res = await fetch(`${API_BASE_URL}/api/console/knowledge/datasets/${params.datasetId}/documents/file`, {
      method: 'POST',
      headers: getConsoleAuthHeaders(),
      body: formData,
    });
    const json = await unwrap<{ documents?: unknown[] }>(res);
    const docs = json.documents || [];
    if (docs.length === 0) {
      // 兜底：后端直接返回单文档对象
      return [toBffDocument(json)];
    }
    return docs.map(item => toBffDocument(item));
  }

  async downloadDocument(datasetId: string, documentId: string): Promise<Blob> {
    const res = await fetch(`${API_BASE_URL}/api/console/knowledge/datasets/${datasetId}/documents/${documentId}/download`, {
      headers: getConsoleAuthHeaders(),
    });
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

  async testRetrieval(datasetId: string, query: string): Promise<BffRetrievalTestResult> {
    try {
      const res = await fetch(`${API_BASE_URL}/debug/dify/datasets/${datasetId}/retrieve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getDifyAuthHeaders() },
        body: JSON.stringify({
          query,
          retrieval_mode: 'hybrid',
          search_method: 'hybrid',
          top_k: 5,
        }),
      });
      if (!res.ok) throw new Error(`retrieve failed: ${res.status}`);
      const json = (await res.json()) as {
        records?: Array<{
          score?: number;
          segment?: { content?: string; document?: { id?: string; name?: string } };
        }>;
      };
      const records = Array.isArray(json.records) ? json.records : [];
      return {
        query,
        results: records
          .map((r, idx) => ({
            id: `chunk-${idx}`,
            documentId: r.segment?.document?.id || '',
            content: r.segment?.content || '',
            score: typeof r.score === 'number' ? r.score : 0,
          }))
          .filter((r) => !!r.content),
      };
    } catch (err) {
      console.warn('[BFF] 知识库检索失败，本次不使用检索结果:', err);
      return { query, results: [] };
    }
  }
}

// ==================== Model Config API ====================

function toBffModelConfig(raw: unknown): BffModelConfig {
  const r = raw as Record<string, unknown>;
  const provider = String(r.provider || r.provider_name || 'custom');
  const model = String(r.model || r.model_name || r.model_id || r.id || '');
  const name = String(r.name || r.model_name || model);
  const rawScope = String(r.scope || 'tenant');
  const scope = (['system', 'tenant', 'app', 'agent'].includes(rawScope)
    ? rawScope
    : 'tenant') as BffModelConfig['scope'];
  return {
    id: String(r.id || `${provider}-${model}`),
    name,
    provider: provider as BffModelConfig['provider'],
    model,
    apiEndpoint: (r.api_endpoint || r.apiEndpoint) as string | undefined,
    scope,
    temperature: typeof r.temperature === 'number' ? r.temperature : 0.6,
    topP: typeof r.top_p === 'number' ? r.top_p : (typeof r.topP === 'number' ? r.topP : 0.9),
    maxTokens: typeof r.max_tokens === 'number' ? r.max_tokens : (typeof r.maxTokens === 'number' ? r.maxTokens : 2048),
  };
}

class BffModelService {
  async listModelConfigs(): Promise<BffModelConfig[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/console/models`, {
        headers: getConsoleAuthHeaders(),
      });
      if (!res.ok) throw new Error(`listModelConfigs failed: ${res.status}`);
      const json = (await res.json()) as unknown;
      let rawList: unknown[] = [];
      if (Array.isArray(json)) {
        rawList = json;
      } else if (json && typeof json === 'object') {
        const obj = json as Record<string, unknown>;
        if (Array.isArray(obj.data)) rawList = obj.data;
        else if (Array.isArray(obj.list)) rawList = obj.list;
        else if (Array.isArray(obj.records)) rawList = obj.records;
      }
      if (rawList.length > 0) return rawList.map(toBffModelConfig);
    } catch (err) {
      console.warn('[BFF] 从后端获取模型列表失败，使用默认模型列表:', err);
    }

    // 兜底：使用前端静态模型列表
    const fallback: BffModelConfig[] = [];
    for (const p of availableLLMs) {
      for (const m of p.models) {
        fallback.push({
          id: `${p.provider}-${m}`,
          name: m,
          provider: p.provider,
          model: m,
          scope: 'system',
          temperature: 0.6,
          topP: 0.9,
          maxTokens: 2048,
        });
      }
    }
    return fallback;
  }

  /**
   * 按模型类型查询可用模型列表。
   * 后端返回格式化后的模型名称和类型列表，支持数组 / { data/list/records } 包装。
   */
  async listModelsByType(modelType: string): Promise<BffModelTypeItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/console/applications/models/model-types/${encodeURIComponent(modelType)}`, {
        headers: getConsoleAuthHeaders(),
      });
      if (!res.ok) throw new Error(`listModelsByType failed: ${res.status}`);
      const json = (await res.json()) as unknown;
      let rawList: unknown[] = [];
      if (Array.isArray(json)) {
        rawList = json;
      } else if (json && typeof json === 'object') {
        const obj = json as Record<string, unknown>;
        if (Array.isArray(obj.data)) rawList = obj.data;
        else if (Array.isArray(obj.list)) rawList = obj.list;
        else if (Array.isArray(obj.records)) rawList = obj.records;
      }
      return rawList.map((item) => {
        if (item && typeof item === 'object') {
          const r = item as Record<string, unknown>;
          return {
            label: String(r.label || r.name || r.model || r.model_name || r.id || ''),
            value: String(r.model || r.value || r.name || r.model_name || r.id || ''),
            type: String(r.type || r.model_type || modelType),
          };
        }
        return { label: String(item), value: String(item), type: modelType };
      }).filter(item => item.label && item.value);
    } catch (err) {
      console.warn('[BFF] 按类型获取模型列表失败:', err);
      return [];
    }
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
  workflow = new BffWorkflowService();
  application = new BffApplicationService();
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
  BffDataset,
  BffDocument,
  BffDocumentChunk,
  BffRetrievalTestResult,
  BffModelConfig,
  BffMcpServer,
  BffMcpTool,
} from '@/data/mockBffData';

export type { BffApplication, CreateApplicationRequest, BffModelTypeItem } from '@/types';
