const db = require('../../config/db');

// --- User Management ---
const listUsers = async (filters) => {
  // Basic query with optional search and pagination
  const { search = '', page = 1, limit = 10 } = filters;
  const offset = (page - 1) * limit;

  const searchQuery = `%${search}%`;

  const dataQuery = `
    SELECT id, first_name, last_name, email, phone_number, role, created_at
    FROM users
    WHERE (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1 OR phone_number ILIKE $1)
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3;
  `;

  const countQuery = `
    SELECT COUNT(*)
    FROM users
    WHERE (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1 OR phone_number ILIKE $1);
  `;

  const { rows: users } = await db.query(dataQuery, [searchQuery, limit, offset]);
  const { rows: countRows } = await db.query(countQuery, [searchQuery]);

  const totalUsers = parseInt(countRows[0].count, 10);
  const totalPages = Math.ceil(totalUsers / limit);

  return { users, totalPages, currentPage: parseInt(page, 10), totalUsers };
};

// --- Driver Management ---
const listDrivers = async (filters) => {
  const { status = '', page = 1, limit = 10 } = filters;
  const offset = (page - 1) * limit;

  let whereClause = '';
  const queryParams = [limit, offset];

  if (status) {
    whereClause = 'WHERE d.status = $3';
    queryParams.push(status);
  }

  const dataQuery = `
    SELECT d.id as driver_id, d.status, d.created_at, u.id as user_id, u.first_name, u.last_name, u.phone_number
    FROM drivers d
    JOIN users u ON d.user_id = u.id
    ${whereClause}
    ORDER BY d.created_at DESC
    LIMIT $1 OFFSET $2;
  `;

  const countQuery = `SELECT COUNT(*) FROM drivers d ${whereClause};`;

  const { rows: drivers } = await db.query(dataQuery, queryParams);
  const { rows: countRows } = await db.query(countQuery, status ? [status] : []);

  const totalDrivers = parseInt(countRows[0].count, 10);
  const totalPages = Math.ceil(totalDrivers / limit);

  return { drivers, totalPages, currentPage: parseInt(page, 10), totalDrivers };
};


const getDriverDetailsForAdmin = async (driverId) => {
    const driverQuery = `
        SELECT d.*, u.id as user_id, u.first_name, u.last_name, u.email, u.phone_number, u.role
        FROM drivers d
        JOIN users u ON d.user_id = u.id
        WHERE d.id = $1;
    `;
    const documentsQuery = 'SELECT * FROM driver_documents WHERE driver_id = $1 ORDER BY uploaded_at DESC;';

    const { rows: driverRows } = await db.query(driverQuery, [driverId]);
    if (driverRows.length === 0) {
        throw new Error('Driver not found.');
    }
    const { rows: documents } = await db.query(documentsQuery, [driverId]);

    return { ...driverRows[0], documents };
};

const updateDriverStatus = async (driverId, newStatus) => {
    // newStatus should be 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes(newStatus)) {
        throw new Error('Invalid status provided.');
    }
    const { rows } = await db.query(
        'UPDATE drivers SET status = $1 WHERE id = $2 RETURNING *',
        [newStatus, driverId]
    );
    if (rows.length === 0) {
        throw new Error('Driver not found.');
    }
    return rows[0];
};

const updateDocumentStatus = async (documentId, newStatus, reviewNotes) => {
     if (!['approved', 'rejected', 'pending_review'].includes(newStatus)) {
        throw new Error('Invalid status provided.');
    }
    const { rows } = await db.query(
        'UPDATE driver_documents SET status = $1, review_notes = $2, reviewed_at = NOW() WHERE id = $3 RETURNING *',
        [newStatus, reviewNotes, documentId]
    );
     if (rows.length === 0) {
        throw new Error('Document not found.');
    }
    // TODO: After all documents are approved, maybe automatically approve the driver?
    // This logic can be added here.
    return rows[0];
};


module.exports = {
  listUsers,
  listDrivers,
  getDriverDetailsForAdmin,
  updateDriverStatus,
  updateDocumentStatus,
};
