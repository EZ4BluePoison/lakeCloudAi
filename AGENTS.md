# AGENTS.md — 太湖云 AI 企业智能体

> 本文件面向 AI 编码助手。项目中的注释、文档、方案主要以中文撰写，因此本文件使用中文。
> 以下结论均基于当前代码库实际内容，而非 README 或方案中的规划描述。

---

## 1. 项目概述

**项目名称**：太湖云 AI 企业智能体（Taihu Cloud AI Enterprise）

这是一个面向国联集团等企业场景的前后端分离 AI 智能体平台雏形，目标功能包括：

- 🤖 超级助手：全局 AI 对话入口，支持意图识别并将问题路由到合适的业务智能体
- 💬 消息 / 多轮对话：历史会话列表、对话详情、反馈与后续问题推荐
- 🤖 我的智能体：从广场添加的个性化智能体管理
- 🏪 智能体广场：公开智能体浏览、收藏、添加与配置
- 📚 知识库：企业知识文件浏览与检索测试
- 🛠️ 工作台：自定义智能体、统计面板、工作流编排
- ⚙️ 智能体配置管理：Prompt、LLM、知识源、行为等配置

**当前成熟度**：

- 前端已具备可运行的 UI，内置 Mock 数据，可在无后端、无 AI 服务时预览完整界面。
- 后端已从纯脚手架演进为具备 LLM 代理能力的 Spring Boot 应用，目前实现了对「国联 AI（wuxidata）」外部模型的转发代理，并补齐了 MyBatis Mapper XML；但业务 Controller/Service（除聊天代理外）、认证鉴权、测试、容器化等尚未落地。

---

## 2. 技术栈与关键配置

### 2.1 前端（`frontend/`）

| 层级 | 实际选型 | 备注 |
|------|----------|------|
| 构建工具 | Vite 7.2.4 | `vite.config.ts`，dev server 端口 `3000`，base 为 `./` |
| 框架 | React 19.2.0 + TypeScript ~5.9.3 | `main.tsx` 挂载根组件 |
| 路由 | `react-router` 已安装，但 **未使用** | 当前用 `App.tsx` 的 `activeModule` 状态做模块切换 |
| 样式 | Tailwind CSS 3.4.19 + PostCSS + `tailwindcss-animate` | 配置见 `tailwind.config.js`、`postcss.config.js` |
| UI 组件 | shadcn/ui（style `new-york`，baseColor `slate`）+ Radix UI 全套 primitive | 组件集中在 `src/components/ui/*` |
| 图标 | Lucide React | — |
| 动画 | Framer Motion | — |
| 状态管理 | Zustand 5.0.14（含 `persist` 中间件） | `src/store/conversationStore.ts` |
| 表单 | React Hook Form + Zod + `@hookform/resolvers` | — |
| 图表/工作流 | Recharts、@xyflow/react | — |
| 开发插件 | `kimi-plugin-inspect-react` | Vite 插件，用于 Kimi 代码助手调试 |
| Lint | ESLint 9 flat config | `eslint.config.js` |

**关键配置文件**：

- `frontend/package.json`
- `frontend/vite.config.ts`
- `frontend/tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json`
- `frontend/tailwind.config.js`
- `frontend/postcss.config.js`
- `frontend/components.json`（shadcn/ui 配置）
- `frontend/eslint.config.js`
- `frontend/.env.ai.template`（环境变量模板，当前未被服务层读取）

### 2.2 后端（`backend/`）

