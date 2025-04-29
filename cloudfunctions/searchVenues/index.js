const cloud = require('wx-server-sdk');

// cloud.init({
//   env: 'dropfit-7gmp4k48b5923cbc'
// })
cloud.init()

const db = cloud.database();

exports.main = async (event, context) => {
  const {
    latitude,
    longitude,
    city,
    keyword,
    limit
  } = event;

  try {
    const result = await db.collection('venues').aggregate()
      .geoNear({
        distanceField: 'distance',
        spherical: true,
        near: db.Geo.Point(longitude, latitude),
        maxDistance: 60000000,
        key: 'location',
        includeLocs: 'location',
      })
      .match({
        city,
        checked: true,
        name: db.RegExp({
          regexp: keyword,
          options: 'i'
        }),
      })
      .limit(limit)
      .end()

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