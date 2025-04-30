import {
  searchVenuesWithTags
} from "../../../utils/venues.js"
import {
  generateMenu
} from "../../../utils/menu.js"

Page({
  data: {
    showIconSize: 0,
    searchInput: '',
    searchIconUrl: '',
    isMap: false,
    venues: [],
    markers: [],
    latitude: 0,
    longitude: 0,
    selectedCity: '',
    showVenueCard: false,
    markerTapped: false,
    selectedVenue: {},
    keyword: '',
    offset: 0,
    limit: 10,
    hasMore: true,
    classOption: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    Promise.all([
      new Promise(resolve => { this.setSearchInputStyle(); resolve(); }),
      new Promise(resolve => { this.setSearchView(); resolve(); }),
      new Promise(resolve => { this.setMenu(); resolve(); }),
      new Promise(resolve => { this.setData({
        latitude: parseFloat(options.latitude),
        longitude: parseFloat(options.longitude),
        selectedCity: options.selectedCity
      }); resolve(); }),
      new Promise(resolve => { this.loadVenues(); resolve(); })
    ]);
  },

  setSearchInputStyle() {
    const capsuleInfo = wx.getMenuButtonBoundingClientRect();
    const showIconSize = capsuleInfo.height - 8
    this.setData({
      // navTop: capsuleInfo.top - 10,
      // mapViewX: capsuleInfo.width + 15,
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
    const userMarker = {
      id: 'user-marker', // 使用字符串ID来区分用户坐标
      width: 30,
      height: 30,
      latitude: this.data.latitude,
      longitude: this.data.longitude,
      title: '目标位置',
      iconPath: '/static/images/icons/target-marker.png',
      type: 'user'
    };

    const venueMarkers = venues.map((v, id) => {
      return {
        id,
        width: 30,
        height: 30,
        latitude: v.location.coordinates[1],
        longitude: v.location.coordinates[0],
        iconPath: '/static/images/icons/marker_icon.png',
        title: v.name,
        type: 'venue'
      };
    })

    const markers = [userMarker, ...venueMarkers];

    this.setData({
      markers
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
      latitude,
      longitude,
      selectedCity,
      keyword,
      limit,
      offset,
      selectedTags
    } = this.data;

    searchVenuesWithTags(latitude, longitude, selectedCity, keyword, limit, offset, selectedTags).then(res => {
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
    const marker = this.data.markers.find(m => m.id === e.markerId);
    if (marker && marker.type === 'venue') {
      const selectedVenue = this.data.venues[e.markerId];
      if (selectedVenue) {
        this.setData({
          showVenueCard: true,
          selectedVenue,
          markerTapped: true,
        });
      }
    }

    // const selectedVenue = this.data.venues[e.markerId]
    // if (selectedVenue) {
    //   this.setData({
    //     showVenueCard: true,
    //     selectedVenue,
    //     markerTapped: true,
    //   });
    // }
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

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