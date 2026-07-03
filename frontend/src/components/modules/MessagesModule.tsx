import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  BookOpen, FileText, CalendarDays, GitBranch,
  Receipt, Scale, FolderKanban, Headphones,
  Star, Send, Paperclip, Image, Smile, BookOpen as BookOpenIcon,
  Bot, Cloud, Sparkles, MessageCircle,
  UserPlus, GraduationCap, PenTool, FileBarChart, TrendingUp, MonitorCog,
  CheckSquare, Sunrise, UtensilsCrossed, Home, Database, Shield, Wrench,
  Presentation
} from 'lucide-react';
import type { ChatPanelMessage as ChatMessage, ConversationMessage, MyAgent, Agent, PlazaAgent } from '@/types';
import { bffService } from '@/services/bffService';
import { mapApplicationToPlazaAgent } from '@/services/agentService';
import { sendMessage as chatServiceSendMessage, type ChatResponse } from '@/services/chatService';
import { useConversationStore } from '@/store/conversationStore';
import { Plus, Trash2, History, X } from 'lucide-react';
import { VoiceInputButton } from '@/components/ui/VoiceInputButton';

const iconMap: Record<string, React.ElementType> = {
  BookOpen, FileText, CalendarDays, GitBranch,
  Receipt, Scale, FolderKanban, Headphones,
  Bot, Cloud, Sparkles, MessageCircle,
  UserPlus, GraduationCap, PenTool, FileBarChart, TrendingUp, MonitorCog,
  CheckSquare, Sunrise, UtensilsCrossed, Home, Database, Shield, Wrench,
  Presentation
};

