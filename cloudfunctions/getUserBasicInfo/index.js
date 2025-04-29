const cloud = require('wx-server-sdk');

// cloud.init({
//   env: 'dropfit-7gmp4k48b5923cbc'
// })
cloud.init()

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  const user = await db.collection('users').where({
    openid
  }).get();
  if (user.data.length > 0) {
    return {
      exists: true,
      userData: user.data[0]
    };
  } else {
    return {
      exists: false
    };
  }
};