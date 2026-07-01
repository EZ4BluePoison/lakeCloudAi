import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PanelLeft, PanelLeftClose } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { MessagesMiddlePanel, MessagesRightPanel } from '@/components/modules/MessagesModule';
import {
  MyAgentsListPanel,
  AddedAgentDetailPanel,
  WorkbenchMiddlePanel,
  StatsDashboard,
  WorkflowEditor,
  DeleteAgentDialog
} from '@/components/modules/MyAgentsModule';
import AgentPlazaModule from '@/components/modules/AgentPlazaModule';
import SuperAgentModule from '@/components/modules/SuperAgentModule';
import { KnowledgeBaseMiddlePanel, KnowledgeBaseRightPanel } from '@/components/modules/KnowledgeBaseModule';
import AgentConfigManager from '@/components/modules/AgentConfigManager';
import { myAgents as defaultMyAgents } from '@/data/agents';
import type { NavModule, KnowledgeSubLevel, FileNode, MyAgent } from '@/types';


export default function App() {
  // Module state
  const [activeModule, setActiveModule] = useState<NavModule>('messages');
  const [activeKnowledgeSub, setActiveKnowledgeSub] = useState<KnowledgeSubLevel>('group');
  const [, setConfigAgentId] = useState<string | null>(null);

  // Messages module state
  const [selectedChatAgentId, setSelectedChatAgentId] = useState('plaza-1');

  // ========== My Agents — 显示从 plaza 添加使用的智能体 ==========
  const [addedAgents, setAddedAgents] = useState<MyAgent[]>([]);
  const [selectedAddedAgentId, setSelectedAddedAgentId] = useState<string | null>(null);

  // ========== Workbench — 创建自己的智能体 ==========
  const [agents, setAgents] = useState<MyAgent[]>(defaultMyAgents);
  const [selectedWorkbenchAgentId, setSelectedWorkbenchAgentId] = useState<string | null>(null);
  const [workbenchView, setWorkbenchView] = useState<'list' | 'stats' | 'workflow'>('list');
  const [wbDeleteDialogOpen, setWbDeleteDialogOpen] = useState(false);
  const [wbAgentToDelete, setWbAgentToDelete] = useState<string | null>(null);

  // Favorites state (global)
  const [favorites, setFavorites] = useState<string[]>([]);

  // Knowledge base module state
  const [selectedFileNode, setSelectedFileNode] = useState<FileNode | null>(null);

  // Sidebar & middle panel collapse state
  // 默认进入消息/智能体对话时，第一栏和历史记录收起，第二栏保持展开
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isMiddleCollapsed, setIsMiddleCollapsed] = useState(false);

  // Check if plaza or superAgent is active (collapses middle panel)
  const isPlazaActive = activeModule === 'agentPlaza' || activeModule === 'superAgent';

  const handleModuleChange = useCallback((module: NavModule) => {
    setActiveModule(module);
    // 进入消息模块时收起第一栏，第二栏默认展开
    if (module === 'messages') {
      setIsSidebarCollapsed(true);
      setIsMiddleCollapsed(false);
    }
    // Reset sub-views when switching modules
    setWorkbenchView('list');
    setSelectedWorkbenchAgentId(null);
    setSelectedFileNode(null);
  }, []);

  const handleSelectChatAgent = useCallback((id: string) => {
    setSelectedChatAgentId(id);
    setIsSidebarCollapsed(true);
    setIsMiddleCollapsed(false);
  }, []);

  const handleKnowledgeSubChange = useCallback((sub: KnowledgeSubLevel) => {
    setActiveKnowledgeSub(sub);
    setActiveModule('knowledgeBase');
    setSelectedFileNode(null);
  }, []);

  // ========== Workbench handlers ==========
  const handleViewStats = useCallback((id: string) => {
    setSelectedWorkbenchAgentId(id);
    setWorkbenchView('stats');
  }, []);

  const handleEditWorkflow = useCallback((id: string) => {
    setSelectedWorkbenchAgentId(id);
    setWorkbenchView('workflow');
  }, []);

  const handleDeleteAgent = useCallback((id: string) => {
    setWbAgentToDelete(id);
    setWbDeleteDialogOpen(true);
  }, []);

  const handleBackToList = useCallback(() => {
    setWorkbenchView('list');
    setSelectedWorkbenchAgentId(null);
  }, []);

  const handleCreateAgent = useCallback((agent: MyAgent) => {
    setAgents(prev => [agent, ...prev]);
    setSelectedWorkbenchAgentId(agent.id);
    setWorkbenchView('workflow');
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (wbAgentToDelete) {
      setAgents(prev => prev.filter(a => a.id !== wbAgentToDelete));
    }
    setWbDeleteDialogOpen(false);
    setWbAgentToDelete(null);
    setWorkbenchView('list');
  }, [wbAgentToDelete]);

  // ========== Add agent from plaza to my agents ==========
  const handleAddAgent = useCallback((agent: MyAgent) => {
    setAddedAgents(prev => {
      if (prev.find(a => a.id === agent.id)) return prev;
      return [agent, ...prev];
    });
  }, []);

  const handleRemoveAddedAgent = useCallback((id: string) => {
    setAddedAgents(prev => prev.filter(a => a.id !== id));
  }, []);

  const toggleFavorite = useCallback((agentId: string) => {
    setFavorites(prev => {
      if (prev.includes(agentId)) return prev.filter(id => id !== agentId);
      return [...prev, agentId];
    });
  }, []);

  const handleConfigAgent = useCallback((agentId: string) => {
    setConfigAgentId(agentId);
    setActiveModule('agentConfig');
  }, []);

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-[#F5F6F7]">
      {/* Left Sidebar */}
      <Sidebar
        activeModule={activeModule}
        activeKnowledgeSub={activeModule === 'knowledgeBase' ? activeKnowledgeSub : null}
        onModuleChange={handleModuleChange}
        onKnowledgeSubChange={handleKnowledgeSubChange}
        addedAgentCount={addedAgents.length}
        collapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(v => !v)}
      />

      {/* Middle Panel - Collapsible for Plaza */}
      <AnimatePresence initial={false}>
        {!isPlazaActive && (
          <motion.section
            key="middle-panel"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: isMiddleCollapsed ? 40 : 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`flex-shrink-0 flex flex-col bg-white border-r border-[#DEE0E3] overflow-hidden relative ${isMiddleCollapsed ? 'items-center pt-3' : ''}`}
          >
            {isMiddleCollapsed ? (
              <button
                onClick={() => setIsMiddleCollapsed(false)}
                className="w-7 h-7 flex items-center justify-center rounded text-[#8F959E] hover:text-[#3370FF] hover:bg-[#E8F1FF] transition-colors"
                title="展开智能体列表"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsMiddleCollapsed(true)}
                  className="absolute top-3 right-2 z-20 w-7 h-7 flex items-center justify-center rounded text-[#8F959E] hover:text-[#3370FF] hover:bg-[#E8F1FF] transition-colors"
                  title="收起智能体列表"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>

                {/* ========== Messages ========== */}
                {activeModule === 'messages' && (
                  <MessagesMiddlePanel
                    agents={addedAgents}
                    selectedAgentId={selectedChatAgentId}
                    onSelectAgent={handleSelectChatAgent}
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                  />
                )}

                {/* ========== My Agents — 从 plaza 添加的智能体 ========== */}
                {activeModule === 'myAgents' && (
                  <MyAgentsListPanel
                    agents={addedAgents}
                    selectedAgentId={selectedAddedAgentId}
                    onSelect={setSelectedAddedAgentId}
                    onRemove={handleRemoveAddedAgent}
                    onStartChat={(id) => {
                      handleSelectChatAgent(id);
                      setActiveModule('messages');
                    }}
                    onGoToPlaza={() => setActiveModule('agentPlaza')}
                  />
                )}

                {/* ========== Workbench — 创建自己的智能体 ========== */}
                {activeModule === 'workbench' && (
                  <WorkbenchMiddlePanel
                    agents={agents}
                    selectedAgentId={selectedWorkbenchAgentId}
                    onSelectAgent={setSelectedWorkbenchAgentId}
                    onViewStats={handleViewStats}
                    onEditWorkflow={handleEditWorkflow}
                    onDeleteAgent={handleDeleteAgent}
                    onCreateAgent={handleCreateAgent}
                  />
                )}

                {/* ========== Knowledge Base ========== */}
                {activeModule === 'knowledgeBase' && (
                  <KnowledgeBaseMiddlePanel
                    deptPath={activeKnowledgeSub}
                    selectedNodeId={selectedFileNode?.id || null}
                    onSelectNode={(node) => {
                      if (node.type === 'file') {
                        setSelectedFileNode(node);
                      }
                    }}
                  />
                )}
              </>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* Right Panel */}
      <section className="flex-1 flex flex-col bg-[#F5F6F7] min-w-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Agent Config Manager */}
          {activeModule === 'agentConfig' && (
            <motion.div
              key="agent-config"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <AgentConfigManager 
                onBack={() => {
                  setConfigAgentId(null);
                  setActiveModule('agentPlaza');
                }} 
              />
            </motion.div>
          )}

          {/* Messages Right */}
          {activeModule === 'messages' && (
            <motion.div
              key="messages"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <MessagesRightPanel agents={addedAgents} agentId={selectedChatAgentId} favorites={favorites} onToggleFavorite={toggleFavorite} />
            </motion.div>
          )}

          {/* My Agents Right — detail panel or empty state */}
          {activeModule === 'myAgents' && (() => {
            const selectedAgent = addedAgents.find(a => a.id === selectedAddedAgentId);
            if (selectedAgent) {
              return (
                <motion.div
                  key={`myagents-${selectedAddedAgentId}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col"
                >
                  <AddedAgentDetailPanel
                    agent={selectedAgent}
                    onStartChat={(id) => {
                      handleSelectChatAgent(id);
                      setActiveModule('messages');
                    }}
                    onRemove={(id) => {
                      handleRemoveAddedAgent(id);
                      setSelectedAddedAgentId(null);
                    }}
                  />
                </motion.div>
              );
            }
            return (
              <motion.div
                key="myagents"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col items-center justify-center"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#F2F3F5] flex items-center justify-center mb-4">
                    <BotIcon className="w-8 h-8 text-[#DEE0E3]" />
                  </div>
                  <h3 className="text-[16px] font-medium text-[#8F959E] mb-2">在左侧选择已添加的智能体</h3>
                  <p className="text-[13px] text-[#BBBFC4]">从智能体广场添加的智能体会显示在这里</p>
                </div>
              </motion.div>
            );
          })()}

          {/* Workbench Right — stats / workflow */}
          {activeModule === 'workbench' && workbenchView === 'list' && (
            <motion.div
              key="workbench-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col items-center justify-center"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#F2F3F5] flex items-center justify-center mb-4">
                  <WrenchIcon className="w-8 h-8 text-[#DEE0E3]" />
                </div>
                <h3 className="text-[16px] font-medium text-[#8F959E] mb-2">选择一个智能体进行管理</h3>
                <p className="text-[13px] text-[#BBBFC4]">在工作台中创建和编排您自己的智能体</p>
              </div>
            </motion.div>
          )}

          {activeModule === 'workbench' && workbenchView === 'stats' && selectedWorkbenchAgentId && (
            <motion.div
              key="workbench-stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col"
            >
              <StatsDashboard agentId={selectedWorkbenchAgentId} agents={agents} onBack={handleBackToList} />
            </motion.div>
          )}

          {activeModule === 'workbench' && workbenchView === 'workflow' && selectedWorkbenchAgentId && (
            <motion.div
              key="workbench-workflow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col"
            >
              <WorkflowEditor agentId={selectedWorkbenchAgentId} agents={agents} onBack={handleBackToList} />
            </motion.div>
          )}

          {/* Agent Plaza */}
          {activeModule === 'agentPlaza' && (
            <motion.div
              key="plaza"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <AgentPlazaModule
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                onAddAgent={handleAddAgent}
                onConfigAgent={handleConfigAgent}
              />
            </motion.div>
          )}

          {/* Super Agent */}
          {activeModule === 'superAgent' && (
            <motion.div
              key="superagent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <SuperAgentModule />
            </motion.div>
          )}

          {/* Knowledge Base */}
          {activeModule === 'knowledgeBase' && (
            <motion.div
              key="knowledge"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col"
            >
              <KnowledgeBaseRightPanel file={selectedFileNode} deptPath={activeKnowledgeSub} />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Workbench Delete Dialog */}
      {wbAgentToDelete && (
        <DeleteAgentDialog
          agentId={wbAgentToDelete}
          agents={agents}
          open={wbDeleteDialogOpen}
          onClose={() => { setWbDeleteDialogOpen(false); setWbAgentToDelete(null); }}
          onConfirm={handleConfirmDelete}
        />
      )}

      {/* Floating 3D Cloud Logo Button — bottom right */}
      {activeModule !== 'superAgent' && (
        <button
          onClick={() => setActiveModule('superAgent')}
          className="fixed bottom-24 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
          style={{
            boxShadow: '0 4px 20px rgba(51, 112, 255, 0.4), 0 8px 32px rgba(0, 229, 255, 0.3)',
          }}
          title="超级助手"
        >
          <img
            src="/logo-taihu.png"
            alt="超级助手"
            className="w-full h-full object-contain drop-shadow-lg animate-float"
          />
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-full pointer-events-none animate-ping opacity-15" style={{
            background: 'radial-gradient(circle, rgba(51,112,255,0.3) 0%, transparent 70%)',
          }} />
        </button>
      )}
    </div>
  );
}

// Simple icon components for empty states
function BotIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
    </svg>
  );
}

function WrenchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}
