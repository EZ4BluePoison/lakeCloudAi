import { bffService } from './bffService';
import { createModelService } from './modelService';
import { getAgentPrompt } from '@/data/agentPrompts';
import type { Citation } from '@/types';

export interface ChatResponse {
  content: string;
  followUpOptions: string[];
  conversationId: string;
  messageId: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  /** 引用信息保留在元数据中，前端不展示给用户 */
  metadata?: {
    citations?: Citation[];
  };
}

export interface FollowUpSuggestion {
  question: string;
  relevance: number;
}

const followUpTemplates: Record<string, FollowUpSuggestion[]> = {
  default: [
    { question: '你能详细解释一下吗？', relevance: 1.0 },
    { question: '还有其他需要注意的吗？', relevance: 0.9 },
    { question: '这个过程需要多长时间？', relevance: 0.85 },
    { question: '我需要准备什么材料？', relevance: 0.8 },
    { question: '有什么风险或注意事项？', relevance: 0.95 },
    { question: '如何获取更多相关信息？', relevance: 0.88 },
  ],
  公文写作: [
    { question: '这个格式可以调整吗？', relevance: 1.0 },
    { question: '需要添加哪些附件？', relevance: 0.92 },
    { question: '审批流程是怎样的？', relevance: 0.88 },
    { question: '有参考模板可以借鉴吗？', relevance: 0.95 },
    { question: '需要哪些人签字？', relevance: 0.85 },
  ],
  会议: [
    { question: '需要发送会议邀请吗？', relevance: 1.0 },
    { question: '会议时长建议多久？', relevance: 0.93 },
    { question: '需要准备什么资料？', relevance: 0.9 },
    { question: '有冲突的日程怎么办？', relevance: 0.88 },
    { question: '需要预定会议室吗？', relevance: 0.95 },
  ],
  人事招聘: [
    { question: '面试流程是怎样的？', relevance: 1.0 },
    { question: '薪资范围是多少？', relevance: 0.9 },
    { question: '需要准备哪些面试问题？', relevance: 0.95 },
    { question: '多久能出结果？', relevance: 0.88 },
    { question: '有什么考核环节？', relevance: 0.92 },
  ],
  培训: [
    { question: '培训时长是多少？', relevance: 1.0 },
    { question: '培训考核如何进行？', relevance: 0.93 },
    { question: '有培训材料吗？', relevance: 0.9 },
    { question: '可以线上学习吗？', relevance: 0.87 },
    { question: '培训费用是多少？', relevance: 0.85 },
  ],
  审批: [
    { question: '审批需要多长时间？', relevance: 1.0 },
    { question: '审批流程有哪些环节？', relevance: 0.95 },
    { question: '被驳回了怎么办？', relevance: 0.92 },
    { question: '可以加急处理吗？', relevance: 0.88 },
    { question: '需要哪些审批材料？', relevance: 0.93 },
  ],
  报销: [
    { question: '报销流程是怎样的？', relevance: 1.0 },
    { question: '需要哪些凭证？', relevance: 0.95 },
    { question: '报销有时间限制吗？', relevance: 0.9 },
    { question: '可以报销哪些费用？', relevance: 0.92 },
    { question: '多久能到账？', relevance: 0.88 },
  ],
  待办: [
    { question: '如何设置优先级？', relevance: 1.0 },
    { question: '可以设置重复提醒吗？', relevance: 0.9 },
    { question: '完成后需要确认吗？', relevance: 0.87 },
    { question: '如何批量处理？', relevance: 0.85 },
    { question: '有统计功能吗？', relevance: 0.83 },
  ],
  数据分析: [
    { question: '数据来源是什么？', relevance: 1.0 },
    { question: '统计周期是多久？', relevance: 0.92 },
    { question: '有异常预警吗？', relevance: 0.88 },
    { question: '可以导出报告吗？', relevance: 0.95 },
    { question: '数据更新频率是多少？', relevance: 0.85 },
  ],
  合规: [
    { question: '有哪些合规要求？', relevance: 1.0 },
    { question: '如何进行合规检查？', relevance: 0.95 },
    { question: '不合规会有什么后果？', relevance: 0.92 },
    { question: '有培训课程吗？', relevance: 0.88 },
    { question: '如何报告违规行为？', relevance: 0.93 },
  ],
  知识问答: [
    { question: '有相关文档可以参考吗？', relevance: 1.0 },
    { question: '这个信息是最新的吗？', relevance: 0.92 },
    { question: '还有其他相关内容吗？', relevance: 0.9 },
    { question: '可以举个例子吗？', relevance: 0.95 },
    { question: '适用范围是什么？', relevance: 0.87 },
  ],
  采购: [
    { question: '采购流程是怎样的？', relevance: 1.0 },
    { question: '需要哪些审批？', relevance: 0.95 },
    { question: '预算如何申请？', relevance: 0.9 },
    { question: '有供应商推荐吗？', relevance: 0.88 },
    { question: '采购周期是多久？', relevance: 0.92 },
  ],
  设备: [
    { question: '如何申请设备？', relevance: 1.0 },
    { question: '设备配置标准是什么？', relevance: 0.93 },
    { question: '维修流程是怎样的？', relevance: 0.9 },
    { question: '可以更换设备吗？', relevance: 0.87 },
    { question: '设备使用有什么规定？', relevance: 0.85 },
  ],
  IT支持: [
    { question: '如何提交IT工单？', relevance: 1.0 },
    { question: '响应时间是多久？', relevance: 0.95 },
    { question: '有紧急通道吗？', relevance: 0.92 },
    { question: '常见问题如何解决？', relevance: 0.88 },
    { question: '可以远程协助吗？', relevance: 0.93 },
  ],
  合同: [
    { question: '合同模板在哪里下载？', relevance: 1.0 },
    { question: '审批流程是怎样的？', relevance: 0.95 },
    { question: '需要法务审核吗？', relevance: 0.92 },
    { question: '有哪些注意事项？', relevance: 0.88 },
    { question: '合同期限如何确定？', relevance: 0.9 },
  ],
};

