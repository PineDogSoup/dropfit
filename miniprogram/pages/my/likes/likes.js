// pages/likes/likes.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: '',
    venues: []
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
      openid: options.openid
    })
    this.loadUserFavorites();
  },

  loadUserFavorites() {
    wx.cloud.callFunction({
      name: 'getUserFavorites',
      data: {
        openid: this.data.openid
      }
    }).then(res => {
      if (res.result.success) {
        console.log('res',res);
        this.setData({
          venues: res.result.data
        });
        wx.hideLoading()
      } else {
        wx.showToast({
          title: res.result.message,
          icon: 'error'
        });
      }
    }).catch(err => {
      console.error('获取收藏列表失败', err);
      wx.showToast({
        title: '获取收藏列表失败',
        icon: 'error'
      });
    });
  },

  switchToHome(e) {
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },
})