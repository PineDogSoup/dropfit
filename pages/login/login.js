// login.js
Page({
  onGetUserInfo(e) {
    if (e.detail.userInfo) {
      // 用户同意授权
      wx.login({
        success: (res) => {
          console.log(res);
          console.log(e.detail.userInfo);
          if (res.code) {
            return
            console.log(res);
            // 发送 res.code 到后台换取 openId, sessionKey, unionId
            wx.request({
              url: 'https://your-backend-api.com/login',
              method: 'POST',
              data: {
                code: res.code,
                userInfo: e.detail.userInfo
              },
              success: (response) => {
                if (response.data.success) {
                  wx.setStorageSync('userInfo', response.data.userInfo);
                  wx.setStorageSync('token', response.data.token);
                  wx.showToast({
                    title: '登录成功',
                    icon: 'success'
                  });
                  wx.redirectTo({
                    url: '/pages/my/my'
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
      // 用户拒绝授权
      wx.showToast({
        title: '授权失败',
        icon: 'none'
      });
    }
  }
});