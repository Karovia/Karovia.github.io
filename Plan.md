# OpenClaw Web 模块化开发计划

## 项目概述

本文档将 OpenClaw Web 项目划分为 6 个可独立开发和测试的模块，每个模块完成后进行集成。

---

## 模块划分

### 🔵 模块 1：后端基础设施（第 1 层）

**包含内容**：
- 数据库连接和模型定义 (`database.py`, `models.py`)
- 配置管理 (`config.py`)
- 基础中间件（CORS）

**可测试性**：
```bash
# 测试数据库连接
cd backend
python -c "from app.database import init_db, engine; print(engine.connect())"

# 验证表结构创建
python -c "from app.models import Base, engine; Base.metadata.create_all(bind=engine)"
```

**交付标准**：
- ✅ MySQL 连接成功
- ✅ 所有表自动创建
- ✅ 环境变量正确加载

**依赖**：无

**预计工时**：1-2 天

---

### 🔵 模块 2：认证系统（第 2 层）

**包含内容**：
- 后端：`auth/` 目录，`api/auth.py`
- 前端：登录/注册页面（可选），认证 Store

**API 端点**：
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

**可测试性**：
```bash
# 使用 curl 测试
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "password": "password123"}'

curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "password": "password123"}'
```

**交付标准**：
- ✅ 用户注册成功
- ✅ 登录返回 JWT Token
- ✅ Token 验证正常工作
- ✅ 密码使用 bcrypt 哈希

**依赖**：模块 1

**预计工时**：2-3 天

---

### 🔵 模块 3：实例管理（第 3 层）

**包含内容**：
- 后端：`api/instances.py`
- 前端：Settings 页面，instanceStore

**API 端点**：
- `GET/POST /api/instances`
- `GET/PUT/DELETE /api/instances/:id`
- `POST /api/instances/:id/set-default`

**可测试性**：
```bash
# 需要 JWT Token（从模块 2 获取）
TOKEN="your-jwt-token"

curl -X POST http://localhost:8000/api/instances \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "测试实例", "gateway_url": "localhost:18789", "is_default": true}'
```

**交付标准**：
- ✅ CRUD 操作正常
- ✅ 默认实例唯一性约束
- ✅ 用户隔离（只能看到自己的实例）

**依赖**：模块 1、模块 2

**预计工时**：2 天

---

### 🔵 模块 4：对话核心（第 4 层 - 核心）

**包含内容**：
- 后端：`api/chat.py`（会话和消息管理）
- 前端：Chat 页面，chatStore，WebSocket 服务
- 通用组件：ChatMessage

**API 端点**：
- `GET/POST /api/chat/sessions`
- `GET /api/chat/sessions/:id/messages`
- `POST /api/chat/sessions/:id/messages`
- `WS /api/chat/ws`（WebSocket）

**可测试性**：
```bash
# 创建会话
curl -X POST http://localhost:8000/api/chat/sessions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "测试对话"}'

# 保存消息
curl -X POST http://localhost:8000/api/chat/sessions/1/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "user", "content": "你好"}'
```

**交付标准**：
- ✅ 会话 CRUD 正常
- ✅ 消息保存和查询
- ✅ WebSocket 连接 OpenClaw Gateway
- ✅ 流式响应渲染
- ✅ Markdown 和代码高亮

**依赖**：模块 1、模块 2、模块 3

**预计工时**：3-4 天

---

### 🔵 模块 5：知识库（第 5 层 - 独立）

**包含内容**：
- 后端：`api/knowledge.py`，`storage/tos.py`
- 前端：Knowledge 页面，knowledgeStore

**API 端点**：
- `GET /api/knowledge/files`
- `POST /api/knowledge/upload`
- `GET /api/knowledge/files/:id/download`
- `DELETE /api/knowledge/files/:id`