| 层级 | 实际选型 | 备注 |
|------|----------|------|
| 构建工具 | Apache Maven 3.9.9（项目本地便携版） | `backend/pom.xml`、`backend/tools/apache-maven-3.9.9/` |
| 框架 | Spring Boot 2.7.18 | parent |
| 语言 | Java 8（项目本地便携版 JDK 1.8.0_492） | `java.version` = `1.8` |
| Web | Spring Boot Starter Web | 嵌入 Tomcat，端口 `8080` |
| ORM | MyBatis Spring Boot Starter 2.3.1 | 配置见 `application.yml` |
| 数据库 | PostgreSQL | 运行端口 `5433`（Docker 映射自容器内 5432） |
| 缓存 | Redis | 运行端口 `6380`（Docker 映射自容器内 6379） |
| 工具 | Lombok、Apache HttpClient 4.5.14 | — |
| 校验 | `spring-boot-starter-validation` 已声明 | DTO 中已使用 `@NotBlank` / `@NotEmpty` |
| 测试 | `spring-boot-starter-test` 已声明 | 但 `backend/src/test/` 不存在 |

**关键配置文件**：

- `backend/pom.xml`
- `backend/src/main/resources/application.yml`
- `backend/src/main/resources/db/init.sql`
- `backend/src/main/resources/mapper/*.xml`
- `backend/start-backend.sh`
- `backend/start-db.sh`

### 2.3 与 README / 方案声明的差异

