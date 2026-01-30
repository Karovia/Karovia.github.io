/**
 * U_learner 主应用类
 *
 * 负责整个应用的核心逻辑，包括：
 * - UI组件初始化和事件绑定
 * - 搜索流程管理
 * - 用户数据管理
 * - 页面状态控制
 *
 * @class
 * @author U_learner Team
 * @version 1.0.0
 */

// 使用全局的 SafeAPIConfig（在 api.js 中定义）
// const SafeAPIConfig 已在 api.js 中定义，这里不再重复声明

class U_learnerApp {
    constructor() {
        this.apiClient = apiClient;
        this.initializeElements();
        this.bindEvents();
        this.loadRecentSearches();
        this.loadUserSettings();
        this.initializeServices();
    }

    /**
     * 初始化页面元素
     *
     * 获取DOM元素引用并存储到实例属性中
     * @private
     */
    initializeElements() {
        console.log('initializeElements - 开始');

        // 表单元素
        this.searchForm = document.getElementById('searchForm');
        this.searchInput = document.getElementById('searchInput');
        this.apiKeyInput = document.getElementById('apiKeyInput');
        this.aiServiceSelect = document.getElementById('aiServiceSelect');
        this.modelSelect = document.getElementById('modelSelect');
        this.submitBtn = document.getElementById('submitBtn');
        this.btnText = this.submitBtn?.querySelector('.btn-text');
        this.btnLoader = this.submitBtn?.querySelector('.btn-loader');

        // 验证关键元素是否存在
        if (!this.aiServiceSelect) {
            console.error('错误：找不到 aiServiceSelect 元素');
        }
        if (!this.modelSelect) {
            console.error('错误：找不到 modelSelect 元素');
        }

        // 密码显示/隐藏
        this.togglePasswordBtn = document.getElementById('togglePassword');

        // 最近搜索
        this.recentList = document.getElementById('recentList');
        this.recentSearches = document.getElementById('recentSearches');

        // 通知元素
        this.notification = document.getElementById('notification');

        // 学习方式复选框
        this.learningModeCheckboxes = document.querySelectorAll(
            'input[name="learningMode"]'
        );

        console.log('initializeElements - 完成');
    }

