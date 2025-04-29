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
    nearestCity: ''
  },

  onLoad() {
    this.getCities();
    this.getHistoryCities();
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
    if (cachedLocation != null) {
      this.setLocationAndNearstCity(cachedLocation)
    } else {
      getUserLocation().then(location => {
        this.setLocationAndNearstCity(location)
      })
    }
  },

  setLocationAndNearstCity(location) {
    this.setData({
      location
    });
    reverseGeocode(location).then(city => {
      console.log('city', city);
      const currentCity = removeCitySuffix(city)
      this.setData({
        nearestCity: this.data.supportedCities.includes(currentCity) ? currentCity : '北京'
      })
    });
  },

  getHistoryCities() {
    const historyCities = wx.getStorageSync('historyCities') || [];
    this.setData({
      historyCities
    });
  },

  onCitySelect(event) {
    const city = event.currentTarget.dataset.city;
    this.reLaunchToIndex(city)
  },

  switchToNearestCity() {
    this.reLaunchToIndex(this.data.nearestCity)
  },

  reLaunchToIndex(city) {
    wx.setStorageSync('selectedCity', city);
    this.updateHistoryCities(city);

    wx.showToast({
      title: '正在切换...',
      icon: 'loading',
      duration: 3000
    });

    wx.navigateBack();
    // wx.reLaunch({
    //   url: `/pages/index/index?city=${city}`
    // });
  },

  updateHistoryCities(city) {
    let historyCities = wx.getStorageSync('historyCities') || [];
    const cityIndex = historyCities.indexOf(city);

    if (cityIndex !== -1) {
      historyCities.splice(cityIndex, 1);
    }

    historyCities.unshift(city);

    if (historyCities.length > 4) {
      historyCities.pop();
    }

    wx.setStorageSync('historyCities', historyCities);
    this.setData({
      historyCities
    });
  },
});