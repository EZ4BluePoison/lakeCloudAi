# 前端一阶段收尾 + 二阶段调研规划

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 明确前端在“一阶段收尾”和“二阶段调研”中需要承担的工作范围、依赖条件和优先级，为下周全员试用做准备。

**Architecture:** 在现有 React + Vite + TypeScript + Tailwind + shadcn/ui 基础上，补齐语音输入、用户/组织/权限管理、模型响应调优等能力；二阶段以前端视角跟进移动端、Langchain/Langgraph 工作流编排和 爱马仕 技能集成。

**Tech Stack:** React 19、Vite 7、TypeScript 5.9、Tailwind CSS 3.4、shadcn/ui、Zustand（conversationStore）、React Router（如后续需要）、@xenova/transformers。

---

## 一、当前已完成的前端能力（基线）

- 聊天统一走后端 BFF 工作流/聊天 SSE 接口，已支持真流式 + 打字机兜底。
- 应用列表分页/搜索、智能体广场、知识库文档上传/删除/预览（PDF/图片/Office/文本）。
- 创建智能体时直接按模型类型拉取模型列表。
- 语音输入 Hook（`useWhisperSTT`）和按钮（`VoiceInputButton`）已接入超级助手和消息模块输入框。
- 所有 Console API 已带 Bearer Token；Token 缺失时由后端处理鉴权。

---

## 二、一阶段剩余任务（前端）

### 2.1 语音输入接入完善

**目标：** 让语音输入在桌面端稳定可用，并为移动端预留扩展点。

**现状问题：**
- `useWhisperSTT` 会下载 `@xenova/transformers` 模型，首次加载慢且没有 Loading/错误提示。
- 目前只在 `MessagesModule` 和 `SuperAgentModule` 输入框接入，新建智能体提示词、搜索框等可输入场景未接入。
- 缺少录音状态（录音中/识别中/失败重试）的明确反馈。

**前端工作：**

- [ ] **Step 1: 语音状态与错误处理增强**
  - 文件：`frontend/src/hooks/useWhisperSTT.ts`
  - 增加 `recording` / `transcribing` / `error` 状态；识别失败时允许重试。
- [ ] **Step 2: 全局语音按钮组件完善**
  - 文件：`frontend/src/components/ui/VoiceInputButton.tsx`
  - 增加录音倒计时、取消录音、模型加载中提示。
- [ ] **Step 3: 扩展接入场景**
  - 文件：`frontend/src/components/modules/CreateAgentModule.tsx`
  - 在“提示词”文本域旁增加语音输入按钮。
- [ ] **Step 4: 移动端兼容调研**
  - 确认 `MediaRecorder` / `getUserMedia` 在企微/钉钉/飞书内置浏览器中的兼容性。
- [ ] **Step 5: 性能与体验**
  - 对长语音做分段或限制最大时长；识别完成后自动发送或仅回填输入框（需产品确认）。

**依赖：**
- 后端是否提供云端 ASR 接口？如有，可替换本地 Whisper，降低前端 bundle 和首次加载时间。
- 需要确认全员试用场景下，用户更多使用桌面端还是移动端。

---

### 2.2 用户管理、组织架构管理、RBAC 权限管理集成

**目标：** 在前端落地“登录 → 用户 → 组织 → 角色 → 权限”闭环，使不同角色看到不同菜单/功能。

**前端工作：**

#### A. 登录与身份

- [ ] **Step 1: 登录态设计**
  - 文件：`frontend/src/services/authService.ts`（新建）
  - 对接后端登录接口（SSO/账号密码/飞书扫码？需确认），返回 `accessToken` 和用户信息。
- [ ] **Step 2: 全局权限上下文**
  - 文件：`frontend/src/store/authStore.ts`（新建）
  - 存储 `user` / `roles` / `permissions`；提供 `hasPermission('module:action')` 方法。
- [ ] **Step 3: 路由/菜单守卫**
  - 文件：`frontend/src/App.tsx` / `frontend/src/components/layout/Sidebar.tsx`
  - 根据权限动态渲染 Sidebar 菜单；无权限模块隐藏或置灰。

#### B. 用户管理页面

- [ ] **Step 4: 用户列表页**
  - 文件：`frontend/src/components/modules/UserManagementModule.tsx`（新建）
  - 表格展示：姓名、工号、部门、角色、状态；支持搜索/分页。
- [ ] **Step 5: 用户新增/编辑弹窗**
  - 选择所属部门、分配角色、启用/禁用。

#### C. 组织架构管理页面

- [ ] **Step 6: 组织树组件**
  - 文件：`frontend/src/components/modules/OrgManagementModule.tsx`（新建）
  - 左侧部门树，右侧成员列表；支持增删改查部门。

#### D. RBAC 权限管理页面

- [ ] **Step 7: 角色管理**
  - 文件：`frontend/src/components/modules/RoleManagementModule.tsx`（新建）
  - 角色列表、角色-权限绑定（复选框矩阵）。
- [ ] **Step 8: 权限点定义**
  - 文件：`frontend/src/constants/permissions.ts`（新建）
  - 前端权限枚举，例如 `agent:create`、`knowledge:delete`、`user:manage` 等。

**关键依赖（需后端提供）：**
- 登录接口与 Token 刷新机制。
- 用户 CRUD、部门 CRUD、角色 CRUD、权限列表接口。
- 当前登录用户的 `/me` 接口返回 `permissions`。

**建议最小可用（MVP）：**
- 先只做“管理员可见用户/组织/权限菜单，普通用户不可见”，即可支撑全员试用。
- 后续再细化到“谁能创建智能体、谁能删除知识库文档”等功能级权限。

---

### 2.3 模型响应时间调优（前端侧）

