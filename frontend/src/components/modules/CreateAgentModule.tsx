import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Sparkles, Bot, Database } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { bffService, type BffDataset, type BffModelTypeItem } from '@/services/bffService';
import { mapApplicationToMyAgent } from '@/services/agentService';
import type { MyAgent } from '@/types';

export interface CreateAgentForm {
  name: string;
  description: string;
  prompt: string;
  model: string;
  knowledgeBaseId: string;
}

export interface CreateAgentModuleProps {
  initialPrompt?: string;
  onBack: () => void;
  onSave: (agent: MyAgent) => void;
}

export function CreateAgentModule({ initialPrompt = '', onBack, onSave }: CreateAgentModuleProps) {
  const [datasets, setDatasets] = useState<BffDataset[]>([]);
  const [form, setForm] = useState<CreateAgentForm>({
    name: '',
    description: '',
    prompt: initialPrompt,
    model: '',
    knowledgeBaseId: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateAgentForm, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [models, setModels] = useState<BffModelTypeItem[]>([]);

  useEffect(() => {
    bffService.knowledge.listDatasets()
      .then(list => {
        setDatasets(list);
        if (list[0]) setForm(prev => ({ ...prev, knowledgeBaseId: list[0].id }));
      })
      .catch(() => setDatasets([]));

    bffService.model.listModelsByType('llm')
      .then(list => {
        setModels(list);
        if (list[0]) setForm(prev => ({ ...prev, model: list[0].value }));
      })
      .catch(() => setModels([]));
  }, []);

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof CreateAgentForm, string>> = {};
    if (!form.name.trim()) nextErrors.name = '请输入智能体名称';
    if (!form.description.trim()) nextErrors.description = '请输入智能体简介';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const app = await bffService.application.createApplication({
        name: form.name.trim(),
        description: form.description.trim(),
        datasetId: form.knowledgeBaseId || undefined,
        model: form.model,
        prompt: form.prompt.trim(),
      });

      const newAgent = mapApplicationToMyAgent(app);
      newAgent.model = form.model;
      newAgent.systemPrompt = form.prompt.trim();
      newAgent.knowledgeBaseId = form.knowledgeBaseId || undefined;

      onSave(newAgent);
    } catch (err) {
      const message = err instanceof Error ? err.message : '创建应用失败';
      setErrors(prev => ({ ...prev, name: message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = <K extends keyof CreateAgentForm>(key: K, value: CreateAgentForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F5F6F7]">
      <header className="h-14 flex items-center justify-between px-5 bg-white border-b border-[#DEE0E3] flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F6F7] text-[#8F959E] hover:text-[#3370FF] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#3370FF]" />
            <h1 className="text-base font-semibold text-[#1F2329]">新建智能体</h1>
          </div>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-[#3370FF] hover:bg-[#2860E0] text-white h-9 px-4"
        >
          <Save className="w-4 h-4 mr-1.5" />
          保存
        </Button>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-xl border border-[#DEE0E3] p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="agent-name" className="text-sm font-medium text-[#1F2329]">
              智能体名称 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="agent-name"
              value={form.name}
              onChange={e => updateField('name', e.target.value)}
              placeholder="例如：合同审查助手"
              className={`h-10 ${errors.name ? 'border-red-500 focus-visible:ring-red-200' : ''}`}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent-desc" className="text-sm font-medium text-[#1F2329]">
              智能体简介 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="agent-desc"
              value={form.description}
              onChange={e => updateField('description', e.target.value)}
              placeholder="简要描述这个智能体的用途，例如：帮助法务团队快速审查合同条款风险。"
              rows={3}
              className={`resize-none ${errors.description ? 'border-red-500 focus-visible:ring-red-200' : ''}`}
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent-prompt" className="text-sm font-medium text-[#1F2329]">
              提示词
            </Label>
            <Textarea
              id="agent-prompt"
              value={form.prompt}
              onChange={e => updateField('prompt', e.target.value)}
              placeholder="输入系统提示词，定义智能体的角色、能力边界和回答风格..."
              rows={8}
              className="resize-none font-mono text-sm"
            />
            <p className="text-xs text-[#8F959E]">
              提示词仓库中的模板可以直接填充到这里，快速创建不同场景的智能体。
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-[#1F2329]">
              <Bot className="w-4 h-4 text-[#3370FF]" />
              使用模型
            </div>
            <Select value={form.model} onValueChange={v => updateField('model', v)}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder={models.length === 0 ? '暂无可用模型' : '选择模型'} />
              </SelectTrigger>
              <SelectContent>
                {models.map(m => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-[#1F2329]">
              <Database className="w-4 h-4 text-[#3370FF]" />
              使用知识库
            </div>
            <Select value={form.knowledgeBaseId} onValueChange={v => updateField('knowledgeBaseId', v)}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="选择知识库" />
              </SelectTrigger>
              <SelectContent>
                {datasets.map(ds => (
                  <SelectItem key={ds.id} value={ds.id}>
                    {ds.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </main>
    </div>
  );
}