**可测试性**：
```bash
# 上传文件
curl -X POST http://localhost:8000/api/knowledge/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.txt"

# 下载文件
curl -X GET http://localhost:8000/api/knowledge/files/1/download \
  -H "Authorization: Bearer $TOKEN" \
  --output downloaded.txt
```

**交付标准**：
- ✅ 文件上传到 TOS 成功
- ✅ 文件列表展示
- ✅ 下载和删除功能
- ✅ 文件类型白名单验证

**依赖**：模块 1、模块 2

**预计工时**：2-3 天

---

### 🔵 模块 6：前端基础框架（并行开发）

**包含内容**：
- 路由配置 (`App.tsx`)
- 主布局 (`MainLayout.tsx`)
- 文档页面 (`Docs.tsx`)

**可测试性**：
```bash
cd frontend
npm run dev

# 访问 http://localhost:5173
# 手动验证路由跳转和布局
```

**交付标准**：
- ✅ 路由正常工作
- ✅ 导航菜单可用
- ✅ 文档页面渲染正常

**依赖**：无（可独立开发）

**预计工时**：1 天

---

## 推荐开发顺序

```
第 1 周：基础设施 + 认证
├── Day 1-2: 模块 1（后端基础设施）
├── Day 3-4: 模块 2（认证系统）
└── Day 5:   集成测试 + 模块 6（前端基础框架）

第 2 周：核心功能
├── Day 1-2: 模块 3（实例管理）
├── Day 3-5: 模块 4（对话核心）
└── Day 5:   集成测试

第 3 周：辅助功能
├── Day 1-3: 模块 5（知识库）
└── Day 4-5: 安全加固 + 容器化
```

---

## 模块间依赖图

```
┌─────────────┐
│ 模块 1: 后端 │
│   基础设施   │
└──────┬──────┘
       │
   ┌───┴────┬────────┐
   ▼        ▼        ▼
┌────┐  ┌────┐  ┌────┐
│模块2│  │模块6│  │    │
│认证 │  │前端 │  │    │
└─┬──┘  └────┘  │    │
  │              │    │
  │    ┌─────────┴─┐  │
  │    ▼           ▼  ▼
  │  ┌────┐    ┌────┐
  └──│模块3│    │模块5│
     │实例 │    │知识库│
     └─┬──┘    └────┘
       │
       ▼
     ┌────┐
     │模块4│
     │对话 │
     └────┘
```

---

## 模块交付检查清单

每个模块完成时，使用以下清单验证：

### 后端交付物
- [ ] 代码实现完成
- [ ] 单元测试覆盖率 > 60%
- [ ] API 端点测试通过
- [ ] 错误处理完善

### 前端交付物（如适用）
- [ ] 页面/组件实现
- [ ] 状态管理集成
- [ ] UI 交互正常
- [ ] 错误提示友好

### 集成测试
- [ ] 与依赖模块联调成功
- [ ] 端到端场景验证
- [ ] 性能基本达标

### 文档
- [ ] API 文档更新
- [ ] 代码注释完整
- [ ] README 更新（如有重大变更）

---

## 进度跟踪

### 已完成模块
- [x] 模块 1: 后端基础设施 ✅
- [x] 模块 2: 认证系统 ✅
- [x] 模块 3: 实例管理 ✅
- [x] 模块 4: 对话核心 ✅
- [x] 模块 5: 知识库 ✅
- [x] 模块 6: 前端基础框架 ✅

### 当前状态
- **当前模块**: 全部模块完成！🎉
- **项目开始日期**: 2026-02-06
- **项目完成日期**: 2026-02-06
- **整体进度**: 100% (6/6 模块完成)

### 进度时间线

