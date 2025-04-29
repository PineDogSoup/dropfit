Component({
  data: {
    capsuleStyle: '',
    imageStyle: '',
    statusBarHeight: 0,
    isDarkMode: false,
    canGoBack: false
  },
  lifetimes: {
    attached() {
      const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
      const systemInfo = wx.getSystemInfoSync();
      const statusBarHeight = systemInfo.statusBarHeight;
      const capsuleStyle = `
        top: ${menuButtonInfo.top}px;
        left: ${systemInfo.windowWidth - menuButtonInfo.right}px;
        height: ${menuButtonInfo.height}px;
      `;
      const imageSize = menuButtonInfo.height - 16;
      const imageStyle = `
        width: ${imageSize}px;
        height: ${imageSize}px;
      `;

      const isDarkMode = wx.getSystemInfoSync().theme === 'dark';

      // 检查是否可以返回上一页
      const pages = getCurrentPages();
      const canGoBack = pages.length > 1;

      // 调整胶囊宽度
      const capsuleWidth = canGoBack ? menuButtonInfo.width : menuButtonInfo.width / 2 - 5;

      this.setData({
        capsuleStyle: capsuleStyle + `width: ${capsuleWidth}px;`,
        imageStyle,
        statusBarHeight,
        isDarkMode,
        canGoBack
      });
    }
  },
  methods: {
    onBack() {
      if (this.data.canGoBack) {
        wx.navigateBack();
      }
    },
    onHome() {
      wx.reLaunch({
        url: '/pages/index/index'
      });
    }
  }
});