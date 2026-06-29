# 知识问答助手功能增强实现方案

## 1. 项目概述

本方案旨在全面修复和增强太湖云AI企业智能体平台中知识问答助手的核心功能，实现完整的外部模型集成、本地模型支持和多轮对话管理。

### 1.1 核心目标

- **外部模型集成**：支持多种第三方AI模型服务的配置与管理
- **本地模型支持**：通过Ollama框架实现本地部署模型的无缝集成
- **多轮对话功能**：实现完善的对话上下文管理与引用机制

## 2. 系统架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      前端界面层                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │ 配置管理界面  │  │ 对话界面     │  │ 预览测试界面     │ │
│  └──────────────┘  └──────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                      业务逻辑层                              │
│  ┌──────────────────┐  ┌──────────────────────────────────┐ │
│  │ 模型服务管理器    │  │ 对话上下文管理器                │ │
│  └──────────────────┘  └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                      集成接口层                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │ OpenAI API   │  │ Anthropic    │  │ Ollama 本地模型  │ │
│  └──────────────┘  └──────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                      数据存储层                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │ 配置存储     │  │ 对话历史     │  │ 知识库缓存       │ │
│  └──────────────┘  └──────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 技术栈

#### 前端
- React 19 + TypeScript
- Tailwind CSS + Radix UI
- Zustand (状态管理)
- Framer Motion (动画)

#### 后端 (预留接口)
- Spring Boot + Java 8
- MyBatis
- PostgreSQL + Redis
- Ollama SDK

## 3. 模型集成接口规范

### 3.1 类型系统扩展

```typescript
// 扩展模型提供商类型
export type LLMProvider = 
  | 'openai'
  | 'anthropic'
  | 'azure'
  | 'ollama'
  | 'custom';

// 模型配置扩展
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
```

### 3.2 统一模型接口

```typescript
// 模型服务接口
interface ModelService {
  name: string;
  provider: LLMProvider;
  isAvailable(): Promise<boolean>;
  listModels(): Promise<ModelMetadata[]>;
  chat(messages: ChatMessage[], config: LLMConfig): Promise<ChatResponse>;
  streamChat(messages: ChatMessage[], config: LLMConfig): AsyncGenerator<ChatStreamChunk>;
}

// 聊天消息
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  metadata?: Record<string, any>;
}

// 聊天响应
interface ChatResponse {
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
interface ChatStreamChunk {
  id: string;
  content: string;
  isDelta: boolean;
  isFinished: boolean;
  metadata?: Record<string, any>;
}
```

### 3.3 Ollama集成接口

```typescript
// Ollama模型配置
interface OllamaConfig {
  baseUrl: string;
  timeout: number;
  models: string[];
}

// Ollama模型元数据
interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  details: {
    format: string;
    family: string;
    families: string[];
    parameterSize: string;
    quantizationLevel: string;
  };
  modifiedAt: string;
}

// Ollama聊天请求
interface OllamaChatRequest {
  model: string;
  messages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
    images?: string[];
  }[];
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_predict?: number;
  };
}
```

## 4. 对话状态管理机制

### 4.1 对话上下文架构

```typescript
// 对话会话
interface ConversationSession {
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
interface ConversationMessage {
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
interface Citation {
  id: string;
  sourceId: string;
  sourceName: string;
  contentType: 'file' | 'folder';
  relevantSnippets: string[];
  confidenceScore: number;
}

// Token 使用统计
interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost?: number;
}

// 知识搜索结果
interface KnowledgeSearchResult {
  id: string;
  sourceId: string;
  sourceName: string;
  content: string;
  score: number;
  metadata: Record<string, any>;
}
```

### 4.2 上下文管理器

```typescript
// 对话上下文管理器接口
interface ConversationContextManager {
  createSession(agentId: string, title?: string): Promise<ConversationSession>;
  getSession(sessionId: string): Promise<ConversationSession | null>;
  addMessage(sessionId: string, message: Omit<ConversationMessage, 'id' | 'timestamp'>): Promise<void>;
  getContextForLLM(sessionId: string, config: ContextWindowConfig): Promise<ChatMessage[]>;
  saveSession(session: ConversationSession): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
  listSessions(agentId?: string): Promise<ConversationSession[]>;
}

// 上下文窗口配置
interface ContextWindowConfig {
  maxTokens: number;
  maxMessages?: number;
  compressionStrategy: 'truncate' | 'summarize' | 'selective';
  includeSystemPrompt: boolean;
}
```

## 5. 详细实现计划

### 阶段1：增强类型系统和配置（立即实施）

**文件列表：**
1. `src/types/index.ts` - 扩展类型定义
2. `src/data/agentConfigs.ts` - 增强模型配置数据
3. `src/types/model.ts` - 新增模型相关类型文件
4. `src/types/conversation.ts` - 新增对话相关类型文件

**具体任务：**
- 扩展 LLMProvider 类型，增加 ollama 和 custom
- 完善 LLMConfig 接口
- 新增 ModelMetadata 接口
- 新增完整的对话上下文类型
- 更新 agentConfigs.ts 中的模型列表

### 阶段2：增强模型配置界面（配置管理模块）