/** 按智能体 ID 预设的后续问题（兜底时用，避免关键词误匹配） */
const agentFollowUpTemplates: Record<string, FollowUpSuggestion[]> = {
  'plaza-1': [
    { question: '可以举个例子说明吗？', relevance: 1.0 },
    { question: '这个规定适用于哪些场景？', relevance: 0.95 },
    { question: '最新的政策文件在哪里查看？', relevance: 0.9 },
  ],
  'plaza-2': [
    { question: '这个格式可以调整吗？', relevance: 1.0 },
    { question: '需要添加哪些附件？', relevance: 0.95 },
    { question: '审批流程是怎样的？', relevance: 0.9 },
  ],
  'plaza-3': [
    { question: '需要发送会议邀请吗？', relevance: 1.0 },
    { question: '会议时长建议多久？', relevance: 0.95 },
    { question: '需要预定会议室吗？', relevance: 0.9 },
  ],
  'plaza-9': [
    { question: '报销流程是怎样的？', relevance: 1.0 },
    { question: '需要哪些凭证？', relevance: 0.95 },
    { question: '报销有时间限制吗？', relevance: 0.9 },
  ],
  'plaza-10': [
    { question: '这份合同有哪些主要风险点？', relevance: 1.0 },
    { question: '需要补充哪些条款？', relevance: 0.95 },
    { question: '是否符合最新法规要求？', relevance: 0.9 },
  ],
  'plaza-13': [
    { question: '当前项目的主要风险是什么？', relevance: 1.0 },
    { question: '下阶段的关键里程碑有哪些？', relevance: 0.95 },
    { question: '资源分配是否需要调整？', relevance: 0.9 },
  ],
  'plaza-17': [
    { question: '这个问题的根因是什么？', relevance: 1.0 },
    { question: '有没有标准处理流程？', relevance: 0.95 },
    { question: '需要提交工单吗？', relevance: 0.9 },
  ],
};

function getAgentSystemPrompt(agentId: string, agentName: string, description: string): string {
  const agentPrompt = getAgentPrompt(agentId);
  if (agentPrompt?.systemPrompt) {
    return agentPrompt.systemPrompt;
  }

  return `你是${agentName}，${description}。请根据你的专业知识回答用户的问题，保持回答简洁明了，专业准确。`;
}

function getRelevantTemplates(agentId: string, content: string): FollowUpSuggestion[] {
  // 优先按智能体 ID 匹配，避免内容中偶然出现的关键词误触
  const agentSpecific = agentFollowUpTemplates[agentId];
  if (agentSpecific) {
    return agentSpecific;
  }

  // 其次按回答内容中的关键词匹配
  for (const [keyword, suggestions] of Object.entries(followUpTemplates)) {
    if (keyword !== 'default' && content.includes(keyword)) {
      return suggestions;
    }
  }
  return followUpTemplates.default;
}

