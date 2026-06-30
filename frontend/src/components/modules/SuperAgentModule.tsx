import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Search, Cloud, User, ArrowLeft,
  BookOpen, FileText, CalendarDays, Receipt,
  Scale, FolderKanban, Headphones, MonitorCog
} from 'lucide-react';
import type { ChatPanelMessage as ChatMessage } from '@/types';
import { sendMessage, sendMessageToAgent, type RoutedAgent } from '@/services/superAgentService';

// ====== Main Component ======

type Stage = 'home' | 'chat';

export default function SuperAgentModule() {
  const [stage, setStage] = useState<Stage>('home');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [activeAgent, setActiveAgent] = useState<RoutedAgent | null>(null);
  const [followUpOptions, setFollowUpOptions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const handleSend = useCallback(async (overrideText?: string) => {
    const text = (overrideText ?? inputValue).trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
      agentId: activeAgent?.agentId || 'super',
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    setStage('chat');

    try {
      if (!activeAgent) {
        // 首次输入：先识别意图，再固定助手
        const result = await sendMessage(text, conversationId);
        setConversationId(result.conversationId);
        setActiveAgent(result.route);

        const routeMsg: ChatMessage = {
          id: `msg-${Date.now()}-route`,
          role: 'assistant',
          content: `🤖 已为您匹配「${result.route.agentName}」（${result.route.category}），接下来由该助手继续为您服务。`,
          timestamp: new Date(),
          agentId: result.route.agentId,
        };
        const aiMsg: ChatMessage = {
          id: result.messageId || `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: result.content,
          timestamp: new Date(),
          agentId: result.route.agentId,
        };
        setMessages(prev => [...prev, routeMsg, aiMsg]);
        setFollowUpOptions(result.followUpOptions || []);
      } else {
        // 已进入对话：固定助手，不再重新识别
        const result = await sendMessageToAgent(activeAgent, text, conversationId);
        setConversationId(result.conversationId);

        const aiMsg: ChatMessage = {
          id: result.messageId || `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: result.content,
          timestamp: new Date(),
          agentId: activeAgent.agentId,
        };
        setMessages(prev => [...prev, aiMsg]);
        setFollowUpOptions(result.followUpOptions || []);
      }
    } catch (error) {
      const errorText = error instanceof Error ? error.message : '请求失败，请稍后重试';
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `抱歉，超级助手处理失败：${errorText}`,
        timestamp: new Date(),
        agentId: activeAgent?.agentId || 'super',
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, isTyping, conversationId, activeAgent]);

  const handleFollowUpClick = useCallback((question: string) => {
    setInputValue(question);
    handleSend(question);
  }, [handleSend]);

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

  const clearSession = () => {
    setStage('home');
    setMessages([]);
    setConversationId(undefined);
    setActiveAgent(null);
    setFollowUpOptions([]);
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="flex items-center justify-between px-6 h-[52px] border-b border-[#DEE0E3] flex-shrink-0 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3370FF 0%, #00E5FF 100%)' }}>
            <Cloud className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-semibold text-[#1F2329]">超级助手</span>
            {activeAgent && (
              <span className="text-[11px] text-[#8F959E]">当前助手：{activeAgent.agentName}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeAgent && (
            <button
              onClick={clearSession}
              className="text-[12px] text-[#3370FF] hover:text-[#245BDB] px-2 py-1 rounded hover:bg-[#E8F1FF] transition-colors"
            >
              切换助手
            </button>
          )}
          <span className="text-[11px] text-[#8F959E] bg-[#E8F1FF] px-2 py-1 rounded-full">智能路由</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {stage === 'home' ? (
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
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || isTyping}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-0.5 transition-all duration-200 ${
                    inputValue.trim() && !isTyping
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
                onClick={clearSession}
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

                {/* Follow-up questions */}
                {!isTyping && followUpOptions.length > 0 && (
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 opacity-0" />
                    <div className="max-w-[600px]">
                      <div className="text-[12px] text-[#8F959E] mb-2">您可能还想问：</div>
                      <div className="flex flex-wrap gap-2">
                        {followUpOptions.map((question, idx) => (
                          <button
                            key={`${question}-${idx}`}
                            onClick={() => handleFollowUpClick(question)}
                            disabled={isTyping}
                            className="px-3 py-1.5 rounded-full text-[12px] bg-white border border-[#DEE0E3] text-[#646A73] hover:border-[#3370FF] hover:text-[#3370FF] hover:bg-[#F5F9FF] transition-all text-left"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

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
                    onClick={() => handleSend()}
                    disabled={!inputValue.trim() || isTyping}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all mb-0.5 ${
                      inputValue.trim() && !isTyping
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
