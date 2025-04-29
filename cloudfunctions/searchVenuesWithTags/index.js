// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  const {
    latitude,
    longitude,
    city,
    keyword,
    limit,
    offset,
    tags
  } = event;

  try {
    let query = db.collection('venues').aggregate()
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
        checked: true
      });

    if (keyword) {
      query = query.match({
        name: db.RegExp({
          regexp: keyword,
          options: 'i'
        })
      });
    }

    query = query
      .lookup({
        from: 'tags',
        localField: '_id',
        foreignField: 'venueId',
        as: 'tags'
      });
    // 新增标签过滤逻辑
    if (tags && tags.length > 0) {
      query = query.match({
        $and: tags.map(tag => ({
          [`tags.${tag}`]: true
        }))
      });
    }

    query = query
      .skip(offset)
      .limit(limit);

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