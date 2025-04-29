const cloud = require('wx-server-sdk');

// cloud.init({
//   env: 'dropfit-7gmp4k48b5923cbc'
// })
cloud.init()

exports.main = async (event, context) => {
  try {
    const result = await cloud.openapi.phonenumber.getPhoneNumber({
      code: event.code
    })
    return {
      success: true,
      data: result
    };
  } catch (e) {
    return {
      success: false,
      message: '手机鉴权失败',
      error: e
    };
  }
};