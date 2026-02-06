# OpenClaw Web

全栈对话网页应用，用于与云端部署的 OpenClaw 进行流式对话。

## 项目概述

OpenClaw Web 是一个现代化的全栈 Web 应用，支持与 OpenClaw Gateway 进行实时流式对话，提供完整的对话历史管理、多实例切换、知识库管理等功能。

### 核心功能

- **实时对话**: WebSocket 连接 OpenClaw Gateway，流式接收 AI 响应
- **实例管理**: 支持多个 OpenClaw 实例的配置和切换
- **知识库**: 上传和管理知识库文件（PDF、TXT、MD、DOCX）
- **历史记录**: 完整的对话历史保存和查询
- **Markdown 渲染**: 支持富文本和代码高亮显示

## 开发进度

| 模块 | 状态 | 完成日期 | 说明 |
|------|------|----------|------|
| 模块 1: 后端基础设施 | ✅ 完成 | 2025-02-06 | 数据库、模型、配置管理 |
| 模块 2: 认证系统 | ✅ 完成 | 2025-02-06 | JWT 认证、用户管理 |
| 模块 3: 实例管理 | ✅ 完成 | 2025-02-06 | OpenClaw 实例 CRUD |
| 模块 4: 对话核心 | ✅ 完成 | 2025-02-06 | 会话管理、WebSocket、流式响应 |
| 模块 5: 知识库 | ✅ 完成 | 2025-02-06 | 文件上传、下载、TOS 集成 |
| 模块 6: 前端基础框架 | ✅ 完成 | 2025-02-06 | 路由、布局、导航 |

**当前版本**: v1.0.0 🎉
**项目状态**: **所有核心模块已完成！**
**代码完整性**: 所有 6 个模块已完成完整性检查 (100%)

## 技术栈

### 前端技术栈

| 技术/库 | 版本 | 说明 |
|---------|------|------|
| **React** | 18.2.0 | 现代化 UI 框架 |
| **TypeScript** | 5.3.3 | 类型安全的 JavaScript 超集 |
| **Ant Design** | 5.12.0 | 企业级 UI 组件库（黑白简约主题） |
| **Zustand** | 4.4.7 | 轻量级状态管理库 |
| **React Router** | 6.21.0 | 客户端路由管理 |
| **Axios** | 1.6.5 | HTTP 请求库 |
| **Vite** | 5.0.11 | 前端构建工具 |
| **react-markdown** | 9.0.1 | Markdown 渲染组件 |
| **remark-gfm** | 4.0.0 | GitHub Flavored Markdown 支持 |
| **prism-react-renderer** | 2.3.1 | 代码语法高亮 |
| **@ant-design/icons** | 5.2.6 | Ant Design 图标库 |

### 设计系统

OpenClaw Web 采用 **黑白简约风格** 设计语言，强调内容优先和优雅的视觉体验。

#### 设计特色

- **黑白配色**: 纯净的黑白配色方案，营造专业简约的视觉体验
- **衬线字体**: 使用 Playfair Display 和 Noto Serif SC 衬线字体，提升阅读体验
- **精致动画**: 流畅的页面过渡和交互动画，增强用户体验
- **清晰层级**: 通过字重、间距和分隔线建立清晰的信息层级

#### 颜色系统

| 变量 | 值 | 用途 |
|------|------|------|
| `--color-black` | #000000 | 主要文字、按钮、边框 |
| `--color-dark-gray` | #1a1a1a | 次要强调 |
| `--color-gray` | #666666 | 次要文字 |
| `--color-light-gray` | #b3b3b3 | 禁用状态、占位符 |
| `--color-white` | #ffffff | 背景、反色文字 |
| `--bg-primary` | #ffffff | 主背景 |
| `--bg-secondary` | #fafafa | 次级背景 |
| `--bg-tertiary` | #f5f5f5 | 三级背景、代码块 |

#### 字体系统

| 变量 | 字体 | 用途 |
|------|------|------|
| `--font-serif` | Playfair Display, Noto Serif SC | 标题、正文 |
| `--font-mono` | Consolas, Monaco, Courier New | 代码、URL |

#### 动画组件

