// 主页面 JavaScript
class DropFitMain {
    constructor() {
        this.currentCity = 'beijing'; // 默认北京
        this.currentKeyword = '';
        this.map = null;
        this.venues = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadCityData();
        this.updateCityName(this.currentCity); // 初始化城市名称
        this.loadVenues();
    }

    bindEvents() {
        // 城市按钮
        const cityBtn = document.getElementById('cityBtn');
        cityBtn.addEventListener('click', () => {
            this.showCitySelector();
        });

        // 搜索输入框 - 首页不需要实时搜索，只用于跳转到搜索页面
        const searchInput = document.getElementById('searchInput');
        // 移除实时搜索监听器，保留回车键搜索

        // 搜索按钮
        const searchBtn = document.getElementById('searchBtn');
        searchBtn.addEventListener('click', () => {
            this.performSearch();
        });

        // 回车键搜索
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
    }

    // 防抖函数
    debounce(func, wait) {
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

    // 显示城市选择器
    showCitySelector() {
        // 创建城市选择弹窗
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] city-selector-modal';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 class="text-lg font-bold mb-4">选择城市</h3>
                <div id="cityOptions" class="grid gap-2 max-h-60 overflow-y-auto">
                    <!-- 城市选项将在这里动态生成 -->
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="mt-4 w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300">
                    取消
                </button>
            </div>
        `;
        document.body.appendChild(modal);
        
        // 填充城市选项
        this.populateCityOptions(modal.querySelector('#cityOptions'));
        
        // 点击背景关闭弹窗
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // 填充城市选项
    async populateCityOptions(container) {
        try {
            const cities = await this.fetchCitiesData();
            container.innerHTML = `
                <div class="grid grid-cols-2 gap-2">
                    ${cities.map(city => `
                        <button 
                            class="text-left p-3 rounded hover:bg-gray-100 ${this.currentCity === city.id ? 'bg-blue-50 text-blue-600' : ''}"
                            onclick="app.selectCity('${city.id}')"
                        >
                            ${city.emoji} ${city.name}
                        </button>
                    `).join('')}
                </div>
            `;
        } catch (error) {
            container.innerHTML = '<p class="text-gray-500">加载城市数据失败</p>'
        }
    }

    // 选择城市
    selectCity(cityId) {
        this.currentCity = cityId;
        // 关闭弹窗
        const modal = document.querySelector('.fixed.inset-0');
        if (modal) modal.remove();
        // 更新城市名称显示
        this.updateCityName(cityId);
        // 销毁旧地图实例
        this.destroyMap();
        // 重新加载场馆数据
        this.loadVenues();
    }

    // 销毁地图实例
    destroyMap() {
        if (this.map) {
            this.map.remove();
            this.map = null;
            console.log('旧地图实例已销毁');
        }
    }

    // 更新城市名称显示
    async updateCityName(cityId) {
        try {
            const cities = await this.fetchCitiesData();
            const city = cities.find(c => c.id === cityId);
            if (city) {
                document.getElementById('currentCityName').textContent = city.name;
            }
        } catch (error) {
            console.error('更新城市名称失败:', error);
        }
    }

    // 执行搜索
    performSearch() {
        const searchInput = document.getElementById('searchInput');
        const keyword = searchInput ? searchInput.value.trim() : '';
        const params = new URLSearchParams({
            city: this.currentCity,
            keyword: keyword
        });
        
        // 跳转到搜索页面
        window.location.href = `search.html?${params.toString()}`;
    }

    // 加载场馆数据
    async loadVenues() {
        try {
            const response = await fetch(`./data/venues/${this.currentCity}.json`);
            if (!response.ok) {
                throw new Error('Failed to fetch venues data');
            }
            const data = await response.json();
            this.venues = data.venues || data; // 兼容不同的数据格式
            this.initMap();
            // 首页不需要显示场馆列表，只显示地图
        } catch (error) {
            console.error('加载场馆数据失败:', error);
            this.showMessage('加载场馆数据失败');
        }
    }

    // 初始化地图
    initMap() {
        const mapContainer = document.getElementById('mapContainer');
        const mapLoading = document.getElementById('mapLoading');
        if (!mapContainer) return;

        // 显示加载状态
        if (mapLoading) {
            mapLoading.style.display = 'flex';
        }

        // 获取当前城市的中心坐标
        const cityCenter = this.getCityCenter(this.currentCity);
        console.log(`初始化地图 - 城市: ${this.currentCity}, 中心坐标: ${cityCenter}`);
        
        // 使用 Leaflet 开源地图
        this.map = L.map(mapContainer).setView(cityCenter, 12);

        // 添加 OpenStreetMap 瓦片图层，带备用服务
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
            errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
        }).addTo(this.map);

        // 检测瓦片加载错误，尝试备用服务
        tileLayer.on('tileerror', function(e) {
            console.warn('OpenStreetMap瓦片加载失败，尝试备用服务');
            // 备用地图服务
            L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team',
                maxZoom: 18
            }).addTo(this.map);
        });

        // 监听地图加载完成
        this.map.whenReady(() => {
            if (mapLoading) {
                mapLoading.style.display = 'none';
            }
            console.log('地图加载完成');
            
            // 添加场馆标记
            this.addVenueMarkers();
        });

        // 添加超时机制，防止地图加载卡住
        setTimeout(() => {
            if (mapLoading && mapLoading.style.display === 'flex') {
                console.warn('地图加载超时，强制隐藏加载状态');
                mapLoading.style.display = 'none';
                // 尝试添加场馆标记
                this.addVenueMarkers();
            }
        }, 5000); // 5秒超时
    }

    // 添加场馆标记
    addVenueMarkers() {
        if (!this.map || !this.venues) return;
        
        let markerCount = 0;
        const markers = []; // 收集所有标记用于后续处理
        
        this.venues.forEach(venue => {
            let coordinates;
            if (venue.location && venue.location.coordinates && 
                Array.isArray(venue.location.coordinates) && 
                venue.location.coordinates.length >= 2) {
                coordinates = [venue.location.coordinates[1], venue.location.coordinates[0]]; // Leaflet 使用 [lat, lng] 格式
            } else if (venue.coordinates && 
                       Array.isArray(venue.coordinates) && 
                       venue.coordinates.length >= 2) {
                coordinates = [venue.coordinates[1], venue.coordinates[0]];
            }
            
            if (coordinates && coordinates[0] && coordinates[1]) {
                markerCount++;
                const marker = L.marker(coordinates).addTo(this.map);
                marker.bindPopup(`
                    <div class="p-2">
                        <h4 class="font-bold text-lg">${venue.name}</h4>
                    </div>
                `);
                markers.push(marker); // 添加到标记数组
            } else {
                console.warn('场馆坐标数据不完整:', venue.name, venue);
            }
        });
        
        console.log(`添加了 ${markerCount} 个场馆标记`);
        
        // 如果有场馆，自动调整地图视野以包含所有标记
        if (markerCount > 0 && markers.length > 0) {
            try {
                const group = new L.featureGroup(markers);
                this.map.fitBounds(group.getBounds().pad(0.1));
            } catch (error) {
                console.warn('自动调整地图视野失败:', error);
                // 如果自动调整失败，使用默认视野
                const cityCenter = this.getCityCenter(this.currentCity);
                this.map.setView(cityCenter, 12);
            }
        }
    }

    // 获取城市中心坐标
    getCityCenter(cityId) {
        const cityCenters = {
            'beijing': [39.9042, 116.4074],
            'shanghai': [31.2304, 121.4737],
            'guangzhou': [23.1291, 113.2644],
            'shenzhen': [22.5431, 114.0579],
            'changsha': [28.2282, 112.9388],
            'kunming': [24.8801, 102.8329],
            'chengdu': [30.5723, 104.0665],
            'hangzhou': [30.1839, 120.1758],
            'suzhou': [31.3329, 120.6741],
            'wuhan': [30.5852, 114.2734],
            'nanjing': [32.0603, 118.7969]
        };
        return cityCenters[cityId] || [39.9042, 116.4074]; // 默认北京
    }

    // 显示场馆列表
    displayVenues() {
        const venueList = document.getElementById('venueList');
        if (!venueList) return;

        const filteredVenues = this.getFilteredVenues();
        
        venueList.innerHTML = filteredVenues.map(venue => `
            <div class="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                <h3 class="font-bold text-lg mb-2">${venue.name}</h3>
                <p class="text-gray-600 text-sm mb-2">${venue.address}</p>
                <div class="flex flex-wrap gap-2 mb-3">
                    ${venue.features ? venue.features.map(feature => 
                        `<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${feature}</span>`
                    ).join('') : ''}
                </div>
                <div class="flex gap-2">
                    ${venue.phone ? `
                        <a href="tel:${venue.phone}" class="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
                            拨号
                        </a>
                    ` : ''}
                    ${venue.location && venue.location.coordinates ? `
                        <a href="geo:${venue.location.coordinates[1]},${venue.location.coordinates[0]}" class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                            导航
                        </a>
                    ` : venue.coordinates ? `
                        <a href="geo:${venue.coordinates[1]},${venue.coordinates[0]}" class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                            导航
                        </a>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    // 获取过滤后的场馆
    getFilteredVenues() {
        if (!this.currentKeyword) return this.venues;
        
        const keyword = this.currentKeyword.toLowerCase();
        return this.venues.filter(venue => 
            venue.name.toLowerCase().includes(keyword) ||
            venue.address.toLowerCase().includes(keyword) ||
            (venue.features && venue.features.some(feature => 
                feature.toLowerCase().includes(keyword)
            ))
        );
    }

    // 过滤场馆
    filterVenues() {
        // 首页不需要过滤场馆，搜索功能已移至搜索页面
    }

    // 显示消息
    showMessage(message) {
        // 创建消息提示
        const messageEl = document.createElement('div');
        messageEl.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50 fade-in';
        messageEl.textContent = message;
        
        document.body.appendChild(messageEl);

        // 3秒后自动消失
        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }

    // 加载城市数据
    async loadCityData() {
        try {
            // 加载城市列表数据
            const citiesData = await this.fetchCitiesData();
            this.populateCitySelector(citiesData);
        } catch (error) {
            console.error('加载城市数据失败:', error);
        }
    }

    // 获取城市数据
    async fetchCitiesData() {
        const response = await fetch('./data/cities.json');
        if (!response.ok) {
            throw new Error('Failed to fetch cities data');
        }
        const data = await response.json();
        return data.cities;
    }

    // 填充城市选择器（保留用于城市数据获取）
    populateCitySelector(cities) {
        // 这个方法现在用于获取城市数据，不再直接填充选择器
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DropFitMain();
});
