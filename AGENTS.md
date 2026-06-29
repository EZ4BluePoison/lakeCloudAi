# AGENTS.md — 太湖云 AI 企业智能体

> 本文件面向 AI 编码助手。项目中的注释、文档、方案主要以中文撰写，因此本文件使用中文。
> 以下结论均基于当前代码库实际内容，而非 README 或方案中的规划描述。

---

## 1. 项目概述

**项目名称**：太湖云 AI 企业智能体（Taihu Cloud AI Enterprise）

这是一个前后端分离的 AI 企业智能体平台雏形，目标功能包括：

- 🤖 超级助手（全局 AI 对话入口）
- 💬 消息 / 多轮对话管理
- 🤖 我的智能体（已添加的个性化智能体）
- 🏪 智能体广场（公开智能体浏览、收藏、添加）
- 📚 知识库（企业知识文件浏览）
- 🛠️ 工作台（自定义智能体、统计面板、工作流编排）
- ⚙️ 智能体配置管理（Prompt、LLM、知识源、行为等）

**当前成熟度**：前端已具备可运行的 UI 与本地/外部模型调用骨架，后端仅为 Spring Boot 脚手架（实体 + 空 Mapper），尚未实现控制器、业务层、配置类与测试。

---

## 2. 技术栈与关键配置

### 2.1 前端（`frontend/`）

| 层级 | 实际选型 | 备注 |
|------|----------|------|
| 构建工具 | Vite 7.2.4 | `vite.config.ts`，dev server 端口 `3000`，base 为 `./` |
| 框架 | React 19.2.0 + TypeScript ~5.9.3 | `main.tsx` 挂载根组件 |
| 路由 | `react-router` 已安装，但 **未使用** | 当前用 `App.tsx` 的 `NavModule` 状态做模块切换 |
| 样式 | Tailwind CSS 3.4.19 + PostCSS + `tailwindcss-animate` | 配置见 `tailwind.config.js`、`postcss.config.js` |
| UI 组件 | shadcn/ui（style `new-york`，baseColor `slate`）+ Radix UI 全套 primitive | 组件集中在 `src/components/ui/*` |
| 图标 | Lucide React | — |
| 动画 | Framer Motion | — |
| 状态管理 | Zustand 5.0.14（含 `persist` 中间件） | `src/store/conversationStore.ts` |
| 表单 | React Hook Form + Zod + `@hookform/resolvers` | — |
| 图表/工作流 | Recharts、@xyflow/react | — |
| Lint | ESLint 9 flat config | `eslint.config.js` |

**关键配置文件**：

- `frontend/package.json`
- `frontend/vite.config.ts`
- `frontend/tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json`
- `frontend/tailwind.config.js`
- `frontend/postcss.config.js`
- `frontend/components.json`（shadcn/ui 配置）
- `frontend/eslint.config.js`
- `frontend/.env.ai.template`（环境变量模板，见第 7 节）

### 2.2 后端（`backend/`）

| 层级 | 实际选型 | 备注 |
|------|----------|------|
| 构建工具 | Apache Maven | `backend/pom.xml` |
| 框架 | Spring Boot 2.7.18 | parent |
| 语言 | Java 8 | `java.version` = `1.8` |
| Web | Spring Boot Starter Web | 嵌入 Tomcat，端口 `8080` |
| ORM | MyBatis Spring Boot Starter 2.3.1 | 配置见 `application.yml` |
| 数据库 | PostgreSQL | `init.sql` 提供建表与示例数据 |
| 缓存 | Redis | `localhost:6379`，DB 0 |
| 工具 | Lombok | optional |
| 测试 | `spring-boot-starter-test` 已声明 | 但 `src/test/` 不存在 |

**关键配置文件**：

- `backend/pom.xml`
- `backend/src/main/resources/application.yml`
- `backend/src/main/resources/db/init.sql`

### 2.3 与 README / 方案声明的差异

