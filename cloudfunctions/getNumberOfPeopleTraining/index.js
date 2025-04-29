const cloud = require('wx-server-sdk');


cloud.init()

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const {
    planId
  } = event;

  try {
    const result = await db.collection('plan_records')
      .aggregate()
      .match({
        planId: planId
      })
      .group({
        _id: '$openid'
      })
      .end()

    return {
      success: true,
      data: result.list
    }
  } catch (error) {
    console.error('Error querying plan_records:', error)
    return {
      success: false,
      error: error.message
    }
  }
}