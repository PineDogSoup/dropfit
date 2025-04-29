import {
  searchLocations
} from "../../../utils/location.js"
import {
  removeCitySuffix
} from "../../../utils/common.js"

Page({
  data: {
    region: '',
    searchResults: [],
    noResult: false,
  },

  onLoad(options) {
    const {
      region,
      keyword
    } = options
    this.setData({
      region,
      value: keyword
    })
  },

  onKeywordInput(e) {
    const keyword = e.detail;

    if (keyword) {
      this.searchLocations(keyword);
    } else {
      this.setData({
        searchResults: [],
        noResult: false
      });
    }
  },

  searchLocations(keyword) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    const that = this;
    const region = this.data.region;
    searchLocations(region, keyword).then(res => {
      that.setData({
        searchResults: res,
        noResult: res.length > 0 ? false : true
      });
      wx.hideLoading();
    })
  },

  onCancel() {
    wx.navigateBack();
  },

  onSelectResult(e) {
    const selectedResult = e.currentTarget.dataset.result;
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2]; // 上一页

    prevPage.setData({
      keyword: selectedResult.title,
      latitude: selectedResult.latitude,
      longitude: selectedResult.longitude,
      selectedCity: removeCitySuffix(selectedResult.city)
    });

    wx.navigateBack();
  }
});