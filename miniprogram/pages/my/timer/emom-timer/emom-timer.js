Page({
  data: {
    selectedTime: '00:15',
    selectedTotal: '00:15',
    isDeathBy: false,
    timerDesc: 'Every 15 seconds for 15 seconds',
    showTimePickerPopup: false,
    showTotalPickerPopup: false,
    timeColumns: [],
    totalColumns: []
  },

  onLoad() {
    this.initTimeColumns();
    this.updateTotalColumns();
  },

  initTimeColumns() {
    const timeColumns = [];

    for (let i = 15; i < 180; i += 15) {
      timeColumns.push(this.formatPopupTime(i));
    }

    for (let i = 180; i < 300; i += 30) {
      timeColumns.push(this.formatPopupTime(i));
    }

    for (let i = 300; i <= 720; i += 60) {
      timeColumns.push(this.formatPopupTime(i));
    }

    this.setData({
      timeColumns
    });
  },

  updateTotalColumns() {
    const timeParts = this.data.selectedTime.split(':');
    const minutes = parseInt(timeParts[0]) * 60 + (timeParts[1] ? parseInt(timeParts[1]) : 0);
    const totalColumns = [];

    for (let i = 1; i * minutes <= 6000; i++) {
      const totalMinutes = i * minutes;
      if (totalMinutes > 6000) break;
      const formattedTime = this.formatPopupTime(totalMinutes);
      totalColumns.push(`${formattedTime} (${i}x)`);
    }

    this.setData({
      totalColumns,
      selectedTotal: totalColumns[0].split(' ')[0]
    });
  },

  onPickerCancel() {
    this.setData({
      showTimePickerPopup: false,
      showTotalPickerPopup: false
    });
  },

  formatPopupTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds > 0) {
      return `${this.padZero(minutes)}:${this.padZero(remainingSeconds)} minutes`;
    } else {
      return `${minutes} minutes`;
    }
  },

  padZero(num) {
    return num < 10 ? `0${num}` : num;
  },

  showTimePicker() {
    this.setData({
      showTimePickerPopup: true
    });
  },

  showTotalPicker() {
    this.setData({
      showTotalPickerPopup: true
    });
  },

  convertToDisplayFormat(time) {
    if (time.includes('minutes')) {
      if (time.includes(':')) {
        const [minutes, seconds] = time.split(' ')[0].split(':');
        return `${this.padZero(parseInt(minutes, 10))}:${this.padZero(parseInt(seconds, 10))}`;
      } else {
        const minutes = parseInt(time.split(' ')[0], 10);
        return `${minutes}`;
      }
    } else if (time.includes('seconds')) {
      const seconds = parseInt(time.split(' ')[0], 10);
      return `00:${this.padZero(seconds)}`;
    } else {
      return time;
    }
  },

  onTimeConfirm(e) {
    let selectedTime = this.convertToDisplayFormat(e.detail.value)
    this.setData({
      selectedTime
    });

    this.updateTotalColumns();
    const formattedTime = this.convertToFormattedTime(selectedTime);
    const formattedTotalTime = this.convertToFormattedTime(this.data.selectedTotal);
    const timerDesc = this.data.isDeathBy ?
      `Every ${formattedTime} as long as possible` :
      `Every ${formattedTime} for ${formattedTotalTime}`;

    this.setData({
      timerDesc,
      showTimePickerPopup: false
    });
  },

  convertToFormattedTime(time) {
    const parts = time.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0]);
      const remainingSeconds = parseInt(parts[1]);
      if (minutes > 0 && remainingSeconds > 0) {
        return `${this.padZero(minutes)}:${this.padZero(remainingSeconds)} minutes`;
      } else if (minutes > 0) {
        return `${minutes} minutes`;
      } else {
        return `${remainingSeconds} seconds`;
      }
    } else {
      const minutes = parseInt(parts[0]);
      return `${minutes} minutes`;
    }
  },

  onTotalConfirm(e) {
    const displayTotalTime = this.convertToDisplayFormat(e.detail.value);
    const formattedTime = this.convertToFormattedTime(this.data.selectedTime);
    const formattedTotalTime = this.convertToFormattedTime(displayTotalTime);
    const timerDesc = this.data.isDeathBy ?
      `Every ${formattedTime} as long as possible` :
      `Every ${formattedTime} for ${formattedTotalTime}`;

    this.setData({
      timerDesc,
      selectedTotal: displayTotalTime,
      showTotalPickerPopup: false
    });
  },

  toggleDeathBy() {
    const isDeathBy = !this.data.isDeathBy;
    const formattedTime = this.convertToFormattedTime(this.data.selectedTime);
    const formattedTotalTime = this.convertToFormattedTime(this.data.selectedTotal);
    const timerDesc = isDeathBy ?
      `Every ${formattedTime} as long as possible` :
      `Every ${formattedTime} for ${formattedTotalTime}`;

    this.setData({
      isDeathBy,
      timerDesc
    });
  },

  convertToMilliseconds(time) {
    const [minutes, seconds] = time.split(':').map(Number);
    if (!seconds) {
      return minutes * 60 * 1000;
    }

    return (minutes * 60 + seconds) * 1000;
  },

  startTimer() {
    const {
      selectedTime,
      selectedTotal,
      isDeathBy
    } = this.data;

    const everyTimeMs = this.convertToMilliseconds(selectedTime);
    const totalTimeMs = this.convertToMilliseconds(selectedTotal);

    wx.navigateTo({
      url: `/pages/my/timer/emom-timer/emom-start/emom-start?everyTimeMs=${everyTimeMs}&totalTimeMs=${totalTimeMs}&isDeathBy=${isDeathBy}`,
    })
  }
});