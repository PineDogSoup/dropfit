// 云函数 getNearbyVenues
const cloud = require('wx-server-sdk');

// cloud.init({
//   env: 'dropfit-7gmp4k48b5923cbc'
// })
cloud.init()

const db = cloud.database();

exports.main = async (event, context) => {
  const {
    openid,
    venueId
  } = event;

  try {
    await db.collection('dropped').where({
      openid,
      venueId
    }).remove();
    return {
      success: true,
      message: 'Cancle Success'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Cancle Fail',
      error
    };
  }
};