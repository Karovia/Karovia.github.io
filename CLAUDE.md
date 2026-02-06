# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

OpenClaw Web 是一个全栈对话网页应用，用于与云端部署的 OpenClaw 进行流式对话。前端使用 React + TypeScript + Ant Design，后端使用 Python + FastAPI + MySQL。

## 开发命令

### 后端开发

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件设置数据库连接、JWT 密钥等

# 初始化数据库（首次运行）
python -c "from app.database import init_db; init_db()"

# 启动开发服务器
uvicorn app.main:app --reload

# 运行测试（需要先创建 tests/ 目录）
pytest

# 代码格式化（需要先配置）
black app/
isort app/
```

### 前端开发

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint
```

## 架构设计

### 后端架构

**应用入口**: `backend/app/main.py`
- 创建 FastAPI 应用，配置 CORS
- 注册 API 路由（auth、instances、chat、knowledge）
- 启动时自动初始化数据库表结构

**配置管理**: `backend/app/config.py`
- 使用 `pydantic-settings` 进行类型安全的配置管理
- 环境变量通过 `.env` 文件加载
- 关键配置：数据库连接、JWT 密钥、CORS 源、火山引擎 TOS 凭证

**数据层**:
- `backend/app/database.py`: SQLAlchemy Session 管理，依赖注入 `get_db()`
- `backend/app/models.py`: ORM 模型定义（User、OpenClawInstance、ChatSession、ChatMessage、KnowledgeFile）
- `backend/app/schemas.py`: Pydantic 请求/响应模型

**API 路由模块** (`backend/app/api/`):
- `auth.py`: 用户注册、登录、JWT 刷新
- `instances.py`: OpenClaw 实例 CRUD 操作
- `chat.py`: 会话管理、消息历史、WebSocket 聊天端点
- `knowledge.py`: 知识库文件上传、下载、删除

**服务层** (`backend/app/services/`):
- `openclaw.py`: OpenClaw Gateway WebSocket 客户端，处理流式对话

**存储层** (`backend/app/storage/`):
- `tos.py`: 火山引擎 TOS（对象存储）封装，使用 boto3 S3 兼容接口

**认证机制** (`backend/app/auth/`):
- JWT Token 认证（访问令牌 30 分钟，刷新令牌 7 天）
- 依赖注入 `get_current_user()` 获取当前登录用户
- 密码使用 bcrypt 哈希

### 前端架构

**应用入口**: `frontend/src/main.tsx`
- 配置 Ant Design 中文语言包

**路由**: `frontend/src/App.tsx`
- React Router v6 配置
- 路由：`/chat`、`/settings`、`/knowledge`、`/docs`

**状态管理** (`frontend/src/store/`):
- 使用 Zustand 进行轻量级状态管理
- `authStore.ts`: 用户认证状态（登录、登出、Token）
- `chatStore.ts`: 对话会话和消息状态
- `instanceStore.ts`: OpenClaw 实例配置状态
- `knowledgeStore.ts`: 知识库文件状态

**服务层** (`frontend/src/services/`):
- `api.ts`: Axios 封装，自动添加 Authorization header，处理 401 跳转登录
- `openclaw.ts`: WebSocket 客户端，连接 OpenClaw Gateway

**页面组件** (`frontend/src/pages/`):
- `Chat.tsx`: 对话界面，消息列表、输入框、会话侧边栏
- `Settings.tsx`: 实例配置管理（添加、编辑、删除、设为默认）
- `Knowledge.tsx`: 知识库文件上传、列表、下载
- `Docs.tsx`: 项目文档展示

**通用组件** (`frontend/src/components/`):
- `ChatMessage.tsx`: 聊天消息气泡，支持 Markdown 渲染和代码高亮

### WebSocket 通信协议

**OpenClaw Gateway 连接**: `ws://{gateway_url}:18789`

**发送消息格式**:
```json
{
  "jsonrpc": "2.0",
  "id": "unique-id",
  "method": "chat.send",
  "params": {
    "sessionKey": "session-identifier",
    "message": "用户消息",
    "idempotencyKey": "unique-request-id"
  }
}
```

**接收流式响应**:
```json
{
  "event": "chat",
  "data": {
    "runId": "run-id",
    "sessionKey": "session-identifier",
    "seq": 1,
    "state": "started" | "delta" | "final" | "error",
    "message": { "role": "assistant", "content": "..." }
  }
}
```

## 项目约定

### 用户工作流要求

每次代码更新后，必须执行以下操作：
1. 询问用户是否需要推送到 GitHub
2. 更新 README.md 文件（如果有功能变更）
3. 更新 Notion 页面（用户提供的链接：https://www.notion.so/2cc8ed69acc58035a1b6dd624503b43d）

### 数据库约定

- 所有表使用 `created_at` 和 `updated_at` 字段（自动管理）
- 删除操作使用级联删除（`cascade="all, delete-orphan"`）
- 用户隔离：所有数据表通过 `user_id` 外键关联用户

### API 约定

- 所有 API 路径前缀为 `/api`
- 认证使用 Bearer Token（JWT）
- 错误响应遵循 FastAPI 默认格式
- WebSocket 路径：`/api/chat/ws`

### 前端代码规范

- 组件使用函数式组件 + Hooks
- 状态管理优先使用 Zustand，避免过度使用 Context
- API 调用统一通过 `services/api.ts`
- 类型定义使用 TypeScript 接口（`types/` 目录）

## 环境变量

### 后端必需环境变量 (`backend/.env`)

```bash
SECRET_KEY=至少32位的随机字符串
JWT_SECRET_KEY=至少32位的随机字符串
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的数据库密码
DB_NAME=openclaw_web
```

### 可选环境变量

```bash
# 火山引擎 TOS（知识库文件存储）
TOS_ACCESS_KEY_ID=你的访问密钥
TOS_SECRET_ACCESS_KEY=你的密钥
TOS_ENDPOINT=TOS服务端点
TOS_BUCKET_NAME=存储桶名称
TOS_REGION=区域

# OpenClaw Gateway 默认配置
DEFAULT_GATEWAY_URL=localhost:18789
DEFAULT_GATEWAY_TOKEN=gateway令牌（可选）
```

## 已知限制与技术债

根据项目差距分析文档（`C:\Users\Karovia\Downloads\project_gaps_summary.md`），当前实现存在以下已知限制：

- **缓存层缺失**: 对话历史直接查询 MySQL，无 Redis 缓存（已标记为 TODO）
- **消息队列缺失**: 文件上传同步处理，暂不支持大文件异步处理
- **监控告警**: 无 Prometheus/Grafana，建议使用 Sentry 等云服务
- **容器化**: Docker 配置待添加
- **测试覆盖**: 测试用例待编写

在添加新功能时，应优先考虑安全性（API 限流、输入验证）和可运维性（日志、健康检查）。

## API 文档

启动后端服务后访问：
- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## 常见问题

**数据库连接失败**: 检查 `.env` 中的数据库配置，确保 MySQL 服务运行且数据库已创建

**WebSocket 连接失败**: 检查实例配置中的 Gateway 地址格式（应为 `host:port`）

**文件上传失败**: 检查 TOS 配置是否正确，或临时跳过云存储使用本地文件系统
