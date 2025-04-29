// 距离格式化
export function formatDistance(distance) {
  distance = Math.floor(distance);
  return distance < 100 ?
    "<100m" :
    distance < 1000 ?
    distance + "m" :
    (distance / 1000).toFixed(1) + "km"
}

export function removeCitySuffix(addr) {
  if (addr.indexOf("市") != -1) {
    addr = addr.substring(0, addr.length - 1)
    return addr
  } else if (addr == "大理白族自治州") {
    return "大理"
  }
}

export function uploadImage(params) {
  return new Promise((resolve, reject) => {
    const cloudPath = `${params.prefix}/${Date.now()}-${Math.floor(Math.random(0, 1) * 1000)}.png`;
    wx.cloud.uploadFile({
      cloudPath,
      filePath: params.filePath,
      success: res => {
        console.log('上传成功', res);
        resolve(res.fileID);
      },
      fail: err => {
        console.error('上传失败', err);
        reject(err);
      }
    });
  });
}

export function formatTimestampDate(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}/${month}/${day}`
}

export function formatTimestampDateTime(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds} `;
}

export function getDayOfWeek(timestamp) {
  const date = new Date(timestamp);
  const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return days[date.getDay()];
}

export function timestampToHourMinute(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}