- README 称前端使用 **React 18 + Ant Design 5**，实际为 **React 19 + Tailwind CSS + shadcn/ui**。
- README 称使用 **React Router 6 / Axios**，实际未使用（路由由模块状态驱动，聊天直接 `fetch` 调用 Ollama）。
- README / `.trae/documents/lakeCloudAi_plan.md` 规划了 `controller/`、`service/`、`config/` 等包，后端实际只有 `entity/` 与 `mapper/`。
- 规划中的 Spring Security、DTO、XML Mapper、测试等尚未落地。

---

## 3. 目录结构与代码组织

### 3.1 项目根

```
lakeCloudAi/
├── .trae/documents/           # Trae 生成的方案与计划文档
├── backend/                   # Spring Boot 后端
├── docs/                      # 知识问答助手功能增强实现方案
├── frontend/                  # React + Vite 前端
├── AGENTS.md                  # 本文件
└── README.md                  # 项目简介（部分描述偏规划）
```

### 3.2 前端目录

```
frontend/
├── public/                    # 静态资源（logo 图片）
├── src/
│   ├── App.tsx                # 根组件：模块切换与全局状态
│   ├── main.tsx               # React 挂载入口
│   ├── index.css              # Tailwind 指令 + CSS 变量（Feishu 风格）
│   ├── App.css                # 少量应用级样式
│   ├── components/
│   │   ├── layout/Sidebar.tsx               # 左侧导航
│   │   ├── modules/                         # 业务模块组件
│   │   │   ├── AgentConfigManager.tsx
│   │   │   ├── AgentPlazaModule.tsx
│   │   │   ├── KnowledgeBaseModule.tsx
│   │   │   ├── MessagesModule.tsx
│   │   │   ├── MyAgentsModule.tsx
│   │   │   ├── SuperAgentModule.tsx
│   │   │   └── config/                      # 智能体配置子标签
│   │   │       ├── BasicSettingsTab.tsx
│   │   │       ├── BehaviorSettingsTab.tsx
│   │   │       ├── KnowledgeSourceTab.tsx
│   │   │       ├── LLMConfigTab.tsx
│   │   │       ├── OllamaConfigPanel.tsx
│   │   │       ├── PreviewTab.tsx
│   │   │       └── PromptEditorTab.tsx
│   │   └── ui/                              # 50+ shadcn/ui 组件
│   ├── data/
│   │   ├── agents.ts                        # Mock 智能体、组织树、知识库
│   │   ├── agentConfigs.ts                  # 默认配置、模型元数据
│   │   └── agentPrompts.ts                  # 提示词模板
│   ├── hooks/
│   │   ├── use-mobile.ts
│   │   ├── useAgent.ts
│   │   └── useAgentIcon.ts
│   ├── lib/utils.ts                         # `cn()` 工具函数
│   ├── pages/Home.tsx                       # Vite 模板默认页（未使用）
│   ├── services/
│   │   ├── agentService.ts                  # 图标/规范化
│   │   ├── chatService.ts                   # Ollama 聊天 + 跟进问题
│   │   ├── modelService.ts                  # 模型服务抽象（Ollama + mock）
│   │   └── ollamaService.ts                 # Ollama 客户端封装
│   ├── store/conversationStore.ts           # 对话状态（localStorage 持久化）
│   └── types/index.ts                       # 全项目 TS 类型
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── components.json
├── eslint.config.js
├── .env.ai.template
└── .gitignore
```

### 3.3 后端目录

```
backend/
├── pom.xml
└── src/main/
    ├── java/com/lakecloud/ai/
    │   ├── LakeCloudAiApplication.java
    │   ├── entity/                # 5 个实体类
    │   │   ├── Agent.java
    │   │   ├── Conversation.java
    │   │   ├── Knowledge.java
    │   │   ├── Message.java
    │   │   └── User.java
    │   └── mapper/                # 5 个 MyBatis Mapper 接口
    │       ├── AgentMapper.java
    │       ├── ConversationMapper.java
    │       ├── KnowledgeMapper.java
    │       ├── MessageMapper.java
    │       └── UserMapper.java
    └── resources/
        ├── application.yml
        └── db/init.sql
```

