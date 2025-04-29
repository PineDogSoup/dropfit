const cloud = require('wx-server-sdk');

cloud.init()

const db = cloud.database();

exports.main = async (event, context) => {
  const {
    _id
  } = event;

  try {
    const result = await db.collection('games').aggregate()
      .match({
        _id
      })
      .lookup({
        from: 'event_detail',
        localField: '_id',
        foreignField: 'eventId',
        as: 'detail'
      })
      .lookup({
        from: 'official_info',
        localField: 'officialId',
        foreignField: '_id',
        as: 'officialInfo'
      })
      .end();

    if (result.list.length > 0) {
      return {
        success: true,
        data: result.list[0]
      };
    } else {
      return {
        success: false,
        message: '未找到相关赛事信息'
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