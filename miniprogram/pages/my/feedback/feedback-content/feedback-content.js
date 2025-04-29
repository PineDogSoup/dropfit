import {
  uploadImage
} from "../../../../utils/common.js"
Page({
  data: {
    title: '',
    content: '',
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
      content: e.detail.value
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
    const that = this;
    const content = that.data.contact;
    if (content.length === 0) {
      return wx.showToast({
        title: '未输入反馈内容',
        icon: 'error'
      })
    }

    const tempFiles = that.data.images;
    if (tempFiles.length === 0) {
      return wx.showToast({
        title: '未选择截图',
        icon: 'error'
      })
    }

    const uploadPromises = tempFiles.map(file => {
      return uploadImage({
        prefix: "feedback",
        filePath: file.tempFilePath
      })
    });

    Promise.all(uploadPromises).then(cloudFilePaths => {
      const openid = wx.getStorageSync('openid');
      wx.cloud.callFunction({
        name: 'commitFeedback',
        data: {
          openid,
          type: that.data.title,
          content: content,
          images: cloudFilePaths,
          contact: that.data.contact
        },
        success: res => {
          wx.showToast({
            title: '反馈成功',
            icon: 'success'
          });
          wx.reLaunch({
            url: '/pages/my/my',
          })
        },
        fail: err => {
          console.error(err);
          wx.showToast({
            title: '反馈失败',
            icon: 'error'
          });
        }
      })
    }).catch(error => {
      console.error('上传图片失败', error);
    });
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