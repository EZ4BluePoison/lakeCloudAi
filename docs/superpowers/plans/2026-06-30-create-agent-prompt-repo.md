# 新建智能体与提示词仓库实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有“配置管理”改造为“新建智能体”，新增“提示词仓库”，支持点击模板一键创建智能体。

**Architecture:** 用两个新模块组件替换旧配置管理组件；导航类型扩展为 `'createAgent' | 'promptRepo'`；`App.tsx` 统一管理模块切换和智能体数据；复用现有模型与知识库数据。

**Tech Stack:** React 19 + TypeScript + Tailwind CSS + shadcn/ui

---

### Task 1: 更新类型定义

**Files:**
- Modify: `frontend/src/types/index.ts`

- [ ] **Step 1: 调整 `NavModule` 类型**

```ts
export type NavModule =
  | 'messages'
  | 'myAgents'
  | 'agentPlaza'
  | 'knowledgeBase'
  | 'superAgent'
  | 'createAgent'
  | 'promptRepo';
```

- [ ] **Step 2: 扩展 `MyAgent` 运行时字段**

在 `MyAgent` 接口中追加以下可选字段：

```ts
export interface MyAgent {
  // ... existing fields
  provider?: string;
  model?: string;
  systemPrompt?: string;
  knowledgeBaseId?: string;
}
```

- [ ] **Step 3: 提交**

```bash
git add frontend/src/types/index.ts
git commit -m "types: add createAgent/promptRepo modules and extend MyAgent runtime fields"
```

---

### Task 2: 新增提示词模板数据

**Files:**
- Create: `frontend/src/data/promptTemplates.ts`

- [ ] **Step 1: 写入模板数据**

```ts
export interface PromptTemplateItem {
  id: string;
  category: string;
  title: string;
  description: string;
  prompt: string;
}

export const promptTemplates: PromptTemplateItem[] = [
  {
    id: 'general-qa',
    category: '通用办公',
    title: '通用问答助手',
    description: '回答日常办公中的各类问题，风格简洁专业。',
    prompt: '你是一位专业的办公助手，请用简洁、准确的中文回答用户的问题。',
  },
  {
    id: 'copywriting',
    category: '文案创作',
    title: '文案创作助手',
    description: '根据需求生成营销文案、邮件、公告等内容。',
    prompt: '你是一位资深文案策划，擅长撰写各类商业文案。请根据用户描述输出符合场景的内容。',
  },
  {
    id: 'code-helper',
    category: '编程开发',
    title: '代码助手',
    description: '帮助解释代码、排查问题、生成示例代码。',
    prompt: '你是一位经验丰富的软件工程师，擅长代码审查、Bug 排查和代码示例生成。',
  },
  {
    id: 'data-analysis',
    category: '数据分析',
    title: '数据分析助手',
    description: '协助理解数据、生成分析思路与可视化建议。',
    prompt: '你是一位数据分析师，能够帮助用户理解数据含义、设计分析思路并给出可视化建议。',
  },
  {
    id: 'contract-review',
    category: '法务合规',
    title: '合同审查助手',
    description: '识别合同条款风险并给出修改建议。',
    prompt: '你是一位法务顾问，擅长合同审查。请帮助用户识别合同条款中的潜在风险并给出修改建议。',
  },
];
```

- [ ] **Step 2: 提交**

```bash
git add frontend/src/data/promptTemplates.ts
git commit -m "data: add prompt templates repository"
```

---

### Task 3: 更新侧边栏导航

**Files:**
- Modify: `frontend/src/components/layout/Sidebar.tsx`

- [ ] **Step 1: 引入新图标**

```ts
import { Sparkles, FileText } from 'lucide-react';
```

- [ ] **Step 2: 替换/新增导航项**

将 `mainNavItems` 中 `{ id: 'agentConfig', label: '配置管理', icon: Settings2 }` 替换为：

```ts
{ id: 'createAgent', label: '新建智能体', icon: Sparkles },
{ id: 'promptRepo', label: '提示词仓库', icon: FileText },
```

- [ ] **Step 3: 提交**

```bash
git add frontend/src/components/layout/Sidebar.tsx
git commit -m "ui(sidebar): replace config manager with create agent and prompt repo entries"
```

