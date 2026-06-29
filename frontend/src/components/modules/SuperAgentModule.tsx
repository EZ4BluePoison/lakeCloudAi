import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Search, Cloud, User, ArrowLeft,
  BookOpen, FileText, CalendarDays, Receipt,
  Scale, FolderKanban, Headphones, MonitorCog
} from 'lucide-react';
import type { ChatPanelMessage as ChatMessage } from '@/types';

/** Route user query to the best matching agent category */
function routeQuery(query: string): { agentId: string; agentName: string; category: string } {
  const q = query.toLowerCase();

  // 行政类关键词
  if (/公文|通知|报告|请示|纪要|文件|写作|文档|稿件/.test(q)) {
    return { agentId: 'plaza-2', agentName: '公文写作助手', category: '行政类' };
  }
  if (/会议|议程|排期|会议室|日程|安排/.test(q)) {
    return { agentId: 'plaza-3', agentName: '会议智能助手', category: '行政类' };
  }
  if (/招聘|简历|面试|人事|员工|入职|离职|绩效/.test(q)) {
    return { agentId: 'plaza-4', agentName: '人事招聘助手', category: '行政类' };
  }
  if (/培训|学习|课程|考试|考核|技能|发展/.test(q)) {
    return { agentId: 'plaza-5', agentName: '员工培训助手', category: '行政类' };
  }
  if (/审批|流程|申请|OA|签报|用印|请假|出差/.test(q)) {
    return { agentId: 'plaza-6', agentName: '流程审批助手', category: '行政类' };
  }
  if (/待办|任务|todo|清单|提醒|催办/.test(q)) {
    return { agentId: 'plaza-7', agentName: '智能待办助手', category: '行政类' };
  }
  if (/晨报|日报|早报|摘要|概览|今天.*安排/.test(q)) {
    return { agentId: 'plaza-8', agentName: '每日晨报助手', category: '行政类' };
  }

  // 财务类关键词
  if (/报销|发票|差旅|费用|财务|预算|付款|收款|会计|审计/.test(q)) {
    return { agentId: 'plaza-9', agentName: '智能报销助手', category: '财务类' };
  }

  // 商务类关键词
  if (/合同.*生成|生成.*合同|起草.*合同|合同.*模板/.test(q)) {
    return { agentId: 'plaza-11', agentName: '合同生成助手', category: '商务类' };
  }
  if (/合同|合规|法务|法律|风险|条款|协议/.test(q)) {
    return { agentId: 'plaza-10', agentName: '合同合规助手', category: '商务类' };
  }
  if (/售前|方案|投标|报价|客户|商务|销售/.test(q)) {
    return { agentId: 'plaza-12', agentName: '售前方案助手', category: '商务类' };
  }

  // 管控类关键词
  if (/项目|进度|风险|管理|计划|里程碑|PM/.test(q)) {
    return { agentId: 'plaza-13', agentName: '项目管理助手', category: '管控类' };
  }
  if (/安全|生产|隐患|事故|检修/.test(q)) {
    return { agentId: 'plaza-14', agentName: '安全生产助手', category: '管控类' };
  }

  // 运营类关键词
  if (/膳食|餐饮|食堂|菜品|用餐|食物|午餐|晚餐|订餐/.test(q)) {
    return { agentId: 'plaza-16', agentName: '智能膳食助手', category: '运营类' };
  }
  if (/物业|报修|水电|房租|设施|环境|保洁/.test(q)) {
    return { agentId: 'plaza-15', agentName: '物业语音助手', category: '运营类' };
  }
  if (/IT|运维|网络|服务器|故障|系统|电脑|软件/.test(q)) {
    return { agentId: 'plaza-17', agentName: 'IT运维助手', category: '运营类' };
  }

  // 市政类关键词
  if (/积水|防汛|天气|水位|隧道|桥下/.test(q)) {
    return { agentId: 'plaza-18', agentName: '积水识别助手', category: '市政类' };
  }
  if (/设备.*维护|维护.*设备|保养|维修|机器/.test(q)) {
    return { agentId: 'plaza-19', agentName: '设备维护助手', category: '市政类' };
  }

  // 金融类关键词
  if (/营收|利润|业绩|经营|指标|数据查询|业务数据/.test(q)) {
    return { agentId: 'plaza-20', agentName: '前台问数助手', category: '金融类' };
  }
  if (/资产负债|投资回报|财务分析|深度分析|ROI/.test(q)) {
    return { agentId: 'plaza-21', agentName: '后台问数助手', category: '金融类' };
  }

  // 客服类关键词
  if (/客服|咨询|投诉|建议|反馈|帮助|服务/.test(q)) {
    return { agentId: 'plaza-22', agentName: '在线客服助手', category: '客服类' };
  }

  // Default: 知识问答助手
  return { agentId: 'plaza-1', agentName: '知识问答助手', category: '行政类' };
}

