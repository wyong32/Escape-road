import 'dotenv/config';
import { kv } from "@vercel/kv";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import adminRouter from './admin.js'; // Import the admin router
import blogRouter from './routes/blogRoutes.js'; // Import the blog router

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:5173', // Local frontend dev server
    'https://escape-road-online.com' // Updated Deployed frontend URL
   ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// --- Rate Limiters ---
const keyGenerator = (req /*, res */) => {
    const pageId = req.method === 'POST' ? req.body?.pageId : req.query?.pageId;
    const ip = req.ip || 'unknown_ip';
    // Use a more specific identifier if pageId is not always present
    const identifier = pageId ? `page-${pageId}` : 'global';
    return `${ip}-${identifier}`;
};

const createLimiter = (message, max = 1) => rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: max,
    keyGenerator: keyGenerator,
    handler: (req, res, next, options) => {
        console.warn(`Rate limit exceeded for IP: ${req.ip}, Page: ${req.body?.pageId || req.query?.pageId || 'N/A'}, Path: ${req.path}`);
        res.status(options.statusCode).json({ message: options.message });
    },
    message: message,
    standardHeaders: true,
    legacyHeaders: false,
});

const commentLimiter = createLimiter('You can only post one comment per game every minute. Please try again later.', 1); // Allow only one comment
const ratingLimiter = createLimiter('You can only submit one rating per game every minute. Please try again later.', 1); // Allow only one rating
const getLimiter = createLimiter('Too many requests, please try again later.', 60); // Generous limit for GET requests

// --- Helper Functions ---
const calculateRatingStats = (ratingCounts) => {
    let totalScore = 0;
    let count = 0;
    const safeRatingCounts = (typeof ratingCounts === 'object' && ratingCounts !== null) ? ratingCounts : {};
    for (let i = 1; i <= 5; i++) {
        const key = String(i);
        const numRatings = parseInt(safeRatingCounts[key] || 0, 10);
        if (!isNaN(numRatings) && numRatings > 0) {
            totalScore += numRatings * i;
            count += numRatings;
        }
    }
    const average = count > 0 ? totalScore / count : 0;
    return { average: parseFloat(average.toFixed(1)), count };
};

// Note: validateInput is now likely only needed in admin.js, can be removed here if not used elsewhere
// Restore the function definition as it's needed by public routes
const validateInput = (input, type, maxLength = Infinity) => {
    if (typeof input !== 'string' || input.trim() === '') {
        return `${type} cannot be empty.`;
    }
    if (input.trim().length > maxLength) {
         return `${type} is too long (max ${maxLength} characters).`;
    }
    return null; // No error
};

// --- Mount Routers ---
app.use('/admin', adminRouter);
app.use('/api/blog', blogRouter); // Mount blog routes under /api/blog

// --- Public API Routes (No /api prefix for comments/ratings) ---

// GET /comments?pageId=xxx
app.get('/comments', getLimiter, async (req, res) => {
    const pageId = req.query.pageId;
    if (!pageId || typeof pageId !== 'string') {
        return res.status(400).json({ message: 'Valid pageId query parameter is required.' });
    }
    try {
        const rawDataList = await kv.lrange(`comments:${pageId}`, 0, -1);
        // Public route should also sort comments
        const comments = rawDataList.map((rawData) => {
            try {
                if (typeof rawData === 'object' && rawData !== null) return rawData;
                if (typeof rawData === 'string') {
                   const cleanedStr = rawData.trim().replace(/^\uFEFF/, ''); // Handle BOM
                   if (cleanedStr) return JSON.parse(cleanedStr);
                }
                return null;
            } catch (e) {
                console.error(`[API] Failed to process public comment data for ${pageId}:`, e.message, 'Raw:', rawData);
                return null;
            }
        }).filter(comment => comment && typeof comment.id !== 'undefined' && typeof comment.text !== 'undefined');
        
        // Sort comments by timestamp (newest first)
        comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.status(200).json(comments);
    } catch (error) {
        console.error(`[API] Error in public GET /comments handler for pageId ${pageId}:`, error);
        res.status(500).json({ message: 'Internal server error fetching comments.' });
    }
});

// POST /comments
app.post('/comments', commentLimiter, async (req, res) => {
    const { pageId, name, text, email } = req.body;

    const pageIdError = validateInput(pageId, 'Page ID');
    if (pageIdError) return res.status(400).json({ message: pageIdError });
    const nameError = validateInput(name, 'Name', 100);
    if (nameError) return res.status(400).json({ message: nameError });
    const textError = validateInput(text, 'Comment', 500);
    if (textError) return res.status(400).json({ message: textError });
    if (email && typeof email === 'string' && (!email.includes('@') || email.trim().length > 254)) {
        return res.status(400).json({ message: 'Please provide a valid email address.' });
    } else if (email && typeof email !== 'string') {
         return res.status(400).json({ message: 'Email must be a string.' });
    }

    const newComment = {
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        name: name.trim(),
        text: text.trim(),
        ...(email && typeof email === 'string' && email.trim() && { email: email.trim() }),
        timestamp: new Date().toISOString()
    };

    try {
        const commentJsonString = JSON.stringify(newComment);
        await kv.lpush(`comments:${pageId}`, commentJsonString);
        res.status(201).json(newComment);
    } catch (error) {
        console.error(`[API] Error saving public comment for pageId ${pageId}:`, error);
        res.status(500).json({ message: 'Internal server error saving comment.' });
    }
});

// GET /ratings?pageId=xxx
app.get('/ratings', getLimiter, async (req, res) => {
    const pageId = req.query.pageId;
    if (!pageId || typeof pageId !== 'string') {
        return res.status(400).json({ message: 'Valid pageId query parameter is required.' });
    }
    try {
        const ratingCounts = await kv.hgetall(`ratings:${pageId}`);
        const stats = calculateRatingStats(ratingCounts);
        res.status(200).json(stats);
    } catch (error) {
        console.error(`[API] Error fetching public ratings for pageId ${pageId}:`, error);
        res.status(500).json({ message: 'Internal server error fetching ratings.' });
    }
});

// POST /ratings
app.post('/ratings', ratingLimiter, async (req, res) => {
    const { pageId, rating } = req.body;

    const pageIdError = validateInput(pageId, 'Page ID');
    if (pageIdError) return res.status(400).json({ message: pageIdError });
    if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be an integer between 1 and 5.' });
    }

    const ratingField = String(rating);
    try {
        await kv.hincrby(`ratings:${pageId}`, ratingField, 1);
        const updatedRatingCounts = await kv.hgetall(`ratings:${pageId}`);
        const stats = calculateRatingStats(updatedRatingCounts);
        res.status(201).json(stats);
    } catch (error) {
        console.error(`[API] Error submitting public rating for pageId ${pageId}:`, error);
        res.status(500).json({ message: 'Internal server error submitting rating.' });
    }
});

// --- Export for Vercel ---
export default app;

// --- Listener for Local Development ---
// Optional: Check if running locally before listening
if (!process.env.VERCEL) { // VERCEL is a common env var on the platform
    app.listen(PORT, () => {
        console.log(`[API] Server is running locally on port ${PORT}`);
    });
}