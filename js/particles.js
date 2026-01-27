/**
 * 粒子背景效果
 * 创建动态的粒子背景，增强页面视觉效果
 */

class ParticleBackground {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.particleCount = 50;
        this.animationId = null;

        this.init();
    }

    /**
     * 初始化粒子系统
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
        this.canvas.style.zIndex = '-1';
        this.canvas.style.opacity = '0.5';

        // 获取上下文
        this.ctx = this.canvas.getContext('2d');

        // 设置canvas尺寸
        this.resize();

        // 添加到页面
        document.body.appendChild(this.canvas);

        // 创建粒子
        this.createParticles();

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
     * 创建粒子
     */
    createParticles() {
        this.particles = [];

        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2,
                color: this.getRandomColor()
            });
        }
    }

    /**
     * 获取随机颜色
     */
    getRandomColor() {
        const colors = [
            'rgba(102, 126, 234, ', // blue
            'rgba(118, 75, 162, ', // purple
            'rgba(240, 147, 251, ', // pink
            'rgba(245, 87, 108, '  // red
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * 动画循环
     */
    animate() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 更新和绘制粒子
        this.particles.forEach(particle => {
            // 更新位置
            particle.x += particle.vx;
            particle.y += particle.vy;

            // 边界检测
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.vx = -particle.vx;
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.vy = -particle.vy;
            }

            // 绘制粒子
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color + particle.opacity + ')';
            this.ctx.fill();

            // 绘制连线
            this.particles.forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(otherParticle.x, otherParticle.y);
                    this.ctx.strokeStyle = particle.color + (0.2 * (1 - distance / 100)) + ')';
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            });
        });

        // 继续动画
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    /**
     * 销毁粒子系统
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

// 创建粒子背景实例
let particleBackground = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 延迟创建粒子背景，避免影响页面加载
    setTimeout(() => {
        particleBackground = new ParticleBackground();
    }, 1000);
});

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ParticleBackground;
} else if (typeof window !== 'undefined') {
    window.ParticleBackground = ParticleBackground;
}