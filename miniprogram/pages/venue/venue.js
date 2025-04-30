import {
  generateFacilityList,
  generateTagList
} from "../../utils/venues.js"
import {
  checkLoginStatus,
  getUserPhoneNumber,
  userRegistry
} from "../../utils/user.js"

Page({

  /**
   * 页面的初始数据
   */
  data: {
    venueId: '',
    detail: null,
    bookingInfo: null,
    mediaInfo: null,
    markers: [],
    tags: [],
    facilityList: [],
    isFavorite: false,
    isDropped: false,
    capsuleCenterY: 0,
    favoriteViewX: 0,
    favoriteViewY: 0,
    venueInfoTopY: 0,
    favoriteIconSize: 0,
    currentImage: '',
    currentIndex: 0,
    recommendCount: 0,
    showLoginPopup: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    checkLoginStatus().then(isLoggedIn => {
      if (isLoggedIn) {
        this.setNavigateStyle();
        this.setData({
          venueId: options.id
        })
        Promise.all([
          new Promise(resolve => this.getVenueDetail(options.id, resolve)),
          new Promise(resolve => this.checkIfFavorite(options.id, resolve)),
          new Promise(resolve => this.checkIfDropped(options.id, resolve))
        ]).then(() => {
          wx.hideLoading();
        });
      } else {
        wx.hideLoading()
        this.setData({
          showLoginPopup: true
        });
      }
    })
  },

  handleLogin(e) {
    console.log('onGetPhoneNumber', e);
    const {
      code,
      errMsg
    } = e.detail;
    if (errMsg === 'getPhoneNumber:ok') {
      getUserPhoneNumber(code).then(phoneNumber => {
        userRegistry(phoneNumber).then(success => {
          console.log('用户手机注册成功');
          this.setData({
            showLoginPopup: false
          });
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          });
          this.onLoad(this.options);
        })
      })
    } else {
      console.log('get phone error', errno);
    }
  },

  handleCancel() {
    wx.reLaunch({
      url: '/pages/index/index'
    });
  },

  getVenueDetail(venueId, resolve) {
    wx.cloud.callFunction({
      name: 'getVenueDetail',
      data: {
        venueId
      },
      success: (res) => {
        if (res.result.success) {
          const detail = res.result.data
          const location = detail.location
          // 首屏只set主图、名称、地址、主marker
          this.setData({
            detail: {
              name: detail.name,
              address: detail.address,
              logo: detail.logo,
              description: detail.description
            },
            currentImage: detail.images[0],
            markers: [{
              id: 0,
              width: 45,
              height: 45,
              latitude: location.coordinates[1],
              longitude: location.coordinates[0],
              iconPath: '/static/images/icons/marker_icon.png'
            }],
          }, () => {
            // 其余数据异步setData
            setTimeout(() => {
              const tags = detail.tags ? generateTagList(detail.tags[0]) : []
              const mediaInfo = detail.mediaInfo[0] ? detail.mediaInfo[0] : { 'xhs': '', 'wideo': '' }
              const facilityList = generateFacilityList(detail.facilityInfo[0])
              this.setData({
                facilityList,
                mediaInfo,
                tags,
                bookingInfo: detail.bookingInfo[0],
                images: this.fillImages(detail.images),
                recommendCount: detail.recommendCount || 0
              });
            }, 0);
            if (resolve) resolve();
          });
        } else {
          wx.showToast({
            title: '检索失败',
            icon: 'none'
          });
          if (resolve) resolve();
        }
      },
      fail: (e) => {
        console.log(e);
        if (resolve) resolve();
      }
    });
  },

  fillImages(images) {
    const filledImages = [];
    const length = images.length;

    for (let i = 0; i < 6; i++) {
      filledImages.push(images[i % length]);
    }

    return filledImages;
  },

  clickLocation(e) {
    wx.openLocation({
      longitude: e.detail.longitude,
      latitude: e.detail.latitude,
      scale: 18,
      name: this.data.detail.name,
      address: this.data.detail.address,
      fail: function (e) {
        console.log(e)
      }
    })
  },

  // Booking
  clickPhone(e) {
    var phone = this.data.bookingInfo.phone
    if (phone) {
      wx.makePhoneCall({
        phoneNumber: phone,
      })
    } else {
      wx.showToast({
        title: '该场馆暂未登记电话',
        icon: 'none'
      })
    }
  },

  clickSubscribe(e) {
    var gzh = this.data.bookingInfo.gzh
    if (gzh) {
      wx.setClipboardData({
        data: gzh,
        success: function (res) {
          wx.showToast({
            title: '公众号复制成功',
            icon: 'none',
            duration: 1500
          });
        }
      })
    } else {
      wx.showToast({
        title: '该场馆暂未登记公众号',
        icon: 'none'
      })
    }
  },

  clickService(e) {
    var wxInfo = this.data.bookingInfo.wx
    if (wxInfo) {
      wx.setClipboardData({
        data: wxInfo,
        success: function (res) {
          wx.showToast({
            title: '客服微信复制成功',
            icon: 'none',
            duration: 1500
          });
        }
      })
    } else {
      wx.showToast({
        title: '该场馆暂未登记客服微信',
        icon: 'none'
      })
    }
  },

  clickDzdp() {
    var dzdp = this.data.bookingInfo.dzdp
    if (dzdp) {
      wx.navigateToMiniProgram({
        shortLink: dzdp
      })
    } else {
      wx.showToast({
        title: '该场馆暂未登记大众点评',
        icon: 'none'
      })
    }
  },

  clickApp(e) {
    var mini = this.data.bookingInfo.mini
    var iwodLink = this.data.bookingInfo.iwodLink
    // mini = "wx001f4f9bd5402fce"
    if (mini) {
      wx.navigateToMiniProgram({
        appId: mini
      })
    } else if (iwodLink) {
      wx.navigateToMiniProgram({
        shortLink: iwodLink
      })
    } else {
      wx.showToast({
        title: '该场馆暂未登记小程序',
        icon: 'none'
      })
    }
  },

  clickDy(e) {
    wx.showToast({
      title: `该场馆暂未登记抖音`,
      icon: 'none'
    });
  },

  clickXhs(e) {
    var xhs = this.data.mediaInfo.xhs
    if (xhs) {
      wx.navigateToMiniProgram({
        shortLink: xhs
      })
    } else {
      wx.showToast({
        title: '该场馆暂未登记小红书',
        icon: 'none'
      })
    }
  },

  clickWideo(e) {
    var finderUserName = this.data.mediaInfo.wideo;
    // finderUserName = 'sph8wtVk0fnZ93W'
    if (finderUserName) {
      wx.openChannelsUserProfile({
        finderUserName
      });
    } else {
      wx.showToast({
        title: '该场馆暂未登记视频号',
        icon: 'none'
      });
    }
  },

  // Favorite
  checkIfFavorite(venueId, resolve) {
    const openid = wx.getStorageSync('openid');
    wx.cloud.callFunction({
      name: 'getUserFavorites',
      data: {
        openid
      }
    }).then(res => {
      const favorites = res.result.data;
      const isFavorite = favorites.some(fav => fav._id === venueId);
      this.setData({
        isFavorite
      }, () => { if (resolve) resolve(); });
    }).catch(err => {
      console.error('检查收藏状态失败', err);
      if (resolve) resolve();
    });
  },

  toggleFavorite() {
    const openid = wx.getStorageSync('openid');
    const venueId = this.data.venueId;
    const isFavorite = this.data.isFavorite;
    const functionName = isFavorite ? 'removeFavorite' : 'addFavorite';

    wx.cloud.callFunction({
      name: functionName,
      data: {
        openid,
        venueId
      }
    }).then(res => {
      if (res.result.success) {
        this.setData({
          isFavorite: !isFavorite
        });
        wx.showToast({
          title: res.result.message,
          icon: 'success'
        });
      } else {
        wx.showToast({
          title: res.result.message,
          icon: 'error'
        });
      }
    }).catch(err => {
      console.error(isFavorite ? '取消收藏失败' : '收藏失败', err);
      wx.showToast({
        title: isFavorite ? '取消收藏失败' : '收藏失败',
        icon: 'error'
      });
    });
  },

  // 评价
  toggleComment() {
    wx.showToast({
      title: '程序🐒努力开发中',
      icon: 'none'
    })
  },

  // Dropped
  checkIfDropped(venueId, resolve) {
    const openid = wx.getStorageSync('openid');
    wx.cloud.callFunction({
      name: 'getUserDropped',
      data: {
        openid
      }
    }).then(res => {
      const droplist = res.result.data;
      const isDropped = droplist.some(dr => dr._id === venueId);
      this.setData({
        isDropped
      }, () => { if (resolve) resolve(); });
    }).catch(err => {
      console.error('检查Drop-In状态失败', err);
      if (resolve) resolve();
    });
  },

  toggleDropped() {
    const openid = wx.getStorageSync('openid');
    const venueId = this.data.venueId;
    const isDropped = this.data.isDropped;
    const functionName = isDropped ? 'removeDropped' : 'addDropped';

    wx.cloud.callFunction({
      name: functionName,
      data: {
        openid,
        venueId
      }
    }).then(res => {
      if (res.result.success) {
        this.setData({
          isDropped: !isDropped
        });
        wx.showToast({
          title: res.result.message,
          icon: 'success'
        });
      } else {
        wx.showToast({
          title: res.result.message,
          icon: 'error'
        });
      }
    }).catch(err => {
      console.error(isFavorite ? 'Cancle Fail' : 'Drop-In Fail', err);
      wx.showToast({
        title: isFavorite ? 'Cancle Fail' : 'Drop-In Fail',
        icon: 'error'
      });
    });
  },

  onRecommendTap() {
    wx.showLoading({
      title: '推荐中...',
      mask: true
    })

    const {
      venueId
    } = this.data;
    wx.cloud.callFunction({
      name: 'getRecommendRecord',
      data: {
        venueId
      }
    }).then(res => {
      // console.log(res);
      if (res.result.data.data.length > 0) {
        wx.showToast({
          title: '您已经推荐过此馆了哦',
          icon: 'none'
        })
      } else {
        wx.cloud.callFunction({
          name: 'addRecommendRecord',
          data: {
            venueId
          }
        }).then(res => {
          // console.log(res);
          if (res.result.success) {
            this.setData({
              recommendCount: this.data.recommendCount + 1,
            })
            wx.showToast({
              title: '推荐成功',
              icon: 'success'
            })
          } else {
            wx.showToast({
              title: '推荐失败',
              icon: 'error'
            })
          }
        })
      }
    }).catch(err => {
      console.error('推荐失败失败', err);
    });
  },

  setNavigateStyle() {
    const capsuleInfo = wx.getMenuButtonBoundingClientRect();
    const capsuleCenterY = capsuleInfo.top + capsuleInfo.height / 2;
    const favoriteIconSize = capsuleInfo.height
    const venueInfoTopY = capsuleInfo.bottom + 10
    this.setData({
      capsuleCenterY: capsuleCenterY + 27,
      favoriteViewX: capsuleInfo.width + 15,
      favoriteViewY: capsuleInfo.top,
      favoriteIconSize,
      venueInfoTopY
    });
  },

  onImageTap(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      currentImage: this.data.images[index],
      currentIndex: index,
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: this.data.detail.name,
      path: "/pages/venue/venue?id=" + this.data.venueId
    }
  },

  onShareTimeline() {
    return {
      title: this.data.detail.name,
      path: "/pages/venue/venue?id=" + this.data.venueId
    }
  }
})