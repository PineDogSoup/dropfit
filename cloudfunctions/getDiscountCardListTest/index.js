const cloud = require('../getDiscountCardsLatest/node_modules/wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  const { type, limit = 10, offset = 0 } = event;

  // 定义分类过滤逻辑的配置
  const typeFilters = {
    latest: {
      query: { originalPrice: db.command.neq(null), available: true },
      sort: { updatedAt: -1 }
    },
    highScore: {
      query: { available: true },
      sort: { 'venueInfo.recommendCount': -1 } // 需要关联 recommendCount 排序
    },
    newlyPublished: {
      query: { available: true },
      sort: { updatedAt: -1 }
    },
    upcoming: {
      query: { available: false },
      sort: { updatedAt: -1 } // 即将推出无需排序
    }
  };

  // 获取当前类型对应的过滤条件和排序规则
  const currentFilter = typeFilters[type] || {};

  try {
    let aggregatePipeline = db.collection('discount_cards').aggregate()
      .match(currentFilter.query || {}) // 动态匹配查询条件
      .lookup({
        from: 'venue_detail',
        localField: 'venueId',
        foreignField: 'venueId', // 关联表 venue_detail 的主键字段
        as: 'venueInfo'
      });

    // 添加排序条件（如果有）
    if (currentFilter.sort && Object.keys(currentFilter.sort).length > 0) {
      aggregatePipeline = aggregatePipeline.sort(currentFilter.sort);
    }

    const result = await aggregatePipeline
      .skip(offset) // 分页偏移量
      .limit(limit) // 每页数据量
      .end();

    return {
      success: true,
      data: result.list
    };
  } catch (err) {
    console.error('查询失败:', err);
    return {
      success: false,
      message: '查询失败',
      error: err
    };
  }
};