/** Generate a contextual response based on the query */
function generateResponse(query: string, agentName: string, category: string): string {
  const q = query.toLowerCase();

  // 报销相关
  if (agentName === '智能报销助手') {
    if (/标准|额度|多少/.test(q)) {
      return '根据集团2026年差旅报销标准：\n\n✈️ **交通**：经济舱限800元/程，高铁二等座据实报销\n🏨 **住宿**：一线城市400元/晚，其他城市300元/晚\n🍱 **餐补**：100元/天\n🚕 **市内交通**：80元/天\n\n需要我帮您生成差旅申请单或报销单吗？';
    }
    return '您好！我是智能报销助手，可以帮您：\n\n• 🧾 识别发票信息\n• 📋 智能填报报销单\n• ✅ 合规规则校验\n• 📎 自动匹配附件要求\n• 📊 报销进度追踪\n\n请描述您的报销需求，或上传发票图片。';
  }

  // 公文相关
  if (agentName === '公文写作助手') {
    return '您好！我是公文写作助手，支持以下文体：\n\n• 📄 **通知** — 事项通知、会议通知、任免通知\n• 📊 **报告** — 工作报告、调研报告、总结报告\n• 📝 **请示** — 事项请示、经费请示\n• 📋 **纪要** — 会议纪要、座谈纪要\n• 📨 **函件** — 商洽函、答复函\n\n请告诉我您需要写什么类型的公文，以及主要内容要点。';
  }

  // 会议相关
  if (agentName === '会议智能助手') {
    return '您好！我可以帮您全程管理会议：\n\n• 📅 **智能排期** — 自动避开参会人冲突\n• 📝 **议程生成** — 根据主题生成结构化议程\n• 🎤 **纪要提取** — 实时转录并提取要点\n• ✅ **待办追踪** — 自动提取待办事项\n• 📍 **会议室预定** — 查看并预定可用会议室\n\n请告诉我会议主题和参会人员，我立即为您安排。';
  }

  // 项目管理
  if (agentName === '项目管理助手') {
    return '您好！我是项目管理助手，当前能力包括：\n\n• 📊 进度自动跟踪\n• ⚠️ 风险智能预警\n• 🧑‍💻 资源优化调配\n• 📈 甘特图自动生成\n• 📑 项目报告一键生成\n\n请告诉我您关注的项目，我可以为您生成进度报告或分析风险点。';
  }

  // IT运维
  if (agentName === 'IT运维助手') {
    return '您好！IT运维助手已就绪，我可以帮您：\n\n• 🔍 故障智能诊断\n• 🤖 自动化运维脚本执行\n• 📊 告警智能分析\n• 📈 性能趋势预测\n• 📚 知识库自动匹配解决方案\n\n请描述您遇到的IT问题，我会快速定位并提供解决方案。';
  }

  // 合同合规
  if (agentName === '合同合规助手') {
    return '您好！我是合同合规助手，可以为您提供：\n\n• 📋 合同条款合规审查\n• ⚠️ 风险点自动识别\n• ⚖️ 法规智能匹配\n• 📝 审查意见生成\n• 📊 历史合同对比分析\n\n请上传合同文件或描述需要审查的内容，我立即为您分析。';
  }

  // 知识问答 (default)
  return `您好！我是${agentName}，已理解您的问题「${query}」。\n\n根据您的提问内容，我已为您匹配到 **${category}** 的「${agentName}」。\n\n您可以进一步描述具体需求，例如：\n• 补充更多背景信息\n• 明确您需要的输出格式\n• 提供相关数据或文件\n\n我将为您生成专业、准确的回答。`;
}

// ====== Main Component ======

