# 新建智能体与提示词仓库设计文档

## 背景
当前左侧导航存在“配置管理”入口，但其页面只是硬编码编辑一个固定智能体配置，没有真正“创建新智能体”的能力。为了降低用户创建智能体的门槛，需要：
1. 将“配置管理”改造为“新建智能体”。
2. 新增“提示词仓库”，提供可复用的提示词模板，点击后自动跳转到新建智能体并预填提示词。

## 目标
- 用户能通过简洁表单创建属于自己的智能体。
- 必填项：智能体名称、智能体简介。
- 选填项：提示词、使用模型、使用知识库。
- 提示词仓库以模板卡片形式展示，点击模板直接带入提示词。
- 保存成功后跳转到“我的智能体”列表，新智能体可见。

## 交互确认
以下问题已与需求方确认：
- 提示词仓库交互方式：**一键创建**（点击模板 → 跳转新建智能体并预填提示词）。
- 新建智能体布局：**全屏编辑**（隐藏中间栏，右侧整个区域为表单）。
- 知识库选择：**单选顶层组织**（使用现有 `knowledgeOrgTree` 根节点）。
- 保存后反馈：**跳转我的智能体**。

## 架构设计

### 导航与模块
- `NavModule` 类型增加 `'createAgent' | 'promptRepo'`，移除 `'agentConfig'`。
- 侧边栏：
  - “配置管理” → “新建智能体”，图标 `Sparkles`。
  - 新增“提示词仓库”，图标 `FileText`。
- `App.tsx` 中新增对 `createAgent` 和 `promptRepo` 的渲染分支，并在这两个模块下隐藏中间栏。

### 新建智能体表单
新建组件 `CreateAgentModule.tsx`：
- 字段：
  1. 智能体名称（必填，输入框）
  2. 智能体简介（必填，文本域）
  3. 提示词（文本域）
  4. 使用模型：厂商 + 模型两级 `Select`（数据源 `availableLLMs`）
  5. 使用知识库：单选 `Select`（数据源 `knowledgeOrgTree` 顶层组织）
- 校验：保存时检查必填项，未通过则显示红色提示。
- 提交：生成 `MyAgent` 对象并加入 `addedAgents` 状态，随后 `setActiveModule('myAgents')`。

### 提示词仓库
新建组件 `PromptRepoModule.tsx`：
- 展示预置模板列表（卡片/列表）。
- 模板数据结构存于 `frontend/src/data/promptTemplates.ts`。
- 点击模板时，调用 `onUseTemplate(template.prompt)`，父组件 `App.tsx` 保存待填充提示词并切换到 `createAgent`。

### 数据模型
复用现有类型：
- `MyAgent`：基础信息字段。
- 扩展运行时字段（类型断言或扩展接口）：`provider`、`model`、`systemPrompt`、`knowledgeBaseId`。

### 状态管理
- `App.tsx` 中已有 `addedAgents` 状态，新建智能体直接 `setAddedAgents(prev => [agent, ...prev])`。
- 预填充提示词使用本地状态 `pendingPrompt`，在切换到 `createAgent` 时作为 `initialPrompt` 传入。

## 文件变更
- 新增：`frontend/src/components/modules/CreateAgentModule.tsx`
- 新增：`frontend/src/components/modules/PromptRepoModule.tsx`
- 新增：`frontend/src/data/promptTemplates.ts`
- 修改：`frontend/src/types/index.ts`
- 修改：`frontend/src/components/layout/Sidebar.tsx`
- 修改：`frontend/src/App.tsx`
- 删除：`frontend/src/components/modules/AgentConfigManager.tsx` 及其子目录（原配置管理功能不再使用）

## 验证标准
- `npm run lint` 无错误。
- `npx tsc -b` 无类型错误。
- `npm run build` 构建成功。
- 运行后：
  - 第一栏能看到“新建智能体”和“提示词仓库”。
  - 点击“新建智能体”显示全屏表单，必填项未填时无法保存。
  - 点击“提示词仓库”模板后跳转到新建智能体，提示词已填充。
  - 保存后跳转到“我的智能体”，新智能体出现在列表中。