**目标：** 在模型和后端固定的情况下，通过前端优化让用户感觉“更快”。

**前端工作：**

- [ ] **Step 1: 首屏/首问优化**
  - 文件：`frontend/src/App.tsx`
  - 进入聊天页时预加载当前智能体对应的 `mode` 和 `appId`，避免发送第一条消息时才解析。
- [ ] **Step 2: 请求去重与取消**
  - 文件：`frontend/src/services/bffService.ts`
  - 对 `listApplications`、`getApplication` 等加短期缓存；用户快速切换时取消未完成请求。
- [ ] **Step 3: 流式感知优化**
  - 文件：`frontend/src/components/modules/MessagesModule.tsx`
  - 首字返回前显示骨架屏/闪烁光标；首字到达后立刻开始打字机，减少用户等待焦虑。
- [ ] **Step 4: 减少重渲染**
  - 对 `MessagesRightPanel` 做性能分析，必要时对消息列表使用 `React.memo` / 虚拟列表。
- [ ] **Step 5: 异常兜底与重试**
  - 对超时（如 15s 无首字）给出明确提示；网络抖动时自动重试一次。

**衡量指标：**
- 首字到达时间（TTFB）。
- 完整答案渲染完成时间。
- 长对话列表滚动帧率。

---

## 三、二阶段调研（前端视角）

### 3.1 移动端“苏小伴”部署与源码跟进

**前端需要搞清楚的问题：**

- [ ] **Step 1: 现有移动端形态**
  - 是 H5、微信小程序、Flutter App，还是混合 App（WebView 嵌入）？
  - 是否有现有源码仓库？技术栈是什么？
- [ ] **Step 2: 前端适配方案**
  - 若复用当前 React 前端：
    - 检查所有模块在 375px 宽度的可用性；
    - 是否需要 PWA / 钉钉/企微/飞书 JS-SDK 接入；
    - 语音输入在移动端的兼容性与体验。
  - 若为独立 App：
    - 前端提供 H5 页面供 WebView 加载，还是完全新写？
- [ ] **Step 3: 部署与发布链路**
  - 移动端如何发版？是否需要 CI/CD、热更新、灰度？

**输出物：**
- 《移动端技术选型与接入方案》文档。
- 列出当前前端需要改造的响应式/交互清单。

---

### 3.2 基于 Langchain / LangGraph 的工作流编排调研

**前端需要搞清楚的问题：**

- [ ] **Step 1: 后端编排能力边界**
  - 后端是否会提供工作流编排服务？
  - 工作流定义是 JSON/YAML，还是提供可视化接口？
- [ ] **Step 2: 前端是否需要可视化编排器**
  - 若需要：调研 `ReactFlow` / `xyflow` 等库，设计节点（LLM、知识库检索、条件分支、工具调用）和边。
  - 若不需要：前端只需要展示/选择预设工作流模板。
- [ ] **Step 3: 与现有智能体创建流程的结合**
  - 创建智能体时是否允许用户选择或编排工作流？
  - 运行时的输入输出如何映射到聊天界面？

**输出物：**
- 《工作流编排前端技术调研报告》。
- 原型图或组件清单（如需要可视化编排）。

---

### 3.3 爱马仕技能集成调研

**前端需要搞清楚的问题：**

- [ ] **Step 1: 爱马仕是什么**
  - 内部技能平台？外部 SaaS？API 形态如何？
  - 是否有 OpenAPI / Swagger 文档？
- [ ] **Step 2: 集成方式**
  - 是通过 MCP（Model Context Protocol）暴露工具，还是直接 HTTP 调用？
  - 认证方式是什么（Token、OAuth、签名）？
- [ ] **Step 3: 前端展示形态**
  - 技能是出现在智能体创建时的“工具选择”列表，还是聊天中的“/function”命令？
  - 技能执行结果如何渲染（卡片、表格、图表）？

**输出物：**
- 《爱马仕技能集成前端方案》。
- 所需后端接口清单。

---

## 四、优先级与下周建议

### 下周必须完成（支撑全员试用）

1. **RBAC 权限管理 MVP**：管理员 vs 普通用户菜单隔离。
2. **用户/组织架构管理页面**：至少能查看和简单管理。
3. **语音输入稳定可用**：Loading、错误提示、主要输入框接入。
4. **模型响应调优**：首字骨架屏、超时提示、请求去重。

### 建议排期

| 周次 | 重点任务 |
|------|----------|
| 第 1 周 | 用户/组织/权限 MVP + 语音输入完善 |
| 第 2 周 | 模型响应调优 + 权限细节补齐 + 全员试用问题修复 |
| 第 3 周起 | 二阶段调研（移动端、Langchain/LangGraph、爱马仕） |

---

## 五、需要确认/补充的信息

1. **Feishu 文档内容**：你贴的飞书链接我无法直接访问，建议把里面的prd、接口文档、权限矩阵粘贴到对话中。
2. **登录方式**：公司当前使用什么统一登录（飞书 SSO、钉钉、AD、自建账号）？
3. **后端接口**：用户/组织/权限相关接口是否已有 Swagger？
4. **移动端苏小伴**：现有源码仓库地址、技术栈、部署方式是什么？
5. **爱马仕**：是内部系统还是外部服务？是否有 API 文档？

---

## 六、风险提醒

- **RBAC 是一阶段最大新增模块**，如果后端接口下周无法就绪，建议先做“硬编码管理员角色”的 MVP，保证全员试用不阻塞。
- **语音输入的模型下载**在弱网/首次打开时体验差，建议和后端对齐是否有云端 ASR 方案。
- **移动端**如果决定复用当前 React 前端，需要一轮全面的响应式改造，建议单独排期，不要和一阶段功能混在一起。
