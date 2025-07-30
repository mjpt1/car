const db = require('../../config/db');

const listUserTransactions = async (userId, filters) => {
  const { page = 1, limit = 10 } = filters;
  const offset = (page - 1) * limit;

  const dataQuery = `
    SELECT id, booking_id, amount, type, status, gateway, description, created_at
    FROM transactions
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3;
  `;

  const countQuery = 'SELECT COUNT(*) FROM transactions WHERE user_id = $1;';

  const { rows: transactions } = await db.query(dataQuery, [userId, limit, offset]);
  const { rows: countRows } = await db.query(countQuery, [userId]);

  const totalTransactions = parseInt(countRows[0].count, 10);
  const totalPages = Math.ceil(totalTransactions / limit);

  return { transactions, totalPages, currentPage: parseInt(page, 10), totalTransactions };
};

const listAllTransactions = async (filters) => {
    // For Admin Panel
    const { page = 1, limit = 10, userId, status } = filters;
    const offset = (page - 1) * limit;

    let whereClauses = [];
    const queryParams = [];

    if (userId) {
        queryParams.push(userId);
        whereClauses.push(`user_id = $${queryParams.length}`);
    }
    if (status) {
        queryParams.push(status);
        whereClauses.push(`status = $${queryParams.length}`);
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    queryParams.push(limit, offset);
    const paginationParamIndex = queryParams.length - 1;


    const dataQuery = `
        SELECT t.*, u.email as user_email
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        ${whereString}
        ORDER BY t.created_at DESC
        LIMIT $${paginationParamIndex} OFFSET $${paginationParamIndex + 1};
    `;

    const countQuery = `SELECT COUNT(*) FROM transactions ${whereString};`;

    const { rows: transactions } = await db.query(dataQuery, queryParams);
    // Remove pagination params for count query
    const countParams = queryParams.slice(0, queryParams.length - 2);
    const { rows: countRows } = await db.query(countQuery, countParams);

    const totalTransactions = parseInt(countRows[0].count, 10);
    const totalPages = Math.ceil(totalTransactions / limit);

    return { transactions, totalPages, currentPage: parseInt(page, 10), totalTransactions };
};


module.exports = {
  listUserTransactions,
  listAllTransactions,
};
