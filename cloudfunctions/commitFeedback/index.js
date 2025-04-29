const cloud = require('wx-server-sdk');

// cloud.init({
//   env: 'dropfit-7gmp4k48b5923cbc'
// })
cloud.init()

const db = cloud.database();

exports.main = async (event, context) => {
  const {
    openid,
    type,
    content,
    images,
    contact
  } = event;

  try {
    const result = await db.collection("feedbacks").add({
      data: {
        openid,
        type,
        content,
        images,
        contact
      }
    })

    return {
      success: true,
      data: result
    };
  } catch (e) {
    return {
      success: false,
      message: '反馈失败',
      error: e
    };
  }
};