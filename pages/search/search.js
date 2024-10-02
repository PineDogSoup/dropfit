import { queryVenuesByPage,getCategoryList } from "../../api/venue.js"
import { generateDistance } from "../../utils/common.js"

Page({

  data: {
    active: 0,
    loading: false,
    loadFinished: false,
    currentOffset: 0,
    venues: [],
    categories: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    this.getCategoryList();
    this.getVenuesData();
  },

  getVenuesData() {
    this.setData({
      loading: true
    })
    queryVenuesByPage({
      limit: 6,
      offset: this.data.currentOffset
    }).then(res => {
      console.log(res);
      if(res.data.total==0){
        this.setData({
          loading: false,
          loadFinished: true
        })
        return
      }

      let oldVenues = this.data.venues;
      let updatedVeneus = res.data.venues.map(item => {
        return {
          ...item,
          distance: generateDistance()
        };
      });
      let newVenus = oldVenues.concat(updatedVeneus);
      this.setData({
        venues: newVenus,
        loading: false
      })
    })
    wx.hideLoading();
  },

  getCategoryList() {
    getCategoryList().then(res=>{
      this.setData({
        categories: res.data.categories
      })
      this.selectComponent("#categoryTabs").resize()
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
    if (this.data.loadFinished) return;
    let targetOffset = this.data.currentOffset + 1;
    this.setData({
      currentOffset: targetOffset
    });
    this.getVenuesData();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})