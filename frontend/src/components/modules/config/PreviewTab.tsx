import { useState, useEffect, useRef } from 'react';
import { Eye, Send, Plus, Trash2, MessageSquare, Loader2 } from 'lucide-react';
import type { AgentConfig } from '@/types';
import { useConversationStore } from '@/store/conversationStore';

interface PreviewTabProps {
  config: AgentConfig;
}

export function PreviewTab({ config }: PreviewTabProps) {
  const [input, setInput] = useState('');
  const [localMessages, setLocalMessages] = useState<any[]>([
    { role: 'assistant', content: '你好！我是知识问答助手，很高兴为您服务。请问有什么关于集团制度或业务流程的问题吗？' }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    sessions,
    currentSessionId,
    isLoading,
    createSession,
    selectSession,
    deleteSession,
    sendMessage,
    getCurrentSession
  } = useConversationStore();
  
  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages, isLoading]);
  
  // 当会话切换时更新本地消息
  useEffect(() => {
    const session = getCurrentSession();
    if (session && session.messages.length > 0) {
      setLocalMessages(session.messages.map(m => ({
        role: m.role,
        content: m.content
      })));
    } else {
      setLocalMessages([
        { role: 'assistant', content: '你好！我是知识问答助手，很高兴为您服务。请问有什么关于集团制度或业务流程的问题吗？' }
      ]);
    }
  }, [currentSessionId, sessions]);
  
  // 获取系统提示词
  const getSystemPrompt = () => {
    const systemPrompt = config.prompts.find(p => p.type === 'system');
    return systemPrompt ? systemPrompt.content : '暂无系统提示词';
  };
  
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userContent = input;
    setInput('');
    
    // 先添加用户消息到本地显示
    setLocalMessages(prev => [...prev, { role: 'user', content: userContent }]);
    
    // 如果没有会话，创建一个
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = createSession(config.agentId, '知识问答 - ' + new Date().toLocaleDateString());
    }
    
    // 发送消息
    try {
      await sendMessage(sessionId, userContent, config.llmConfig);
      
      // 更新本地消息
      const updatedSession = getCurrentSession();
      if (updatedSession) {
        setLocalMessages(updatedSession.messages.map(m => ({
          role: m.role,
          content: m.content
        })));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setLocalMessages(prev => [...prev, {
        role: 'assistant',
        content: '抱歉，发生了一些问题，请稍后重试。'
      }]);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="w-5 h-5 text-[#3370FF]" />
        <h2 className="text-[15px] font-semibold text-[#1F2329]">实时预览</h2>
      </div>

      <div className="grid grid-cols-12 gap-6" style={{ height: '600px' }}>
        {/* 历史会话侧边栏 */}
        <div className="col-span-3 bg-white rounded-xl border border-[#DEE0E3] overflow-hidden flex flex-col">
          <div className="p-3 border-b border-[#DEE0E3] flex items-center justify-between">
            <span className="text-sm font-medium text-[#1F2329]">对话历史</span>
            <button
              onClick={() => {
                createSession(config.agentId, '知识问答 - ' + new Date().toLocaleDateString());
                setLocalMessages([
                  { role: 'assistant', content: '你好！我是知识问答助手，很高兴为您服务。请问有什么关于集团制度或业务流程的问题吗？' }
                ]);
              }}
              className="p-1.5 rounded-md text-[#646A73] hover:bg-[#F2F3F5] transition-colors"
              title="新建对话"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {sessions.filter(s => s.agentId === config.agentId).map(session => (
              <button
                key={session.id}
                onClick={() => selectSession(session.id)}
                className={`w-full text-left p-3 rounded-lg mb-1 transition-all flex items-center justify-between group ${
                  currentSessionId === session.id
                    ? 'bg-[#E8F1FF] text-[#3370FF]'
                    : 'hover:bg-[#F8F9FA] text-[#646A73]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm truncate">{session.title}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                  className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-[#FDEDEC] hover:text-[#F54A45] transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </button>
            ))}
            
            {sessions.filter(s => s.agentId === config.agentId).length === 0 && (
              <div className="text-center text-sm text-[#8F959E] py-8">
                还没有对话记录
              </div>
            )}
          </div>
        </div>
        
        {/* 对话主区域 */}
        <div className="col-span-9 bg-white rounded-xl border border-[#DEE0E3] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#DEE0E3] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: config.iconBg }}>
              <span className="text-white font-bold">{config.name[0]}</span>
            </div>
            <div>
              <div className="text-[14px] font-semibold text-[#1F2329]">{config.name}</div>
              <div className="text-[12px] text-[#8F959E]">
                当前模型: {config.llmConfig.provider} / {config.llmConfig.model}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {localMessages.map((message, idx) => (
              <div key={idx} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-[#3370FF] text-white' 
                    : 'bg-[#F2F3F5] text-[#1F2329]'
                }`}>
                  <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#F2F3F5] text-[#1F2329] px-4 py-3 rounded-lg flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">正在思考中...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-[#DEE0E3]">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="测试你的智能体，按 Enter 发送... (Shift + Enter 换行)"
                rows={1}
                disabled={isLoading}
                className="flex-1 px-3 py-2 rounded-md border border-[#DEE0E3] text-[13px] text-[#1F2329] focus:outline-none focus:ring-2 focus:ring-[#3370FF]/20 focus:border-[#3370FF] transition-all resize-none"
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="px-4 py-2 rounded-md bg-[#3370FF] text-white hover:bg-[#245BDB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                发送
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 配置信息 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-[#DEE0E3] p-6">
          <h3 className="text-[14px] font-semibold text-[#1F2329] mb-4">配置摘要</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[13px] text-[#646A73]">模型</span>
              <span className="text-[13px] text-[#1F2329] font-medium">{config.llmConfig.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[13px] text-[#646A73]">温度</span>
              <span className="text-[13px] text-[#1F2329]">{config.llmConfig.temperature}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[13px] text-[#646A73]">提示词</span>
              <span className="text-[13px] text-[#1F2329]">{config.prompts.length} 个</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[13px] text-[#646A73]">知识源</span>
              <span className="text-[13px] text-[#1F2329]">{config.knowledgeSources.length} 个</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[13px] text-[#646A73]">引用来源</span>
              <span className="text-[13px] text-[#1F2329]">{config.behavior.enableCitation ? '已启用' : '已禁用'}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-[#DEE0E3] p-6">
          <h3 className="text-[14px] font-semibold text-[#1F2329] mb-4">系统提示词</h3>
          <div className="bg-[#F8F9FA] rounded-lg p-3">
            <p className="text-xs text-[#646A73] leading-relaxed font-mono">
              {getSystemPrompt()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
