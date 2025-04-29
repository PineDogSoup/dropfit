Component({
  properties: {
    data: {
      type: Object,
      value: {}
    }
  },

  data: {
    discount: '免费',
  },

  observers: {
    'data': function (data) {
      if (data.currentPrice == 0) {
        this.setData({
          discount: '免费'
        });
      } else {
        const discount = Math.round((1 - data.currentPrice / data.originalPrice) * 100);
        this.setData({
          discount: `${discount}%折扣`
        });
      }
    }
  },

  methods: {}
});