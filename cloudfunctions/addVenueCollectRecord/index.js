const cloud = require('wx-server-sdk');

cloud.init()

const db = cloud.database();

exports.main = async (event, context) => {
  const {
    // 基本信息
    name,
    city,
    description,
    location,
    // 联系方式
    wx,
    gzh,
    mini,
    phone,
    dzdp,
    // 场馆设备
    water,
    parking,
    cabinet,
    coffee,
    yogaMat,
    toilet,
    address,
    shower,
    towel,
    // 图片
    logo,
    images,
    // 自媒体
    xhs,
    dy,
    wideo,
    // 课表
    early,
    weightlifting,
    gymnastics,
    hyrox,
    performance,
    yoga,
    quanli60,
    bootcamp,
    // 体验卡
    cartType,
    collectionMethod,
    originalPrice,
    currentPrice
  } = event;
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    const res = await db.collection('records').add({
      data: {
        // 基本信息
        openid,
        name,
        description,
        location,
        address,
        city,
        // 图片
        logo,
        images,
        // 联系方式
        wx,
        gzh,
        mini,
        phone,
        dzdp,
        // 场馆设备
        parking,
        cabinet,
        coffee,
        water,
        toilet,
        shower,
        towel,
        yogaMat,
        // 自媒体
        xhs,
        dy,
        wideo,
        // 课表
        early,
        weightlifting,
        gymnastics,
        hyrox,
        performance,
        yoga,
        quanli60,
        bootcamp,
        // 体验卡
        cartType,
        collectionMethod,
        originalPrice,
        currentPrice
      }
    });
    return {
      success: true,
      data: res._id
    };
  } catch (e) {
    return {
      success: false,
      errorMessage: e.message
    };
  }
};