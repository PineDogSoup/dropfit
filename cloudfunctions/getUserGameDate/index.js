const cloud = require('wx-server-sdk');

cloud.init()

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    const result = await db.collection('user_game_dates').where({
      openid
    }).get();
    return {
      data: result.data
    }
  } catch (e) {
    return {
      success: false,
      message: '查询失败',
      error: e
    };
  }
};