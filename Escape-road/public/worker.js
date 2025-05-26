// Web Worker 用于处理重型计算任务
self.onmessage = function(e) {
  const { type, data } = e.data;
  
  switch (type) {
    case 'PROCESS_GAMES_DATA':
      // 处理游戏数据
      const processedGames = processGamesData(data);
      self.postMessage({ type: 'GAMES_DATA_PROCESSED', data: processedGames });
      break;
      
    case 'OPTIMIZE_IMAGES':
      // 图片优化处理
      const optimizedImages = optimizeImages(data);
      self.postMessage({ type: 'IMAGES_OPTIMIZED', data: optimizedImages });
      break;
      
    case 'CALCULATE_LAYOUT':
      // 布局计算
      const layout = calculateLayout(data);
      self.postMessage({ type: 'LAYOUT_CALCULATED', data: layout });
      break;
      
    default:
      console.warn('Unknown worker task type:', type);
  }
};

function processGamesData(games) {
  // 模拟重型数据处理
  return games.map(game => ({
    ...game,
    processed: true,
    timestamp: Date.now()
  }));
}

function optimizeImages(images) {
  // 模拟图片优化
  return images.map(img => ({
    ...img,
    optimized: true,
    size: Math.floor(img.size * 0.8) // 模拟压缩
  }));
}

function calculateLayout(data) {
  // 模拟布局计算
  const { width, height, items } = data;
  const columns = Math.floor(width / 120); // 每个项目120px宽
  const rows = Math.ceil(items.length / columns);
  
  return {
    columns,
    rows,
    itemWidth: width / columns,
    itemHeight: height / rows
  };
}
