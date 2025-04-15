import 'dotenv/config';
import { kv } from "@vercel/kv";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import {
  adminLogin,
  verifyAdminToken,
  changeAdminPassword,
  getAllGameData,
  deleteCommentById,
  updateRatingsByPageId
} from './admin.js'; // Assuming admin.js is in the same api/ directory

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

const validateInput = (input, type, maxLength = Infinity) => {
    if (typeof input !== 'string' || input.trim() === '') {
        return `${type} cannot be empty.`;
    }
    if (input.trim().length > maxLength) {
         return `${type} is too long (max ${maxLength} characters).`;
    }
    return null; // No error
};


// --- Public API Routes (No /api prefix) ---

// GET /comments?pageId=xxx
app.get('/comments', getLimiter, async (req, res) => {
    const pageId = req.query.pageId;
    if (!pageId || typeof pageId !== 'string') {
        return res.status(400).json({ message: 'Valid pageId query parameter is required.' });
    }
    try {
        const rawDataList = await kv.lrange(`comments:${pageId}`, 0, -1);
        const comments = rawDataList.map((rawData) => {
            try {
                if (typeof rawData === 'object' && rawData !== null) return rawData;
                if (typeof rawData === 'string') {
                   const cleanedStr = rawData.trim().replace(/^\uFEFF/, ''); // Handle BOM
                   if (cleanedStr) return JSON.parse(cleanedStr);
                }
                return null;
            } catch (e) {
                console.error(`[API] Failed to process comment data for ${pageId}:`, e.message, 'Raw:', rawData);
                return null;
            }
        }).filter(comment => comment && typeof comment.id !== 'undefined' && typeof comment.text !== 'undefined');
        res.status(200).json(comments);
    } catch (error) {
        console.error(`[API] Error in GET /comments handler for pageId ${pageId}:`, error);
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
        console.error(`[API] Error saving comment for pageId ${pageId}:`, error);
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
        console.error(`[API] Error fetching ratings for pageId ${pageId}:`, error);
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
        console.error(`[API] Error submitting rating for pageId ${pageId}:`, error);
        res.status(500).json({ message: 'Internal server error submitting rating.' });
    }
});

// --- Admin Routes (No /api prefix) ---
app.post('/admin/login', adminLogin);
app.post('/admin/change-password', verifyAdminToken, changeAdminPassword);
app.get('/admin/comments', verifyAdminToken, getAllGameData);
app.delete('/admin/comments/:pageId/:commentId', verifyAdminToken, deleteCommentById);

// NEW ROUTE: Manually add a comment as admin
app.post('/admin/comments/manual', verifyAdminToken, async (req, res) => {
    const { pageId, name, text, email } = req.body;

    // Reuse validation, but adapt error messages if needed for admin context
    const pageIdError = validateInput(pageId, 'Page ID');
    if (pageIdError) return res.status(400).json({ message: `Admin Error: ${pageIdError}` });
    const nameError = validateInput(name, 'Name', 100);
    if (nameError) return res.status(400).json({ message: `Admin Error: ${nameError}` });
    const textError = validateInput(text, 'Comment', 500); // Consider allowing longer admin comments?
    if (textError) return res.status(400).json({ message: `Admin Error: ${textError}` });
    if (email && typeof email === 'string' && (!email.includes('@') || email.trim().length > 254)) {
        return res.status(400).json({ message: 'Admin Error: Please provide a valid email address.' });
    } else if (email && typeof email !== 'string') {
         return res.status(400).json({ message: 'Admin Error: Email must be a string.' });
    }

    const newComment = {
        id: Date.now().toString() + Math.random().toString(16).slice(2), // Same ID generation for now
        name: name.trim(),
        text: text.trim(),
        ...(email && typeof email === 'string' && email.trim() && { email: email.trim() }),
        timestamp: new Date().toISOString(),
        addedByAdmin: true // Add a flag to indicate manual addition
    };

    try {
        const commentJsonString = JSON.stringify(newComment);
        await kv.lpush(`comments:${pageId}`, commentJsonString); 
        console.log(`[API] Admin manually added comment for pageId ${pageId} by user: ${req.admin?.username || 'Unknown Admin'}`); // Log admin action
        res.status(201).json(newComment);
    } catch (error) {
        console.error(`[API] Error manually saving comment for pageId ${pageId} by admin:`, error);
        res.status(500).json({ message: 'Internal server error saving comment manually.' });
    }
});

// NEW ROUTE: Manually update ratings for a game
app.put('/admin/ratings/:pageId', verifyAdminToken, updateRatingsByPageId);

app.get('/admin/protected', verifyAdminToken, (req, res) => {
  res.json({ message: 'Verified admin route' });
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