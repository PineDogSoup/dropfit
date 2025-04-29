const cloud = require('wx-server-sdk');

cloud.init();

const db = cloud.database();

exports.main = async (event, context) => {
  const {
    city,
    limit,
    offset
  } = event;

  try {
    const dbName = `venues_${city}`;
    let query = db.collection(dbName).aggregate()
      .match({
        checked: true
      });

    query = query.sort({
      name: 1
    });

    query = query.skip(offset).limit(limit);
    query = query.lookup({
      from: 'venue_detail',
      localField: '_id',
      foreignField: 'venueId',
      as: 'detail'
    });

    const result = await query.end();

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