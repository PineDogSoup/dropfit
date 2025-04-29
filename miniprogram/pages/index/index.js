import {
  removeCitySuffix
} from "../../utils/common.js"
import {
  getSupportedCities,
  getUserLocationAndCity
} from "../../utils/location.js"
import {
  getVenues
} from "../../utils/venues.js"

Page({
  data: {
    loading: false,
    selectedCity: '',
    nearestCity: '北京',
    supportedCities: '',
    venues: [],
    slogans: [],
    sloganTitleStyle: '',
    searchInput: '',
    location: null,
    isDataLoaded: false,
    loadingVenues: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    this.setData({
      loadingVenues: true
    });
    // 并行加载 supportedCities 和 location/city
    Promise.all([
      getSupportedCities(),
      getUserLocationAndCity()
    ]).then(([supportedCitiesRes, userLocationRes]) => {
      const supportedCities = supportedCitiesRes.map(obj => obj.zh);
      this.setData({
        supportedCities
      });
      this.updateCityAndFetchVenues(userLocationRes.city, userLocationRes.location);
    });
  },

  getSloganImages() {
    const cachedSlogans = wx.getStorageSync("slogans");
    if (cachedSlogans) {
      this.setData({
        slogans: cachedSlogans
      });
    } else {
      wx.cloud.callFunction({
        name: 'getSlogans',
        success: (res) => {
          if (res.result.success) {
            this.setData({
              slogans: res.result.data
            })
            wx.setStorageSync('slogans', res.result.data)
          } else {
            wx.showToast({
              title: '检索失败',
              icon: 'none'
            });
          }
        },
        fail: (e) => {
          console.log(e);
        }
      });
    }
  },

  updateCityAndFetchVenues(city, location) {
    this.setData({
      loadingVenues: true
    });
    var selectedCity = wx.getStorageSync('selectedCity')
    // console.log('city', city);
    if (!selectedCity) {
      const currentCity = removeCitySuffix(city)
      selectedCity = this.data.supportedCities.includes(currentCity) ? currentCity : '北京'
      wx.setStorageSync('selectedCity', selectedCity);
    }

    // console.log('selectedCity', selectedCity);
    // console.log('location', location);
    // location.latitude = 25.65128
    // location.longitude = 100.1818

    getVenues(location.latitude, location.longitude, selectedCity, 3).then(res => {
      // console.log('res',res);
      this.setData({
        selectedCity,
        venues: res,
        isDataLoaded: true,
        loadingVenues: false
      });
      wx.hideLoading();
    })
  },

  toggleCitySelect() {
    wx.navigateTo({
      url: '/pages/index/cities/cities',
    })
  },

  onSearchInput(e) {
    this.setData({
      searchInput: e.detail.value
    })
  },

  onSearchConfirmed(e) {
    wx.navigateTo({
      url: '/pages/index/search/search?keyword=' + this.data.searchInput,
    })
  },

  switchToVeneuSearch(e) {
    wx.navigateTo({
      url: '/pages/index/search/search',
    })
  },

  onLocationSearchTap() {
    wx.switchTab({
      url: '/pages/nearby/nearby',
    })
  },

  onCalculateTap() {
    wx.navigateTo({
      url: '/pages/my/barbell/barbell'
    })
  },

  onExperienceCardTap() {
    wx.navigateTo({
      url: '/pages/experienceCard/experienceCard',
    })
  },

  onShow() {
    if (this.data.isDataLoaded) {
      this.setData({
        loadingVenues: true
      });
      Promise.all([
        getSupportedCities(),
        getUserLocationAndCity()
      ]).then(([supportedCitiesRes, userLocationRes]) => {
        const supportedCities = supportedCitiesRes.map(obj => obj.zh);
        this.setData({
          supportedCities
        });
        this.updateCityAndFetchVenues(userLocationRes.city, userLocationRes.location);
      });
    }
  },

  onReachBottom() {
    // console.log("触底了!")
    // this.getVenuesData();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})