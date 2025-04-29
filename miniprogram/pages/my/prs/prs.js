Page({
  data: {
    repMax: '', // 输入的REP MAX
    percentages: [105, 100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30], // 百分比数组
    weights: {}, // 计算后的重量
    units: ['KG', 'LB'], // 重量单位
    currentUnit: 'KG', // 当前选择的单位
    showPicker: false, // 控制单位选择器显示
    historyPRs: [{
      value: '100KG',
      date: '12-12'
    }, {
      value: '200LB',
      date: '12-10'
    }]
  },

  // 输入事件
  onRepMaxChange(e) {
    console.log('onRepMaxChange', e);
    let repMax = e.detail;
    if (this.isValidRepMax(repMax)) {
      this.setData({
        repMax,
        errorMessage: ''
      });
    } else {
      this.setData({
        errorMessage: '最多一位小数'
      });
    }
  },

  onRepMaxInput(event) {
    const repMax = event.detail.value;
    console.log('onRepMaxInput', repMax);
    this.setData({
      repMax,
      // weights: this.calculateWeights(repMax, this.data.currentUnit)
    });
  },

  // 焦点离开输入框事件
  onRepMaxBlur(e) {
    console.log('before onRepMaxBlur');
    console.log('this.data.repMax', this.data.repMax);
    let repMax = this.data.repMax;
    if (this.isValidRepMax(repMax)) {
      console.log('onRepMaxBlur......');
      repMax = parseFloat(repMax).toFixed(1);
      this.setData({
        repMax,
        weights: this.calculateWeights(repMax, this.data.currentUnit)
      });
    }
  },

  // 显示单位选择器
  showPicker() {
    this.setData({
      showPicker: true
    });
  },

  // 关闭单位选择器
  onPickerClose() {
    this.setData({
      showPicker: false
    });
  },

  // 单位选择事件
  onUnitChange(event) {
    const currentUnit = this.data.units[event.detail.index];
    let repMax = this.data.repMax;

    if (repMax && this.isValidRepMax(repMax)) {
      repMax = this.convertUnit(repMax, this.data.currentUnit, currentUnit);
      repMax = parseFloat(repMax).toFixed(1);
    }

    this.setData({
      currentUnit,
      repMax,
      showPicker: false,
      weights: this.calculateWeights(repMax, currentUnit)
    });
  },

  // 计算不同百分比的重量
  calculateWeights(repMax, unit) {
    const weights = {};
    this.data.percentages.forEach(percent => {
      weights[percent] = repMax ?
        (repMax * percent / 100).toFixed(1) :
        '--';
    });
    console.log('calculateWeights', weights);
    return weights;
  },

  // 单位转换
  convertUnit(value, fromUnit, toUnit) {
    const conversionFactor = 2.20462;
    if (fromUnit === 'KG' && toUnit === 'LB') {
      return (value * conversionFactor).toFixed(1);
    } else if (fromUnit === 'LB' && toUnit === 'KG') {
      return (value / conversionFactor).toFixed(1);
    }
    return value;
  },

  // 验证REP MAX输入值
  isValidRepMax(value) {
    const regex = /^\d+(\.\d{0,1})?$/;
    return regex.test(value);
  }
});