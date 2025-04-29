const cloud = require('../getDiscountCardsLatest/node_modules/wx-server-sdk');
cloud.init()
const db = cloud.database();

exports.main = async (event, context) => {
  const {
    venueId
  } = event;

  try {
    const result = await db.collection('venue_detail').aggregate()
      .match({
        venueId
      })
      .lookup({
        from: 'booking',
        localField: 'venueId',
        foreignField: 'venueId',
        as: 'bookingInfo'
      })
      .lookup({
        from: 'facility',
        localField: 'venueId',
        foreignField: 'venueId',
        as: 'facilityInfo'
      })
      .lookup({
        from: 'media',
        localField: 'venueId',
        foreignField: 'venueId',
        as: 'mediaInfo'
      })
      .lookup({
        from: 'tags',
        localField: 'venueId',
        foreignField: 'venueId',
        as: 'tags'
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
        message: '未找到相关场馆信息'
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