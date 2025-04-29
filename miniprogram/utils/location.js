const QQMapWX = require('./qqmap-wx-jssdk.js');
const qqmapsdk = new QQMapWX({
  key: 'H4GBZ-FUDKZ-EVUXD-TQBNU-MWJYV-LXFWY'
});
const CITY_CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24小时
const SUPPORTED_CITY_CACHE_EXPIRY_TIME = 2 * 60 * 60 * 1000; // 2小时
const LOCATION_CACHE_EXPIRY_TIME = 12 * 60 * 60 * 1000; // 12小时

export function getUserAddressInfo() {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        console.log(res);
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: (res) => {
            resolve(res.result.ad_info)
          },
          fail: err => {
            reject(err)
          }
        });
      },
    });
  })
}

export function getUserAddressInfoByLocation(latitude, longitude) {
  return new Promise((resolve, reject) => {
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: (res) => {
        resolve(res.result.ad_info)
      },
      fail: err => {
        reject(err)
      }
    });
  })
}

export function getUserLocation() {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        console.log('getUserLocation', res);
        cacheLocation(res)
        resolve(res)
      },
      fail: err => {
        reject(err)
      }
    })
  })
}

export function reverseGeocode(location) {
  return new Promise((resolve, reject) => {
    qqmapsdk.reverseGeocoder({
      location,
      success: (res) => {
        console.log('reverseGeocode', res);
        const city = res.result.ad_info.city
        cacheCity(city);
        resolve(city)
      },
      fail: err => {
        reject(err)
      }
    });
  })
};

export function reverseAddressInfo(location) {
  return new Promise((resolve, reject) => {
    qqmapsdk.reverseGeocoder({
      location,
      success: (res) => {
        resolve(res.result)
      },
      fail: err => {
        reject(err)
      }
    });
  })
};

export function getCachedLocation() {
  const cachedLocation = wx.getStorageSync('cachedLocation');
  const cachedLocationExpire = wx.getStorageSync('cachedLocationExpire');

  // cachedLocation.latitude = 25.65128
  // cachedLocation.longitude = 100.1818

  if (cachedLocation && cachedLocationExpire && new Date().getTime() < cachedLocationExpire) {
    return cachedLocation;
  }
  return null;
}

export function cacheLocation(location) {
  const expireTime = new Date().getTime() + LOCATION_CACHE_EXPIRY_TIME;
  wx.setStorageSync('cachedLocation', location);
  wx.setStorageSync('cachedLocationExpire', expireTime);
};

export function getCachedCity() {
  const cachedCity = wx.getStorageSync('cachedCity');
  const cachedCityExpire = wx.getStorageSync('cachedCityExpire');
  if (cachedCity && cachedCityExpire && new Date().getTime() < cachedCityExpire) {
    return cachedCity;
  }
  return null;
};

export function cacheCity(city) {
  const expireTime = new Date().getTime() + CITY_CACHE_EXPIRY_TIME;
  wx.setStorageSync('cachedCity', city);
  wx.setStorageSync('cachedCityExpire', expireTime);
};

export function formatCityEnglish(city) {
  const cities = wx.getStorageSync('cities')
  const item = cities.find(item => item.zh === city);
  return item ? item.en : '';
}

export function getCachedSupportedCities() {
  const cachedSupportedCities = wx.getStorageSync('cachedSupportedCities');
  const cachedSupportedCitiesExpire = wx.getStorageSync('cachedSupportedCitiesExpire');
  if (cachedSupportedCities && cachedSupportedCitiesExpire && new Date().getTime() < cachedSupportedCitiesExpire) {
    return cachedSupportedCities;
  }
  return null;
};

export function cacheSupportedCities(supportedCities) {
  const expireTime = new Date().getTime() + SUPPORTED_CITY_CACHE_EXPIRY_TIME;
  wx.setStorageSync('cachedSupportedCities', supportedCities);
  wx.setStorageSync('cachedSupportedCitiesExpire', expireTime);
};

export function getSupportedCities() {
  return new Promise((resolve, reject) => {
    const supportedCities = getCachedSupportedCities()
    if (supportedCities != null) {
      console.log('use cached supported city');
      resolve(supportedCities)
    } else {
      console.log('ready to get new supported city');
      wx.cloud.callFunction({
        name: 'getCities',
        success: (res) => {
          if (res.result.success) {
            wx.setStorageSync('cities', res.result.data)
            cacheSupportedCities(res.result.data)
            resolve(res.result.data)
          } else {
            wx.showToast({
              title: '检索失败',
              icon: 'none'
            });
          }
        },
        fail: (e) => {
          console.log(e);
        }
      });
    }
  })
}

export function getAddressInfo() {
  return new Promise((resolve, reject) => {
    getUserLocation().then(location => {
      reverseAddressInfo(location).then(addrInfo => {
        resolve({
          location,
          addrInfo
        })
      })
    })
  })
}

export function getUserLocationAndCity() {
  return new Promise((resolve, reject) => {
    const cachedLocation = getCachedLocation()
    if (cachedLocation != null) {
      const cachedCity = getCachedCity()
      // console.log('No need to update user location', cachedCity, cachedLocation);
      resolve({
        location: cachedLocation,
        city: cachedCity
      })
    } else {
      console.log('Need to update user new location');
      getUserLocation().then(location => {
          // console.log('getUserLocation before reverseGeocode', location);
          reverseGeocode(location).then(city => {
            resolve({
              location,
              city
            })
          })
        })
        .catch(err => {
          console.error('获取用户位置失败', err);
          wx.showToast({
            title: '获取用户位置失败',
            icon: 'error'
          });
        });
    }
  })
}

export function searchLocations(region, keyword) {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        qqmapsdk.getSuggestion({
          keyword,
          region,
          success: (res) => {
            var sug = [];
            for (var i = 0; i < res.data.length; i++) {
              sug.push({ // 获取返回结果，放到sug数组中
                title: res.data[i].title,
                id: res.data[i].id,
                addr: res.data[i].address,
                city: res.data[i].city,
                district: res.data[i].district,
                latitude: res.data[i].location.lat,
                longitude: res.data[i].location.lng
              });
            }
            resolve(sug)
          },
          fail: err => {
            reject(err)
          }
        });
      },
    });
  })
}