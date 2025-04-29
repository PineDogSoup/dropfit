import {
  fetchDiscounts
} from '../../utils/discountCard.js';
import {
  getSupportedCities
} from "../../utils/location.js"

Page({
  data: {
    cityList: [],
    priceOptions: [],
    cardTypeOptions: [],
    sliderValue: [0, 800],
    selectedCardType: '',
    selectedCity: '',
    adList: [],
    tabs: [],
    currentTab: 'highScore',
    offset: 0,
    limit: 10,
    hasMore: true,
    discounts: [],
    filter: {
      priceRange: [0, 800],
      cardType: '',
      city: '',
    }
  },

  onLoad() {
    this.setFilterMenu();
    this.loadDiscounts();
    this.loadDiscountAds();
    this.fetchSupportCities();
  },

  // 加载折扣数据
  loadDiscounts() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });

    const {
      currentTab,
      filter,
      limit,
      offset
    } = this.data;

    // console.log('currentTab', currentTab);
    // console.log('filter', filter);
    fetchDiscounts(currentTab, filter, limit, offset)
      .then(data => {
        // console.log('data', data);
        this.setData({
          discounts: offset === 0 ? data : this.data.discounts.concat(data),
          offset: this.data.offset + data.length,
          hasMore: data.length === limit
        });
        wx.hideLoading();
      })
      .catch(err => {
        console.log(err);
        wx.showToast({
          title: '加载失败，请稍后重试',
          icon: 'none',
        });
      });
  },

  loadDiscountAds() {
    wx.cloud.callFunction({
        name: "getDiscountAds",
        data: {}
      })
      .then(res => {
        if (res.result.success) {
          this.setData({
            adList: this.data.adList.concat(res.result.data)
          })
        }
        // let adList = this.data.adList
        // if (res.result.success) {
        //   const remoteAd = res.result.data
        //   adList = adList.concat(remoteAd)
        // }

        // this.setData({
        //   adList: [...adList, {
        //     type: 'ad'
        //   }]
        // })
      })
  },

  fetchSupportCities() {
    getSupportedCities().then(res => {
      // console.log(res);
      const cityOptions = res.map(city => ({
        text: city.zh,
        value: city.zh
      }));
      this.setData({
        cityList: cityOptions
      });
    })
  },

  // 切换分类
  selectNavItem(e) {
    const {
      id
    } = e.currentTarget.dataset;
    this.setData({
      currentTab: id,
      discounts: [],
      offset: 0,
      hasMore: true,
      sliderValue: [0, 200],
      selectedCardType: '',
      selectedCity: '',
      filter: {
        priceRange: [0, 800],
        cardType: '',
        city: '',
      }
    });

    this.loadDiscounts();
  },

  // 触底加载
  onReachBottom() {
    if (this.data.hasMore) {
      this.loadDiscounts();
    }
  },

  // 动态更新过滤条件
  updateFilter(newFilter) {
    this.setData({
      filter: {
        ...this.data.filter,
        ...newFilter,
      },
      discounts: [],
      offset: 0,
    });
    this.loadDiscounts();
  },

  setFilterMenu() {
    this.setData({
      adList: [{
        imgUrl: '/static/images/horizontal_slogan.jpg'
      }],
      tabs: [{
        id: 'highScore',
        name: '好评高分'
      }, {
        id: 'latest',
        name: '最新折扣'
      }, {
        id: 'newlyPublished',
        name: '最新发布'
      }, {
        id: 'upcoming',
        name: '即将推出'
      }],
      cardTypeOptions: [{
        text: '次卡',
        value: '次卡'
      }, {
        text: '2次卡',
        value: '2次卡'
      }, {
        text: '3次卡',
        value: '3次卡'
      }, {
        text: '5次卡',
        value: '5次卡'
      }, {
        text: '7次卡',
        value: '7次卡'
      }, {
        text: '周卡',
        value: '周卡'
      }, ],
      priceOptions: [{
        text: '50以下',
        value: [0, 50]
      }, {
        text: '50-100',
        value: [50, 100]
      }, {
        text: '100-150',
        value: [100, 150]
      }, {
        text: '150-200',
        value: [150, 200]
      }, {
        text: '200-400',
        value: [200, 400]
      }, {
        text: '400以上',
        value: [400, 800]
      }, ]
    })
  },

  onSliderDrag(e) {
    this.setData({
      sliderValue: e.detail
    });
  },

  onSliderChange(e) {
    this.setData({
      sliderValue: e.detail
    });
  },

  onSelectCardType(e) {
    this.setData({
      selectedCardType: e.currentTarget.dataset.value
    });
  },

  onSelectCity(e) {
    this.setData({
      selectedCity: e.currentTarget.dataset.city
    });
  },

  onClear() {
    const dropdownMenu = this.selectComponent('#dropdown-item');
    dropdownMenu.toggle(false);

    const priceRange = [0, 800];
    const cardType = '';
    const city = '';

    this.setData({
      sliderValue: priceRange,
      selectedCardType: cardType,
      selectedCity: city
    })

    const filter = {
      priceRange,
      cardType,
      city
    };
    this.setFilterAndLoadDiscounts(filter);
  },

  onComplete() {
    // console.log('Selected values:', this.data);
    const {
      sliderValue,
      selectedCardType,
      selectedCity
    } = this.data;

    // 组装过滤条件
    const filter = {
      priceRange: sliderValue,
      cardType: selectedCardType,
      city: selectedCity,
    };

    // 关闭下拉菜单
    const dropdownMenu = this.selectComponent('#dropdown-item');
    dropdownMenu.toggle(false);

    this.setFilterAndLoadDiscounts(filter);
  },

  onCardTypeChange(e) {
    this.setData({
      selectedCardType: e.detail
    });
    let {
      filter
    } = this.data;
    filter.cardType = e.detail;
    this.setFilterAndLoadDiscounts(filter);
  },

  onSelectCityChange(e) {
    this.setData({
      selectedCity: e.detail
    });
    let {
      filter
    } = this.data;
    filter.city = e.detail;
    this.setFilterAndLoadDiscounts(filter);
  },

  onPriceChange(e) {
    this.setData({
      sliderValue: e.detail
    });
    let {
      filter
    } = this.data;
    filter.priceRange = e.detail
    this.setFilterAndLoadDiscounts(filter);
  },

  setFilterAndLoadDiscounts(filter) {
    this.setData({
      discounts: [],
      offset: 0,
      hasMore: true,
      filter
    }, () => {
      this.loadDiscounts(); // 重新加载数据
    });
  },

  onDiscountCardTap(e) {
    const {
      id
    } = e.currentTarget.dataset;

    if (id) {
      wx.navigateTo({
        url: `/pages/venue/venue?id=${id}`,
      })
    }
  },

  onSwiperTap(e) {
    console.log(e);
    if (e.currentTarget.dataset.value.venueId) {
      wx.navigateTo({
        url: `/pages/venue/venue?id=${e.currentTarget.dataset.value.venueId}`,
      })
    }
  },
});