const cloud = require('wx-server-sdk');

cloud.init()

const db = cloud.database();

exports.main = async (event, context) => {
  const result = await db.collection('cities').get();
  return {
    success: true,
    data: result.data
  };
};