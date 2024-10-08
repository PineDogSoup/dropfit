// pages/feedback/feedback-content/feedback-content.js
Page({
  data: {
    title: '',
    inputLength: 0,
    images: [],
    contact: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      title: options.title
    })
  },

  onInput(e) {
    this.setData({
      inputLength: e.detail.value.length
    });
  },

  chooseImage() {
    const _that = this;
    wx.showActionSheet({
      itemList: ['拍照', '从手机相册选择'],
      success(res) {
        wx.chooseMedia({
          count: 4 - _that.data.images.length,
          mediaType: ['image', 'video'],
          sourceType: ['album', 'camera'],
          maxDuration: 30,
          camera: 'back',
          success(res) {
            console.log(res.tempFiles[0].tempFilePath)
            console.log(res.tempFiles[0].size)
            _that.setData({
              images: _that.data.images.concat(res.tempFiles)
            });
          }
        })
      }
    });
  },

  onContactInput(e) {
    this.setData({
      contact: e.detail.value
    });
  },

  submitFeedback() {
    // 提交反馈逻辑
    console.log('反馈内容:', this.data.inputLength);
    console.log('截图:', this.data.images);
    console.log('联系方式:', this.data.contact);
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