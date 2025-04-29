import {
  formatCityEnglish
} from "./location.js"
import {
  formatDistance
} from "./common.js"

export function getVenues(latitude, longitude, city, limit = 100, offset = 0) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'getVenuesByLocation',
      data: {
        latitude,
        longitude,
        city: formatCityEnglish(city),
        limit,
        offset
      },
      success: (res) => {
        if (res.result.success) {
          const venues = res.result.data
          venues.forEach(v => {
            v.distance = formatDistance(v.distance)
          })
          resolve(venues)
        }
      },
      fail: (e) => {
        reject(e)
      }
    });
  })
}

export function searchVenuesWithTags(latitude, longitude, city, keyword, limit = 10, offset = 0, tags) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'getVenuesByLocation',
      data: {
        latitude,
        longitude,
        city: formatCityEnglish(city),
        keyword,
        limit,
        offset,
        tags
      },
      success: (res) => {
        if (res.result.success) {
          const venues = res.result.data
          venues.forEach(v => {
            v.distance = formatDistance(v.distance)
          })
          resolve(venues)
        }
      },
      fail: (e) => {
        console.log('searchVenuesWithTags failed', e);
        reject(e)
      }
    });
  })
}

export function searchVenuesByCity(latitude, longitude, city, limit = 10, offset = 0) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'getVenuesByCity',
      data: {
        latitude,
        longitude,
        city: formatCityEnglish(city),
        limit,
        offset
      },
      success: (res) => {
        // console.log(res);
        if (res.result.success) {
          resolve(res.result.data)
        }
      },
      fail: (e) => {
        console.log('searchVenuesByCity failed', e);
        reject(e)
      }
    });
  })
}

const facilityMapper = {
  shower: {
    name: '淋浴间',
    icon: '/static/images/icons/shower.png'
  },
  cabinet: {
    name: '柜子',
    icon: '/static/images/icons/cabinet.png'
  },
  water: {
    name: '水',
    icon: '/static/images/icons/water.png'
  },
  toilet: {
    name: '卫生间',
    icon: '/static/images/icons/toilet.png'
  },
  yogaMat: {
    name: '瑜伽垫',
    icon: '/static/images/icons/yoga-mat.png'
  },
  towel: {
    name: '毛巾',
    icon: '/static/images/icons/towel.png'
  },
  parking: {
    name: '停车场',
    icon: '/static/images/icons/parking.png'
  },
  coffee: {
    name: '咖啡',
    icon: '/static/images/icons/coffee.png'
  },
};

export function generateFacilityList(facilityInfo) {
  const facilityList = [];
  if (facilityInfo == null) return facilityList;
  for (let key in facilityInfo) {
    if (facilityInfo[key] && facilityMapper[key]) {
      facilityList.push({
        key: key,
        name: facilityMapper[key].name,
        icon: facilityMapper[key].icon
      });
    }
  }
  return facilityList;
}


const tagsMap = {
  'early': '早课',
  'weightlifting': '举重专项',
  'gymnastics': '体操专项',
  'performance': '运动表现',
  'yoga': '瑜伽',
  'hyrox': 'HYROX',
  'quanli60': '全力60',
  'bootcamp': 'BootCamp'
};

export function generateTagList(venueTags) {
  const tags = [];
  for (let key in venueTags) {
    const tagConfig = tagsMap[key]
    if (venueTags[key] && tagConfig) {
      tags.push(tagConfig)
    }
  }

  return tags;
}