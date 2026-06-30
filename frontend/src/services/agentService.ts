import type { Agent, MyAgent, PlazaAgent } from '@/types';

export interface AgentIconInfo {
  icon: string;
  iconBg: string;
  avatarGradient: string;
}

export interface AgentMetadata {
  id: string;
  name: string;
  icon: string;
  iconBg: string;
  avatarGradient: string;
  category: string;
  description: string;
}

const agentIconRegistry: Record<string, AgentIconInfo> = {
  'plaza-1': { icon: 'BookOpen', iconBg: 'linear-gradient(135deg, #00E5FF 0%, #0099CC 100%)', avatarGradient: 'linear-gradient(135deg, #00E5FF 0%, #0099CC 100%)' },
  'plaza-2': { icon: 'FileText', iconBg: 'linear-gradient(135deg, #FF6B6B 0%, #CC0000 100%)', avatarGradient: 'linear-gradient(135deg, #FF6B6B 0%, #CC0000 100%)' },
  'plaza-3': { icon: 'CalendarDays', iconBg: 'linear-gradient(135deg, #7B61FF 0%, #5B3FD9 100%)', avatarGradient: 'linear-gradient(135deg, #7B61FF 0%, #5B3FD9 100%)' },
  'plaza-4': { icon: 'UserPlus', iconBg: 'linear-gradient(135deg, #3370FF 0%, #245BDB 100%)', avatarGradient: 'linear-gradient(135deg, #3370FF 0%, #245BDB 100%)' },
  'plaza-5': { icon: 'GraduationCap', iconBg: 'linear-gradient(135deg, #00D68F 0%, #00A86B 100%)', avatarGradient: 'linear-gradient(135deg, #00D68F 0%, #00A86B 100%)' },
  'plaza-6': { icon: 'ClipboardCheck', iconBg: 'linear-gradient(135deg, #FFAA00 0%, #CC8800 100%)', avatarGradient: 'linear-gradient(135deg, #FFAA00 0%, #CC8800 100%)' },
  'plaza-7': { icon: 'ListTodo', iconBg: 'linear-gradient(135deg, #FF69B4 0%, #CC188B 100%)', avatarGradient: 'linear-gradient(135deg, #FF69B4 0%, #CC188B 100%)' },
  'plaza-8': { icon: 'BarChart3', iconBg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', avatarGradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' },
  'plaza-9': { icon: 'Receipt', iconBg: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', avatarGradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' },
  'plaza-10': { icon: 'ShoppingCart', iconBg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', avatarGradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' },
  'plaza-11': { icon: 'Monitor', iconBg: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)', avatarGradient: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)' },
  'plaza-12': { icon: 'Wrench', iconBg: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)', avatarGradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)' },
  'plaza-13': { icon: 'ShieldCheck', iconBg: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', avatarGradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' },
  'plaza-14': { icon: 'FileCheck', iconBg: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', avatarGradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' },
  'my-data': { icon: 'BarChart3', iconBg: 'linear-gradient(135deg, #00CCAA 0%, #006666 100%)', avatarGradient: 'linear-gradient(135deg, #00CCAA 0%, #006666 100%)' },
  'my-official': { icon: 'FileText', iconBg: 'linear-gradient(135deg, #FF6B6B 0%, #CC0000 100%)', avatarGradient: 'linear-gradient(135deg, #FF6B6B 0%, #CC0000 100%)' },
  'my-code': { icon: 'Code2', iconBg: 'linear-gradient(135deg, #CC66FF 0%, #6600CC 100%)', avatarGradient: 'linear-gradient(135deg, #CC66FF 0%, #6600CC 100%)' },
  'my-synergy': { icon: 'GitBranch', iconBg: 'linear-gradient(135deg, #FFAA00 0%, #CC6600 100%)', avatarGradient: 'linear-gradient(135deg, #FFAA00 0%, #CC6600 100%)' },
};

export function getAgentIconInfo(agentId: string): AgentIconInfo {
  return agentIconRegistry[agentId] || {
    icon: 'HelpCircle',
    iconBg: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
    avatarGradient: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
  };
}

