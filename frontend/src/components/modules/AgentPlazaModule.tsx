import { useState } from 'react';
import {
  Search, Star, Download, X, Plus, PenTool, PieChart, Code2, Scale, StickyNote, Users, Presentation, BookOpen,
  Check, Bot, ScanEye, Receipt, CalendarDays, UserPlus, GraduationCap, FileBarChart, TrendingUp,
  MonitorCog, Headphones, FolderKanban, Flame, Sparkles,
  CheckSquare, Sunrise, UtensilsCrossed, Home, Database, Shield, Wrench,
  FileText, ClipboardCheck, ListTodo
} from 'lucide-react';
import { sceneCategories, plazaAgents } from '@/data/agents';
import type { PlazaAgent, MyAgent } from '@/types';

const iconMap: Record<string, React.ElementType> = {
  PenTool, PieChart, Code2, Scale, StickyNote, Users, Presentation, BookOpen, ScanEye, Receipt,
  CalendarDays, UserPlus, GraduationCap, FileBarChart, TrendingUp, MonitorCog, Headphones, FolderKanban,
  CheckSquare, Sunrise, UtensilsCrossed, Home, Database, Shield, Wrench, FileText, ClipboardCheck, ListTodo
};

interface AgentPlazaModuleProps {
  favorites: string[];
  onToggleFavorite: (agentId: string) => void;
  onAddAgent: (agent: MyAgent) => void;
}

/** Convert PlazaAgent to MyAgent */
function plazaToMyAgent(p: PlazaAgent): MyAgent {
  return {
    id: p.id,
    name: p.name,
    icon: p.icon,
    iconBg: p.iconBg,
    description: p.description,
    permission: p.permission,
    creator: p.creator,
    department: p.department,
    createdAt: new Date().toISOString().slice(0, 10),
    callCount: p.useCount,
  };
}

