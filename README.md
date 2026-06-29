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
│   │   ├── pages/      # 页面
│   │   ├── services/   # API服务
│   │   ├── store/     # 状态管理
│   │   ├── types/      # 类型定义
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
    └── pom.xml
```

## 快速开始

### 前端

```bash
cd frontend
npm install
npm run dev
```

前端将在 http://localhost:3000 启动

### 后端

前置条件：
- Java 8
- Maven
- PostgreSQL
- Redis

1. 创建数据库并执行初始化脚本
2. 配置 application.yml
3. 运行后端

```bash
cd backend
mvn spring-boot:run
```

后端将在 http://localhost:8080 启动

## 功能特性

- 🤖 超级助手 - 全能AI对话
- 💬 消息管理 - 历史对话记录
- 🤖 我的智能体 - 个性化智能体配置
- 🏪 智能体广场 - 公开智能体浏览与使用
- 📚 知识库 - 企业知识管理
- 🛠️ 工作台 - 集成工作环境

## Mock数据

前端已内置Mock数据，即使后端未启动也可以预览完整功能。
