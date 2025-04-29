Page({
  data: {
    currentRound: 1,
    totalRounds: 0,
    tapText: 'Tap to start',
    everyTime: 0,
    totalTime: 0,
    targetTime: 0,
    formattedTotalTime: '',
    elapsedTotalTime: '00:00',
    currentTimeLeft: '',
    isRunning: false,
    countdown: 3,
    intervalId: null,
    value: 0,
    showCountdown: false,
    showTotalTime: false,
    showGo: false,
    buttonIcon: 'emom-start.png',
    soundEnabled: true,
    dingAudio: null,
    dengAudio: null,
    circleFlag: false,
    isDeathBy: false
  },

  onLoad(options) {
    const totalTime = parseInt(options.totalTimeMs)
    const everyTime = parseInt(options.everyTimeMs)
    const isDeathByBool = options.isDeathBy == "true"
    const targetTime = isDeathByBool ? 60 * 100 * 1000 : totalTime
    this.setData({
      targetTime,
      totalRounds: targetTime / everyTime,
      everyTime,
      totalTime: targetTime,
      isDeathBy: isDeathByBool,
      formattedTotalTime: this.formatTime(targetTime),
      currentTimeLeft: this.formatTime(everyTime),
    })
  },

  onUnload() {
    console.log('开始清除声音');
    clearInterval(this.data.intervalId);
    this.stopAllAudio();
  },

  toggleTimer() {
    if (this.data.totalTime == 0) {
      this.setData({
        value: 0,
        currentRound: 1,
        countdown: 3,
        workstate: true,
        totalTime: this.data.everyTime * this.data.totalRounds
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

  // 训练时间或休息时间开始
  startTotalTime() {
    this.setData({
      isRunning: true,
      showTotalTime: true,
      tapText: 'Tap to pause'
    });

    this.data.intervalId = setInterval(() => {
      if (this.data.totalTime > 0) {
        const newTotalTime = this.data.totalTime - 100;
        const formattedTotalTime = this.formatTime(newTotalTime);
        const newElapsedTotalTime = this.data.targetTime - newTotalTime;
        const elapsedTotalTime = this.formatTime(newElapsedTotalTime);
        this.setData({
          totalTime: newTotalTime,
          formattedTotalTime,
          elapsedTotalTime
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
      buttonIcon: 'emom-start.png' // 
    });
  },

  // 更新进度条
  updateProgress() {
    if (this.data.showTotalTime) {
      const roundDuration = this.data.everyTime
      const timeLeft = this.data.totalTime % roundDuration;
      const elapsedRoundTime = roundDuration - timeLeft;
      const round = Math.round((elapsedRoundTime / roundDuration) * 100);

      if (timeLeft === 3000 || timeLeft === 2000 || timeLeft === 1000) {
        this.playDeng();
      }

      if (timeLeft === 0) {
        this.playDing();
        if (this.data.totalTime !== 0) {
          this.setData({
            currentRound: this.data.currentRound + 1,
            circleFlag: !this.data.circleFlag
          });
        }
      }

      this.setData({
        currentTimeLeft: this.formatTime(1000 + timeLeft),
        value: round == 100 ? 0 : round,
      });
    }
  },

  formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${this.padZero(minutes)}:${this.padZero(remainingSeconds)}`;
  },

  padZero(num) {
    return num < 10 ? `0${num}` : num;
  },

  endTimer() {
    clearInterval(this.data.intervalId);
    this.setData({
      isRunning: false,
      tapText: 'Tap to restart',
      value: 100,
      showTotalTime: false,
      showCountdown: false,
      showGo: false,
      buttonIcon: 'emom-restart.png'
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
});