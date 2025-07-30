const db = require('../../config/db');
const slugify = require('slugify');

// Helper function to generate a unique slug
const generateUniqueSlug = async (title, articleId = null) => {
  let baseSlug = slugify(title, { lower: true, strict: true, locale: 'fa' });
  let slug = baseSlug;
  let count = 1;

  let query = 'SELECT id FROM articles WHERE slug = $1';
  const params = [slug];
  if (articleId) {
      query += ' AND id != $2';
      params.push(articleId);
  }

  while (true) {
    const { rows } = await db.query(query, params);
    if (rows.length === 0) {
      return slug;
    }
    slug = `${baseSlug}-${count}`;
    params[0] = slug;
    count++;
  }
};

// --- Admin Services ---

const createArticle = async (articleData, authorId) => {
  const { title, content, excerpt, cover_image_url, status, categoryIds = [], tagIds = [] } = articleData;
  const slug = await generateUniqueSlug(title);

  const published_at = status === 'published' ? new Date() : null;

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Insert article
    const articleQuery = `
      INSERT INTO articles (title, slug, content, excerpt, cover_image_url, status, author_id, published_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
    `;
    const { rows: articleRows } = await client.query(articleQuery, [title, slug, content, excerpt, cover_image_url, status, authorId, published_at]);
    const newArticle = articleRows[0];

    // Link categories
    if (categoryIds.length > 0) {
      const categoryPromises = categoryIds.map(catId =>
        client.query('INSERT INTO article_categories (article_id, category_id) VALUES ($1, $2)', [newArticle.id, catId])
      );
      await Promise.all(categoryPromises);
    }

    // Link tags
    if (tagIds.length > 0) {
      const tagPromises = tagIds.map(tagId =>
        client.query('INSERT INTO article_tags (article_id, tag_id) VALUES ($1, $2)', [newArticle.id, tagId])
      );
      await Promise.all(tagPromises);
    }

    await client.query('COMMIT');
    return newArticle;

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const updateArticle = async (articleId, articleData) => {
    const { title, content, excerpt, cover_image_url, status, categoryIds, tagIds } = articleData;

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // Fetch existing article to check status change
        const { rows: existingArticleRows } = await client.query('SELECT status FROM articles WHERE id = $1', [articleId]);
        if (existingArticleRows.length === 0) throw new Error('Article not found.');
        const existingStatus = existingArticleRows[0].status;

        // Generate new slug only if title changes
        let slug = undefined;
        if (title) {
            slug = await generateUniqueSlug(title, articleId);
        }

        // Handle published_at logic
        let published_at_clause = '';
        if (status === 'published' && existingStatus !== 'published') {
            published_at_clause = `, published_at = NOW()`;
        } else if (status === 'draft') {
            published_at_clause = `, published_at = NULL`;
        }

        // Dynamically build the update query
        const fields = { title, slug, content, excerpt, cover_image_url, status };
        const updateFields = Object.entries(fields)
            .filter(([_, value]) => value !== undefined)
            .map(([key], i) => `${key} = $${i + 1}`)
            .join(', ');

        const updateValues = Object.values(fields).filter(v => v !== undefined);

        if (updateFields) {
            const articleQuery = `UPDATE articles SET ${updateFields}, updated_at = NOW() ${published_at_clause} WHERE id = $${updateValues.length + 1} RETURNING *;`;
            await client.query(articleQuery, [...updateValues, articleId]);
        }

        // Update categories if provided
        if (categoryIds) {
            await client.query('DELETE FROM article_categories WHERE article_id = $1', [articleId]);
            if (categoryIds.length > 0) {
                const categoryPromises = categoryIds.map(catId =>
                    client.query('INSERT INTO article_categories (article_id, category_id) VALUES ($1, $2)', [articleId, catId])
                );
                await Promise.all(categoryPromises);
            }
        }

        // Update tags if provided
        if (tagIds) {
            await client.query('DELETE FROM article_tags WHERE article_id = $1', [articleId]);
            if (tagIds.length > 0) {
                const tagPromises = tagIds.map(tagId =>
                    client.query('INSERT INTO article_tags (article_id, tag_id) VALUES ($1, $2)', [articleId, tagId])
                );
                await Promise.all(tagPromises);
            }
        }

        await client.query('COMMIT');
        return getArticleById(articleId); // Return the updated article with all relations

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const deleteArticle = async (articleId) => {
    // ON DELETE CASCADE in pivot tables handles relations
    const { rowCount } = await db.query('DELETE FROM articles WHERE id = $1', [articleId]);
    if (rowCount === 0) {
        throw new Error('Article not found.');
    }
    return { success: true, message: 'Article deleted successfully.' };
};

const getArticleById = async (articleId) => {
    const query = `
        SELECT a.*,
               u.first_name as author_first_name,
               u.last_name as author_last_name,
               (SELECT json_agg(c.*) FROM categories c JOIN article_categories ac ON c.id = ac.category_id WHERE ac.article_id = a.id) as categories,
               (SELECT json_agg(t.*) FROM tags t JOIN article_tags at ON t.id = at.tag_id WHERE at.article_id = a.id) as tags
        FROM articles a
        JOIN users u ON a.author_id = u.id
        WHERE a.id = $1
    `;
    const { rows } = await db.query(query, [articleId]);
    if (rows.length === 0) {
        throw new Error('Article not found.');
    }
    return rows[0];
};


// --- Public Services ---

const listPublishedArticles = async (filters) => {
    const { page = 1, limit = 10, category, tag } = filters;
    const offset = (page - 1) * limit;

    // This is getting complex, a query builder would be nice.
    // For now, building it manually.
    let fromClause = 'FROM articles a';
    let whereClauses = ["a.status = 'published'"];
    const params = [];

    if (category) {
        fromClause += ' JOIN article_categories ac ON a.id = ac.article_id JOIN categories c ON ac.category_id = c.id';
        params.push(category);
        whereClauses.push(`c.slug = $${params.length}`);
    }
    if (tag) {
        fromClause += ' JOIN article_tags at ON a.id = at.article_id JOIN tags t ON at.tag_id = t.id';
        params.push(tag);
        whereClauses.push(`t.slug = $${params.length}`);
    }

    const whereString = `WHERE ${whereClauses.join(' AND ')}`;
    params.push(limit, offset);
    const paginationParamIndex = params.length - 1;

    const dataQuery = `
        SELECT a.id, a.title, a.slug, a.excerpt, a.cover_image_url, a.published_at, u.first_name as author_first_name
        ${fromClause}
        JOIN users u ON a.author_id = u.id
        ${whereString}
        ORDER BY a.published_at DESC
        LIMIT $${paginationParamIndex} OFFSET $${paginationParamIndex + 1};
    `;
    const countQuery = `SELECT COUNT(DISTINCT a.id) ${fromClause} ${whereString};`;

    const { rows: articles } = await db.query(dataQuery, params);
    const { rows: countRows } = await db.query(countQuery, params.slice(0, params.length - 2));

    const totalItems = parseInt(countRows[0].count, 10);
    const totalPages = Math.ceil(totalItems / limit);

    return { data: articles, totalPages, currentPage: parseInt(page, 10), totalItems };
};

const getArticleBySlug = async (slug) => {
    // Same as getArticleById but fetching by slug
     const query = `
        SELECT a.*,
               u.first_name as author_first_name,
               u.last_name as author_last_name,
               (SELECT json_agg(c.*) FROM categories c JOIN article_categories ac ON c.id = ac.category_id WHERE ac.article_id = a.id) as categories,
               (SELECT json_agg(t.*) FROM tags t JOIN article_tags at ON t.id = at.tag_id WHERE at.article_id = a.id) as tags
        FROM articles a
        JOIN users u ON a.author_id = u.id
        WHERE a.slug = $1 AND a.status = 'published'
    `;
    const { rows } = await db.query(query, [slug]);
    if (rows.length === 0) {
        throw new Error('Article not found.');
    }
    return rows[0];
};


module.exports = {
    createArticle,
    updateArticle,
    deleteArticle,
    getArticleById,
    listPublishedArticles,
    getArticleBySlug,
};
