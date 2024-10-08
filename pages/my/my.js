// pages/my/my.js

import {
  loginByPhone
} from "../../api/user.js"


Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoggedIn: false,
    userInfo: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const token = wx.getStorageSync('token');
    if (token) {
      this.setData({
        isLoggedIn: true
      });
      this.getUserInfo();
      // this.getFavorites();
    }
  },

  onGetMockPhoneNumber() {
    const encryptedData = 'qROvfnNub7i19a7ZAemQWmPuGGHbXfF/jJVbbACZDABWLTWJa+Z1B9a+JNK9Myyh/Lliy5Y0VNUgK2W1uP6sPTnx85OfoteFivRO5jblkbUFUGPghNTJBMgSfoFovFEPumEclZCzfA17pFduyBrkblRftFFKcZb6f2BXDL3RLl/7P6XsPZQ5Nv977BeQChn1VJ3CJMFsMvbXrVZkQoAyAQ=='
    const iv = ''
    wx.login({
      success: (res) => {
        if (res.code) {
          loginByPhone({
            code: res.code,
            encryptedData: encryptedData,
            iv: iv
          }).then(res => {
            console.log(res);
            wx.setStorageSync('userInfo', res.data.userInfo);
            wx.setStorageSync('token', res.data.token);
            this.setData({
              isLoggedIn: true
            });
            this.getUserInfo();
            wx.showToast({
              title: '登录成功',
              icon: 'success'
            });
          })
        }
      }
    })
  },

  onGetPhoneNumber(e) {
    if (e.detail.encryptedData && e.detail.iv) {
      wx.login({
        success: (res) => {
          console.log(res);
          console.log(e);
          if (res.code) {
            return
            wx.request({
              url: 'https://your-backend-api.com/login',
              method: 'POST',
              data: {
                code: res.code,
                encryptedData: e.detail.encryptedData,
                iv: e.detail.iv
              },
              success: (response) => {
                if (response.data.success) {
                  wx.setStorageSync('userInfo', response.data.userInfo);
                  wx.setStorageSync('token', response.data.token);
                  this.setData({
                    isLoggedIn: true
                  });
                  this.getUserInfo();
                  this.getFavorites();
                  wx.showToast({
                    title: '登录成功',
                    icon: 'success'
                  });
                } else {
                  wx.showToast({
                    title: '登录失败',
                    icon: 'none'
                  });
                }
              }
            });
          } else {
            wx.showToast({
              title: '登录失败',
              icon: 'none'
            });
          }
        }
      });
    } else {
      wx.showToast({
        title: '授权失败',
        icon: 'none'
      });
    }
  },

  getUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    this.setData({
      userInfo
    });
  },

  onLoginClick() {
    console.log('去登录');
    wx.navigateTo({
      url: '/pages/editProfile/editProfile',
    })
  },

  chooseAvatar(e) {
    console.log(e);
    this.setData({
      login: {
        show: true,
        line: true,
        avatar: e.detail.avatarUrl,
      }
    })
  },

  onNameInput(e) {
    this.setData({
      userNewName: e.detail.value
    })
  },

  onNameConfirm() {
    let oldUser = this.data.user;
    let newName = this.data.userNewName;
    if (newName != "") {
      oldUser.name = newName
    }
    this.setData({
      user: oldUser,
      isEditing: !this.data.isEditing
    })
  },

  onNameEdit() {
    this.setData({
      isEditing: !this.data.isEditing
    })
  },

  likesClick() {
    console.log('我的收藏监听');
    if (!this.data.login.show) {
      wx.showToast({
        title: '你还未登录',
        icon: 'none',
        duration: 1500
      })
      return
    }
    wx.navigateTo({
      url: '/pages/likes/likes?id=' + this.data.user.id,
    })
  },

  onFeedbackClick() {
    console.log('匿名反馈监听');
    wx.navigateTo({
      url: '/pages/feedback/feedback-type/feedback-type',
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
    const userInfo = wx.getStorageSync('userInfo')
    this.setData({
      userInfo
    })
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

  },


  // 退出监听
  exitClick() {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确定退出登录吗？',
      success(res) {
        if (res.confirm) {
          that.setData({
            login: {
              show: false,
              avatar: 'https://img0.baidu.com/it/u=3204281136,1911957924&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
            }
          })
        }
      }
    })
  }
})