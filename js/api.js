/**
 * API 客户端类
 *
 * 负责处理所有与 AI 服务提供商的通信
 * 包括请求发送、响应解析、重试机制等
 *
 * @class
 * @author U_learner Team
 * @version 1.0.0
 */

class APIClient {
    constructor() {
        this.storagePrefix = 'ulearn_';
    }

    /**
     * 保存 API 密钥
     */
    saveApiKey(apiKey) {
        if (!apiKey || typeof apiKey !== 'string') {
            throw new Error('API密钥不能为空');
        }
        localStorage.setItem(this.storagePrefix + 'apiKey', apiKey.trim());
    }

    /**
     * 获取 API 密钥
     */
    getApiKey() {
        return localStorage.getItem(this.storagePrefix + 'apiKey') || '';
    }

    /**
     * 验证 API 密钥格式
     */
    validateApiKey(apiKey, service) {
        if (!apiKey) return false;

        // 简单的格式验证
        switch (service) {
            case 'openai':
            case 'deepseek':
            case 'zhipu':
            case 'doubao':
            case 'kouzi':
                // OpenAI 格式: sk-xxx
                return apiKey.startsWith('sk-');
            case 'gemini':
                // Gemini 格式通常以字母开头
                return apiKey.length > 10;
            case 'claude':
                // Claude 格式: sk-ant-xxx
                return apiKey.startsWith('sk-ant-');
            default:
                return false;
        }
    }

    /**
     * 保存用户设置
     */
    saveUserSettings(settings) {
        const existingSettings = this.getUserSettings();
        const mergedSettings = { ...existingSettings, ...settings };
        localStorage.setItem(this.storagePrefix + 'settings', JSON.stringify(mergedSettings));
    }

    /**
     * 获取用户设置
     */
    getUserSettings() {
        try {
            const settings = localStorage.getItem(this.storagePrefix + 'settings');
            return settings ? JSON.parse(settings) : {};
        } catch (e) {
            console.error('解析用户设置失败:', e);
            return {};
        }
    }

    /**
     * 获取支持的服务列表
     */
    getSupportedServices() {
        const services = [];
        for (const [id, config] of Object.entries(SafeAPIConfig?.services || APIConfig?.services || {})) {
            services.push({
                id: id,
                name: config.name
            });
        }
        return services;
    }

    /**
     * 获取最近搜索记录
     */
    getRecentSearches() {
        try {
            const searches = localStorage.getItem(this.storagePrefix + 'recentSearches');
            return searches ? JSON.parse(searches) : [];
        } catch (e) {
            console.error('解析最近搜索失败:', e);
            return [];
        }
    }

    /**
     * 保存搜索记录
     */
    saveRecentSearch(topic, modes, service) {
        const searches = this.getRecentSearches();

        // 添加新搜索记录
        searches.unshift({
            topic: topic,
            modes: modes,
            service: service,
            timestamp: new Date().toISOString()
        });

        // 只保留最近10条记录
        const recentSearches = searches.slice(0, 10);

        localStorage.setItem(this.storagePrefix + 'recentSearches', JSON.stringify(recentSearches));
    }

    /**
     * 生成学习内容
     */
    async generateLearningContent(config) {
        // 验证配置
        const errors = APIConfig?.validateConfig?.(config) || [];
        if (errors.length > 0) {
            throw new Error(errors.join('; '));
        }

        const results = [];

        // 为每个学习模式生成内容
        for (const mode of config.modes) {
            try {
                const content = await this.sendRequest(
                    config.service,
                    {
                        topic: config.topic,
                        mode: mode,
                        model: config.model
                    },
                    0,
                    {
                        maxTokens: APIConfig?.defaults?.maxTokens || 3000,
                        temperature: APIConfig?.defaults?.temperature || 0.7
                    }
                );

                // 保存搜索记录
                this.saveRecentSearch(config.topic, config.modes, config.service);

                results.push({
                    mode: mode,
                    success: true,
                    data: content
                });
            } catch (error) {
                console.error(`${mode} 生成失败:`, error);
                results.push({
                    mode: mode,
                    success: false,
                    error: error.message
                });
            }
        }

        return results;
    }

