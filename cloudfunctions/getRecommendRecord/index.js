// 云函数 getNearbyVenues
const cloud = require('wx-server-sdk');

cloud.init()

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const {
    venueId
  } = event;

  try {
    const result = await db.collection('recommend_record').where({
      openid,
      venueId
    }).get();

    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      message: '获取推荐历史失败',
      error
    };
  }
};