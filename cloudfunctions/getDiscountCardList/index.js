const cloud = require('../getDiscountCardsLatest/node_modules/wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  try {
    const result = await db.collection('discount_cards').where({
      checked: true
    }).get()
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