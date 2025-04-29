const cloud = require('wx-server-sdk');

cloud.init()

const db = cloud.database();

exports.main = async (event, context) => {
  const {
    date,
  } = event;
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    const res = await db.collection('user_game_dates').add({
      data: {
        date,
        openid
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