const express = require('express');
const cors = require('cors');
const fs = require('fs').promises; // 使用 promise 版本的 fs
const path = require('path');
const rateLimit = require('express-rate-limit'); // 1. 导入 express-rate-limit

const app = express();
const PORT = process.env.PORT || 3000; // 使用环境变量或默认端口 3000
// 统一使用 data.json 存储评论和评分
const DATA_FILE = path.join(__dirname, 'data.json');

// 基础邮箱验证正则表达式 (如果需要更严格的验证，可以调整)
const EMAIL_REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/; // Improved email regex

// 配置 Express 信任代理 (例如 Vercel, Nginx 等)
// '1' 表示信任直接连接的代理
app.set('trust proxy', 1);

// 中间件
// app.use(cors()); // 允许跨域请求 - 替换为下面的带选项的版本

// --- 定义允许的源 ---
const allowedOrigins = [
    'http://localhost:5173',          // 本地开发前端
    'https://escape-road-online.com' // 你部署的前端 Vercel URL
];

// --- 配置 CORS 选项 ---
const corsOptions = {
  origin: function (origin, callback) {
    // 允许来自 allowedOrigins 列表的请求，或者没有 origin 的请求 (例如服务器间调用或 Postman)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // 允许
    } else {
      callback(new Error('Not allowed by CORS')); // 拒绝
    }
  }
};

// --- 应用带选项的 CORS 中间件 ---
app.use(cors(corsOptions)); // 使用配置好的选项

app.use(express.json()); // 解析 JSON 请求体

// 1. 定义自定义 Key 生成器函数
// 它结合了 IP 地址和请求体中的 pageId
const keyGenerator = (req /*, res */) => {
    // 从请求体中获取 pageId，如果没有则使用默认值或标记
    const pageId = req.body?.pageId || 'unknown_page';
    // 返回组合键，确保 IP 地址可用 (注意: req.ip 可能需要正确配置代理信任)
    return `${req.ip}-${pageId}`;
};

// 2. 创建速率限制器，并应用自定义 keyGenerator
const commentLimiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minute
	max: 1,
    keyGenerator: keyGenerator, // 应用自定义 key 生成器
	handler: (req, res, next, options) => {
		res.status(options.statusCode).json({ message: options.message });
    },
    message: 'You can only post one comment per game every minute. Please try again later.', // 更新提示信息
    standardHeaders: true,
	legacyHeaders: false,
});

const ratingLimiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minute
	max: 1,
    keyGenerator: keyGenerator, // 应用自定义 key 生成器
	handler: (req, res, next, options) => {
		res.status(options.statusCode).json({ message: options.message });
    },
	message: 'You can only submit one rating per game every minute. Please try again later.', // 更新提示信息
    standardHeaders: true,
	legacyHeaders: false,
});

// 初始化评分计数的辅助函数
const initializeRatingCounts = () => ({ '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 });

// 读取 data.json，确保 ratings 结构正确
async function readData() {
    try {
        await fs.access(DATA_FILE);
        const fileContent = await fs.readFile(DATA_FILE, 'utf-8');
        const data = fileContent ? JSON.parse(fileContent) : {};
        data.comments = data.comments || {};
        data.ratings = data.ratings || {};

        // 确保每个已存在的 pageId 在 ratings 下有正确的计数器结构
        for (const pageId in data.ratings) {
            if (typeof data.ratings[pageId] !== 'object' || data.ratings[pageId] === null || Array.isArray(data.ratings[pageId])) {
                 // 如果是旧的数组格式或无效格式，则初始化
                 data.ratings[pageId] = initializeRatingCounts();
            }
             // 确保 1-5 的 key 都存在
             for (let i = 1; i <= 5; i++) {
                 const key = i.toString();
                 data.ratings[pageId][key] = data.ratings[pageId][key] || 0;
             }
        }

        return data;
    } catch (error) {
        if (error.code === 'ENOENT') {
            return { comments: {}, ratings: {} };
        }
        console.error('Error reading data file:', error);
        throw error;
    }
}

// 写入 data.json
async function writeData(data) {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing data file:', error);
        throw error;
    }
}

// API 路由：获取评论
// GET /api/comments?pageId=xxx
// 返回特定页面的评论列表，但不包含 email 字段
app.get('/api/comments', async (req, res) => {
    const pageId = req.query.pageId;
    // 验证 pageId 是否提供
    if (!pageId) {
        return res.status(400).json({ message: 'pageId is required' });
    }

    try {
        // 读取所有评论
        const data = await readData();
        // 获取该页面的评论数组，如果不存在则为空数组
        const pageCommentsData = data.comments[pageId] || [];
        // **重要：** 使用 map 遍历评论，创建一个新数组，其中每个评论对象都移除了 email 字段
        const pageCommentsPublic = pageCommentsData.map(({ email, ...rest }) => rest);
        // 返回处理后的评论列表
        res.json(pageCommentsPublic);
    } catch (error) {
        // 处理读取或处理过程中的错误
        res.status(500).json({ message: 'Error fetching comments' });
    }
});

// API 路由：添加评论
// POST /api/comments
// 需要请求体包含 { pageId, name, email, text }
app.post('/api/comments', commentLimiter, async (req, res) => {
    // 从请求体中解构所需字段
    const { pageId, name, email, text } = req.body;

    // --- 输入验证开始 ---
    // 检查所有必填字段是否存在
    if (!pageId || !name || !email || !text) {
        return res.status(400).json({ message: 'pageId, name, email, and text are required' });
    }
    // 验证 name 是否为非空字符串
    if (typeof name !== 'string' || name.trim() === '') {
         return res.status(400).json({ message: 'Name cannot be empty' });
    }
    // 验证 email 格式是否有效
    if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
        return res.status(400).json({ message: 'Invalid email format' });
    }
    // 验证 text 是否为非空字符串
    if (typeof text !== 'string' || text.trim() === '') {
        return res.status(400).json({ message: 'Comment text cannot be empty' });
    }
    // 限制 name 长度
    if (name.trim().length > 100) {
         return res.status(400).json({ message: 'Name is too long (max 100 characters)' });
    }
    // 限制 email 长度
     if (email.trim().length > 100) {
         return res.status(400).json({ message: 'Email is too long (max 100 characters)' });
    }
    // 限制 text 长度
    if (text.trim().length > 500) {
         return res.status(400).json({ message: 'Comment is too long (max 500 characters)' });
    }
    // --- 输入验证结束 ---

    // 创建新的评论对象，包含所有字段
    const newComment = {
        id: Date.now().toString(), // 使用时间戳作为简单唯一ID
        name: name.trim(),       // 保存去除首尾空格的姓名
        email: email.trim(),     // 保存去除首尾空格的邮箱 (仅后端使用)
        text: text.trim(),       // 保存去除首尾空格的评论内容
        timestamp: new Date().toISOString() // 记录评论时间
    };

    try {
        // 读取现有所有评论
        const data = await readData();

        // 如果该 pageId 还没有评论，初始化一个空数组
        if (!data.comments[pageId]) {
            data.comments[pageId] = [];
        }

        // 将新评论添加到对应页面评论数组的 **开头** (最新评论在最上面)
        data.comments[pageId].unshift(newComment);

        // 将更新后的所有评论写回文件
        await writeData(data);

        // **重要：** 从新评论对象中移除 email 字段，创建一个"公开"版本
        const { email: _, ...newCommentPublic } = newComment;
        // 返回状态码 201 (Created) 和不含 email 的新评论对象
        res.status(201).json(newCommentPublic);
    } catch (error) {
        // 处理保存过程中的错误
        res.status(500).json({ message: 'Error saving comment' });
    }
});

