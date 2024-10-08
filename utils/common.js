// 距离格式化
export function formatDistance(distance) {
  return distance < 1000 ? distance + "m" : distance / 1000 + "km"
}

export function generateDistance() {
  var random = Math.round(Math.random() * 2000)
  return random < 100 ?
    "<" + random + "m" :
    random < 1000 ?
    random + "m" :
    (random / 1000).toFixed(1) + "km"
}

export function removeCitySuffix(addr) {
  if (addr.indexOf("市") != -1){
    addr = addr.substring(0, addr.length - 1)
    return addr
  }
}