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
        // 检查是否有从城市选择页面保存的城市
        const savedCity = localStorage.getItem('selectedCity');
        if (savedCity) {
            this.currentCity = savedCity;
            // 清除保存的城市，避免刷新后仍然使用
            localStorage.removeItem('selectedCity');
        }
        
        this.bindEvents();
        this.loadCityData();
        this.updateCityName(this.currentCity); // 初始化城市名称
        this.loadVenues();
    }

    bindEvents() {
        // 城市按钮 - 直接跳转到城市选择页面
        const cityBtn = document.getElementById('cityBtn');
        cityBtn.addEventListener('click', () => {
            window.location.href = 'city-selector.html';
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
            this.map.destroy();
            this.map = null;
            console.log('旧地图实例已销毁');
        }
        // 清除标记图层引用
        this.markerLayer = null;
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

        // 检查腾讯地图 API 是否加载成功
        if (typeof TMap === 'undefined') {
            console.error('腾讯地图 API 未加载，请检查 Key 是否正确或网络连接');
            if (mapLoading) {
                mapLoading.innerHTML = '<div class="text-center"><p class="text-red-600">地图加载失败</p><p class="text-gray-500 text-sm">请检查网络连接或 API Key 配置</p></div>';
            }
            return;
        }

        // 显示加载状态
        if (mapLoading) {
            mapLoading.style.display = 'flex';
        }

        // 获取当前城市的中心坐标
        const cityCenter = this.getCityCenter(this.currentCity);
        console.log(`初始化地图 - 城市: ${this.currentCity}, 中心坐标: ${cityCenter}`);

        try {
            // 使用腾讯地图 API GL
            const center = new TMap.LatLng(cityCenter[0], cityCenter[1]);
            console.log('创建地图实例...');
            this.map = new TMap.Map(mapContainer, {
                center: center,
                zoom: 10
            });
            console.log('地图实例创建成功');

            // 地图加载完成后隐藏加载状态
            this.map.on('tilesloaded', () => {
                console.log('地图瓦片加载完成');
                if (mapLoading) {
                    mapLoading.style.display = 'none';
                }
            });

            // 添加超时机制
            setTimeout(() => {
                if (mapLoading && mapLoading.style.display === 'flex') {
                    console.warn('地图加载超时，强制隐藏加载状态');
                    mapLoading.style.display = 'none';
                }
            }, 8000);

            // 添加场馆标记
            setTimeout(() => {
                this.addVenueMarkers();
            }, 500);

        } catch (error) {
            console.error('地图初始化失败:', error);
            if (mapLoading) {
                mapLoading.innerHTML = `<div class="text-center"><p class="text-red-600">地图初始化失败</p><p class="text-gray-500 text-sm">${error.message}</p></div>`;
            }
            this.showMessage('地图加载失败: ' + error.message);
        }
    }

    // 添加场馆标记
    addVenueMarkers() {
        if (!this.map || !this.venues || this.venues.length === 0) return;

        try {
            // 准备标记数据
            const geometries = [];
            const bounds = []; // 用于存储所有标记的坐标，以便调整视野

            this.venues.forEach((venue, index) => {
                let coordinates;
                if (venue.location && venue.location.coordinates &&
                    Array.isArray(venue.location.coordinates) &&
                    venue.location.coordinates.length >= 2) {
                    // 数据库存储的是 [lng, lat]，腾讯地图需要 LatLng(lat, lng)
                    coordinates = [venue.location.coordinates[1], venue.location.coordinates[0]];
                } else if (venue.coordinates &&
                           Array.isArray(venue.coordinates) &&
                           venue.coordinates.length >= 2) {
                    coordinates = [venue.coordinates[1], venue.coordinates[0]];
                }

                if (coordinates && coordinates[0] && coordinates[1]) {
                    const latLng = new TMap.LatLng(coordinates[0], coordinates[1]);
                    bounds.push(latLng);
                    geometries.push({
                        id: `marker-${index}`,
                        position: latLng,
                        properties: {
                            title: venue.name,
                            address: venue.address
                        }
                    });
                } else {
                    console.warn('场馆坐标数据不完整:', venue.name, venue);
                }
            });

            console.log(`添加了 ${geometries.length} 个场馆标记`);

            // 如果已有标记图层，先销毁
            if (this.markerLayer) {
                this.markerLayer.destroy();
            }

            // 创建多标记图层
            if (geometries.length > 0) {
                this.markerLayer = new TMap.MultiMarker({
                    map: this.map,
                    styles: {
                        'default': new TMap.MarkerStyle({
                            width: 25,
                            height: 35,
                            anchor: { x: 12, y: 35 },
                            color: '#0066cc'
                        })
                    },
                    geometries: geometries
                });

                // 记录当前打开的标记ID
                this.currentOpenMarkerId = null;

                // 添加点击事件，显示场馆名称
                this.markerLayer.on('click', (e) => {
                    const geometry = e.geometry;
                    if (geometry && geometry.properties) {
                        const clickedId = geometry.id;
                        
                        // 如果点击的是同一个标记，则关闭信息窗体
                        if (this.currentOpenMarkerId === clickedId && this.infoWindow) {
                            this.infoWindow.close();
                            this.infoWindow = null;
                            this.currentOpenMarkerId = null;
                            return;
                        }
                        
                        // 记录当前打开的标记ID
                        this.currentOpenMarkerId = clickedId;
                        
                        // 创建信息窗体
                        if (this.infoWindow) {
                            this.infoWindow.close();
                        }
                        this.infoWindow = new TMap.InfoWindow({
                            map: this.map,
                            position: geometry.position,
                            enableCustom: true,
                            content: `<div class="map-venue-name-bubble">${geometry.properties.title}</div>`,
                            offset: { x: 0, y: -30 }
                        });
                    }
                });

                // 自动调整地图视野以包含所有标记
                if (bounds.length > 0) {
                    const latitudes = bounds.map((point) => point.lat);
                    const longitudes = bounds.map((point) => point.lng);
                    const southWest = new TMap.LatLng(Math.min(...latitudes), Math.min(...longitudes));
                    const northEast = new TMap.LatLng(Math.max(...latitudes), Math.max(...longitudes));
                    const latLngBounds = new TMap.LatLngBounds(southWest, northEast);

                    this.map.fitBounds(latLngBounds, { padding: 20 });
                }
            }
        } catch (error) {
            console.error('添加场馆标记失败:', error);
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
