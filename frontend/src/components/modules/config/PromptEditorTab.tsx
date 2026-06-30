import { FileText, Plus, Trash2 } from 'lucide-react';
import type { AgentConfig, PromptTemplate } from '@/types';

interface PromptEditorTabProps {
  config: AgentConfig;
  onChange: (config: AgentConfig) => void;
  onDirty: () => void;
}

export function PromptEditorTab({ config, onChange, onDirty }: PromptEditorTabProps) {
  const updatePrompt = (id: string, updates: Partial<PromptTemplate>) => {
    onChange({
      ...config,
      prompts: config.prompts.map(p => p.id === id ? { ...p, ...updates } : p)
    });
    onDirty();
  };

  const addPrompt = () => {
    const newPrompt: PromptTemplate = {
      id: `prompt-${Date.now()}`,
      name: '新提示词',
      type: 'user',
      content: '',
      variables: []
    };
    onChange({ ...config, prompts: [...config.prompts, newPrompt] });
    onDirty();
  };

  const deletePrompt = (id: string) => {
    onChange({ ...config, prompts: config.prompts.filter(p => p.id !== id) });
    onDirty();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#3370FF]" />
          <h2 className="text-[15px] font-semibold text-[#1F2329]">提示词配置</h2>
        </div>
        <button onClick={addPrompt} className="px-3 py-1.5 rounded-md text-[13px] text-[#3370FF] bg-[#E8F1FF] hover:bg-[#D0E0FF] transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          添加提示词
        </button>
      </div>

      <div className="space-y-4">
        {config.prompts.map((prompt) => (
          <div key={prompt.id} className="bg-white rounded-xl border border-[#DEE0E3] p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <input type="text" value={prompt.name} onChange={(e) => updatePrompt(prompt.id, { name: e.target.value })} className="text-[15px] font-semibold text-[#1F2329] border-b border-transparent hover:border-[#DEE0E3] focus:border-[#3370FF] outline-none bg-transparent" placeholder="提示词名称" />
                <select value={prompt.type} onChange={(e) => updatePrompt(prompt.id, { type: e.target.value as any })} className="px-2 py-1 rounded-md text-[12px] bg-[#F2F3F5] text-[#646A73] border-none outline-none">
                  <option value="system">System</option>
                  <option value="user">User</option>
                  <option value="assistant">Assistant</option>
                </select>
              </div>
              <button onClick={() => deletePrompt(prompt.id)} className="w-8 h-8 flex items-center justify-center rounded-md text-[#8F959E] hover:text-[#F54A45] hover:bg-[#FFF2F0] transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-[13px] font-medium text-[#646A73] mb-2">提示词内容</label>
              <textarea value={prompt.content} onChange={(e) => updatePrompt(prompt.id, { content: e.target.value })} rows={8} className="w-full px-3 py-2 rounded-md border border-[#DEE0E3] text-[13px] text-[#1F2329] focus:outline-none focus:ring-2 focus:ring-[#3370FF]/20 focus:border-[#3370FF] transition-all resize-none font-mono" placeholder="请输入提示词内容，使用 {{variable}} 定义变量" />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#646A73] mb-2">变量</label>
              <div className="flex flex-wrap gap-2">
                {prompt.variables.length === 0 ? (
                  <span className="text-[12px] text-[#8F959E]">暂无变量，在内容中使用 {'{{variable}}'} 定义</span>
                ) : (
                  prompt.variables.map((variable) => (
                    <span key={variable} className="px-2 py-1 rounded-md bg-[#E8F1FF] text-[#3370FF] text-[12px] font-medium">
                      {variable}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
