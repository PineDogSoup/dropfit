import {
  formatTimestampDate
} from "../../../../utils/common.js"

// 计算杠铃片分配
function getBarbellPlates(weight, barType) {
  // 杠铃重量
  const barWeight = barType === 'male' ? 20 : 15;
  // 片规格
  const plates = [25, 20, 15, 10, 5, 2.5, 2, 1.5, 1, 0.5];
  let total = Math.round(weight); // 四舍五入
  let remain = total - barWeight;
  if (remain < 0) remain = 0;
  let singleSide = remain / 2;
  const result = {};
  plates.forEach(p => result[p] = 0);
  for (let i = 0; i < plates.length; i++) {
    const plate = plates[i];
    let count = Math.floor(singleSide / plate);
    if (count > 0) {
      result[plate] = count * 2; // 成对分配
      singleSide -= count * plate;
    }
  }
  // 若有余数，补最小片对
  if (singleSide > 0) {
    const minPlate = plates[plates.length - 1];
    const pairCount = Math.ceil(singleSide / minPlate);
    result[minPlate] += pairCount * 2;
  }
  return result;
}

Page({
  data: {
    repMax: '', // 输入的REP MAX
    percentages: [105, 100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30], // 百分比数组
    weights: {}, // 计算后的重量
    units: ['KG', 'LB'], // 重量单位
    currentUnit: 'KG', // 当前选择的单位
    showPicker: false, // 控制单位选择器显示
    historyPR: {},
    subcategoryId: "",
    selectedPercents: [], // 新增，选中的百分比
    barType: 'male', // 新增，杠铃类型，默认男杠
    platesMap: {}, // 新增，百分比-杠铃片分配映射
    platesListMap: {}, // 新增，百分比-杠铃片分配数组
    platesOrder: [25, 20, 15, 10, 5, 2.5, 2, 1.5, 1, 0.5] // 固定片重顺序
  },

  onLoad(options) {
    const subcategoryId = options.subcategoryId;
    const actionName = options.subcategoryName;
    wx.setNavigationBarTitle({
      title: actionName
    });

    this.setData({
      subcategoryId,
      actionName
    })

    this.getCacheRecord()
  },

  onRecordTap() {
    const cachePr = wx.getStorageSync(this.generateRecordCacheKey());
    if (cachePr) {
      const repMax = cachePr.repMax;
      const weights = this.calculateWeights(repMax, cachePr.unit);
      this.setData({
        repMax,
        weights,
        currentUnit: cachePr.unit
      });
    }
  },

  getCacheRecord() {
    const cachePr = wx.getStorageSync(this.generateRecordCacheKey());
    // console.log("cachePr", cachePr);
    if (cachePr) {
      this.setData({
        historyPR: {
          date: cachePr.date,
          repMax: cachePr.repMax,
          unit: cachePr.unit
        }
      })
    }
  },

  updateRecord(repMax) {
    const time = new Date();
    const datetime = formatTimestampDate(time.getTime());
    const historyPR = {
      date: datetime,
      repMax: repMax,
      unit: this.data.currentUnit
    };

    wx.setStorageSync(this.generateRecordCacheKey(), historyPR);
    this.setData({
      historyPR
    })
  },

  generateRecordCacheKey() {
    return "subcategory-" + this.data.subcategoryId;
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
    const weights = this.calculateWeights(repMax, this.data.currentUnit);
    // 计算platesMap
    const platesMap = {};
    const platesListMap = {};
    const platesOrder = this.data.platesOrder;
    this.data.selectedPercents.forEach(percent => {
      platesMap[percent] = getBarbellPlates(weights[percent], this.data.barType);
      platesListMap[percent] = platesOrder.map(w => ({ weight: w, count: platesMap[percent][w] || 0 }));
      // console.log(`[分配] 百分比: ${percent}%, 重量: ${weights[percent]}, 杠铃类型: ${this.data.barType}, 分配:`, platesMap[percent]);
    });
    this.setData({
      repMax,
      weights,
      platesMap,
      platesListMap
    });
  },

  // 焦点离开输入框事件
  onRepMaxBlur(e) {
    // console.log('before onRepMaxBlur');
    // console.log('this.data.repMax', this.data.repMax);
    let repMax = this.data.repMax;
    if (this.isValidRepMax(repMax)) {
      // console.log('onRepMaxBlur......');
      repMax = parseFloat(repMax).toFixed(1);
      const weights = this.calculateWeights(repMax, this.data.currentUnit);
      this.setData({
        repMax,
        weights,
      });

      this.updateRecord(repMax)
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
    const weights = this.calculateWeights(repMax, currentUnit);
    // 计算platesMap
    const platesMap = {};
    const platesListMap = {};
    const platesOrder = this.data.platesOrder;
    this.data.selectedPercents.forEach(percent => {
      platesMap[percent] = getBarbellPlates(weights[percent], this.data.barType);
      platesListMap[percent] = platesOrder.map(w => ({ weight: w, count: platesMap[percent][w] || 0 }));
      // console.log(`[分配] 百分比: ${percent}%, 重量: ${weights[percent]}, 杠铃类型: ${this.data.barType}, 分配:`, platesMap[percent]);
    });
    this.setData({
      currentUnit,
      repMax,
      showPicker: false,
      weights,
      platesMap,
      platesListMap
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
  },

  onPercentTap(e) {
    const percent = Number(e.currentTarget.dataset.percent);
    let selectedPercents = this.data.selectedPercents.slice();
    const index = selectedPercents.indexOf(percent);
    if (index > -1) {
      selectedPercents.splice(index, 1);
    } else {
      selectedPercents.push(percent);
    }
    // 降序排列
    selectedPercents.sort((a, b) => b - a);
    // 计算platesMap
    const weights = this.data.weights;
    const platesMap = {};
    const platesListMap = {};
    const platesOrder = this.data.platesOrder;
    selectedPercents.forEach(p => {
      platesMap[p] = getBarbellPlates(weights[p], this.data.barType);
      platesListMap[p] = platesOrder.map(w => ({ weight: w, count: platesMap[p][w] || 0 }));
      // console.log(`[分配] 百分比: ${p}%, 重量: ${weights[p]}, 杠铃类型: ${this.data.barType}, 分配:`, platesMap[p]);
    });
    this.setData({ selectedPercents, platesMap, platesListMap });
  },

  // 新增：切换杠铃类型
  onBarTypeToggle() {
    const newType = this.data.barType === 'male' ? 'female' : 'male';
    // 计算platesMap
    const weights = this.data.weights;
    const platesMap = {};
    const platesListMap = {};
    const platesOrder = this.data.platesOrder;
    this.data.selectedPercents.forEach(percent => {
      platesMap[percent] = getBarbellPlates(weights[percent], newType);
      platesListMap[percent] = platesOrder.map(w => ({ weight: w, count: platesMap[percent][w] || 0 }));
      // console.log(`[分配] 百分比: ${percent}%, 重量: ${weights[percent]}, 杠铃类型: ${newType}, 分配:`, platesMap[percent]);
    });
    this.setData({ barType: newType, platesMap, platesListMap });
  },

  // 获取某百分比的杠铃片分配
  getPlatesForPercent(percent) {
    const weight = this.data.weights[percent];
    if (!weight || weight === '--') return null;
    const result = getBarbellPlates(weight, this.data.barType);
    // console.log(`[分配] 百分比: ${percent}%, 重量: ${weight}, 杠铃类型: ${this.data.barType}, 分配:`, result);
    return result;
  }
});