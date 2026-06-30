import { Settings, User } from 'lucide-react';
import type { AgentConfig } from '@/types';

interface BasicSettingsTabProps {
  config: AgentConfig;
  onChange: (config: AgentConfig) => void;
  onDirty: () => void;
}

export function BasicSettingsTab({ config, onChange, onDirty }: BasicSettingsTabProps) {
  const handleChange = (field: keyof AgentConfig, value: string) => {
    onChange({ ...config, [field]: value });
    onDirty();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-[#DEE0E3] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-[#3370FF]" />
          <h2 className="text-[15px] font-semibold text-[#1F2329]">基础设置</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#646A73] mb-2">智能体名称</label>
            <input type="text" value={config.name} onChange={(e) => handleChange('name', e.target.value)} className="w-full px-3 py-2 rounded-md border border-[#DEE0E3] text-[13px] text-[#1F2329] focus:outline-none focus:ring-2 focus:ring-[#3370FF]/20 focus:border-[#3370FF] transition-all" placeholder="请输入智能体名称" />
          </div>
          
          <div>
            <label className="block text-[13px] font-medium text-[#646A73] mb-2">描述</label>
            <textarea value={config.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} className="w-full px-3 py-2 rounded-md border border-[#DEE0E3] text-[13px] text-[#1F2329] focus:outline-none focus:ring-2 focus:ring-[#3370FF]/20 focus:border-[#3370FF] transition-all resize-none" placeholder="请输入智能体描述" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#646A73] mb-2">图标</label>
              <select value={config.icon} onChange={(e) => handleChange('icon', e.target.value)} className="w-full px-3 py-2 rounded-md border border-[#DEE0E3] text-[13px] text-[#1F2329] focus:outline-none focus:ring-2 focus:ring-[#3370FF]/20 focus:border-[#3370FF] transition-all bg-white">
                <option value="BookOpen">📚 书本</option>
                <option value="Bot">🤖 机器人</option>
                <option value="FileText">📄 文档</option>
                <option value="Search">🔍 搜索</option>
                <option value="Settings">⚙️ 设置</option>
              </select>
            </div>
            
            <div>
              <label className="block text-[13px] font-medium text-[#646A73] mb-2">状态</label>
              <select value={config.status} onChange={(e) => handleChange('status', e.target.value as any)} className="w-full px-3 py-2 rounded-md border border-[#DEE0E3] text-[13px] text-[#1F2329] focus:outline-none focus:ring-2 focus:ring-[#3370FF]/20 focus:border-[#3370FF] transition-all bg-white">
                <option value="draft">草稿</option>
                <option value="published">已发布</option>
                <option value="deprecated">已弃用</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#DEE0E3] p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-[#3370FF]" />
          <h2 className="text-[15px] font-semibold text-[#1F2329]">创建者信息</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-medium text-[#646A73] mb-2">创建者</label>
            <div className="px-3 py-2 rounded-md bg-[#F2F3F5] text-[13px] text-[#646A73]">{config.createdBy}</div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#646A73] mb-2">版本</label>
            <div className="px-3 py-2 rounded-md bg-[#F2F3F5] text-[13px] text-[#646A73]">{config.version}</div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#646A73] mb-2">创建时间</label>
            <div className="px-3 py-2 rounded-md bg-[#F2F3F5] text-[13px] text-[#646A73]">{config.createdAt}</div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#646A73] mb-2">更新时间</label>
            <div className="px-3 py-2 rounded-md bg-[#F2F3F5] text-[13px] text-[#646A73]">{config.updatedAt}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
