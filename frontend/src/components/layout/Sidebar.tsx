import { useState, useCallback, useEffect } from 'react';
import {
  MessageSquare, Bot, Store, BookOpen, Database,
  ChevronDown, Sparkles, FileText, Plus, Cloud,
  Shield, Users, Building2, LogOut
} from 'lucide-react';
import type { NavModule, KnowledgeSubLevel, PermissionCode } from '@/types';

import { bffService, type BffDataset } from '@/services/bffService';
import { useAuthStore } from '@/store/authStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  activeModule: NavModule;
  activeKnowledgeSub: KnowledgeSubLevel | null;
  onModuleChange: (module: NavModule) => void;
  onKnowledgeSubChange: (sub: KnowledgeSubLevel) => void;
  addedAgentCount: number;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  /** 外部触发刷新知识库列表的标记 */
  refreshToken?: number;
}

interface NavItem {
  id: NavModule;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  requiredPermission?: PermissionCode;
}

const mainNavItems: NavItem[] = [
  { id: 'messages', label: '消息', icon: MessageSquare },
  { id: 'myAgents', label: '我的智能体', icon: Bot },
  { id: 'agentPlaza', label: '智能体广场', icon: Store, badgeColor: 'bg-[#00B96B]', requiredPermission: 'agent:view' },
  { id: 'createAgent', label: '新建智能体', icon: Sparkles, requiredPermission: 'agent:create' },
  { id: 'promptRepo', label: '提示词仓库', icon: FileText, requiredPermission: 'prompt:view' },
];

const systemNavItems: NavItem[] = [
  { id: 'userManagement', label: '用户管理', icon: Users, requiredPermission: 'user:view' },
  { id: 'orgManagement', label: '组织架构', icon: Building2, requiredPermission: 'org:view' },
  { id: 'roleManagement', label: '角色权限', icon: Shield, requiredPermission: 'role:view' },
];



// ===== Sidebar Component =====

