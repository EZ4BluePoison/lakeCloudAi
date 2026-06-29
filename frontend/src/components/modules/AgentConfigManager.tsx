import { useState, useCallback } from 'react';
import { ArrowLeft, Save, Eye, History, Upload, Download, Settings, Bot, FileText, Database, Zap, Rocket } from 'lucide-react';
import { knowledgeAgentConfig } from '@/data/agentConfigs';
import { bffService } from '@/services/bffService';
import type { AgentConfig } from '@/types';
import { BasicSettingsTab } from './config/BasicSettingsTab';
import { LLMConfigTab } from './config/LLMConfigTab';
import { PromptEditorTab } from './config/PromptEditorTab';
import { KnowledgeSourceTab } from './config/KnowledgeSourceTab';
import { BehaviorSettingsTab } from './config/BehaviorSettingsTab';
import { PreviewTab } from './config/PreviewTab';

interface AgentConfigManagerProps {
  onBack: () => void;
}

type ConfigTab = 'basic' | 'llm' | 'prompts' | 'knowledge' | 'behavior' | 'preview';

export default function AgentConfigManager({ onBack }: AgentConfigManagerProps) {
  const [activeTab, setActiveTab] = useState<ConfigTab>('basic');
  const [config, setConfig] = useState<AgentConfig>(knowledgeAgentConfig);
  const [_hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const tabs = [
    { id: 'basic', label: '基础设置', icon: Settings },
    { id: 'llm', label: '大模型', icon: Bot },
    { id: 'prompts', label: '提示词', icon: FileText },
    { id: 'knowledge', label: '知识源', icon: Database },
    { id: 'behavior', label: '行为设置', icon: Zap },
    { id: 'preview', label: '预览', icon: Eye },
  ];

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      // 按 BFF Agent 语义保存，后续真实接口替换后这里直接生效
      await bffService.agent.saveAgent({
        agentId: config.agentId,
        name: config.name,
        description: config.description,
        icon: config.icon,
        iconBg: config.iconBg,
        mode: (config.status === 'draft' ? 'chat-agent' : 'chat-agent') as 'chat-agent' | 'workflow',
        llmConfig: config.llmConfig,
        prompts: config.prompts,
        knowledgeSources: config.knowledgeSources,
        tools: [],
      });
      setHasUnsavedChanges(false);
    } finally {
      setSaving(false);
    }
  }, [config]);

  const handlePublish = useCallback(async () => {
    setPublishing(true);
    try {
      await bffService.agent.publishAgent({
        agentId: config.agentId,
        changeLog: `发布版本 ${config.version}`,
      });
      setConfig(prev => ({ ...prev, status: 'published' }));
    } finally {
      setPublishing(false);
    }
  }, [config.agentId, config.version]);

  const handleExport = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${config.name}-config.json`;
    link.click();
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#F5F6F7]">
      {/* 顶部导航栏 */}
      <div className="h-[52px] flex items-center justify-between px-6 bg-white border-b border-[#DEE0E3] flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-md text-[#8F959E] hover:text-[#1F2329] hover:bg-[#F2F3F5] transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-[16px] font-semibold text-[#1F2329]">{config.name}</h1>
            <p className="text-[12px] text-[#8F959E]">智能体配置管理</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-md text-[13px] text-[#646A73] border border-[#DEE0E3] hover:bg-[#F2F3F5] transition-colors flex items-center gap-2">
            <History className="w-4 h-4" />
            版本历史
          </button>
          <button onClick={handleExport} className="px-3 py-1.5 rounded-md text-[13px] text-[#646A73] border border-[#DEE0E3] hover:bg-[#F2F3F5] transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            导出
          </button>
          <button className="px-3 py-1.5 rounded-md text-[13px] text-[#646A73] border border-[#DEE0E3] hover:bg-[#F2F3F5] transition-colors flex items-center gap-2">
            <Upload className="w-4 h-4" />
            导入
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing || config.status === 'published'}
            className="px-4 py-1.5 rounded-md text-[13px] font-medium text-white bg-[#00B96B] hover:bg-[#00A854] disabled:bg-[#BBBFC4] transition-colors flex items-center gap-2"
          >
            <Rocket className="w-4 h-4" />
            {config.status === 'published' ? '已发布' : (publishing ? '发布中...' : '发布')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 rounded-md text-[13px] font-medium text-white bg-[#3370FF] hover:bg-[#245BDB] disabled:bg-[#8FB3FF] transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? '保存中...' : '保存配置'}
          </button>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="flex px-6 gap-0 bg-white border-b border-[#DEE0E3] flex-shrink-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as ConfigTab)} className={`px-4 py-3 text-[13px] font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === tab.id ? 'text-[#3370FF] border-[#3370FF]' : 'text-[#8F959E] border-transparent hover:text-[#1F2329]'}`}>
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'basic' && <BasicSettingsTab config={config} onChange={setConfig} onDirty={() => setHasUnsavedChanges(true)} />}
          {activeTab === 'llm' && <LLMConfigTab config={config} onChange={setConfig} onDirty={() => setHasUnsavedChanges(true)} />}
          {activeTab === 'prompts' && <PromptEditorTab config={config} onChange={setConfig} onDirty={() => setHasUnsavedChanges(true)} />}
          {activeTab === 'knowledge' && <KnowledgeSourceTab config={config} onChange={setConfig} onDirty={() => setHasUnsavedChanges(true)} />}
          {activeTab === 'behavior' && <BehaviorSettingsTab config={config} onChange={setConfig} onDirty={() => setHasUnsavedChanges(true)} />}
          {activeTab === 'preview' && <PreviewTab config={config} />}
        </div>
      </div>
    </div>
  );
}
