const cloud = require('wx-server-sdk');

cloud.init()

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { venueId } = event;

  const transaction = await db.startTransaction();

  try {
    // 使用 where 条件查询场馆详情
    const venueDetailQuery = await transaction.collection('venue_detail')
      .where({
        venueId: venueId
      })
      .get();

    if (venueDetailQuery.data.length > 0) {
      const venueDetail = venueDetailQuery.data[0];

      await transaction.collection('recommend_record').add({
        data: {
          venueId,
          openid,
        },
      });

      // 检查 recommendCount 是否存在
      const recommendCount = venueDetail.recommendCount ? _.inc(1) : 1;

      // 更新 recommendCount 字段
      await transaction.collection('venue_detail').where({
        venueId: venueId
      }).update({
        data: {
          recommendCount: recommendCount
        }
      });

      await transaction.commit();

      return {
        success: true,
        message: '推荐成功'
      };
    } else {
      await transaction.rollback();
      return {
        success: false,
        error: `rollback`,
        message: '场馆不存在',
        rollbackCode: -100,
      };
    }

  } catch (error) {
    await transaction.rollback();
    return {
      success: false,
      message: '推荐失败',
      error: error.message || error
    };
  }
};
