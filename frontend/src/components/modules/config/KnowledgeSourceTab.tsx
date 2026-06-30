import { Database, Plus, Trash2, FolderOpen } from 'lucide-react';
import type { AgentConfig, KnowledgeSource } from '@/types';
import { knowledgeOrgTree } from '@/data/agents';

interface KnowledgeSourceTabProps {
  config: AgentConfig;
  onChange: (config: AgentConfig) => void;
  onDirty: () => void;
}

export function KnowledgeSourceTab({ config, onChange, onDirty }: KnowledgeSourceTabProps) {
  const updateSource = (id: string, updates: Partial<KnowledgeSource>) => {
    onChange({
      ...config,
      knowledgeSources: config.knowledgeSources.map(s => s.id === id ? { ...s, ...updates } : s)
    });
    onDirty();
  };

  const addSource = () => {
    const newSource: KnowledgeSource = {
      id: `ks-${Date.now()}`,
      name: '新知识源',
      type: 'folder',
      sourceId: '',
      enabled: true,
      retrievalMode: 'semantic',
      topK: 5
    };
    onChange({ ...config, knowledgeSources: [...config.knowledgeSources, newSource] });
    onDirty();
  };

  const deleteSource = (id: string) => {
    onChange({ ...config, knowledgeSources: config.knowledgeSources.filter(s => s.id !== id) });
    onDirty();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-[#3370FF]" />
          <h2 className="text-[15px] font-semibold text-[#1F2329]">知识源配置</h2>
        </div>
        <button onClick={addSource} className="px-3 py-1.5 rounded-md text-[13px] text-[#3370FF] bg-[#E8F1FF] hover:bg-[#D0E0FF] transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          添加知识源
        </button>
      </div>

      <div className="space-y-4">
        {config.knowledgeSources.map((source) => (
          <div key={source.id} className="bg-white rounded-xl border border-[#DEE0E3] p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#E6F7EF] flex items-center justify-center">
                  {source.type === 'folder' ? <FolderOpen className="w-5 h-5 text-[#00B96B]" /> : <Database className="w-5 h-5 text-[#3370FF]" />}
                </div>
                <input type="text" value={source.name} onChange={(e) => updateSource(source.id, { name: e.target.value })} className="text-[15px] font-semibold text-[#1F2329] border-b border-transparent hover:border-[#DEE0E3] focus:border-[#3370FF] outline-none bg-transparent" placeholder="知识源名称" />
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={source.enabled} onChange={(e) => updateSource(source.id, { enabled: e.target.checked })} className="w-4 h-4 rounded border-[#DEE0E3] text-[#3370FF] focus:ring-[#3370FF]/20" />
                  <span className="text-[13px] text-[#646A73]">启用</span>
                </label>
                <button onClick={() => deleteSource(source.id)} className="w-8 h-8 flex items-center justify-center rounded-md text-[#8F959E] hover:text-[#F54A45] hover:bg-[#FFF2F0] transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-[#646A73] mb-2">类型</label>
                <select value={source.type} onChange={(e) => updateSource(source.id, { type: e.target.value as KnowledgeSource['type'] })} className="w-full px-3 py-2 rounded-md border border-[#DEE0E3] text-[13px] text-[#1F2329] focus:outline-none focus:ring-2 focus:ring-[#3370FF]/20 focus:border-[#3370FF] transition-all bg-white">
                  <option value="folder">文件夹</option>
                  <option value="file">文件</option>
                  <option value="database">数据库</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#646A73] mb-2">检索模式</label>
                <select value={source.retrievalMode} onChange={(e) => updateSource(source.id, { retrievalMode: e.target.value as KnowledgeSource['retrievalMode'] })} className="w-full px-3 py-2 rounded-md border border-[#DEE0E3] text-[13px] text-[#1F2329] focus:outline-none focus:ring-2 focus:ring-[#3370FF]/20 focus:border-[#3370FF] transition-all bg-white">
                  <option value="semantic">语义搜索</option>
                  <option value="keyword">关键词搜索</option>
                  <option value="hybrid">混合模式</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#646A73] mb-2">Top-K</label>
                <input type="number" min="1" max="20" value={source.topK} onChange={(e) => updateSource(source.id, { topK: parseInt(e.target.value) })} className="w-full px-3 py-2 rounded-md border border-[#DEE0E3] text-[13px] text-[#1F2329] focus:outline-none focus:ring-2 focus:ring-[#3370FF]/20 focus:border-[#3370FF] transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#646A73] mb-2">知识源</label>
                <select value={source.sourceId} onChange={(e) => updateSource(source.id, { sourceId: e.target.value })} className="w-full px-3 py-2 rounded-md border border-[#DEE0E3] text-[13px] text-[#1F2329] focus:outline-none focus:ring-2 focus:ring-[#3370FF]/20 focus:border-[#3370FF] transition-all bg-white">
                  <option value="">请选择</option>
                  {knowledgeOrgTree.map((node) => (
                    <option key={node.id} value={node.id}>{node.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
