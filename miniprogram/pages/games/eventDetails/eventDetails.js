import {
  formatTimestampDate,
  formatTimestampDateTime
} from "../../../utils/common.js"

Page({
  data: {
    time: 0,
    timeData: {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    },
    detail: {},
    official: {},
    isRegisterDisabled: true,
  },

  onLoad(options) {
    const eventId = options.id;
    this.getEventDetail(eventId)
  },

  getEventDetail(eventId) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    wx.cloud.callFunction({
      name: 'getEventDetail',
      data: {
        _id: eventId
      },
      success: res => {
        // console.log(res);
        const data = res.result.data
        this.setData({
          image: data.image,
          eventDate: data.eventDate,
          status: data.status,
          title: data.title,
          detail: res.result.data.detail[0],
          official: res.result.data.officialInfo[0]
        })
        this.calculateCountdown()
        this.setFormatedTime()
        wx.hideLoading()
      },
      fail: err => {
        console.error('Failed to get event detail:', err);
      }
    });
  },

  calculateCountdown() {
    const targetTime = this.data.eventDate;
    const currentTime = new Date().getTime();
    const timeDifference = targetTime - currentTime;

    if (timeDifference <= 0) {
      this.setData({
        time: 0
      })
    } else {
      this.setData({
        time: timeDifference
      });
    }
  },

  setFormatedTime() {
    const {
      registryDate,
      registryEndDate,
    } = this.data.detail
    const eventDate = this.data.eventDate
    let registryTime = '暂无'
    if (registryDate && registryEndDate) {
      registryTime = `${formatTimestampDateTime(registryDate)} - ${formatTimestampDateTime(registryEndDate)}`;
    }
    this.setData({
      registryTime,
      eventTime: eventDate ? formatTimestampDate(eventDate) : '暂无',
    })
  },

  handleRegister() {
    const {
      registryLink
    } = this.data.detail

    if (registryLink) {
      wx.navigateToMiniProgram({
        shortLink: registryLink
      })
    } else {
      wx.showToast({
        title: '暂无报名链接',
        icon: 'none'
      })
    }
  },

  navigateToOfficial() {
    const mini = this.data.official.mini
    if (mini)
      wx.navigateToMiniProgram({
        appId: mini
      })
  },

  onShareAppMessage() {
    return {
      title: this.data.detail.name,
      path: "/pages/games/eventDetails/eventDetails?id=" + this.data.detail.eventId
    }
  },

  onShareTimeline() {
    return {
      title: this.data.detail.name,
      path: "/pages/games/eventDetails/eventDetails?id=" + this.data.detail.eventId
    }
  }
});