Page({
  data: {
    selectedRounds: '5',
    selectedTime: '01:40',
    selectedRest: '00:20',
    totalTime: '00:00',
    showRoundsPickerPopup: false,
    showRestPickerPopup: false,
    showTimerTypePickerPopup: false,
    timeColumns: [],
    roundsColumns: [],
    restColumns: [],
  },

  onLoad() {
    this.initRoundsColumns();
    this.initTimeColumns();
    this.initRestColumns();
    this.calculateTotalTime();
  },

  initRoundsColumns() {
    const roundsColumns = [];
    for (let i = 1; i <= 100; i += 1) {
      roundsColumns.push(i);
    }

    this.setData({
      roundsColumns
    });
  },

  initTimeColumns() {
    const timeColumns = [];

    // Work time: 0s to 30s (increments of 1s)
    for (let i = 5; i <= 30; i++) {
      timeColumns.push(this.formatTime(i));
    }

    // Work time: 30s to 60s (increments of 5s)
    for (let i = 35; i <= 60; i += 5) {
      timeColumns.push(this.formatTime(i));
    }

    // Work time: 1 minute to 3 minutes (increments of 10s)
    for (let i = 70; i <= 180; i += 10) {
      timeColumns.push(this.formatTime(i));
    }

    // Work time: 3 minutes to 7 minutes (increments of 15s)
    for (let i = 195; i <= 420; i += 15) {
      timeColumns.push(this.formatTime(i));
    }

    // Work time: 7 minutes to 10 minutes (increments of 30s)
    for (let i = 450; i <= 600; i += 30) {
      timeColumns.push(this.formatTime(i));
    }

    // Work time: 10 minutes to 15 minutes (increments of 1 minute)
    for (let i = 660; i <= 900; i += 60) {
      timeColumns.push(this.formatTime(i));
    }

    this.setData({
      timeColumns
    });
  },

  initRestColumns() {
    const restColumns = [];

    // Rest time: 0s to 30s (increments of 1s)
    for (let i = 0; i <= 30; i++) {
      restColumns.push(this.formatTime(i));
    }

    // Rest time: 30s to 60s (increments of 5s)
    for (let i = 35; i <= 60; i += 5) {
      restColumns.push(this.formatTime(i));
    }

    // Rest time: 1 minute to 3 minutes (increments of 10s)
    for (let i = 70; i <= 180; i += 10) {
      restColumns.push(this.formatTime(i));
    }

    // Rest time: 3 minutes to 7 minutes (increments of 15s)
    for (let i = 195; i <= 420; i += 15) {
      restColumns.push(this.formatTime(i));
    }

    // Rest time: 7 minutes to 10 minutes (increments of 30s)
    for (let i = 450; i <= 600; i += 30) {
      restColumns.push(this.formatTime(i));
    }

    // Rest time: 10 minutes to 5 minutes (increments of 1 minute)
    for (let i = 660; i <= 900; i += 60) {
      restColumns.push(this.formatTime(i));
    }

    this.setData({
      restColumns
    });
  },

  onPickerCancel() {
    this.setData({
      showTimePickerPopup: false,
      showRoundsPickerPopup: false,
      showRestPickerPopup: false
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
  showRoundsPicker() {
    this.setData({
      showRoundsPickerPopup: true
    });
  },
  showRestPicker() {
    this.setData({
      showRestPickerPopup: true
    });
  },

  onRoundsConfirm(e) {
    this.setData({
      selectedRounds: this.data.roundsColumns[e.detail.index],
      showRoundsPickerPopup: false
    }, this.calculateTotalTime);
  },

  onTimeConfirm(e) {
    this.setData({
      selectedTime: this.convertToDisplayFormat(e.detail.value),
      showTimePickerPopup: false
    }, this.calculateTotalTime);
  },

  onRestConfirm(e) {
    this.setData({
      selectedRest: this.convertToDisplayFormat(e.detail.value),
      showRestPickerPopup: false
    }, this.calculateTotalTime);
  },

  convertToDisplayFormat(time) {
    if (time.includes('minutes')) {
      if (time.includes(':')) {
        const [minutes, seconds] = time.split(' ')[0].split(':');
        return `${this.padZero(parseInt(minutes, 10))}:${this.padZero(parseInt(seconds, 10))}`;
      } else {
        const minutes = parseInt(time.split(' ')[0], 10);
        return `${this.padZero(minutes)}:00`;
      }
    } else if (time.includes('seconds')) {
      const seconds = parseInt(time.split(' ')[0], 10);
      return `00:${this.padZero(seconds)}`;
    } else {
      return time;
    }
  },

  calculateTotalTime() {
    const {
      selectedRounds,
      selectedTime,
      selectedRest
    } = this.data;
    const workTimeMs = this.convertToMilliseconds(selectedTime);
    const restTimeMs = this.convertToMilliseconds(selectedRest);
    const totalTimeMs = (workTimeMs + restTimeMs) * parseInt(selectedRounds, 10);

    const totalMinutes = Math.floor(totalTimeMs / 60000);
    const totalSeconds = Math.floor((totalTimeMs % 60000) / 1000);

    this.setData({
      totalTime: `${this.padZero(totalMinutes)}:${this.padZero(totalSeconds)}`
    });
  },

  convertToMilliseconds(time) {
    const [minutes, seconds] = time.split(':').map(Number);
    return (minutes * 60 + seconds) * 1000;
  },

  startTimer() {
    const {
      selectedRounds,
      selectedTime,
      selectedRest
    } = this.data;
    const workTimeMs = this.convertToMilliseconds(selectedTime);
    const restTimeMs = this.convertToMilliseconds(selectedRest);

    wx.navigateTo({
      url: `/pages/my/timer/tabata-timer/tabata-start/tabata-start?totalRounds=${selectedRounds}&trainingTime=${workTimeMs}&restTime=${restTimeMs}`,
    })
  }
});