| 模块 | 开始日期 | 完成日期 | 状态 | 说明 |
|------|----------|----------|------|------|
| 模块 1: 后端基础设施 | 2026-02-06 | 2026-02-06 | ✅ 完成 | 数据库模型、配置管理、CORS |
| 模块 2: 认证系统 | 2026-02-06 | 2026-02-06 | ✅ 完成 | JWT 认证、登录注册页面、路由守卫 |
| 模块 3: 实例管理 | 2026-02-06 | 2026-02-06 | ✅ 完成 | CRUD 操作、默认实例约束 |
| 模块 4: 对话核心 | 2026-02-06 | 2026-02-06 | ✅ 完成 | 会话管理、WebSocket、流式响应 |
| 模块 5: 知识库 | 2026-02-06 | 2026-02-06 | ✅ 完成 | 文件上传下载、TOS 集成 |
| 模块 6: 前端基础框架 | 2026-02-06 | 2026-02-06 | ✅ 完成 | 路由、布局、所有页面 |

### 最近更新
- **2026-02-06**: 模块 5（知识库）完成 ⭐
  - 后端: `backend/app/api/knowledge.py` - 知识库 API（上传、下载、删除）
  - 后端: `backend/app/storage/tos.py` - 火山引擎 TOS 存储服务
  - 前端: `frontend/src/pages/Knowledge.tsx` - 知识库页面
  - 前端: `frontend/src/store/knowledgeStore.ts` - 知识库状态管理
  - 支持文件类型: PDF, TXT, MD, DOCX
  - 用户数据隔离
  - TOS 云存储集成（boto3 S3 兼容）
  - 代码完整性检查: 14/14 检查项通过 (100%)
  - 创建检查脚本: `backend/check_module5.py`

- **2026-02-06**: 模块 4（对话核心）完成 ⭐
  - 后端: `backend/app/api/chat.py` - 会话和消息管理 API
  - 后端: `backend/app/services/openclaw.py` - WebSocket 客户端
  - 前端: `frontend/src/pages/Chat.tsx` - 对话页面
  - 前端: `frontend/src/store/chatStore.ts` - 对话状态管理
  - 前端: `frontend/src/services/openclaw.ts` - WebSocket 服务
  - 前端: `frontend/src/components/ChatMessage.tsx` - 消息组件（Markdown + 代码高亮）
  - 代码完整性检查: 39/39 检查项通过 (100%)
  - 创建测试脚本: `backend/test_module4.py`, `backend/check_module4.py`
  - 更新 README.md 添加开发进度和测试说明
  - 创建模块4完成总结文档: `docs/module4_summary.md`

- **2026-02-06**: 模块 6（前端基础框架）完成
  - 主布局 `frontend/src/layouts/MainLayout.tsx`
  - 所有页面组件（Chat、Settings、Knowledge、Docs、Login）
  - 路由配置和导航菜单

- **2026-02-06**: 模块 3（实例管理）完成 ✨
  - 后端: `backend/app/api/instances.py` - 完整 CRUD API
  - 后端: `backend/app/models.py` - OpenClawInstance 模型
  - 后端: `backend/app/schemas.py` - InstanceCreate/Update/Response schemas
  - 前端: `frontend/src/pages/Settings.tsx` - 设置页面（表格+模态框）
  - 前端: `frontend/src/store/instanceStore.ts` - 实例状态管理
  - 前端: `frontend/src/services/api.ts` - 实例 API 方法
  - 创建测试脚本: `backend/test_module3.py`
  - 创建测试服务器: `backend/test_server_module3.py`（SQLite）
  - 10项测试全部通过：CRUD、默认实例唯一性、用户隔离
  - 修复: metadata → meta_data（SQLAlchemy 保留字段）
  - 修复: TOS 存储初始化问题（添加配置检查）
  - 修复: bcrypt 版本兼容（bcrypt==4.0.1, passlib==1.7.4）

- **2026-02-06**: 模块 2（认证系统）完成
  - JWT 认证、登录注册页面、路由守卫

---

## 备注

- 本计划基于快速交付策略（2-4周 MVP）
- 技术债按照差距分析文档标记 TODO
- 每个模块完成后询问用户是否需要推送到 GitHub
- 每个模块完成后更新 README.md 和 Notion 页面
