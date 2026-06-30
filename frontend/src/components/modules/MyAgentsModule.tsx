import { useState } from 'react';
import {
  BarChart3, FileText, Code2, GitBranch, Trash2, BarChart2, Pencil,
  TrendingUp, TrendingDown, Users, Clock, Star, Download, ChevronLeft,
  MousePointer2, Hand, Plus, Undo2, Redo2, Play,
  Sparkles, Database, Flag, User, X,
  Bot, Wand2, MessageSquare, Search, PenTool, Scale, Receipt,
  MessageCircle, Minus, Check
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Background, BackgroundVariant, ReactFlow, addEdge, applyEdgeChanges, applyNodeChanges, Handle, Position, type Connection, type Edge, type EdgeChange, type Node, type NodeChange, type NodeTypes } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { PermissionLevel, MyAgent } from '@/types';
import { agentStats, departmentUsage, dailyUsage } from '@/data/agents';

const iconMap: Record<string, React.ElementType> = {
  BarChart3, FileText, Code2, GitBranch
};

const permissionColors: Record<PermissionLevel, { bg: string; text: string; label: string }> = {
  group: { bg: 'bg-red-50', text: 'text-red-500', label: '集团级' },
  dept: { bg: 'bg-orange-50', text: 'text-orange-500', label: '部门级' },
  personal: { bg: 'bg-green-50', text: 'text-green-500', label: '个人级' }
};

const pieColors = ['#3370FF', '#00B96B', '#FF7D00', '#7B61FF', '#F54A45'];

// ====== Dify-style Workflow Editor Components ======

function StartNode({ data }: { data: { label: string } }) {
  return (
    <div
      className="w-[200px] bg-white rounded-[10px] shadow-[0_2px_8px_rgba(31,35,41,0.08)] overflow-hidden relative"
    >
      {/* Left colored bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#3370FF] rounded-l-[10px]" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-[#3370FF] !border-2 !border-white" style={{ bottom: -6 }} />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-[#3370FF] !border-2 !border-white" style={{ right: -6 }} />

      {/* Node label above */}
      <div className="px-3 pt-2 pb-0.5">
        <span className="text-[10px] text-[#BBBFC4] font-medium">{data.label}</span>
      </div>
      {/* Content */}
      <div className="flex items-center gap-2.5 px-3 pb-3 pl-[14px]">
        <div className="w-7 h-7 rounded-lg bg-[#E8F1FF] flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-[#3370FF]" />
        </div>
        <span className="text-[13px] font-medium text-[#1F2329]">用户输入</span>
      </div>
    </div>
  );
}

function LLMNode({ data, selected }: { data: { label: string; model?: string }; selected?: boolean }) {
  return (
    <div
      className={`w-[220px] bg-white rounded-[10px] overflow-hidden relative transition-shadow duration-200 ${
        selected ? 'shadow-[0_0_0_2px_#3370FF,0_4px_16px_rgba(51,112,255,0.15)]' : 'shadow-[0_2px_8px_rgba(31,35,41,0.08)] hover:shadow-[0_4px_12px_rgba(31,35,41,0.12)]'
      }`}
    >
      {/* Left colored bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#3370FF] rounded-l-[10px]" />

      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-[#3370FF] !border-2 !border-white" style={{ top: -6 }} />
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-[#3370FF] !border-2 !border-white" style={{ left: -6 }} />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-[#3370FF] !border-2 !border-white" style={{ bottom: -6 }} />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-[#3370FF] !border-2 !border-white" style={{ right: -6 }} />

      {/* Node label above */}
      <div className="px-3 pt-2 pb-0.5">
        <span className="text-[10px] text-[#BBBFC4] font-medium">LLM</span>
      </div>
      {/* Content */}
      <div className="flex items-center gap-2.5 px-3 pb-1 pl-[14px]">
        <div className="w-7 h-7 rounded-lg bg-[#E8F1FF] flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-[#3370FF]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium text-[#1F2329] truncate">{data.label}</div>
        </div>
      </div>
      {/* Model subtitle */}
      <div className="px-3 pb-3 pl-[14px]">
        <span className="text-[11px] text-[#8F959E]">{data.model || 'GPT-4'}</span>
      </div>
    </div>
  );
}

