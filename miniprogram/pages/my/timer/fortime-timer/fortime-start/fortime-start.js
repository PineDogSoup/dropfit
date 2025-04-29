Page({
  data: {
    tapText: 'Tap to start',
    totalTime: 0,
    targetTime: 0,
    formattedTotalTime: '',
    currentTimeUsed: '00:00',
    isRunning: false,
    countdown: 3,
    intervalId: null,
    value: 0,
    showCountdown: false,
    showTotalTime: false,
    showGo: false,
    buttonIcon: 'fortime-start.png',
    soundEnabled: true,
    intervalId: null,
    dingAudio: null,
    dengAudio: null,
    incrementCount: 0,
    hasFinished: false,
    isNone: false,
    circleFlag: false
  },

  onLoad(options) {
    if (options.totalMinutes == 0) {
      this.setData({
        isNone: true,
        targetTime: 100 * 60 * 1000
      })
    } else {
      const targetTime = parseInt(options.totalMinutes)
      this.setData({
        targetTime,
        formattedTotalTime: this.formatDescTime(targetTime),
      })
    }

    this.updateProgress();
  },

  onUnload() {
    console.log('开始清除声音');
    clearInterval(this.data.intervalId);
    this.stopAllAudio();
  },

  toggleTimer() {
    if (this.data.hasFinished) {
      this.setData({
        value: 0,
        countdown: 3,
        workstate: true,
        hasFinished: false,
        currentTimeUsed: '00:00',
        incrementCount: 0,
        totalTime: 0
      });
      this.startCountdown();
    } else {
      if (this.data.countdown > 1) {
        this.startCountdown();
      } else {
        this.startTotalTime();
      }
    }
  },

  startCountdown() {
    this.setData({
      isRunning: true,
      showCountdown: true,
      tapText: ''
    });

    this.data.intervalId = setInterval(() => {
      if (this.data.countdown > 1) {
        this.setData({
          countdown: this.data.countdown - 1
        });
      } else {
        this.setData({
          tapText: '',
          showCountdown: false,
          showGo: true
        });
        clearInterval(this.data.intervalId);
        setTimeout(() => {
          this.setData({
            showGo: false
          });
          this.startTotalTime();
        }, 1000);
      }
    }, 1000);
  },

  startTotalTime() {
    this.setData({
      isRunning: true,
      showTotalTime: true,
      tapText: 'Tap to pause'
    });

    this.data.intervalId = setInterval(() => {
      if (this.data.totalTime < this.data.targetTime) {
        const newTotalTime = this.data.totalTime + 100;
        this.setData({
          totalTime: newTotalTime,
        });
        this.updateProgress();
      } else {
        this.endTimer();
      }
    }, 100);
  },

  pauseTimer() {
    clearInterval(this.data.intervalId);
    this.setData({
      isRunning: false,
      tapText: 'Tap to resume',
      buttonIcon: 'fortime-start.png'
    });
  },

  updateProgress() {
    if (this.data.showTotalTime) {
      let elapsedRoundTime;
      if (this.data.isNone) {
        const roundDuration = 60000;
        if (this.data.totalTime % roundDuration === 0) {
          this.setData({
            circleFlag: !this.data.circleFlag
          })
        }
        elapsedRoundTime = this.data.totalTime % roundDuration / roundDuration * 100;
      } else {
        elapsedRoundTime = this.data.totalTime / this.data.targetTime * 100
        const left = this.data.targetTime - this.data.totalTime;
        if (left === 3000 || left === 2000 || left === 1000) {
          this.playDeng();
        }
        if (left === 0) {
          this.playDing();
        }
      }

      this.setData({
        currentTimeUsed: this.formatTime(this.data.totalTime),
        value: elapsedRoundTime
      });
    }
  },

  formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${this.padZero(minutes)}:${this.padZero(remainingSeconds)}`;
  },

  formatDescTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    if (remainingSeconds == 0) {
      return `${this.padZero(minutes)} minutes`;
    } else if (minutes == 0) {
      return `${this.padZero(remainingSeconds)} seconds`;
    } else {
      return `${this.padZero(minutes)}:${this.padZero(remainingSeconds)}`;
    }
  },

  padZero(num) {
    return num < 10 ? `0${num}` : num;
  },

  endTimer() {
    clearInterval(this.data.intervalId);
    console.log('endTimer', this.data);
    this.setData({
      isRunning: false,
      hasFinished: true,
      totalTime: 0,
      tapText: 'Tap to restart',
      value: 100,
      showTotalTime: false,
      showCountdown: false,
      showGo: false,
      buttonIcon: 'fortime-restart.png'
    });
  },

  toggleSound(e) {
    console.log(e);
    this.setData({
      soundEnabled: !this.data.soundEnabled,
    });
  },

  playDing() {
    if (this.data.soundEnabled) {
      if (this.dingAudio) {
        this.dingAudio.destroy();
      }
      this.dingAudio = wx.createInnerAudioContext();
      this.dingAudio.src = '/static/ding.mp3';
      this.dingAudio.play();
    }
  },

  playDeng() {
    if (this.data.soundEnabled) {
      if (this.dengAudio) {
        this.dengAudio.destroy();
      }
      this.dengAudio = wx.createInnerAudioContext();
      this.dengAudio.src = '/static/deng.mp3';
      this.dengAudio.play();
    }
  },

  stopAllAudio() {
    if (this.dingAudio) {
      this.dingAudio.destroy();
      this.dingAudio = null;
    }
    if (this.dengAudio) {
      this.dengAudio.destroy();
      this.dengAudio = null;
    }
  },

  incrementCount() {
    if (this.data.isRunning) {
      this.setData({
        incrementCount: this.data.incrementCount + 1
      });
    }
  },

  onFinishTap() {
    clearInterval(this.data.intervalId);
    this.setData({
      isRunning: false,
      tapText: 'Tap to restart',
      value: 100,
      hasFinished: true,
      showTotalTime: false,
      showCountdown: false,
      showGo: false,
      buttonIcon: 'fortime-restart.png'
    });
  },
});