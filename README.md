# U_learner - 在线学习助手

一个基于 AI 的在线学习平台，支持多种 AI 服务，可以生成 PDF 文档、思维导图和动画演示。

## 🚀 功能特点

- **多 AI 服务支持**：OpenAI、Google Gemini、Anthropic Claude、Deepseek、智谱 AI、豆包、扣子 AI
- **多种学习方式**：PDF 文档、思维导图、动画演示
- **响应式设计**：支持桌面和移动设备
- **本地存储**：API 密钥和搜索记录保存在浏览器本地
- **一键生成**：自动整理学习资料并生成多种格式

## 📦 技术栈

- **前端**：纯 HTML/CSS/JavaScript
- **PDF 生成**：html2pdf.js
- **思维导图**：D3.js
- **动画演示**：GSAP
- **HTTP 请求**：Axios

## 🛠️ 快速开始

### 1. 克隆或下载项目

```bash
# 克隆项目
git clone <repository-url>
cd U_learner

# 或者直接下载 ZIP 并解压
```

### 2. 获取 API 密钥

选择以下任一 AI 服务并获取 API 密钥：

#### OpenAI
1. 访问 [OpenAI 官网](https://platform.openai.com/api-keys)
2. 注册并登录账户
3. 创建新的 API 密钥
4. 复制密钥格式：
   - 新格式（2024年后）：`sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`（51-56字符）
   - 旧格式：`sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`（51字符）

#### Google Gemini
1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 登录 Google 账户
3. 创建新的 API 密钥
4. 复制密钥格式：`AIzaxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`（39字符，以AIza开头）

#### Anthropic Claude
1. 访问 [Anthropic 控制台](https://console.anthropic.com/)
2. 注册并登录账户
3. 创建 API 密钥
4. 复制密钥格式：`sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`（103字符，以sk-ant-api03开头）

#### Deepseek
1. 访问 [Deepseek 平台](https://platform.deepseek.com/)
2. 注册并登录
3. 获取 API 密钥
4. 密钥格式：`sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`（48-51字符，以sk-开头）

#### 智谱 AI (ChatGLM)
1. 访问 [智谱 AI 开放平台](https://open.bigmodel.cn/)
2. 注册并登录
3. 创建 API 密钥
4. 密钥格式：`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxx`（点号分隔，前段为32位十六进制ID，后段为20+位密钥）

#### 豆包
1. 访问 [豆包开放平台](https://www.volcengine.com/product/doubao)
2. 注册并登录
3. 获取 API 密钥
4. 密钥格式：`ak-xxxxx.xxxxxx` 或 `sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`（火山引擎格式）

#### 扣子 AI
1. 访问 [扣子开放平台](https://www.volcengine.com/product/kouzi)
2. 注册并登录
3. 获取 API 密钥
4. 密钥格式：`pat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`（以pat_开头）

### 3. 使用方法

1. **打开应用**
   ```bash
   # 直接用浏览器打开 index.html
   # 或者使用本地服务器（推荐）

   # 使用 Python 创建简单服务器
   python -m http.server 8000

   # 访问 http://localhost:8000
   ```

2. **配置 AI 服务**
   - 选择您想使用的 AI 服务
   - 输入对应的 API 密钥
   - 密钥会保存在浏览器本地，不会上传到服务器

3. **开始学习**
   - 输入您想学习的内容
   - 选择学习方式（PDF/思维导图/动画演示）
   - 点击"开始学习"按钮

### 4. 查看结果

- 系统会自动生成学习内容并在新页面展示
- 可以切换不同学习方式的标签页
- 支持下载 PDF、复制内容等功能

## 📁 项目结构

```
U_learner/
├── index.html                 # 主页（搜索页面）
├── result.html               # 结果展示页面
├── css/
│   ├── style.css            # 主样式文件
│   └── result.css           # 结果页面样式
├── js/
│   ├── app.js              # 主应用逻辑
│   ├── api.js              # API调用封装
│   ├── pdf-generator.js    # PDF生成逻辑
│   ├── mindmap.js          # 思维导图生成
│   ├── animations.js       # 动画演示逻辑
│   └── result.js           # 结果页面逻辑
├── lib/                     # 第三方库
│   ├── axios.min.js        # HTTP 请求库
│   ├── html2pdf.min.js     # PDF 生成库
│   ├── d3.min.js           # 数据可视化库
│   └── gsap.min.js         # 动画库
├── config/
│   └── api-config.js       # API配置文件
├── README.md               # 项目说明文档
└── deploy.sh               # 部署脚本
```

## 🚀 部署到 GitHub Pages

### 方法一：使用部署脚本

1. 确保您已安装 Git
2. 运行部署脚本：
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```
3. 按照提示输入 GitHub 用户名和仓库名

### 方法二：手动部署

1. **创建 GitHub 仓库**
   - 登录 GitHub
   - 新建仓库，命名为 "U_learner"
   - 设置为 Public（免费账户需要）

2. **推送代码到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/U_learner.git
   git push -u origin main
   ```

3. **启用 GitHub Pages**
   - 进入仓库 Settings
   - 找到 Pages 部分
   - Source 选择 "Deploy from a branch"
   - Branch 选择 "main"，目录选择 "/(root)"
   - 点击 Save

4. **访问网站**
   - 几分钟后访问：https://yourusername.github.io/U_learner

## 🔧 自定义配置

### 修改默认 AI 服务
编辑 `config/api-config.js` 文件：
```javascript
defaults: {
    aiService: 'zhipu',  // 修改为您想用的默认服务
    learningModes: ['pdf'],
    fontSize: 16,
    theme: 'light',
    autoSave: true
}
```

### 修改提示词模板
在 `config/api-config.js` 中的 `formatPrompt` 函数可以自定义 AI 的提示词。

### 添加新的 AI 服务
1. 在 `config/api-config.js` 中添加新的服务配置
2. 在 `js/api.js` 中添加密钥验证规则
3. 在 `index.html` 中添加服务选项

## 📱 移动端支持

项目采用响应式设计，支持：
- 手机和平板设备
- 触摸操作
- 自适应布局

## 🔒 安全说明

- API 密钥仅保存在浏览器本地
- 不会上传到任何服务器
- 使用 HTTPS 加密传输
- 支持一键清除所有本地数据

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- GitHub Issues
- 发送邮件到 [your-email@example.com]

## 🎯 开发路线图

- [ ] 添加更多 AI 服务支持
- [ ] 实现用户账户系统
- [ ] 添加学习进度追踪
- [ ] 支持多语言
- [ ] 优化移动端体验
- [ ] 添加离线功能

---

**注意**：使用本应用需要自行承担 API 费用。请合理使用 AI 服务，避免滥用。