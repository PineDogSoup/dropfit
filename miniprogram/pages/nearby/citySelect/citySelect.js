import {
  removeCitySuffix
} from "../../../utils/common.js"
import {
  getUserLocation,
  reverseGeocode,
  getCachedLocation,
  getSupportedCities
} from "../../../utils/location.js"

Page({
  data: {
    historyCities: [],
    hotCities: ['北京', '上海', '广州', '深圳', '长沙', '成都', '重庆', '杭州'],
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    allCities: [],
    supportedCities: [],
    currentCity: ''
  },

  onLoad() {
    this.getCities();
    this.setData({
      historyCities: this.getHistoryCities()
    });
  },

  getCities() {
    getSupportedCities().then(supportedCities => {
      // console.log('supportedCities', supportedCities);
      this.setData({
        supportedCities: supportedCities.map(city => city.zh)
      })
      this.groupCitiesByInitial(supportedCities);
      this.loadUserLocation();
    })
  },

  groupCitiesByInitial(cities) {
    const groupedCities = cities.reduce((acc, city) => {
      const initial = city.en.charAt(0).toUpperCase(); // 获取城市英文名的首字母并转换为大写
      if (!acc[initial]) {
        acc[initial] = [];
      }
      acc[initial].push(city.zh); // 使用城市的中文名进行分组
      return acc;
    }, {});

    const alphabet = Object.keys(groupedCities).sort();
    const allCities = alphabet.map(letter => ({
      initial: letter,
      cities: groupedCities[letter]
    }));

    this.setData({
      alphabet,
      allCities
    });
  },

  loadUserLocation() {
    const cachedLocation = getCachedLocation()
    // console.log('cachedLocation', cachedLocation);
    if (cachedLocation != null) {
      this.setLocationAndNearstCity(cachedLocation)
    } else {
      getUserLocation().then(location => {
        this.setLocationAndNearstCity(location)
      })
    }
  },

  setLocationAndNearstCity(location) {
    wx.showLoading({
      title: '定位中...',
      mask: true
    })
    this.setData({
      location
    });
    reverseGeocode(location).then(city => {
      // console.log(city);
      const currentCity = removeCitySuffix(city)
      this.setData({
        currentCity
      })
      wx.hideLoading()
    });
  },

  onCitySelect(event) {
    const selectedCity = event.currentTarget.dataset.city;
    this.updateHistoryCities(selectedCity);

    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];

    prevPage.setData({
      selectedCity,
      keyword: ''
    });

    wx.navigateBack();
  },

  getHistoryCities() {
    return wx.getStorageSync('historySearchCities') || [];
  },

  updateHistoryCities(city) {
    let historyCities = this.getHistoryCities();
    const cityIndex = historyCities.indexOf(city);

    if (cityIndex !== -1) {
      historyCities.splice(cityIndex, 1);
    }

    historyCities.unshift(city);

    if (historyCities.length > 4) {
      historyCities.pop();
    }

    wx.setStorageSync('historySearchCities', historyCities);
    this.setData({
      historyCities
    });
  },

  onHistoryDelete(e) {
    wx.setStorageSync('historySearchCities', []);
    this.setData({
      historyCities: []
    });
  }
});