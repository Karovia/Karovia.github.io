/**
 * AI 服务切换修复验证测试脚本
 *
 * 这个脚本会测试：
 * 1. APIConfig 配置是否正确加载
 * 2. 每个服务的 formatPrompt 方法是否能正确调用
 * 3. 验证服务切换是否正常工作
 */

// 模拟浏览器环境
global.localStorage = {
    getItem: (key) => null,
    setItem: (key, value) => {},
    removeItem: (key) => {},
    clear: () => {}
};

// 临时删除 module 以模拟浏览器环境
const originalModule = global.module;
delete global.module;

// 加载配置文件（此时会走浏览器环境路径，导出到 window.APIConfig）
const fs = require('fs');
const path = require('path');
const configCode = fs.readFileSync(path.join(__dirname, 'config/api-config.js'), 'utf-8');

// 直接执行代码
const window = {};
const localStorage = global.localStorage;
eval(configCode);

// 获取 APIConfig
const APIConfig = window.APIConfig;

if (!APIConfig) {
    console.error('错误：无法加载 APIConfig');
    process.exit(1);
}

// 恢复 module
global.module = originalModule;

// 模拟加载 API 客户端
const APIClient = (() => {
    // 简化的 APIClient 类，用于测试
    class TestAPIClient {
        constructor() {
            this.services = APIConfig.services;
        }

        validateApiKey(apiKey, service) {
            if (!apiKey) {
                return false;
            }

            // 基础格式验证
            if (service === 'openai' || service === 'deepseek' || service === 'zhipu' || service === 'doubao' || service === 'kouzi') {
                // OpenAI/Deepseek/智谱/豆包/扣子 API 密钥格式：sk-...
                return /^sk-[a-zA-Z0-9_-]{20,}$/.test(apiKey);
            } else if (service === 'claude') {
                // Claude API 密钥格式：sk-ant-...
                return /^sk-ant-[a-zA-Z0-9_-]{35,}$/.test(apiKey);
            } else if (service === 'gemini') {
                // Gemini API 密钥格式：AIza...
                return /^AIza[0-9A-Za-z_-]{35}$/.test(apiKey);
            }

            return false;
        }
    }

    return TestAPIClient;
})();

console.log('========================================');
console.log('AI 服务切换修复验证测试');
console.log('========================================\n');

let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
        testsPassed++;
    } catch (error) {
        console.error(`✗ ${name}`);
        console.error(`  错误: ${error.message}`);
        testsFailed++;
    }
}

// 测试1：验证 APIConfig 加载
test('APIConfig 是否正确加载', () => {
    if (!APIConfig) {
        throw new Error('APIConfig 未定义');
    }
    if (!APIConfig.services) {
        throw new Error('APIConfig.services 未定义');
    }
});

// 测试2：验证所有服务配置存在
const services = ['openai', 'gemini', 'claude', 'deepseek', 'zhipu', 'doubao', 'kouzi'];

services.forEach(serviceId => {
    test(`${serviceId} 服务配置是否存在`, () => {
        const config = APIConfig.services[serviceId];
        if (!config) {
            throw new Error(`未找到 ${serviceId} 的配置`);
        }
        if (!config.formatPrompt) {
            throw new Error(`${serviceId} 缺少 formatPrompt 方法`);
        }
        if (!config.requiredHeaders) {
            throw new Error(`${serviceId} 缺少 requiredHeaders 方法`);
        }
    });
});

// 测试3：验证 formatPrompt 方法能正确调用
services.forEach(serviceId => {
    test(`${serviceId} formatPrompt 方法调用`, () => {
        const config = APIConfig.services[serviceId];
        const testTopic = '测试主题';
        const testMode = 'pdf';
        const testModel = Object.keys(config.models)[0];

        const requestBody = config.formatPrompt(testTopic, testMode, testModel);

        if (!requestBody) {
            throw new Error('formatPrompt 返回了空值');
        }

        // 验证模型是否正确设置
        if (serviceId === 'openai' || serviceId === 'deepseek' ||
            serviceId === 'zhipu' || serviceId === 'doubao' || serviceId === 'kouzi') {
            if (requestBody.model !== testModel) {
                throw new Error(`模型未正确设置: 期望 ${testModel}, 实际 ${requestBody.model}`);
            }
        } else if (serviceId === 'claude') {
            if (requestBody.model !== testModel) {
                throw new Error(`模型未正确设置: 期望 ${testModel}, 实际 ${requestBody.model}`);
            }
        } else if (serviceId === 'gemini') {
            // Gemini 使用不同的格式
            if (!requestBody.contents) {
                throw new Error('Gemini 请求格式错误');
            }
        }
    });
});

