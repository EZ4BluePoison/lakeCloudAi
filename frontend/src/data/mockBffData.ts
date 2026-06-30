/**
 * BFF Mock 数据层
 * 
 * 设计目标：所有数据形态与真实 BFF 接口保持一致，后续只需把 bffService.ts
 * 里的 mock 实现替换为 fetch 调用即可，组件层无需改动。
 */

import type {
  Citation,
  TokenUsage,
  KnowledgeSource,
  PromptTemplate,
  LLMConfig,
} from '@/types';

// ==================== Chat ====================

export interface BffConversation {
  id: string;
  agentId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface BffChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  metadata?: {
    citations?: Citation[];
    tokenUsage?: TokenUsage;
  };
}

export const mockConversations: BffConversation[] = [
  {
    id: 'conv-001',
    agentId: 'plaza-1',
    title: '国联集团合规政策咨询',
    createdAt: '2026-06-25T10:00:00Z',
    updatedAt: '2026-06-25T10:15:00Z',
  },
  {
    id: 'conv-002',
    agentId: 'plaza-1',
    title: '新员工试用期问题',
    createdAt: '2026-06-24T14:30:00Z',
    updatedAt: '2026-06-24T14:45:00Z',
  },
  {
    id: 'conv-003',
    agentId: 'plaza-2',
    title: '数字化转型通知起草',
    createdAt: '2026-06-23T09:00:00Z',
    updatedAt: '2026-06-23T09:20:00Z',
  },
];

export const mockConversationMessages: Record<string, BffChatMessage[]> = {
  'conv-001': [
    {
      id: 'msg-001-1',
      role: 'user',
      content: '查询国联集团最新合规政策要求',
      createdAt: '2026-06-25T10:00:00Z',
    },
    {
      id: 'msg-001-2',
      role: 'assistant',
      content: '根据集团2026年最新合规政策要求（6月版），主要涉及以下方面：\n\n• 数据安全：核心业务数据分类分级管理\n• 协同审批：超50万项目需集团级联审\n• AI应用：大模型使用需通过安全评估\n• 客户画像：敏感字段需脱敏处理',
      createdAt: '2026-06-25T10:01:00Z',
      metadata: {
        citations: [
          {
            id: 'cite-001',
            sourceId: 'doc-001',
            sourceName: '国联集团合规管理办法（2026年6月版）',
            contentType: 'file',
            relevantSnippets: ['核心业务数据分类分级管理', '超50万项目需集团级联审'],
            confidenceScore: 0.95,
          },
        ],
        tokenUsage: {
          promptTokens: 120,
          completionTokens: 85,
          totalTokens: 205,
        },
      },
    },
  ],
};

export function generateMockAssistantReply(query: string): string {
  const replies: Record<string, string> = {
    '查询国联集团最新合规政策要求': '根据集团2026年最新合规政策要求（6月版），主要涉及以下方面：\n\n• 数据安全：核心业务数据分类分级管理\n• 协同审批：超50万项目需集团级联审\n• AI应用：大模型使用需通过安全评估\n• 客户画像：敏感字段需脱敏处理\n\n需要查看具体条款吗？',
    '客户画像系统的数据标准是什么': '客户画像系统的数据标准包括：\n\n• 主数据标准：客户ID、统一社会信用代码、客户名称\n• 标签体系：基础属性、行为特征、风险等级、价值分层\n• 数据质量：完整性、准确性、一致性、时效性\n• 安全要求：敏感字段脱敏、分级授权访问',
    '业务协同平台的审批流程': '业务协同平台的审批流程如下：\n\n1. 发起人提交申请\n2. 部门负责人初审\n3. 财务/合规复核（视金额而定）\n4. 分管领导审批\n5. 超50万项目需集团级联审\n6. 审批完成归档',
  };

  return replies[query] || `收到您的问题："${query}"。\n\n我会基于企业知识库为您解答。当前是 mock 回复，后续接入 BFF 后将返回真实模型回答。`;
}

// ==================== Agent ====================

export interface BffAgent {
  id: string;
  agentId: string;
  name: string;
  description: string;
  fullDescription?: string;
  icon: string;
  iconBg: string;
  category: string;
  tags: string[];
  capabilities?: string[];
  creator: string;
  department: string;
  permission?: 'group' | 'dept' | 'personal';
  mode: 'chat-agent' | 'workflow';
  status: 'draft' | 'published' | 'deprecated';
  llmConfig: LLMConfig;
  prompts: PromptTemplate[];
  knowledgeSources: KnowledgeSource[];
  tools: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  useCount: number;
  rating: number;
  reviewCount?: number;
}

