Page({
  data: {
    venues: null
  },

  onLoad(options) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    this.getUserVenueCollectRecords()
  },

  getUserVenueCollectRecords() {
    wx.cloud.callFunction({
      name: 'getUserVenueCollectRecord',
    }).then(res => {
      if (res.result.success && res.result.data.length > 0) {
        this.setData({
          venues: res.result.data
        });
      }
      wx.hideLoading()

    }).catch(err => {
      console.error('获取收录记录失败', err);
      wx.showToast({
        title: '获取收录记录失败',
        icon: 'error'
      });
    });
  },

  review(e) {
    console.log(e);
  },

  onSubmit() {
    wx.navigateTo({
      url: '/pages/my/venueCollect/venueCollect',
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})