// 计算评分的辅助函数
const calculateRatingStats = (ratingCounts) => {
    let sum = 0;
    let count = 0;
    for (let i = 1; i <= 5; i++) {
        const key = i.toString();
        const numRatings = ratingCounts[key] || 0;
        sum += numRatings * i;
        count += numRatings;
    }
    const average = count > 0 ? sum / count : 0;
    return { average: parseFloat(average.toFixed(1)), count };
};

// API 路由：获取评分
// GET /api/ratings?pageId=xxx
// 返回特定页面的评分列表
app.get('/api/ratings', async (req, res) => {
    const pageId = req.query.pageId;
    if (!pageId) {
        return res.status(400).json({ message: 'pageId is required' });
    }
    try {
        const data = await readData();
        // 获取该页面的评分计数，如果不存在则初始化
        const ratingCounts = data.ratings[pageId] || initializeRatingCounts();
        const stats = calculateRatingStats(ratingCounts);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching ratings' });
    }
});

// API 路由：添加评分
// POST /api/ratings
// 需要请求体包含 { pageId, rating }
app.post('/api/ratings', ratingLimiter, async (req, res) => {
    const { pageId, rating } = req.body;

    // 验证输入
    if (!pageId) {
        return res.status(400).json({ message: 'pageId is required' });
    }
    const ratingValue = parseInt(rating, 10);
    if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
        return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
    }

    try {
        const data = await readData();
        // 获取或初始化该页面的评分计数对象
        if (!data.ratings[pageId]) {
            data.ratings[pageId] = initializeRatingCounts();
        }
        const ratingKey = ratingValue.toString();
        data.ratings[pageId][ratingKey] = (data.ratings[pageId][ratingKey] || 0) + 1; // 增加对应星级的计数

        await writeData(data); // 写回文件

        // 使用更新后的计数重新计算统计信息并返回
        const stats = calculateRatingStats(data.ratings[pageId]);
        res.status(201).json(stats);

    } catch (error) {
        res.status(500).json({ message: 'Error saving rating' });
    }
});

// --- 仅供调试：查看 data.json 内容 ---
// 警告：这个接口不应该在生产环境中无保护地暴露！
// 可以考虑添加一个简单的密码查询参数，例如 ?secret=yourpassword
app.get('/api/debug/view-data', async (req, res) => {
    // 可选：添加简单的密码保护
    const secret = req.query.secret; // 从查询参数获取 secret
    const expectedSecret = 'YOUR_VERY_SECRET_PASSWORD'; // **在这里设置一个复杂的密码！**

    if (secret !== expectedSecret) {
        return res.status(403).send('Forbidden: Invalid secret');
    }

    try {
        const data = await readData(); // 使用你已有的 readData 函数
        res.json(data); // 将整个 data 对象作为 JSON 返回
    } catch (error) {
        console.error('Error reading data for debug view:', error);
        res.status(500).send('Error reading data');
    }
});

// --- 启动服务器 ---
app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
    // 检查数据文件
    readData().then(data => {
         // 移除对 fs.existsSync 的调用，因为 readData 已处理文件不存在的情况
         // 检查读取到的数据是否为空（文件不存在或为空时 data 会是 {}）
         if (Object.keys(data.comments).length === 0 && Object.keys(data.ratings).length === 0) {
             console.log('Data file is empty or does not exist. Ready for first interaction.');
         } else {
             console.log('Data file loaded or ready.');
         }
    }).catch(err => console.error("Initial data check failed:", err));
});
