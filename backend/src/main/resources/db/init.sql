-- 创建数据库
-- CREATE DATABASE lakecloud_ai;
-- \c lakecloud_ai;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    avatar VARCHAR(255),
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 智能体表
CREATE TABLE IF NOT EXISTS agents (
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

-- 对话表
CREATE TABLE IF NOT EXISTS conversations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    agent_id BIGINT REFERENCES agents(id),
    title VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 消息表
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT REFERENCES conversations(id),
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 知识库表
CREATE TABLE IF NOT EXISTS knowledge_base (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    content TEXT,
    file_url VARCHAR(255),
    file_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入示例数据
INSERT INTO users (username, password, email, avatar, department) VALUES
('张经理', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'zhang@lakecloud.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhang', '数字化部')
ON CONFLICT DO NOTHING;

INSERT INTO agents (name, description, avatar, prompt, created_by, is_public) VALUES
('超级助手', '全能AI助手，帮助您解决各种问题', 'https://api.dicebear.com/7.x/bottts/svg?seed=super', '你是一个乐于助人的AI助手', 1, true),
('Kimi Agent', '智能文档分析助手', 'https://api.dicebear.com/7.x/bottts/svg?seed=kimi', '你是一个文档分析专家', 1, true),
('代码助手', '帮助您编写和调试代码', 'https://api.dicebear.com/7.x/bottts/svg?seed=coder', '你是一个专业的编程助手', 1, false)
ON CONFLICT DO NOTHING;

INSERT INTO knowledge_base (user_id, title, content, file_type) VALUES
(1, '产品文档 v1.0', '这是我们产品的完整文档...', 'pdf'),
(1, '技术架构图', NULL, 'image')
ON CONFLICT DO NOTHING;
