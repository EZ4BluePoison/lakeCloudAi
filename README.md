# 太湖云 AI 企业智能体

基于 React + Ant Design + Spring Boot + PostgreSQL + Redis 构建的 AI 企业智能体平台。

## 技术栈

### 前端
- React 18
- TypeScript
- Ant Design 5
- React Router 6
- Zustand (状态管理)
- Axios
- Vite

### 后端
- Java 8
- Spring Boot 2.7
- MyBatis
- PostgreSQL
- Redis

## 项目结构

```
lakeCloudAi/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── components/    # 组件
│   │   ├── pages/         # 页面
│   │   ├── services/      # API服务
│   │   ├── store/         # 状态管理
│   │   ├── types/         # 类型定义
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
└── backend/                 # 后端项目
    ├── src/
    │   ├── main/
    │   │   ├── java/com/lakecloud/ai/
    │   │   │   ├── controller/
    │   │   │   ├── service/
    │   │   │   ├── mapper/
    │   │   │   ├── entity/
    │   │   │   └── config/
    │   │   └── resources/
    │   └── test/
    ├── pom.xml
    ├── setup-tools.sh       # 下载本地 JDK/Maven 脚本
    └── start-backend.sh     # 启动后端脚本
```

## 快速开始

### 前端

```bash
cd frontend
npm install
npm run dev
```

前端将在 http://localhost:3000 启动。

代码检查：

```bash
npm run lint      # ESLint
npx tsc -b        # TypeScript 类型检查
npm run build     # 生产构建
```

### 后端

#### 方式一：使用系统已安装的 Java 8 + Maven

确保本地已安装：
- Java 8
- Maven 3.6+
- PostgreSQL
- Redis

然后：

```bash
cd backend
mvn spring-boot:run
```

#### 方式二：使用项目本地便携版 JDK/Maven（推荐 Windows / 无管理员权限环境）

`backend/tools/` 已加入 `.gitignore`，不会被提交。首次使用时运行：

```bash
cd backend
./setup-tools.sh
```

该脚本会自动下载并解压 JDK 8 和 Maven 3.9.9 到 `backend/tools/`。如果直连下载失败，会尝试使用 `http://127.0.0.1:7890` 代理。

#### 配置本地密钥

复制本地配置模板并填入真实密钥：

```bash
cp backend/src/main/resources/application-local.yml.example \
   backend/src/main/resources/application-local.yml
```

`application-local.yml` 已加入 `.gitignore`，**请勿提交到 Git**。

#### 启动后端

```bash
cd backend
./start-backend.sh
```

脚本默认使用 `local` profile，读取 `application-local.yml`。

### 验证后端

```bash
curl http://localhost:8080/api/v1/chat/health
```

## 生产部署安全说明

生产环境**不要**使用 `local` profile，请通过环境变量注入敏感配置：

```bash
export WUXIDATA_APP_ID=your_app_id
export WUXIDATA_APP_KEY=your_app_key
export DB_USERNAME=your_db_user
export DB_PASSWORD=your_db_password
export CORS_ALLOWED_ORIGINS=https://your-domain.com
export WUXIDATA_TRUST_ALL_SSL=false

java -jar backend/target/ai-enterprise-1.0.0.jar
```

- `application.yml` 中敏感项已改为环境变量注入，无默认值。
- CORS 默认只允许 `http://localhost:3000`，生产请设置为前端域名。
- TLS 默认使用 JVM 信任库校验服务端证书，仅在 `WUXIDATA_TRUST_ALL_SSL=true` 时关闭校验（仅本地调试用）。
