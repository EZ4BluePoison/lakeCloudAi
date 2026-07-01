import { useState } from 'react';
import {
  BarChart3, FileText, Code2, GitBranch,
  Bot, MessageCircle, Minus, Trash2, TrendingUp, Clock, Star,
  Sparkles, Check, User
} from 'lucide-react';
import type { MyAgent } from '@/types';
import { plazaAgents } from '@/data/agents';

const iconMap: Record<string, React.ElementType> = {
  BarChart3, FileText, Code2, GitBranch
};

function getCategoryColor(cat: string) {
  const map: Record<string, string> = {
    '行政类': '#3370FF',
    '财务类': '#00B96B',
    '商务类': '#FF7D00',
    '管控类': '#F54A45',
    '运营类': '#1890FF',
    '行业类': '#7B61FF',
    '客服类': '#00CCAA',
  };
  return map[cat] || '#8F959E';
}

export function MyAgentsListPanel({
  agents,
  selectedAgentId,
  onSelect,
  onRemove,
  onStartChat,
  onGoToPlaza,
}: {
  agents: MyAgent[];
  selectedAgentId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onStartChat: (id: string) => void;
  onGoToPlaza: () => void;
}) {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="h-[52px] flex items-center justify-between px-4 border-b border-[#DEE0E3] flex-shrink-0">
        <h2 className="text-[15px] font-semibold text-[#1F2329]">我的智能体</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onGoToPlaza}
            className="px-2.5 py-1 rounded-md text-[11px] font-medium text-[#3370FF] bg-[#E8F1FF] hover:bg-[#D0E0FF] transition-colors"
          >
            去广场添加
          </button>
          <span className="text-[11px] text-[#8F959E]">{agents.length} 个智能体</span>
        </div>
      </div>

      {/* Agent List */}
      <div className="flex-1 overflow-y-auto">
        {agents.length > 0 ? (
          <div className="flex flex-col">
            {agents.map((agent) => {
              const Icon = iconMap[agent.icon] || BarChart3;
              const isSelected = selectedAgentId === agent.id;
              return (
                <div
                  key={agent.id}
                  onClick={() => onSelect(agent.id)}
                  className={`flex items-center gap-3 px-4 py-3 border-b border-[#F2F3F5] cursor-pointer transition-colors group ${
                    isSelected ? 'bg-[#E8F1FF]' : 'hover:bg-[#F8F9FA]'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: agent.iconBg }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[14px] font-medium text-[#1F2329] truncate block">{agent.name}</span>
                    <p className="text-[12px] text-[#8F959E] truncate">{agent.description}</p>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={() => onStartChat(agent.id)}
                      className="w-7 h-7 flex items-center justify-center rounded text-[#8F959E] hover:text-[#3370FF] hover:bg-[#E8F1FF] transition-colors"
                      title="开始对话"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRemove(agent.id)}
                      className="w-7 h-7 flex items-center justify-center rounded text-[#8F959E] hover:text-[#F54A45] hover:bg-red-50 transition-colors"
                      title="移除"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <Bot className="w-10 h-10 text-[#DEE0E3] mb-3" />
            <p className="text-[13px] text-[#8F959E]">暂无已添加的智能体</p>
            <p className="text-[11px] text-[#BBBFC4] mt-1">从智能体广场中添加智能体到此处</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function AddedAgentDetailPanel({
  agent,
  onStartChat,
  onRemove,
}: {
  agent: MyAgent;
  onStartChat: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const Icon = iconMap[agent.icon] || BarChart3;
  // Find matching plaza agent for richer data
  const plazaAgent = plazaAgents.find(p => p.id === agent.id);

  // Simulated usage data (generated once per agent)
  const [todayCalls] = useState(() => Math.floor(Math.random() * 50) + 10);
  const [totalCalls] = useState(() => agent.callCount || Math.floor(Math.random() * 5000) + 1000);
  const [avgResponse] = useState(() => (Math.random() * 2 + 0.5).toFixed(1));
  const [satisfaction] = useState(() => (Math.random() * 1 + 4).toFixed(1));

  // Simulated recent activity
  const recentActivities = [
    { time: '10:23', action: '回答用户问题', detail: '查询集团最新差旅报销政策', status: 'success' },
    { time: '09:45', action: '生成文档', detail: '生成《月度工作汇报》模板', status: 'success' },
    { time: '09:12', action: '知识检索', detail: '检索"数字化转型"相关制度', status: 'success' },
    { time: '昨天 18:30', action: '智能推荐', detail: '为用户推荐相关培训资料', status: 'success' },
    { time: '昨天 16:20', action: '数据分析', detail: '分析Q3各部门费用数据', status: 'success' },
  ];

  // Simulated conversation preview
  const conversationPreview = [
    { role: 'user' as const, content: '帮我查一下最新的差旅报销标准' },
    { role: 'assistant' as const, content: '根据集团2026年最新差旅管理办法，报销标准如下：\n\n• 飞机：经济舱，限800元/程\n• 高铁：二等座，据实报销\n• 住宿：一线城市400元/晚，其他城市300元/晚\n• 餐补：100元/天\n\n需要我帮您生成差旅申请单吗？' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F5F6F7]">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 bg-white border-b border-[#DEE0E3] flex-shrink-0">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: agent.iconBg }}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-[16px] font-semibold text-[#1F2329]">{agent.name}</h2>
            {plazaAgent && (
              <span
                className="text-[11px] px-2 py-0.5 rounded font-medium"
                style={{
                  background: `${getCategoryColor(plazaAgent.category)}15`,
                  color: getCategoryColor(plazaAgent.category),
                }}
              >
                {plazaAgent.category}
              </span>
            )}
          </div>
          <p className="text-[13px] text-[#8F959E] truncate">{agent.description}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onStartChat(agent.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium text-white bg-[#3370FF] hover:bg-[#245BDB] transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            开始对话
          </button>
          <button
            onClick={() => onRemove(agent.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium text-[#F54A45] bg-red-50 hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            移除
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[900px] mx-auto space-y-6">

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: '今日调用', value: `${todayCalls}次`, trend: '+12%', color: '#3370FF', icon: BarChart3 },
              { label: '累计调用', value: `${totalCalls.toLocaleString()}次`, trend: '+8.5%', color: '#00B96B', icon: TrendingUp },
              { label: '平均响应', value: `${avgResponse}s`, trend: '-0.3s', color: '#FF7D00', icon: Clock },
              { label: '满意度', value: satisfaction, trend: '98%', color: '#7B61FF', icon: Star },
            ].map((card, i) => {
              const CardIcon = card.icon;
              return (
                <div key={i} className="bg-white rounded-xl p-4 border border-[#DEE0E3]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${card.color}15` }}>
                      <CardIcon className="w-3.5 h-3.5" style={{ color: card.color }} />
                    </div>
                    <span className="text-[11px] text-[#8F959E]">{card.label}</span>
                  </div>
                  <div className="text-[22px] font-bold text-[#1F2329] leading-none">{card.value}</div>
                  <div className="text-[11px] text-[#00B96B] mt-1">{card.trend}</div>
                </div>
              );
            })}
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-2 gap-4">
            {/* Conversation Preview */}
            <div className="bg-white rounded-xl border border-[#DEE0E3] p-5">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-4 h-4 text-[#3370FF]" />
                <h3 className="text-[14px] font-semibold text-[#1F2329]">对话示例</h3>
              </div>
              <div className="space-y-3">
                {conversationPreview.map((msg, i) => (
                  <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-medium ${
                      msg.role === 'user' ? 'bg-[#3370FF] text-white' : 'bg-[#E8F1FF] text-[#3370FF]'
                    }`}>
                      {msg.role === 'user' ? '张' : 'AI'}
                    </div>
                    <div className={`max-w-[280px] px-3 py-2 rounded-lg text-[13px] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#3370FF] text-white rounded-br-sm'
                        : 'bg-[#F2F3F5] text-[#1F2329] rounded-bl-sm'
                    }`}>
                      {msg.content.split('\n').map((line, j) => (
                        <span key={j}>{line}<br /></span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Capabilities */}
            <div className="bg-white rounded-xl border border-[#DEE0E3] p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-[#FF7D00]" />
                <h3 className="text-[14px] font-semibold text-[#1F2329]">核心能力</h3>
              </div>
              {plazaAgent ? (
                <div className="space-y-2">
                  {plazaAgent.capabilities.map((cap, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#E6F7EF] flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-[#00B96B]" />
                      </div>
                      <span className="text-[13px] text-[#1F2329]">{cap}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-[#8F959E]">该智能体暂无详细能力描述</p>
              )}

              {/* Tags */}
              {plazaAgent && (
                <div className="mt-4 pt-4 border-t border-[#F2F3F5]">
                  <div className="flex flex-wrap gap-1.5">
                    {plazaAgent.tags.map((tag, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-[#F2F3F5] text-[#646A73]">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-[#DEE0E3] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-[#00B96B]" />
              <h3 className="text-[14px] font-semibold text-[#1F2329]">最近使用记录</h3>
            </div>
            <div className="space-y-0">
              {recentActivities.map((act, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-[#F2F3F5] last:border-0">
                  <div className="w-8 h-8 rounded-full bg-[#E8F1FF] flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-[#3370FF]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-[#1F2329]">{act.action}</span>
                      <span className="text-[11px] text-[#BBBFC4]">{act.time}</span>
                    </div>
                    <p className="text-[12px] text-[#8F959E] truncate">{act.detail}</p>
                  </div>
                  <span className="text-[11px] text-[#00B96B] bg-[#E6F7EF] px-2 py-0.5 rounded font-medium flex-shrink-0">成功</span>
                </div>
              ))}
            </div>
          </div>

          {/* Creator Info */}
          <div className="bg-white rounded-xl border border-[#DEE0E3] p-5">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-[#8F959E]" />
              <h3 className="text-[14px] font-semibold text-[#1F2329]">智能体信息</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 text-[13px]">
              <div>
                <span className="text-[#8F959E]">创建者：</span>
                <span className="text-[#1F2329]">{agent.creator}</span>
              </div>
              <div>
                <span className="text-[#8F959E]">所属部门：</span>
                <span className="text-[#1F2329]">{agent.department}</span>
              </div>
              <div>
                <span className="text-[#8F959E]">创建时间：</span>
                <span className="text-[#1F2329]">{agent.createdAt}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#F2F3F5] flex items-center gap-4 text-[13px]">
              <div>
                <span className="text-[#8F959E]">权限：</span>
                <span className="font-medium">{agent.permission === 'group' ? '集团级' : agent.permission === 'dept' ? '部门级' : '个人级'}</span>
              </div>
              <div>
                <span className="text-[#8F959E]">累计调用：</span>
                <span className="text-[#3370FF] font-medium">{(agent.callCount || 0).toLocaleString()} 次</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}