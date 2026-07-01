import { useState, useCallback, useEffect } from 'react';
import {
  MessageSquare, Bot, Wrench, Store, BookOpen, FolderArchive, FolderOpen, Folder, FolderTree,
  ChevronDown, ChevronRight, Settings2, Plus, Trash2, Pencil, X, Cloud
} from 'lucide-react';
import type { NavModule, KnowledgeSubLevel } from '@/types';
import { knowledgeOrgTree as initialOrgTree, plazaAgents } from '@/data/agents';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  activeModule: NavModule;
  activeKnowledgeSub: KnowledgeSubLevel | null;
  onModuleChange: (module: NavModule) => void;
  onKnowledgeSubChange: (sub: KnowledgeSubLevel) => void;
  addedAgentCount: number;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  id: NavModule;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

const mainNavItems: NavItem[] = [
  { id: 'messages', label: '消息', icon: MessageSquare },
  { id: 'myAgents', label: '我的智能体', icon: Bot },
  { id: 'agentPlaza', label: '智能体广场', icon: Store, badgeColor: 'bg-[#00B96B]' },
  { id: 'agentConfig', label: '配置管理', icon: Settings2 },
];

const workbenchItem: NavItem = { id: 'workbench', label: '工作台', icon: Wrench };

interface OrgNode {
  id: string;
  name: string;
  level: number;
  children?: OrgNode[];
}

/** Recursively render four-level org tree */
function OrgTreeNode({
  node,
  activeDeptId,
  expandedIds,
  onToggle,
  onSelectDept,
  depth = 0,
}: {
  node: OrgNode;
  activeDeptId: string | null;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectDept: (id: string) => void;
  depth?: number;
}) {
  const isExpanded = expandedIds.has(node.id);
  const isActive = activeDeptId === node.id && node.level === 4;
  const hasChildren = node.children && node.children.length > 0;
  const isLeaf = node.level === 4;

  // Level-based folder icon
  const levelIcon = () => {
    if (node.level === 1) return <FolderTree className="w-4 h-4 text-[#3370FF] flex-shrink-0" />;
    if (node.level === 2) return <FolderArchive className="w-4 h-4 text-[#7B61FF] flex-shrink-0" />;
    if (node.level === 3) return <FolderOpen className="w-4 h-4 text-[#00B96B] flex-shrink-0" />;
    return <Folder className="w-4 h-4 text-[#8F959E] flex-shrink-0" />;
  };

  const paddingLeft = 4 + depth * 14;

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) onToggle(node.id);
          if (isLeaf) onSelectDept(node.id);
        }}
        className={`
          w-full flex items-center gap-1.5 py-[5px] rounded-md text-left transition-all duration-150
          ${isActive ? 'bg-[#E8F1FF] text-[#3370FF]' : 'text-[#646A73] hover:bg-[#EBEBEB] hover:text-[#1F2329]'}
        `}
        style={{ paddingLeft: `${paddingLeft}px`, paddingRight: '8px' }}
      >
        {/* Expand/collapse chevron for non-leaf nodes */}
        {hasChildren ? (
          <span className={`flex-shrink-0 w-3.5 ${isActive ? 'text-[#3370FF]' : 'text-[#BBBFC4]'}`}>
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </span>
        ) : (
          <span className="w-3.5 flex-shrink-0" />
        )}

        {/* Level icon */}
        {levelIcon()}

        {/* Node name */}
        <span
          className={`text-[12px] truncate ${
            node.level === 1 ? 'font-bold text-[#1F2329]' :
            node.level === 2 ? 'font-semibold' :
            node.level === 3 ? 'font-medium' : ''
          } ${isActive ? '!text-[#3370FF]' : ''}`}
          title={node.name}
        >
          {node.name}
        </span>
      </button>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <OrgTreeNode
              key={child.id}
              node={child}
              activeDeptId={activeDeptId}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onSelectDept={onSelectDept}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ===== Structure Edit Dialog =====

