const db = require('../../config/db');
const slugify = require('slugify');

const listAll = async () => {
  return (await db.query('SELECT * FROM tags ORDER BY name ASC')).rows;
};

const create = async (name) => {
  const slug = slugify(name, { lower: true, strict: true });
  const { rows } = await db.query(
    'INSERT INTO tags (name, slug) VALUES ($1, $2) RETURNING *',
    [name, slug]
  );
  return rows[0];
};

const update = async (id, name) => {
    const slug = slugify(name, { lower: true, strict: true });
    const { rows } = await db.query(
        'UPDATE tags SET name = $1, slug = $2 WHERE id = $3 RETURNING *',
        [name, slug, id]
    );
    if (rows.length === 0) throw new Error('Tag not found.');
    return rows[0];
};

const remove = async (id) => {
    const { rowCount } = await db.query('DELETE FROM tags WHERE id = $1', [id]);
    if (rowCount === 0) throw new Error('Tag not found.');
};

module.exports = { listAll, create, update, remove };
