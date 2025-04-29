const cloud = require('wx-server-sdk');

// cloud.init({
//   env: 'dropfit-7gmp4k48b5923cbc'
// })
cloud.init()

exports.main = async (event, context) => {
  const {
    prefix,
    filePath
  } = event;

  try {
    const cloudPath = `${prefix}/${Date.now()}-${Math.floor(Math.random(0, 1) * 1000)}.png`;
    const cloudImagePath = await cloud.uploadFile({
      cloudPath,
      filePath
    });

    return {
      success: true,
      data: cloudImagePath
    };
  } catch (e) {
    return {
      success: false,
      message: '上传失败',
      error: e
    };
  }
};


return new Promise((resolve, reject) => {

});