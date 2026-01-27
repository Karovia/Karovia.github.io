/**
 * API 客户端类
 *
 * 封装了所有AI服务的API调用逻辑，提供统一的接口
 * 支持OpenAI、Gemini、Claude、Deepseek、智谱AI、豆包、扣子AI等
 *
 * @class
 * @author U_learner Team
 * @version 1.0.0 */

// 确保 APIConfig 存在，如果不存在则使用默认值
const SafeAPIConfig = typeof APIConfig !== 'undefined' ? APIConfig : {
    services: {},
    retryConfig: {
        maxRetries: 3,
        retryDelay: 1000,
        backoffFactor: 2
    },
    defaults: {
        aiService: 'openai',
        learningModes: ['pdf'],
        fontSize: 16,
        theme: 'light',
        autoSave: true
    },
    errorMessages: {
        NETWORK_ERROR: '网络连接错误，请检查您的网络设置',
        API_KEY_INVALID: 'API密钥无效，请确认您的API密钥是否正确填写',
        API_KEY_MISSING: '请先输入API密钥',
        RATE_LIMIT: '请求过于频繁，请稍后再试',
        SERVICE_UNAVAILABLE: '服务暂时不可用，请稍后再试',
        CONTENT_ERROR: '内容生成失败，请重试',
        UNKNOWN_ERROR: '发生未知错误，请重试'
    },
    validateConfig: function(config) {
        return [];
    }
};

class APIClient {
    constructor(config = {}) {
        this.config = config;
        this.services = SafeAPIConfig.services;
        this.retryConfig = SafeAPIConfig.retryConfig;
        this.defaultService = config.defaultService || 'openai';
    }

    /**
     * 验证API密钥是否为空
     * 注意：格式验证已移除，实际有效性在API请求时验证
     *
     * @param {string} apiKey - API密钥
     * @param {string} service - AI服务名称（未使用，保留参数兼容性）
     * @returns {boolean} 密钥是否存在
     */
    validateApiKey(apiKey, service) {
        if (!apiKey || apiKey.trim() === '') {
            throw new Error(SafeAPIConfig.errorMessages.API_KEY_MISSING);
        }
        return true;
    }

    /**
     * 发送API请求，支持自动重试
     *
     * @param {string} service - AI服务名称
     * @param {Object} payload - 请求载荷
     * @param {number} retryCount - 重试次数
     * @returns {Promise<Object>} 响应结果
     * @throws {Error} 请求失败时抛出错误
     */
    async sendRequest(service, payload, retryCount = 0) {
        const serviceConfig = this.services[service];
        if (!serviceConfig) {
            throw new Error(`不支持的 AI 服务: ${service}`);
        }

        // 检查 API 密钥是否存在
        const apiKey = localStorage.getItem('apiKey');
        if (!apiKey || apiKey.trim() === '') {
            throw new Error(SafeAPIConfig.errorMessages.API_KEY_MISSING);
        }

        try {
            // 准备请求配置
            const headers = serviceConfig.requiredHeaders();
            const requestBody = serviceConfig.formatPrompt(
                payload.topic,
                payload.mode,
                payload.model
            );

            // 特殊处理 Gemini（不需要 Authorization）
            if (service === 'gemini') {
                delete headers['Authorization'];
            }

            const response = await fetch(serviceConfig.apiEndpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw this.handleApiError(response.status, errorData, service);
            }

            // 解析响应
            const responseData = await this.parseResponse(response, service);

            return {
                success: true,
                data: responseData,
                service: service,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            // 重试逻辑
            if (this.shouldRetry(error, retryCount)) {
                const delay = this.retryConfig.retryDelay *
                    Math.pow(this.retryConfig.backoffFactor, retryCount);

                console.warn(`请求失败，${delay}ms 后进行第 ${retryCount + 1} 次重试...`);
                await this.sleep(delay);
                return this.sendRequest(service, payload, retryCount + 1);
            }

            // 不重试，抛出错误
            throw error;
        }
    }

    // 解析不同服务的响应
    async parseResponse(response, service) {
        const data = await response.json();

        switch (service) {
            case 'openai':
            case 'deepseek':
            case 'zhipu':
            case 'doubao':
            case 'kouzi':
                // OpenAI 兼容的 API 响应格式
                if (data.choices && data.choices[0] && data.choices[0].message) {
                    return data.choices[0].message.content;
                }
                throw new Error(SafeAPIConfig.errorMessages.CONTENT_ERROR);

            case 'gemini':
                if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                    return data.candidates[0].content.parts[0].text;
                }
                throw new Error(SafeAPIConfig.errorMessages.CONTENT_ERROR);

            case 'claude':
                if (data.content && data.content[0]) {
                    return data.content[0].text;
                }
                throw new Error(SafeAPIConfig.errorMessages.CONTENT_ERROR);

            default:
                throw new Error(`不支持的响应格式: ${service}`);
        }
    }