export default function SuperAgentModule() {
  const [hasSearched, setHasSearched] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text) return;

    // Route query to best agent
    const route = routeQuery(text);

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
      agentId: 'super',
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    setHasSearched(true);

    // Simulate AI response
    setTimeout(() => {
      const response = generateResponse(text, route.agentName, route.category);
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `> 🤖 已为您匹配「${route.agentName}」（${route.category}）\n\n${response}`,
        timestamp: new Date(),
        agentId: route.agentId,
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  }, [inputValue]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  // Quick start categories
  const quickCategories = [
    { label: '知识问答', color: '#3370FF', icon: BookOpen },
    { label: '公文写作', color: '#FF6B6B', icon: FileText },
    { label: '差旅报销', color: '#00B96B', icon: Receipt },
    { label: '会议安排', color: '#7B61FF', icon: CalendarDays },
    { label: '合同合规', color: '#FF7D00', icon: Scale },
    { label: '项目管理', color: '#CC66FF', icon: FolderKanban },
    { label: 'IT运维', color: '#1890FF', icon: MonitorCog },
    { label: '在线客服', color: '#00CCAA', icon: Headphones },
  ];

  const handleQuickClick = (label: string) => {
    setInputValue(label);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="flex items-center justify-between px-6 h-[52px] border-b border-[#DEE0E3] flex-shrink-0 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3370FF 0%, #00E5FF 100%)' }}>
            <Cloud className="w-4 h-4 text-white" />
          </div>
          <span className="text-[15px] font-semibold text-[#1F2329]">超级助手</span>
        </div>
        <span className="text-[11px] text-[#8F959E] bg-[#E8F1FF] px-2 py-1 rounded-full">智能路由</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!hasSearched ? (
          /* ====== Search Home (Baidu style) ====== */
          <div className="flex flex-col items-center justify-center min-h-full px-4 -mt-10">
            {/* Large Logo */}
            <div className="mb-8 flex flex-col items-center">
              <img
                src="/logo-taihu.png"
                alt="太湖云AI企业智能体"
                className="w-28 h-28 object-contain mb-4 drop-shadow-lg"
              />
              <h1 className="text-[24px] font-bold text-[#1F2329] tracking-tight">太湖云 AI 超级助手</h1>
              <p className="text-[13px] text-[#8F959E] mt-2">输入您的问题，智能匹配最优助手为您解答</p>
            </div>

            {/* Search Box */}
            <div className="w-full max-w-[640px]">
              <div className="flex items-end gap-2 bg-white border border-[#DEE0E3] rounded-2xl px-5 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.08)] focus-within:border-[#3370FF] focus-within:shadow-[0_2px_16px_rgba(51,112,255,0.15)] transition-all duration-300">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="请输入您的问题，例如：查询差旅报销标准..."
                  rows={1}
                  className="flex-1 bg-transparent text-[15px] text-[#1F2329] placeholder:text-[#BBBFC4] resize-none outline-none min-h-[28px] max-h-[120px] py-1 leading-relaxed"
                  style={{ fieldSizing: 'content' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-0.5 transition-all duration-200 ${
                    inputValue.trim()
                      ? 'bg-[#3370FF] text-white hover:bg-[#245BDB] shadow-md'
                      : 'bg-[#F2F3F5] text-[#BBBFC4]'
                  }`}
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Category Buttons */}
              <div className="flex flex-wrap justify-center gap-2 mt-5">
                {quickCategories.map((cat) => {
                  const CatIcon = cat.icon;
                  return (
                    <button
                      key={cat.label}
                      onClick={() => handleQuickClick(cat.label)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] text-[#646A73] bg-[#F5F6F7] hover:bg-white hover:shadow-sm hover:border-[#DEE0E3] border border-transparent transition-all duration-150"
                    >
                      <CatIcon className="w-3.5 h-3.5" style={{ color: cat.color }} />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tips */}
            <div className="mt-10 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-[12px] text-[#BBBFC4]">
                <Cloud className="w-3.5 h-3.5" />
                <span>试试这样问</span>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  '查询集团差旅报销标准',
                  '帮我生成一份会议纪要',
                  '分析项目当前的风险点',
                  '审查这份合同的风险条款',
                ].map((tip) => (
                  <button
                    key={tip}
                    onClick={() => handleQuickClick(tip)}
                    className="px-3 py-1.5 rounded-lg text-[12px] text-[#8F959E] bg-[#F8F9FA] hover:bg-[#E8F1FF] hover:text-[#3370FF] transition-all"
                  >
                    {tip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ====== Chat Interface ====== */
          <div className="flex flex-col h-full">
            {/* Back to search */}
            <div className="flex items-center gap-2 px-6 py-3 border-b border-[#F2F3F5]">
              <button
                onClick={() => { setHasSearched(false); setMessages([]); }}
                className="flex items-center gap-1 text-[13px] text-[#8F959E] hover:text-[#3370FF] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                返回搜索
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="max-w-[800px] mx-auto flex flex-col gap-5">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={msg.role === 'assistant'
                        ? { background: 'linear-gradient(135deg, #3370FF 0%, #00E5FF 100%)' }
                        : { background: '#3370FF' }
                      }
                    >
                      {msg.role === 'assistant'
                        ? <Cloud className="w-4 h-4 text-white" />
                        : <User className="w-4 h-4 text-white" />
                      }
                    </div>

                    {/* Bubble */}
                    <div className="max-w-[600px]">
                      <div
                        className={`px-4 py-3 text-[14px] leading-[1.7] rounded-2xl whitespace-pre-wrap ${
                          msg.role === 'assistant'
                            ? 'bg-[#F5F6F7] rounded-tl-sm text-[#1F2329]'
                            : 'bg-[#3370FF] rounded-tr-sm text-white'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <div className={`text-[11px] text-[#BBBFC4] mt-1 ${msg.role === 'user' ? 'text-left' : 'text-right'}`}>
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing */}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #3370FF 0%, #00E5FF 100%)' }}>
                      <Cloud className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-[#F5F6F7] rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex gap-1.5">
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

            {/* Input */}
            <div className="px-4 py-3 bg-white border-t border-[#DEE0E3]">
              <div className="max-w-[800px] mx-auto">
                <div className="flex items-end gap-2 bg-[#F5F6F7] rounded-2xl px-4 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#3370FF]/20 transition-all border border-transparent focus-within:border-[#DEE0E3]">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="继续输入您的问题..."
                    rows={1}
                    className="flex-1 bg-transparent text-[14px] text-[#1F2329] placeholder:text-[#BBBFC4] resize-none outline-none min-h-[24px] max-h-[100px] py-1"
                    style={{ fieldSizing: 'content' }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all mb-0.5 ${
                      inputValue.trim()
                        ? 'bg-[#3370FF] text-white hover:bg-[#245BDB]'
                        : 'bg-[#EBEBEB] text-[#BBBFC4]'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
