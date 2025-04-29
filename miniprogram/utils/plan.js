export function getPlanDetail(planId) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
        name: 'getPlanDetail',
        data: {
          planId: planId
        }
      })
      .then(res => {
        if (res.result && res.result.success) {
          resolve(res.result.data)
        }
      })
      .catch(err => {
        reject(err);
      });
  })
}

export function getDisplayResult(recordType, result) {
  let displayResult = '';
  switch (recordType) {
    case '轮数 + 轮次':
      displayResult = `${result.rounds}+${result.reps}`;
      break;
    case '总时间':
      displayResult = `${formatSeconds(result.time)}`;
      break;
    case '总次数':
      displayResult = `${result.reps}`;
      break;
    case '负重':
      displayResult = `${result.weight}`;
      break;
    case '总卡数':
      displayResult = `${result.calories}`;
      break;
    case '距离':
      displayResult = `${result.distance}`;
      break;
    case '总分':
      displayResult = `${result.score}`;
      break;
    default:
      displayResult = '未知类型';
  }

  const scoreTitles = {
    '轮数 + 轮次': 'Rounds + Reps',
    '总时间': '',
    '总次数': '次',
    '负重': '公斤(kg)',
    '总卡数': '卡(cal)',
    '距离': '米(m)',
    '总分': '分'
  }
  const unit = scoreTitles[recordType]

  return {
    displayResult,
    unit
  };
}

export function formatSeconds(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}