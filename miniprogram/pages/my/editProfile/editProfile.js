import {
  uploadImage
} from "../../../utils/common.js"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    avatarUrl: '',
    nickName: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        userInfo
      })
    }
  },

  onChooseAvatar(e) {
    console.log(e);
    const avatarUrl = e.detail.avatarUrl
    console.log('current avatarUrl:', avatarUrl);
    const userInfo = this.data.userInfo
    userInfo.avatarUrl = avatarUrl
    this.setData({
      userInfo,
    })
  },

  getNickName(e) {
    const userInfo = this.data.userInfo
    userInfo.nickName = e.detail.value
    this.setData({
      userInfo
    })
  },

  onConfirm(e) {
    if (!this.data.userInfo.avatarUrl) {
      return wx.showToast({
        title: '请选择头像',
        icon: 'error'
      });
    }

    if (!this.data.userInfo.nickName) {
      return wx.showToast({
        title: '请输入昵称',
        icon: 'error'
      });
    }

    wx.showToast({
      title: '正在更新',
      icon: 'loading'
    });

    const userInfo = this.data.userInfo;
    const openid = wx.getStorageSync('openid');

    if (userInfo.avatarUrl.startsWith('cloud://')) {
      this.updateUserProfile(openid, userInfo);
    } else {
      this.uploadAvatarAndUpdateUser(openid, userInfo);
    }
  },

  uploadAvatarAndUpdateUser(openid, userInfo) {
    const that = this;
    const oldUserInfo = wx.getStorageSync('userInfo')
    const oldAvatarUrl = oldUserInfo.avatarUrl;

    if (oldAvatarUrl != null && oldAvatarUrl.startsWith('cloud://')) {
      wx.cloud.deleteFile({
        fileList: [oldAvatarUrl],
        success: res => {
          console.log('旧头像删除成功', res);
          that.uploadNewAvatarAndUpdateUser(openid, userInfo);
        },
        fail: err => {
          console.error('旧头像删除失败', err);
          wx.showToast({
            title: '旧头像删除失败',
            icon: 'error'
          });
        }
      });
    } else {
      that.uploadNewAvatarAndUpdateUser(openid, userInfo);
    }
  },

  uploadNewAvatarAndUpdateUser(openid, userInfo) {
    const that = this;
    console.log('userInfo.avatarUrl: ', userInfo.avatarUrl);
    uploadImage({
      prefix: 'userAvatars',
      filePath: userInfo.avatarUrl
    }).then(res => {
      console.log('new avatar url', res);
      userInfo.avatarUrl = res;
      that.updateUserProfile(openid, userInfo);
    })
  },

  updateUserProfile(openid, userInfo) {
    wx.cloud.callFunction({
      name: 'updateUserProfile',
      data: {
        openid,
        userInfo
      },
      success: res => {
        wx.setStorageSync('userInfo', userInfo);
        wx.showToast({
          title: '更新成功',
          icon: 'success'
        });
        wx.reLaunch({
          url: '/pages/my/my',
        });
      },
      fail: err => {
        console.error(err);
        wx.showToast({
          title: '更新失败',
          icon: 'error'
        });
      }
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