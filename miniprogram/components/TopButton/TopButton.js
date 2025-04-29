Component({
  methods: {
    scrollToTop() {
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 300
      });
    }
  }
});