    // 处理 API 错误
    handleApiError(status, errorData, service) {
        const errorMessages = {
            400: `请求参数错误: ${errorData.message || '请检查输入参数'}`,
            401: SafeAPIConfig.errorMessages.API_KEY_INVALID,
            403: 'API密钥权限不足，请检查密钥权限',
            429: SafeAPIConfig.errorMessages.RATE_LIMIT,
            500: SafeAPIConfig.errorMessages.SERVICE_UNAVAILABLE,
            502: SafeAPIConfig.errorMessages.SERVICE_UNAVAILABLE,
            503: SafeAPIConfig.errorMessages.SERVICE_UNAVAILABLE
        };

        const errorMessage = errorMessages[status] || SafeAPIConfig.errorMessages.UNKNOWN_ERROR;

        const error = new Error(errorMessage);
        error.status = status;
        error.service = service;
        error.originalError = errorData;

        return error;
    }

    // 判断是否应该重试
    shouldRetry(error, retryCount) {
        if (retryCount >= this.retryConfig.maxRetries) {
            return false;
        }

        // 网络错误或5xx错误重试
        if (error.message.includes('network') ||
            error.message.includes('fetch') ||
            (error.status && error.status >= 500)) {
            return true;
        }

        // 速率限制错误重试
        if (error.status === 429) {
            return true;
        }

        return false;
    }

    // 延迟函数
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 批量生成学习内容
    async generateLearningContent(config) {
        // 验证配置
        const validationErrors = SafeAPIConfig.validateConfig(config);
        if (validationErrors.length > 0) {
            throw new Error(`配置错误: ${validationErrors.join(', ')}`);
        }

        const results = [];
        const modes = config.modes || [];
        let hasError = false;

        // 并行生成所有内容
        const promises = modes.map(async (mode) => {
            try {
                const result = await this.sendRequest(config.service, {
                    topic: config.topic,
                    mode: mode,
                    model: config.model
                });

                return {
                    mode: mode,
                    success: true,
                    data: result.data
                };

            } catch (error) {
                console.error(`生成${mode}内容失败:`, error);
                hasError = true;

                return {
                    mode: mode,
                    success: false,
                    error: error.message
                };
            }
        });

        // 等待所有结果
        const resultsList = await Promise.all(promises);
        results.push(...resultsList);

        // 保存到最近搜索记录
        if (!hasError && config.topic) {
            this.saveRecentSearch(config.topic, modes, config.service);
        }

        return results;
    }

    // 保存最近搜索记录
    saveRecentSearch(topic, modes, service) {
        const recentSearches = this.getRecentSearches();

        // 检查是否已存在相同的搜索
        const existingIndex = recentSearches.findIndex(
            item => item.topic === topic && item.service === service
        );

        const searchRecord = {
            topic: topic,
            modes: modes,
            service: service,
            timestamp: new Date().toISOString()
        };

        if (existingIndex >= 0) {
            // 更新现有记录
            recentSearches[existingIndex] = searchRecord;
        } else {
            // 添加新记录
            recentSearches.unshift(searchRecord);

            // 最多保留10条记录
            if (recentSearches.length > 10) {
                recentSearches.pop();
            }
        }

        // 保存到 localStorage
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    }

    // 获取最近搜索记录
    getRecentSearches() {
        const stored = localStorage.getItem('recentSearches');
        try {
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('解析最近搜索记录失败:', e);
            return [];
        }
    }

    // 清除最近搜索记录
    clearRecentSearches() {
        localStorage.removeItem('recentSearches');
    }

    // 获取支持的 AI 服务列表
    getSupportedServices() {
        console.log('getSupportedServices - this.services:', this.services);
        const services = Object.entries(this.services).map(([key, config]) => ({
            id: key,
            name: config.name,
            model: config.model,
            defaultApiKey: config.defaultApiKey
        }));
        console.log('getSupportedServices - 返回的服务列表:', services);
        return services;
    }

    // 保存用户设置
    saveUserSettings(settings) {
        const defaultSettings = SafeAPIConfig.defaults;
        const mergedSettings = { ...defaultSettings, ...settings };

        localStorage.setItem('userSettings', JSON.stringify(mergedSettings));
    }

    // 获取用户设置
    getUserSettings() {
        try {
            const stored = localStorage.getItem('userSettings');
            return stored ? JSON.parse(stored) : SafeAPIConfig.defaults;
        } catch (e) {
            console.error('解析用户设置失败:', e);
            return SafeAPIConfig.defaults;
        }
    }

    // 保存 API 密钥
    // 注意：格式验证已移除，实际有效性在API请求时验证
    saveApiKey(apiKey) {
        if (!apiKey || apiKey.trim() === '') {
            throw new Error(SafeAPIConfig.errorMessages.API_KEY_MISSING);
        }

        const trimmedKey = apiKey.trim();
        localStorage.setItem('apiKey', trimmedKey);
    }

    // 获取 API 密钥
    getApiKey() {
        return localStorage.getItem('apiKey');
    }

    // 删除 API 密钥
    deleteApiKey() {
        localStorage.removeItem('apiKey');
    }
}

// 创建默认实例 - 供全局使用
const apiClient = new APIClient();

// 导出到全局作用域 - 兼容浏览器环境
if (typeof window !== 'undefined') {
    window.APIClient = APIClient;
    window.apiClient = apiClient;
}

// 支持ES模块导出（在浏览器环境中注释掉）
// export { APIClient, apiClient };