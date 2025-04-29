// 云函数 getNearbyVenues
const cloud = require('wx-server-sdk');

// cloud.init({
//   env: 'dropfit-7gmp4k48b5923cbc'
// })
cloud.init()

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    // const result = await db.collection('favorites').aggregate()
    //   .match({
    //     openid
    //   })
    //   .lookup({
    //     from: 'venue_detail',
    //     localField: 'venueId',
    //     foreignField: 'venueId',
    //     as: 'venueInfo'
    //   })
    //   .unwind('$venueInfo')
    //   .replaceRoot({
    //     newRoot: '$venueInfo'
    //   })
    //   .end();

    const result = await db.collection('favorites').aggregate()
      .match({
        openid
      }).lookup({
        from: 'venue_detail',
        localField: 'venueId',
        foreignField: 'venueId',
        as: 'detail'
      }).sort({
        updatedAt: -1,
      }).end();

    return {
      success: true,
      data: result.list
    };
  } catch (error) {
    return {
      success: false,
      message: '获取收藏列表失败',
      error
    };
  }
};