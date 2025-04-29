import {
  formatTimestampDate
} from "../../utils/common.js"

Page({
  data: {
    events: [], // 用于存储查询到的赛事数据
    groupedEvents: [], // 用于存储分组后的赛事数据
    titleTop: '',
    titleSize: '',
    sloganFontSize: 0,
    smallSloganFontSize: 0,
    selectedEventType: 'ALL EVENTS', // 当前选择的赛事类型
    years: [],
    eventTypes: []
  },

  onLoad() {
    this.setTypeMenu();
    this.setTitleStyle();
    this.fetchEvents();
  },

  setTypeMenu() {
    this.setData({
      eventTypes: [{
          text: 'ALL EVENTS',
          value: 'ALL EVENTS'
        },
        {
          text: '全力游戏',
          value: '全力游戏'
        },
        {
          text: 'HYROX',
          value: 'HYROX'
        },
        {
          text: 'XPODIUM',
          value: 'XPODIUM'
        },
        {
          text: '斯巴达勇士',
          value: '斯巴达勇士'
        },
      ]
    })
  },

  setTitleStyle() {
    const capsuleInfo = wx.getMenuButtonBoundingClientRect();
    this.setData({
      titleTop: capsuleInfo.top - 1,
      titleSize: capsuleInfo.height - 7,
      // sloganFontSize: capsuleInfo.height - 12,
      // smallSloganFontSize: capsuleInfo.height - 18,
      containerTop: capsuleInfo.bottom
    });
  },

  fetchEvents() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    const {
      selectedEventType
    } = this.data;

    wx.cloud.callFunction({
      name: 'getGames',
      data: {
        type: selectedEventType === 'ALL EVENTS' ? '' : selectedEventType
      }
    }).then(res => {
      // console.log(res);
      const allEvents = res.result.data;
      this.setData({
        groupedEvents: this.groupEventsByYear(allEvents),
        events: [],
      });
      wx.hideLoading();
    }).catch(err => {
      console.error('查询综合赛事列表失败', err);
    });
  },

  groupEventsByYear(events) {
    let eventsByYear = {};
    events.forEach(event => {
      let year = this.getFormatedYear(formatTimestampDate(event.eventDate));
      // let year = this.getFormatedYear(event.date);
      if (!eventsByYear[year]) {
        eventsByYear[year] = [];
      }
      eventsByYear[year].push(event);
    });

    let groupedEvents = [];
    for (let year in eventsByYear) {
      groupedEvents.push({
        year: year,
        events: eventsByYear[year]
      });
    }

    groupedEvents.sort((a, b) => b.year - a.year);
    return groupedEvents
  },

  // 处理年份选择变化的函数
  // onYearChange(e) {
  //   this.setData({
  //     selectedYear: e.detail
  //   }, () => {
  //     this.fetchEvents();
  //   });
  // },

  // 处理赛事类型选择变化的函数
  onEventTypeChange(e) {
    this.setData({
      selectedEventType: e.detail
    }, () => {
      this.fetchEvents();
    });
  },

  getFormatedYear(date) {
    const [year, day, month] = date.split('/');
    return year
  },
});