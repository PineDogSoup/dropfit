const cloud = require('wx-server-sdk');

cloud.init()

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const {
    planId,
    limit
  } = event;

  const result = await db.collection('plan_records').where({
      openid,
      planId,
    }).orderBy('date', 'desc')
    .limit(limit)
    .get();

  return {
    success: true,
    data: result.data
  };
};