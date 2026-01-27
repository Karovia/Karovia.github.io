/**
 * API 配置文件
 *
 * 该文件定义了所有支持的AI服务提供商的配置信息
 * 包括API端点、认证方式、请求格式和响应处理
 *
 * @author U_learner Team
 * @version 1.0.0
 */

const APIConfig = {
    // AI 服务提供商配置
    services: {
        // OpenAI 服务
        openai: {
            name: 'OpenAI',
            apiEndpoint: 'https://api.openai.com/v1/chat/completions',
            models: {
                'gpt-3.5-turbo': 'GPT-3.5 Turbo',
                'gpt-4': 'GPT-4',
                'gpt-4-turbo': 'GPT-4 Turbo',
                'gpt-4o': 'GPT-4O',
                'gpt-4o-mini': 'GPT-4O Mini'
            },
            defaultApiKey: '',
            requiredHeaders: () => ({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('apiKey') || ''}`
            }),
            formatPrompt: (topic, mode, model = 'gpt-3.5-turbo') => {
                const modePrompts = {
                    pdf: `请为"${topic}"创建一个详细的学习指南，包括基础概念、核心知识点、实践案例和进阶建议。请用Markdown格式编写，结构清晰，易于阅读。`,
                    mindmap: `请为"${topic}"创建一个思维导图大纲，包含主要分支和子分支，用层级结构展示知识点的逻辑关系。`,
                    animation: `请为"${topic}"创建一个分步骤的学习指南，将复杂内容分解为循序渐进的学习步骤，每个步骤包含关键概念和示例。`
                };
                return {
                    model: model,
                    messages: [
                        {
                            role: 'system',
                            content: '你是一位专业的学习助手，擅长将复杂知识转化为易于理解的格式。'
                        },
                        {
                            role: 'user',
                            content: modePrompts[mode] || modePrompts.pdf
                        }
                    ],
                    max_tokens: 2000,
                    temperature: 0.7
                };
            }
        },

        // Google Gemini 服务
        gemini: {
            name: 'Google Gemini',
            apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
            models: {
                'gemini-pro': 'Gemini Pro',
                'gemini-1.5-pro': 'Gemini 1.5 Pro',
                'gemini-1.5-flash': 'Gemini 1.5 Flash'
            },
            defaultApiKey: '',
            requiredHeaders: () => ({
                'Content-Type': 'application/json'
            }),
            formatPrompt: (topic, mode, model = 'gemini-pro') => {
                const modePrompts = {
                    pdf: `请为"${topic}"创建一个详细的学习指南，包括基础概念、核心知识点、实践案例和进阶建议。请用Markdown格式编写，结构清晰，易于阅读。`,
                    mindmap: `请为"${topic}"创建一个思维导图大纲，包含主要分支和子分支，用层级结构展示知识点的逻辑关系。`,
                    animation: `请为"${topic}"创建一个分步骤的学习指南，将复杂内容分解为循序渐进的学习步骤，每个步骤包含关键概念和示例。`
                };
                return {
                    contents: [{
                        parts: [{
                            text: modePrompts[mode] || modePrompts.pdf
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 1,
                        topP: 1,
                        maxOutputTokens: 2000
                    }
                };
            }
        },

        // Anthropic Claude 服务
        claude: {
            name: 'Anthropic Claude',
            apiEndpoint: 'https://api.anthropic.com/v1/messages',
            models: {
                'claude-3-haiku-20240307': 'Claude 3 Haiku',
                'claude-3-sonnet-20240229': 'Claude 3 Sonnet',
                'claude-3-opus-20240229': 'Claude 3 Opus',
                'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet'
            },
            defaultApiKey: '',
            requiredHeaders: () => ({
                'Content-Type': 'application/json',
                'x-api-key': localStorage.getItem('apiKey') || '',
                'anthropic-version': '2023-06-01'
            }),
            formatPrompt: (topic, mode, model = 'claude-3-haiku-20240307') => {
                const modePrompts = {
                    pdf: `请为"${topic}"创建一个详细的学习指南，包括基础概念、核心知识点、实践案例和进阶建议。请用Markdown格式编写，结构清晰，易于阅读。`,
                    mindmap: `请为"${topic}"创建一个思维导图大纲，包含主要分支和子分支，用层级结构展示知识点的逻辑关系。`,
                    animation: `请为"${topic}"创建一个分步骤的学习指南，将复杂内容分解为循序渐进的学习步骤，每个步骤包含关键概念和示例。`
                };
                return {
                    model: model,
                    max_tokens: 2000,
                    temperature: 0.7,
                    messages: [
                        {
                            role: 'user',
                            content: modePrompts[mode] || modePrompts.pdf
                        }
                    ]
                };
            }
        },

        // Deepseek 服务
        deepseek: {
            name: 'Deepseek',
            apiEndpoint: 'https://api.deepseek.com/v1/chat/completions',
            models: {
                'deepseek-chat': 'Deepseek Chat',
                'deepseek-coder': 'Deepseek Coder'
            },
            defaultApiKey: '',
            requiredHeaders: () => ({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('apiKey') || ''}`
            }),
            formatPrompt: (topic, mode, model = 'deepseek-chat') => {
                const modePrompts = {
                    pdf: `请为"${topic}"创建一个详细的学习指南，包括基础概念、核心知识点、实践案例和进阶建议。请用Markdown格式编写，结构清晰，易于阅读。`,
                    mindmap: `请为"${topic}"创建一个思维导图大纲，包含主要分支和子分支，用层级结构展示知识点的逻辑关系。`,
                    animation: `请为"${topic}"创建一个分步骤的学习指南，将复杂内容分解为循序渐进的学习步骤，每个步骤包含关键概念和示例。`
                };
                return {
                    model: model,
                    messages: [
                        {
                            role: 'system',
                            content: '你是一位专业的学习助手，擅长将复杂知识转化为易于理解的格式。'
                        },
                        {
                            role: 'user',
                            content: modePrompts[mode] || modePrompts.pdf
                        }
                    ],
                    max_tokens: 2000,
                    temperature: 0.7,
                    stream: false
                };
            }
        },

        // 智谱 AI（ChatGLM）服务
        zhipu: {
            name: '智谱 AI',
            apiEndpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
            models: {
                'glm-4': 'GLM-4',
                'glm-4v': 'GLM-4V',
                'glm-4.6v': 'GLM-4.6V',
                'glm-4.5-air': 'GLM-4.5 Air',
                'glm-4.7': 'GLM-4.7',
                'glm-3-turbo': 'GLM-3 Turbo'
            },
            defaultApiKey: '',
            requiredHeaders: () => ({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('apiKey') || ''}`
            }),
            formatPrompt: (topic, mode, model = 'glm-4') => {
                const modePrompts = {
                    pdf: `请为"${topic}"创建一个详细的学习指南，包括基础概念、核心知识点、实践案例和进阶建议。请用Markdown格式编写，结构清晰，易于阅读。`,
                    mindmap: `请为"${topic}"创建一个思维导图大纲，包含主要分支和子分支，用层级结构展示知识点的逻辑关系。`,
                    animation: `请为"${topic}"创建一个分步骤的学习指南，将复杂内容分解为循序渐进的学习步骤，每个步骤包含关键概念和示例。`
                };
                return {
                    model: model,
                    messages: [
                        {
                            role: 'system',
                            content: '你是一位专业的学习助手，擅长将复杂知识转化为易于理解的格式。'
                        },
                        {
                            role: 'user',
                            content: modePrompts[mode] || modePrompts.pdf
                        }
                    ],
                    max_tokens: 2000,
                    temperature: 0.7,
                    stream: false
                };
            }
        },

        // 豆包服务
        doubao: {
            name: '豆包',
            apiEndpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
            models: {
                'doubao-pro-4k': '豆包 Pro 4K',
                'doubao-pro-32k': '豆包 Pro 32K',
                'doubao-lite': '豆包 Lite'
            },
            defaultApiKey: '',
            requiredHeaders: () => ({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('apiKey') || ''}`
            }),
            formatPrompt: (topic, mode, model = 'doubao-pro-4k') => {
                const modePrompts = {
                    pdf: `请为"${topic}"创建一个详细的学习指南，包括基础概念、核心知识点、实践案例和进阶建议。请用Markdown格式编写，结构清晰，易于阅读。`,
                    mindmap: `请为"${topic}"创建一个思维导图大纲，包含主要分支和子分支，用层级结构展示知识点的逻辑关系。`,
                    animation: `请为"${topic}"创建一个分步骤的学习指南，将复杂内容分解为循序渐进的学习步骤，每个步骤包含关键概念和示例。`
                };
                return {
                    model: model,
                    messages: [
                        {
                            role: 'system',
                            content: '你是一位专业的学习助手，擅长将复杂知识转化为易于理解的格式。'
                        },
                        {
                            role: 'user',
                            content: modePrompts[mode] || modePrompts.pdf
                        }
                    ],
                    max_tokens: 2000,
                    temperature: 0.7
                };
            }
        },

        // 扣子服务
        kouzi: {
            name: '扣子 AI',
            apiEndpoint: 'https://ark.cn-hangzhou.volces.com/api/v3/chat/completions',
            models: {
                'kouzi-pro': '扣子 Pro',
                'kouzi-lite': '扣子 Lite'
            },
            defaultApiKey: '',
            requiredHeaders: () => ({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('apiKey') || ''}`
            }),
            formatPrompt: (topic, mode, model = 'kouzi-pro') => {
                const modePrompts = {
                    pdf: `请为"${topic}"创建一个详细的学习指南，包括基础概念、核心知识点、实践案例和进阶建议。请用Markdown格式编写，结构清晰，易于阅读。`,
                    mindmap: `请为"${topic}"创建一个思维导图大纲，包含主要分支和子分支，用层级结构展示知识点的逻辑关系。`,
                    animation: `请为"${topic}"创建一个分步骤的学习指南，将复杂内容分解为循序渐进的学习步骤，每个步骤包含关键概念和示例。`
                };
                return {
                    model: model,
                    messages: [
                        {
                            role: 'system',
                            content: '你是一位专业的学习助手，擅长将复杂知识转化为易于理解的格式。'
                        },
                        {
                            role: 'user',
                            content: modePrompts[mode] || modePrompts.pdf
                        }
                    ],
                    max_tokens: 2000,
                    temperature: 0.7
                };
            }
        }
    },

    // 学习内容模板
    learningTemplates: {
        pdf: {
            title: '学习指南',
            format: 'markdown',
            sections: [
                { name: '概述', required: true },
                { name: '基础概念', required: true },
                { name: '核心知识点', required: true },
                { name: '实践案例', required: true },
                { name: '进阶建议', required: false }
            ]
        },
        mindmap: {
            title: '思维导图',
            format: 'json',
            structure: {
                root: '',
                branches: [],
                subBranches: []
            }
        },
        animation: {
            title: '动画演示',
            format: 'steps',
            sections: [
                { name: '导入', duration: 2 },
                { name: '基础概念', duration: 3 },
                { name: '进阶概念', duration: 3 },
                { name: '实践演示', duration: 4 },
                { name: '总结', duration: 2 }
            ]
        }
    },

    // 错误消息配置
    errorMessages: {
        NETWORK_ERROR: '网络连接错误，请检查您的网络设置',
        API_KEY_INVALID: 'API密钥无效，请检查您的API密钥',
        RATE_LIMIT: '请求过于频繁，请稍后再试',
        SERVICE_UNAVAILABLE: '服务暂时不可用，请稍后再试',
        CONTENT_ERROR: '内容生成失败，请重试',
        UNKNOWN_ERROR: '发生未知错误，请重试'
    },

    // 重试配置
    retryConfig: {
        maxRetries: 3,
        retryDelay: 1000,
        backoffFactor: 2
    },

    // 默认设置
    defaults: {
        aiService: 'openai',
        learningModes: ['pdf'],
        fontSize: 16,
        theme: 'light',
        autoSave: true
    },

    // 验证配置
    // 注意：API密钥验证已移除，因为密钥保存在localStorage中，在API请求时验证
    validateConfig: function(config) {
        const errors = [];

        if (!config || typeof config !== 'object') {
            errors.push('配置必须是一个对象');
            return errors;
        }

        // 验证学习内容
        if (!config.topic || typeof config.topic !== 'string' || config.topic.trim().length === 0) {
            errors.push('学习内容不能为空');
        }

        // 验证学习方式
        if (!config.modes || !Array.isArray(config.modes) || config.modes.length === 0) {
            errors.push('请选择至少一种学习方式');
        }

        // 验证服务
        if (!config.service || typeof config.service !== 'string') {
            errors.push('请选择AI服务');
        }

        return errors;
    }
};

// 导出配置 - 支持CommonJS和浏览器环境
if (typeof module !== 'undefined' && module.exports) {
    // Node.js 环境
    module.exports = APIConfig;
} else if (typeof window !== 'undefined') {
    // 浏览器环境
    window.APIConfig = APIConfig;
}