import {
  removeCitySuffix
} from "../../../utils/common.js"
import {
  getUserLocation,
  reverseGeocode,
  getCachedLocation,
  getSupportedCities
} from "../../../utils/location.js"
import { CITY_LOCATIONS } from '../../../utils/city-locations.js'

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
      const currentCity = removeCitySuffix(city)
      if (this.data.supportedCities.includes(currentCity)) {
        this.setData({
          nearestCity: currentCity
        })
      } else {
        // 计算最近的支持城市
        const userLat = location.latitude;
        const userLng = location.longitude;
        // 只在支持城市范围内查找
        const supportedCityObjs = CITY_LOCATIONS.filter(c => this.data.supportedCities.includes(c.zh));
        let minDist = Infinity;
        let nearest = '北京';
        supportedCityObjs.forEach(cityObj => {
          const dist = getDistance(userLat, userLng, cityObj.latitude, cityObj.longitude);
          if (dist < minDist) {
            minDist = dist;
            nearest = cityObj.zh;
          }
        });
        this.setData({
          nearestCity: nearest
        })
      }
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

// Haversine距离计算函数
function getDistance(lat1, lng1, lat2, lng2) {
  const toRad = d => d * Math.PI / 180;
  const R = 6371; // 地球半径，单位km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}