export default function AgentPlazaModule({ favorites, onToggleFavorite, onAddAgent }: AgentPlazaModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');
  const [selectedAgent, setSelectedAgent] = useState<PlazaAgent | null>(null);
  const [addSuccessOpen, setAddSuccessOpen] = useState(false);
  const [addedAgentName, setAddedAgentName] = useState('');
  const [plazaAgentsList] = useState<PlazaAgent[]>(plazaAgents);

  const handleAdd = (plazaAgent: PlazaAgent) => {
    onAddAgent(plazaToMyAgent(plazaAgent));
    setAddedAgentName(plazaAgent.name);
    setAddSuccessOpen(true);
    setSelectedAgent(null);
  };

  const filtered = plazaAgentsList.filter(agent => {
    const matchesSearch = !searchQuery || agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === '全部' || agent.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#F5F6F7] relative">
      {/* Header */}
      <div className="h-[52px] flex items-center justify-between px-6 bg-white border-b border-[#DEE0E3] flex-shrink-0">
        <h1 className="text-[20px] font-semibold text-[#1F2329]">智能体广场</h1>
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex items-center gap-2 bg-[#F2F3F5] rounded-lg px-3 py-2 w-[360px] focus-within:ring-2 focus-within:ring-[#3370FF]/20 focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-[#BBBFC4] flex-shrink-0" />
            <input
              type="text"
              placeholder="搜索智能体..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-[13px] text-[#1F2329] placeholder:text-[#BBBFC4] outline-none"
            />
          </div>
        </div>
      </div>

      {/* ===== Popular Recommendations ===== */}
      <div className="px-6 py-4 bg-white flex-shrink-0">
        <h2 className="text-[16px] font-semibold text-[#1F2329] mb-3">人气推荐</h2>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {[...plazaAgentsList]
            .sort((a, b) => b.useCount - a.useCount)
            .slice(0, 5)
            .map((agent, idx) => {
              const Icon = iconMap[agent.icon] || Bot;
              const rankBg = idx === 0 ? 'bg-[#F54A45]' : idx === 1 ? 'bg-[#FF7D00]' : idx === 2 ? 'bg-[#FFC000]' : 'bg-[#DEE0E3]';
              const isHot = idx < 3;
              return (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className="flex-shrink-0 w-[148px] bg-white rounded-xl border border-[#EBEBEB] hover:border-[#3370FF]/30 hover:shadow-md transition-all duration-200 p-3 text-left group relative"
                >
                  {/* Rank badge - top left */}
                  <span className={`absolute top-0 left-0 ${rankBg} text-white text-[10px] font-bold w-5 h-5 rounded-tl-xl rounded-br-lg flex items-center justify-center z-10`}>
                    {idx + 1}
                  </span>
                  {/* Tag - top right */}
                  <span className={`absolute top-1.5 right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium z-10 ${
                    isHot ? 'bg-[#FFF2E0] text-[#FF7D00]' : 'bg-[#E8F1FF] text-[#3370FF]'
                  }`}>
                    {isHot ? <Flame className="w-2.5 h-2.5" /> : <Sparkles className="w-2.5 h-2.5" />}
                    {isHot ? '热' : '新'}
                  </span>
                  {/* Icon */}
                  <div className="flex items-center justify-center mt-3 mb-2">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: agent.iconBg }}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  {/* Name */}
                  <p className="text-[13px] font-semibold text-[#1F2329] text-center truncate">{agent.name}</p>
                  {/* Description */}
                  <p className="text-[11px] text-[#8F959E] text-center truncate mt-0.5">{agent.description}</p>
                </button>
              );
            })}
        </div>
      </div>

      {/* Category Tabs - scrollable */}
      <div className="flex px-6 gap-0 bg-white border-b border-[#DEE0E3] flex-shrink-0 overflow-x-auto scrollbar-hide">
        {sceneCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-3 text-[13px] font-medium border-b-2 transition-colors flex-shrink-0 ${
              activeCategory === cat
                ? 'text-[#3370FF] border-[#3370FF]'
                : 'text-[#8F959E] border-transparent hover:text-[#1F2329]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Agent Grid - flex-1 min-h-0 is critical for scroll to work in nested flex */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {filtered.map((agent) => {
            const Icon = iconMap[agent.icon] || Bot;
            const isFav = favorites.includes(agent.id);
            return (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className="bg-white rounded-xl p-5 border border-[#DEE0E3] text-left transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-[#3370FF]/30 group relative"
              >
                {/* Favorite button on card */}
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(agent.id); }}
                  className={`absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full transition-all z-10 ${
                    isFav
                      ? 'text-[#FF7D00] bg-[#FFF2E0]'
                      : 'text-[#DEE0E3] bg-[#F2F3F5] opacity-0 group-hover:opacity-100 hover:text-[#FF7D00]'
                  }`}
                  title={isFav ? '取消收藏' : '收藏'}
                >
                  <Star className={`w-4 h-4 ${isFav ? 'fill-[#FF7D00]' : ''}`} />
                </button>
                

                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: agent.iconBg }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-semibold text-[#1F2329]">{agent.name}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 text-[#FF7D00] fill-[#FF7D00]" />
                      <span className="text-[12px] text-[#8F959E]">{agent.rating}</span>
                      <span className="text-[12px] text-[#BBBFC4]">({agent.reviewCount})</span>
                    </div>
                  </div>
                </div>

                <p className="text-[13px] text-[#646A73] line-clamp-2 mb-3 leading-relaxed">{agent.description}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {agent.tags.map((tag, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-[#F2F3F5] text-[#646A73]">{tag}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#F2F3F5]">
                  <span className="text-[11px] text-[#BBBFC4]">{agent.useCount.toLocaleString()} 次使用</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAdd(agent); }}
                    className="flex items-center gap-1 text-[12px] font-medium text-[#3370FF] bg-[#E8F1FF] px-3 py-1 rounded-md hover:bg-[#D0E0FF] transition-colors"
                  >
                    <Plus className="w-3 h-3" />添加使用
                  </button>
                </div>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <Search className="w-12 h-12 text-[#DEE0E3] mb-4" />
            <p className="text-[#BBBFC4] text-[14px]">未找到匹配的智能体</p>
          </div>
        )}
      </div>

      {/* Agent Detail Slide-over */}
      {selectedAgent && (
        <>
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 z-40"
            onClick={() => setSelectedAgent(null)}
          />
          {/* Panel */}
          <div className="absolute right-0 top-0 bottom-0 w-[480px] bg-white border-l border-[#DEE0E3] shadow-xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="h-[52px] flex items-center justify-between px-5 border-b border-[#DEE0E3] flex-shrink-0">
              <button
                onClick={() => setSelectedAgent(null)}
                className="w-7 h-7 flex items-center justify-center rounded-md text-[#8F959E] hover:text-[#1F2329] hover:bg-[#F2F3F5] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              {/* Add to my agents button */}
              <button
                onClick={() => handleAdd(selectedAgent)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium text-[#3370FF] bg-[#E8F1FF] hover:bg-[#D0E0FF] transition-colors"
              >
                <Plus className="w-4 h-4" />添加使用
              </button>
              {/* Favorite button in detail header */}
              <button
                onClick={() => onToggleFavorite(selectedAgent.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                  favorites.includes(selectedAgent.id)
                    ? 'text-[#FF7D00] bg-[#FFF2E0]'
                    : 'text-[#646A73] bg-[#F2F3F5] hover:text-[#FF7D00] hover:bg-[#FFF2E0]'
                }`}
              >
                <Star className={`w-4 h-4 ${favorites.includes(selectedAgent.id) ? 'fill-[#FF7D00]' : ''}`} />
                {favorites.includes(selectedAgent.id) ? '已收藏' : '收藏'}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Hero */}
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: selectedAgent.iconBg }}
                  >
                    {(() => {
                      const Icon = iconMap[selectedAgent.icon] || Bot;
                      return <Icon className="w-8 h-8 text-white" />;
                    })()}
                  </div>
                  <div>
                    <h2 className="text-[20px] font-semibold text-[#1F2329]">{selectedAgent.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[12px] text-[#8F959E]">{selectedAgent.creator} · {selectedAgent.department}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3.5 h-3.5 text-[#FF7D00] fill-[#FF7D00]" />
                      <span className="text-[13px] text-[#1F2329] font-medium">{selectedAgent.rating}</span>
                      <span className="text-[12px] text-[#BBBFC4]">({selectedAgent.reviewCount} 条评价)</span>
                    </div>
                  </div>
                </div>

                <p className="text-[14px] text-[#646A73] leading-relaxed mb-4">{selectedAgent.fullDescription}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {selectedAgent.tags.map((tag, i) => (
                    <span key={i} className="text-[11px] px-2 py-1 rounded-md bg-[#F2F3F5] text-[#646A73]">{tag}</span>
                  ))}
                </div>

                {/* Capabilities */}
                <div className="mb-6">
                  <h3 className="text-[14px] font-semibold text-[#1F2329] mb-3">核心能力</h3>
                  <div className="space-y-2">
                    {selectedAgent.capabilities.map((cap, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-[#E6F7EF] flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-[#00B96B]" />
                        </div>
                        <span className="text-[13px] text-[#1F2329]">{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-[#F2F3F5] rounded-lg p-4">
                    <div className="text-[24px] font-bold text-[#3370FF]">{selectedAgent.useCount.toLocaleString()}</div>
                    <div className="text-[12px] text-[#8F959E] mt-1">累计使用次数</div>
                  </div>
                  <div className="bg-[#F2F3F5] rounded-lg p-4">
                    <div className="text-[24px] font-bold text-[#3370FF]">{selectedAgent.rating}</div>
                    <div className="text-[12px] text-[#8F959E] mt-1">用户评分</div>
                  </div>
                </div>

                {/* Reviews */}
                <div className="mb-6">
                  <h3 className="text-[14px] font-semibold text-[#1F2329] mb-3">用户评价</h3>
                  <div className="space-y-3">
                    {[
                      { user: '张经理', dept: '数字化部', rating: 5, content: '非常实用的工具，大大提高了工作效率！', date: '2026-06-15' },
                      { user: '李主管', dept: '财务部', rating: 5, content: '功能强大，推荐给大家使用。', date: '2026-06-14' },
                      { user: '王工程师', dept: '技术部', rating: 4, content: '整体不错，希望后续能增加更多自定义功能。', date: '2026-06-13' },
                    ].map((review, i) => (
                      <div key={i} className="bg-[#F8F9FA] rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#3370FF] flex items-center justify-center text-[10px] text-white font-bold">
                              {review.user[0]}
                            </div>
                            <span className="text-[12px] text-[#1F2329] font-medium">{review.user}</span>
                            <span className="text-[11px] text-[#BBBFC4]">{review.dept}</span>
                          </div>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, j) => (
                              <Star key={j} className={`w-3 h-3 ${j < review.rating ? 'text-[#FF7D00] fill-[#FF7D00]' : 'text-[#DEE0E3]'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-[12px] text-[#646A73]">{review.content}</p>
                        <span className="text-[11px] text-[#BBBFC4] mt-1 block">{review.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer CTA */}
            <div className="p-4 border-t border-[#DEE0E3] flex-shrink-0 flex gap-2">
              <button
                onClick={() => handleAdd(selectedAgent)}
                className="flex-1 py-3 rounded-xl text-[14px] font-semibold text-[#3370FF] bg-[#E8F1FF] hover:bg-[#D0E0FF] transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                添加使用
              </button>
              <button className="flex-1 py-3 rounded-xl text-[14px] font-semibold text-white bg-[#3370FF] hover:bg-[#245BDB] transition-colors flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                获取使用
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add Success Toast */}
      {addSuccessOpen && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-lg shadow-lg border border-[#DEE0E3]">
            <div className="w-5 h-5 rounded-full bg-[#E6F7EF] flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 text-[#00B96B]" />
            </div>
            <span className="text-[13px] text-[#1F2329] font-medium">
              「{addedAgentName}」已添加到我的智能体
            </span>
            <button
              onClick={() => setAddSuccessOpen(false)}
              className="w-5 h-5 flex items-center justify-center rounded text-[#BBBFC4] hover:text-[#646A73] ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
