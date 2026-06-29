import type { AgentConfig, AgentConfigVersion, ModelMetadata } from '@/types';

// 知识问答助手示例配置
export const knowledgeAgentConfig: AgentConfig = {
  id: 'config-knowledge-001',
  agentId: 'plaza-1',
  version: '2.0.0',
  createdAt: '2026-06-20',
  updatedAt: '2026-06-25',
  createdBy: '数字化部',
  
  name: '知识问答助手',
  description: '基于企业知识库的智能问答，支持多轮对话与文档溯源',
  icon: 'BookOpen',
  iconBg: 'linear-gradient(135deg, #00E5FF 0%, #0099CC 100%)',
  
  llmConfig: {
    provider: 'wuxidata',
    model: '/model/Qwen3-Next',
    apiKey: '',
    apiEndpoint: 'http://localhost:8080',
    temperature: 0.6,
    topP: 0.9,
    maxTokens: 2048,
    presencePenalty: 0,
    frequencyPenalty: 0,
    ollamaBaseUrl: 'http://localhost:11434'
  },
  
  prompts: [
    {
      id: 'prompt-system-001',
      name: '系统提示词',
      type: 'system',
      content: `你是国联集团太湖云的员工小助手，既专业又亲切的同事。你的回答要做到以下几点：

【专业性要求】
- 回答必须准确，关键信息要精准无误，比如时间、流程步骤、责任部门等
- 如果参考了文件内容，要确保信息完整，不遗漏重要细节
- 技术术语使用要准确，比如"合规部门"、"审批流程"等

【表达风格要求】
- 用自然口语化的方式表达，避免书面化和生硬的措辞
- 可以适当使用"你好"、"好的"、"我来给你讲讲"、"其实是这样的"等开场白，让回答更亲切
- 逻辑要清晰，可以用"首先"、"然后"、"另外"这样的连接词，但不要用数字编号
- 句子不要太长，保持适度的停顿，让用户容易理解
- 不展示来源：回答中不得出现文件名称、引用标注、来源说明或 [文档名称] 等引用信息

【后续问题建议】
回答完问题后，生成3个相关的后续问题选项，用"一、二、三"开头。问题要和当前回答主题紧密相关，具有引导性，帮助用户深入了解。

例如：
用户问"如何处理合规问题？"
回答后可以建议：
一、如何识别日常工作中的合规风险？
二、如果直接上级涉及违规，应该向谁报告？
三、公司有哪些培训可以帮助理解合规要求？

【知识库优先】
优先参考《太湖云新员工试用期管理制度-常见问题Q&A（30题）》和制度文件夹中的内容。

{{knowledge_context}}`,
      variables: ['knowledge_context']
    },
    {
      id: 'prompt-user-001',
      name: '用户问题模板',
      type: 'user',
      content: '{{user_question}}',
      variables: ['user_question']
    }
  ],
  
  knowledgeSources: [
    {
      id: 'ks-001',
      name: '新员工试用期Q&A',
      type: 'file',
      sourceId: 'C:\\Users\\lc\\Desktop\\员工小助手智能体开发\\意图识别\\常见问题汇总\\太湖云新员工试用期管理制度-常见问题Q&A（30题）.docx',
      enabled: true,
      retrievalMode: 'semantic',
      topK: 5,
      priority: 1
    },
    {
      id: 'ks-002',
      name: '制度文档文件夹',
      type: 'folder',
      sourceId: 'C:\\Users\\lc\\Desktop\\员工小助手智能体开发\\意图识别\\制度(1)',
      enabled: true,
      retrievalMode: 'hybrid',
      topK: 3,
      priority: 2
    },
    {
      id: 'ks-003',
      name: '集团制度规范',
      type: 'folder',
      sourceId: 'gl-group',
      enabled: true,
      retrievalMode: 'semantic',
      topK: 5,
      priority: 3
    },
    {
      id: 'ks-004',
      name: '业务手册文档',
      type: 'folder',
      sourceId: 'level-zongbu',
      enabled: true,
      retrievalMode: 'hybrid',
      topK: 3,
      priority: 4
    }
  ],
  
  behavior: {
    enableMemory: true,
    enableMultiTurn: true,
    enableCitation: true,
    responseLanguage: 'zh-CN',
    maxConversationLength: 10
  },
  
  permissions: {
    visibility: 'public',
    allowedDepartments: [],
    allowedUsers: []
  },
  
  status: 'published'
};

// 配置版本历史
export const configVersions: AgentConfigVersion[] = [
  {
    id: 'version-001',
    configId: 'config-knowledge-001',
    version: '1.0.0',
    createdAt: '2026-06-20',
    createdBy: '张经理',
    changeLog: '初始版本发布',
    snapshot: knowledgeAgentConfig
  }
];

// 可用的大模型列表（不包括Ollama，Ollama将从modelStore动态获取）
export const availableLLMs = [
  { provider: 'openai' as const, name: 'OpenAI GPT', models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
  { provider: 'anthropic' as const, name: 'Anthropic Claude', models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'] },
  { provider: 'azure' as const, name: 'Azure OpenAI', models: ['gpt-4', 'gpt-35-turbo'] },
  { provider: 'wuxidata' as const, name: '国联 AI 大模型', models: ['/model/Qwen3-Next', '/model/DeepSeek-V32', '/model/qwen3_32b', '/model/qwen3_vl_30b', '/model/qwen_eb', '/model/qwen3_30b'] }
];

// 模型元数据（不包括Ollama，Ollama将从modelStore动态获取）
export const modelMetadatas: ModelMetadata[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: '最新的OpenAI多模态模型，具有强大的理解能力',
    maxContextLength: 128000,
    supportedFeatures: ['chat', 'completion', 'embedding'],
    pricing: { inputTokenPrice: 0.01, outputTokenPrice: 0.03 }
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    description: 'Anthropic 最强大的模型',
    maxContextLength: 200000,
    supportedFeatures: ['chat', 'completion'],
    pricing: { inputTokenPrice: 0.015, outputTokenPrice: 0.075 }
  },
  {
    id: '/model/Qwen3-Next',
    name: 'Qwen3-Next-80B-A3B',
    provider: 'wuxidata',
    description: '国联 AI 提供的企业级大模型，支持长上下文与推理',
    maxContextLength: 32000,
    supportedFeatures: ['chat', 'completion'],
    pricing: { inputTokenPrice: 0, outputTokenPrice: 0 }
  },
  {
    id: '/model/DeepSeek-V32',
    name: 'DeepSeek-V3.2',
    provider: 'wuxidata',
    description: '国联 AI 提供的 DeepSeek 大模型',
    maxContextLength: 64000,
    supportedFeatures: ['chat', 'completion'],
    pricing: { inputTokenPrice: 0, outputTokenPrice: 0 }
  }
];

// Ollama配置默认值
export const ollamaDefaultConfig = {
  baseUrl: 'http://localhost:11434',
  timeout: 60000,
  defaultModels: ['llama3', 'llama2', 'mistral', 'qwen2', 'gemma']
};

// 所有智能体配置
export const agentConfigs: AgentConfig[] = [knowledgeAgentConfig];
