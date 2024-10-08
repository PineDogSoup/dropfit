import {
  generateDistance,
  removeCitySuffix
} from "../../utils/common.js"
import {
  queryVenuesByPage
} from "../../api/venue.js"
import {
  getHomeInformation
} from "../../api/home.js"
import {
  getUserAddressInfo
} from "../../utils/location.js"

Page({
  data: {
    selectedCity: '',
    showCityDropdown: false,
    nearestCity: '北京',
    supportedCities: ['北京', '上海', '广州', '深圳', '长沙', '昆明', '成都'],
    venues: [],
    slogans: [],
    searchInput: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getHomeInfo();
    this.getUserLocation();
    this.getVenuesData(this.data.selectedCity);
  },

  getHomeInfo() {
    getHomeInformation().then(res => {
      this.setData({
        slogans: res.data.slogans
      })
    })
  },

  getUserLocation() {
    getUserAddressInfo().then(res => {
      console.log(res);
      let currentCity = removeCitySuffix(res.city)
      console.log(currentCity);
      this.setData({
        selectedCity: this.data.supportedCities.includes(currentCity) ? currentCity : '北京',
      });
    })
  },

  toggleCityDropdown() {
    this.setData({
      showCityDropdown: !this.data.showCityDropdown,
    });
  },

  selectCity(e) {
    const {
      city
    } = e.currentTarget.dataset;
    this.setData({
      selectedCity: city,
      showCityDropdown: false,
    });
    this.getVenuesData(city);
  },

  switchToNearestCity() {
    this.setData({
      selectedCity: this.data.nearestCity,
      showCityDropdown: false,
    });
    this.getVenuesData(this.data.nearestCity);
  },

  getVenuesData(city, keyword = '') {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    queryVenuesByPage({
      city,
      keyword,
      limit: 3
    }).then(res => {
      let oldVenues = this.data.venues;
      let updatedVeneus = res.data.venues.map(item => {
        return {
          ...item,
          distance: generateDistance()
        };
      });
      let newVenus = oldVenues.concat(updatedVeneus);
      console.log(newVenus);
      this.setData({
        venues: newVenus
      })
      wx.stopPullDownRefresh();
    })
    wx.hideLoading();
  },

  onSearchInput(e) {
    this.setData({
      searchInput: e.detail.value
    })
  },

  onSearchConfirmed(e) {
    wx.reLaunch({
      url: '/pages/search/search?city=' + this.data.selectedCity + '&keyword=' + this.data.searchInput,
    })
  },

  switchToVeneuSearch(e) {
    console.log(e);
    wx.reLaunch({
      url: '/pages/search/search?city=' + this.data.selectedCity,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
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