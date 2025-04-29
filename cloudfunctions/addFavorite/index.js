
const cloud = require('wx-server-sdk');

cloud.init()

const db = cloud.database();

exports.main = async (event, context) => {
  const { openid, venueId } = event;
  try {
    await db.collection('favorites').add({
      data: {
        openid,
        venueId
      }
    });
    return {
      success: true,
      message: '收藏成功'
    };
  } catch (error) {
    return {
      success: false,
      message: '收藏失败',
      error
    };
  }
};