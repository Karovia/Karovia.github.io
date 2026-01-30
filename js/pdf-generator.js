/**
 * PDF 生成器模块
 *
 * 使用 html2pdf.js 库将内容生成PDF文档
 * 支持自定义样式、目录生成和批注功能
 *
 * @module PDFGenerator
 * @author U_learner Team
 * @version 1.0.0
 */

/**
 * PDF生成器类
 */
class PDFGenerator {
    /**
     * 构造函数
     * @param {Object} options - 配置选项
     */
    constructor(options = {}) {
        this.options = {
            filename: '学习指南.pdf',
            format: 'a4',
            orientation: 'portrait',
            margin: [10, 10, 10, 10],
            ...options
        };

        // 初始化默认配置
        this.defaultConfig = {
            jsPDF: {
                unit: 'mm',
                format: this.options.format,
                orientation: this.options.orientation
            },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false
            }
        };
    }

    /**
     * 生成PDF文档
     * @param {string} content - 要生成PDF的内容（HTML或Markdown）
     * @param {Object} options - 生成选项
     * @returns {Promise<Blob>} 生成的PDF文件
     */
    async generate(content, options = {}) {
        try {
            // 显示加载状态
            this.showLoading();

            // 准备内容
            const htmlContent = this.prepareContent(content, options);

            // 创建PDF
            const pdf = await this.createPDF(htmlContent, options);

            // 隐藏加载状态
            this.hideLoading();

            return pdf;
        } catch (error) {
            this.hideLoading();
            throw new Error(`PDF生成失败: ${error.message}`);
        }
    }

    /**
     * 准备HTML内容
     * @private
     */
    prepareContent(content, options = {}) {
        // 如果是Markdown，转换为HTML
        if (this.isMarkdown(content)) {
            content = this.markdownToHTML(content);
        }

        // 提取标题
        const titleMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/);
        const title = titleMatch ? titleMatch[1] : '学习指南';

        // 生成目录
        const toc = this.generateTOC(content);

        // 生成封面页
        const coverPage = this.generateCoverPage(title, options);

        // 创建完整的HTML文档结构
        const htmlTemplate = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${title}</title>
                <style>
                    ${this.getPDFStyles()}
                </style>
            </head>
            <body>
                ${coverPage}
                ${toc}
                <div class="pdf-content">
                    ${content}
                </div>
            </body>
            </html>
        `;

        return htmlTemplate;
    }

    /**
     * 生成封面页
     * @private
     */
    generateCoverPage(title, options = {}) {
        const date = new Date().toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const subtitle = options.subtitle || 'AI 驱动的个性化学习文档';
        const author = options.author || 'U_learner';

        return `
            <div class="cover-page">
                <h1>${title}</h1>
                <div class="accent-line"></div>
                <p class="subtitle">${subtitle}</p>
                <div class="meta">
                    <p>生成时间：${date}</p>
                    <p>生成工具：${author}</p>
                </div>
            </div>
        `;
    }

    /**
     * 生成目录
     * @private
     */
    generateTOC(content) {
        const headings = content.match(/<h([1-6])[^>]*>(.*?)<\/h\1>/g);

        if (!headings || headings.length === 0) {
            return '';
        }

        let tocHTML = '<div class="toc"><h2>目录</h2><ul>';
        let level2Started = false;
        let level3Started = false;

        headings.forEach((heading, index) => {
            const match = heading.match(/<h([1-6])[^>]*>(.*?)<\/h\1>/);
            const level = parseInt(match[1]);
            const text = match[2].replace(/<[^>]+>/g, ''); // 移除HTML标签
            const anchor = `section-${index}`;

            // 添加锚点到原始内容
            content = content.replace(heading, heading.replace(/<h([1-6])/, `<h$1 id="${anchor}"`));

            if (level === 1) {
                if (level2Started) {
                    tocHTML += '</ul>';
                    level2Started = false;
                }
                tocHTML += `<li class="level-1"><a href="#${anchor}">${index + 1}. ${text}</a></li>`;
            } else if (level === 2) {
                if (!level2Started) {
                    tocHTML += '<ul>';
                    level2Started = true;
                }
                tocHTML += `<li class="level-2"><a href="#${anchor}">${text}</a></li>`;
            } else if (level === 3) {
                if (!level3Started) {
                    tocHTML += '<ul>';
                    level3Started = true;
                }
                tocHTML += `<li class="level-3"><a href="#${anchor}">${text}</a></li>`;
            }
        });

        // 关闭所有打开的标签
        if (level3Started) {
            tocHTML += '</ul>';
        }
        if (level2Started) {
            tocHTML += '</ul>';
        }

        tocHTML += '</ul></div>';

        return tocHTML;
    }

    /**
     * 检查内容是否为Markdown格式
     * @private
     */
    isMarkdown(content) {
        return /(^#+\s)|(\*\*.*\*\*)|(__.*__)|(\*.*\*)|(```)/.test(content);
    }

    /**
     * 简单的Markdown转HTML
     * @private
     */
    markdownToHTML(markdown) {
        // 简单的Markdown语法转换
        const html = markdown
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/```(.*?)```/gims, '<pre><code>$1</code></pre>')
            .replace(/`(.*?)`/gim, '<code>$1</code>')
            .replace(/\n\n/gim, '</p><p>')
            .replace(/^(.*)$/gim, '<p>$1</p>');

        return html;
    }

    /**
     * 获取PDF样式（参考 Hello 算法设计风格）
     * @private
     */
    getPDFStyles() {
        return `
            @page {
                margin: ${this.options.margin.join('mm ')};
            }

            * {
                box-sizing: border-box;
            }

            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue",
                           "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑",
                           "Noto Sans SC", sans-serif;
                font-size: 11pt;
                line-height: 1.7;
                color: #1d1d20;
                background: #ffffff;
            }

            .pdf-content {
                max-width: none;
                margin: 0;
                padding: 30px 40px;
            }

            /* 标题样式 - Hello 算法风格 */
            h1, h2, h3, h4, h5, h6 {
                color: #1d1d20;
                font-weight: 500;
                margin-top: 24px;
                margin-bottom: 12px;
                page-break-after: avoid;
            }

            h1 {
                font-size: 22pt;
                font-weight: 400;
                border-bottom: 2px solid #52bbb1;
                padding-bottom: 8px;
                margin-top: 0;
                color: #1d1d20;
            }

            h2 {
                font-size: 17pt;
                font-weight: 400;
                border-bottom: 1px solid #e8e8e8;
                padding-bottom: 6px;
                margin-top: 28px;
            }

            h3 {
                font-size: 14pt;
                font-weight: 500;
                margin-top: 20px;
                color: #349890;
            }

            h4 {
                font-size: 12pt;
                font-weight: 500;
                color: #555;
            }

            /* 段落样式 */
            p {
                margin-bottom: 12px;
                text-align: justify;
                text-justify: inter-ideograph;
            }

            /* 列表样式 */
            ul, ol {
                margin-bottom: 14px;
                padding-left: 24px;
            }

            li {
                margin-bottom: 7px;
                line-height: 1.7;
            }

            /* 代码块样式 - Hello 算法风格 */
            pre {
                background: #f5f5f5;
                padding: 14px 16px;
                border-radius: 6px;
                overflow-x: auto;
                margin: 14px 0;
                border: 1px solid #e8e8e8;
                white-space: pre-wrap;
                font-size: 0.9em;
            }

            code {
                background: #f5f5f5;
                padding: 3px 6px;
                border-radius: 4px;
                font-family: "Fira Code", "JetBrains Mono", "Consolas",
                           "SF Mono", "Monaco", "Courier New", monospace;
                font-size: 0.9em;
                color: #1d1d20;
            }

            pre code {
                background: transparent;
                padding: 0;
                border-radius: 0;
            }

            /* 引用样式 - Hello 算法风格 */
            blockquote {
                border-left: 4px solid #52bbb1;
                padding-left: 16px;
                margin: 14px 0;
                color: #666;
                background: #fafafa;
                padding: 12px 16px;
                border-radius: 0 4px 4px 0;
            }

            /* 表格样式 */
            table {
                border-collapse: collapse;
                width: 100%;
                margin: 14px 0;
                border-radius: 6px;
                overflow: hidden;
            }

            th, td {
                border: 1px solid #e8e8e8;
                padding: 10px 12px;
                text-align: left;
            }

            th {
                background: #f5f5f5;
                font-weight: 500;
                color: #1d1d20;
            }

            tr:nth-child(even) {
                background: #fafafa;
            }

            /* 链接样式 */
            a {
                color: #349890;
                text-decoration: none;
                border-bottom: 1px solid transparent;
                transition: border-color 0.2s;
            }

            /* 图片样式 */
            img {
                max-width: 100%;
                height: auto;
                border-radius: 6px;
                margin: 14px 0;
            }

            /* 封面页样式 */
            .cover-page {
                page-break-after: always;
                text-align: center;
                padding: 80px 40px;
            }

            .cover-page h1 {
                font-size: 32pt;
                margin-bottom: 20px;
                border-bottom: none;
                color: #1d1d20;
            }

            .cover-page .subtitle {
                font-size: 16pt;
                color: #666;
                margin-bottom: 40px;
            }

            .cover-page .meta {
                font-size: 12pt;
                color: #999;
                margin-top: 60px;
            }

            .cover-page .accent-line {
                width: 80px;
                height: 3px;
                background: #52bbb1;
                margin: 30px auto;
                border-radius: 2px;
            }

            /* 目录样式 */
            .toc {
                page-break-after: always;
                margin-bottom: 30px;
            }

            .toc h2 {
                color: #1d1d20;
                border-bottom: 2px solid #52bbb1;
            }

            .toc ul {
                list-style: none;
                padding-left: 0;
            }

            .toc li {
                margin-bottom: 8px;
            }

            .toc a {
                color: #1d1d20;
                text-decoration: none;
                border-bottom: 1px dotted #ccc;
            }

            .toc .level-1 {
                font-weight: 500;
                margin-top: 12px;
            }

            .toc .level-2 {
                padding-left: 20px;
                font-size: 0.95em;
            }

            .toc .level-3 {
                padding-left: 40px;
                font-size: 0.9em;
            }

            /* 分隔线 */
            hr {
                border: none;
                border-top: 1px solid #e8e8e8;
                margin: 24px 0;
            }

            /* 强调文本 */
            strong {
                color: #1d1d20;
                font-weight: 600;
            }

            /* 打印优化 */
            @media print {
                body {
                    font-size: 11pt;
                }

                .pdf-content {
                    padding: 20px 30px;
                }

                h1 {
                    page-break-before: avoid;
                }

                h2, h3, h4 {
                    page-break-after: avoid;
                }

                p, li {
                    orphans: 3;
                    widows: 3;
                }

                pre, blockquote, table {
                    page-break-inside: avoid;
                }
            }
        `;
    }

    /**
     * 创建PDF文档
     * @private
     */
    async createPDF(html, options = {}) {
        // 动态导入html2pdf.js
        const html2pdf = await import('html2pdf.js');

        const config = {
            ...this.defaultConfig,
            ...options
        };

        return new Promise((resolve, reject) => {
            html2pdf.default().from(html).set(config).save(this.options.filename)
                .then(() => {
                    resolve(true);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    /**
     * 显示加载状态
     * @private
     */
    showLoading() {
        // 可以添加全局加载提示
        console.log('正在生成PDF...');
    }

    /**
     * 隐藏加载状态
     * @private
     */
    hideLoading() {
        console.log('PDF生成完成');
    }

    /**
     * 下载PDF
     * @param {string} content - 内容
     * @param {string} filename - 文件名
     */
    async download(content, filename = this.options.filename) {
        this.options.filename = filename;
        return this.generate(content);
    }
}

// 导出默认实例
const pdfGenerator = new PDFGenerator();

// 导出到全局作用域
if (typeof window !== 'undefined') {
    window.PDFGenerator = PDFGenerator;
    window.pdfGenerator = pdfGenerator;
}

// ES6 export（在浏览器环境中注释掉）
// export { PDFGenerator, pdfGenerator };