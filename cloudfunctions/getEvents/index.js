const cloud = require('wx-server-sdk');
cloud.init()
const db = cloud.database();

exports.main = async (event, context) => {
  const {
    year,
    type
  } = event;

  try {
    let query = db.collection('events').where({
      checked: true
    });

    if (year) {
      query = query.where({
        date: db.RegExp({
          regexp: `^${year}`,
          options: 'i'
        })
      });
    }

    if (type) {
      query = query.where({
        type
      });
    }

    const result = await query.orderBy('date', 'desc').get();

    return {
      success: true,
      data: result.data
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: '查询失败',
      error: e
    };
  }
};