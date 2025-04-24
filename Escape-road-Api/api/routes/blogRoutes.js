import { Router } from 'express';
import { kv } from '@vercel/kv';
import { verifyAdminToken } from '../admin.js'; // 导入认证中间件
import { v4 as uuidv4 } from 'uuid'; // 导入 UUID 库

const router = Router();

// Helper function to create a URL-friendly slug
const createSlug = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Normalize accents
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars except hyphen
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};

// --- GET /api/blog - 获取博客文章列表 ---
router.get('/', async (req, res) => {
  console.log('[API GET /api/blog] Received request.');
  try {
    const postIds = await kv.zrange('blog:posts_by_date', 0, -1);
    console.log('[API GET /api/blog] Fetched post IDs from KV:', postIds);

    if (!postIds || postIds.length === 0) {
      console.log('[API GET /api/blog] No post IDs found, returning empty array.');
      return res.status(200).json([]);
    }

    const pipeline = kv.pipeline();
    postIds.forEach(id => {
      pipeline.hgetall(`blog:post:${id}`);
    });
    const results = await pipeline.exec();

    const posts = results.map((post, index) => {
      if (post) {
        post.id = postIds[index]; // Add the ID back
        // Ensure essential fields like slug are present
        post.slug = post.slug || null;
        return post; // Return the full post object
      }
      console.warn(`[API GET /api/blog] Failed to fetch details for post ID: ${postIds[index]}`);
      return null;
    }).filter(post => post !== null);

    console.log(`[API GET /api/blog] Returning ${posts.length} posts.`);
    res.status(200).json(posts);
  } catch (error) {
    console.error('[API GET /api/blog] Error fetching blog list:', error);
    res.status(500).json({ message: '获取博客列表失败' });
  }
});

// --- GET /api/blog/slug/:slug - 获取单篇博客文章 by Slug ---
router.get('/slug/:slug', async (req, res) => {
  const { slug } = req.params;
  if (!slug) {
    return res.status(400).json({ message: '缺少文章 slug' });
  }
  console.log(`[API GET /api/blog/slug/${slug}] Received request.`);
  try {
    // 1. Find the ID using the slug
    const postId = await kv.get(`blog:slug_to_id:${slug}`);
    console.log(`[API GET /api/blog/slug/${slug}] Found ID from slug:`, postId);

    if (!postId) {
      return res.status(404).json({ message: `Slug 为 ${slug} 的博客文章未找到` });
    }

    // 2. Fetch the post using the found ID
    const post = await kv.hgetall(`blog:post:${postId}`);
    if (!post) {
      console.error(`[API GET /api/blog/slug/${slug}] Found ID ${postId} but failed to fetch post data.`);
      return res.status(404).json({ message: `无法获取 Slug 为 ${slug} 的文章数据` });
    }

    post.id = postId; // Add the ID back to the response object
    post.slug = post.slug || slug; // Ensure slug is in the response
    console.log(`[API GET /api/blog/slug/${slug}] Returning post:`, post.id);
    res.status(200).json(post);

  } catch (error) {
    console.error(`[API GET /api/blog/slug/${slug}] Error fetching blog post:`, error);
    res.status(500).json({ message: '获取博客文章失败' });
  }
});

// --- GET /api/blog/:id - 获取单篇博客文章 by ID (Internal/Compatibility) ---
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  // Basic check if ID looks like a UUID - adjust regex if needed
  if (!id || !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id)) {
    return res.status(400).json({ message: '无效的文章 ID 格式' });
  }
  console.log(`[API GET /api/blog/${id}] Received request.`);
  try {
    const post = await kv.hgetall(`blog:post:${id}`);
    if (!post) {
      return res.status(404).json({ message: `ID 为 ${id} 的博客文章未找到` });
    }
    post.id = id;
    post.slug = post.slug || null; // Ensure slug is present
    console.log(`[API GET /api/blog/${id}] Returning post:`, post.id);
    res.status(200).json(post);
  } catch (error) {
    console.error(`Error fetching blog post ${id}:`, error);
    res.status(500).json({ message: '获取博客文章失败' });
  }
});