function KnowledgeNode({ data, selected }: { data: { label: string; knowledgeBase?: string }; selected?: boolean }) {
  return (
    <div
      className={`w-[220px] bg-white rounded-[10px] overflow-hidden relative transition-shadow duration-200 ${
        selected ? 'shadow-[0_0_0_2px_#00B96B,0_4px_16px_rgba(0,185,107,0.15)]' : 'shadow-[0_2px_8px_rgba(31,35,41,0.08)] hover:shadow-[0_4px_12px_rgba(31,35,41,0.12)]'
      }`}
    >
      {/* Left colored bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#00B96B] rounded-l-[10px]" />

      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-[#00B96B] !border-2 !border-white" style={{ top: -6 }} />
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-[#00B96B] !border-2 !border-white" style={{ left: -6 }} />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-[#00B96B] !border-2 !border-white" style={{ bottom: -6 }} />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-[#00B96B] !border-2 !border-white" style={{ right: -6 }} />

      {/* Node label above */}
      <div className="px-3 pt-2 pb-0.5">
        <span className="text-[10px] text-[#BBBFC4] font-medium">知识检索</span>
      </div>
      {/* Content */}
      <div className="flex items-center gap-2.5 px-3 pb-1 pl-[14px]">
        <div className="w-7 h-7 rounded-lg bg-[#E6F7EF] flex items-center justify-center flex-shrink-0">
          <Database className="w-4 h-4 text-[#00B96B]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium text-[#1F2329] truncate">{data.label}</div>
        </div>
      </div>
      {/* Knowledge base subtitle */}
      <div className="px-3 pb-3 pl-[14px]">
        <span className="text-[11px] text-[#8F959E]">{data.knowledgeBase || '集团知识库'}</span>
      </div>
    </div>
  );
}

function EndNode({ data, selected }: { data: { label: string }; selected?: boolean }) {
  return (
    <div
      className={`w-[200px] bg-white rounded-[10px] overflow-hidden relative transition-shadow duration-200 ${
        selected ? 'shadow-[0_0_0_2px_#F54A45,0_4px_16px_rgba(245,74,69,0.15)]' : 'shadow-[0_2px_8px_rgba(31,35,41,0.08)] hover:shadow-[0_4px_12px_rgba(31,35,41,0.12)]'
      }`}
    >
      {/* Left colored bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#F54A45] rounded-l-[10px]" />

      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-[#F54A45] !border-2 !border-white" style={{ top: -6 }} />
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-[#F54A45] !border-2 !border-white" style={{ left: -6 }} />

      {/* Node label above */}
      <div className="px-3 pt-2 pb-0.5">
        <span className="text-[10px] text-[#BBBFC4] font-medium">结束</span>
      </div>
      {/* Content */}
      <div className="flex items-center gap-2.5 px-3 pb-3 pl-[14px]">
        <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
          <Flag className="w-4 h-4 text-[#F54A45]" />
        </div>
        <span className="text-[13px] font-medium text-[#1F2329]">{data.label}</span>
      </div>
    </div>
  );
}

const nodeTypes: NodeTypes = {
  start: StartNode,
  llm: LLMNode,
  knowledge: KnowledgeNode,
  end: EndNode,
};

