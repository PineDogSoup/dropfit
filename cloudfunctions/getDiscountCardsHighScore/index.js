const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const {
    limit = 10, offset = 0, filter = {}
  } = event;

  const query = {
    checked: true,
    available: true,
    // ...filter
  };

  if (filter.priceRange && filter.priceRange.length === 2) {
    query.currentPrice = _.and([
      _.gte(filter.priceRange[0]),
      _.lte(filter.priceRange[1])
    ]);
  }

  if (filter.cardType) {
    query.cardType = filter.cardType;
  }

  if (filter.city) {
    query.city = filter.city;
  }

  try {
    const result = await db.collection('discount_cards').aggregate()
      .match(query)
      .lookup({
        from: 'venue_detail',
        localField: 'venueId',
        foreignField: 'venueId',
        as: 'venueInfo',
      })
      .addFields({
        recommendCount: {
          $arrayElemAt: ['$venueInfo.recommendCount', 0],
        },
      })
      .match({
        recommendCount: db.command.exists(true),
      })
      .sort({
        recommendCount: -1,
      })
      .skip(offset)
      .limit(limit)
      .end();

    return {
      success: true,
      data: result.list,
    };
  } catch (err) {
    console.error('查询失败:', err);
    return {
      success: false,
      message: '查询失败',
      error: err,
    };
  }
};