# 太湖云AI企业智能体 - 实现方案

## 1. 项目概述

基于提供的网站设计，这是一个AI企业智能体平台，核心功能包括：

* 超级助手AI对话

* 消息管理

* 我的智能体管理

* 智能体广场

* 知识库

* 工作台

## 2. 技术栈

### 前端

* React 18+

* Ant Design 5.x

* TypeScript

* Axios（HTTP请求）

* React Router（路由管理）

* Zustand（状态管理）

### 后端

* Java Spring Boot 2.7.x

* JDK 8

* PostgreSQL

* MyBatis

* Redis

* Spring Security（安全认证）

## 3. 前端架构设计

### 3.1 目录结构

```
lake-cloud-ai-frontend/
├── public/
├── src/
│   ├── components/        # 通用组件
│   ├── pages/            # 页面组件
│   │   ├── Chat/         # 对话页面
│   │   ├── Agents/       # 智能体管理
│   │   ├── AgentSquare/  # 智能体广场
│   │   ├── KnowledgeBase/ # 知识库
│   │   └── Workspace/    # 工作台
│   ├── services/         # API服务
│   ├── store/            # 状态管理
│   ├── types/            # TypeScript类型定义
│   ├── utils/            # 工具函数
│   ├── App.tsx
│   └── main.tsx
└── package.json
```

### 3.2 核心组件划分

1. **Layout组件**：侧边栏导航、顶部栏
2. **Chat组件**：对话界面、消息列表、输入框
3. **AgentCard组件**：智能体卡片展示
4. **KnowledgeItem组件**：知识库项
5. **WorkspacePanel组件**：工作台面板

## 4. 后端API设计

### 4.1 项目结构

```
lake-cloud-ai-backend/
├── src/main/java/com/lakecloud/ai/
│   ├── controller/       # 控制器
│   ├── service/          # 业务逻辑
│   ├── mapper/           # MyBatis映射
│   ├── entity/           # 实体类
│   ├── dto/              # 数据传输对象
│   ├── config/           # 配置类
│   └── util/             # 工具类
├── src/main/resources/
│   ├── mapper/           # MyBatis XML
│   └── application.yml
└── pom.xml
```

### 4.2 API接口设计

#### 智能体相关

* `GET /api/agents` - 获取智能体列表

* `GET /api/agents/{id}` - 获取智能体详情

* `POST /api/agents` - 创建智能体

* `PUT /api/agents/{id}` - 更新智能体

* `DELETE /api/agents/{id}` - 删除智能体

#### 对话相关

* `GET /api/conversations` - 获取对话列表

* `POST /api/conversations` - 创建对话

* `GET /api/conversations/{id}/messages` - 获取对话消息

* `POST /api/conversations/{id}/messages` - 发送消息

#### 知识库相关

* `GET /api/knowledge` - 获取知识库列表

* `POST /api/knowledge` - 上传知识

* `DELETE /api/knowledge/{id}` - 删除知识

## 5. 数据库表结构设计

### 5.1 用户表 (users)

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    avatar VARCHAR(255),
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5.2 智能体表 (agents)

```sql
CREATE TABLE agents (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    avatar VARCHAR(255),
    prompt TEXT,
    created_by BIGINT REFERENCES users(id),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5.3 对话表 (conversations)

```sql
CREATE TABLE conversations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    agent_id BIGINT REFERENCES agents(id),
    title VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5.4 消息表 (messages)

```sql
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT REFERENCES conversations(id),
    role VARCHAR(20) NOT NULL, -- user, assistant
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5.5 知识库表 (knowledge\_base)

```sql
CREATE TABLE knowledge_base (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    content TEXT,
    file_url VARCHAR(255),
    file_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 6. 缓存策略设计

### 6.1 Redis缓存结构

* 智能体信息缓存：`agent:{id}` → JSON，TTL 1小时

* 用户会话缓存：`session:{token}` → 用户信息，TTL 24小时

* 对话列表缓存：`conversations:{userId}` → 对话列表，TTL 5分钟

## 7. 关键业务逻辑实现

### 7.1 对话流程

1. 用户选择智能体
2. 创建对话会话
3. 发送消息到后端
4. 后端调用AI服务
5. 返回响应并保存

### 7.2 智能体广场

* 显示公开智能体

* 支持收藏功能

* 支持搜索和分类

## 8. 实施步骤

1. 初始化前端和后端项目结构
2. 配置数据库和Redis
3. 实现用户认证模块
4. 实现智能体管理功能
5. 实现对话功能
6. 实现知识库功能
7. 实现工作台功能
8. 集成Mock数据
9. 测试和优化

