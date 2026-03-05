class InternationalPage {
    constructor() {
        this.venues = [];
        this.filteredVenues = [];
        this.countryIndex = [];
        this.countryFileMap = new Map();
        this.countryMetaMap = new Map();
        this.countryVenueCache = new Map();
        this.map = null;
        this.markerLayer = null;
        this.defaultCountry = 'thailand';
        this.defaultCity = 'bangkok';
        this.hasAppliedDefaultCity = false;

        this.countrySelect = document.getElementById('countrySelect');
        this.citySelect = document.getElementById('citySelect');
        this.keywordInput = document.getElementById('keywordInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.resultCount = document.getElementById('resultCount');
        this.resultList = document.getElementById('resultList');

        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadCountryIndex();
        this.populateCountryOptions();
        await this.loadVenuesByCountry(this.countrySelect?.value || 'all');
        this.populateCityOptions();
        this.initMap();
        this.performSearch();
    }

    bindEvents() {
        const backBtn = document.getElementById('backBtn');
        backBtn?.addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        this.countrySelect?.addEventListener('change', async () => {
            await this.loadVenuesByCountry(this.countrySelect?.value || 'all');
            this.populateCityOptions();
            this.performSearch();
        });

        this.citySelect?.addEventListener('change', () => {
            this.performSearch();
        });

        this.keywordInput?.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                this.performSearch();
            }
        });

        this.searchBtn?.addEventListener('click', () => {
            this.performSearch();
        });
    }

    async loadCountryIndex() {
        try {
            const response = await fetch('./data/international/index.json');
            if (!response.ok) {
                throw new Error('加载国际场馆数据失败');
            }

            const data = await response.json();
            this.countryIndex = data.countries || [];
            this.countryIndex.forEach((country) => {
                this.countryFileMap.set(country.id, country.file);
                this.countryMetaMap.set(country.id, country);
            });
        } catch (error) {
            console.error(error);
            this.showInlineMessage('国际版数据加载失败，请稍后重试。');
        }
    }

    async loadVenuesByCountry(countryId) {
        try {
            if (countryId === 'all') {
                const countryIds = this.countryIndex.map((country) => country.id);
                const venueList = await Promise.all(countryIds.map((id) => this.loadCountryVenues(id)));
                this.venues = venueList.flat();
                return;
            }

            this.venues = await this.loadCountryVenues(countryId);
        } catch (error) {
            console.error(error);
            this.venues = [];
            this.showInlineMessage('国家数据加载失败，请稍后重试。');
        }
    }

    async loadCountryVenues(countryId) {
        if (!countryId) return [];
        if (this.countryVenueCache.has(countryId)) {
            return this.countryVenueCache.get(countryId);
        }

        const countryFile = this.countryFileMap.get(countryId);
        if (!countryFile) return [];

        const response = await fetch(countryFile);
        if (!response.ok) {
            throw new Error(`加载国家场馆数据失败: ${countryId}`);
        }

        const countryData = await response.json();
        const flattened = this.flattenCountryData(countryData);
        this.countryVenueCache.set(countryId, flattened);
        return flattened;
    }

    flattenCountryData(countryData) {
        const cityEntries = Object.entries(countryData.cities || {});
        const venues = [];

        cityEntries.forEach(([cityId, cityData]) => {
            const cityName = cityData?.name || cityId;
            const cityVenues = Array.isArray(cityData?.venues) ? cityData.venues : [];
            cityVenues.forEach((venue) => {
                venues.push({
                    ...venue,
                    country: countryData.country,
                    countryName: countryData.countryName,
                    city: cityId,
                    cityName
                });
            });
        });

        return venues;
    }

    initMap() {
        this.map = L.map('intlMap', {
            zoomControl: true,
            attributionControl: true
        }).setView([15.6, 116.0], 4);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this.map);

        this.markerLayer = L.layerGroup().addTo(this.map);
    }

    populateCountryOptions() {
        if (!this.countrySelect) return;

        const options = ['<option value="all">全部国家</option>'];
        this.countryIndex.forEach((country) => {
            options.push(`<option value="${country.id}">${country.name}</option>`);
        });

        this.countrySelect.innerHTML = options.join('');

        const hasDefaultCountry = this.countryMetaMap.has(this.defaultCountry);
        this.countrySelect.value = hasDefaultCountry ? this.defaultCountry : 'all';
    }

    populateCityOptions() {
        if (!this.citySelect || !this.countrySelect) return;

        const selectedCountry = this.countrySelect.value || 'all';
        const options = ['<option value="all">全部城市</option>'];
        if (selectedCountry === 'all') {
            const cityMap = new Map();
            this.countryIndex.forEach((country) => {
                (country.cities || []).forEach((city) => {
                    if (!cityMap.has(city.id)) {
                        cityMap.set(city.id, city.name);
                    }
                });
            });
            cityMap.forEach((cityName, cityId) => {
                options.push(`<option value="${cityId}">${cityName}</option>`);
            });
        } else {
            const countryMeta = this.countryMetaMap.get(selectedCountry);
            (countryMeta?.cities || []).forEach((city) => {
                options.push(`<option value="${city.id}">${city.name}</option>`);
            });
        }

        this.citySelect.innerHTML = options.join('');

        if (!this.hasAppliedDefaultCity && selectedCountry === this.defaultCountry) {
            const hasDefaultCity = options.some((option) => option.includes(`value="${this.defaultCity}"`));
            this.citySelect.value = hasDefaultCity ? this.defaultCity : 'all';
            this.hasAppliedDefaultCity = true;
            return;
        }

        this.citySelect.value = 'all';
    }

    performSearch() {
        const selectedCountry = this.countrySelect?.value || 'all';
        const selectedCity = this.citySelect?.value || 'all';
        const keyword = (this.keywordInput?.value || '').trim().toLowerCase();

        this.filteredVenues = this.venues.filter((venue) => {
            const matchCountry = selectedCountry === 'all' || venue.country === selectedCountry;
            const matchCity = selectedCity === 'all' || venue.city === selectedCity;
            const matchKeyword =
                keyword.length === 0 ||
                venue.name.toLowerCase().includes(keyword) ||
                venue.address.toLowerCase().includes(keyword);

            return matchCountry && matchCity && matchKeyword;
        });

        this.renderList();
        this.renderMapMarkers();
        this.updateResultCount();
    }

    renderList() {
        if (!this.resultList) return;

        if (this.filteredVenues.length === 0) {
            this.resultList.innerHTML = '<p class="text-sm text-gray-500">未找到符合条件的场馆，请调整筛选条件。</p>';
            return;
        }

        this.resultList.innerHTML = this.filteredVenues
            .map((venue) => {
                const tags = Array.isArray(venue.tags) ? venue.tags : [];
                const tagHtml = tags
                    .map((tag) => `<span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">${tag}</span>`)
                    .join('');

                return `
                    <article class="rounded-xl border border-slate-200 p-3">
                        <div class="flex items-start justify-between gap-3">
                            <div>
                                <h4 class="text-sm font-semibold text-slate-800">${venue.name}</h4>
                                <p class="mt-1 text-xs text-slate-500">${venue.countryName} · ${venue.cityName}</p>
                                <p class="mt-1 text-xs text-slate-500">${venue.address}</p>
                            </div>
                        </div>
                        <div class="mt-2 flex flex-wrap gap-1">${tagHtml}</div>
                    </article>
                `;
            })
            .join('');
    }

    renderMapMarkers() {
        if (!this.map || !this.markerLayer) return;

        this.markerLayer.clearLayers();

        if (this.filteredVenues.length === 0) {
            this.map.setView([15.6, 116.0], 4);
            return;
        }

        const bounds = [];

        this.filteredVenues.forEach((venue) => {
            const [lng, lat] = venue.coordinates || [];
            if (!lng || !lat) return;

            const marker = L.marker([lat, lng]);
            marker.bindPopup(`
                <div style="min-width: 180px;">
                    <strong>${venue.name}</strong><br>
                    <span>${venue.countryName} · ${venue.cityName}</span><br>
                    <span>${venue.address}</span>
                </div>
            `);

            marker.addTo(this.markerLayer);
            bounds.push([lat, lng]);
        });

        if (bounds.length === 1) {
            this.map.setView(bounds[0], 12);
        } else if (bounds.length > 1) {
            this.map.fitBounds(bounds, { padding: [30, 30] });
        }
    }

    updateResultCount() {
        if (!this.resultCount) return;
        this.resultCount.textContent = `${this.filteredVenues.length} 家场馆`;
    }

    showInlineMessage(message) {
        if (!this.resultList) return;
        this.resultList.innerHTML = `<p class="text-sm text-red-500">${message}</p>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.internationalPage = new InternationalPage();
});
