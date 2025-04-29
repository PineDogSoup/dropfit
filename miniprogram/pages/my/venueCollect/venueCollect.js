import {
  uploadImage
} from "../../../utils/common.js"

Page({

  /**
   * 页面的初始数据
   */

  data: {
    result: [],
    logoImage: [],
    introImages: [],
    address: '',
    location: null
  },

  onLoad() {

  },

  chooseImage(type) {
    const _that = this;
    const maxCount = type === 'logo' ? 1 : 3 - this.data.introImages.length;

    wx.chooseMedia({
      count: maxCount,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      maxDuration: 30,
      camera: 'back',
      success(res) {
        if (type === 'logo') {
          _that.setData({
            logoImage: res.tempFiles
          });
        } else {
          _that.setData({
            introImages: _that.data.introImages.concat(res.tempFiles)
          });
        }
      }
    });
  },

  chooseLogoImage() {
    this.chooseImage('logo');
  },

  afterReadLogo(e) {
    const {
      file
    } = e.detail;
    this.setData({
      logoImage: [file]
    });
  },

  afterReadIntro(event) {
    const {
      file
    } = event.detail;
    this.setData({
      introImages: this.data.introImages.concat(file)
    });
  },

  chooseIntroImages() {
    this.chooseImage('intro');
  },

  onDeleteLogoImage(e) {
    this.setData({
      logoImage: []
    });
  },

  onDeleteIntroImage(e) {
    const index = e.detail.index;
    const introImages = this.data.introImages;
    introImages.splice(index, 1);
    this.setData({
      introImages
    });
  },

  chooseLocation() {
    const _that = this;
    wx.chooseLocation({
      success(res) {
        _that.setData({
          address: res.address,
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          }
        });
      },
      fail(err) {
        console.log(err);
      }
    });
  },

  onSubmit(e) {
    const logoTempFiles = this.data.logoImage;
    if (logoTempFiles.length !== 1) {
      wx.showToast({
        title: '至少上传一张Logo图片',
        icon: 'none'
      });
      return;
    }

    const introTempFiles = this.data.introImages;
    if (introTempFiles.length !== 3) {
      wx.showToast({
        title: '必须上传三张场馆图片',
        icon: 'none'
      });
      return;
    }

    if (!this.data.location) {
      wx.showToast({
        title: '必须选择场馆位置',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '提交中...',
      mask: true
    })

    const formData = e.detail.value;
    formData.location = {
      type: 'Point',
      coordinates: [this.data.location.longitude, this.data.location.latitude]
    };
    formData.address = this.data.address;

    uploadImage({
      prefix: "venue-logo",
      filePath: logoTempFiles[0].tempFilePath
    }).then(res => {
      formData.logo = res;
      Promise.all(introTempFiles.map(file => {
        return uploadImage({
          prefix: "venue-intro",
          filePath: file.tempFilePath
        })
      })).then(introImageUrls => {
        formData.images = introImageUrls;
        // console.log('formData', formData);
        wx.cloud.callFunction({
          name: "addVenueCollectRecord",
          data: formData,
        }).then(res => {
          if (res.result.success) {
            wx.showToast({
              title: '提交成功',
              icon: 'success'
            });
            wx.reLaunch({
              url: '/pages/my/collectHistory/collectHistory',
            })
          } else {
            wx.showToast({
              title: '提交失败',
              icon: 'error'
            });
          }
        }).catch(err => {
          console.error('提交失败', err);
          wx.showToast({
            title: '提交失败',
            icon: 'error'
          });
        });
      })
    })
  },

  onChange(e) {
    this.setData({
      result: e.detail,
    });
  },

  onClassChange(e) {
    this.setData({
      classes: e.detail
    })
  },
});