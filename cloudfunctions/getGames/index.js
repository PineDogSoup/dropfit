const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  const {
    type
  } = event;

  try {
    let query = db.collection('games').aggregate()
      .match({
        checked: true
      })
      .lookup({
        from: 'official_info',
        localField: 'officialId',
        foreignField: '_id',
        as: 'officialInfo'
      });

    const currentTime = new Date().getTime();
    query = query.match({
      eventDate: db.command.gte(currentTime)
    });

    if (type) {
      query = query.match({
        'officialInfo.name': type
      });
    }

    const result = await query.sort({
      eventDate: 1
    }).end();

    return {
      success: true,
      data: result.list
    };
  } catch (e) {
    return {
      success: false,
      message: '查询失败',
      error: e
    };
  }
};