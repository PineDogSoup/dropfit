const cloud = require('wx-server-sdk');

// cloud.init({
//   env: 'dropfit-7gmp4k48b5923cbc'
// })
cloud.init()

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const result = await db.collection('records').where({
    openid
  }).get();

  return {
    success: true,
    data: result.data
  };
};