// --- POST /api/blog - 创建新的博客文章 (需要认证) ---
router.post('/', verifyAdminToken, async (req, res) => {
  try {
    // Destructure all expected fields
    let { title, content, slug, summary, metaTitle, metaDescription, metaKeywords, image, imageAlt } = req.body;

    // 1. Input Validation
    if (!title || typeof title !== 'string' || title.trim() === '') return res.status(400).json({ message: '文章标题不能为空' });
    if (!content || typeof content !== 'string' || content.trim() === '') return res.status(400).json({ message: '文章内容不能为空' });
    if (!slug || typeof slug !== 'string' || slug.trim() === '') return res.status(400).json({ message: '文章 URL (slug) 不能为空' });

    // Clean and validate slug
    slug = createSlug(slug.trim());
    if (!slug) return res.status(400).json({ message: '无效的文章 URL (slug) 格式' });

    // Optional: Validate meta fields and other fields (type checks, length limits etc.)
    if (summary && typeof summary !== 'string') return res.status(400).json({ message: '摘要必须是字符串' });
    if (metaTitle && typeof metaTitle !== 'string') return res.status(400).json({ message: 'Meta 标题必须是字符串' });
    if (metaDescription && typeof metaDescription !== 'string') return res.status(400).json({ message: 'Meta 描述必须是字符串' });
    if (metaKeywords && typeof metaKeywords !== 'string') return res.status(400).json({ message: 'Meta 关键词必须是字符串' });
    if (image && typeof image !== 'string') return res.status(400).json({ message: '图片 URL 必须是字符串' });
    if (imageAlt && typeof imageAlt !== 'string') return res.status(400).json({ message: '图片 Alt 文本必须是字符串' });

    // 2. Check Slug Uniqueness
    const existingId = await kv.get(`blog:slug_to_id:${slug}`);
    if (existingId) {
      return res.status(409).json({ message: `文章 URL (slug) "${slug}" 已被使用，请选择其他 URL。` });
    }

    // 3. Data Preparation
    const newPostId = uuidv4();
    const now = new Date();
    const createdAt = now.toISOString();
    const updatedAt = createdAt;
    const createdAtTimestamp = now.getTime();

    const postData = {
      title: title.trim(),
      content: content,
      slug: slug,
      summary: summary?.trim() || '',
      metaTitle: metaTitle?.trim() || '',
      metaDescription: metaDescription?.trim() || '',
      metaKeywords: metaKeywords?.trim() || '',
      image: image?.trim() || '',
      imageAlt: imageAlt?.trim() || '',
      createdAt: createdAt,
      updatedAt: updatedAt,
      author: req.user?.username || 'admin'
    };

    // 4. Write to Vercel KV
    const pipeline = kv.pipeline();
    pipeline.hset(`blog:post:${newPostId}`, postData);
    pipeline.zadd('blog:posts_by_date', { score: -createdAtTimestamp, member: newPostId });
    pipeline.set(`blog:slug_to_id:${slug}`, newPostId);
    await pipeline.exec();

    // 5. Return Success Response
    const createdPost = { id: newPostId, ...postData };
    console.log(`[API POST /api/blog] Post created successfully: ID=${newPostId}, Slug=${slug}`);
    res.status(201).json(createdPost);

  } catch (error) {
    console.error('[API POST /api/blog] Error creating blog post:', error);
    res.status(500).json({ message: '创建博客文章失败' });
  }
});

// --- DELETE /api/blog/:id - 删除博客文章 (需要认证) ---
router.delete('/:id', verifyAdminToken, async (req, res) => {
  const { id } = req.params;
   if (!id || !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id)) {
     return res.status(400).json({ message: '无效的文章 ID 格式' });
   }

  console.log(`[API DELETE /api/blog/${id}] Received request from user: ${req.user?.username}`);

  try {
    // 1. Get post data to find the slug before deleting
    const postData = await kv.hgetall(`blog:post:${id}`);
    if (!postData) {
      console.log(`[API DELETE /api/blog/${id}] Post not found, considering delete successful.`);
      return res.status(204).send();
    }
    const slugToDelete = postData.slug;

    // 2. Delete from KV (Hash, Sorted Set, and slug mapping)
    const pipeline = kv.pipeline();
    pipeline.del(`blog:post:${id}`);
    pipeline.zrem('blog:posts_by_date', id);
    if (slugToDelete) {
      pipeline.del(`blog:slug_to_id:${slugToDelete}`);
      console.log(`[API DELETE /api/blog/${id}] Deleting slug mapping for: ${slugToDelete}`);
    }
    const results = await pipeline.exec();

    console.log(`[API DELETE /api/blog/${id}] KV delete results:`, results);

    // 3. Return Success Response
    res.status(204).send();

  } catch (error) {
    console.error(`[API DELETE /api/blog/${id}] Error deleting blog post:`, error);
    res.status(500).json({ message: '删除博客文章失败' });
  }
});

