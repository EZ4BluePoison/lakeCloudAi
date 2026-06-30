import { Zap } from 'lucide-react';
import type { AgentConfig } from '@/types';

interface BehaviorSettingsTabProps {
  config: AgentConfig;
  onChange: (config: AgentConfig) => void;
  onDirty: () => void;
}

export function BehaviorSettingsTab({ config, onChange, onDirty }: BehaviorSettingsTabProps) {
  const updateBehavior = (field: keyof AgentConfig['behavior'], value: string | number | boolean) => {
    onChange({
      ...config,
      behavior: { ...config.behavior, [field]: value }
    });
    onDirty();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-[#DEE0E3] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-[#3370FF]" />
          <h2 className="text-[15px] font-semibold text-[#1F2329]">行为设置</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-[#F2F3F5]">
            <div>
              <div className="text-[13px] font-medium text-[#1F2329]">启用记忆</div>
              <div className="text-[11px] text-[#8F959E]">记忆用户之前的对话内容</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={config.behavior.enableMemory} onChange={(e) => updateBehavior('enableMemory', e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-[#DEE0E3] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3370FF]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-[#F2F3F5]">
            <div>
              <div className="text-[13px] font-medium text-[#1F2329]">多轮对话</div>
              <div className="text-[11px] text-[#8F959E]">支持连续对话</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={config.behavior.enableMultiTurn} onChange={(e) => updateBehavior('enableMultiTurn', e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-[#DEE0E3] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3370FF]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-[#F2F3F5]">
            <div>
              <div className="text-[13px] font-medium text-[#1F2329]">引用来源</div>
              <div className="text-[11px] text-[#8F959E]">显示回答时使用的知识来源</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={config.behavior.enableCitation} onChange={(e) => updateBehavior('enableCitation', e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-[#DEE0E3] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3370FF]"></div>
            </label>
          </div>

          <div className="pt-2">
            <label className="block text-[13px] font-medium text-[#646A73] mb-2">响应语言</label>
            <select value={config.behavior.responseLanguage} onChange={(e) => updateBehavior('responseLanguage', e.target.value as AgentConfig['behavior']['responseLanguage'])} className="w-full px-3 py-2 rounded-md border border-[#DEE0E3] text-[13px] text-[#1F2329] focus:outline-none focus:ring-2 focus:ring-[#3370FF]/20 focus:border-[#3370FF] transition-all bg-white">
              <option value="zh-CN">中文</option>
              <option value="en-US">English</option>
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#646A73] mb-2">最大对话轮数 <span className="text-[11px] text-[#8F959E]">({config.behavior.maxConversationLength})</span></label>
            <input type="range" min="1" max="50" value={config.behavior.maxConversationLength} onChange={(e) => updateBehavior('maxConversationLength', parseInt(e.target.value))} className="w-full" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#DEE0E3] p-6">
        <h2 className="text-[15px] font-semibold text-[#1F2329] mb-4">权限设置</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#646A73] mb-2">可见性</label>
            <select value={config.permissions.visibility} onChange={(e) => onChange({ ...config, permissions: { ...config.permissions, visibility: e.target.value as AgentConfig['permissions']['visibility'] } })} className="w-full px-3 py-2 rounded-md border border-[#DEE0E3] text-[13px] text-[#1F2329] focus:outline-none focus:ring-2 focus:ring-[#3370FF]/20 focus:border-[#3370FF] transition-all bg-white">
              <option value="public">公开</option>
              <option value="private">私有</option>
              <option value="department">部门可见</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
