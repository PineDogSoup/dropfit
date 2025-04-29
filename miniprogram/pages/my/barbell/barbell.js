// 小程序页面逻辑
Page({
  data: {
    categories: []
  },

  onLoad() {
    this.loadCategories();
  },

  async loadCategories() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getCategoriesAndSubcategories',
        data: {}
      });
      if (res.result.success) {
        // console.log(res.result.data);
        this.setData({
          categories: res.result.data
        });
      }
    } catch (e) {
      console.error(e);
    }
  },
  navigateToSubcategory(event) {
    const subcategoryId = event.currentTarget.dataset.id;
    const subcategoryName = event.currentTarget.dataset.name;
    wx.navigateTo({
      url: `/pages/my/barbell/prDetail/prDetail?subcategoryId=${subcategoryId}&subcategoryName=${subcategoryName}`
    });
  }
});