/** Generate contextual responses for each agent */
function getAgentResponses(agentId: string, agentName: string): { tips: string[]; responses: string[] } {
  const responses: Record<string, { tips: string[]; responses: string[] }> = {
    'plaza-1': {
      tips: ['查询集团最新合规政策', '太湖云的数据标准是什么', '业务协同平台的审批流程'],
      responses: ['根据集团2026年最新合规政策要求（6月版），主要涉及以下方面：\n\n• 数据安全：核心业务数据分类分级管理\n• 协同审批：超50万项目需集团级联审\n• AI应用：大模型使用需通过安全评估\n• 客户画像：敏感字段需脱敏处理\n\n需要查看具体条款吗？']
    },
    'plaza-2': {
      tips: ['帮我写一份数字化转型工作通知', '生成季度经营分析报告', '起草员工培训请示文件'],
      responses: ['已为您生成《关于推进数字化转型工作的通知》模板：\n\n各子公司、各部门：\n\n为深入贯彻落实集团数字化转型战略部署，加快推进太湖云AI企业智能体平台建设，现将有关事项通知如下：\n\n一、工作目标\n二、重点任务\n三、时间节点\n四、保障措施\n\n请各单位高度重视，认真落实。\n\n需要我调整内容或格式吗？']
    },
    'plaza-3': {
      tips: ['安排下周的项目评审会议', '生成季度经营分析会议议程', '会议室A下周可用时间'],
      responses: ['已为您安排下周三（6月25日）下午2:00-4:00 的项目评审会议：\n\n• 会议主题：业务协同平台二期项目评审\n• 参会人员：张经理、李主管、王工程师（已自动避开冲突日程）\n• 会议室：A305（已确认可用）\n• 议程：\n  1. 项目进度汇报（30分钟）\n  2. 技术方案评审（45分钟）\n  3. 风险评估与讨论（30分钟）\n  4. 下阶段计划确认（15分钟）\n\n是否需要发送会议邀请？']
    },
    'plaza-7': {
      tips: ['帮我整理今天的待办事项', '设置明天上午的会议提醒', '查看overdue的任务'],
      responses: ['已为您整理今日待办清单（共5项）：\n\n🔴 高优先级：\n• 10:00 参加项目评审会议\n• 14:00 提交月度报告\n\n🟡 中优先级：\n• 16:00 审批报销单（3张待审）\n\n🟢 低优先级：\n• 回复客户邮件（2封）\n• 更新项目进度\n\n是否需要设置提醒？']
    },
    'plaza-8': {
      tips: ['生成今天的晨报', '查看昨日关键业务数据', '今天有哪些重要会议'],
      responses: ['【2026年6月24日 每日晨报】\n\n📊 昨日关键数据：\n• 系统调用量：12,470次（↑23.5%）\n• 活跃用户数：342人（↑15.2%）\n• 平均响应时间：1.8秒（↓8.3%）\n\n📅 今日日程：\n• 10:00 项目评审会（A305）\n• 14:00 月度经营分析会\n• 16:00 数字化转型推进会议\n\n⚠️ 待处理提醒：3条审批待办']
    },
    'plaza-9': {
      tips: ['帮我识别这张发票', '差旅报销需要哪些附件', '检查报销单是否合规'],
      responses: ['已成功识别发票信息：\n\n• 发票类型：增值税专用发票\n• 金额：¥2,450.00\n• 开票日期：2026-06-15\n• 发票代码：3200261234\n• 发票号码：00123456\n\n✅ 合规检查通过：发票信息完整、金额合理、在有效期内。\n\n是否自动生成报销单？']
    },
    'plaza-10': {
      tips: ['审查采购合同的付款条款', '最新数据安全法对集团的影响', '生成合规审查意见书'],
      responses: ['经审查，该采购合同存在以下风险点：\n\n⚠️ 付款条款：预付款比例 50% 偏高，建议调整为 30%\n⚠️ 交付标准：验收标准模糊，建议补充量化指标\n⚠️ 违约责任：违约金比例低于行业惯例\n\n已生成修订建议书，是否发送给法务部复核？']
    },
    'plaza-13': {
      tips: ['查看太湖云AI企业智能体项目进度', '分析当前项目的风险点', '生成项目周报'],
      responses: ['《太湖云AI企业智能体平台》项目当前进度：\n\n📊 总体进度：68%（按计划推进）\n\n各阶段状态：\n• 需求分析：✅ 已完成\n• 系统设计：✅ 已完成\n• 开发实现：🔄 进行中（85%）\n• 测试上线：⏳ 待启动\n• 运营优化：⏳ 待启动\n\n⚠️ 风险预警：\n1. 开发阶段人力资源紧张（建议协调2名后端工程师）\n2. 第三方接口联调延迟3天\n\n是否需要生成详细的项目周报？']
    },
    'plaza-22': {
      tips: ['如何申请办公用品', '集团年假政策是什么', '报修流程怎么走'],
      responses: ['您好！关于办公用品申请流程：\n\n1. 登录 OA 系统 → 行政服务 → 办公用品申领\n2. 选择所需物品及数量\n3. 填写领用事由\n4. 提交部门负责人审批\n5. 审批通过后至行政处领取\n\n一般审批时长：1-2个工作日\n\n如有其他问题，欢迎继续咨询！']
    },
  };

  return responses[agentId] || {
    tips: [`${agentName}能帮我做什么`, '查询相关制度规范', '生成一份示例文档'],
    responses: [`您好，我是${agentName}！已接入太湖云AI企业智能体平台。\n\n我可以帮您：\n• 查询集团相关知识库内容\n• 生成各类办公文档\n• 提供业务咨询服务\n\n请描述您的需求，我会为您匹配最优解决方案。`]
  };
}

/** Convert PlazaAgent to Agent for chat */
function plazaToChatAgent(plazaAgent: PlazaAgent): Agent {
  const content = getAgentResponses(plazaAgent.id, plazaAgent.name);
  return {
    id: plazaAgent.id,
    name: plazaAgent.name,
    icon: plazaAgent.icon,
    avatarGradient: plazaAgent.iconBg,
    category: plazaAgent.category,
    description: plazaAgent.description,
    permission: plazaAgent.permission,
    creator: plazaAgent.creator,
    department: plazaAgent.department,
    callCount: plazaAgent.useCount,
    status: 'online',
    tips: content.tips,
    responses: content.responses,
  };
}

/** Convert MyAgent to Agent for chat */
function myAgentToChatAgent(myAgent: MyAgent): Agent {
  const content = getAgentResponses(myAgent.id, myAgent.name);
  return {
    id: myAgent.id,
    name: myAgent.name,
    icon: myAgent.icon,
    avatarGradient: myAgent.iconBg || 'linear-gradient(135deg, #3370FF 0%, #245BDB 100%)',
    category: myAgent.category || '其他',
    description: myAgent.description,
    permission: myAgent.permission,
    creator: myAgent.creator,
    department: myAgent.department,
    callCount: myAgent.callCount || 0,
    status: 'online',
    tips: content.tips,
    responses: content.responses,
  };
}

