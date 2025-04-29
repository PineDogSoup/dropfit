const cloud = require('wx-server-sdk');

cloud.init();

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    // 删除 user_game_dates 表中基于 openid 的用户数据
    const result = await db.collection('user_game_dates')
      .where({
        openid
      })
      .remove();

    return {
      success: true,
      message: 'Data deleted successfully',
      removedCount: result.stats.removed
    };
  } catch (error) {
    console.error('Error deleting user game dates:', error);
    return {
      success: false,
      errorMessage: error.message
    };
  }
};
