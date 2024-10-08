import {
  request
} from "../utils/request"

export function loginByPhone(data) {
  return request({
    uri: "/user",
    method: "POST",
    data
  })
}

export function updateUserInfo(data) {
  return request({
    uri: "/user",
    method: "PUT",
    data
  })
}

export function getLoginCode() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => {
        resolve(res.code)
      },
      fail: err => {
        reject(err)
      }
    })
  })
}