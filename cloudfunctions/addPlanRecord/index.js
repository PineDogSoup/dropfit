const cloud = require('wx-server-sdk');

cloud.init()

const db = cloud.database();

exports.main = async (event, context) => {
  const {
    date,
    planId,
    planDetailId,
    recordType,
    result,
  } = event;
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const createdAt = new Date().getTime();

  try {
    const res = await db.collection('plan_records').add({
      data: {
        date,
        planId,
        planDetailId,
        recordType,
        result,
        createdAt,
        openid,
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