---

### Task 4: 更新 App.tsx 模块路由与状态

**Files:**
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: 引入新组件并移除旧配置管理引用**

```ts
import { CreateAgentModule } from '@/components/modules/CreateAgentModule';
import { PromptRepoModule } from '@/components/modules/PromptRepoModule';
// 删除 AgentConfigManager import
```

- [ ] **Step 2: 隐藏中间栏逻辑**

```ts
const isPlazaActive =
  activeModule === 'agentPlaza' ||
  activeModule === 'superAgent' ||
  activeModule === 'createAgent' ||
  activeModule === 'promptRepo';
```

- [ ] **Step 3: 新增预填充提示词状态与保存回调**

```ts
const [pendingPrompt, setPendingPrompt] = useState('');

const handleUsePromptTemplate = useCallback((prompt: string) => {
  setPendingPrompt(prompt);
  setActiveModule('createAgent');
}, []);

const handleSaveAgent = useCallback((agent: MyAgent) => {
  setAddedAgents(prev => {
    if (prev.find(a => a.id === agent.id)) return prev;
    return [agent, ...prev];
  });
  setPendingPrompt('');
  setActiveModule('myAgents');
}, []);
```

- [ ] **Step 4: 替换 `agentConfig` 渲染分支**

```tsx
{activeModule === 'createAgent' && (
  <motion.div
    key="create-agent"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    className="flex-1 flex flex-col min-h-0"
  >
    <CreateAgentModule
      initialPrompt={pendingPrompt}
      onBack={() => {
        setPendingPrompt('');
        setActiveModule('agentPlaza');
      }}
      onSave={handleSaveAgent}
    />
  </motion.div>
)}

{activeModule === 'promptRepo' && (
  <motion.div
    key="prompt-repo"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    className="flex-1 flex flex-col min-h-0"
  >
    <PromptRepoModule
      onBack={() => setActiveModule('agentPlaza')}
      onUseTemplate={handleUsePromptTemplate}
    />
  </motion.div>
)}
```

- [ ] **Step 5: 移除 `configAgentId` 及 `handleConfigAgent` 相关代码**

删除 `setConfigAgentId`、`configAgentId`、`handleConfigAgent`、`AgentConfigManager` 渲染分支。

- [ ] **Step 6: 提交**

```bash
git add frontend/src/App.tsx
git commit -m "feat(app): wire create agent and prompt repo modules, remove old config manager"
```

---

### Task 5: 创建提示词仓库组件

**Files:**
- Create: `frontend/src/components/modules/PromptRepoModule.tsx`

- [ ] **Step 1: 实现组件**

```tsx
import { ArrowLeft, FileText } from 'lucide-react';
import { promptTemplates } from '@/data/promptTemplates';

interface PromptRepoModuleProps {
  onBack: () => void;
  onUseTemplate: (prompt: string) => void;
}

export function PromptRepoModule({ onBack, onUseTemplate }: PromptRepoModuleProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F5F6F7]">
      <header className="h-14 flex items-center gap-3 px-5 bg-white border-b border-[#DEE0E3] flex-shrink-0">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F6F7] text-[#8F959E] hover:text-[#3370FF] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#3370FF]" />
          <h1 className="text-base font-semibold text-[#1F2329]">提示词仓库</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {promptTemplates.map(t => (
            <button
              key={t.id}
              onClick={() => onUseTemplate(t.prompt)}
              className="text-left bg-white rounded-xl border border-[#DEE0E3] p-5 hover:border-[#3370FF] hover:shadow-sm transition-all group"
            >
              <div className="text-xs font-medium text-[#3370FF] mb-2">{t.category}</div>
              <h3 className="text-sm font-semibold text-[#1F2329] mb-2 group-hover:text-[#3370FF]">
                {t.title}
              </h3>
              <p className="text-xs text-[#8F959E] line-clamp-2 mb-4">{t.description}</p>
              <p className="text-xs text-[#C9CDD4] line-clamp-2 font-mono bg-[#F5F6F7] rounded p-2">
                {t.prompt}
              </p>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add frontend/src/components/modules/PromptRepoModule.tsx
git commit -m "feat: add prompt repository module"
```

