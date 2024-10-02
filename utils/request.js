const baseURL = 'http://127.0.0.1:8080/api/v1';

export function request(params) {

  let dataObj = params.data || {};
  let headerObj = {
    'content-type': 'application/json'
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: baseURL + params.uri,
      method: params.method || "GET",
      data: dataObj,
      header: headerObj,
      success: res => {
        if (res.data.code != 0) {
          reject(res.data);
          wx.showToast({
            title: res.data.message,
            mask: true,
            icon: "error"
          })
          return;
        }
        resolve(res.data)
      },
      fail: err => {
        reject(err)
      }
    })
  })
}