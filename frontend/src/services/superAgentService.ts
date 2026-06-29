import { createModelService } from './modelService';
import { sendMessage as sendAgentMessage } from './chatService';
import { plazaAgents, myAgents } from '@/data/agents';

export interface RoutedAgent {
  agentId: string;
  agentName: string;
  category: string;
  description: string;
}

export interface SuperAgentResponse {
  content: string;
  route: RoutedAgent;
  conversationId: string;
  messageId: string;
  followUpOptions: string[];
}

/** 所有可路由的智能体（广场 23 个 + 我的 4 个） */
const routableAgents: RoutedAgent[] = [
  ...plazaAgents.map(a => ({
    agentId: a.id,
    agentName: a.name,
    category: a.category,
    description: a.description,
  })),
  ...myAgents.map(a => ({
    agentId: a.id,
    agentName: a.name,
    category: '我的智能体',
    description: a.description,
  })),
];

/** 用 LLM 做意图识别（带超时，失败不影响主流程） */
async function llmClassifyIntent(query: string, timeoutMs = 3000): Promise<RoutedAgent | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // 优先走本地 Ollama，速度最快；不可用会快速失败
    const modelService = createModelService({
      provider: 'ollama',
      model: 'glm4:9b',
      ollamaBaseUrl: 'http://localhost:11434',
      temperature: 0.3,
      topP: 0.9,
      maxTokens: 256,
      presencePenalty: 0,
      frequencyPenalty: 0,
    });

    const agentOptions = routableAgents
      .map(
        (a, idx) =>
          `${idx + 1}. ${a.agentId} | ${a.agentName} | ${a.category} | ${a.description}`
      )
      .join('\n');

    const systemPrompt = `你是国联集团「太湖云 AI 超级助手」的意图识别模块。请根据用户问题，从候选智能体中选择最合适的一个，只输出 JSON。`;

    const userPrompt = `候选智能体列表：
${agentOptions}

用户问题："""${query}"""

请输出 JSON（不要解释）：
{
  "agentId": "选中的 agentId",
  "reason": "一句话理由"
}`;

    const response = await modelService.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    const content = response.content || '';
    const match = content.match(/\{[\s\S]*?\}/);
    if (!match) return null;

    const result = JSON.parse(match[0]) as { agentId?: string };
    const agent = routableAgents.find(a => a.agentId === result.agentId);
    return agent || null;
  } catch (error) {
    console.warn('[SuperAgent] LLM 意图识别失败，使用规则兜底:', error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/** 基于关键词的规则路由（兜底） */
export function regexClassifyIntent(query: string): RoutedAgent {
  const q = query.toLowerCase();

  // 临时规则：以「制度」结尾的问题（如「新员工制度」）直接走知识问答助手
  if (/制度\s*$/.test(query.trim())) {
    return routableAgents.find(a => a.agentId === 'plaza-1')!;
  }

  // 行政类
  if (/公文|通知|报告|请示|纪要|文件|写作|文档|稿件/.test(q)) {
    return routableAgents.find(a => a.agentId === 'plaza-2')!;
  }
  if (/会议|议程|排期|会议室|日程|安排/.test(q)) {
    return routableAgents.find(a => a.agentId === 'plaza-3')!;
  }
  if (/招聘|简历|面试|人事|员工|入职|离职|绩效/.test(q)) {
    return routableAgents.find(a => a.agentId === 'plaza-4')!;
  }
  if (/培训|学习|课程|考试|考核|技能|发展/.test(q)) {
    return routableAgents.find(a => a.agentId === 'plaza-5')!;
  }
  if (/审批|流程|申请|OA|签报|用印|请假|出差/.test(q)) {
    return routableAgents.find(a => a.agentId === 'plaza-6')!;
  }
  if (/待办|任务|todo|清单|提醒|催办/.test(q)) {
    return routableAgents.find(a => a.agentId === 'plaza-7')!;
  }
  if (/晨报|日报|早报|摘要|概览|今天.*安排/.test(q)) {
    return routableAgents.find(a => a.agentId === 'plaza-8')!;
  }
  if (/ppt|幻灯片|演示文稿|汇报|课件/.test(q)) {
    return routableAgents.find(a => a.agentId === 'plaza-23')!;
  }

  // 财务类
  if (/报销|发票|差旅|费用|财务|预算|付款|收款|会计|审计/.test(q)) {
    return routableAgents.find(a => a.agentId === 'plaza-9')!;
  }

  // 商务类
  if (/合同.*生成|生成.*合同|起草.*合同|合同.*模板/.test(q)) {
    return routableAgents.find(a => a.agentId === 'plaza-11')!;
  }
  if (/合同|合规|法务|法律|风险|条款|协议/.test(q)) {
    return routableAgents.find(a => a.agentId === 'plaza-10')!;
  }
  if (/售前|方案|投标|报价|客户|商务|销售/.test(q)) {
    return routableAgents.find(a => a.agentId === 'plaza-12')!;
  }

  // 管控类
  if (/项目|进度|风险|管理|计划|里程碑|PM/.test(q)) {
    return routableAgents.find(a => a.agentId === 'plaza-13')!;
  }
  if (/安全|生产|隐患|事故|检修/.test(q)) {
    return routableAgents.find(a => a.agentId === 'plaza-14')!;
  }

  // 运营类
  if (/膳食|餐饮|食堂|菜品|用餐|食物|午餐|晚餐|订餐/.test(q)) {
    return routableAgents.find(a => a.agentId === 'plaza-16')!;
  }
  if (/物业|报修|水电|房租|设施|环境|保洁/.test(q)) {
    return routableAgents.find(a => a.agentId === 'plaza-15')!;
  }
  if (/IT|运维|网络|服务器|故障|系统|电脑|软件/.test(q)) {
    return routableAgents.find(a => a.agentId === 'plaza-17')!;
  }

  // 市政类
  if (/积水|防汛|天气|水位|隧道|桥下/.test(q)) {
    return routableAgents.find(a => a.agentId === 'plaza-18')!;
  }
  if (/设备.*维护|维护.*设备|保养|维修|机器/.test(q)) {
    return routableAgents.find(a => a.agentId === 'plaza-19')!;
  }

  // 金融类
  if (/营收|利润|业绩|经营|指标|业务数据/.test(q)) {
    return routableAgents.find(a => a.agentId === 'plaza-20')!;
  }
  if (/资产负债|投资回报|财务分析|深度分析|ROI/.test(q)) {
    return routableAgents.find(a => a.agentId === 'plaza-21')!;
  }
  if (/数据.*分析|分析.*数据|报表|可视化|统计/.test(q)) {
    return routableAgents.find(a => a.agentId === 'my-data')!;
  }

  // 客服类
  if (/客服|咨询|投诉|建议|反馈|帮助|服务/.test(q)) {
    return routableAgents.find(a => a.agentId === 'plaza-22')!;
  }

  // 代码/开发
  if (/代码|Java|审查|重构|bug|性能优化/.test(q)) {
    return routableAgents.find(a => a.agentId === 'my-code')!;
  }

  // 业务协同
  if (/协同|客户需求|推送|商机|合作/.test(q)) {
    return routableAgents.find(a => a.agentId === 'my-synergy')!;
  }

  // 默认：知识问答助手
  return routableAgents.find(a => a.agentId === 'plaza-1')!;
}

/** 意图识别：优先 LLM，失败或超时时用规则兜底 */
export async function classifyIntent(query: string): Promise<RoutedAgent> {
  // 临时规则：以「制度」结尾的问题（如「新员工制度」）直接走知识问答助手
  if (/制度\s*$/.test(query.trim())) {
    return routableAgents.find(a => a.agentId === 'plaza-1')!;
  }
  const llmResult = await llmClassifyIntent(query);
  if (llmResult) return llmResult;
  return regexClassifyIntent(query);
}

/** 超级助手发送消息：识别意图 -> 调用对应智能体 -> 返回结果 */
export async function sendMessage(
  query: string,
  conversationId?: string
): Promise<SuperAgentResponse> {
  const route = await classifyIntent(query);
  return sendMessageToAgent(route, query, conversationId);
}

/** 直接向某个已确定的智能体发送消息（不重新识别意图） */
export async function sendMessageToAgent(
  route: RoutedAgent,
  query: string,
  conversationId?: string
): Promise<SuperAgentResponse> {
  const result = await sendAgentMessage(
    route.agentId,
    route.agentName,
    route.description,
    query,
    conversationId
  );

  return {
    ...result,
    route,
  };
}