const initialNodes: Node[] = [
  { id: '1', type: 'start', position: { x: 300, y: 40 }, data: { label: '开始' } },
  { id: '2', type: 'llm', position: { x: 200, y: 200 }, data: { label: '意图识别', model: 'GPT-4' } },
  { id: '3', type: 'knowledge', position: { x: 480, y: 200 }, data: { label: '知识检索', knowledgeBase: '集团制度库' } },
  { id: '4', type: 'llm', position: { x: 340, y: 380 }, data: { label: '答案生成', model: 'GPT-4' } },
  { id: '5', type: 'end', position: { x: 340, y: 540 }, data: { label: '结束' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#3370FF', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed', color: '#3370FF', width: 12, height: 12 } },
  { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#3370FF', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed', color: '#3370FF', width: 12, height: 12 } },
  { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: '#3370FF', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed', color: '#3370FF', width: 12, height: 12 } },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#00B96B', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed', color: '#00B96B', width: 12, height: 12 } },
  { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: '#3370FF', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed', color: '#3370FF', width: 12, height: 12 } },
];

// ====== My Agents List Panel (from plaza) ======

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

// ====== Workbench Middle Panel ======

export function WorkbenchMiddlePanel({
  agents,
  selectedAgentId,
  onSelectAgent,
  onViewStats,
  onEditWorkflow,
  onDeleteAgent,
  onCreateAgent,
}: {
  agents: MyAgent[];
  selectedAgentId: string | null;
  onSelectAgent: (id: string) => void;
  onViewStats: (id: string) => void;
  onEditWorkflow: (id: string) => void;
  onDeleteAgent: (id: string) => void;
  onCreateAgent: (agent: MyAgent) => void;
}) {
  const [permFilter, setPermFilter] = useState<PermissionLevel | 'all'>('all');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const filtered = permFilter === 'all' ? agents : agents.filter(a => a.permission === permFilter);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="h-[52px] flex items-center justify-between px-4 border-b border-[#DEE0E3] flex-shrink-0">
        <h2 className="text-[15px] font-semibold text-[#1F2329]">工作台</h2>
        <button
          onClick={() => setCreateDialogOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium text-white bg-[#3370FF] hover:bg-[#245BDB] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          新建智能体
        </button>
      </div>

      {/* Permission Filter - scrollable */}
      <div className="flex gap-1.5 p-3 flex-shrink-0 overflow-x-auto scrollbar-hide">
        {([['all', '全部'], ['group', '集团级'], ['dept', '部门级'], ['personal', '个人级']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setPermFilter(key)}
            className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all duration-150 flex-shrink-0 ${
              permFilter === key
                ? 'bg-[#3370FF] text-white'
                : 'bg-[#F2F3F5] text-[#646A73] hover:text-[#1F2329]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Agent List */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col">
          {filtered.map((agent) => {
            const Icon = iconMap[agent.icon] || BarChart3;
            const perm = permissionColors[agent.permission];
            const isActive = selectedAgentId === agent.id;
            const showMenu = menuOpen === agent.id;

            return (
              <div key={agent.id} className="relative border-b border-[#F2F3F5]">
                <button
                  onClick={() => {
                    onSelectAgent(agent.id);
                    setMenuOpen(showMenu ? null : agent.id);
                  }}
                  className={`
                    w-full flex items-start gap-3 px-4 py-3 text-left transition-all duration-150
                    ${isActive ? 'bg-[#E8F1FF]' : 'hover:bg-[#F8F9FA]'}
                  `}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: agent.iconBg }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-medium text-[#1F2329] truncate">{agent.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${perm.bg} ${perm.text}`}>
                        {perm.label}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#8F959E] truncate mt-0.5">{agent.description}</p>
                    <span className="text-[11px] text-[#BBBFC4] mt-1 block">创建于 {agent.createdAt}</span>
                  </div>
                </button>

                {/* Context Menu */}
                {showMenu && (
                  <div className="mx-4 mb-2 bg-white border border-[#DEE0E3] rounded-lg overflow-hidden shadow-lg">
                    <button
                      onClick={() => { onViewStats(agent.id); setMenuOpen(null); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-[#646A73] hover:text-[#1F2329] hover:bg-[#F2F3F5] transition-colors"
                    >
                      <BarChart2 className="w-4 h-4" />
                      查看使用情况
                    </button>
                    <button
                      onClick={() => { onEditWorkflow(agent.id); setMenuOpen(null); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-[#646A73] hover:text-[#1F2329] hover:bg-[#F2F3F5] transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                      编辑工作流
                    </button>
                    <button
                      onClick={() => { onDeleteAgent(agent.id); setMenuOpen(null); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-[#F54A45] hover:text-[#F54A45] hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      删除
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Agent Dialog */}
      <CreateAgentDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onConfirm={(agent) => {
          onCreateAgent(agent);
          setCreateDialogOpen(false);
        }}
      />
    </div>
  );
}

// ====== Create Agent Dialog ======

const iconOptions = [
  { key: 'BarChart3', Icon: BarChart3, color: 'from-[#00CCAA] to-[#006666]' },
  { key: 'FileText', Icon: FileText, color: 'from-[#FF6B6B] to-[#CC0000]' },
  { key: 'Code2', Icon: Code2, color: 'from-[#CC66FF] to-[#6600CC]' },
  { key: 'GitBranch', Icon: GitBranch, color: 'from-[#FFAA00] to-[#CC6600]' },
  { key: 'Bot', Icon: Bot, color: 'from-[#3370FF] to-[#245BDB]' },
  { key: 'Wand2', Icon: Wand2, color: 'from-[#F54A45] to-[#D93A35]' },
  { key: 'MessageSquare', Icon: MessageSquare, color: 'from-[#00B96B] to-[#008F52]' },
  { key: 'Search', Icon: Search, color: 'from-[#7B61FF] to-[#5A3FD4]' },
  { key: 'PenTool', Icon: PenTool, color: 'from-[#FF7D00] to-[#CC6400]' },
  { key: 'Scale', Icon: Scale, color: 'from-[#13C2C2] to-[#0E9999]' },
];

function CreateAgentDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (agent: MyAgent) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permission, setPermission] = useState<PermissionLevel>('personal');
  const [selectedIconIdx, setSelectedIconIdx] = useState(0);
  const [category, setCategory] = useState('办公');

  const handleSubmit = () => {
    if (!name.trim()) return;
    const iconOpt = iconOptions[selectedIconIdx];
    const newAgent: MyAgent = {
      id: `my-${Date.now()}`,
      name: name.trim(),
      icon: iconOpt.key,
      iconBg: `linear-gradient(135deg, ${iconOpt.color.replace('from-[', '').replace(']', '').replace(' to-[', ' 0%, ').replace(']', ' 100%')})`,
      description: description.trim() || '暂无描述',
      permission,
      creator: '张经理',
      department: '数字化部',
      createdAt: new Date().toISOString().slice(0, 10),
      callCount: 0,
    };
    onConfirm(newAgent);
    // Reset form
    setName('');
    setDescription('');
    setPermission('personal');
    setSelectedIconIdx(0);
    setCategory('办公');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-white border-[#DEE0E3] text-[#1F2329] max-w-[480px] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="h-[52px] flex items-center justify-between px-5 border-b border-[#DEE0E3] flex-shrink-0">
          <DialogTitle className="text-[15px] font-semibold m-0">新建智能体</DialogTitle>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-[#BBBFC4] hover:text-[#1F2329] hover:bg-[#F2F3F5] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="text-[13px] text-[#1F2329] font-medium mb-1.5 block">
              智能体名称 <span className="text-[#F54A45]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入智能体名称"
              className="w-full px-3 py-2 rounded-lg bg-[#F2F3F5] border border-transparent focus:border-[#3370FF] focus:bg-white text-[13px] text-[#1F2329] outline-none transition-all placeholder:text-[#BBBFC4]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[13px] text-[#1F2329] font-medium mb-1.5 block">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述该智能体的功能和用途"
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-[#F2F3F5] border border-transparent focus:border-[#3370FF] focus:bg-white text-[13px] text-[#1F2329] outline-none transition-all resize-none placeholder:text-[#BBBFC4]"
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label className="text-[13px] text-[#1F2329] font-medium mb-2 block">图标</label>
            <div className="flex flex-wrap gap-2">
              {iconOptions.map((opt, i) => {
                const Icon = opt.Icon;
                const isSelected = selectedIconIdx === i;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setSelectedIconIdx(i)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 ${
                      isSelected
                        ? 'ring-2 ring-[#3370FF] ring-offset-1'
                        : 'hover:opacity-80'
                    }`}
                    style={{ background: `linear-gradient(135deg, ${opt.color.replace('from-[', '').replace(']', '')} 0%, ${opt.color.replace('to-[', '').replace(']', '')} 100%)` }}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Permission Level */}
          <div>
            <label className="text-[13px] text-[#1F2329] font-medium mb-2 block">权限级别</label>
            <div className="flex gap-2">
              {([
                { key: 'group' as PermissionLevel, label: '集团级', color: '#F54A45' },
                { key: 'dept' as PermissionLevel, label: '部门级', color: '#FF7D00' },
                { key: 'personal' as PermissionLevel, label: '个人级', color: '#00B96B' },
              ]).map((p) => {
                const isActive = permission === p.key;
                return (
                  <button
                    key={p.key}
                    onClick={() => setPermission(p.key)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium border transition-all duration-150 ${
                      isActive
                        ? 'border-[#3370FF] bg-[#E8F1FF] text-[#3370FF]'
                        : 'border-[#DEE0E3] bg-white text-[#646A73] hover:bg-[#F2F3F5]'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-[13px] text-[#1F2329] font-medium mb-2 block">分类</label>
            <div className="flex flex-wrap gap-2">
              {['办公', '知识', '分析', '开发', '合规', '会议', '演示', '生活'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all duration-150 ${
                    category === cat
                      ? 'bg-[#3370FF] text-white'
                      : 'bg-[#F2F3F5] text-[#646A73] hover:bg-[#EBEBEB]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#DEE0E3]">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-transparent border-[#DEE0E3] text-[#646A73] hover:text-[#1F2329] hover:bg-[#F2F3F5] text-[13px]"
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className={`text-[13px] font-medium ${
              name.trim()
                ? 'bg-[#3370FF] text-white hover:bg-[#245BDB]'
                : 'bg-[#F2F3F5] text-[#BBBFC4] cursor-not-allowed'
            }`}
          >
            创建并进入编排
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ====== Stats Dashboard ======

export function StatsDashboard({ agentId, agents, onBack }: { agentId: string; agents: MyAgent[]; onBack: () => void }) {
  const agent = agents.find(a => a.id === agentId);
  const stats = agentStats;

  const TrendIndicator = ({ value }: { value: number }) => (
    <div className={`flex items-center gap-1 text-[12px] font-medium ${value >= 0 ? 'text-[#00B96B]' : 'text-[#F54A45]'}`}>
      {value >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
      <span>{value >= 0 ? '+' : ''}{value}%</span>
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[#F5F6F7]">
      {/* Header */}
      <div className="h-[52px] flex items-center gap-3 px-5 bg-white border-b border-[#DEE0E3] flex-shrink-0">
        <button
          onClick={onBack}
          className="w-7 h-7 flex items-center justify-center rounded-md text-[#8F959E] hover:text-[#1F2329] hover:bg-[#F2F3F5] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-[15px] font-semibold text-[#1F2329]">{agent?.name} — 使用统计</h2>
        </div>
        <div className="ml-auto flex gap-2">
          <button className="px-3 py-1.5 rounded-md text-[12px] text-[#646A73] bg-[#F2F3F5] hover:bg-[#EBEBEB]">近7天</button>
          <button className="px-3 py-1.5 rounded-md text-[12px] text-[#646A73] bg-[#F2F3F5] hover:bg-[#EBEBEB]">近30天</button>
          <button className="px-3 py-1.5 rounded-md text-[12px] text-white bg-[#3370FF] font-medium flex items-center gap-1 hover:bg-[#245BDB]">
            <Download className="w-3 h-3" />
            导出
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: '累计调用次数', value: stats.totalCalls.toLocaleString(), trend: stats.callTrend, icon: BarChart3 },
            { label: '活跃用户', value: stats.activeUsers.toLocaleString(), trend: stats.userTrend, icon: Users },
            { label: '平均响应时间', value: `${stats.avgResponseTime}s`, trend: stats.responseTrend, icon: Clock },
            { label: '满意度评分', value: stats.satisfactionScore.toString(), trend: stats.satisfactionTrend, icon: Star },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-[#DEE0E3] shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#E8F1FF] flex items-center justify-center">
                  <card.icon className="w-4 h-4 text-[#3370FF]" />
                </div>
                <span className="text-[12px] text-[#8F959E]">{card.label}</span>
              </div>
              <div className="text-[32px] font-bold text-[#1F2329] leading-none mb-2">{card.value}</div>
              <TrendIndicator value={card.trend} />
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-4">
          {/* Line Chart */}
          <div className="bg-white rounded-xl p-5 border border-[#DEE0E3]">
            <h3 className="text-[14px] font-medium text-[#1F2329] mb-4">调用趋势</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dailyUsage}>
                <CartesianGrid stroke="#F2F3F5" />
                <XAxis dataKey="date" tick={{ fill: '#8F959E', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8F959E', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #DEE0E3', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 12px rgba(31,35,41,0.08)' }}
                  labelStyle={{ color: '#1F2329' }}
                  itemStyle={{ color: '#3370FF' }}
                />
                <Line type="monotone" dataKey="calls" stroke="#3370FF" strokeWidth={2} dot={{ fill: '#3370FF', r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-xl p-5 border border-[#DEE0E3]">
            <h3 className="text-[14px] font-medium text-[#1F2329] mb-4">使用场景分布</h3>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={[
                      { name: '办公场景', value: 36 },
                      { name: '报告分析', value: 25 },
                      { name: '开发场景', value: 19 },
                      { name: '合规法务', value: 14 },
                      { name: '其他', value: 6 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {pieColors.map((color, i) => (
                      <Cell key={i} fill={color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2.5">
                {[
                  { name: '办公场景', value: '36%', color: '#3370FF' },
                  { name: '报告分析', value: '25%', color: '#00B96B' },
                  { name: '开发场景', value: '19%', color: '#FF7D00' },
                  { name: '合规法务', value: '14%', color: '#7B61FF' },
                  { name: '其他', value: '6%', color: '#F54A45' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-[13px]">
                    <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: item.color }} />
                    <span className="text-[#1F2329]">{item.name}</span>
                    <span className="text-[#8F959E] ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Department Rankings */}
        <div className="bg-white rounded-xl p-5 border border-[#DEE0E3]">
          <h3 className="text-[14px] font-medium text-[#1F2329] mb-4">TOP5 调用部门</h3>
          <div className="space-y-3">
            {departmentUsage.map((dept) => (
              <div key={dept.rank} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                  dept.rank <= 3 ? 'bg-[#FF7D00]/15 text-[#FF7D00]' : 'bg-[#F2F3F5] text-[#8F959E]'
                }`}>
                  {dept.rank}
                </div>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${dept.color}15` }}>
                  <span className="text-[#1F2329] text-xs font-medium">{dept.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-[#1F2329] font-medium">{dept.name}</div>
                </div>
                <div className="w-[120px] h-1.5 bg-[#F2F3F5] rounded-full overflow-hidden flex-shrink-0">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${dept.percentage}%`, background: dept.color }} />
                </div>
                <span className="text-[13px] text-[#3370FF] font-medium w-16 text-right flex-shrink-0">{dept.callCount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detail Table */}
        <div className="bg-white rounded-xl border border-[#DEE0E3] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#DEE0E3]">
            <h3 className="text-[14px] font-medium text-[#1F2329]">使用明细</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#DEE0E3] bg-[#F8F9FA]">
                  <th className="text-left px-5 py-3 text-[#8F959E] font-medium">日期</th>
                  <th className="text-left px-5 py-3 text-[#8F959E] font-medium">调用次数</th>
                  <th className="text-left px-5 py-3 text-[#8F959E] font-medium">用户数</th>
                  <th className="text-left px-5 py-3 text-[#8F959E] font-medium">平均耗时(秒)</th>
                  <th className="text-left px-5 py-3 text-[#8F959E] font-medium">成功率</th>
                </tr>
              </thead>
              <tbody>
                {dailyUsage.map((day, i) => (
                  <tr key={i} className="border-b border-[#F2F3F5] hover:bg-[#F8F9FA] transition-colors">
                    <td className="px-5 py-3 text-[#1F2329]">{day.date}</td>
                    <td className="px-5 py-3 text-[#3370FF] font-medium">{day.calls.toLocaleString()}</td>
                    <td className="px-5 py-3 text-[#1F2329]">{day.users}</td>
                    <td className="px-5 py-3 text-[#1F2329]">{day.avgTime}</td>
                    <td className="px-5 py-3">
                      <span className="text-[#00B96B] font-medium">{day.successRate}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ====== Dify-style Workflow Editor ======

export function WorkflowEditor({ agentId, agents, onBack }: { agentId: string; agents: MyAgent[]; onBack: () => void }) {
  const agent = agents.find(a => a.id === agentId);
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState('select');

  const onNodesChange = (changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  };

  const onEdgesChange = (changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  };

  const onConnect = (connection: Connection) => {
    setEdges((eds) => addEdge({ ...connection, animated: true, style: { stroke: '#3370FF', strokeWidth: 2 } }, eds));
  };

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  };

  const onPaneClick = () => {
    setSelectedNodeId(null);
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="flex flex-col h-full">
      {/* Top Header Bar */}
      <div className="h-[52px] flex items-center gap-3 px-5 bg-white border-b border-[#DEE0E3] flex-shrink-0 z-10">
        <button
          onClick={onBack}
          className="w-7 h-7 flex items-center justify-center rounded-md text-[#8F959E] hover:text-[#1F2329] hover:bg-[#F2F3F5] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-semibold text-[#1F2329]">{agent?.name}</h2>
          <span className="text-[#DEE0E3]">|</span>
          <span className="text-[13px] text-[#8F959E]">工作流编排</span>
        </div>
        {/* Save status */}
        <div className="ml-6 text-[12px] text-[#BBBFC4]">
          自动保存 22:29:51 · 未发布
        </div>
        <div className="ml-auto flex gap-2">
          <button className="px-3 py-1.5 rounded-md text-[12px] text-[#3370FF] bg-[#E8F1FF] hover:bg-[#D0E0FF] font-medium flex items-center gap-1 transition-colors">
            <Play className="w-3 h-3" />
            测试运行
          </button>
          <button className="px-4 py-1.5 rounded-md text-[12px] text-[#646A73] bg-[#F2F3F5] hover:bg-[#EBEBEB] font-medium transition-colors">
            保存草稿
          </button>
          <button className="px-4 py-1.5 rounded-md text-[12px] text-white bg-[#3370FF] font-medium hover:bg-[#245BDB] transition-colors">
            发布
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative bg-[#F5F6F7] overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          style={{ background: '#F5F6F7' }}
          defaultEdgeOptions={{
            style: { stroke: '#3370FF', strokeWidth: 2 },
            animated: true,
          }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#E5E6EB"
          />
        </ReactFlow>

        {/* ========== Left Vertical Toolbar (Dify-style) ========== */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-xl border border-[#DEE0E3] shadow-[0_2px_8px_rgba(31,35,41,0.08)] flex flex-col items-center py-2 gap-0.5 z-10">
          {[
            { id: 'select', icon: MousePointer2, label: '选择' },
            { id: 'pan', icon: Hand, label: '平移' },
            { id: 'add', icon: Plus, label: '添加' },
          ].map((tool) => {
            const ToolIcon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                title={tool.label}
                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-150 ${
                  isActive
                    ? 'text-[#3370FF] bg-[#E8F1FF]'
                    : 'text-[#8F959E] hover:text-[#1F2329] hover:bg-[#F2F3F5]'
                }`}
              >
                <ToolIcon className="w-[18px] h-[18px]" />
              </button>
            );
          })}
          <div className="w-5 h-px bg-[#DEE0E3] my-0.5" />
          {[
            { id: 'undo', icon: Undo2, label: '撤销' },
            { id: 'redo', icon: Redo2, label: '重做' },
          ].map((tool) => {
            const ToolIcon = tool.icon;
            return (
              <button
                key={tool.id}
                title={tool.label}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-[#8F959E] hover:text-[#1F2329] hover:bg-[#F2F3F5] transition-all duration-150"
              >
                <ToolIcon className="w-[18px] h-[18px]" />
              </button>
            );
          })}
        </div>

        {/* ========== Left Node Palette (Dify-style, below toolbar) ========== */}
        <div className="absolute left-4 top-[calc(50%+80px)] -translate-y-0 bg-white rounded-xl border border-[#DEE0E3] shadow-[0_2px_8px_rgba(31,35,41,0.08)] flex flex-col p-2 gap-1.5 z-10">
          <div className="text-[10px] text-[#BBBFC4] font-medium px-1 mb-0.5">节点</div>
          {[
            { type: 'start', label: '开始', color: '#3370FF', icon: Play },
            { type: 'llm', label: 'LLM', color: '#3370FF', icon: Sparkles },
            { type: 'knowledge', label: '知识', color: '#00B96B', icon: Database },
            { type: 'end', label: '结束', color: '#F54A45', icon: Flag },
            { type: 'receipt', label: '报销', color: '#00B96B', icon: Receipt },
          ].map((node) => {
            const NodeIcon = node.icon;
            return (
              <button
                key={node.type}
                draggable
                onClick={() => {
                  // Add node at center of viewport
                  const newNode: Node = {
                    id: `node-${Date.now()}`,
                    type: node.type === 'start' ? 'start' : node.type === 'llm' ? 'llm' : node.type === 'knowledge' ? 'knowledge' : 'end',
                    position: { x: 300 + Math.random() * 100, y: 200 + Math.random() * 100 },
                    data: {
                      label: node.label === 'LLM' ? '新节点' : node.label === '知识' ? '知识检索' : node.label,
                      model: node.type === 'llm' ? 'GPT-4' : undefined,
                      knowledgeBase: node.type === 'knowledge' ? '集团知识库' : undefined,
                    },
                  };
                  setNodes(prev => [...prev, newNode]);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] text-[#1F2329] hover:bg-[#F2F3F5] transition-colors cursor-grab active:cursor-grabbing w-full"
              >
                <div
                  className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                  style={{ background: `${node.color}15` }}
                >
                  <NodeIcon className="w-3 h-3" style={{ color: node.color }} />
                </div>
                <span className="font-medium">{node.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========== Bottom Zoom Controls ========== */}
        <div className="absolute left-4 bottom-4 flex items-center gap-1 bg-white rounded-lg border border-[#DEE0E3] shadow-sm px-1 py-0.5 z-10">
          <button className="w-7 h-7 flex items-center justify-center rounded text-[#8F959E] hover:text-[#1F2329] hover:bg-[#F2F3F5] transition-colors">
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button className="w-7 h-7 flex items-center justify-center rounded text-[#8F959E] hover:text-[#1F2329] hover:bg-[#F2F3F5] transition-colors">
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="absolute right-4 bottom-4 flex items-center gap-2 z-10">
          {/* Variable check button */}
          <button className="px-3 py-1.5 rounded-lg bg-white border border-[#DEE0E3] shadow-sm text-[12px] text-[#646A73] hover:bg-[#F2F3F5] transition-colors">
            变量检查
          </button>
          {/* Mini map placeholder */}
          <div className="w-[100px] h-[70px] bg-white rounded-lg border border-[#DEE0E3] shadow-sm flex items-center justify-center">
            <div className="w-16 h-10 bg-[#F2F3F5] rounded" />
          </div>
        </div>

        {/* ========== Right Properties Panel (Dify-style) ========== */}
        {selectedNode && (
          <div className="absolute right-0 top-0 bottom-0 w-[320px] bg-white border-l border-[#DEE0E3] shadow-[-4px_0_16px_rgba(31,35,41,0.06)] z-20 flex flex-col animate-in slide-in-from-right duration-200">
            {/* Panel Header */}
            <div className="h-[48px] flex items-center justify-between px-4 border-b border-[#DEE0E3] flex-shrink-0">
              <div className="flex items-center gap-2">
                {selectedNode.type === 'start' && <div className="w-5 h-5 rounded bg-[#3370FF] flex items-center justify-center"><User className="w-3 h-3 text-white" /></div>}
                {selectedNode.type === 'llm' && <div className="w-5 h-5 rounded bg-[#E8F1FF] flex items-center justify-center"><Sparkles className="w-3 h-3 text-[#3370FF]" /></div>}
                {selectedNode.type === 'knowledge' && <div className="w-5 h-5 rounded bg-[#E6F7EF] flex items-center justify-center"><Database className="w-3 h-3 text-[#00B96B]" /></div>}
                {selectedNode.type === 'end' && <div className="w-5 h-5 rounded bg-red-50 flex items-center justify-center"><Flag className="w-3 h-3 text-[#F54A45]" /></div>}
                <span className="text-[14px] font-semibold text-[#1F2329]">
                  {selectedNode.type === 'start' ? '开始' : selectedNode.type === 'llm' ? (selectedNode.data.label as string) : selectedNode.type === 'knowledge' ? '知识检索' : '结束'}
                </span>
              </div>
              <button
                onClick={() => setSelectedNodeId(null)}
                className="w-6 h-6 flex items-center justify-center rounded text-[#BBBFC4] hover:text-[#1F2329] hover:bg-[#F2F3F5] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Node name */}
              <div>
                <label className="text-[12px] text-[#8F959E] font-medium mb-1.5 block">节点名称</label>
                <input
                  type="text"
                  value={selectedNode.data.label as string}
                  onChange={(e) => {
                    setNodes(prev => prev.map(n =>
                      n.id === selectedNode.id ? { ...n, data: { ...n.data, label: e.target.value } } : n
                    ));
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-[#F2F3F5] border border-transparent focus:border-[#3370FF] focus:bg-white text-[13px] text-[#1F2329] outline-none transition-all"
                />
              </div>

              {/* Model selection (for LLM) */}
              {(selectedNode.type === 'llm' || selectedNode.type === 'start') && (
                <div>
                  <label className="text-[12px] text-[#8F959E] font-medium mb-1.5 block">模型</label>
                  <select
                    className="w-full px-3 py-2 rounded-lg bg-[#F2F3F5] border border-transparent focus:border-[#3370FF] focus:bg-white text-[13px] text-[#1F2329] outline-none transition-all appearance-none"
                    defaultValue="gpt-4"
                  >
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="gpt-3.5">GPT-3.5</option>
                    <option value="claude-3">Claude 3</option>
                  </select>
                </div>
              )}

              {/* System prompt (for LLM) */}
              {selectedNode.type === 'llm' && (
                <div>
                  <label className="text-[12px] text-[#8F959E] font-medium mb-1.5 block">系统提示词</label>
                  <textarea
                    rows={4}
                    placeholder="输入系统提示词..."
                    className="w-full px-3 py-2 rounded-lg bg-[#F2F3F5] border border-transparent focus:border-[#3370FF] focus:bg-white text-[13px] text-[#1F2329] outline-none transition-all resize-none"
                    defaultValue="你是一个智能助手，请根据用户的输入提供准确的回答。"
                  />
                </div>
              )}

              {/* Temperature (for LLM) */}
              {selectedNode.type === 'llm' && (
                <div>
                  <label className="text-[12px] text-[#8F959E] font-medium mb-1.5 block">温度 (Temperature)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.1}
                      defaultValue={0.7}
                      className="flex-1 h-1 bg-[#DEE0E3] rounded-full appearance-none cursor-pointer accent-[#3370FF]"
                    />
                    <span className="text-[13px] text-[#1F2329] font-medium w-10 text-right">0.7</span>
                  </div>
                </div>
              )}

              {/* Knowledge base (for knowledge) */}
              {selectedNode.type === 'knowledge' && (
                <div>
                  <label className="text-[12px] text-[#8F959E] font-medium mb-1.5 block">知识库</label>
                  <select
                    className="w-full px-3 py-2 rounded-lg bg-[#F2F3F5] border border-transparent focus:border-[#3370FF] focus:bg-white text-[13px] text-[#1F2329] outline-none transition-all appearance-none"
                    defaultValue="group"
                  >
                    <option value="group">集团制度库</option>
                    <option value="biz">业务知识库</option>
                    <option value="tech">技术文档库</option>
                    <option value="train">培训资料库</option>
                  </select>
                </div>
              )}

              {/* Output variable */}
              <div>
                <label className="text-[12px] text-[#8F959E] font-medium mb-1.5 block">输出变量</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E8F1FF] border border-[#3370FF]/20">
                  <span className="text-[12px] text-[#3370FF] font-medium font-mono">
                    {selectedNode.type === 'start' ? 'query' : selectedNode.type === 'llm' ? 'answer' : selectedNode.type === 'knowledge' ? 'retrieval_result' : 'output'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ====== Delete Dialog ======

export function DeleteAgentDialog({
  agentId,
  agents,
  open,
  onClose,
  onConfirm,
}: {
  agentId: string;
  agents: MyAgent[];
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const agent = agents.find(a => a.id === agentId);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white border-[#DEE0E3] text-[#1F2329] max-w-[400px]">
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
            <Trash2 className="w-6 h-6 text-[#F54A45]" />
          </div>
          <DialogTitle className="text-lg font-semibold">确认删除此智能体？</DialogTitle>
          <DialogDescription className="text-[#8F959E] text-sm mt-2">
            删除后将无法恢复，关联的知识库和对话记录也将被清除。
          </DialogDescription>
        </DialogHeader>
        {agent && (
          <div className="bg-[#F2F3F5] rounded-lg p-3 my-3 text-center">
            <span className="text-[14px] text-[#1F2329] font-medium">{agent.name}</span>
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-transparent border-[#DEE0E3] text-[#646A73] hover:text-[#1F2329] hover:bg-[#F2F3F5]"
          >
            取消
          </Button>
          <Button
            onClick={() => { onConfirm(); onClose(); }}
            className="bg-[#F54A45] text-white hover:bg-[#E04440]"
          >
            确认删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ====== Added Agent Detail Panel (Real Usage Simulation) ======

import { plazaAgents } from '@/data/agents';

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