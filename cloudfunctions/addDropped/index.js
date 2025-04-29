// 云函数 getNearbyVenues
const cloud = require('wx-server-sdk');

// cloud.init({
//   env: 'dropfit-7gmp4k48b5923cbc'
// })
cloud.init()

const db = cloud.database();

exports.main = async (event, context) => {
  const { openid, venueId } = event;
  try {
    await db.collection('dropped').add({
      data: {
        openid,
        venueId
      }
    });
    return {
      success: true,
      message: 'Drop-In Success'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Drop-In Fail',
      error
    };
  }
};