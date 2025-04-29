// pages/my/my.js
import {
  checkLoginStatus,
  getUserPhoneNumber,
  userRegistry
} from "../../utils/user.js"

Page({
  data: {
    isLoggedIn: false,
    userInfo: null,
  },

  onLoad(options) {
    this.getLoginStatus();
  },

  getLoginStatus() {
    console.log('开始检查用户登陆状态');
    checkLoginStatus().then(res => {
      console.log('login status:', res);
      if (res.isLoggedIn) {
        console.log('用户已注册');
        this.setData({
          isLoggedIn: true,
          userInfo: res.userInfo
        });
      } else {
        console.log('没有查到用户的注册信息');
        this.setData({
          loggedIn: false
        });
      }
    })
  },

  onGetMockPhoneNumber() {
    this.userRegistry('13530070813')
    this.checkLoginStatus()
  },

  onGetPhoneNumber(e) {
    const code = e.detail.code
    const errno = e.detail.errno
    if (!errno) {
      console.log('通过用户手机号注册');
      getUserPhoneNumber(code).then(phoneNumber => {
        userRegistry(phoneNumber).then(success => {
          this.getLoginStatus()
        })
      })
    }
  },

  onEditProfileClick() {
    wx.navigateTo({
      url: '/pages/my/editProfile/editProfile',
    })
  },

  likesClick() {
    wx.navigateTo({
      url: '/pages/my/likes/likes',
    })
  },

  onFeedbackClick() {
    wx.navigateTo({
      url: '/pages/my/feedback/feedback-type/feedback-type',
    })
  },

  onDroppedClick() {
    wx.navigateTo({
      url: '/pages/my/dropped/dropped',
    })
  },

  onCollectClick() {
    wx.navigateTo({
      url: '/pages/my/collectHistory/collectHistory',
    })
  },
  onDictClick() {
    wx.navigateTo({
      url: '/pages/my/terminology/terminology',
    })
  },
  onTimerClick() {
    wx.navigateTo({
      url: '/pages/my/timer/timer',
    })
  },
  onPRsClick() {
    wx.navigateTo({
      url: '/pages/my/barbell/barbell'
    })
  },

  onShow() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        userInfo
      })
    }
  },
})