    /**
     * 发送 API 请求
     */
    async sendRequest(service, config, retryCount = 0, options = {}) {
        const apiConfig = SafeAPIConfig?.services?.[service] || APIConfig?.services?.[service];

        if (!apiConfig) {
            throw new Error(`不支持的服务: ${service}`);
        }

        // 强制禁用流式响应以确保稳定性
        options.stream = false;

        // 格式化请求体
        const requestBody = apiConfig.formatPrompt(
            config.topic,
            config.mode,
            config.model || apiConfig.models[0],
            options
        );

        // 获取请求头
        const headers = apiConfig.requiredHeaders();
        const apiKey = this.getApiKey();

        // 替换 API 密钥占位符
        for (const key in headers) {
            headers[key] = headers[key].replace(localStorage.getItem('apiKey') || '', apiKey);
        }

        console.log(`发送请求到 ${service} API:`, {
            url: apiConfig.apiEndpoint,
            service: service,
            mode: config.mode,
            model: config.model
        });

        let response;
        try {
            response = await fetch(apiConfig.apiEndpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody)
            });
        } catch (error) {
            console.error('网络请求失败:', error);

            // 重试逻辑
            const retryConfig = APIConfig?.retryConfig || { maxRetries: 3, retryDelay: 1000 };
            if (retryCount < retryConfig.maxRetries) {
                const delay = retryConfig.retryDelay * Math.pow(retryConfig.backoffFactor || 2, retryCount);
                console.log(`等待 ${delay}ms 后重试...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.sendRequest(service, config, retryCount + 1, options);
            }

            throw new Error(APIConfig?.errorMessages?.NETWORK_ERROR || '网络连接错误');
        }

        // 解析响应
        return await this.parseResponse(response, service);
    }

    /**
     * 解析不同服务的响应
     */
    async parseResponse(response, service) {
        console.log(`parseResponse - 开始解析 ${service} 响应`);
        console.log('响应状态:', response.status);
        console.log('响应头:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API 错误响应:', errorText);

            // 根据状态码返回不同的错误信息
            if (response.status === 401) {
                throw new Error(SafeAPIConfig?.errorMessages?.API_KEY_INVALID || APIConfig?.errorMessages?.API_KEY_INVALID || 'API密钥无效');
            } else if (response.status === 429) {
                throw new Error(SafeAPIConfig?.errorMessages?.RATE_LIMIT || APIConfig?.errorMessages?.RATE_LIMIT || '请求过于频繁');
            } else if (response.status >= 500) {
                throw new Error(SafeAPIConfig?.errorMessages?.SERVICE_UNAVAILABLE || APIConfig?.errorMessages?.SERVICE_UNAVAILABLE || '服务暂时不可用');
            } else {
                throw new Error(`API 错误: ${response.status} - ${errorText}`);
            }
        }

        try {
            const data = await response.json();
            console.log('解析后的完整数据:', JSON.stringify(data, null, 2));

            let content = '';

            switch (service) {
                case 'openai':
                case 'deepseek':
                case 'doubao':
                case 'kouzi':
                    // OpenAI 兼容的 API 响应格式
                    if (data.choices && data.choices[0] && data.choices[0].message) {
                        content = data.choices[0].message.content;
                        console.log(`成功解析 ${service} 内容，长度: ${content.length}`);
                    } else {
                        console.error(`${service} 未返回 choices 或 message`);
                        console.error('响应数据:', data);
                        throw new Error(SafeAPIConfig?.errorMessages?.CONTENT_ERROR || APIConfig?.errorMessages?.CONTENT_ERROR || 'AI返回内容为空');
                    }
                    break;

                case 'zhipu':
                    // 智谱 API 响应格式：优先使用 reasoning_content
                    if (data.choices && data.choices[0] && data.choices[0].message) {
                        const message = data.choices[0].message;
                        // 智谱 API 可能使用 reasoning_content 字段
                        content = message.content || message.reasoning_content || '';
                        console.log(`成功解析 zhipu 内容，长度: ${content.length}`);
                        console.log(`使用的字段: ${message.content ? 'content' : 'reasoning_content'}`);
                    } else {
                        console.error('zhipu 未返回 choices 或 message');
                        console.error('响应数据:', data);
                        throw new Error(SafeAPIConfig?.errorMessages?.CONTENT_ERROR || APIConfig?.errorMessages?.CONTENT_ERROR || 'AI返回内容为空');
                    }
                    break;

                case 'gemini':
                    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
                        content = data.candidates[0].content.parts[0].text;
                        console.log(`成功解析 gemini 内容，长度: ${content.length}`);
                    } else {
                        console.error(`gemini 未返回 candidates、content 或 parts`);
                        console.error('响应数据:', data);
                        throw new Error(SafeAPIConfig?.errorMessages?.CONTENT_ERROR || APIConfig?.errorMessages?.CONTENT_ERROR || 'AI返回内容为空');
                    }
                    break;

                case 'claude':
                    if (data.content && data.content[0]) {
                        content = data.content[0].text;
                        console.log(`成功解析 claude 内容，长度: ${content.length}`);
                    } else {
                        console.error(`claude 未返回 content`);
                        console.error('响应数据:', data);
                        throw new Error(SafeAPIConfig?.errorMessages?.CONTENT_ERROR || APIConfig?.errorMessages?.CONTENT_ERROR || 'AI返回内容为空');
                    }
                    break;

                default:
                    console.error(`不支持的响应格式: ${service}`);
                    throw new Error(`不支持的响应格式: ${service}`);
            }

            // 检查内容是否为空或只包含空白字符
            if (!content || typeof content !== 'string' || content.trim().length === 0) {
                console.error(`${service} 返回内容为空`);
                console.error('响应数据:', data);
                throw new Error(SafeAPIConfig?.errorMessages?.CONTENT_ERROR || APIConfig?.errorMessages?.CONTENT_ERROR || 'AI返回内容为空');
            }

            return content;

        } catch (error) {
            // 如果是 API 错误，直接抛出
            if (error.message.includes('API 错误') || error.message.includes('API密钥') || error.message.includes('请求过于频繁')) {
                throw error;
            }
            console.error('JSON解析失败:', error);
            throw new Error(`响应解析失败: ${error.message}`);
        }
    }

    /**
     * 继续生成内容
     */
    async continueGeneration(service, config, history, retryCount = 0, options = {}) {
        const apiConfig = SafeAPIConfig?.services?.[service] || APIConfig?.services?.[service];

        if (!apiConfig) {
            throw new Error(`不支持的服务: ${service}`);
        }

        // 强制禁用流式响应以确保稳定性
        options.stream = false;

        // 格式化请求体，传递对话历史
        // 如果没有提供 continuePrompt，使用智能提示词
        const defaultContinuePrompt = '请基于原始大纲，继续编写下一个未完成的部分。要求：\n' +
            '1. **不要重复**已经写过的内容\n' +
            '2. 保持风格和格式一致（Markdown格式）\n' +
            '3. 每个章节完成后给出简洁的章节总结\n' +
            '4. 确保内容的逻辑连贯性\n' +
            '5. 请从下一个未完成的部分开始';

        const requestBody = apiConfig.formatPrompt(
            config.topic,
            config.mode,
            config.model || apiConfig.models[0],
            { ...options, history: history, continuePrompt: options.continuePrompt || defaultContinuePrompt }
        );

        // 获取请求头
        const headers = apiConfig.requiredHeaders();
        const apiKey = this.getApiKey();

        // 替换 API 密钥占位符
        for (const key in headers) {
            headers[key] = headers[key].replace(localStorage.getItem('apiKey') || '', apiKey);
        }

        console.log(`发送继续生成请求到 ${service} API:`, {
            url: apiConfig.apiEndpoint,
            service: service,
            mode: config.mode,
            model: config.model,
            historyLength: history.length
        });

        let response;
        try {
            response = await fetch(apiConfig.apiEndpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody)
            });
        } catch (error) {
            console.error('网络请求失败:', error);

            // 重试逻辑
            const retryConfig = APIConfig?.retryConfig || { maxRetries: 3, retryDelay: 1000 };
            if (retryCount < retryConfig.maxRetries) {
                const delay = retryConfig.retryDelay * Math.pow(retryConfig.backoffFactor || 2, retryCount);
                console.log(`等待 ${delay}ms 后重试...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.continueGeneration(service, config, history, retryCount + 1, options);
            }

            throw new Error(APIConfig?.errorMessages?.NETWORK_ERROR || '网络连接错误');
        }

        // 解析响应
        return await this.parseResponse(response, service);
    }
}

// 创建全局的 apiClient 实例
const apiClient = new APIClient();

// 创建 SafeAPIConfig 别名（兼容旧代码）
const SafeAPIConfig = APIConfig;

// 导出类和实例
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIClient, apiClient };
}
