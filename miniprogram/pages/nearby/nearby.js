import {
  getUserLocationAndCity,
  getAddressInfo
} from "../../utils/location.js"
import {
  removeCitySuffix
} from "../../utils/common.js"
import {
  searchVenuesByCity
} from "../../utils/venues.js"

Page({
  data: {
    keyword: '',
    selectedCity: '北京',
    searchTargetTop: 0,
    sloganFontSize: 0,
    smallSloganFontSize: 0,
    sloganHeight: 0,
    longitude: 0,
    latitude: 0,
    offset: 0,
    limit: 10,
    hasMore: true,
    venues: [],
    isDataLoaded: false
  },

  onLoad(options) {
    this.setTopNav();

    getUserLocationAndCity().then(res => {
      // console.log('getUserLocationAndCity', res);

      this.setData({
        selectedCity: removeCitySuffix(res.city),
        latitude: res.location.latitude,
        longitude: res.location.longitude,
        isDataLoaded: true
      })

      // console.log('onLoad在拿数据', this.data.selectedCity);
      this.loadVenues();
    });
  },

  loadVenues() {
    const {
      selectedCity,
      latitude,
      longitude,
      limit,
      offset,
    } = this.data;

    searchVenuesByCity(latitude, longitude, selectedCity, limit, offset).then(res => {
      // console.log('loadVenues', res);
      const totalVeneus = this.data.venues.concat(res)
      this.setData({
        venues: totalVeneus,
        offset: this.data.offset + res.length,
        hasMore: res.length === limit
      });
    })
  },

  setTopNav() {
    const capsuleInfo = wx.getMenuButtonBoundingClientRect();
    this.setData({
      sloganTextTop: capsuleInfo.top,
      sloganFontSize: capsuleInfo.height - 12,
      smallSloganFontSize: capsuleInfo.height - 18,
      sloganHeight: capsuleInfo.bottom + 120,
      searchTargetTop: -110
    });
  },

  onLocateSelect() {
    wx.showLoading({
      title: '定位中...',
      mask: true
    })
    getAddressInfo().then(res => {
      // console.log('onLocateSelect', res);
      // console.log('recommend address', res.addrInfo.formatted_addresses.recommend)
      this.setData({
        selectedCity: removeCitySuffix(res.addrInfo.ad_info.city),
        keyword: res.addrInfo.formatted_addresses.recommend,
        latitude: res.location.latitude,
        longitude: res.location.longitude
      })
      wx.hideLoading()

      // reload venues
      this.setData({
        offset: 0,
        venues: [],
        hasMore: true
      });
      this.loadVenues();
    })
  },

  onCitySelect() {
    wx.navigateTo({
      url: '/pages/nearby/citySelect/citySelect'
    });
  },

  onKeywordSearch() {
    const {
      selectedCity,
      keyword
    } = this.data;
    wx.navigateTo({
      url: `/pages/nearby/keywordSearch/keywordSearch?region=${selectedCity}&keyword=${keyword}`
    });
  },

  onSearchTap(e) {
    // console.log('onSearchTap', e);
    const {
      selectedCity,
      latitude,
      longitude
    } = this.data;

    wx.navigateTo({
      url: `/pages/nearby/searchResult/searchResult?selectedCity=${selectedCity}&latitude=${latitude}&longitude=${longitude}`
    });
  },

  preventInputTap(e) {
    e.stopPropagation();
  },

  onShow() {
    if (this.data.isDataLoaded) {
      this.setData({
        offset: 0,
        venues: [],
        hasMore: true
      });

      // console.log('onShow在拿数据', this.data.selectedCity);
      this.loadVenues();
    }
  },

  onReachBottom() {
    if (this.data.hasMore) {
      this.loadVenues();
    }
  },

  navigateToVenue(e) {
    // console.log('navigateToVenue', e);
    const venueId = e.currentTarget.dataset.id;
    if (venueId) {
      wx.navigateTo({
        url: `/pages/venue/venue?id=${venueId}`,
      })
    }
  }
});