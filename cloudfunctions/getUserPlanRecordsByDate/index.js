const cloud = require('wx-server-sdk');

cloud.init();

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const {
    date
  } = event;

  try {
    const result = await db.collection('plan_records')
      .aggregate()
      .match({
        openid,
        date
      })
      .lookup({
        from: 'plan_detail',
        localField: 'planDetailId',
        foreignField: '_id',
        as: 'planDetail'
      })
      .sort({
        createdAt: -1
      })
      .end();

    return {
      success: true,
      data: result.list
    };
  } catch (error) {
    console.error('Error querying plan records and details:', error);
    return {
      success: false,
      errorMessage: error.message
    };
  }
};