function generateFollowUpOptions(agentId: string, content: string): string[] {
  const suggestions = getRelevantTemplates(agentId, content);
  const shuffled = [...suggestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map(s => s.question);
}

/**
 * 使用 LLM 基于用户问题和模型回答生成 3 个相关后续问题。
 * 失败或超时时返回空数组，由调用方兜底。
 */
async function generateFollowUpOptionsWithLlm(
  agentName: string,
  userMessage: string,
  answer: string
): Promise<string[]> {
  try {
    const modelService = createModelService({
      provider: 'ollama',
      model: 'glm4:9b',
      ollamaBaseUrl: 'http://localhost:11434',
      temperature: 0.6,
      topP: 0.9,
      maxTokens: 256,
      presencePenalty: 0,
      frequencyPenalty: 0,
    });

    const systemPrompt = `你是对话续写助手。请严格根据「用户问题」和「智能体回答」的内容，生成3个用户可能想继续追问的问题。
要求：
- 问题必须与回答内容强相关，不能偏离主题
- 问题要具体、可回答，不要泛泛而谈
- 每个问题一行，不要编号，不要解释
- 只输出3个问题，不要输出其他内容`;

    const userPrompt = `智能体：${agentName}
用户问题："""${userMessage}"""
回答内容："""${answer.substring(0, 1200)}"""

请生成3个后续问题：`;

    const response = await modelService.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    const questions = (response.content || '')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^\s*[\d一二三四五六七八九十]+[.、.\s]+/, '').replace(/^[\-•]\s*/, '').trim())
      .map(line => line.replace(/[?？]\s*$/, '') + '?')
      .filter(line => line.length > 6 && line.length < 60)
      .slice(0, 3);

    return questions.length === 3 ? questions : [];
  } catch (error) {
    console.warn('[chatService] LLM 生成后续问题失败:', error);
    return [];
  }
}

/**
 * 发送消息（走 BFF / Dify 语义）
 * 入参与之前基本保持一致，新增可选 conversationId 用于多轮会话。
 */
export async function sendMessage(
  agentId: string,
  agentName: string,
  agentDescription: string,
  userMessage: string,
  conversationId?: string
): Promise<ChatResponse> {
  const systemPrompt = getAgentSystemPrompt(agentId, agentName, agentDescription);

  const result = await bffService.chat.sendMessage({
    agentId,
    query: userMessage,
    conversationId,
    inputs: {
      system_prompt: systemPrompt,
    },
    responseMode: 'blocking',
  });

  const answer = result.answer || '抱歉，我无法回答这个问题。';

  // 优先用 LLM 生成强相关的后续问题，3 秒超时则降级到关键词模板
  let followUpOptions: string[] = [];
  try {
    followUpOptions = await Promise.race([
      generateFollowUpOptionsWithLlm(agentName, userMessage, answer),
      new Promise<string[]>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
    ]);
  } catch {
    followUpOptions = [];
  }
  if (followUpOptions.length === 0) {
    followUpOptions = generateFollowUpOptions(agentId, answer);
  }

  return {
    content: answer,
    followUpOptions,
    conversationId: result.conversationId,
    messageId: result.messageId,
    usage: result.metadata?.tokenUsage,
    // 引用信息保留，但前端不展示
    metadata: {
      citations: result.metadata?.citations,
    },
  };
}

export async function sendMessageWithRetry(
  agentId: string,
  agentName: string,
  agentDescription: string,
  userMessage: string,
  conversationId?: string,
  maxRetries: number = 2
): Promise<ChatResponse> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await sendMessage(agentId, agentName, agentDescription, userMessage, conversationId);
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  throw new Error('Max retries exceeded');
}

// 会话相关方法直接暴露 BFF 能力，供 MessagesModule 使用
export async function listConversations(agentId?: string) {
  return bffService.chat.listConversations(agentId);
}

export async function getConversationMessages(conversationId: string) {
  return bffService.chat.getMessages(conversationId);
}

export async function deleteConversation(conversationId: string) {
  return bffService.chat.deleteConversation(conversationId);
}

export async function sendMessageFeedback(messageId: string, rating: 'like' | 'dislike', content?: string) {
  return bffService.chat.sendFeedback(messageId, rating, content);
}