// --- PUT /api/blog/:id - 更新博客文章 (需要认证) ---
router.put('/:id', verifyAdminToken, async (req, res) => {
  const { id } = req.params;
   if (!id || !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id)) {
     return res.status(400).json({ message: '无效的文章 ID 格式' });
   }

  console.log(`[API PUT /api/blog/${id}] Received update request from user: ${req.user?.username}`);

  try {
    // 1. Check if post exists
    const existingPost = await kv.hgetall(`blog:post:${id}`);
    if (!existingPost) {
      return res.status(404).json({ message: `ID 为 ${id} 的博客文章未找到` });
    }
    const oldSlug = existingPost.slug;

    // 2. Get and validate update data
    const { title, content, slug, summary, metaTitle, metaDescription, metaKeywords, image, imageAlt } = req.body;
    const updatedData = {};
    let newSlug = null; // Track if slug is being updated

    // Validate and add fields to updatedData if they are provided
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') return res.status(400).json({ message: '文章标题不能为空' });
      updatedData.title = title.trim();
    }
    if (content !== undefined) {
      if (typeof content !== 'string' || content.trim() === '') return res.status(400).json({ message: '文章内容不能为空' });
      updatedData.content = content;
    }
    if (summary !== undefined) {
      if (typeof summary !== 'string') return res.status(400).json({ message: '摘要必须是字符串' });
      updatedData.summary = summary.trim();
    }
    if (metaTitle !== undefined) {
      if (typeof metaTitle !== 'string') return res.status(400).json({ message: 'Meta 标题必须是字符串' });
      updatedData.metaTitle = metaTitle.trim();
    }
    if (metaDescription !== undefined) {
      if (typeof metaDescription !== 'string') return res.status(400).json({ message: 'Meta 描述必须是字符串' });
      updatedData.metaDescription = metaDescription.trim();
    }
    if (metaKeywords !== undefined) {
      if (typeof metaKeywords !== 'string') return res.status(400).json({ message: 'Meta 关键词必须是字符串' });
      updatedData.metaKeywords = metaKeywords.trim();
    }
    if (image !== undefined) {
      if (typeof image !== 'string') return res.status(400).json({ message: '图片 URL 必须是字符串' });
      updatedData.image = image.trim();
    }
    if (imageAlt !== undefined) {
      if (typeof imageAlt !== 'string') return res.status(400).json({ message: '图片 Alt 文本必须是字符串' });
      updatedData.imageAlt = imageAlt.trim();
    }

    // Handle slug update
    if (slug !== undefined) {
      if (typeof slug !== 'string' || slug.trim() === '') {
        return res.status(400).json({ message: '文章 URL (slug) 不能为空' });
      }
      const cleanedSlug = createSlug(slug.trim());
      if (!cleanedSlug) {
        return res.status(400).json({ message: '无效的文章 URL (slug) 格式' });
      }
      if (cleanedSlug !== oldSlug) {
        // Check uniqueness of the new slug
        const existingIdForNewSlug = await kv.get(`blog:slug_to_id:${cleanedSlug}`);
        if (existingIdForNewSlug && existingIdForNewSlug !== id) {
          return res.status(409).json({ message: `文章 URL (slug) "${cleanedSlug}" 已被其他文章使用。` });
        }
        updatedData.slug = cleanedSlug;
        newSlug = cleanedSlug; // Mark that slug needs mapping update
        console.log(`[API PUT /api/blog/${id}] Slug will be updated from "${oldSlug}" to "${newSlug}"`);
      } else {
        console.log(`[API PUT /api/blog/${id}] Slug "${oldSlug}" remains unchanged.`);
      }
    }

    // If no fields were provided for update
    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({ message: '没有提供可更新的字段' });
    }

    // 3. Add update timestamp
    updatedData.updatedAt = new Date().toISOString();

    // 4. Update Vercel KV (Hash and potentially slug mapping)
    const pipeline = kv.pipeline();
    pipeline.hset(`blog:post:${id}`, updatedData);
    if (newSlug !== null) {
      if (oldSlug) {
        pipeline.del(`blog:slug_to_id:${oldSlug}`);
        console.log(`[API PUT /api/blog/${id}] Deleting old slug mapping for: ${oldSlug}`);
      }
      pipeline.set(`blog:slug_to_id:${newSlug}`, id);
      console.log(`[API PUT /api/blog/${id}] Setting new slug mapping: ${newSlug} -> ${id}`);
    }
    await pipeline.exec();

    // 5. Get and return the full updated post
    const finalPost = await kv.hgetall(`blog:post:${id}`);
    finalPost.id = id; // Add ID back
    finalPost.slug = finalPost.slug || newSlug || oldSlug || null; // Ensure slug is present

    console.log(`[API PUT /api/blog/${id}] Post updated successfully.`);
    res.status(200).json(finalPost);

  } catch (error) {
    console.error(`[API PUT /api/blog/${id}] Error updating blog post:`, error);
    res.status(500).json({ message: '更新博客文章失败' });
  }
});

export default router; 