| 组件 | 说明 |
|------|------|
| `PageTransition` | 页面淡入动画 |
| `AnimatedCard` | 卡片缩放动画 |
| `AnimatedListItem` | 列表项滑入动画 |
| `TypewriterText` | 打字机文字效果 |
| `Skeleton` | 加载骨架屏 |
| `Tooltip` | 悬浮提示 |
| `PageTitle` | 页面标题组件 |
| `Divider` | 分隔线 |
| `EmptyState` | 空状态提示 |

### 后端技术栈

| 技术/库 | 版本 | 说明 |
|---------|------|------|
| **Python** | 3.11+ | 编程语言 |
| **FastAPI** | 0.109.0 | 现代化 Web 框架 |
| **Uvicorn** | 0.27.0 | ASGI 服务器 |
| **SQLAlchemy** | 2.0.25 | Python ORM |
| **PyMySQL** | 1.1.0 | MySQL 数据库驱动 |
| **Pydantic** | 2.5.3 | 数据验证库 |
| **python-jose** | 3.3.0 | JWT Token 处理 |
| **passlib** | 1.7.4 | 密码哈希库 |
| **boto3** | 1.34.23 | AWS SDK (用于火山引擎 TOS) |
| **Alembic** | 1.13.1 | 数据库迁移工具 |

### 基础设施与存储

| 组件 | 技术/服务 | 说明 |
|------|----------|------|
| **数据库** | MySQL 8.0+ | 关系型数据库 |
| **对象存储** | 火山引擎 TOS | S3 兼容的对象存储服务 |
| **认证** | JWT (HS256) | JSON Web Token 认证 |
| **实时通信** | WebSocket | 与 OpenClaw Gateway 双向通信 |
| **Web 服务器** | Nginx | 反向代理和静态文件托管 (生产环境) |
| **应用服务器** | Gunicorn + Uvicorn | 后端应用服务器 (生产环境) |

## 软件环境要求

### 开发环境

| 组件 | 最低版本 | 推荐版本 | 说明 |
|------|---------|---------|------|
| **操作系统** | Windows 10+, macOS 10.15+, Linux | 最新 LTS 版本 | 支持 WSL2 |
| **Node.js** | 18.0.0 | 20.x LTS | JavaScript 运行时 |
| **Python** | 3.11 | 3.11+ | 编程语言 |
| **MySQL** | 8.0 | 8.0+ | 数据库服务器 |
| **Git** | 2.0+ | 最新版本 | 版本控制 |

### 可选工具

| 工具 | 用途 |
|------|------|
| **Postman** / **Insomnia** | API 测试 |
| **DBeaver** / **MySQL Workbench** | 数据库管理 |
| **VS Code** / **PyCharm** | 代码编辑器 |
| **Docker** | 容器化部署 (可选) |

## 项目结构

```
D:\Human_loader/
├── backend/                 # Python/FastAPI 后端
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py         # FastAPI 应用入口
│   │   ├── config.py       # 配置管理
│   │   ├── database.py     # 数据库连接
│   │   ├── models.py       # SQLAlchemy 模型
│   │   ├── schemas.py      # Pydantic 模型
│   │   ├── auth/           # 认证模块
│   │   ├── api/            # API 路由
│   │   ├── services/       # 业务逻辑
│   │   └── storage/        # 云存储服务
│   ├── requirements.txt
│   └── .env.example
├── frontend/               # React 前端
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── pages/          # 页面组件
│   │   ├── components/     # 通用组件
│   │   ├── hooks/          # 自定义 Hooks
│   │   ├── services/       # API 服务
│   │   ├── store/          # Zustand 状态
│   │   └── types/          # TypeScript 类型
│   ├── package.json
│   └── vite.config.ts
├── README.md
└── .env.example
```

## 快速开始

