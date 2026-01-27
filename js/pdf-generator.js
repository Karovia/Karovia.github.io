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
            const htmlContent = this.prepareContent(content);

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
    prepareContent(content) {
        // 如果是Markdown，转换为HTML
        if (this.isMarkdown(content)) {
            content = this.markdownToHTML(content);
        }

        // 创建完整的HTML文档结构
        const htmlTemplate = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>学习指南</title>
                <style>
                    ${this.getPDFStyles()}
                </style>
            </head>
            <body>
                <div class="pdf-content">
                    ${content}
                </div>
            </body>
            </html>
        `;

        return htmlTemplate;
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
     * 获取PDF样式
     * @private
     */
    getPDFStyles() {
        return `
            @page {
                margin: ${this.options.margin.join('mm ')};
            }

            body {
                font-family: 'SimSun', 'Microsoft YaHei', sans-serif;
                font-size: 12pt;
                line-height: 1.6;
                color: #333;
            }

            .pdf-content {
                max-width: none;
                margin: 0;
                padding: 20px;
            }

            h1, h2, h3, h4, h5, h6 {
                color: #2c3e50;
                margin-top: 20px;
                margin-bottom: 10px;
                page-break-after: avoid;
            }

            h1 {
                font-size: 20pt;
                border-bottom: 2px solid #4a90e2;
                padding-bottom: 5px;
            }

            h2 {
                font-size: 16pt;
                border-bottom: 1px solid #e1e8ed;
                padding-bottom: 3px;
            }

            h3 {
                font-size: 14pt;
            }

            p {
                margin-bottom: 12px;
                text-align: justify;
            }

            ul, ol {
                margin-bottom: 12px;
                padding-left: 20px;
            }

            li {
                margin-bottom: 6px;
            }

            pre {
                background: #f5f7fa;
                padding: 10px;
                border-radius: 4px;
                overflow-x: auto;
                margin-bottom: 12px;
                white-space: pre-wrap;
            }

            code {
                background: #f1f3f4;
                padding: 2px 4px;
                border-radius: 3px;
                font-family: 'Consolas', monospace;
                font-size: 0.9em;
            }

            blockquote {
                border-left: 4px solid #4a90e2;
                padding-left: 15px;
                margin: 12px 0;
                color: #666;
                font-style: italic;
            }

            table {
                border-collapse: collapse;
                width: 100%;
                margin-bottom: 12px;
            }

            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }

            th {
                background: #f5f7fa;
                font-weight: bold;
            }

            img {
                max-width: 100%;
                height: auto;
            }

            @media print {
                body {
                    font-size: 12pt;
                }

                .pdf-content {
                    padding: 10px;
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