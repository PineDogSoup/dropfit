export function checkLoginStatus() {
  const userInfo = wx.getStorageSync('userInfo');
  return new Promise((resolve, reject) => {
    if (userInfo) {
      console.log('查到缓存的用户信息');
      resolve({
        isLoggedIn: true,
        userInfo
      });
    } else {
      wx.cloud.callFunction({
        name: 'getUserBasicInfo',
        data: {},
        success: res => {
          if (res.result.exists) {
            const userData = res.result.userData
            console.log('查到用户数据,并缓存');
            wx.setStorageSync('userInfo', userData)
            resolve({
              isLoggedIn: true,
              userInfo: userData
            })
          } else {
            resolve({
              isLoggedIn: false
            })
          }
        },
        fail: err => {
          console.error('Failed to check user exists:', err);
        }
      })
    }
  })
}

export function getUserPhoneNumber(code) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'getUserPhoneNumber',
      data: {
        code
      },
      success: res => {
        const phoneInfo = res.result.data.phoneInfo;
        resolve(phoneInfo.phoneNumber);
      },
      fail: err => {
        console.error('Failed to auth user phone:', err);
        reject('手机鉴权失败');
      }
    })
  })
};

export function userRegistry(phoneNumber) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'userRegistry',
      data: {
        phoneNumber
      },
      success: res => {
        wx.showToast({
          title: '登录成功',
          icon: 'success',
        });
        resolve(true);
      },
      fail: err => {
        console.error('Failed to registry user:', err);
        reject('注册失败');
      }
    })
  })
};