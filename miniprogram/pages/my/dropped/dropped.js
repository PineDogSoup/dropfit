// pages/dropped/dropped.js
Page({
  data: {
    userInfo: null,
    openid: '',
    countries: 0,
    cities: 0,
    venueCount: 0,
    markers: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    const userInfo = wx.getStorageSync('userInfo');
    const openid = wx.getStorageSync('openid');
    this.setData({
      userInfo,
      openid
    });
    this.loadUserDropped()
  },

  loadUserDropped() {
    wx.cloud.callFunction({
      name: 'getUserDropped',
      data: {
        openid: this.data.openid
      }
    }).then(res => {
      if (res.result.success) {
        const droppedVeneus = res.result.data
        this.generateMarkers(droppedVeneus)
        this.calculateCityStats(droppedVeneus)
        wx.hideLoading()
      } else {
        wx.showToast({
          title: res.result.message,
          icon: 'error'
        });
      }
    }).catch(err => {
      console.error('获取足迹列表失败', err);
      wx.showToast({
        title: '获取足迹列表失败',
        icon: 'error'
      });
    });
  },

  generateMarkers(venues) {
    const markers = venues.map((v, id) => {
      return {
        id,
        width: 12,
        height: 12,
        latitude: v.location.coordinates[1],
        longitude: v.location.coordinates[0],
        iconPath: '/static/images/redcircle.png',
        title: v.name
      };
    })

    this.setData({
      markers,
    })
  },

  calculateCityStats(venues) {
    const cityStats = {};

    venues.forEach(venue => {
      if (cityStats[venue.city]) {
        cityStats[venue.city]++;
      } else {
        cityStats[venue.city] = 1;
      }
    });

    this.setData({
      countries: 1,
      cities: Object.keys(cityStats).length,
      venueCount: venues.length
    })
  },

  onRegionChange(e) {
    // 处理地图区域变化事件
  },
  onMapTap(e) {
    // 处理地图点击事件
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})