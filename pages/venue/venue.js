import {
  getVenueDetail
} from "../../api/venue.js"

let id;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail: null,
    longitude: "116.453371",
    latitude: "39.912846",
    markers: [{
      id: 0,
      width: 45,
      height: 45,
      latitude:  Number("39.912846"),
      longitude: Number("116.453371"),
      iconPath: '/static/images/icons/marker_icon.png'
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // wx.hideHomeButton();
    id = options.id
    this.getDetail();
    // this.getLocation();
  },

  // getLocation(){
  //   wx.getLocation({
  //     type: 'gcj02',
  //     success(res) {
  //       var latitude = res.latitude; // 当前位置的纬度
  //       var longitude = res.longitude; // 当前位置的经度
  //       console.log(latitude);
  //       console.log(longitude);
  //       this.setData({
  //         latitude: latitude,
  //         longitude: longitude,
  //         markers: [{id: 0, latitude: latitude, longitude: longitude, iconPath: '/static/images/icons/marker_icon.png'}]
  //       })
  //     }
  //   });
  // },


  getDetail() {
    getVenueDetail(
      id
    ).then(res => {
      // console.log(res);
      this.setData({
        detail: res.data.venue
      })
      console.log(this.data.detail);

    })
  },

  clickLocation(e) {
    wx.openLocation({
      longitude: Number("116.453371"),
      latitude: Number("39.912846"),
      scale: 18,
      name: this.data.detail.name,
      address: this.data.detail.address,
      fail: function (e) {
        console.log(e)
      }
    })
  },

  phoneCall(e) {
    console.log(e);
    wx.makePhoneCall({
      phoneNumber: '13530070813',
    })
  },

  wechatCopy(e) {
    wx.setClipboardData({
      data: "我被复制了～",
      success: function (res) {
        wx.showToast({
          title: '微信复制成功',
          icon: 'success',
          duration: 1500
        });
      }
    });
  },

  miniProgramJump(e) {
    console.log(e);
    wx.navigateToMiniProgram({
      appId: "wx83db7e2a10723718"
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
    return {
      title: this.data.detail.name,
      path: "/pages/venue/venue?id=" + this.data.detail.id
    }
  },

  onShareTimeline() {
    return {
      title: this.data.detail.name,
      path: "/pages/venue/venue?id=" + this.data.detail.id
    }
  }
})