const tabs = ['全部', '收藏'] as const;
type TabType = typeof tabs[number];

// ====== Middle Panel ======

interface MessagesMiddlePanelProps {
  agents: MyAgent[];
  selectedAgentId: string;
  onSelectAgent: (id: string) => void;
  favorites: string[];
  onToggleFavorite: (agentId: string) => void;
}

const defaultKnowledgeAgentForList: Agent = {
  id: 'plaza-1',
  name: '知识问答助手',
  icon: 'BookOpen',
  avatarGradient: 'linear-gradient(135deg, #00E5FF 0%, #0099CC 100%)',
  category: '行政类',
  description: '基于企业知识库的智能问答，支持多轮对话与文档溯源',
  permission: 'group',
  creator: '数字化部',
  department: '集团',
  callCount: 5678,
  status: 'online',
  tips: [],
  responses: []
};

export function MessagesMiddlePanel({
  agents,
  selectedAgentId,
  onSelectAgent,
  favorites,
  onToggleFavorite
}: MessagesMiddlePanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('全部');
  const [plazaAgentsList, setPlazaAgentsList] = useState<PlazaAgent[]>([]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    bffService.application.listApplications({ signal: controller.signal })
      .then(result => {
        if (!cancelled) setPlazaAgentsList(result.list.map(mapApplicationToPlazaAgent));
      })
      .catch((err) => {
        if (cancelled || (err instanceof DOMException && err.name === 'AbortError')) return;
        console.error('[Messages] load plaza agents failed:', err);
        // 保留已有列表，避免单次失败导致列表被清空
      });
    return () => { cancelled = true; controller.abort(); };
  }, []);

  // Convert MyAgent[] to Agent[] for display
  const chatAgentsList: Agent[] = agents.map(myAgentToChatAgent);

  // Add favorited plaza agents that are not already in chatAgentsList
  const favoritedPlazaAgents: Agent[] = plazaAgentsList
    .filter(p => favorites.includes(p.id) && !agents.some(a => a.id === p.id))
    .map(plazaToChatAgent);

  // Build all agents list with knowledge assistant always present
  const hasKnowledgeAssistant = chatAgentsList.some(a => a.id === 'plaza-1') || 
                                favoritedPlazaAgents.some(a => a.id === 'plaza-1');
  
  let allAgents: Agent[];
  if (hasKnowledgeAssistant) {
    allAgents = [...chatAgentsList, ...favoritedPlazaAgents];
  } else {
    allAgents = [defaultKnowledgeAgentForList, ...chatAgentsList, ...favoritedPlazaAgents];
  }

  // Filter by tab
  const filteredAgents: Agent[] = activeTab === '收藏'
    ? allAgents.filter(a => favorites.includes(a.id))
    : allAgents;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="h-[52px] flex items-center justify-between px-4 border-b border-[#DEE0E3] flex-shrink-0">
        <h2 className="text-[15px] font-semibold text-[#1F2329]">对话助手</h2>
        <span className="text-[11px] text-[#8F959E]">{agents.length} 个对话</span>
      </div>

      {/* Tabs */}
      <div className="flex px-3 gap-0 border-b border-[#DEE0E3] flex-shrink-0 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2.5 text-[13px] font-medium border-b-2 transition-colors flex-shrink-0 ${
              activeTab === tab
                ? 'text-[#3370FF] border-[#3370FF]'
                : 'text-[#8F959E] border-transparent hover:text-[#1F2329]'
            }`}
          >
            {tab}
            {tab === '收藏' && favorites.length > 0 && (
              <span className="ml-1 text-[10px] text-[#F54A45]">({favorites.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Agent List */}
      <div className="flex-1 overflow-y-auto">
        {filteredAgents.length > 0 ? (
          <div className="flex flex-col">
            {filteredAgents.map((agent) => {
              const Icon = iconMap[agent.icon] || BookOpen;
              const isActive = selectedAgentId === agent.id;
              const isFav = favorites.includes(agent.id);
              return (
                <div
                  key={agent.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectAgent(agent.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectAgent(agent.id);
                    }
                  }}
                  className={`
                    flex items-start gap-3 px-4 py-3 text-left transition-all duration-150 w-full border-b border-[#F2F3F5] cursor-pointer
                    ${isActive ? 'bg-[#E8F1FF]' : 'hover:bg-[#F8F9FA]'}
                  `}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: agent.avatarGradient }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[14px] font-medium text-[#1F2329] truncate">{agent.name}</span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0"
                          style={{
                            background: agent.category === '行政类' ? '#E8F1FF' :
                              agent.category === '财务类' ? '#E6F7EF' :
                              agent.category === '商务类' ? '#FFF2E0' :
                              agent.category === '管控类' ? '#FCE5E4' :
                              agent.category === '运营类' ? '#E8F8FF' :
                              agent.category === '行业类' ? '#F0E6FF' :
                              agent.category === '客服类' ? '#E6F7EF' :
                              '#F2F3F5',
                            color: agent.category === '行政类' ? '#3370FF' :
                              agent.category === '财务类' ? '#00B96B' :
                              agent.category === '商务类' ? '#FF7D00' :
                              agent.category === '管控类' ? '#F54A45' :
                              agent.category === '运营类' ? '#1890FF' :
                              agent.category === '行业类' ? '#7B61FF' :
                              agent.category === '客服类' ? '#00CCAA' :
                              '#646A73'
                          }}
                        >
                          {agent.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); onToggleFavorite(agent.id); }}
                          className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
                            isFav ? 'text-[#FF7D00]' : 'text-[#DEE0E3] hover:text-[#FF7D00]'
                          }`}
                          title={isFav ? '取消收藏' : '收藏'}
                        >
                          <Star className={`w-4 h-4 ${isFav ? 'fill-[#FF7D00]' : ''}`} />
                        </button>
                      </div>
                    </div>
                    <p className="text-[12px] text-[#8F959E] truncate mt-0.5">{agent.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <MessageCircle className="w-10 h-10 text-[#DEE0E3] mb-3" />
            <p className="text-[13px] text-[#8F959E]">
              {activeTab === '收藏' ? '暂无收藏的智能体' : '暂无对话'}
            </p>
            <p className="text-[12px] text-[#BBBFC4] mt-1">
              {activeTab === '收藏'
                ? '在智能体列表中点击星标进行收藏'
                : '从智能体广场添加智能体后开始对话'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const defaultKnowledgeAgent: Agent = {
  id: 'plaza-1',
  name: '知识问答助手',
  icon: 'BookOpen',
  avatarGradient: 'linear-gradient(135deg, #00E5FF 0%, #0099CC 100%)',
  category: '行政类',
  description: '基于企业知识库的智能问答，支持多轮对话与文档溯源',
  permission: 'group',
  creator: '数字化部',
  department: '集团',
  callCount: 5678,
  status: 'online',
  tips: ['查询国联集团最新合规政策要求', '客户画像系统的数据标准是什么？', '业务协同平台的审批流程有哪些？'],
  responses: ['您好！我是知识问答助手，可以帮您解答关于公司制度、政策流程等方面的问题。请问有什么可以帮您的吗？']
};

// ====== Right Panel ======

interface MessagesRightPanelProps {
  agents: MyAgent[];
  agentId: string;
  favorites: string[];
  onToggleFavorite: (agentId: string) => void;
}

export function MessagesRightPanel({
  agents,
  agentId,
  favorites,
  onToggleFavorite
}: MessagesRightPanelProps) {
  // Find agent from conversation agents
  const myAgent = agents.find(a => a.id === agentId);
  const [plazaAgentsList, setPlazaAgentsList] = useState<PlazaAgent[]>([]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    bffService.application.listApplications({ signal: controller.signal })
      .then(result => {
        if (!cancelled) setPlazaAgentsList(result.list.map(mapApplicationToPlazaAgent));
      })
      .catch((err) => {
        if (cancelled || (err instanceof DOMException && err.name === 'AbortError')) return;
        console.error('[MessagesRight] load plaza agents failed:', err);
      });
    return () => { cancelled = true; controller.abort(); };
  }, []);

  const plazaAgent = plazaAgentsList.find(p => p.id === agentId);
  let agent: Agent;

  if (myAgent) {
    agent = myAgentToChatAgent(myAgent);
  } else if (plazaAgent) {
    agent = plazaToChatAgent(plazaAgent);
  } else if (agentId === 'plaza-1') {
    agent = defaultKnowledgeAgent;
  } else {
    agent = defaultKnowledgeAgent;
  }

  const Icon = iconMap[agent.icon] || BookOpen;
  const isFav = favorites.includes(agentId);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    sessions,
    currentSessionId,
    addMessage: addStoreMessage,
    createSession,
    selectSession,
    deleteSession,
    ensureSessionForAgent
  } = useConversationStore();

  // 切换智能体时，复用该智能体最近的会话，否则新建
  useEffect(() => {
    ensureSessionForAgent(agentId);
    setConversationId(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId]);

  const currentSession = sessions.find(s => s.id === currentSessionId) || null;

  const agentSessions = sessions
    .filter(s => s.agentId === agentId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  // 当前会话的消息用于本地渲染（过滤系统消息，仅保留 user/assistant）
  const messages: ChatMessage[] = useMemo(() => currentSession
    ? currentSession.messages
        .filter((msg): msg is ConversationMessage & { role: 'user' | 'assistant' } => msg.role !== 'system')
        .map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
          agentId: currentSession.agentId,
          followUpOptions: msg.metadata?.followUpOptions
        }))
    : [], [currentSession]);

  // 空会话自动添加欢迎语
  useEffect(() => {
    if (currentSession && currentSession.messages.length === 0) {
      const welcomeContent = agent.responses[0] || `您好，我是${agent.name}！${agent.description}。有什么可以帮您的吗？`;
      addStoreMessage(currentSession.id, 'assistant', welcomeContent, {
        followUpOptions: agent.tips?.slice(0, 3) || getDefaultFollowUpOptions(welcomeContent)
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSessionId, agentId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const extractAndCleanContent = (content: string): { cleanContent: string; options: string[] } => {
    let cleanContent = content;
    const options: string[] = [];
    
    cleanContent = cleanContent.replace(/【来源：.*】/g, '');
    
    cleanContent = cleanContent.replace(/###\s+.*/g, '');
    cleanContent = cleanContent.replace(/##\s+.*/g, '');
    
    cleanContent = cleanContent.replace(/\*\*\*+/g, '');
    
    cleanContent = cleanContent.replace(/^\d+\.\s*/gm, '');
    
    const followUpPattern = /^[一二三]、(.+?)(？|。|$)/gm;
    let match;
    while ((match = followUpPattern.exec(content)) !== null) {
      const option = match[1].trim();
      if (option && option.length > 5) {
        options.push(option);
      }
    }
    
    cleanContent = cleanContent.replace(/^[一二三]、\s*/gm, '');
    
    cleanContent = cleanContent.replace(/\s*\n\s*/g, '\n');
    cleanContent = cleanContent.trim();
    
    return { cleanContent, options };
  };

  const formatMessageContent = (content: string): string => {
    const { cleanContent } = extractAndCleanContent(content);
    return cleanContent.replace(/\n/g, '<br/>');
  };

  const followUpThemes: Record<string, string[]> = {
    '试用期': ['试用期的具体时长是多少？', '试用期工资待遇如何计算？', '试用期考核标准是什么？', '试用期可以提前转正吗？', '试用期内离职需要注意什么？'],
    '入职': ['入职手续需要准备哪些材料？', '入职培训安排在什么时候？', '如何申请办公设备？', '入职后如何加入公司邮箱？', '新员工导师制度是怎样的？'],
    '报销': ['报销流程是怎样的？', '报销需要哪些审批环节？', '报销的时间限制是多久？', '哪些费用可以报销？', '报销单据需要注意什么格式？'],
    '请假': ['请假需要提前多久申请？', '年假有多少天？', '病假需要提供什么证明？', '事假和病假有什么区别？', '婚假产假有什么规定？'],
    '加班': ['加班工资怎么计算？', '加班调休如何申请？', '加班有时间限制吗？', '周末加班可以调休吗？', '节假日加班有什么特殊规定？'],
    '离职': ['离职需要提前多久申请？', '离职手续包括哪些步骤？', '离职后社保如何处理？', '离职证明什么时候能拿到？', '竞业限制协议是怎样的？'],
    '合规': ['如何识别日常工作中的合规风险？', '发现违规行为应该向谁报告？', '公司有哪些培训帮助理解合规要求？', '合规检查多久进行一次？', '不合规会有什么后果？'],
    '公文写作': ['公文格式有什么要求？', '需要添加哪些附件？', '审批流程是怎样的？', '有参考模板可以借鉴吗？', '需要哪些人签字？'],
    '会议': ['需要发送会议邀请吗？', '会议时长建议多久？', '需要准备什么资料？', '有冲突的日程怎么办？', '需要预定会议室吗？'],
    '人事招聘': ['面试流程是怎样的？', '薪资范围是多少？', '需要准备哪些面试问题？', '多久能出结果？', '有什么考核环节？'],
    '培训': ['培训时长是多少？', '培训考核如何进行？', '有培训材料吗？', '可以线上学习吗？', '培训费用是多少？'],
    '审批': ['审批需要多长时间？', '审批流程有哪些环节？', '被驳回了怎么办？', '可以加急处理吗？', '需要哪些审批材料？'],
    '待办': ['如何设置优先级？', '可以设置重复提醒吗？', '完成后需要确认吗？', '如何批量处理？', '有统计功能吗？'],
    '数据分析': ['数据来源是什么？', '统计周期是多久？', '有异常预警吗？', '可以导出报告吗？', '数据更新频率是多少？'],
    '采购': ['采购流程是怎样的？', '需要哪些审批？', '预算如何申请？', '有供应商推荐吗？', '采购周期是多久？'],
    '设备': ['如何申请设备？', '设备配置标准是什么？', '维修流程是怎样的？', '可以更换设备吗？', '设备使用有什么规定？'],
    'IT支持': ['如何提交IT工单？', '响应时间是多久？', '有紧急通道吗？', '常见问题如何解决？', '可以远程协助吗？'],
    '合同': ['合同模板在哪里下载？', '审批流程是怎样的？', '需要法务审核吗？', '有哪些注意事项？', '合同期限如何确定？'],
    '报告': ['报告格式有什么要求？', '需要包含哪些内容？', '多久提交一次？', '有模板可以参考吗？', '需要哪些人审批？'],
    '预算': ['预算编制流程是怎样的？', '预算审批需要多久？', '超预算了怎么办？', '预算调整如何申请？', '预算执行如何跟踪？'],
    '项目管理': ['项目立项流程是怎样的？', '项目进度如何跟踪？', '项目风险如何管理？', '项目文档需要哪些？', '项目验收标准是什么？'],
  };

  const generalOptions = [
    '你能详细解释一下吗？',
    '还有其他需要注意的吗？',
    '这个过程需要多长时间？',
    '我需要准备什么材料？',
    '有什么风险或注意事项？',
    '如何获取更多相关信息？',
    '有相关的政策文件吗？',
    '可以举个例子吗？',
  ];

  const getDefaultFollowUpOptions = (content: string): string[] => {
    for (const [keyword, keywordOptions] of Object.entries(followUpThemes)) {
      if (content.includes(keyword)) {
        return keywordOptions.slice(0, 3);
      }
    }
    return generalOptions.slice(0, 3);
  };

  /**
   * 根据用户问题和 AI 回复生成关联的后续问题推荐
   * 优先使用 AI 回复中明确列出的「一、二、三」建议
   * 其次按用户问题关键词匹配主题库
   * 最后按 AI 回复内容兜底
   */
  const generateFollowUpOptions = (userQuestion: string, aiContent: string): string[] => {
    const { options: extractedOptions } = extractAndCleanContent(aiContent);
    if (extractedOptions.length >= 3) {
      return extractedOptions.slice(0, 3);
    }

    const combined = `${userQuestion}\n${aiContent}`;
    const matchedTheme = Object.entries(followUpThemes).find(([keyword]) =>
      combined.includes(keyword)
    );

    let themedOptions: string[] = [];
    if (matchedTheme) {
      themedOptions = matchedTheme[1];
    }

    const result = [...extractedOptions];
    for (const option of themedOptions) {
      if (!result.includes(option)) {
        result.push(option);
      }
      if (result.length >= 3) break;
    }

    if (result.length < 3) {
      for (const option of generalOptions) {
        if (!result.includes(option)) {
          result.push(option);
        }
        if (result.length >= 3) break;
      }
    }

    return result.slice(0, 3);
  };

  const handleFollowUpClick = (question: string) => {
    setInputValue(question);
    setTimeout(() => {
      const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: false });
      inputRef.current?.dispatchEvent(event);
    }, 100);
  };

  const renderFollowUpOptions = (msg: ChatMessage) => {
    const options = msg.followUpOptions || [];
    if (options.length === 0) return null;

    return (
      <div className="mt-3 space-y-2">
        <p className="text-[12px] text-[#8F959E] mb-2">继续了解：</p>
        <div className="flex flex-wrap gap-2">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleFollowUpClick(option)}
              className="px-3 py-1.5 rounded-full text-[12px] text-[#646A73] bg-[#F5F6F7] border border-[#DEE0E3] hover:border-[#3370FF] hover:text-[#3370FF] hover:bg-[#E8F1FF] transition-all duration-150 whitespace-nowrap"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || !currentSession) return;

    addStoreMessage(currentSession.id, 'user', text);
    setInputValue('');
    setIsTyping(true);

    try {
      const response: ChatResponse = await chatServiceSendMessage(
        agentId,
        agent.name,
        agent.description,
        text,
        conversationId
      );

      // BFF 返回的会话 ID 用于维持多轮对话
      if (response.conversationId) {
        setConversationId(response.conversationId);
      }

      const followUpOptions = response.followUpOptions?.length
        ? response.followUpOptions.slice(0, 3)
        : generateFollowUpOptions(text, response.content);

      addStoreMessage(currentSession.id, 'assistant', response.content, { followUpOptions });
    } catch (error) {
      console.error('Chat API error:', error);
      addStoreMessage(
        currentSession.id,
        'assistant',
        `抱歉，我暂时无法回答您的问题。错误信息：${error instanceof Error ? error.message : '未知错误'}`
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative flex flex-col flex-1 min-h-0 bg-[#F5F6F7]">
      {/* Header */}
      <div className="h-[52px] flex items-center justify-between px-5 bg-white border-b border-[#DEE0E3] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: agent.avatarGradient }}
          >
            <Icon className="w-[18px] h-[18px] text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-medium text-[#1F2329]">{agent.name}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00B96B]" />
            </div>
            <span className="text-[11px] text-[#8F959E]">基于集团知识库 · 实时响应</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* 历史会话开关 */}
          <button
            onClick={() => setShowHistory(v => !v)}
            className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${
              showHistory ? 'text-[#3370FF] bg-[#E8F1FF]' : 'text-[#646A73] hover:text-[#3370FF] hover:bg-[#F2F3F5]'
            }`}
            title={showHistory ? '关闭历史会话' : '打开历史会话'}
          >
            <History className="w-4 h-4" />
          </button>

          <button
            onClick={() => createSession(agentId)}
            className="w-7 h-7 flex items-center justify-center rounded-md text-[#3370FF] hover:bg-[#E8F1FF] transition-colors"
            title="新建对话"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            onClick={() => currentSessionId && deleteSession(currentSessionId)}
            className="w-7 h-7 flex items-center justify-center rounded-md text-[#8F959E] hover:text-[#F54A45] hover:bg-[#FFF2F0] transition-colors"
            title="删除当前对话"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onToggleFavorite(agent.id)}
            className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${
              isFav ? 'text-[#FF7D00] bg-[#FFF2E0]' : 'text-[#BBBFC4] hover:text-[#FF7D00] hover:bg-[#F2F3F5]'
            }`}
            title={isFav ? '取消收藏' : '收藏'}
          >
            <Star className={`w-4 h-4 ${isFav ? 'fill-[#FF7D00]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto min-h-0 px-5 py-5">
        <div className="flex flex-col gap-4 max-w-[800px] mx-auto">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 fade-in-up ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={msg.role === 'assistant' ? { background: agent.avatarGradient } : { background: '#3370FF' }}
              >
                {msg.role === 'assistant'
                  ? <Icon className="w-4 h-4 text-white" />
                  : <span className="text-white text-xs font-medium">张</span>
                }
              </div>
              <div className="max-w-[560px]">
                <div className={`px-4 py-3 text-[14px] leading-[1.6] rounded-lg ${
                    msg.role === 'assistant'
                      ? 'bg-white rounded-bl-sm text-[#1F2329] shadow-sm'
                      : 'bg-[#3370FF] rounded-br-sm text-white'
                  }`}
                  dangerouslySetInnerHTML={{ __html: formatMessageContent(msg.content) }}
                />
                <div className={`text-[11px] text-[#BBBFC4] mt-1 ${msg.role === 'user' ? 'text-left' : 'text-right'}`}>
                  {formatTime(msg.timestamp)}
                </div>
                {msg.role === 'assistant' && renderFollowUpOptions(msg)}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 fade-in-up">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: agent.avatarGradient }}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white rounded-lg rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#3370FF] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#3370FF] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#3370FF] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="px-5 py-3 bg-white border-t border-[#DEE0E3] flex-shrink-0">
        <div className="max-w-[800px] mx-auto">
          <div className="flex gap-1 mb-2">
            {[Paperclip, Image, Smile, BookOpenIcon].map((ToolIcon, i) => (
              <button
                key={i}
                className="w-7 h-7 flex items-center justify-center rounded-md text-[#BBBFC4] hover:text-[#1F2329] hover:bg-[#F2F3F5] transition-colors"
              >
                <ToolIcon className="w-4 h-4" />
              </button>
            ))}
            <VoiceInputButton
              size="sm"
              onResult={(text) => {
                setInputValue((prev) => (prev ? `${prev} ${text}` : text));
                inputRef.current?.focus();
              }}
            />
          </div>
          <div className="flex items-end gap-2 bg-[#F2F3F5] border border-transparent rounded-xl px-3 py-2 focus-within:border-[#3370FF] focus-within:bg-white focus-within:shadow-[0_0_0_2px_rgba(51,112,255,0.15)] transition-all duration-200">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`给 ${agent.name} 发送消息...`}
              rows={1}
              className="flex-1 bg-transparent text-[14px] text-[#1F2329] placeholder:text-[#BBBFC4] resize-none outline-none min-h-[24px] max-h-[120px] py-1"
              style={{ fieldSizing: 'content' }}
            />
            <div className="flex items-center gap-1 pb-0.5">
              <VoiceInputButton
                size="sm"
                onResult={(text) => {
                  setInputValue((prev) => (prev ? `${prev} ${text}` : text));
                  inputRef.current?.focus();
                }}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  inputValue.trim() ? 'bg-[#3370FF] text-white hover:bg-[#245BDB]' : 'bg-[#EBEBEB] text-[#BBBFC4] cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* History Drawer */}
      {showHistory && (
        <>
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 z-40"
            onClick={() => setShowHistory(false)}
          />
          {/* Drawer */}
          <div className="absolute right-0 top-0 bottom-0 w-[300px] bg-white shadow-xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="h-[52px] flex items-center justify-between px-4 border-b border-[#F2F3F5] flex-shrink-0">
              <span className="text-[15px] font-medium text-[#1F2329]">历史会话</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => createSession(agentId)}
                  className="w-7 h-7 flex items-center justify-center rounded text-[#3370FF] hover:bg-[#E8F1FF] transition-colors"
                  title="新建对话"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowHistory(false)}
                  className="w-7 h-7 flex items-center justify-center rounded text-[#8F959E] hover:text-[#1F2329] hover:bg-[#F2F3F5] transition-colors"
                  title="关闭"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              {agentSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <MessageCircle className="w-8 h-8 text-[#DEE0E3] mb-2" />
                  <p className="text-[13px] text-[#8F959E]">暂无历史会话</p>
                  <p className="text-[12px] text-[#BBBFC4] mt-1">点击 + 新建对话</p>
                </div>
              ) : (
                <div className="flex flex-col py-2">
                  {agentSessions.map(session => (
                    <div
                      key={session.id}
                      onClick={() => { selectSession(session.id); setShowHistory(false); }}
                      className={`
                        group flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors
                        ${currentSessionId === session.id ? 'bg-[#E8F1FF]' : 'hover:bg-[#F8F9FA]'}
                      `}
                    >
                      <MessageCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${currentSessionId === session.id ? 'text-[#3370FF]' : 'text-[#8F959E]'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[13px] truncate ${currentSessionId === session.id ? 'text-[#3370FF] font-medium' : 'text-[#1F2329]'}`}>
                            {session.title}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                            className="opacity-0 group-hover:opacity-100 flex-shrink-0 w-5 h-5 flex items-center justify-center rounded text-[#8F959E] hover:text-[#F54A45] hover:bg-[#FFF2F0] transition-all"
                            title="删除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-[#8F959E]">{session.messages.length} 条消息</span>
                          <span className="text-[11px] text-[#BBBFC4]">
                            {new Date(session.updatedAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}