> 环境要求详见上方 [软件环境要求](#软件环境要求) 章节

### 方法一：一键启动（推荐）

Windows 用户可以直接使用项目提供的启动脚本：

```bash
# 双击运行或在命令行执行
start.bat

# 或使用功能更丰富的开发助手
dev.bat
```

**脚本说明**：

| 脚本 | 功能 |
|------|------|
| `start.bat` | 一键启动前后端服务（自动检查依赖） |
| `stop.bat` | 停止所有服务 |
| `dev.bat` | 开发助手菜单（启动/停止/安装/清理/状态检查） |

启动后访问：
- 前端：http://localhost:5173
- 后端：http://localhost:8000
- API 文档：http://localhost:8000/api/docs

### 方法二：手动启动

#### 1. 克隆项目

```bash
git clone <repository-url>
cd D:\Human_loader
```

#### 2. 后端设置

```bash
# 进入后端目录
cd backend

# 安装依赖
pip install -r requirements.txt

# 复制环境变量文件
cp .env.example .env

# 编辑 .env 文件，配置数据库和 TOS
# ...

# 初始化数据库
python -c "from app.database import init_db; init_db()"

# 启动后端服务
uvicorn app.main:app --reload
```

后端服务将在 http://localhost:8000 启动

### 3. 前端设置

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端应用将在 http://localhost:5173 启动

## 配置说明

### 后端环境变量 (backend/.env)

```bash
# 应用配置
APP_NAME=OpenClaw Web App
APP_VERSION=0.1.0
DEBUG=True
SECRET_KEY=your-secret-key-here-change-in-production

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=openclaw_web

# JWT 配置
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS 配置
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# 火山引擎 TOS 配置
TOS_ACCESS_KEY_ID=your-tos-access-key
TOS_SECRET_ACCESS_KEY=your-tos-secret-key
TOS_ENDPOINT=your-tos-endpoint
TOS_BUCKET_NAME=your-bucket-name
TOS_REGION=your-region

# OpenClaw Gateway 默认配置
DEFAULT_GATEWAY_URL=localhost:18789
DEFAULT_GATEWAY_TOKEN=your-gateway-token
```

### 数据库初始化

```sql
CREATE DATABASE openclaw_web CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

运行后端应用时会自动创建所需的表结构。

## API 文档

启动后端服务后，访问以下地址查看 API 文档：

- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

### 主要 API 端点

#### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

#### 实例管理
- `GET /api/instances` - 获取实例列表
- `POST /api/instances` - 创建实例
- `PUT /api/instances/:id` - 更新实例
- `DELETE /api/instances/:id` - 删除实例
- `POST /api/instances/:id/set-default` - 设置默认实例

#### 对话管理
- `GET /api/chat/sessions` - 获取会话列表
- `POST /api/chat/sessions` - 创建会话
- `GET /api/chat/sessions/:id/messages` - 获取会话消息
- `POST /api/chat/sessions/:id/messages` - 创建消息
- `WS /api/chat/ws` - WebSocket 聊天端点

#### 知识库
- `GET /api/knowledge/files` - 获取文件列表
- `POST /api/knowledge/upload` - 上传文件
- `GET /api/knowledge/files/:id/download` - 下载文件
- `DELETE /api/knowledge/files/:id` - 删除文件

## 开发指南

### 前端开发

```bash
cd frontend
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run preview  # 预览生产构建
```

### 后端开发

```bash
cd backend
uvicorn app.main:app --reload  # 启动开发服务器
```

### 测试脚本

项目包含模块级别的测试和检查脚本：

```bash
cd backend

# 模块 4: 对话核心
python check_module4.py  # 代码完整性检查
python test_module4.py   # 功能测试（需启动服务）

# 模块 5: 知识库
python check_module5.py  # 代码完整性检查
```

**检查脚本功能**:
- 验证所有必需文件存在
- 检查代码实现完整性
- 验证依赖配置正确

**功能测试脚本功能**:
- 用户认证测试（注册、登录）
- 会话 CRUD 操作测试
- 消息 CRUD 操作测试
- WebSocket 端点检查

## 部署

### 生产环境配置

1. **后端部署** (使用 Gunicorn + Uvicorn)

```bash
cd backend
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

2. **前端构建**

```bash
cd frontend
npm run build
```

构建产物在 `frontend/dist` 目录。

3. **Nginx 配置**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket 代理
    location /api/chat/ws {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 安全建议

1. 修改默认的 SECRET_KEY 和 JWT_SECRET_KEY
2. 在生产环境中使用强密码
3. 启用 HTTPS
4. 配置正确的 CORS 源
5. 定期更新依赖包

## 常见问题

### Q: WebSocket 连接失败怎么办？

A: 请检查：
1. OpenClaw Gateway 是否正常运行
2. 网络连接是否正常
3. 实例配置中的 Gateway 地址是否正确

### Q: 文件上传失败？

A: 请检查：
1. TOS 配置是否正确
2. Bucket 是否有正确的权限
3. 文件大小是否超过限制

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 联系方式

如有问题，请提交 GitHub Issue。