---

### Task 6: 创建新建智能体组件

**Files:**
- Create: `frontend/src/components/modules/CreateAgentModule.tsx`

- [ ] **Step 1: 实现组件**

```tsx
import { useState } from 'react';
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
import { availableLLMs } from '@/data/agentConfigs';
import { knowledgeOrgTree } from '@/data/agents';
import type { MyAgent } from '@/types';

export interface CreateAgentForm {
  name: string;
  description: string;
  prompt: string;
  provider: string;
  model: string;
  knowledgeBaseId: string;
}

export interface CreateAgentModuleProps {
  initialPrompt?: string;
  onBack: () => void;
  onSave: (agent: MyAgent) => void;
}

export function CreateAgentModule({ initialPrompt = '', onBack, onSave }: CreateAgentModuleProps) {
  const [form, setForm] = useState<CreateAgentForm>({
    name: '',
    description: '',
    prompt: initialPrompt,
    provider: availableLLMs[0].provider,
    model: availableLLMs[0].models[0],
    knowledgeBaseId: knowledgeOrgTree[0]?.id ?? '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateAgentForm, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProvider = availableLLMs.find(p => p.provider === form.provider) ?? availableLLMs[0];

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
    await new Promise(r => setTimeout(r, 400));

    const now = new Date().toISOString();
    const newAgent: MyAgent = {
      id: `my-${Date.now()}`,
      name: form.name.trim(),
      icon: 'Bot',
      iconBg: 'bg-[#3370FF]',
      description: form.description.trim(),
      permission: 'private',
      creator: '当前用户',
      department: '本部门',
      createdAt: now,
      callCount: 0,
      provider: form.provider,
      model: form.model,
      systemPrompt: form.prompt.trim(),
      knowledgeBaseId: form.knowledgeBaseId || undefined,
    };

    onSave(newAgent);
    setIsSubmitting(false);
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-[#8F959E]">模型厂商</Label>
                <Select
                  value={form.provider}
                  onValueChange={v => {
                    const provider = availableLLMs.find(p => p.provider === v)!;
                    setForm(prev => ({ ...prev, provider: v, model: provider.models[0] }));
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="选择厂商" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLLMs.map(p => (
                      <SelectItem key={p.provider} value={p.provider}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-[#8F959E]">模型</Label>
                <Select value={form.model} onValueChange={v => updateField('model', v)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="选择模型" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProvider.models.map(m => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
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
                {knowledgeOrgTree.map(org => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
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
```

- [ ] **Step 2: 提交**

```bash
git add frontend/src/components/modules/CreateAgentModule.tsx
git commit -m "feat: add create agent module with validation"
```

---

### Task 7: 清理旧配置管理组件

**Files:**
- Delete: `frontend/src/components/modules/AgentConfigManager.tsx`
- Delete: `frontend/src/components/modules/config/*`

- [ ] **Step 1: 删除旧文件**

```bash
rm -rf frontend/src/components/modules/AgentConfigManager.tsx frontend/src/components/modules/config
```

- [ ] **Step 2: 提交**

```bash
git add -A
git commit -m "chore: remove deprecated agent config manager and config tabs"
```

---

### Task 8: 构建验证

- [ ] **Step 1: 运行 lint**

```bash
cd frontend && npm run lint
```

预期：无错误。

- [ ] **Step 2: 运行类型检查**

```bash
npx tsc -b
```

预期：无类型错误。

- [ ] **Step 3: 运行生产构建**

```bash
npm run build
```

预期：构建成功。

- [ ] **Step 4: 提交修复（如有）并推送**

```bash
git add -A
git commit -m "fix: resolve lint/type errors for create agent and prompt repo" || true
git push origin version1.001
```

---

## 验证标准
- 侧边栏显示“新建智能体”和“提示词仓库”。
- 点击“新建智能体”进入全屏表单，必填未填时保存按钮触发校验提示。
- 点击“提示词仓库”模板后跳转“新建智能体”，提示词已预填。
- 保存成功后跳转到“我的智能体”，新智能体出现在列表首位。
- `npm run lint`、`npx tsc -b`、`npm run build` 全部通过。
