var QQMapWX = require('./qqmap-wx-jssdk.js');
var qqmapsdk = new QQMapWX({
  key: 'LXDBZ-QOCKG-N74QJ-QEDGD-M7EQV-OPB7E'
});

export function getUserAddressInfo() {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        console.log(res);
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: (res) => {
            resolve(res.result.ad_info)
          },
          fail: err => {
            reject(err)
          }
        });
      },
    });
  })
}

export function getUserLocation() {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        resolve(res)
      },
      fail: err => {
        reject(err)
      }
    })
  })
}