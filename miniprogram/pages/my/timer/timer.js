Page({
  data: {

  },

  onLoad() {

  },
  onAmrapTap() {
    wx.navigateTo({
      url: '/pages/my/timer/amrap-timer/amrap-timer',
    })
  },
  onForTimeTap() {
    wx.navigateTo({
      url: '/pages/my/timer/fortime-timer/fortime-timer',
    })
  },
  onEmomTap() {
    wx.navigateTo({
      url: '/pages/my/timer/emom-timer/emom-timer',
    })
  },

  onTabataTap() {
    wx.navigateTo({
      url: '/pages/my/timer/tabata-timer/tabata-timer',
    })
  }
});