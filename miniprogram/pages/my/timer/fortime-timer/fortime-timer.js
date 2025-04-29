Page({
  data: {
    selectedTime: '10',
    showTimePickerPopup: false,
    timeColumns: [],
  },

  onLoad() {
    this.initTimeColumns();
  },

  initTimeColumns() {
    const timeColumns = ['No time cap'];
    for (let i = 120; i < 6000; i += 60) {
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
    console.log(e);
    this.setData({
      selectedTime: e.detail.value == 'No time cap' ? 'none' : this.convertToDisplayFormat(e.detail.value),
      showTimePickerPopup: false
    });
  },

  convertToDisplayFormat(time) {
    // console.log('convertToDisplayFormat', time);
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

  // convertToMilliseconds(time) {
  //   const [minutes, seconds] = time.split(':').map(Number);
  //   return (minutes * 60 + seconds) * 1000;
  // },

  startTimer() {
    const {
      selectedTime
    } = this.data;
    console.log('selectedTime', selectedTime);

    const totalMinutes = selectedTime == 'none' ? 0 : parseInt(selectedTime) * 60 * 1000;
    console.log('totalTime', totalMinutes);

    wx.navigateTo({
      url: `/pages/my/timer/fortime-timer/fortime-start/fortime-start?totalMinutes=${totalMinutes}`,
    })
  }
});