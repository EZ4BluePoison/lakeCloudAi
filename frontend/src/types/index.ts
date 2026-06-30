export type NavModule = 'messages' | 'myAgents' | 'workbench' | 'agentPlaza' | 'knowledgeBase' | 'superAgent' | 'agentConfig';
export type KnowledgeSubLevel = string;
export type PermissionLevel = 'group' | 'dept' | 'personal';
export type LLMProvider = 'openai' | 'anthropic' | 'azure' | 'ollama' | 'wuxidata' | 'custom';

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  apiKey?: string;
  apiEndpoint?: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  presencePenalty: number;
  frequencyPenalty: number;
  
  // Ollama 特定配置
  ollamaBaseUrl?: string;
  ollamaModelPath?: string;
  
  // 自定义提供商配置
  customHeaders?: Record<string, string>;
  customRequestFormat?: 'openai' | 'anthropic' | 'ollama';
}

// 模型元数据
export interface ModelMetadata {
  id: string;
  name: string;
  provider: LLMProvider;
  description: string;
  maxContextLength: number;
  supportedFeatures: ('chat' | 'completion' | 'embedding')[];
  pricing?: {
    inputTokenPrice: number;
    outputTokenPrice: number;
  };
}

// 聊天消息
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  metadata?: Record<string, unknown>;
}

// 聊天响应
export interface ChatResponse {
  id: string;
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata: {
    finishReason: string;
    latency: number;
  };
}

// 流式响应块
export interface ChatStreamChunk {
  id: string;
  content: string;
  isDelta: boolean;
  isFinished: boolean;
  metadata?: Record<string, unknown>;
}

// 对话会话
export interface ConversationSession {
  id: string;
  agentId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  
  messages: ConversationMessage[];
  metadata: {
    tokenCount: number;
    messageCount: number;
  };
}

// 对话消息扩展
export interface ConversationMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
  
  // 知识引用
  citations?: Citation[];
  
  // 上下文元数据
  metadata: {
    responseTime?: number;
    tokenUsage?: TokenUsage;
    knowledgeSearched?: KnowledgeSearchResult[];
  };
}

// 引用信息
export interface Citation {
  id: string;
  sourceId: string;
  sourceName: string;
  contentType: 'file' | 'folder';
  relevantSnippets: string[];
  confidenceScore: number;
}

// Token 使用统计
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost?: number;
}

// 知识搜索结果
export interface KnowledgeSearchResult {
  id: string;
  sourceId: string;
  sourceName: string;
  content: string;
  score: number;
  metadata: Record<string, unknown>;
}

// 上下文窗口配置
export interface ContextWindowConfig {
  maxTokens: number;
  maxMessages?: number;
  compressionStrategy: 'truncate' | 'summarize' | 'selective';
  includeSystemPrompt: boolean;
}

export interface PromptTemplate {
  id: string;
  name: string;
  type: 'system' | 'user' | 'assistant';
  content: string;
  variables: string[];
}

export interface KnowledgeSource {
  id: string;
  name: string;
  type: 'folder' | 'file' | 'url' | 'database';
  sourceId: string;
  enabled: boolean;
  retrievalMode: 'semantic' | 'keyword' | 'hybrid';
  topK: number;
  priority?: number;
}

export interface AgentConfig {
  id: string;
  agentId: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  name: string;
  description: string;
  icon: string;
  iconBg: string;
  llmConfig: LLMConfig;
  prompts: PromptTemplate[];
  knowledgeSources: KnowledgeSource[];
  behavior: {
    enableMemory: boolean;
    enableMultiTurn: boolean;
    enableCitation: boolean;
    responseLanguage: 'zh-CN' | 'en-US';
    maxConversationLength: number;
  };
  permissions: {
    visibility: 'public' | 'private' | 'department';
    allowedDepartments: string[];
    allowedUsers: string[];
  };
  status: 'draft' | 'published' | 'deprecated';
}

export interface AgentConfigVersion {
  id: string;
  configId: string;
  version: string;
  createdAt: string;
  createdBy: string;
  changeLog: string;
  snapshot: AgentConfig;
}

// 用于前端聊天面板的消息类型
export interface ChatPanelMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agentId: string;
  followUpOptions?: string[];
}

export interface Agent {
  id: string;
  name: string;
  icon: string;
  avatarGradient: string;
  category: string;
  description: string;
  permission: PermissionLevel;
  creator: string;
  department: string;
  callCount: number;
  status: 'online' | 'offline';
  tips: string[];
  responses: string[];
}

export interface MyAgent {
  id: string;
  name: string;
  icon: string;
  iconBg: string;
  description: string;
  permission: PermissionLevel;
  creator: string;
  department: string;
  createdAt: string;
  callCount: number;
}

export interface WorkflowNode {
  id: string;
  type: 'start' | 'llm' | 'knowledge' | 'code' | 'condition' | 'end';
  position: { x: number; y: number };
  data: {
    label: string;
    model?: string;
    prompt?: string;
    temperature?: number;
    knowledgeBase?: string;
    condition?: string;
  };
}

export interface FileNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: FileNode[];
  size?: string;
  modifiedAt?: string;
  content?: string;
  permission: PermissionLevel;
  /** BFF/Dify 文档状态：uploaded / parsing / parsed / embedding / indexed / failed / deleted */
  status?: 'uploaded' | 'parsing' | 'parsed' | 'embedding' | 'indexed' | 'failed' | 'deleted';
  statusText?: string;
  /** 关联的 BFF/Dify documentId，用于分片预览和检索测试 */
  documentId?: string;
}

export interface PlazaAgent {
  id: string;
  name: string;
  icon: string;
  iconBg: string;
  category: string;
  description: string;
  fullDescription: string;
  tags: string[];
  useCount: number;
  creator: string;
  department: string;
  rating: number;
  reviewCount: number;
  capabilities: string[];
  permission: PermissionLevel;
}

export interface AgentStat {
  totalCalls: number;
  callTrend: number;
  activeUsers: number;
  userTrend: number;
  avgResponseTime: number;
  responseTrend: number;
  satisfactionScore: number;
  satisfactionTrend: number;
}

export interface DepartmentUsage {
  rank: number;
  name: string;
  color: string;
  callCount: number;
  percentage: number;
}

export interface DailyUsage {
  date: string;
  calls: number;
  users: number;
  avgTime: number;
  successRate: number;
}

/** SOE Org tree node */
export interface OrgNode {
  id: string;
  name: string;
  level: number;
  children?: OrgNode[];
}

/** Resolved four-level path */
export interface OrgPath {
  group: string;
  subGroup: string;
  company: string;
  department: string;
}

// 智能体提示词配置
export interface AgentPrompt {
  agentId: string;
  agentName: string;
  systemPrompt: string;
  userPromptTemplate: string;
  variables: string[];
}
