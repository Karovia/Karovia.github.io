/**
 * 结果页面逻辑
 *
 * 负责处理结果页面的逻辑，包括：
 * - 流式显示生成内容
 * - 继续生成功能
 * - 标签页切换
 * - 内容操作（下载PDF、复制等）
 *
 * @author U_learner Team
 * @version 1.0.0
 */

class ResultPage {
    constructor() {
        this.apiClient = new APIClient();
        this.resultData = null;
        this.generatedContent = {};
        this.rawMarkdownContent = '';  // 保存原始 Markdown 内容用于下载
        this.isGenerating = false;
        this.remainingModes = [];  // 待生成的模式
        this.continueData = {
            messages: [],
            lastTopic: ''
        };

        // 存储之前的对话历史用于继续生成
        this.conversationHistory = [];
    }

    // 初始化页面
    async initialize() {
        console.log('ResultPage - 开始初始化');

        // 获取保存的结果数据
        const lastResult = sessionStorage.getItem('lastResult');
        if (!lastResult) {
            console.error('未找到结果数据');
            this.showNotification('未找到结果数据，请重新搜索', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return;
        }

        try {
            this.resultData = JSON.parse(lastResult);
            console.log('结果数据:', this.resultData);

            // 保存待生成的模式
            this.remainingModes = this.resultData.remainingModes || [];
            console.log('待生成模式:', this.remainingModes);
        } catch (e) {
            console.error('解析结果数据失败:', e);
            this.showNotification('数据解析失败，请重新搜索', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return;
        }

        // 初始化元素
        this.initializeElements();

        // 绑定事件（在内容生成之前绑定，确保点击按钮立即可用）
        this.bindEvents();

        // 显示结果信息
        this.displayResultInfo();

        // 生成内容
        await this.generateAllContent();

        // 如果有待生成的模式，显示继续生成按钮
        if (this.remainingModes.length > 0) {
            this.showContinueGenerateButton();
        }

        console.log('ResultPage - 初始化完成');
    }

    // 初始化DOM元素
    initializeElements() {
        this.resultTopic = document.getElementById('resultTopic');
        this.serviceInfo = document.getElementById('serviceInfo');
        this.contentDisplay = document.getElementById('contentDisplay');
        this.mindmapContainer = document.getElementById('mindmapContainer');
        this.animationContainer = document.getElementById('animationContainer');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.continueGenerateBtn = document.getElementById('continueGenerateBtn');
        this.downloadPdfBtn = document.getElementById('downloadPdfBtn');
        this.copyContentBtn = document.getElementById('copyContentBtn');
        this.notification = document.getElementById('notification');
    }

    // 显示结果信息
    displayResultInfo() {
        if (!this.resultData) return;

        // 显示主题
        this.resultTopic.textContent = this.resultData.topic || '未知主题';

        // 显示服务信息
        const serviceName = this.getServiceName(this.resultData.service);
        this.serviceInfo.textContent = `使用 ${serviceName} 生成`;
    }

    // 获取服务名称
    getServiceName(service) {
        const serviceNames = {
            'openai': 'OpenAI',
            'gemini': 'Google Gemini',
            'claude': 'Anthropic Claude',
            'deepseek': 'Deepseek',
            'zhipu': '智谱 AI',
            'doubao': '豆包',
            'kouzi': '扣子 AI'
        };
        return serviceNames[service] || service;
    }

    // 生成所有内容
    async generateAllContent() {
        if (!this.resultData || !this.resultData.results) return;

        const results = this.resultData.results;
        const successResults = results.filter(r => r.success);
        const failedResults = results.filter(r => !r.success);

        // 如果所有都失败了
        if (successResults.length === 0) {
            console.error('所有内容生成失败');
            this.showNotification('所有内容生成失败，请重试', 'error');
            this.hideLoading();
            return;
        }

        // 处理失败的结果（显示错误信息）
        for (const result of failedResults) {
            if (!this.generatedContent[result.mode]) {
                this.displayError(result.mode, result.error || '未知错误');
                this.generatedContent[result.mode] = null;
            }
        }

        // 为每个成功的模式显示内容
        for (const result of successResults) {
            if (!this.generatedContent[result.mode]) {
                this.generateContent(result.mode);
            }
        }

        // 隐藏加载状态
        this.hideLoading();
    }

    // 显示单个内容（非流式）
    generateContent(mode) {
        console.log(`开始显示 ${mode} 内容`);
        console.log(`resultData.results:`, this.resultData.results);

        const result = this.resultData.results.find(r => r.mode === mode);
        if (!result) {
            console.error(`未找到 ${mode} 的结果`);
            this.generatedContent[mode] = null;
            this.displayError(mode, '未找到结果数据');
            return;
        }

        console.log(`${mode} result:`, result);
        console.log(`${mode} result.data:`, result.data);
        console.log(`${mode} result.success:`, result.success);
        console.log(`${mode} result.error:`, result.error);

        // 检查是否成功
        if (!result.success) {
            console.error(`${mode} 生成失败，error:`, result.error);
            this.generatedContent[mode] = null;
            this.displayError(mode, result.error || '生成失败');
            return;
        }

        // 检查数据是否存在且不为空
        if (!result.data || typeof result.data !== 'string' || result.data.trim().length === 0) {
            console.error(`${mode} 结果数据为空或无效`);
            console.error(`${mode} result.data 类型:`, typeof result.data);
            console.error(`${mode} result.data 长度:`, result.data ? result.data.length : 'N/A');
            console.error(`${mode} result.data 值:`, result.data);
            this.generatedContent[mode] = null;
            this.displayError(mode, result.error || 'AI返回内容为空，请重试或增加token数量');
            return;
        }

        // 如果已经有内容，直接显示
        if (result.data.length > 0) {
            console.log(`开始显示 ${mode} 内容，长度: ${result.data.length}`);

            // 初始化对话历史（仅针对 PDF 模式）
            if (mode === 'pdf' && this.conversationHistory.length === 0) {
                this.conversationHistory = [
                    {
                        role: 'system',
                        content: '你是一位专业的学习助手，擅长将复杂知识转化为易于理解的格式。'
                    },
                    {
                        role: 'user',
                        content: this.getPromptForMode(this.resultData.topic, mode)
                    },
                    {
                        role: 'assistant',
                        content: result.data
                    }
                ];
                console.log('对话历史已初始化:', this.conversationHistory.length, '条消息');
            }

            this.displayContent(mode, result.data);
            this.generatedContent[mode] = result.data;

            // 如果是 PDF 模式，显示继续生成按钮
            if (mode === 'pdf') {
                this.showContinueButton();
            }

            return;
        }

        // 如果没有内容，显示错误
        console.error(`${mode} 结果中没有数据`);
        this.generatedContent[mode] = null;
        this.displayError(mode, result.error || '生成的内容为空');
    }

    // 流式生成
    async streamGenerate(mode) {
        const config = SafeAPIConfig.defaults;
        const result = this.resultData.results.find(r => r.mode === mode);

        // 准备对话历史
        if (this.conversationHistory.length === 0) {
            this.conversationHistory = [
                {
                    role: 'system',
                    content: '你是一位专业的学习助手，擅长将复杂知识转化为易于理解的格式。'
                },
                {
                    role: 'user',
                    content: this.getPromptForMode(this.resultData.topic, mode)
                }
            ];
        }

        // 发送流式请求
        let fullContent = '';

        await this.apiClient.sendRequest(
            this.resultData.service,
            {
                topic: this.resultData.topic,
                mode: mode,
                model: result.model
            },
            0,
            {
                stream: true,
                maxTokens: config.maxTokens,
                temperature: config.temperature,
                onChunk: (chunk, content, finished) => {
                    if (mode === 'pdf' && this.contentDisplay) {
                        // 实时更新显示
                        this.contentDisplay.textContent = content;
                        this.scrollToBottom();

                        // 显示继续生成按钮（当内容被截断时）
                        if (finished && content.length > 0) {
                            this.showContinueButton();
                        }
                    }

                    fullContent = content;

                    if (finished) {
                        console.log(`${mode} 流式生成完成，长度: ${content.length}`);
                        this.generatedContent[mode] = content;
                        this.conversationHistory.push({
                            role: 'assistant',
                            content: content
                        });
                    }
                }
            }
        );
    }

    // 获取模式名称
    getModeName(mode) {
        const names = {
            'pdf': 'PDF文档',
            'mindmap': '思维导图',
            'animation': '动画演示'
        };
        return names[mode] || mode;
    }

    // 获取提示词
    getPromptForMode(topic, mode) {
        const prompts = {
            pdf: `请为"${topic}"创建一个详细的学习指南，包括基础概念、核心知识点、实践案例和进阶建议。请用Markdown格式编写，结构清晰，易于阅读。`,
            mindmap: `请为"${topic}"创建一个思维导图大纲，包含主要分支和子分支，用层级结构展示知识点的逻辑关系。`,
            animation: `请为"${topic}"创建一个分步骤的学习指南，将复杂内容分解为循序渐进的学习步骤，每个步骤包含关键概念和示例。`
        };
        return prompts[mode] || prompts.pdf;
    }

    // 显示错误信息
    displayError(mode, error) {
        console.error(`${mode} 生成失败:`, error);

        switch (mode) {
            case 'pdf':
                if (this.contentDisplay) {
                    this.contentDisplay.innerHTML = `<div class="error-message">❌ ${this.getModeName(mode)} 生成失败<br><small>${this.escapeHtml(error)}</small></div>`;
                }
                break;
            case 'mindmap':
                if (this.mindmapContainer) {
                    this.mindmapContainer.innerHTML = `<div class="error-message">❌ ${this.getModeName(mode)} 生成失败<br><small>${this.escapeHtml(error)}</small></div>`;
                }
                break;
            case 'animation':
                if (this.animationContainer) {
                    this.animationContainer.innerHTML = `<div class="error-message">❌ ${this.getModeName(mode)} 生成失败<br><small>${this.escapeHtml(error)}</small></div>`;
                }
                break;
        }
    }

    // 显示内容
    displayContent(mode, content) {
        if (!content) return;

        switch (mode) {
            case 'pdf':
                if (this.contentDisplay) {
                    // 保存原始 Markdown 内容（追加模式）
                    if (this.rawMarkdownContent) {
                        this.rawMarkdownContent += '\n\n' + content;
                    } else {
                        this.rawMarkdownContent = content;
                    }
                    console.log('原始 Markdown 内容长度:', this.rawMarkdownContent.length);

                    this.contentDisplay.innerHTML = this.renderMarkdown(this.rawMarkdownContent);
                }
                break;
            case 'mindmap':
                // 简单显示思维导图内容（后续可扩展为可视化）
                if (this.mindmapContainer) {
                    this.mindmapContainer.innerHTML = `<pre style="white-space: pre-wrap; word-wrap: break-word; padding: 20px; background: #1a1a1a; border-radius: 8px; font-family: 'Courier New', monospace;">${this.escapeHtml(content)}</pre>`;
                }
                break;
            case 'animation':
                // 简单显示动画演示内容（后续可扩展为可视化）
                if (this.animationContainer) {
                    this.animationContainer.innerHTML = `<pre style="white-space: pre-wrap; word-wrap: break-word; padding: 20px; background: #1a1a1a; border-radius: 8px; font-family: 'Courier New', monospace;">${this.escapeHtml(content)}</pre>`;
                }
                break;
        }
    }

    // 渲染Markdown（简单实现）
    renderMarkdown(markdown) {
        // 简单的Markdown渲染
        let html = markdown;

        // 先处理代码块（保护内容不被后续处理）
        const codeBlocks = [];
        html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
            codeBlocks.push(code);
            return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
        });

        // 处理行内代码（也要保护）
        const inlineCodes = [];
        html = html.replace(/`([^`]+)`/g, (match, code) => {
            inlineCodes.push(code);
            return `__INLINE_CODE_${inlineCodes.length - 1}__`;
        });

        // 标题
        html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

        // 粗体
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

        // 斜体
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

        // 恢复行内代码
        html = html.replace(/__INLINE_CODE_(\d+)__/g, (match, index) => {
            return `<code>${this.escapeHtml(inlineCodes[index])}</code>`;
        });

        // 恢复代码块
        html = html.replace(/__CODE_BLOCK_(\d+)__/g, (match, index) => {
            return `<pre><code>${this.escapeHtml(codeBlocks[index])}</code></pre>`;
        });

        // 换行（只在非代码块和非 pre 标签的部分）
        html = html.replace(/\n/g, '<br>');

        return html;
    }

    // HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 滚动到底部
    scrollToBottom() {
        if (this.contentDisplay) {
            this.contentDisplay.scrollTop = this.contentDisplay.scrollHeight;
        }
    }

    // 显示继续生成按钮（用于继续生成 PDF 内容）
    showContinueButton() {
        if (this.continueGenerateBtn) {
            this.continueGenerateBtn.style.display = 'inline-flex';
        }
    }

    // 隐藏 PDF 继续生成按钮
    hideContinueButton() {
        if (this.continueGenerateBtn) {
            this.continueGenerateBtn.style.display = 'none';
        }
    }

    // 显示继续生成其他模式按钮
    showContinueGenerateButton() {
        const btn = document.getElementById('continueGenerateModesBtn');
        if (!btn) return;

        // 更新按钮文本，显示待生成的模式
        const modeNames = {
            'pdf': 'PDF',
            'mindmap': '思维导图',
            'animation': '动画演示'
        };
        const names = this.remainingModes.map(m => modeNames[m] || m);
        btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9"/>
                <polyline points="13 2 13 9 9 4"/>
            </svg>
            继续生成 (${names.join(', ')})
        `;
        btn.style.display = 'inline-flex';
        console.log('显示继续生成按钮，待生成模式:', this.remainingModes);
    }

    // 隐藏继续生成其他模式按钮
    hideContinueGenerateButton() {
        const btn = document.getElementById('continueGenerateModesBtn');
        if (btn) {
            btn.style.display = 'none';
        }
    }

    // 继续生成其他模式
    async continueGenerateOtherModes() {
        if (this.isGenerating || this.remainingModes.length === 0) return;

        this.isGenerating = true;
        this.showLoading(`正在生成 ${this.remainingModes.join(', ')}...`);
        this.hideContinueGenerateButton();

        try {
            console.log('开始生成剩余模式:', this.remainingModes);

            // 生成剩余的模式
            const results = await this.apiClient.generateLearningContent({
                topic: this.resultData.topic,
                modes: this.remainingModes,
                service: this.resultData.service,
                model: this.resultData.model,
                timestamp: new Date().toISOString()
            });

            console.log('剩余模式生成结果:', results);

            // 将新结果添加到结果数组
            this.resultData.results.push(...results);

            // 显示新生成的内容
            for (const result of results) {
                if (result.success && result.data && result.data.trim().length > 0) {
                    this.displayContent(result.mode, result.data);
                    this.generatedContent[result.mode] = result.data;
                    console.log(`成功显示 ${result.mode} 内容，长度: ${result.data.length}`);
                } else {
                    console.error(`${result.mode} 生成失败:`, result.error);
                    this.displayError(result.mode, result.error || '生成的内容为空');
                }
            }

            // 清空剩余模式
            this.remainingModes = [];
            this.showNotification('所有内容生成完成', 'success');

        } catch (error) {
            console.error('继续生成失败:', error);
            this.showNotification(`继续生成失败: ${error.message}`, 'error');
            // 重新显示按钮，以便重试
            this.showContinueGenerateButton();
        } finally {
            this.isGenerating = false;
            this.hideLoading();
        }
    }

    // 继续生成 PDF 内容
    async continueGeneration() {
        if (this.isGenerating) return;

        const currentContent = this.contentDisplay.textContent || '';
        if (currentContent.length === 0) return;

        this.isGenerating = true;
        this.showLoading('正在继续生成...');

        try {
            // 直接调用 streamContinue，不需要重复添加对话历史
            await this.streamContinue();

            // 不隐藏按钮，允许用户多次继续生成

        } catch (error) {
            console.error('继续生成失败:', error);
            this.showNotification(`继续生成失败: ${error.message}`, 'error');
            // 重新显示按钮，以便重试
            this.showContinueButton();
        } finally {
            this.isGenerating = false;
            this.hideLoading();
        }
    }

    // 流式继续生成
    async streamContinue() {
        console.log('开始继续生成...');
        console.log('对话历史:', this.conversationHistory);

        try {
            // 获取当前所有助手回复的内容
            const allAssistantContent = this.conversationHistory
                .filter(msg => msg.role === 'assistant')
                .map(msg => msg.content)
                .join('\n\n');

            console.log('当前所有助手内容长度:', allAssistantContent.length);

            // 构建智能提示词
            const smartContinuePrompt = `我已经为"${this.resultData.topic}"编写了以下内容：

【已有内容】
${allAssistantContent.substring(0, 3000)}${allAssistantContent.length > 3000 ? '...' : ''}

【任务】
请基于原始大纲，总结上面已有的内容，然后继续编写后续部分。

要求：
1. 先用200-300字总结已有的内容要点
2. 然后基于原始大纲和总结，继续编写下一个未完成的部分
3. **不要重复**已经写过的内容
4. 保持风格和格式一致（Markdown格式）
5. 每个章节完成后给出简洁的章节总结
6. 确保内容的逻辑连贯性

请从下一个未完成的部分开始，不要重复写过的内容。`;

            // 调用 API 继续生成内容
            const continuedContent = await this.apiClient.continueGeneration(
                this.resultData.service,
                {
                    topic: this.resultData.topic,
                    mode: 'pdf',
                    model: this.resultData.model
                },
                this.conversationHistory,
                0,
                {
                    maxTokens: APIConfig?.defaults?.maxTokens || 3000,
                    temperature: APIConfig?.defaults?.temperature || 0.7,
                    continuePrompt: smartContinuePrompt
                }
            );

            console.log('继续生成内容长度:', continuedContent.length);

            // 追加新内容到显示区
            this.appendContent(continuedContent);

            // 更新生成的内容到对话历史
            this.conversationHistory.push({
                role: 'assistant',
                content: continuedContent
            });

            console.log('对话历史已更新，当前长度:', this.conversationHistory.length);

            this.showNotification('内容已续写', 'success');

        } catch (error) {
            console.error('继续生成失败:', error);
            throw error;
        }
    }

    // 追加内容到显示区
    appendContent(newContent) {
        if (!newContent || newContent.trim().length === 0) {
            console.error('新内容为空，无法追加');
            return;
        }

        // 追加 Markdown 格式的内容
        this.contentDisplay.innerHTML = this.contentDisplay.innerHTML + this.renderMarkdown(newContent);

        // 滚动到底部
        this.contentDisplay.scrollTop = this.contentDisplay.scrollHeight;

        // 显示继续生成按钮
        this.showContinueButton();
    }

    // 显示加载状态
    showLoading(message = '正在生成内容...') {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'flex';
            const loadingText = this.loadingOverlay.querySelector('.loading-text');
            if (loadingText) {
                loadingText.textContent = message;
            }
        }
    }

    // 隐藏加载状态
    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'none';
        }
    }

    // 绑定事件
    bindEvents() {
        // 标签页切换
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleTabChange(e.target.dataset.tab);
            });
        });

        // 继续生成 PDF 按钮
        if (this.continueGenerateBtn) {
            this.continueGenerateBtn.addEventListener('click', () => {
                this.continueGeneration();
            });
        }

        // 继续生成其他模式按钮
        const continueGenerateModesBtn = document.getElementById('continueGenerateModesBtn');
        if (continueGenerateModesBtn) {
            continueGenerateModesBtn.addEventListener('click', () => {
                this.continueGenerateOtherModes();
            });
        }

        // 下载PDF按钮
        if (this.downloadPdfBtn) {
            this.downloadPdfBtn.addEventListener('click', () => {
                this.downloadPdf();
            });
        }

        // 复制内容按钮
        if (this.copyContentBtn) {
            this.copyContentBtn.addEventListener('click', () => {
                this.copyContent();
            });
        }
    }

    // 处理标签页切换
    handleTabChange(tabId) {
        // 更新按钮状态
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });

        // 更新内容显示
        const tabPanes = document.querySelectorAll('.tab-pane');
        tabPanes.forEach(pane => {
            pane.classList.remove('active');
        });

        const activePane = document.getElementById(`${tabId}Pane`);
        if (activePane) {
            activePane.classList.add('active');
        }

        // 切换标签时隐藏继续生成按钮
        if (tabId !== 'content') {
            this.hideContinueButton();
        } else {
            // 如果内容显示区有内容，检查是否显示继续按钮
            const currentContent = this.contentDisplay.textContent || '';
            if (currentContent.length > 1000) {
                this.showContinueButton();
            }
        }
    }

    // 下载PDF
    downloadPdf() {
        // 使用原始 Markdown 内容而不是从 DOM 中提取
        const content = this.rawMarkdownContent || '';
        console.log('准备下载 PDF，原始内容长度:', content.length);

        if (!content) {
            this.showNotification('没有可下载的内容', 'warning');
            return;
        }

        if (typeof html2pdf === 'undefined') {
            this.showNotification('PDF下载功能未加载', 'error');
            return;
        }

        // 创建完整的HTML文档，包含封面页和目录
        const title = this.resultData.topic || '学习指南';
        const date = new Date().toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // 生成目录
        const headings = content.match(/^#+\s+.+$/gm) || [];
        let tocHTML = '<div style="page-break-after: always; padding: 40px; margin-bottom: 30px;">';
        tocHTML += '<h2 style="color: #1d1d20; border-bottom: 2px solid #52bbb1; padding-bottom: 8px; margin-bottom: 20px;">目录</h2>';
        tocHTML += '<ul style="list-style: none; padding-left: 0;">';

        headings.forEach((heading, index) => {
            const level = heading.match(/^#+/)[0].length;
            const text = heading.replace(/^#+\s+/, '');
            const indent = (level - 1) * 20;
            tocHTML += `<li style="margin-bottom: 8px; padding-left: ${indent}px;"><a href="#section-${index}" style="color: #1d1d20; text-decoration: none; border-bottom: 1px dotted #ccc;">${index + 1}. ${text}</a></li>`;
        });

        tocHTML += '</ul></div>';

        // 生成封面页
        const coverHTML = `
            <div style="page-break-after: always; text-align: center; padding: 80px 40px;">
                <h1 style="font-size: 32pt; font-weight: 400; color: #1d1d20; margin-bottom: 20px;">${title}</h1>
                <div style="width: 80px; height: 3px; background: #52bbb1; margin: 30px auto; border-radius: 2px;"></div>
                <p style="font-size: 16pt; color: #666; margin-bottom: 40px;">AI 驱动的个性化学习文档</p>
                <div style="font-size: 12pt; color: #999; margin-top: 60px;">
                    <p>生成时间：${date}</p>
                    <p>生成工具：U_learner</p>
                </div>
            </div>
        `;

        // 创建内容元素
        const element = document.createElement('div');
        element.innerHTML = coverHTML + tocHTML + this.renderMarkdown(content);

        // 应用 Hello 算法风格的样式
        element.style.cssText = `
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", "Noto Sans SC", sans-serif;
            font-size: 11pt;
            line-height: 1.7;
            color: #1d1d20;
            background: #ffffff;
            padding: 30px 40px;
        `;

        // 添加样式到内容中 - 书籍排版优化版
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            /* ========== 书籍排版基础样式 ========== */

            /* 正文首行缩进 - 中文书刊标准 */
            p {
                text-indent: 2em;
                margin-bottom: 0;
                line-height: 1.8;
                text-align: justify;
                text-justify: inter-ideograph;
                orphans: 3;
                widows: 3;
            }

            /* 标题后的首个段落不缩进 */
            h1 + p, h2 + p, h3 + p, h4 + p {
                text-indent: 0;
            }

            /* 标题样式 - 符合书籍排版规范 */
            h1, h2, h3, h4, h5, h6 {
                color: #1d1d20 !important;
                font-weight: 500;
                page-break-after: avoid;
                text-align: left;
            }

            /* 一级标题 - 章标题 */
            h1 {
                font-size: 22pt !important;
                font-weight: 400 !important;
                border-bottom: 2px solid #52bbb1 !important;
                padding-bottom: 8px;
                margin-top: 0;
                margin-bottom: 20px;
                color: #1d1d20 !important;
                page-break-before: always;
            }

            /* 封面页的 h1 不分页 */
            .cover-page h1 {
                page-break-before: avoid;
            }

            /* 二级标题 - 节标题 */
            h2 {
                font-size: 17pt !important;
                font-weight: 400 !important;
                border-bottom: 1px solid #e8e8e8 !important;
                padding-bottom: 6px;
                margin-top: 32px;
                margin-bottom: 16px;
                page-break-before: avoid;
                page-break-after: avoid;
            }

            /* 三级标题 - 小节标题 */
            h3 {
                font-size: 14pt !important;
                font-weight: 500 !important;
                margin-top: 24px;
                margin-bottom: 12px;
                color: #349890 !important;
                page-break-after: avoid;
            }

            /* 四级标题 */
            h4 {
                font-size: 12pt !important;
                font-weight: 500 !important;
                margin-top: 16px;
                margin-bottom: 10px;
                color: #555 !important;
                page-break-after: avoid;
            }

            /* 段落间距 */
            p + p {
                margin-top: 0;
            }

            h1 + p, h2 + p, h3 + p {
                margin-top: 8px;
            }

            /* 列表样式 */
            ul, ol {
                margin: 12px 0;
                padding-left: 2em;
                line-height: 1.8;
            }

            li {
                margin-bottom: 4px;
            }

            /* 列表项内段落不缩进 */
            li p {
                text-indent: 0;
            }

            /* 代码块样式 - 避免跨页分割 */
            pre {
                background: #f5f5f5 !important;
                padding: 14px 16px !important;
                border-radius: 6px !important;
                overflow-x: auto;
                margin: 16px 0 !important;
                border: 1px solid #e8e8e8 !important;
                white-space: pre-wrap;
                font-size: 0.9em;
                line-height: 1.6;
                page-break-inside: avoid;
            }

            code {
                background: #f5f5f5 !important;
                padding: 3px 6px !important;
                border-radius: 4px !important;
                font-family: "Fira Code", "JetBrains Mono", "Consolas", "SF Mono", "Monaco", "Courier New", monospace !important;
                font-size: 0.9em;
                color: #1d1d20 !important;
            }

            pre code {
                background: transparent !important;
                padding: 0 !important;
                border-radius: 0 !important;
            }

            /* 引用块样式 - 避免跨页分割 */
            blockquote {
                border-left: 4px solid #52bbb1 !important;
                padding: 12px 16px !important;
                margin: 16px 0 !important;
                color: #666 !important;
                background: #fafafa !important;
                border-radius: 0 4px 4px 0 !important;
                page-break-inside: avoid;
                line-height: 1.8;
            }

            blockquote p {
                text-indent: 0;
            }

            /* 表格样式 - 避免跨页分割 */
            table {
                border-collapse: collapse;
                width: 100%;
                margin: 16px 0;
                border-radius: 6px;
                overflow: hidden;
                page-break-inside: avoid;
            }

            th, td {
                border: 1px solid #e8e8e8;
                padding: 10px 12px;
                text-align: left;
                line-height: 1.6;
            }

            th {
                background: #f5f5f5 !important;
                font-weight: 500;
                color: #1d1d20 !important;
            }

            tr:nth-child(even) {
                background: #fafafa;
            }

            /* 强调文本 */
            strong {
                color: #1d1d20;
                font-weight: 600;
            }

            /* 图片样式 - 避免跨页分割 */
            img {
                max-width: 100%;
                height: auto;
                border-radius: 6px;
                margin: 16px 0;
                page-break-inside: avoid;
            }

            /* 链接样式 */
            a {
                color: #349890 !important;
                text-decoration: none;
                border-bottom: 1px solid transparent;
            }

            /* 分隔线 */
            hr {
                border: none;
                border-top: 1px solid #e8e8e8;
                margin: 24px 0;
            }

            /* 避免孤行寡行 */
            .pdf-content > *:first-child {
                page-break-before: avoid;
            }

            /* 目录样式 */
            .toc {
                page-break-after: always;
                page-break-before: avoid;
            }

            .toc h2 {
                margin-top: 0;
            }

            .toc ul {
                list-style: none;
                padding-left: 0;
            }

            .toc li {
                margin: 8px 0;
                line-height: 1.6;
            }

            .toc a {
                color: #1d1d20;
            }

            /* 封面页 */
            .cover-page {
                page-break-after: always;
                page-break-before: avoid;
            }
        `;
        element.appendChild(styleElement);

        const opt = {
            margin: [10, 10, 10, 10],
            filename: `${this.resultData.topic}_学习指南.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        this.showNotification('正在生成 PDF...', 'info');

        try {
            html2pdf().set(opt).from(element).save();
            this.showNotification('PDF 下载成功', 'success');
        } catch (error) {
            console.error('PDF 生成失败:', error);
            this.showNotification('PDF 生成失败，请重试', 'error');
        }
    }

    // 复制内容
    copyContent() {
        // 使用原始 Markdown 内容而不是从 DOM 中提取
        const content = this.rawMarkdownContent || '';
        console.log('准备复制内容，长度:', content.length);

        if (!content) {
            this.showNotification('没有可复制的内容', 'warning');
            return;
        }

        navigator.clipboard.writeText(content).then(() => {
            this.showNotification('内容已复制到剪贴板', 'success');
        }).catch(err => {
            console.error('复制失败:', err);
            this.showNotification('复制失败，请手动复制', 'error');
        });
    }

    // 显示通知
    showNotification(message, type = 'info') {
        if (!this.notification) return;

        this.notification.textContent = message;
        this.notification.style.display = 'block';
        this.notification.className = `notification notification-${type}`;

        // 3秒后自动隐藏
        setTimeout(() => {
            this.notification.style.display = 'none';
        }, 3000);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async () => {
    const resultPage = new ResultPage();
    await resultPage.initialize();
});