**后端当前重要事实**：

- Mapper 接口标注了 `@Mapper`，但 **没有 `@Select` / `@Insert` 等 SQL 注解**，且 `resources/mapper/*.xml` 目录不存在。
- `application.yml` 中 `mybatis.mapper-locations: classpath:mapper/*.xml`，若调用 Mapper 方法会报错。
- 没有 `controller/`、`service/`、`config/`、`dto/`、`util/` 包。
- 没有 `src/test/` 目录。

---

## 4. 构建与运行命令

### 4.1 前端

```bash
cd frontend
npm install

# 开发服务器，默认 http://localhost:3000
npm run dev

# 类型检查 + 生产构建，产物在 dist/
npm run build

# ESLint 检查
npm run lint

# 预览构建产物
npm run preview
```

### 4.2 后端

前置条件：Java 8、Maven、PostgreSQL、Redis。

```bash
# 初始化数据库（在 PostgreSQL 中执行）
psql -U postgres -d lakecloud_ai -f backend/src/main/resources/db/init.sql

# 启动开发服务器，默认 http://localhost:8080
cd backend
mvn spring-boot:run

# 打包可执行 JAR
cd backend
mvn clean package

# 运行 JAR
java -jar target/ai-enterprise-1.0.0.jar
```

### 4.3 本地完整运行

1. 启动 PostgreSQL（数据库名 `lakecloud_ai`，默认用户/密码见 `application.yml`）。
2. 启动 Redis（默认 `localhost:6379`，无密码）。
3. 执行 `backend/src/main/resources/db/init.sql`。
4. 启动后端：`cd backend && mvn spring-boot:run`。
5. 启动前端：`cd frontend && npm run dev`。
6. 若需要真实 AI 回复，需本地启动 Ollama（默认 `http://localhost:11434`，模型 `qwen2.5:7b-instruct-q4_K_M`）。

> 前端内置了 Mock 数据与模型 fallback，即使后端和 Ollama 都未启动，也能预览界面。

---

## 5. 测试说明

**当前状态：项目没有测试。**

- 后端：
  - `pom.xml` 已声明 `spring-boot-starter-test`（JUnit 5 + Spring Boot Test）。
  - 但 `backend/src/test/` 不存在。
- 前端：
  - `package.json` 没有 `test` 脚本。
  - 未安装 `vitest`、`jest`、`cypress`、`playwright`。

**建议后续补充**：

- 后端：在 `backend/src/test/java/com/lakecloud/ai/` 下添加单元测试与 `@SpringBootTest` 集成测试。
- 前端：可引入 Vitest + React Testing Library 进行组件/Hook 测试，Playwright 进行 E2E 测试。

---

## 6. 开发规范与代码风格

### 6.1 前端

- **模块导入**：统一使用 `@/` 路径别名指向 `frontend/src`。
- **样式**：Tailwind CSS 工具类优先；颜色、圆角、动画使用 CSS 变量（见 `src/index.css`）。
- **组件**：
  - shadcn/ui 组件统一放在 `src/components/ui/`。
  - 业务模块组件放在 `src/components/modules/`。
  - 使用 `cn()`（`src/lib/utils.ts`）合并 Tailwind 类名。
- **类型**：所有业务类型集中在 `src/types/index.ts`。
- **状态**：全局对话状态用 Zustand + `persist` 持久化到 `localStorage`（key：`conversation-storage`）。
- **注释**：源码中以中文注释为主。
- **Lint**：ESLint 9 flat config，运行 `npm run lint`。

### 6.2 后端

