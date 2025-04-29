const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  try {
    const categories = await db.collection('barbell_categories').get();
    const subcategories = await db.collection('barbell_subcategories').get();
    
    const data = categories.data.map(category => {
      return {
        ...category,
        subcategories: subcategories.data.filter(sub => sub.categoryId === category._id)
      };
    });
    
    return {
      success: true,
      data
    };
  } catch (e) {
    return {
      success: false,
      message: '获取数据失败',
      error: e
    };
  }
};