export const defaultBffLlmConfig: LLMConfig = {
  provider: 'wuxidata',
  model: '/model/Qwen3-Next',
  apiEndpoint: 'http://localhost:8080',
  temperature: 0.6,
  topP: 0.9,
  maxTokens: 2048,
  presencePenalty: 0,
  frequencyPenalty: 0,
};

export const mockAgents: BffAgent[] = [
  {
    id: 'agent-001',
    agentId: 'plaza-1',
    name: '知识问答助手',
    description: '基于企业知识库的智能问答，支持多轮对话与文档溯源',
    fullDescription: '知识问答助手是国联集团企业知识库的智能入口。它可以回答制度规范、业务流程、技术文档等问题，支持多轮对话，并根据知识库内容给出专业、准确的回答。',
    icon: 'BookOpen',
    iconBg: 'linear-gradient(135deg, #00E5FF 0%, #0099CC 100%)',
    category: '行政类',
    tags: ['知识库', '问答', '多轮对话'],
    capabilities: ['制度规范查询', '业务流程解答', '技术文档检索', '多轮对话'],
    creator: '数字化部',
    department: '集团',
    permission: 'group',
    mode: 'chat-agent',
    status: 'published',
    llmConfig: defaultBffLlmConfig,
    prompts: [
      {
        id: 'prompt-system-001',
        name: '系统提示词',
        type: 'system',
        content: '你是国联集团太湖云的员工小助手，既专业又亲切的同事。...',
        variables: ['knowledge_context'],
      },
      {
        id: 'prompt-user-001',
        name: '用户问题模板',
        type: 'user',
        content: '{{user_question}}',
        variables: ['user_question'],
      },
    ],
    knowledgeSources: [
      {
        id: 'ks-001',
        name: '新员工试用期Q&A',
        type: 'file',
        sourceId: 'dataset-001',
        enabled: true,
        retrievalMode: 'semantic',
        topK: 5,
        priority: 1,
      },
    ],
    tools: [],
    createdAt: '2026-06-20T00:00:00Z',
    updatedAt: '2026-06-25T00:00:00Z',
    createdBy: '数字化部',
    useCount: 1280,
    rating: 4.8,
    reviewCount: 128,
  },
  {
    id: 'agent-002',
    agentId: 'plaza-2',
    name: '公文写作助手',
    description: '擅长撰写各类企业公文，包括通知、报告、请示、纪要等',
    fullDescription: '公文写作助手精通各类行政公文的撰写规范和格式要求。无论是通知、报告、请示还是纪要，都能为您提供专业的写作建议和模板。',
    icon: 'FileText',
    iconBg: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)',
    category: '行政类',
    tags: ['写作', '公文', '模板'],
    capabilities: ['通知撰写', '报告生成', '请示起草', '纪要整理'],
    creator: '数字化部',
    department: '集团',
    permission: 'group',
    mode: 'chat-agent',
    status: 'published',
    llmConfig: defaultBffLlmConfig,
    prompts: [],
    knowledgeSources: [],
    tools: [],
    createdAt: '2026-06-21T00:00:00Z',
    updatedAt: '2026-06-25T00:00:00Z',
    createdBy: '数字化部',
    useCount: 856,
    rating: 4.6,
    reviewCount: 86,
  },
];

export interface BffAgentVersion {
  id: string;
  agentId: string;
  version: string;
  changeLog: string;
  createdAt: string;
  createdBy: string;
}

export const mockAgentVersions: BffAgentVersion[] = [
  {
    id: 'ver-001',
    agentId: 'plaza-1',
    version: '2.0.0',
    changeLog: '优化提示词，增加来源隐藏约束',
    createdAt: '2026-06-25T00:00:00Z',
    createdBy: '数字化部',
  },
  {
    id: 'ver-002',
    agentId: 'plaza-1',
    version: '1.9.0',
    changeLog: '接入国联 AI Qwen3-Next',
    createdAt: '2026-06-20T00:00:00Z',
    createdBy: '数字化部',
  },
];

// ==================== Knowledge Base ====================

