// 性能测试和监控工具
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.init();
    }

    init() {
        // 监控页面加载性能
        window.addEventListener('load', () => {
            this.measurePageLoad();
        });

        // 监控用户交互性能
        this.measureInteractionPerformance();
    }

    // 测量页面加载性能
    measurePageLoad() {
        const navigation = performance.getEntriesByType('navigation')[0];
        
        this.metrics.pageLoad = {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            firstPaint: this.getFirstPaint(),
            firstContentfulPaint: this.getFirstContentfulPaint()
        };

        this.checkPerformanceThresholds();
    }

    // 获取首次绘制时间
    getFirstPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
        return firstPaint ? firstPaint.startTime : 0;
    }

    // 获取首次内容绘制时间
    getFirstContentfulPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        return fcp ? fcp.startTime : 0;
    }

    // 测量交互性能
    measureInteractionPerformance() {
        // 监控点击响应时间
        document.addEventListener('click', (event) => {
            const startTime = performance.now();
            
            requestAnimationFrame(() => {
                const endTime = performance.now();
                const responseTime = endTime - startTime;
                
            });
        });
    }

    // 检查性能阈值
    checkPerformanceThresholds() {
        const thresholds = {
            firstContentfulPaint: 2000, // 2秒
            domContentLoaded: 3000, // 3秒
            loadComplete: 5000 // 5秒
        };

        let warnings = [];

        if (this.metrics.pageLoad.firstContentfulPaint > thresholds.firstContentfulPaint) {
            warnings.push(`首次内容绘制时间过慢: ${this.metrics.pageLoad.firstContentfulPaint}ms`);
        }

        if (this.metrics.pageLoad.domContentLoaded > thresholds.domContentLoaded) {
            warnings.push(`DOM加载时间过慢: ${this.metrics.pageLoad.domContentLoaded}ms`);
        }

        if (this.metrics.pageLoad.loadComplete > thresholds.loadComplete) {
            warnings.push(`页面完全加载时间过慢: ${this.metrics.pageLoad.loadComplete}ms`);
        }

        if (warnings.length > 0) {
            this.showPerformanceWarnings(warnings);
        }
    }

    // 显示性能警告
    showPerformanceWarnings(warnings) {
        // 只在开发环境显示
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            const warningDiv = document.createElement('div');
            warningDiv.className = 'fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg shadow-lg max-w-md z-50';
            warningDiv.innerHTML = `
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium">性能警告</p>
                        <div class="mt-1 text-sm">
                            ${warnings.map(warning => `<p>• ${warning}</p>`).join('')}
                        </div>
                    </div>
                    <button onclick="this.parentElement.parentElement.remove()" class="ml-auto -mx-1.5 -my-1.5 bg-yellow-100 text-yellow-500 rounded-lg p-1.5 hover:bg-yellow-200">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            `;
            document.body.appendChild(warningDiv);

            // 5秒后自动消失
            setTimeout(() => {
                if (warningDiv.parentElement) {
                    warningDiv.remove();
                }
            }, 5000);
        }
    }

    // 模拟Lighthouse性能测试
    async runLighthouseTest() {
        
        // 模拟Lighthouse评分
        const scores = {
            performance: this.calculatePerformanceScore(),
            accessibility: 95,
            bestPractices: 92,
            seo: 88
        };

        return scores;
    }

    // 计算性能评分
    calculatePerformanceScore() {
        const fcp = this.metrics.pageLoad.firstContentfulPaint;
        const load = this.metrics.pageLoad.loadComplete;

        let score = 100;

        // FCP评分 (0-1800ms = 100分, 1800-3000ms = 50-100分, >3000ms = 0-50分)
        if (fcp <= 1800) {
            score = Math.min(score, 100);
        } else if (fcp <= 3000) {
            score = Math.min(score, 100 - (fcp - 1800) * 50 / 1200);
        } else {
            score = Math.min(score, 50 - (fcp - 3000) * 50 / 2000);
        }

        // 负载时间评分 (0-3000ms = 100分, 3000-8000ms = 50-100分, >8000ms = 0-50分)
        if (load <= 3000) {
            score = Math.min(score, 100);
        } else if (load <= 8000) {
            score = Math.min(score, 100 - (load - 3000) * 50 / 5000);
        } else {
            score = Math.min(score, 50 - (load - 8000) * 50 / 2000);
        }

        return Math.max(0, Math.round(score));
    }

    // 监控内存使用
    monitorMemory() {
        if (performance.memory) {
        }
    }
}

// 初始化性能监控
document.addEventListener('DOMContentLoaded', () => {
    window.performanceMonitor = new PerformanceMonitor();
    
    // 每30秒监控一次内存使用
    setInterval(() => {
        window.performanceMonitor.monitorMemory();
    }, 30000);
});