export function getAgentMetadata(agentId: string): AgentMetadata | null {
  const iconInfo = getAgentIconInfo(agentId);
  const metadataMap: Record<string, Omit<AgentMetadata, 'icon' | 'iconBg' | 'avatarGradient'>> = {
    'plaza-1': { id: 'plaza-1', name: '知识问答助手', category: '行政类', description: '基于企业知识库的智能问答，支持多轮对话与文档溯源' },
    'plaza-2': { id: 'plaza-2', name: '公文写作助手', category: '行政类', description: '一键生成通知、报告、请示、纪要等行政公文' },
    'plaza-3': { id: 'plaza-3', name: '会议智能助手', category: '行政类', description: '智能安排会议、生成议程、提取要点与待办' },
    'plaza-4': { id: 'plaza-4', name: '人事招聘助手', category: '行政类', description: '简历筛选、面试安排、人才画像与评估' },
    'plaza-5': { id: 'plaza-5', name: '员工培训助手', category: '行政类', description: '课程推荐、学习路径规划、考核评估与证书管理' },
    'plaza-6': { id: 'plaza-6', name: '流程审批助手', category: '行政类', description: '发起审批、跟踪流程、催办提醒与状态查询' },
    'plaza-7': { id: 'plaza-7', name: '智能待办助手', category: '行政类', description: '待办管理、优先级排序、到期提醒与统计分析' },
    'plaza-8': { id: 'plaza-8', name: '每日晨报助手', category: '数据分析', description: '自动生成每日晨报、数据汇总与关键指标分析' },
    'plaza-9': { id: 'plaza-9', name: '智能报销助手', category: '财务类', description: '报销指导、凭证整理、合规检查与进度跟踪' },
    'plaza-10': { id: 'plaza-10', name: '采购管理助手', category: '采购类', description: '采购申请、供应商管理、合同跟踪与验收' },
    'plaza-11': { id: 'plaza-11', name: '资产设备助手', category: '资产管理', description: '设备管理、维修保养、资产盘点与报废处置' },
    'plaza-12': { id: 'plaza-12', name: 'IT技术支持助手', category: '技术支持', description: '系统问题排查、软件安装、网络故障处理' },
    'plaza-13': { id: 'plaza-13', name: '合规风控助手', category: '合规类', description: '风险识别、合规检查、制度解读与培训' },
    'plaza-14': { id: 'plaza-14', name: '合同管理助手', category: '法务类', description: '合同起草、审核跟踪、履约提醒与归档' },
  };

  const metadata = metadataMap[agentId];
  if (!metadata) return null;

  return {
    ...metadata,
    ...iconInfo,
  };
}

export function normalizeAgentForPlaza(agent: Agent): PlazaAgent {
  const iconInfo = getAgentIconInfo(agent.id);
  return {
    id: agent.id,
    name: agent.name,
    icon: iconInfo.icon,
    iconBg: iconInfo.iconBg,
    category: agent.category,
    description: agent.description,
    fullDescription: agent.description,
    tags: [agent.category],
    useCount: agent.callCount,
    creator: agent.creator,
    department: agent.department,
    rating: 4.8,
    reviewCount: Math.floor(agent.callCount / 100),
    capabilities: agent.tips || [],
    permission: agent.permission,
  };
}

export function normalizeAgentForMyAgents(agent: Agent): MyAgent {
  const iconInfo = getAgentIconInfo(agent.id);
  return {
    id: agent.id,
    name: agent.name,
    icon: iconInfo.icon,
    iconBg: iconInfo.iconBg,
    description: agent.description,
    permission: agent.permission,
    creator: agent.creator,
    department: agent.department,
    createdAt: new Date().toISOString(),
    callCount: agent.callCount,
  };
}

export function normalizeAgentForChat(agent: PlazaAgent | MyAgent): Agent {
  const iconInfo = getAgentIconInfo(agent.id);
  return {
    id: agent.id,
    name: agent.name,
    icon: iconInfo.icon,
    avatarGradient: iconInfo.avatarGradient,
    category: 'unknown',
    description: agent.description,
    permission: agent.permission,
    creator: agent.creator || 'unknown',
    department: agent.department || 'unknown',
    callCount: 'useCount' in agent ? agent.useCount : agent.callCount,
    status: 'online',
    tips: [],
    responses: [],
  };
}

export function registerCustomAgent(agentId: string, iconInfo: Partial<AgentIconInfo>): void {
  const existing = agentIconRegistry[agentId] || {
    icon: 'HelpCircle',
    iconBg: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
    avatarGradient: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
  };
  agentIconRegistry[agentId] = { ...existing, ...iconInfo };
}

export function updateAgentIcon(agentId: string, icon: string, iconBg: string): void {
  if (agentIconRegistry[agentId]) {
    agentIconRegistry[agentId] = {
      ...agentIconRegistry[agentId],
      icon,
      iconBg,
      avatarGradient: iconBg,
    };
  }
}

export function getAllRegisteredAgentIds(): string[] {
  return Object.keys(agentIconRegistry);
}

export function isAgentRegistered(agentId: string): boolean {
  return agentId in agentIconRegistry;
}
