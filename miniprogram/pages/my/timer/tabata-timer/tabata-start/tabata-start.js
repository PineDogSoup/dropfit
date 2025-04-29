Page({
  data: {
    currentRound: 1,
    totalRounds: 0,
    tapText: 'Tap to start',
    trainingTime: 0,
    restTime: 0,
    totalTime: 0,
    workstate: true,
    // formattedTotalTime: '',
    currentTimeLeft: '',
    isRunning: false,
    countdown: 3,
    intervalId: null,
    value: 0,
    showCountdown: false,
    showTotalTime: false,
    showGo: false,
    buttonIcon: 'play.png', // 初始按钮图标
    soundEnabled: true, // 声音开关状态
    dingAudio: null,
    dengAudio: null,
  },

  onLoad(options) {
    const totalRounds = parseInt(options.totalRounds)
    const trainingTime = parseInt(options.trainingTime)
    const restTime = parseInt(options.restTime)
    const totalTime = (trainingTime + restTime) * totalRounds
    this.setData({
      totalRounds,
      trainingTime,
      restTime,
      totalTime,
      // formattedTotalTime: this.formatTime(totalTime),
      currentTimeLeft: this.formatTime(trainingTime),
    })
    this.updateProgress();
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
        totalTime: (this.data.trainingTime + this.data.restTime) * this.data.totalRounds
      });
      this.startCountdown();
    } else {
      // console.log('this.data.countdown', this.data.countdown);
      if (this.data.countdown > 1) {
        this.startCountdown();
      } else {
        // this.toggleSound();
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
        const newTotalTime = this.data.totalTime - 100; // 每 100 毫秒减少
        this.setData({
          totalTime: newTotalTime,
          // formattedTotalTime: this.formatTime(newTotalTime)
        });
        this.updateProgress();

      } else {
        this.endTimer();
      }
    }, 100); // 每 100 毫秒更新一次
  },

  pauseTimer() {
    clearInterval(this.data.intervalId);
    this.setData({
      isRunning: false,
      tapText: 'Tap to resume',
      buttonIcon: 'play.png' // 恢复按钮图标
    });
    // this.stopSound();
  },

  // 更新进度条
  updateProgress() {
    if (this.data.showTotalTime) {
      const roundDuration = this.data.trainingTime + this.data.restTime; // 单轮总时长
      const elapsedRoundTime = roundDuration - (this.data.totalTime % roundDuration); // 当前轮已过时间
      let roundProgress;
      let timeLeft;

      if (elapsedRoundTime <= this.data.trainingTime) {
        // 训练时间进度
        roundProgress = (elapsedRoundTime / this.data.trainingTime) * 100;
        timeLeft = this.data.trainingTime - elapsedRoundTime;
      } else {
        // 休息时间进度
        timeLeft = roundDuration - elapsedRoundTime;
        const restElapsedTime = elapsedRoundTime - this.data.trainingTime;
        roundProgress = (restElapsedTime / this.data.restTime) * 100;
        this.setData({
          workstate: false,
        })
      }

      if (timeLeft === 3000 || timeLeft === 2000 || timeLeft === 1000) {
        this.playDeng();
      }

      if (timeLeft === 0) {
        this.playDing();
      }

      // 如果一轮结束，增加轮次
      if (elapsedRoundTime === roundDuration && this.data.totalTime !== 0) {
        this.setData({
          workstate: true,
          currentRound: this.data.currentRound + 1
        });
      }

      this.setData({
        currentTimeLeft: this.formatTime(1000 + timeLeft),
        value: roundProgress
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
      buttonIcon: 'restart.png'
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