export default function Sidebar({ activeModule, activeKnowledgeSub, onModuleChange, onKnowledgeSubChange, addedAgentCount, collapsed = false, onToggleCollapse, refreshToken = 0 }: SidebarProps) {
  const [kbExpanded, setKbExpanded] = useState(false);
  const [datasets, setDatasets] = useState<BffDataset[]>([]);
  const [datasetsLoading, setDatasetsLoading] = useState(false);
  const [createKbOpen, setCreateKbOpen] = useState(false);
  const [newKbName, setNewKbName] = useState('');
  const [newKbDescription, setNewKbDescription] = useState('');
  const [plazaCount, setPlazaCount] = useState(0);

  const { user, hasPermission } = useAuthStore();
  const visibleMainNavItems = mainNavItems.filter(
    (item) => !item.requiredPermission || hasPermission(item.requiredPermission)
  );
  const visibleSystemNavItems = systemNavItems.filter(
    (item) => !item.requiredPermission || hasPermission(item.requiredPermission)
  );
  const canCreateKnowledgeBase = hasPermission('knowledge:create');

  const isKbActive = activeModule === 'knowledgeBase';

  const loadDatasets = useCallback(async () => {
    setDatasetsLoading(true);
    try {
      const list = await bffService.knowledge.listDatasets();
      setDatasets(list);
    } finally {
      setDatasetsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (kbExpanded) loadDatasets();
  }, [kbExpanded, loadDatasets, refreshToken]);

  useEffect(() => {
    bffService.application.listApplications({ limit: 1 })
      .then(result => setPlazaCount(result.total))
      .catch(() => setPlazaCount(0));
  }, []);

  const handleSelectDataset = useCallback((datasetId: string) => {
    onKnowledgeSubChange(datasetId);
    if (activeModule !== 'knowledgeBase') onModuleChange('knowledgeBase');
  }, [activeModule, onKnowledgeSubChange, onModuleChange]);

  const handleCreateDataset = async () => {
    if (!newKbName.trim()) return;
    const created = await bffService.knowledge.createDataset({
      name: newKbName.trim(),
      description: newKbDescription.trim(),
    });
    setNewKbName('');
    setNewKbDescription('');
    setCreateKbOpen(false);
    await loadDatasets();
    handleSelectDataset(created.id);
  };

  return (
    <aside className={`${collapsed ? 'w-[64px]' : 'w-[240px]'} flex-shrink-0 flex flex-col bg-[#F5F6F7] border-r border-[#DEE0E3] z-10 transition-all duration-300`}>
      {/* Header — 点击 Logo 展开/收起侧边栏 */}
      <div className={`h-[52px] flex items-center flex-shrink-0 ${collapsed ? 'justify-center px-2' : 'px-4'}`}>
        <button
          onClick={onToggleCollapse}
          className={`flex items-center hover:opacity-80 transition-opacity ${collapsed ? 'justify-center' : 'gap-2'}`}
          title={collapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          <img src="/logo-taihu.png" alt="Logo" className="w-9 h-9 object-contain flex-shrink-0" />
          {!collapsed && (
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold text-[#1F2329] leading-tight">太湖云AI企业智能体</span>
              <span className="text-[10px] text-[#8F959E] leading-tight">AI 智能平台</span>
            </div>
          )}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-2 flex flex-col gap-1 overflow-y-auto">
        {/* Super Agent — Special top entry */}
        <button
          onClick={() => onModuleChange('superAgent')}
          className={`w-full flex items-center rounded-xl text-sm font-semibold transition-all duration-200 ${
            collapsed ? 'justify-center px-2 py-2.5' : 'gap-2.5 px-3 py-2.5'
          } ${
            activeModule === 'superAgent'
              ? 'text-white shadow-md'
              : 'text-[#1F2329] hover:shadow-sm'
          }`}
          style={
            activeModule === 'superAgent'
              ? { background: 'linear-gradient(135deg, #3370FF 0%, #00E5FF 100%)' }
              : { background: 'linear-gradient(135deg, #E8F1FF 0%, #E8F8FF 100%)' }
          }
        >
          <Cloud className={`w-[18px] h-[18px] flex-shrink-0 ${activeModule === 'superAgent' ? 'text-white' : 'text-[#3370FF]'}`} />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">超级助手</span>
              {activeModule !== 'superAgent' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FF7D00] text-white font-bold">AI</span>
              )}
            </>
          )}
        </button>

        <div className="h-px bg-[#DEE0E3] my-0.5" />

        {visibleMainNavItems.map((item) => {
          const isActive = activeModule === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onModuleChange(item.id)}
              className={`
                flex items-center rounded-lg text-sm font-medium transition-all duration-150
                ${collapsed ? 'justify-center px-2 py-2' : 'gap-2.5 px-3 py-2'}
                ${isActive ? 'bg-[#E8F1FF] text-[#3370FF]' : 'text-[#646A73] hover:bg-[#EBEBEB] hover:text-[#1F2329]'}
              `}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {/* Badge: agentPlaza shows plaza count, messages shows addedAgentCount */}
                  {(item.id === 'agentPlaza' || (item.id === 'messages' && addedAgentCount > 0)) && (
                    <span className={`${item.id === 'agentPlaza' ? 'bg-[#00B96B]' : 'bg-[#F54A45]'} text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] text-center`}>
                      {item.id === 'agentPlaza' ? plazaCount : addedAgentCount}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}

        {/* Knowledge Base */}
        {hasPermission('knowledge:view') && (
          <div className="mt-1">
            {collapsed ? (
              <button
                onClick={() => onModuleChange('knowledgeBase')}
                className={`
                  w-full flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-150 px-2 py-2
                  ${isKbActive ? 'bg-[#E8F1FF] text-[#3370FF]' : 'text-[#646A73] hover:bg-[#EBEBEB] hover:text-[#1F2329]'}
                `}
              >
                <BookOpen className="w-[18px] h-[18px] flex-shrink-0" />
              </button>
            ) : (
              <div
                className={`
                  w-full flex items-center rounded-lg text-sm font-medium transition-all duration-150
                  ${isKbActive ? 'bg-[#E8F1FF] text-[#3370FF]' : 'text-[#646A73] hover:bg-[#EBEBEB] hover:text-[#1F2329]'}
                `}
              >
                <button
                  onClick={() => {
                    setKbExpanded(!kbExpanded);
                    if (!isKbActive) onModuleChange('knowledgeBase');
                  }}
                  className="flex-1 flex items-center gap-2.5 px-3 py-2 text-left"
                >
                  <BookOpen className="w-[18px] h-[18px] flex-shrink-0" />
                  <span className="flex-1">知识库</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${kbExpanded ? 'rotate-180' : ''}`}
                  />
                </button>
                {canCreateKnowledgeBase && (
                  <button
                    onClick={() => setCreateKbOpen(true)}
                    className="w-8 h-8 mr-1 flex items-center justify-center rounded text-[#3370FF] hover:bg-[#D0E0FF] transition-colors"
                    title="创建知识库"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {!collapsed && kbExpanded && (
              <div className="mt-0.5 pl-1 space-y-0.5 overflow-y-auto max-h-[300px]">
                {datasetsLoading && (
                  <div className="flex items-center justify-center py-3">
                    <div className="w-4 h-4 border-2 border-[#3370FF] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {!datasetsLoading && datasets.length === 0 && (
                  <div className="px-3 py-2 text-[12px] text-[#BBBFC4]">暂无知识库</div>
                )}
                {!datasetsLoading && datasets.map((ds) => {
                  const isActive = isKbActive && activeKnowledgeSub === ds.id;
                  return (
                    <button
                      key={ds.id}
                      onClick={() => handleSelectDataset(ds.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-[12px] transition-colors ${
                        isActive ? 'bg-[#E8F1FF] text-[#3370FF]' : 'text-[#646A73] hover:bg-[#EBEBEB] hover:text-[#1F2329]'
                      }`}
                      title={ds.description || ds.name}
                    >
                      <Database className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="flex-1 truncate">{ds.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* System Management */}
        {visibleSystemNavItems.length > 0 && (
          <div className="mt-4">
            {!collapsed && (
              <div className="px-3 mb-1 text-[11px] font-medium text-[#8F959E]">系统管理</div>
            )}
            <div className="space-y-0.5">
              {visibleSystemNavItems.map((item) => {
                const isActive = activeModule === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onModuleChange(item.id)}
                    className={`
                      w-full flex items-center rounded-lg text-sm font-medium transition-all duration-150
                      ${collapsed ? 'justify-center px-2 py-2' : 'gap-2.5 px-3 py-2'}
                      ${isActive ? 'bg-[#E8F1FF] text-[#3370FF]' : 'text-[#646A73] hover:bg-[#EBEBEB] hover:text-[#1F2329]'}
                    `}
                  >
                    <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                    {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </nav>

      {/* User Footer */}
      <div className={`h-[52px] flex items-center border-t border-[#DEE0E3] flex-shrink-0 ${collapsed ? 'justify-center px-2' : 'px-3 gap-2.5'}`}>
        <div className="w-8 h-8 rounded-full bg-[#3370FF] flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
          {user?.name ? user.name.slice(0, 1) : '用'}
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="text-[13px] text-[#1F2329] font-medium truncate">{user?.name || '未登录'}</div>
            <div className="text-[11px] text-[#8F959E] truncate">{user?.departmentName || '未知部门'} · 在线</div>
          </div>
        )}
        <button
          onClick={() => useAuthStore.getState().logout()}
          className="w-7 h-7 flex items-center justify-center rounded text-[#8F959E] hover:text-[#F54A45] hover:bg-[#FFF2F0] transition-colors"
          title="退出登录"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Create Dataset Dialog */}
      <Dialog open={createKbOpen} onOpenChange={(v) => !v && setCreateKbOpen(false)}>
        <DialogContent className="bg-white border-[#DEE0E3] text-[#1F2329] max-w-sm">
          <DialogHeader><DialogTitle className="text-[15px] font-semibold">创建知识库</DialogTitle></DialogHeader>
          <input
            value={newKbName}
            onChange={e => setNewKbName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreateDataset(); }}
            placeholder="知识库名称"
            className="w-full px-3 py-2 rounded-lg bg-[#F2F3F5] border border-transparent focus:border-[#3370FF] text-[13px] outline-none placeholder:text-[#BBBFC4]"
          />
          <textarea
            value={newKbDescription}
            onChange={e => setNewKbDescription(e.target.value)}
            placeholder="知识库描述（可选）"
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-[#F2F3F5] border border-transparent focus:border-[#3370FF] text-[13px] outline-none placeholder:text-[#BBBFC4] resize-none"
          />
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setCreateKbOpen(false)} className="text-[13px] border-[#DEE0E3] text-[#646A73]">取消</Button>
            <Button onClick={handleCreateDataset} className="text-[13px] bg-[#3370FF] text-white hover:bg-[#245BDB]">创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