export interface BffDataset {
  id: string;
  name: string;
  description: string;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BffDocument {
  id: string;
  datasetId: string;
  name: string;
  size: string;
  status: 'uploaded' | 'parsing' | 'parsed' | 'embedding' | 'indexed' | 'failed' | 'deleted';
  statusText: string;
  createdAt: string;
  updatedAt: string;
}

export interface BffDocumentChunk {
  id: string;
  documentId: string;
  content: string;
  score?: number;
}

export interface BffRetrievalTestResult {
  query: string;
  results: BffDocumentChunk[];
}

export const mockDatasets: BffDataset[] = [
  {
    id: 'dataset-001',
    name: '新员工试用期制度',
    description: '太湖云新员工试用期管理制度相关文档',
    documentCount: 3,
    createdAt: '2026-06-20T00:00:00Z',
    updatedAt: '2026-06-25T00:00:00Z',
  },
  {
    id: 'dataset-002',
    name: '集团合规政策',
    description: '国联集团合规管理相关制度',
    documentCount: 5,
    createdAt: '2026-06-22T00:00:00Z',
    updatedAt: '2026-06-25T00:00:00Z',
  },
];

export const mockDocuments: BffDocument[] = [
  {
    id: 'doc-001',
    datasetId: 'dataset-001',
    name: '太湖云新员工试用期管理制度-常见问题Q&A（30题）.docx',
    size: '256 KB',
    status: 'indexed',
    statusText: '已索引',
    createdAt: '2026-06-20T10:00:00Z',
    updatedAt: '2026-06-20T11:00:00Z',
  },
  {
    id: 'doc-002',
    datasetId: 'dataset-001',
    name: '试用期考核表模板.xlsx',
    size: '128 KB',
    status: 'parsing',
    statusText: '解析中',
    createdAt: '2026-06-25T09:00:00Z',
    updatedAt: '2026-06-25T09:05:00Z',
  },
  {
    id: 'doc-003',
    datasetId: 'dataset-002',
    name: '国联集团合规管理办法（2026年6月版）.pdf',
    size: '1.2 MB',
    status: 'indexed',
    statusText: '已索引',
    createdAt: '2026-06-22T10:00:00Z',
    updatedAt: '2026-06-22T12:00:00Z',
  },
];

export const mockDocumentChunks: BffDocumentChunk[] = [
  {
    id: 'chunk-001',
    documentId: 'doc-001',
    content: '新员工试用期一般为3个月，表现优秀者可申请提前转正。',
    score: 0.92,
  },
  {
    id: 'chunk-002',
    documentId: 'doc-001',
    content: '试用期考核分为月度跟踪和转正评估两个环节。',
    score: 0.88,
  },
  {
    id: 'chunk-003',
    documentId: 'doc-003',
    content: '超50万项目需集团级联审，确保重大投资合规。',
    score: 0.95,
  },
];

// ==================== Model Config ====================

export interface BffModelConfig {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'azure' | 'ollama' | 'wuxidata' | 'custom';
  model: string;
  apiEndpoint?: string;
  scope: 'system' | 'tenant' | 'app' | 'agent';
  temperature: number;
  topP: number;
  maxTokens: number;
}

export const mockModelConfigs: BffModelConfig[] = [
  {
    id: 'model-cfg-001',
    name: '国联 AI 默认配置',
    provider: 'wuxidata',
    model: '/model/Qwen3-Next',
    apiEndpoint: 'http://localhost:8080',
    scope: 'system',
    temperature: 0.6,
    topP: 0.9,
    maxTokens: 2048,
  },
  {
    id: 'model-cfg-002',
    name: '国联 AI 80B 配置',
    provider: 'wuxidata',
    model: '/model/Qwen3-Next',
    apiEndpoint: 'http://localhost:8080',
    scope: 'tenant',
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 4096,
  },
];

// ==================== MCP ====================

export interface BffMcpServer {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  createdAt: string;
}

export interface BffMcpTool {
  id: string;
  serverId: string;
  name: string;
  description: string;
}

export const mockMcpServers: BffMcpServer[] = [
  {
    id: 'mcp-001',
    name: '企业邮箱 MCP',
    description: '查询邮件、发送邮件、日程管理',
    status: 'active',
    createdAt: '2026-06-20T00:00:00Z',
  },
  {
    id: 'mcp-002',
    name: 'OA 审批 MCP',
    description: '发起审批、查询审批状态、催办',
    status: 'active',
    createdAt: '2026-06-22T00:00:00Z',
  },
];

export const mockMcpTools: BffMcpTool[] = [
  {
    id: 'tool-001',
    serverId: 'mcp-001',
    name: 'send_email',
    description: '发送邮件给指定收件人',
  },
  {
    id: 'tool-002',
    serverId: 'mcp-001',
    name: 'query_calendar',
    description: '查询用户日程安排',
  },
  {
    id: 'tool-003',
    serverId: 'mcp-002',
    name: 'create_approval',
    description: '发起 OA 审批流程',
  },
];
