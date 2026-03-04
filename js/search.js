// 搜索结果页 JavaScript
class SearchPage {
    constructor() {
        this.venues = [];
        this.filteredVenues = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.currentCity = '';
        this.currentKeyword = '';
        this.currentView = 'list'; // 'list' or 'map'
        this.map = null;
        this.markers = [];
        
        this.init();
    }

    async init() {
        this.parseUrlParams();
        this.bindEvents();
        await this.loadVenueData();
        this.performSearch();
        this.updateSearchInfo();
        this.renderResults();
    }

    // 解析URL参数
    parseUrlParams() {
        const params = Utils.getUrlParams();
        this.currentCity = params.city || '';
        this.currentKeyword = params.keyword || '';
        this.currentView = params.view || 'list';
    }

    // 绑定事件
    bindEvents() {
        // 返回按钮
        document.getElementById('backBtn').addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        // 返回首页按钮
        document.getElementById('backToHome')?.addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        // 分页按钮
        document.getElementById('prevBtn').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderResults();
                // 翻页后滚动到顶部
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        document.getElementById('nextBtn').addEventListener('click', () => {
            const totalPages = Math.ceil(this.filteredVenues.length / this.itemsPerPage);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.renderResults();
                // 翻页后滚动到顶部
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    // 加载场馆数据
    async loadVenueData() {
        try {
            this.showLoading(true);
            const url = `data/venues/${this.currentCity}.json?t=${Date.now()}`; // 添加时间戳防止缓存
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('加载场馆数据失败');
            }
            const data = await response.json();
            this.venues = data.venues || []; // 确保使用venues数组
            this.showLoading(false);
        } catch (error) {
            console.error('加载场馆数据失败:', error);
            this.showNoResults();
            this.showLoading(false);
        }
    }

    // 更新搜索信息
    updateSearchInfo() {
        const cityNames = {
            beijing: '北京',
            shanghai: '上海',
            guangzhou: '广州',
            shenzhen: '深圳',
            changsha: '长沙',
            kunming: '昆明',
            chengdu: '成都'
        };

        document.getElementById('currentCity').textContent = cityNames[this.currentCity] || '-';
        document.getElementById('currentKeyword').textContent = this.currentKeyword || '全部';
        document.getElementById('resultCount').textContent = this.filteredVenues.length;
    }

    // 执行搜索
    performSearch() {
        if (!this.currentKeyword) {
            this.filteredVenues = [...this.venues];
        } else {
            const keyword = this.currentKeyword.toLowerCase();
            this.filteredVenues = this.venues.filter(venue => 
                venue.name.toLowerCase().includes(keyword)
            );
        }
        
        this.updateSearchInfo();
        this.currentPage = 1;
    }

    // 渲染结果
    renderResults() {
        if (this.filteredVenues.length === 0) {
            this.showNoResults();
            return;
        }

        this.showResults();
        
        if (this.currentView === 'map') {
            this.renderMapView();
        } else {
            this.renderListView();
        }

        this.renderPagination();
    }

    // 渲染列表视图
    renderListView() {
        const venueList = document.getElementById('venueList');
        venueList.className = 'space-y-4';
        venueList.innerHTML = '';

        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageVenues = this.filteredVenues.slice(start, end);

        pageVenues.forEach(venue => {
            const venueCard = this.createVenueCard(venue);
            venueList.appendChild(venueCard);
        });
    }

    // 创建场馆卡片
    createVenueCard(venue) {
        const template = document.getElementById('venueCardTemplate');
        const clone = template.content.cloneNode(true);

        // 填充数据
        clone.querySelector('.venue-name').textContent = venue.name;
        clone.querySelector('.venue-description').textContent = venue.description || '暂无描述';
        clone.querySelector('.venue-address').textContent = venue.address;
        clone.querySelector('.venue-phone').textContent = '暂无电话';

        // 设置LOGO图片 - 使用barbell.png作为mock
        const imageEl = clone.querySelector('.venue-image');
        imageEl.src = 'data/images/barbell.png';
        imageEl.alt = venue.name;

        // 生成场馆类型标签
        const tagsContainer = clone.querySelector('.venue-type-tags');
        this.generateTypeTags(tagsContainer, venue);

        // 渲染场馆特色
        const featuresContainer = clone.querySelector('.venue-features');
        const defaultFeatures = [
            { name: '咖啡', icon: 'icons/coffee.png' },
            { name: '毛巾', icon: 'icons/towel.png' },
            { name: '停车场', icon: 'icons/parking.png' },
            { name: 'WiFi', icon: 'icons/wan_map.png' },
            { name: '淋浴', icon: 'icons/shower.png' },
            { name: '储物柜', icon: 'icons/cabinet.png' }
        ];

        // 如果场馆有自定义特色，使用自定义的
        const features = venue.features || defaultFeatures;

        featuresContainer.innerHTML = '';
        features.forEach(feature => {
            const featureEl = document.createElement('div');
            featureEl.className = 'flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded text-xs';
            featureEl.innerHTML = `
                <img src="data/images/${feature.icon}" alt="${feature.name}" class="w-3 h-3">
                <span class="text-gray-700">${feature.name}</span>
            `;
            featuresContainer.appendChild(featureEl);
        });

        return clone;
    }

    // 生成场馆类型标签
    generateTypeTags(container, venue) {
        const types = venue.types || [];
        
        container.innerHTML = '';

        const isCrossFit = types.includes('crossfit');
        const isHyrox = types.includes('hyrox');

        if (isCrossFit && isHyrox) {
            // 同时支持两种，CrossFit在上，Hyrox在下
            const crossfitTag = document.createElement('div');
            crossfitTag.className = 'px-2 py-1 text-xs font-medium bg-black text-white rounded text-center min-w-[60px]';
            crossfitTag.textContent = 'CrossFit';
            container.appendChild(crossfitTag);

            const hyroxTag = document.createElement('div');
            hyroxTag.className = 'px-2 py-1 text-xs font-medium bg-white text-black border border-gray-300 rounded text-center min-w-[60px]';
            hyroxTag.textContent = 'Hyrox';
            container.appendChild(hyroxTag);
        } else if (isCrossFit) {
            // 只有CrossFit
            const crossfitTag = document.createElement('div');
            crossfitTag.className = 'px-2 py-1 text-xs font-medium bg-black text-white rounded text-center min-w-[60px]';
            crossfitTag.textContent = 'CrossFit';
            container.appendChild(crossfitTag);
        } else if (isHyrox) {
            // 只有Hyrox
            const hyroxTag = document.createElement('div');
            hyroxTag.className = 'px-2 py-1 text-xs font-medium bg-white text-black border border-gray-300 rounded text-center min-w-[60px]';
            hyroxTag.textContent = 'Hyrox';
            container.appendChild(hyroxTag);
        } else {
        }
    }

    // 渲染地图视图
    renderMapView() {
        const venueList = document.getElementById('venueList');
        venueList.className = '';
        venueList.innerHTML = '<div id="searchMap" class="h-screen max-h-[calc(100vh-200px)] bg-gray-100 rounded-lg"></div>';

        // 隐藏翻页控件
        const pagination = document.getElementById('pagination');
        if (pagination) {
            pagination.style.display = 'none';
        }

        // 初始化地图
        this.initSearchMap();
    }

    // 初始化搜索地图
    initSearchMap() {
        if (!window.AMap) {
            console.error('高德地图API未加载');
            return;
        }

        // 创建地图
        this.map = new AMap.Map('searchMap', {
            zoom: 12,
            center: this.getCityCenter(this.currentCity),
            viewMode: '2D'
        });

        // 添加地图控件
        this.map.addControl(new AMap.Scale());
        this.map.addControl(new AMap.ToolBar());

        // 显示所有场馆（不是过滤后的）
        this.venues.forEach(venue => {
            const marker = new AMap.Marker({
                position: [venue.longitude, venue.latitude],
                title: venue.name
            });

            // 创建信息窗体
            const infoWindow = new AMap.InfoWindow({
                content: this.createInfoWindowContent(venue),
                offset: new AMap.Pixel(0, -30)
            });

            marker.on('click', () => {
                infoWindow.open(this.map, marker.getPosition());
            });

            this.map.add(marker);
            this.markers.push(marker);
        });

        // 自适应显示所有标记
        if (this.markers.length > 0) {
            this.map.setFitView(this.markers);
        }
    }

    // 创建信息窗体内容
    createInfoWindowContent(venue) {
        return `
            <div class="p-3 max-w-xs">
                <h4 class="font-semibold text-gray-900 mb-2">${venue.name}</h4>
                <p class="text-sm text-gray-600 mb-2">${venue.address}</p>
                <p class="text-sm text-gray-600 mb-3">${venue.description || ''}</p>
                <div class="flex flex-wrap gap-2 mb-3">
                    ${this.renderFeaturesForInfoWindow(venue.features)}
                </div>
                <div class="flex space-x-2">
                    <button onclick="searchPage.contactVenue('${venue.phone}')" class="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">
                        联系
                    </button>
                </div>
            </div>
        `;
    }

    // 为信息窗体渲染特色标签
    renderFeaturesForInfoWindow(features) {
        const defaultFeatures = [
            { name: '咖啡', icon: 'icons/coffee.png' },
            { name: '毛巾', icon: 'icons/towel.png' },
            { name: '停车场', icon: 'icons/parking.png' },
            { name: 'WiFi', icon: 'icons/wan_map.png' },
            { name: '淋浴', icon: 'icons/shower.png' },
            { name: '储物柜', icon: 'icons/cabinet.png' }
        ];

        const venueFeatures = features || defaultFeatures;
        
        return venueFeatures.map(feature => `
            <span class="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded text-xs">
                <img src="data/images/${feature.icon}" alt="${feature.name}" class="w-3 h-3">
                <span class="text-gray-700">${feature.name}</span>
            </span>
        `).join('');
    }

    // 获取城市中心坐标
    getCityCenter(city) {
        const cityCenters = {
            beijing: [116.4074, 39.9042],
            shanghai: [121.4737, 31.2304],
            guangzhou: [113.2644, 23.1291],
            shenzhen: [114.0579, 22.5431],
            changsha: [112.9388, 28.2282],
            kunming: [102.8329, 24.8801],
            chengdu: [104.0665, 30.5723]
        };
        return cityCenters[city] || [116.4074, 39.9042];
    }

    // 渲染分页
    renderPagination() {
        const totalPages = Math.ceil(this.filteredVenues.length / this.itemsPerPage);
        const pageNumbers = document.getElementById('pageNumbers');
        pageNumbers.innerHTML = '';

        // 生成页码
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                const pageBtn = document.createElement('button');
                pageBtn.className = `px-3 py-2 border rounded-md transition-colors ${
                    i === this.currentPage 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                }`;
                pageBtn.textContent = i;
                pageBtn.addEventListener('click', () => {
                    this.currentPage = i;
                    this.renderResults();
                    // 翻页后滚动到顶部
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
                pageNumbers.appendChild(pageBtn);
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                const dots = document.createElement('span');
                dots.className = 'px-2 text-gray-500';
                dots.textContent = '...';
                pageNumbers.appendChild(dots);
            }
        }

        // 更新上一页/下一页按钮状态
        document.getElementById('prevBtn').disabled = this.currentPage === 1;
        document.getElementById('nextBtn').disabled = this.currentPage === totalPages;
    }

    // 联系场馆
    contactVenue(phone) {
        this.showMessage('该场馆暂无联系电话，请通过其他方式联系');
    }

    // 在地图上显示场馆
    showVenueOnMap(venue) {
        const params = new URLSearchParams({
            city: this.currentCity,
            keyword: this.currentKeyword,
            view: 'map',
            venue: venue.id
        });
        window.location.href = `search.html?${params.toString()}`;
    }

    // 打开场馆详情
    openVenueDetail(venueId) {
        const params = new URLSearchParams({
            id: venueId,
            city: this.currentCity
        });
        window.location.href = `venue.html?${params.toString()}`;
    }

    // 显示加载状态
    showLoading(show) {
        const loadingState = document.getElementById('loadingState');
        const venueList = document.getElementById('venueList');
        const noResults = document.getElementById('noResults');
        
        if (show) {
            loadingState.classList.remove('hidden');
            venueList.classList.add('hidden');
            noResults.classList.add('hidden');
        } else {
            loadingState.classList.add('hidden');
        }
    }

    // 显示无结果
    showNoResults() {
        const noResults = document.getElementById('noResults');
        const venueList = document.getElementById('venueList');
        const pagination = document.getElementById('pagination');
        
        noResults.classList.remove('hidden');
        venueList.classList.add('hidden');
        pagination.classList.add('hidden');
    }

    // 显示结果
    showResults() {
        const noResults = document.getElementById('noResults');
        const venueList = document.getElementById('venueList');
        const pagination = document.getElementById('pagination');
        
        noResults.classList.add('hidden');
        venueList.classList.remove('hidden');
        pagination.classList.remove('hidden');
    }

    // 显示消息
    showMessage(message) {
        const messageEl = document.createElement('div');
        messageEl.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50 fade-in';
        messageEl.textContent = message;
        
        document.body.appendChild(messageEl);
        setTimeout(() => messageEl.remove(), 3000);
    }
}

// 全局实例
let searchPage;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    searchPage = new SearchPage();
});
