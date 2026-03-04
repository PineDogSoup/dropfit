class VenueDetail {
    constructor() {
        this.venueId = '';
        this.currentCity = '';
        this.venue = null;
    }

    async init() {
        this.parseUrlParams();
        this.bindEvents();
        await this.loadVenueData();
    }

    parseUrlParams() {
        const params = new URLSearchParams(window.location.search);
        this.venueId = params.get('id') || '';
        this.currentCity = params.get('city') || '';
    }

    bindEvents() {
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.goBack();
            });
        }
    }

    goBack() {
        const url = `search.html?city=${this.currentCity}`;
        window.location.href = url;
    }

    async loadVenueData() {
        try {
            this.showLoading(true);
            
            const response = await fetch(`data/venues/${this.currentCity}.json`);
            if (!response.ok) {
                throw new Error('加载场馆数据失败');
            }

            const data = await response.json();
            const venues = data.venues || data; // 兼容两种数据格式
            this.venue = venues.find(v => v.id === this.venueId);

            this.showLoading(false);
            
            if (this.venue) {
                this.renderVenueDetail();
            } else {
                this.showVenueNotFound();
            }
        } catch (error) {
            console.error('加载场馆数据失败:', error);
            this.showVenueNotFound();
            this.showLoading(false);
        }
    }

    showLoading(show) {
        const loadingState = document.getElementById('loadingState');
        const venueDetail = document.getElementById('venueDetail');
        const venueNotFound = document.getElementById('venueNotFound');

        if (show) {
            loadingState.classList.remove('hidden');
            venueDetail.classList.add('hidden');
            venueNotFound.classList.add('hidden');
        } else {
            loadingState.classList.add('hidden');
            venueDetail.classList.add('hidden');
            venueNotFound.classList.add('hidden');
        }
    }

    showVenueNotFound() {
        const loadingState = document.getElementById('loadingState');
        const venueDetail = document.getElementById('venueDetail');
        const venueNotFound = document.getElementById('venueNotFound');

        loadingState.classList.add('hidden');
        venueDetail.classList.add('hidden');
        venueNotFound.classList.remove('hidden');
    }

    renderVenueDetail() {
        if (!this.venue) return;

        try {
            // 基本信息
            const nameEl = document.getElementById('venueName');
            const descEl = document.getElementById('venueDescription');
            const addressEl = document.getElementById('venueAddress');
            const phoneEl = document.getElementById('venuePhone');

            if (nameEl) nameEl.textContent = this.venue.name;
            if (descEl) descEl.textContent = this.venue.description;
            
            // 联系信息
            if (addressEl) addressEl.textContent = this.venue.address || '暂无地址';
            if (phoneEl) phoneEl.textContent = this.venue.phone || '暂无电话';

            // 渲染场馆特色
            this.renderVenueFeatures();

            // 显示详情区域
            const detailEl = document.getElementById('venueDetail');
            if (detailEl) detailEl.classList.remove('hidden');
        } catch (error) {
            console.error('渲染场馆详情失败:', error);
            this.showMessage('页面加载失败，请刷新重试');
        }
    }

    renderVenueFeatures() {
        const featuresContainer = document.getElementById('venueFeatures');
        
        // 默认特色标签和对应图标
        const defaultFeatures = [
            { name: '咖啡', icon: 'icons/coffee.png' },
            { name: '毛巾', icon: 'icons/towel.png' },
            { name: '停车场', icon: 'icons/parking.png' },
            { name: 'WiFi', icon: 'icons/wan_map.png' },
            { name: '淋浴', icon: 'icons/shower.png' },
            { name: '储物柜', icon: 'icons/cabinet.png' }
        ];

        // 如果场馆有自定义特色，使用自定义的
        const features = this.venue.features || defaultFeatures;

        featuresContainer.innerHTML = '';
        features.forEach(feature => {
            const featureEl = document.createElement('div');
            featureEl.className = 'flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg text-sm';
            featureEl.innerHTML = `
                <img src="data/images/${feature.icon}" alt="${feature.name}" class="w-4 h-4">
                <span class="text-gray-700">${feature.name}</span>
            `;
            featuresContainer.appendChild(featureEl);
        });
    }

    showMessage(message) {
        const messageEl = document.createElement('div');
        messageEl.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50 fade-in';
        messageEl.textContent = message;
        
        document.body.appendChild(messageEl);
        setTimeout(() => messageEl.remove(), 3000);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new VenueDetail().init();
});
