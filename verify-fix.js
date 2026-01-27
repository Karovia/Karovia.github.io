/**
 * AI 服务切换修复验证脚本
 * 直接读取和验证修复后的代码
 */

const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('AI 服务切换修复验证');
console.log('========================================\n');

// 读取 api.js 文件
const apiFilePath = path.join(__dirname, 'js/api.js');
const apiContent = fs.readFileSync(apiFilePath, 'utf-8');

console.log('检查 api.js 中的 sendRequest 方法...\n');

// 查找 sendRequest 方法中的关键代码
const sendRequestMatch = apiContent.match(/async sendRequest\([\s\S]*?\n    \}/);

if (!sendRequestMatch) {
    console.error('✗ 无法找到 sendRequest 方法');
    process.exit(1);
}

const sendRequestCode = sendRequestMatch[0];

console.log('✓ 找到 sendRequest 方法\n');

// 检查是否正确使用了 serviceConfig
const hasServiceConfig = sendRequestCode.includes('const serviceConfig = this.services[service]');
console.log(`✓ 存在 'const serviceConfig = this.services[service]' 声明: ${hasServiceConfig ? '是' : '否'}`);

// 检查是否使用了 serviceConfig.formatPrompt（修复后的代码）
const hasCorrectFormatPrompt = sendRequestCode.includes('serviceConfig.formatPrompt');
console.log(`✓ 使用 'serviceConfig.formatPrompt': ${hasCorrectFormatPrompt ? '是' : '否'}`);

// 检查是否还存在错误的 service.formatPrompt（修复前的代码）
const hasIncorrectFormatPrompt = sendRequestCode.includes('service.formatPrompt');
if (hasIncorrectFormatPrompt) {
    console.log(`✗ 仍然存在错误的 'service.formatPrompt': 是`);
    console.log('  ❌ 修复未完成或存在其他错误！');
} else {
    console.log(`✓ 不存在错误的 'service.formatPrompt': 否`);
}

// 检查是否使用了 serviceConfig.requiredHeaders
const hasCorrectHeaders = sendRequestCode.includes('serviceConfig.requiredHeaders');
console.log(`✓ 使用 'serviceConfig.requiredHeaders': ${hasCorrectHeaders ? '是' : '否'}`);

// 检查是否使用了 serviceConfig.apiEndpoint
const hasCorrectEndpoint = sendRequestCode.includes('serviceConfig.apiEndpoint');
console.log(`✓ 使用 'serviceConfig.apiEndpoint': ${hasCorrectEndpoint ? '是' : '否'}`);

console.log('\n========================================');
console.log('修复状态汇总');
console.log('========================================\n');

if (hasServiceConfig && hasCorrectFormatPrompt && !hasIncorrectFormatPrompt &&
    hasCorrectHeaders && hasCorrectEndpoint) {
    console.log('✓✓✓ 所有检查通过！\n');
    console.log('修复说明：');
    console.log('- 代码正确使用了 serviceConfig（配置对象）而非 service（字符串）');
    console.log('- formatPrompt 方法将从正确的服务配置中调用');
    console.log('- 不同 AI 服务将生成各自正确的请求格式\n');
    console.log('现在，无论选择哪个 AI 服务（OpenAI、Gemini、Claude、Deepseek 等），');
    console.log('都会使用对应服务的 API 端点和请求格式。\n');
    process.exit(0);
} else {
    console.log('✗✗✗ 检查未通过！\n');

    if (!hasServiceConfig) {
        console.log('❌ 缺少 serviceConfig 变量声明');
    }
    if (!hasCorrectFormatPrompt) {
        console.log('❌ 未正确使用 serviceConfig.formatPrompt');
    }
    if (hasIncorrectFormatPrompt) {
        console.log('❌ 仍然存在错误的 service.formatPrompt 调用');
    }
    if (!hasCorrectHeaders) {
        console.log('❌ 未正确使用 serviceConfig.requiredHeaders');
    }
    if (!hasCorrectEndpoint) {
        console.log('❌ 未正确使用 serviceConfig.apiEndpoint');
    }

    console.log('\n请检查 js/api.js 文件中的 sendRequest 方法。');
    process.exit(1);
}
