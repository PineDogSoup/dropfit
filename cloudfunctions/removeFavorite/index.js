// 云函数 getNearbyVenues
const cloud = require('wx-server-sdk');

// cloud.init({
//   env: 'dropfit-7gmp4k48b5923cbc'
// })
cloud.init()

const db = cloud.database();

exports.main = async (event, context) => {
  const {
    openid,
    venueId
  } = event;

  try {
    await db.collection('favorites').where({
      openid,
      venueId
    }).remove();
    return {
      success: true,
      message: '取消收藏成功'
    };
  } catch (error) {
    return {
      success: false,
      message: '取消收藏失败',
      error
    };
  }
};