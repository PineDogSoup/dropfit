import { generateDistance } from "../../utils/common.js"
import { queryVenuesByPage } from "../../api/venue.js"
import { getHomeInformation } from "../../api/home.js"

Page({
  data: {
    selectorVisible: false,
    selectedProvince: null,
    selectedCity: null,
    venues: [],
    slogans: []
  },

  // 显示组件
  showSelector() {
    this.setData({
      selectorVisible: true,
    });
  },

  // 当用户选择了组件中的城市之后的回调函数
  onSelectCity(e) {
    const {
      province,
      city
    } = e.detail;
    this.setData({
      selectedProvince: province,
      selectedCity: city,
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getHomeInfo();
    this.getVenuesData();
  },

  getHomeInfo() {
    getHomeInformation().then(res => {
      this.setData({
        slogans: res.data.slogans
      })
    })
  },

  getVenuesData() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    queryVenuesByPage({
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
    console.log(e)
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