**文件列表：**
1. `src/components/modules/config/LLMConfigTab.tsx` - 大幅重构
2. `src/components/modules/config/OllamaConfigTab.tsx` - 新增
3. `src/components/modules/config/ModelSelector.tsx` - 新增
4. `src/components/ui/config/ModelConfigCard.tsx` - 新增
5. `src/hooks/useModelConfig.ts` - 新增状态管理Hook
6. `src/utils/modelValidator.ts` - 新增配置验证器

**具体任务：**
- 重构 LLMConfigTab 支持多提供商配置
- 新增 Ollama 配置界面
- 添加模型测试连接功能
- 实现模型列表动态加载
- 添加 API Key 加密存储机制

### 阶段3：实现对话上下文管理（预览和消息模块）

**文件列表：**
1. `src/components/modules/config/PreviewTab.tsx` - 大幅重构
2. `src/components/modules/MessagesModule.tsx` - 增强对话功能
3. `src/hooks/useConversationContext.ts` - 新增对话管理Hook
4. `src/utils/conversationBuilder.ts` - 新增对话构建工具
5. `src/store/conversationStore.ts` - 新增对话状态管理
6. `src/services/modelService.ts` - 新增模型服务接口

**具体任务：**
- 重构 PreviewTab 支持真实对话
- 实现多轮对话上下文管理
- 添加 Token 计算和上下文裁剪
- 实现对话历史管理
- 集成知识检索到对话流程

### 阶段4：实现模型集成服务（前后端接口）

**文件列表：**
1. `src/services/modelService.ts` - 新增
2. `src/services/ollamaService.ts` - 新增
3. `src/services/openaiService.ts` - 新增
4. `src/utils/streamHandler.ts` - 新增流式处理工具

**具体任务：**
- 实现 OpenAI 兼容接口
- 实现 Anthropic 接口
- 实现 Ollama 本地模型接口
- 添加流式响应处理
- 实现错误重试机制

### 阶段5：测试与完善

**任务：**
- 单元测试
- 集成测试
- 性能测试
- 用户体验优化

## 6. 数据库表结构设计（预留后端）

```sql
-- 模型配置表
CREATE TABLE llm_configs (
  id VARCHAR(64) PRIMARY KEY,
  agent_id VARCHAR(64) NOT NULL,
  provider VARCHAR(32) NOT NULL,
  model_name VARCHAR(128) NOT NULL,
  api_key TEXT,
  api_endpoint VARCHAR(256),
  temperature DECIMAL(3,2),
  top_p DECIMAL(3,2),
  max_tokens INTEGER,
  ollama_base_url VARCHAR(256),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  created_by VARCHAR(64),
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- 对话会话表
CREATE TABLE conversation_sessions (
  id VARCHAR(64) PRIMARY KEY,
  agent_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  title VARCHAR(256),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB,
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- 对话消息表
CREATE TABLE conversation_messages (
  id VARCHAR(64) PRIMARY KEY,
  session_id VARCHAR(64) NOT NULL,
  role VARCHAR(16) NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  token_usage JSONB,
  citations JSONB,
  metadata JSONB,
  FOREIGN KEY (session_id) REFERENCES conversation_sessions(id)
);
```

## 7. 测试计划

### 7.1 单元测试

**测试覆盖：**
- 模型配置验证器
- 对话上下文管理器
- Token 计算器
- 各种工具函数

### 7.2 集成测试

**测试场景：**
1. OpenAI API 集成测试
2. Anthropic API 集成测试
3. Ollama 本地模型集成测试
4. 多轮对话流程测试
5. 配置保存与加载测试

### 7.3 性能测试

**测试指标：**
- 响应延迟
- Token 消耗
- 内存占用
- 并发处理能力

## 8. 验收标准

### 8.1 功能验收

- [ ] 可以成功配置并使用 OpenAI 模型
- [ ] 可以成功配置并使用 Anthropic 模型
- [ ] 可以成功配置并使用 Ollama 本地模型
- [ ] 支持自定义第三方模型
- [ ] 多轮对话上下文正确保存和引用
- [ ] 对话历史可查询和管理
- [ ] Token 使用统计正确显示

### 8.2 性能验收

- [ ] 单个 API 请求响应时间 < 3秒（网络允许下）
- [ ] 内存占用 < 200MB
- [ ] 配置加载时间 < 500ms

### 8.3 质量验收

- [ ] 单元测试覆盖率 > 80%
- [ ] 无严重 Bug
- [ ] 界面响应流畅
- [ ] 用户操作无阻塞

## 9. 风险与应对策略

| 风险 | 影响 | 概率 | 应对策略 |
|------|------|------|----------|
| Ollama 本地连接不稳定 | 中 | 中 | 提供连接测试和重试机制 |
| API Key 安全性 | 高 | 中 | 本地加密存储，支持环境变量 |
| Token 上下文超限 | 中 | 高 | 实现智能上下文裁剪 |
| 网络请求超时 | 中 | 中 | 超时重试机制 + 超时提示 |

## 10. 开发时间线

| 阶段 | 任务 | 时间估计 |
|------|------|----------|
| 阶段1 | 类型系统和配置数据 | 0.5小时 |
| 阶段2 | 模型配置界面 | 1小时 |
| 阶段3 | 对话上下文管理 | 1小时 |
| 阶段4 | 模型集成服务 | 1小时 |
| 阶段5 | 测试与完善 | 0.5小时 |
| **总计** | | **4小时** |