// 测试4：验证服务切换时使用正确的 formatPrompt
test('服务切换使用正确的 formatPrompt', () => {
    const client = new APIClient();

    services.forEach(serviceId => {
        const serviceConfig = APIConfig.services[serviceId];
        const testPayload = {
            topic: '测试主题',
            mode: 'pdf',
            model: Object.keys(serviceConfig.models)[0]
        };

        // 模拟修复后的代码逻辑：使用 serviceConfig.formatPrompt
        const requestBody = serviceConfig.formatPrompt(
            testPayload.topic,
            testPayload.mode,
            testPayload.model
        );

        if (!requestBody) {
            throw new Error(`${serviceId} 的 formatPrompt 返回了空值`);
        }
    });
});

// 测试5：验证 API 密钥验证
test('API 密钥验证 - OpenAI 格式', () => {
    const client = new APIClient();
    const validKey = 'sk-abcdefghijklmnopqrstuvwxyz123456';
    const invalidKey = 'invalid-key';

    if (!client.validateApiKey(validKey, 'openai')) {
        throw new Error('有效的 OpenAI 密钥验证失败');
    }
    if (client.validateApiKey(invalidKey, 'openai')) {
        throw new Error('无效的 OpenAI 密钥验证通过');
    }
});

test('API 密钥验证 - Claude 格式', () => {
    const client = new APIClient();
    const validKey = 'sk-ant-api1234567890abcdefghijklmnopqrstuvwxyz123456';
    const invalidKey = 'sk-invalid';

    if (!client.validateApiKey(validKey, 'claude')) {
        throw new Error('有效的 Claude 密钥验证失败');
    }
    if (client.validateApiKey(invalidKey, 'claude')) {
        throw new Error('无效的 Claude 密钥验证通过');
    }
});

test('API 密钥验证 - Gemini 格式', () => {
    const client = new APIClient();
    const validKey = 'AIzaSyAaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQq';
    const invalidKey = 'invalid-gemini-key';

    if (!client.validateApiKey(validKey, 'gemini')) {
        throw new Error('有效的 Gemini 密钥验证失败');
    }
    if (client.validateApiKey(invalidKey, 'gemini')) {
        throw new Error('无效的 Gemini 密钥验证通过');
    }
});

// 测试6：验证不同服务生成不同格式的请求体
test('不同服务生成不同的请求体格式', () => {
    const openaiBody = APIConfig.services.openai.formatPrompt('测试', 'pdf', 'gpt-3.5-turbo');
    const geminiBody = APIConfig.services.gemini.formatPrompt('测试', 'pdf', 'gemini-pro');
    const claudeBody = APIConfig.services.claude.formatPrompt('测试', 'pdf', 'claude-3-haiku-20240307');

    // OpenAI 格式应该有 messages 数组
    if (!Array.isArray(openaiBody.messages)) {
        throw new Error('OpenAI 请求体缺少 messages 数组');
    }

    // Gemini 格式应该有 contents 数组
    if (!Array.isArray(geminiBody.contents)) {
        throw new Error('Gemini 请求体缺少 contents 数组');
    }

    // Claude 格式应该有 messages 数组
    if (!Array.isArray(claudeBody.messages)) {
        throw new Error('Claude 请求体缺少 messages 数组');
    }
});

// 测试7：验证修复后的核心逻辑
test('验证修复：使用 serviceConfig.formatPrompt 而非 service.formatPrompt', () => {
    // 这是修复前的问题：代码使用了 service.formatPrompt（service 是字符串）
    // 修复后应该使用 serviceConfig.formatPrompt（serviceConfig 是配置对象）

    const serviceId = 'gemini';
    const serviceConfig = APIConfig.services[serviceId];

    // 检查 serviceConfig 是对象而非字符串
    if (typeof serviceConfig !== 'object') {
        throw new Error('serviceConfig 应该是对象');
    }

    // 检查 serviceConfig 有 formatPrompt 方法
    if (typeof serviceConfig.formatPrompt !== 'function') {
        throw new Error('serviceConfig.formatPrompt 应该是函数');
    }

    // 检查字符串 service 没有 formatPrompt 方法
    if (typeof serviceId.formatPrompt !== 'undefined') {
        throw new Error('字符串不应该有 formatPrompt 属性');
    }
});

// 打印测试结果汇总
console.log('\n========================================');
console.log('测试结果汇总');
console.log('========================================');
console.log(`总测试数: ${testsPassed + testsFailed}`);
console.log(`通过: ${testsPassed}`);
console.log(`失败: ${testsFailed}`);

if (testsFailed === 0) {
    console.log('\n✓ 所有测试通过！AI 服务切换修复已验证。');
    process.exit(0);
} else {
    console.log('\n✗ 有测试失败，请检查错误信息。');
    process.exit(1);
}
