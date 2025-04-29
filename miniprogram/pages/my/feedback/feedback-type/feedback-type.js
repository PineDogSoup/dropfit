// pages/feedback/feedback-type/feedback-type.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    feedbackTypes: [{
        title: '功能异常',
        desc: '请向开发者反馈小程序功能异常问题'
      },
      {
        title: '产品建议',
        desc: '请向开发者反馈你对产品相关建议'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  onFeedbackClick(e) {
    const feedBackType = this.data.feedbackTypes[e.currentTarget.dataset.index]
    wx.redirectTo({
      url: '/pages/my/feedback/feedback-content/feedback-content?title=' + feedBackType.title
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