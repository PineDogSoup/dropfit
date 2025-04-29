const cloud = require('wx-server-sdk');

cloud.init()

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const {
    phoneNumber
  } = event;

  try {
    const result = await db.collection("users").add({
      data: {
        openid,
        phoneNumber
      }
    })

    return {
      success: true,
      data: result
    };
  } catch (e) {
    return {
      success: false,
      message: '用户注册失败',
      error: e
    };
  }
};