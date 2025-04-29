const callCloudFunction = (functionName, data = {}) => {
  return new Promise((resolve, reject) => {
    // console.log('callCloudFunction data:', data);
    wx.cloud.callFunction({
        name: functionName,
        data,
      })
      .then(res => {
        if (res.result && res.result.success) {
          resolve(res.result.data);
        } else {
          reject(new Error(res.result.message || '云函数调用失败'));
        }
      })
      .catch(err => {
        console.error(`调用云函数 ${functionName} 失败:`, err);
        reject(err);
      });
  });
};

export const fetchDiscounts = (type, filter = {}, limit = 10, offset = 0) => {
  const functionMapping = {
    latest: 'getDiscountCardsLatest',
    highScore: 'getDiscountCardsHighScore',
    newlyPublished: 'getDiscountCardsNewlyPublished',
    upcoming: 'getDiscountCardsUpcoming',
  };

  const functionName = functionMapping[type];
  if (!functionName) {
    return Promise.reject(new Error('无效的类型'));
  }
  // console.log('fetchDiscounts filter:', filter);
  return callCloudFunction(functionName, {
    filter, // 动态过滤条件
    limit,
    offset,
  });
};