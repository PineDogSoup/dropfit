const { categories, subcategories } = require('../../../utils/barbellData.js');

// 小程序页面逻辑
Page({
  data: {
    categories: []
  },

  onLoad() {
    this.loadCategories();
  },

  async loadCategories() {
    // 本地组装categories结构
    const categoriesWithSubs = categories.map(category => ({
      ...category,
      subcategories: subcategories.filter(sub => sub.categoryId === category._id)
    }));
    this.setData({ categories: categoriesWithSubs });
  },
  navigateToSubcategory(event) {
    const subcategoryId = event.currentTarget.dataset.id;
    const subcategoryName = event.currentTarget.dataset.name;
    wx.navigateTo({
      url: `/pages/my/barbell/prDetail/prDetail?subcategoryId=${subcategoryId}&subcategoryName=${subcategoryName}`
    });
  },
  onShareAppMessage() {
    return {
      title: '杠铃PR计算器',
      path: '/pages/my/barbell/barbell'
    };
  }
});