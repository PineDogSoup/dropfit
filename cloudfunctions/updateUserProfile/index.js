const cloud = require('wx-server-sdk');

// cloud.init({
//   env: 'dropfit-7gmp4k48b5923cbc'
// })
cloud.init()

const db = cloud.database();

exports.main = async (event, context) => {
  const {
    openid,
    userInfo
  } = event;

  try {
    const user = await db.collection("users").where({
        openid
      }).get(openid)
    if (user.data.length === 0) {
      return {
        success: false,
        message: '用户不存在'
      };
    }

    const userId = user.data[0]._id;
    const result = await db.collection("users").doc(userId)
      .update({
        data: {
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl
        }
      });

    return {
      success: true,
      data: result
    };
  } catch (e) {
    return {
      success: false,
      message: '用户更新失败',
      error: e
    };
  }
};