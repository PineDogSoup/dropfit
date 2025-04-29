// 云函数 getNearbyVenues
const cloud = require('wx-server-sdk');

// cloud.init({
//   env: 'dropfit-7gmp4k48b5923cbc'
// })
cloud.init()

const db = cloud.database();

exports.main = async (event, context) => {
  const {
    venueId
  } = event;

  try {
    const result = await db.collection('venues').aggregate()
      .match({
        _id: venueId
      })
      .lookup({
        from: 'booking',
        localField: '_id',
        foreignField: 'venueId',
        as: 'bookingInfo'
      })
      .lookup({
        from: 'facility',
        localField: '_id',
        foreignField: 'venueId',
        as: 'facilityInfo'
      })
      .lookup({
        from: 'media',
        localField: '_id',
        foreignField: 'venueId',
        as: 'mediaInfo'
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