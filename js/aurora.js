/**
 * 极光背景效果
 * 创建动态的极光背景，增强页面视觉效果
 */

class AuroraEffect {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.auroraLayers = [];
        this.animationId = null;
        this.time = 0;

        this.init();
    }

    /**
     * 初始化极光效果
     */
    init() {
        // 创建canvas元素
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '-2';
        this.canvas.style.opacity = '0.8';

        // 获取上下文
        this.ctx = this.canvas.getContext('2d');

        // 设置canvas尺寸
        this.resize();

        // 创建极光层
        this.createAuroraLayers();

        // 添加到页面
        document.body.appendChild(this.canvas);

        // 开始动画
        this.animate();

        // 监听窗口大小变化
        window.addEventListener('resize', () => this.resize());
    }

    /**
     * 调整canvas尺寸
     */
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    /**
     * 创建极光层
     */
    createAuroraLayers() {
        const colors = [
            { r: 0, g: 255, b: 136 },   // 青绿色
            { r: 0, g: 136, b: 255 },   // 蓝色
            { r: 255, g: 0, b: 136 },   // 粉色
            { r: 136, g: 0, b: 255 }    // 紫色
        ];

        colors.forEach((color, index) => {
            this.auroraLayers.push({
                color: color,
                amplitude: Math.random() * 50 + 30,
                frequency: Math.random() * 0.02 + 0.01,
                phase: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.02 + 0.01,
                yOffset: (index - 1.5) * 100
            });
        });
    }

    /**
     * 绘制极光
     */
    drawAurora() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制每一层极光
        this.auroraLayers.forEach((layer, index) => {
            this.ctx.save();

            // 设置渐变
            const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
            gradient.addColorStop(0, `rgba(${layer.color.r}, ${layer.color.g}, ${layer.color.b}, 0)`);
            gradient.addColorStop(0.5, `rgba(${layer.color.r}, ${layer.color.g}, ${layer.color.b}, 0.3)`);
            gradient.addColorStop(1, `rgba(${layer.color.r}, ${layer.color.g}, ${layer.color.b}, 0)`);

            this.ctx.fillStyle = gradient;

            // 开始绘制路径
            this.ctx.beginPath();

            // 绘制波浪形极光
            const points = 100;
            for (let i = 0; i <= points; i++) {
                const x = (i / points) * this.canvas.width;
                const wave1 = Math.sin((x * layer.frequency) + this.time * layer.speed + layer.phase) * layer.amplitude;
                const wave2 = Math.sin((x * layer.frequency * 2) + this.time * layer.speed * 0.5) * layer.amplitude * 0.5;
                const y = this.canvas.height / 2 + wave1 + wave2 + layer.yOffset;

                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }

            // 闭合路径
            this.ctx.lineTo(this.canvas.width, this.canvas.height);
            this.ctx.lineTo(0, this.canvas.height);
            this.ctx.closePath();

            // 填充
            this.ctx.fill();

            // 添加发光效果
            this.ctx.shadowBlur = 50;
            this.ctx.shadowColor = `rgba(${layer.color.r}, ${layer.color.g}, ${layer.color.b}, 0.5)`;
            this.ctx.fill();

            this.ctx.restore();
        });

        // 绘制粒子效果
        this.drawParticles();

        this.time += 1;
    }

    /**
     * 绘制粒子效果
     */
    drawParticles() {
        // 创建新粒子
        if (Math.random() < 0.1) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: this.canvas.height + 20,
                vx: (Math.random() - 0.5) * 2,
                vy: -Math.random() * 2 - 1,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.5 + 0.5,
                color: this.auroraLayers[Math.floor(Math.random() * this.auroraLayers.length)].color
            });
        }

        // 更新和绘制粒子
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.opacity -= 0.005;

            if (particle.opacity <= 0) {
                return false;
            }

            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fillStyle = `rgb(${particle.color.r}, ${particle.color.g}, ${particle.color.b})`;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = `rgb(${particle.color.r}, ${particle.color.g}, ${particle.color.b})`;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();

            return true;
        });
    }

    /**
     * 动画循环
     */
    animate() {
        this.drawAurora();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    /**
     * 销毁极光效果
     */
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// 创建极光效果实例
let auroraEffect = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 延迟创建极光效果，避免影响页面加载
    setTimeout(() => {
        auroraEffect = new AuroraEffect();
    }, 500);
});

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuroraEffect;
} else if (typeof window !== 'undefined') {
    window.AuroraEffect = AuroraEffect;
}