- **包名**：根包 `com.lakecloud.ai`。
- **实体**：使用 Lombok `@Data`，字段命名驼峰，类型 `java.time.LocalDateTime`。
- **Mapper**：MyBatis Mapper 接口应放在 `com.lakecloud.ai.mapper`，并在 `LakeCloudAiApplication` 上通过 `@MapperScan("com.lakecloud.ai.mapper")` 扫描。
- **配置**：数据库、Redis、MyBatis 配置集中在 `application.yml`。
- **日志**：通过 `logging.level.com.lakecloud.ai: debug` 控制，无独立 `logback-spring.xml`。

### 6.3 版本控制

- `frontend/.gitignore` 已忽略 `node_modules/`、`dist/`、`* .local` 等。
- 请勿提交 `.env`、API Key、数据库密码等敏感信息。

---

## 7. 安全注意事项

- **敏感配置明文存储**：
  - `backend/src/main/resources/application.yml` 中数据库用户名/密码为 `postgres/postgres`，且未使用环境变量。
  - Redis 配置未设置密码。
  - 生产环境应改为环境变量、Docker Secrets 或外部配置中心。
- **API Key**：
  - `frontend/.env.ai.template` 包含 AI 应用 ID、Key、模型路径、API 端点等模板变量。
  - 该模板中的变量目前**未被前端服务层读取**；实际代码在 `chatService.ts` / `modelService.ts` 中硬编码了 Ollama 地址与模型名。
  - 若后续接入外部 LLM，应避免在浏览器前端直接存放真实 API Key，建议由后端代理转发。
- **认证与授权**：
  - 后端目前没有任何认证（Spring Security 未引入）。
  - 数据库 `users` 表只有示例数据，密码字段虽使用 bcrypt 风格哈希，但登录逻辑未实现。
- **输入校验**：
  - 后端无 Controller/DTO，暂无输入校验。
  - 新增接口时应使用 `spring-boot-starter-validation`（已依赖）+ `@Valid`。
- **HTTPS / CORS**：未配置，生产环境需要补充。

---

## 8. 已知缺口与待办

| 区域 | 缺口 |
|------|------|
| 后端业务层 | 缺少 Controller、Service、DTO、Config、Util |
| 后端数据层 | Mapper 未写 SQL / XML，`resources/mapper/` 不存在 |
| 后端安全 | 缺少 Spring Security、JWT/Session、权限校验 |
| 后端测试 | 无测试目录与测试用例 |
| 后端部署 | 无 Dockerfile、docker-compose、CI/CD |
| 前端路由 | `react-router` 已安装但未使用，模块切换由状态驱动 |
| 前端 API 集成 | 尚未对接后端 REST API；聊天直接访问 Ollama localhost |
| 前端环境变量 | `.env.ai.template` 变量未接入服务层 |
| 前端测试 | 无测试框架与测试用例 |
| 部署运维 | 无 nginx 配置、无容器化、无健康检查 |

开发计划文档（供参考）：

- `docs/knowledge-assistant-enhancement-plan.md`：知识问答助手功能增强实现方案，包括 LLM 集成、对话上下文、数据库表设计等。
- `.trae/documents/lakeCloudAi_plan.md` 与 `.trae/documents/智能体配置管理系统_plan.md`：项目总体规划与后端 API 设计。
- `.trae/documents/frontend_init_plan.md`：前端初始化计划。

---

## 9. 给后续开发者的快速提示

1. **修改后端接口时**：先补齐 Mapper 的 SQL（注解或 XML），再新增 Service/Controller。
2. **修改前端聊天逻辑时**：重点关注 `src/services/chatService.ts`、`src/services/modelService.ts`、`src/store/conversationStore.ts`。
3. **新增 shadcn/ui 组件时**：遵循现有 `src/components/ui/` 的样式约定，使用 `cn()` 合并类名。
4. **接入后端 API 时**：建议在 `src/services/` 中新增统一 HTTP 客户端（如 axios/fetch 封装），并替换当前对 Ollama 的直接调用。
5. **运行前检查**：确保 PostgreSQL、Redis、Ollama 服务与 `application.yml` 中的地址/端口一致。
