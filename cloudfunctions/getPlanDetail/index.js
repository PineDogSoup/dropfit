const cloud = require('wx-server-sdk');

cloud.init()

const db = cloud.database();

exports.main = async (event, context) => {
  const {
    planId
  } = event;

  try {
    const result = await db.collection('plan_detail').where({
      planId
    }).get();
    if (result.data.length > 0) {
      return {
        success: true,
        data: result.data[0]
      };
    } else {
      return {
        success: false
      };
    }
  } catch (e) {
    return {
      success: false,
      message: '查询失败',
      error: e
    };
  }
};