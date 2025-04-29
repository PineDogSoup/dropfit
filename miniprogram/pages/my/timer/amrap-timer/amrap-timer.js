Page({
  data: {
    selectedTime: '22',
    showTimePickerPopup: false,
    timeColumns: [],
  },

  onLoad() {
    this.initTimeColumns();
  },

  initTimeColumns() {
    const timeColumns = [];
    for (let i = 20; i < 30; i += 10) {
      timeColumns.push(this.formatTime(i));
    }

    for (let i = 30; i < 180; i += 15) {
      timeColumns.push(this.formatTime(i));
    }

    for (let i = 180; i < 300; i += 30) {
      timeColumns.push(this.formatTime(i));
    }

    for (let i = 300; i <= 6000; i += 60) {
      timeColumns.push(this.formatTime(i));
    }

    this.setData({
      timeColumns
    });
  },

  onPickerCancel() {
    this.setData({
      showTimePickerPopup: false
    });
  },

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0 && remainingSeconds > 0) {
      return `${this.padZero(minutes)}:${this.padZero(remainingSeconds)} minutes`;
    } else if (minutes > 0) {
      return `${minutes} minutes`;
    } else {
      return `${remainingSeconds} seconds`;
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

  onTimeConfirm(e) {
    this.setData({
      selectedTime: this.convertToDisplayFormat(e.detail.value),
      showTimePickerPopup: false
    });
  },

  convertToDisplayFormat(time) {
    if (time.includes('minutes')) {
      if (time.includes(':')) {
        const [minutes, seconds] = time.split(' ')[0].split(':');
        return `${this.padZero(parseInt(minutes, 10))}:${this.padZero(parseInt(seconds, 10))}`;
      } else {
        const minutes = parseInt(time.split(' ')[0], 10);
        return `${this.padZero(minutes)}`;
        // return `${this.padZero(minutes)}:00`;
      }
    } else if (time.includes('seconds')) {
      const seconds = parseInt(time.split(' ')[0], 10);
      return `00:${this.padZero(seconds)}`;
    } else {
      return time;
    }
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
    } = this.data;
    // console.log('selectedTime', selectedTime);
    const workTimeMs = this.convertToMilliseconds(selectedTime);

    // console.log('workTimeMs', workTimeMs);
    wx.navigateTo({
      url: `/pages/my/timer/amrap-timer/amrap-start/amrap-start?totalMinutes=${workTimeMs}`,
    })
  }
});