function EditStructureDialog({ open, onClose, tree, onTreeChange }: {
  open: boolean; onClose: () => void;
  tree: OrgNode[]; onTreeChange: (t: OrgNode[]) => void;
}) {
  const [localTree, setLocalTree] = useState<OrgNode[]>(() => JSON.parse(JSON.stringify(tree)));
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [addingParentId, setAddingParentId] = useState<string | null>(null);
  const [addName, setAddName] = useState('');

  // Sync local tree when dialog opens
  /* eslint-disable react-hooks/set-state-in-effect -- intentional props-to-local-state sync on dialog open */
  useEffect(() => {
    if (open) {
      const cloned = JSON.parse(JSON.stringify(tree));
      setLocalTree(cloned);
      // Expand all
      const all = new Set<string>();
      function collect(nodes: OrgNode[]) {
        nodes.forEach(n => { all.add(n.id); if (n.children) collect(n.children); });
      }
      collect(cloned);
      setExpandedIds(all);
      // Reset edit states
      setEditingId(null);
      setAddingParentId(null);
    }
  }, [open, tree]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
      } else {
        n.add(id);
      }
      return n;
    });
  };

  const startRename = (node: OrgNode) => {
    setEditingId(node.id);
    setEditName(node.name);
  };

  const confirmRename = () => {
    if (!editName.trim()) return;
    function walk(nodes: OrgNode[]): OrgNode[] {
      return nodes.map(n => {
        if (n.id === editingId) return { ...n, name: editName.trim() };
        if (n.children) return { ...n, children: walk(n.children) };
        return n;
      });
    }
    setLocalTree(prev => walk(prev));
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = (targetId: string) => {
    function remove(nodes: OrgNode[]): OrgNode[] {
      return nodes.filter(n => {
        if (n.id === targetId) return false;
        if (n.children) n.children = remove(n.children);
        return true;
      });
    }
    setLocalTree(prev => remove(prev));
  };

  const startAdd = (parentId: string | null) => {
    setAddingParentId(parentId);
    setAddName('');
  };

  const confirmAdd = () => {
    if (!addName.trim()) return;
    const newNode: OrgNode = {
      id: `org-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      name: addName.trim(),
      level: 1,
      children: [],
    };

    if (!addingParentId) {
      // Add as root
      setLocalTree(prev => [...prev, newNode]);
    } else {
      // Add as child
      function addChild(nodes: OrgNode[]): OrgNode[] {
        return nodes.map(n => {
          if (n.id === addingParentId) {
            const childLevel = (n.level || 1) + 1;
            const child: OrgNode = { ...newNode, level: childLevel <= 4 ? childLevel : 4 };
            return { ...n, children: [...(n.children || []), child] };
          }
          if (n.children) return { ...n, children: addChild(n.children) };
          return n;
        });
      }
      setLocalTree(prev => addChild(prev));
    }
    setAddingParentId(null);
    setAddName('');
  };

  const handleSave = () => {
    onTreeChange(localTree);
    onClose();
  };

  const renderNode = (node: OrgNode, depth: number) => {
    const isExpanded = expandedIds.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isEditing = editingId === node.id;
    const isAddingHere = addingParentId === node.id;

    const levelColor = node.level === 1 ? 'text-[#3370FF]' : node.level === 2 ? 'text-[#7B61FF]' : node.level === 3 ? 'text-[#00B96B]' : 'text-[#8F959E]';

    return (
      <div key={node.id}>
        <div
          className="flex items-center gap-1 py-1.5 rounded-md hover:bg-[#F2F3F5] group transition-colors"
          style={{ paddingLeft: `${8 + depth * 16}px`, paddingRight: '4px' }}
        >
          {/* Expand toggle */}
          <button onClick={() => toggleExpand(node.id)} className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-[#BBBFC4]">
            {hasChildren ? (isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />) : <span className="w-3" />}
          </button>

          {/* Node name or edit input */}
          {isEditing ? (
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') confirmRename(); if (e.key === 'Escape') setEditingId(null); }}
                autoFocus
                className="flex-1 min-w-0 px-2 py-1 text-[12px] rounded border border-[#3370FF] bg-white outline-none"
              />
              <button onClick={confirmRename} className="text-[#00B96B] hover:bg-[#E6F7EF] p-0.5 rounded"><ChevronDown className="w-3 h-3 rotate-[-90deg]" /></button>
              <button onClick={() => setEditingId(null)} className="text-[#F54A45] hover:bg-red-50 p-0.5 rounded"><X className="w-3 h-3" /></button>
            </div>
          ) : (
            <>
              <span className={`text-[12px] flex-1 min-w-0 truncate ${levelColor} ${node.level === 1 ? 'font-bold' : node.level === 2 ? 'font-semibold' : ''}`}>
                {node.name}
              </span>
              {/* Actions */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button onClick={() => startRename(node)} title="重命名" className="w-5 h-5 flex items-center justify-center rounded text-[#8F959E] hover:text-[#3370FF] hover:bg-[#E8F1FF]">
                  <Pencil className="w-3 h-3" />
                </button>
                {node.level < 4 && (
                  <button onClick={() => startAdd(node.id)} title="添加子节点" className="w-5 h-5 flex items-center justify-center rounded text-[#8F959E] hover:text-[#00B96B] hover:bg-[#E6F7EF]">
                    <Plus className="w-3 h-3" />
                  </button>
                )}
                <button onClick={() => handleDelete(node.id)} title="删除" className="w-5 h-5 flex items-center justify-center rounded text-[#8F959E] hover:text-[#F54A45] hover:bg-red-50">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Add child input */}
        {isAddingHere && (
          <div className="flex items-center gap-1 py-1" style={{ paddingLeft: `${8 + (depth + 1) * 16}px`, paddingRight: '4px' }}>
            <input
              value={addName}
              onChange={e => setAddName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') confirmAdd(); if (e.key === 'Escape') setAddingParentId(null); }}
              autoFocus
              placeholder={`新${node.level < 3 ? ['', '子集团', '子公司', '部门'][node.level] : '节点'}名称...`}
              className="flex-1 min-w-0 px-2 py-1 text-[12px] rounded border border-[#00B96B] bg-white outline-none placeholder:text-[#BBBFC4]"
            />
            <button onClick={confirmAdd} className="text-[#00B96B] hover:bg-[#E6F7EF] p-0.5 rounded"><ChevronDown className="w-3 h-3 rotate-[-90deg]" /></button>
            <button onClick={() => setAddingParentId(null)} className="text-[#F54A45] hover:bg-red-50 p-0.5 rounded"><X className="w-3 h-3" /></button>
          </div>
        )}

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>{node.children!.map(child => renderNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-white border-[#DEE0E3] text-[#1F2329] max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-[15px] font-semibold flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-[#3370FF]" />编辑知识库结构
          </DialogTitle>
          <DialogDescription className="text-[12px] text-[#8F959E]">
            管理集团组织架构，支持重命名、添加子节点和删除节点
          </DialogDescription>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-shrink-0 mb-2">
          <button
            onClick={() => startAdd(null)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-[#3370FF] bg-[#E8F1FF] hover:bg-[#D0E0FF] transition-colors"
          >
            <Plus className="w-3 h-3" />添加一级集团
          </button>
          {addingParentId === null && (
            <div className="flex items-center gap-1 flex-1">
              <input
                value={addName}
                onChange={e => setAddName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') confirmAdd(); if (e.key === 'Escape') setAddingParentId(null); }}
                autoFocus
                placeholder="新集团名称..."
                className="flex-1 min-w-0 px-2 py-1 text-[12px] rounded border border-[#3370FF] bg-white outline-none placeholder:text-[#BBBFC4]"
              />
              <button onClick={confirmAdd} className="text-[#00B96B] hover:bg-[#E6F7EF] p-0.5 rounded"><ChevronDown className="w-3 h-3 rotate-[-90deg]" /></button>
              <button onClick={() => setAddingParentId(null)} className="text-[#F54A45] hover:bg-red-50 p-0.5 rounded"><X className="w-3 h-3" /></button>
            </div>
          )}
        </div>

        {/* Tree */}
        <div className="flex-1 overflow-y-auto border border-[#F2F3F5] rounded-lg p-2">
          {localTree.length === 0 && (
            <div className="flex flex-col items-center py-8 text-[#BBBFC4]">
              <FolderTree className="w-8 h-8 mb-2" />
              <p className="text-[12px]">暂无节点，点击上方按钮添加</p>
            </div>
          )}
          {localTree.map(node => renderNode(node, 0))}
        </div>

        <DialogFooter className="flex-shrink-0 gap-2 mt-2">
          <Button variant="outline" onClick={onClose} className="text-[13px] border-[#DEE0E3] text-[#646A73]">取消</Button>
          <Button onClick={handleSave} className="text-[13px] bg-[#3370FF] text-white hover:bg-[#245BDB]">保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ===== Sidebar Component =====

export default function Sidebar({ activeModule, activeKnowledgeSub, onModuleChange, onKnowledgeSubChange, addedAgentCount, collapsed = false, onToggleCollapse }: SidebarProps) {
  const [kbExpanded, setKbExpanded] = useState(false);
  const [structureEditOpen, setStructureEditOpen] = useState(false);
  const [orgTree, setOrgTree] = useState<OrgNode[]>(initialOrgTree as OrgNode[]);

  const [expandedOrgIds, setExpandedOrgIds] = useState<Set<string>>(() => {
    // Only expand root-level nodes by default
    return new Set(orgTree.map(n => n.id));
  });

  const isKbActive = activeModule === 'knowledgeBase';

  /** Get all descendant ids of a node (recursive) */
  const getDescendantIds = useCallback((nodeId: string): string[] => {
    function walk(nodes: OrgNode[]): OrgNode | null {
      for (const n of nodes) {
        if (n.id === nodeId) return n;
        if (n.children) { const r = walk(n.children); if (r) return r; }
      }
      return null;
    }
    const target = walk(orgTree);
    if (!target || !target.children) return [];
    const result: string[] = [];
    function collect(nodes: OrgNode[]) {
      nodes.forEach(n => { result.push(n.id); if (n.children) collect(n.children); });
    }
    collect(target.children);
    return result;
  }, [orgTree]);

  /** Toggle expand: when expanding, collapse all descendants to ensure only one level shows */
  const handleToggle = useCallback((id: string) => {
    setExpandedOrgIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        // Collapsing: remove this node AND all its descendants
        getDescendantIds(id).forEach(did => next.delete(did));
        next.delete(id);
      } else {
        // Expanding: add this node, but collapse its descendants
        next.add(id);
        getDescendantIds(id).forEach(did => next.delete(did));
      }
      return next;
    });
  }, [getDescendantIds]);

  const handleSelectDept = (deptId: string) => {
    onKnowledgeSubChange(deptId);
  };

  // Keep expanded ids in sync when tree changes
  const handleTreeChange = useCallback((newTree: OrgNode[]) => {
    setOrgTree(newTree);
    // Reset to only expand root-level nodes
    setExpandedOrgIds(new Set(newTree.map(n => n.id)));
  }, []);

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

        {mainNavItems.map((item) => {
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
                      {item.id === 'agentPlaza' ? plazaAgents.length : addedAgentCount}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}

        {/* Knowledge Base */}
        <div className="mt-1">
          <button
            onClick={() => {
              if (collapsed) {
                onModuleChange('knowledgeBase');
                return;
              }
              setKbExpanded(!kbExpanded);
              if (!isKbActive) {
                onModuleChange('knowledgeBase');
                // Select the root group only, let user expand levels manually
                const firstRoot = orgTree[0];
                if (firstRoot) handleSelectDept(firstRoot.id);
              }
            }}
            className={`
              w-full flex items-center rounded-lg text-sm font-medium transition-all duration-150
              ${collapsed ? 'justify-center px-2 py-2' : 'gap-2.5 px-3 py-2'}
              ${isKbActive ? 'bg-[#E8F1FF] text-[#3370FF]' : 'text-[#646A73] hover:bg-[#EBEBEB] hover:text-[#1F2329]'}
            `}
          >
            <BookOpen className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">知识库</span>
                {/* Edit structure button - only visible when knowledge base is active */}
                {isKbActive && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setStructureEditOpen(true); }}
                    className="w-6 h-6 flex items-center justify-center rounded text-[#3370FF] hover:bg-[#D0E0FF] transition-colors"
                    title="编辑知识库结构"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${kbExpanded ? 'rotate-180' : ''}`}
                />
              </>
            )}
          </button>

          {!collapsed && kbExpanded && (
            <div className="mt-0.5 pl-1">
              {orgTree.map((root) => (
                <OrgTreeNode
                  key={root.id}
                  node={root}
                  activeDeptId={isKbActive ? activeKnowledgeSub : null}
                  expandedIds={expandedOrgIds}
                  onToggle={handleToggle}
                  onSelectDept={handleSelectDept}
                  depth={0}
                />
              ))}
            </div>
          )}
        </div>

        {/* Workbench — at the bottom */}
        {(() => {
          const wb = workbenchItem;
          const isWbActive = activeModule === 'workbench';
          return (
            <button
              onClick={() => onModuleChange('workbench')}
              className={`
                flex items-center rounded-lg text-sm font-medium transition-all duration-150 w-full
                ${collapsed ? 'justify-center px-2 py-2' : 'gap-2.5 px-3 py-2'}
                ${isWbActive ? 'bg-[#E8F1FF] text-[#3370FF]' : 'text-[#646A73] hover:bg-[#EBEBEB] hover:text-[#1F2329]'}
              `}
            >
              <wb.icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span className="flex-1 text-left">{wb.label}</span>}
            </button>
          );
        })()}
      </nav>

      {/* User Footer */}
      <div className={`h-[52px] flex items-center border-t border-[#DEE0E3] flex-shrink-0 ${collapsed ? 'justify-center px-2' : 'px-3 gap-2.5'}`}>
        <div className="w-8 h-8 rounded-full bg-[#3370FF] flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
          张
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="text-[13px] text-[#1F2329] font-medium truncate">张经理</div>
            <div className="text-[11px] text-[#8F959E] truncate">数字化部 · 在线</div>
          </div>
        )}
      </div>

      {/* Edit Structure Dialog */}
      <EditStructureDialog
        open={structureEditOpen}
        onClose={() => setStructureEditOpen(false)}
        tree={orgTree}
        onTreeChange={handleTreeChange}
      />
    </aside>
  );
}