    /**
     * 绑定事件监听器
     *
     * 为页面元素绑定各种事件处理器
     * @private
     */
    bindEvents() {
        // 表单提交
        this.searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSearch();
        });

        // 密码显示/隐藏
        this.togglePasswordBtn.addEventListener('click', () => {
            this.togglePasswordVisibility();
        });

        // AI 服务切换
        this.aiServiceSelect.addEventListener('change', () => {
            this.handleServiceChange();
        });

        // 模型选择切换
        this.aiServiceSelect.addEventListener('change', () => {
            this.updateModelOptions();
        });

        // API 密钥输入
        this.apiKeyInput.addEventListener('input', () => {
            const apiKey = this.apiKeyInput.value.trim();
            if (apiKey) {
                try {
                    this.apiClient.saveApiKey(apiKey);
                    this.showNotification('API密钥已保存', 'success');
                } catch (error) {
                    this.showNotification(error.message, 'error');
                }
            }
        });

        // 学习方式卡片样式更新
        this.updateLearningModeStyles();

        // 最近搜索项点击
        this.recentList.addEventListener('click', (e) => {
            const li = e.target.closest('li:not(.empty)');
            if (li && !li.classList.contains('empty')) {
                const topic = li.dataset.topic;
                const modes = JSON.parse(li.dataset.modes);
                const service = li.dataset.service;

                this.searchInput.value = topic;
                this.aiServiceSelect.value = service;

                // 更新学习方式
                this.learningModeCheckboxes.forEach(checkbox => {
                    checkbox.checked = modes.includes(checkbox.value);
                    // 触发 change 事件以更新样式
                    checkbox.dispatchEvent(new Event('change'));
                });

                this.handleSearch();
            }
        });

        // 输入框回车快捷键
        [this.searchInput, this.apiKeyInput].forEach(input => {
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        this.handleSearch();
                    }
                });
            }
        });
    }

    /**
     * 处理AI服务切换
     *
     * 更新API密钥输入框的placeholder文本
     * 更新模型选项为对应服务下的模型
     * 保存用户设置
     * 验证API密钥是否适用于新服务
     */
    handleServiceChange() {
        console.log('handleServiceChange - 开始执行');

        const service = this.aiServiceSelect.value;
        console.log('handleServiceChange - 选择的服务:', service);
        console.log('handleServiceChange - SafeAPIConfig.services:', SafeAPIConfig.services);
        console.log('handleServiceChange - SafeAPIConfig.services[service]:', SafeAPIConfig.services[service]);

        const config = SafeAPIConfig.services[service];

        // 更新API密钥输入框的placeholder
        if (config && config.name) {
            this.apiKeyInput.placeholder = `输入您的 ${config.name} API 密钥`;
            console.log('handleServiceChange - 更新 placeholder:', this.apiKeyInput.placeholder);
        }

        // 更新模型选项
        this.updateModelOptions();

        // 保存用户设置
        const settings = this.apiClient.getUserSettings();
        settings.aiService = service;
        this.apiClient.saveUserSettings(settings);

        // 提示用户可能需要更新 API 密钥
        const apiKey = this.apiClient.getApiKey();
        if (apiKey) {
            // 验证当前密钥是否适用于新服务
            if (!this.apiClient.validateApiKey(apiKey, service)) {
                this.showNotification(
                    `当前API密钥可能不适用于${this.aiServiceSelect.options[this.aiServiceSelect.selectedIndex].text.split(' ')[0]}，请检查密钥格式`,
                    'warning'
                );
            }
        }

        console.log('handleServiceChange - 执行完成');
    }

    /**
     * 初始化 AI 服务选项
     *
     * 从API配置中加载所有支持的AI服务
     * 填充到AI服务选择下拉框中
     */
    initializeServices() {
        console.log('initializeServices - 开始执行');
        console.log('initializeServices - APIConfig:', APIConfig);

        const services = this.apiClient.getSupportedServices();
        this.aiServiceSelect.innerHTML = '';

        services.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = `${service.name}`;
            this.aiServiceSelect.appendChild(option);
        });

        console.log('initializeServices - 添加了 ' + services.length + ' 个服务选项');

        // 恢复用户设置
        const settings = this.apiClient.getUserSettings();
        this.aiServiceSelect.value = settings.aiService || 'openai';

        console.log('initializeServices - 当前选择的服务:', this.aiServiceSelect.value);

        // 初始化模型选项和placeholder
        this.handleServiceChange();

        console.log('initializeServices - 执行完成');
    }

    /**
     * 更新模型选项
     *
     * 根据当前选择的AI服务
     * 动态更新模型选择下拉框中的选项
     */
    updateModelOptions() {
        const service = this.aiServiceSelect.value;
        const config = SafeAPIConfig.services[service];

        console.log('updateModelOptions - service:', service);
        console.log('updateModelOptions - config:', config);
        console.log('updateModelOptions - models:', config?.models);

        // 清空模型选择框
        this.modelSelect.innerHTML = '';

        if (config && config.models) {
            // 添加模型选项
            Object.entries(config.models).forEach(([modelId, modelName]) => {
                const option = document.createElement('option');
                option.value = modelId;
                option.textContent = modelName;
                this.modelSelect.appendChild(option);
            });

            // 恢复用户设置的模型
            const settings = this.apiClient.getUserSettings();
            if (settings.model && config.models[settings.model]) {
                this.modelSelect.value = settings.model;
            } else {
                // 使用默认模型（第一个）
                this.modelSelect.value = Object.keys(config.models)[0];
            }

            console.log('updateModelOptions - selected value:', this.modelSelect.value);
        } else {
            // 如果没有模型配置，显示默认选项
            const option = document.createElement('option');
            option.value = 'default';
            option.textContent = '默认模型';
            this.modelSelect.appendChild(option);
            this.modelSelect.value = 'default';
            console.error('updateModelOptions - 没有找到模型配置');
        }
    }

    /**
     * 切换密码可见性
     *
     * 在密码模式和文本模式之间切换
     * 更新眼睛图标的状态
     */
    togglePasswordVisibility() {
        const type = this.apiKeyInput.type === 'password' ? 'text' : 'password';
        this.apiKeyInput.type = type;

        const svg = this.togglePasswordBtn.querySelector('svg');
        if (type === 'text') {
            svg.innerHTML = `
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
            `;
        } else {
            svg.innerHTML = `
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
            `;
        }
    }

    // 处理搜索
    async handleSearch() {
        const topic = this.searchInput.value.trim();
        const apiKey = this.apiKeyInput.value.trim();
        const service = this.aiServiceSelect.value;
        const model = this.modelSelect.value;

        // 验证输入
        if (!topic) {
            this.showNotification('请输入您想学习的内容', 'warning');
            this.searchInput.focus();
            return;
        }

        // 获取选中的学习方式
        const selectedModes = Array.from(this.learningModeCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);

        if (selectedModes.length === 0) {
            this.showNotification('请至少选择一种学习方式', 'warning');
            return;
        }

        // 检查 API 密钥
        if (!apiKey) {
            this.showNotification('请输入 API 密钥', 'warning');
            this.apiKeyInput.focus();
            return;
        }

        try {
            // 显示加载状态
            this.setLoadingState(true);

            // 保存 API 密钥
            this.apiClient.saveApiKey(apiKey);
            this.apiClient.saveUserSettings({ aiService: service, model: model });

            // 优先生成 PDF（如果选择了 PDF）
            const modesToGenerate = selectedModes.includes('pdf') ? ['pdf'] : selectedModes.slice(0, 1);
            const remainingModes = selectedModes.filter(m => !modesToGenerate.includes(m));

            console.log('当前生成模式:', modesToGenerate);
            console.log('待生成模式:', remainingModes);

            // 生成学习内容
            const results = await this.apiClient.generateLearningContent({
                topic: topic,
                modes: modesToGenerate,
                service: service,
                model: model,
                timestamp: new Date().toISOString()
            });

            // 检查生成结果
            const successfulResults = results.filter(r => r.success);
            const failedResults = results.filter(r => !r.success);

            if (successfulResults.length > 0) {
                // 准备结果数据
                const resultData = {
                    topic: topic,
                    service: service,
                    model: model,
                    results: results,
                    remainingModes: remainingModes,  // 保存待生成的模式
                    timestamp: new Date().toISOString()
                };

                // 保存结果到 sessionStorage
                sessionStorage.setItem('lastResult', JSON.stringify(resultData));

                // 跳转到结果页面
                window.location.href = 'result.html';
            } else {
                throw new Error('PDF 生成失败');
            }

        } catch (error) {
            console.error('搜索失败:', error);
            this.showNotification(error.message, 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    // 设置加载状态
    setLoadingState(loading) {
        this.submitBtn.disabled = loading;

        if (loading) {
            this.btnText.style.display = 'none';
            this.btnLoader.style.display = 'block';
        } else {
            this.btnText.style.display = 'block';
            this.btnLoader.style.display = 'none';
        }
    }

    // 加载最近搜索记录
    loadRecentSearches() {
        const recentSearches = this.apiClient.getRecentSearches();

        if (recentSearches.length === 0) {
            this.recentList.innerHTML = '<li class="empty">暂无最近搜索记录</li>';
            this.recentSearches.style.display = 'none';
            return;
        }

        this.recentSearches.style.display = 'block';
        this.recentList.innerHTML = '';

        recentSearches.forEach((search, index) => {
            const li = document.createElement('li');
            li.dataset.topic = search.topic;
            li.dataset.modes = JSON.stringify(search.modes);
            li.dataset.service = search.service;

            const date = new Date(search.timestamp);
            const timeStr = this.formatRelativeTime(date);

            li.innerHTML = `
                <strong>${search.topic}</strong>
                <span style="margin-left: auto; font-size: 0.9rem; color: #7f8c8d;">
                    ${timeStr} · ${search.modes.join(', ')}
                </span>
            `;

            li.title = `${search.topic} - ${search.service} - ${date.toLocaleString()}`;

            this.recentList.appendChild(li);
        });
    }

    // 格式化相对时间
    formatRelativeTime(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (hours < 24) return `${hours}小时前`;
        if (days < 7) return `${days}天前`;

        return date.toLocaleDateString();
    }

    // 加载用户设置
    loadUserSettings() {
        const settings = this.apiClient.getUserSettings();

        // 恢复 API 密钥（如果有）
        const savedApiKey = this.apiClient.getApiKey();
        if (savedApiKey) {
            this.apiKeyInput.value = savedApiKey;
        }
    }

    // 更新卡片样式
    updateCardStyle(card, isChecked) {
        if (isChecked) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    }

    // 更新学习方式卡片样式
    updateLearningModeStyles() {
        document.querySelectorAll('.option-card').forEach(card => {
            const checkbox = card.querySelector('input[type="checkbox"]');

            // 监听复选框变化
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    this.updateCardStyle(card, checkbox.checked);
                });

                // 初始化样式（如果有默认选中的）
                if (checkbox.checked) {
                    this.updateCardStyle(card, true);
                }
            }
        });
    }

    // 显示通知
    showNotification(message, type = 'info') {
        // 隐藏已有通知
        this.notification.style.display = 'none';

        // 设置新通知
        this.notification.textContent = message;
        this.notification.className = `notification ${type}`;
        this.notification.style.display = 'block';

        // 自动隐藏
        setTimeout(() => {
            this.notification.style.display = 'none';
        }, 3000);
    }

    // 清除所有数据
    clearAllData() {
        if (confirm('确定要清除所有本地数据吗？这将删除您的API密钥、搜索记录和设置。')) {
            localStorage.clear();
            sessionStorage.clear();
            location.reload();
        }
    }

    // 导出用户数据
    exportUserData() {
        const data = {
            settings: this.apiClient.getUserSettings(),
            recentSearches: this.apiClient.getRecentSearches(),
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ulearn-export-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

/**
 * 页面加载完成后初始化应用
 *
 * 在DOM内容完全加载后创建应用实例
 * 并在开发环境下暴露调试接口
 */
document.addEventListener('DOMContentLoaded', () => {
    // 创建应用实例
    const app = new U_learnerApp();

    // 添加调试工具（仅在开发环境）
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.app = app;
        window.APIConfig = APIConfig;
        console.log('U_learner 应用已加载');
        console.log('使用 window.app 访问应用实例');
        console.log('可用的调试对象：', {
            app: '应用实例',
            APIConfig: 'API配置',
            APIClient: 'API客户端类',
            apiClient: 'API客户端实例'
        });
    }
});

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { U_learnerApp };
}