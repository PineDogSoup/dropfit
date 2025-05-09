import {
  searchVenuesWithTags
} from "../../../utils/venues.js"
import {
  getUserLocationAndCity
} from "../../../utils/location.js"
import {
  generateMenu
} from "../../../utils/menu.js"
import { CITY_LOCATIONS } from '../../../utils/city-locations.js'

Page({
  data: {
    showIconSize: 0,
    searchInput: '',
    searchIconUrl: "",
    isMap: false,
    venues: [],
    markers: [],
    location: null,
    selectedCity: '',
    showVenueCard: false,
    markerTapped: false,
    selectedVenue: {},
    mapOrigin: null,
    keyword: '',
    offset: 0,
    limit: 10,
    hasMore: true,
    classOption: [],
    isDataLoaded: false,
    shouldRefresh: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    this.setSearchInputStyle();
    this.setSearchView();
    this.setMenu();

    this.setData({
      keyword: options.keyword,
      searchInput: options.keyword ? options.keyword : ''
    })
    this.getLocationAndLoadVenues();
  },

  getLocationAndLoadVenues() {
    getUserLocationAndCity().then(res => {
      const selectedCity = wx.getStorageSync('selectedCity');
      this.setData({
        location: res.location,
        selectedCity,
        isDataLoaded: true
      })
      this.loadVenues();
    });
  },

  setSearchInputStyle() {
    const capsuleInfo = wx.getMenuButtonBoundingClientRect();
    const showIconSize = capsuleInfo.height - 8
    this.setData({
      showIconSize,
    });
  },

  setSearchView() {
    this.setData({
      searchIconUrl: this.data.isMap ? "/static/images/icons/wan_map.png" : "/static/images/icons/switch.png",
      isMap: !this.data.isMap
    })
  },

  setMenu() {
    const {
      venueOption,
      classOption
    } = generateMenu();

    const updatedClassOption = classOption.map(option => {
      option.selected = false;
      return option;
    });
    this.setData({
      venueOption,
      classOption: updatedClassOption
    });
  },

  onClickNav(e) {
    this.setData({
      mainActiveIndex: e.detail.index
    });
  },

  onClickItem(e) {
    const {
      activeId
    } = this.data;
    const {
      id
    } = e.detail;
    const index = activeId.indexOf(id);
    if (index > -1) {
      activeId.splice(index, 1);
    } else {
      activeId.push(id);
    }
    this.setData({
      activeId
    });
  },

  toggleDropdown() {
    this.setData({
      dropdownOpen: !this.data.dropdownOpen
    });
  },

  onClassOptionTap(e) {
    const value = e.currentTarget.dataset.value;
    const updatedOptions = this.data.classOption.map((item) => ({
      ...item,
      selected: item.value === value ? !item.selected : item.selected,
    }));
    this.setData({
      classOption: updatedOptions
    });
  },

  onMenuClear() {
    this.setData({
      activeId: [],
      selectedTags: [],
      offset: 0,
      venues: [],
      hasMore: true,
      classOption: this.data.classOption.map(option => {
        option.selected = false;
        return option;
      })
    });
    this.updateSelectedTags();
    this.loadVenues();
    this.closeDropdownMenu();
  },

  onMenuConfirm() {
    this.setData({
      selectedTags: this.data.activeId,
      offset: 0,
      venues: [],
      hasMore: true
    });
    this.updateSelectedTags();
    this.loadVenues();
    this.closeDropdownMenu();
  },

  updateSelectedTags() {
    this.setData({
      selectedTags: this.data.classOption
        .filter(option => option.selected)
        .map(option => option.value)
    });
  },

  closeDropdownMenu() {
    this.selectComponent('#item').toggle(); // 使用 Vant 的 toggle 方法关闭下拉菜单
  },

  generateMarkers(venues) {
    const markers = venues.map((v, id) => {
      return {
        id,
        width: 40,
        height: 40,
        latitude: v.location.coordinates[1],
        longitude: v.location.coordinates[0],
        iconPath: '/static/images/icons/marker_icon.png',
        title: v.name
      };
    })

    // 优先用城市中心
    let mapOrigin = null;
    const { selectedCity, location } = this.data;
    if (selectedCity) {
      const city = CITY_LOCATIONS.find(c => c.zh === selectedCity);
      if (city) {
        mapOrigin = {
          latitude: city.latitude,
          longitude: city.longitude
        };
      }
    }
    // 若未找到城市中心，则用原有逻辑
    if (!mapOrigin) {
      if (markers.length > 0) {
        mapOrigin = {
          latitude: markers[0].latitude,
          longitude: markers[0].longitude
        };
      } else if (location) {
        mapOrigin = location;
      }
    }

    this.setData({
      markers,
      mapOrigin
    })
  },

  onSearchConfirm(e) {
    this.setData({
      keyword: e.detail,
      offset: 0,
      venues: [],
      hasMore: true
    });
    this.loadVenues();
  },

  onSearchClear() {
    this.setData({
      keyword: '',
      offset: 0,
      venues: [],
      hasMore: true
    });
    this.loadVenues();
  },

  loadVenues() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    const {
      location,
      selectedCity,
      keyword,
      limit,
      offset,
      selectedTags
    } = this.data;

    searchVenuesWithTags(location.latitude, location.longitude, selectedCity, keyword, limit, offset, selectedTags).then(res => {
      const totalVeneus = this.data.venues.concat(res)
      this.setData({
        venues: totalVeneus,
        offset: this.data.offset + res.length,
        hasMore: res.length === limit
      });

      this.generateMarkers(totalVeneus)
      wx.hideLoading();
    })
  },

  onMarkerTap(e) {
    const selectedVenue = this.data.venues[e.markerId]
    if (selectedVenue) {
      this.setData({
        showVenueCard: true,
        selectedVenue,
        markerTapped: true,
      });
    }
  },

  onMapTap() {
    if (this.data.markerTapped) {
      // 如果是标记触发的点击事件，则重置标记并不做其他操作
      this.setData({
        markerTapped: false,
      });
    } else {
      // 如果是地图的其他位置触发的点击事件，则隐藏场馆信息卡片
      this.setData({
        showVenueCard: false,
        selectedVenue: {},
      });
    }
  },

  toggleCitySelect() {
    wx.navigateTo({
      url: '/pages/index/cities/cities',
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  onVenueCardTap() {
    console.log('场馆详情页,不需要刷新');
    this.setData({
      shouldRefresh: false
    });
  },

  onShow() {
    if (this.data.isDataLoaded && this.data.shouldRefresh) {
      console.log('index search onshow');
      this.setData({
        keyword: '',
        searchInput: '',
        offset: 0,
        venues: [],
        hasMore: true
      });

      this.getLocationAndLoadVenues();
    }

    this.setData({
      shouldRefresh: true
    });
  },

  onReachBottom() {
    if (this.data.hasMore) {
      this.loadVenues();
    } else {
      wx.showToast({
        title: '没有更多咯',
        icon: 'none'
      })
    }
  },
})