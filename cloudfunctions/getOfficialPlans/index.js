const cloud = require('wx-server-sdk');

cloud.init()

const db = cloud.database();

exports.main = async (event, context) => {
  try {
    const result = await db.collection('official_plans')
      .where({
        checked: true
      })
      .orderBy('title', 'asc')
      .get()
    return {
      success: true,
      data: result.data
    };
  } catch (e) {
    return {
      success: false,
      message: '查询失败',
      error: e
    };
  }
};