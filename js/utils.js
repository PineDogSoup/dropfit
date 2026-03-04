// 工具函数类
class Utils {
    // 获取URL参数
    static getUrlParams() {
        const params = {};
        const urlParams = new URLSearchParams(window.location.search);
        for (const [key, value] of urlParams) {
            params[key] = value;
        }
        return params;
    }

    // 防抖函数
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 节流函数
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // 格式化距离
    static formatDistance(distance) {
        if (distance < 1000) {
            return `${Math.round(distance)}m`;
        } else {
            return `${(distance / 1000).toFixed(1)}km`;
        }
    }

    // 格式化电话号码
    static formatPhone(phone) {
        if (!phone) return '';
        return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    }

    // 获取城市名称
    static getCityName(cityId) {
        const cityNames = {
            'beijing': '北京',
            'shanghai': '上海',
            'guangzhou': '广州',
            'shenzhen': '深圳',
            'changsha': '长沙',
            'kunming': '昆明',
            'chengdu': '成都',
            'hangzhou': '杭州',
            'suzhou': '苏州',
            'wuhan': '武汉',
            'nanjing': '南京',
            'tianjin': '天津',
            'xian': '西安',
            'chongqing': '重庆',
            'dali': '大理',
            'foshan': '佛山',
            'fuzhou': '福州',
            'guiyang': '贵阳',
            'haerbin': '哈尔滨',
            'hefei': '合肥',
            'huhehaote': '呼和浩特',
            'jinan': '济南',
            'nanchang': '南昌',
            'nanning': '南宁',
            'ningbo': '宁波',
            'qingdao': '青岛',
            'quanzhou': '泉州',
            'shantou': '汕头',
            'xiamen': '厦门',
            'xining': '西宁',
            'yantai': '烟台',
            'zhengzhou': '郑州',
            'zhuhai': '珠海',
            'baoding': '保定'
        };
        return cityNames[cityId] || cityId;
    }

    // 加载JSON数据
    static async loadJsonData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error loading JSON data:', error);
            return null;
        }
    }

    // 显示加载状态
    static showLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="flex items-center justify-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span class="ml-2 text-gray-600">加载中...</span>
                </div>
            `;
        }
    }

    // 显示错误状态
    static showError(elementId, message = '加载失败，请重试') {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="text-center py-8">
                    <div class="text-red-500 mb-2">
                        <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <p class="text-gray-600">${message}</p>
                    <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        重新加载
                    </button>
                </div>
            `;
        }
    }

    // 显示空状态
    static showEmpty(elementId, message = '暂无数据') {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="text-center py-8">
                    <div class="text-gray-400 mb-2">
                        <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <p class="text-gray-600">${message}</p>
                </div>
            `;
        }
    }

    // 安全的HTML转义
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 复制到剪贴板
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Failed to copy text: ', err);
            return false;
        }
    }

    // 本地存储操作
    static setLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (err) {
            console.error('Error saving to localStorage:', err);
            return false;
        }
    }

    static getLocalStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (err) {
            console.error('Error reading from localStorage:', err);
            return defaultValue;
        }
    }

    // 移除本地存储
    static removeLocalStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (err) {
            console.error('Error removing from localStorage:', err);
            return false;
        }
    }
}