- README 称前端使用 **React 18 + Ant Design 5**，实际为 **React 19 + Tailwind CSS + shadcn/ui**。
- README 称使用 **React Router 6 / Axios**，实际未使用（路由由模块状态驱动，HTTP 使用原生 `fetch`）。
- `.trae/documents/lakeCloudAi_plan.md` 中规划的 Spring Security、用户认证、JWT/Session、业务 API 等尚未落地。
- 规划中的 DTO 部分落地（`ChatCompletionRequest` / `Response` / `ChatMessageDto`），但 Controller 目前只实现了聊天代理接口。

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
└── README.md                  # 项目简介（部分描述偏规划，需以本文件为准）
```

### 3.2 前端目录

```
frontend/
├── public/                    # 静态资源（logo 图片等）
├── src/
│   ├── App.tsx                # 根组件：模块切换与全局状态
│   ├── main.tsx               # React 挂载入口
│   ├── index.css              # Tailwind 指令 + CSS 变量
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
│   │   ├── agents.ts                        # 广场/我的智能体 Mock 数据
│   │   ├── agentConfigs.ts                  # 默认配置、模型元数据
│   │   ├── agentPrompts.ts                  # 提示词模板
│   │   └── mockBffData.ts                   # BFF 全量 Mock 数据与类型
│   ├── hooks/
│   │   ├── use-mobile.ts
│   │   ├── useAgent.ts
│   │   └── useAgentIcon.ts
│   ├── lib/utils.ts                         # `cn()` 工具函数
│   ├── pages/Home.tsx                       # Vite 模板默认页（未使用）
│   ├── services/
│   │   ├── agentService.ts                  # 图标/规范化
│   │   ├── bffService.ts                    # BFF 抽象层（当前为 Mock）
│   │   ├── chatService.ts                   # 聊天逻辑、后续问题生成
│   │   ├── modelService.ts                  # 模型服务统一封装（wuxidata/ollama/mock）
│   │   ├── ollamaService.ts                 # Ollama 客户端封装
│   │   └── superAgentService.ts             # 超级助手意图识别与路由
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
├── start-backend.sh           # 使用本地 JDK/Maven 打包并启动
├── start-db.sh                # 用 Docker 启动 PostgreSQL + Redis 并初始化
├── tools/
│   ├── apache-maven-3.9.9/    # 便携版 Maven
│   └── jdk1.8.0_492/          # 便携版 JDK 8
└── src/main/
    ├── java/com/lakecloud/ai/
    │   ├── LakeCloudAiApplication.java
    │   ├── config/            # WebConfig（CORS）、WuxidataProperties
    │   ├── controller/        # ChatController（聊天代理接口）
    │   ├── dto/               # ChatCompletionRequest/Response、ChatMessageDto
    │   ├── entity/            # Agent、Conversation、Knowledge、Message、User
    │   ├── mapper/            # MyBatis Mapper 接口
    │   ├── service/           # ChatService（wuxidata 代理转发）
    │   └── util/              # SslUtils（信任所有证书 HttpClient）
    └── resources/
        ├── application.yml
        ├── db/init.sql
        └── mapper/*.xml       # MyBatis XML 映射
```

**后端当前重要事实**：

- MyBatis Mapper 已补齐 XML，位于 `resources/mapper/*.xml`。
- `LakeCloudAiApplication` 已添加 `@MapperScan("com.lakecloud.ai.mapper")` 和 `@EnableConfigurationProperties(WuxidataProperties.class)`。
- 已存在 `controller/`、`service/`、`dto/`、`config/`、`util/`，但目前仅聊天代理链路完整，业务 CRUD 接口尚未实现。
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

前置条件：已安装 Docker Desktop（用于 `start-db.sh`）。

```bash
# 1. 启动 PostgreSQL 与 Redis（使用 Docker，映射到本地 5433 / 6380）
cd backend
./start-db.sh

# 2. 使用项目本地 JDK/Maven 打包并启动后端
cd backend
./start-backend.sh
```

`start-backend.sh` 逻辑说明：

- 使用 `backend/tools/jdk1.8.0_492` 与 `backend/tools/apache-maven-3.9.9`。
- 若 `target/ai-enterprise-1.0.0.jar` 不存在，先执行 `mvn clean package -DskipTests`。
- 最后以 `java -jar` 启动，默认 http://localhost:8080。

传统 Maven 命令（需要本机 Java 8 + Maven）：

```bash
cd backend
mvn spring-boot:run

# 打包
mvn clean package

# 运行 JAR
java -jar target/ai-enterprise-1.0.0.jar
```

### 4.3 本地完整运行

1. 执行 `backend/start-db.sh` 启动 PostgreSQL（本地端口 `5433`）与 Redis（本地端口 `6380`），并自动执行 `init.sql`。
2. 执行 `backend/start-backend.sh` 启动后端（http://localhost:8080）。
3. 启动前端：`cd frontend && npm run dev`（http://localhost:3000）。
4. 若需要真实 AI 回复，需确保后端能访问国联 AI 服务（默认配置见 `application.yml` 中 `ai.wuxidata.*`），或本地启动 Ollama（默认 `http://localhost:11434`）。

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
- **服务层**：
  - `bffService.ts` 是对后端 BFF 的 Mock 抽象，后续替换时保持接口签名不变。
  - `modelService.ts` 统一封装 wuxidata / ollama / mock 三种模型调用。
  - `superAgentService.ts` 负责意图识别与智能体路由。
- **注释**：源码中以中文注释为主。
- **Lint**：ESLint 9 flat config，运行 `npm run lint`。

### 6.2 后端

- **包名**：根包 `com.lakecloud.ai`。
- **实体**：使用 Lombok `@Data`，字段命名驼峰，类型 `java.time.LocalDateTime`。
- **Mapper**：MyBatis Mapper 接口放在 `com.lakecloud.ai.mapper`，并在启动类通过 `@MapperScan` 扫描；XML 放在 `resources/mapper/`。
- **配置**：数据库、Redis、MyBatis、AI 外部服务配置集中在 `application.yml`。
- **日志**：通过 `logging.level.com.lakecloud.ai: debug` 控制，无独立 `logback-spring.xml`。
- **脚本**：
  - `start-db.sh` 使用 Docker 启动依赖服务。
  - `start-backend.sh` 使用项目本地 JDK/Maven，便于无环境依赖部署。

### 6.3 版本控制

- `frontend/.gitignore` 已忽略 `node_modules/`、`dist/`、`* .local` 等。
- 根目录 `.gitignore` 已忽略 `frontend/node_modules`、`backend/target`、`*.jar`、`.env` 等。
- 请勿提交 `.env`、API Key、数据库密码等敏感信息。

---

## 7. 安全注意事项

- **敏感配置明文存储**：
  - `backend/src/main/resources/application.yml` 中数据库用户名/密码为 `postgres/postgres`，且未使用环境变量。
  - Redis 配置未设置密码。
  - `ai.wuxidata.app-id`、`app-key`、`base-url`、`model` 以默认值或占位符形式写在配置中，生产环境应改为环境变量、Docker Secrets 或外部配置中心。
- **API Key 代理**：
  - 当前 `ChatService` 在后端生成 wuxidata 签名并转发请求，前端不直接持有 wuxidata 私钥，这是正确做法。
  - 但 `application.yml` 中的默认值不应直接用于生产。
- **SSL 证书校验被禁用**：
  - `SslUtils.createTrustAllHttpClient()` 信任所有证书、跳过主机名校验，仅用于对接内部自签名证书接口。
  - 生产环境必须移除该工具，改用正式证书与标准 `RestTemplate`/`HttpClient`。
- **CORS 配置过宽**：
  - `WebConfig` 对 `/api/**` 允许 `*` 来源，`allowCredentials(false)`。
  - 生产环境应收紧为前端具体域名，并按需配置 `allowCredentials`。
- **认证与授权**：
  - 后端目前没有任何认证（Spring Security 未引入）。
  - 数据库 `users` 表只有示例数据，密码字段虽使用 bcrypt 风格哈希，但登录逻辑未实现。
- **输入校验**：
  - 已声明 `spring-boot-starter-validation`，DTO 中已使用基础校验注解。
  - 新增接口时应继续使用 `@Valid`，并在 Controller 层处理 `MethodArgumentNotValidException`。
- **HTTPS**：未配置，生产环境需要补充。

---

## 8. 已知缺口与待办

| 区域 | 缺口 |
|------|------|
| 后端业务层 | 除聊天代理外，缺少 Agent/Conversation/Message/Knowledge 的 Controller、Service 实现 |
| 后端数据层 | Mapper 与 XML 已补齐，但尚未被业务 Service 调用 |
| 后端安全 | 缺少 Spring Security、JWT/Session、权限校验 |
| 后端测试 | 无测试目录与测试用例 |
| 后端部署 | 无 Dockerfile、docker-compose、CI/CD |
| 前端路由 | `react-router` 已安装但未使用，模块切换由状态驱动 |
| 前端 API 集成 | `bffService.ts` 当前为 Mock，尚未对接后端 REST API |
| 前端环境变量 | `.env.ai.template` 变量未接入服务层，多处地址/模型名仍硬编码 |
| 前端测试 | 无测试框架与测试用例 |
| 部署运维 | 无 nginx 配置、无容器化、无健康检查 |

开发计划文档（供参考）：

- `docs/knowledge-assistant-enhancement-plan.md`：知识问答助手功能增强实现方案，包括 LLM 集成、对话上下文、数据库表设计等。
- `.trae/documents/lakeCloudAi_plan.md` 与 `.trae/documents/智能体配置管理系统_plan.md`：项目总体规划与后端 API 设计。
- `.trae/documents/frontend_init_plan.md`：前端初始化计划。

---

## 9. 给后续开发者的快速提示

1. **修改后端接口时**：先补齐 Mapper 的 SQL（注解或 XML），再新增 Service/Controller；当前 XML 已存在，可直接复用。
2. **修改前端聊天逻辑时**：重点关注 `src/services/chatService.ts`、`src/services/modelService.ts`、`src/services/bffService.ts`、`src/store/conversationStore.ts`。
3. **新增 shadcn/ui 组件时**：遵循现有 `src/components/ui/` 的样式约定，使用 `cn()` 合并类名。
4. **接入后端 API 时**：建议保持 `bffService.ts` 的接口签名不变，仅把方法体替换为 `fetch('/api/v1/...')` 调用。
5. **运行前检查**：确保 PostgreSQL、Redis 的端口与 `application.yml` 一致（当前为 `5433` / `6380`，由 Docker 脚本映射）。
6. **切换 AI 服务**：
   - 国联 AI：前端 `modelService` 中 provider 为 `wuxidata`，默认请求 `http://localhost:8080/api/v1/chat/completions`，由后端 `ChatController` 代理。
   - 本地 Ollama：provider 为 `ollama`，默认 `http://localhost:11434`。
   - Mock：当两者都不可用时自动降级为 Mock 回复。
