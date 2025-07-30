const db = require('../../config/db');
const slugify = require('slugify');

const listAll = async () => {
  return (await db.query('SELECT * FROM categories ORDER BY name ASC')).rows;
};

const create = async (name) => {
  const slug = slugify(name, { lower: true, strict: true });
  const { rows } = await db.query(
    'INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING *',
    [name, slug]
  );
  return rows[0];
};

const update = async (id, name) => {
    const slug = slugify(name, { lower: true, strict: true });
    const { rows } = await db.query(
        'UPDATE categories SET name = $1, slug = $2 WHERE id = $3 RETURNING *',
        [name, slug, id]
    );
    if (rows.length === 0) throw new Error('Category not found.');
    return rows[0];
};

const remove = async (id) => {
    // Note: Deleting a category will fail if it's in use due to FK constraints,
    // unless ON DELETE is configured. Here, we just delete from the categories table.
    // The link in article_categories should be handled first if needed.
    const { rowCount } = await db.query('DELETE FROM categories WHERE id = $1', [id]);
    if (rowCount === 0) throw new Error('Category not found.');
};

module.exports = { listAll, create, update, remove };
