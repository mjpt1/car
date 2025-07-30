const db = require('../../config/db');
const { format } = require('@fast-csv/format');

// --- Bookings Report ---
const getBookingsReport = async (filters) => {
  const {
    page = 1,
    limit = 10,
    status,
    driverId,
    startDate, // YYYY-MM-DD
    endDate,   // YYYY-MM-DD
  } = filters;
  const offset = (page - 1) * limit;

  let whereClauses = [];
  const queryParams = [];

  if (status) {
    queryParams.push(status);
    whereClauses.push(`b.status = $${queryParams.length}`);
  }
  if (driverId) {
    queryParams.push(driverId);
    whereClauses.push(`t.driver_id = $${queryParams.length}`);
  }
  if (startDate) {
    queryParams.push(startDate);
    whereClauses.push(`b.booking_time >= $${queryParams.length}`);
  }
  if (endDate) {
    queryParams.push(endDate);
    // Add 1 day to include the whole end date
    whereClauses.push(`b.booking_time < ($${queryParams.length}::date + 1)`);
  }

  const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const dataQuery = `
    SELECT
      b.id, b.status, b.total_amount, b.booking_time,
      t.id as trip_id, t.origin_location, t.destination_location,
      u.id as user_id, u.first_name as user_first_name, u.last_name as user_last_name,
      d.id as driver_id, du.first_name as driver_first_name
    FROM bookings b
    JOIN trips t ON b.trip_id = t.id
    JOIN users u ON b.user_id = u.id
    JOIN drivers d ON t.driver_id = d.id
    JOIN users du ON d.user_id = du.id
    ${whereString}
    ORDER BY b.booking_time DESC
    LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2};
  `;

  const countQuery = `SELECT COUNT(*) FROM bookings b JOIN trips t ON b.trip_id = t.id ${whereString};`;

  const { rows: bookings } = await db.query(dataQuery, [...queryParams, limit, offset]);
  const { rows: countRows } = await db.query(countQuery, queryParams);

  const totalItems = parseInt(countRows[0].count, 10);
  const totalPages = Math.ceil(totalItems / limit);

  return { data: bookings, totalPages, currentPage: parseInt(page, 10), totalItems };
};


// --- Financial Report ---
const getFinancialReport = async (filters) => {
  const {
    startDate, // YYYY-MM-DD
    endDate,   // YYYY-MM-DD
  } = filters;

  let whereClauses = ["t.status = 'completed'"]; // Only consider completed transactions for revenue
  const queryParams = [];

  if (startDate) {
    queryParams.push(startDate);
    whereClauses.push(`t.created_at >= $${queryParams.length}`);
  }
  if (endDate) {
    queryParams.push(endDate);
    whereClauses.push(`t.created_at < ($${queryParams.length}::date + 1)`);
  }

  const whereString = `WHERE ${whereClauses.join(' AND ')}`;

  const query = `
    SELECT
      SUM(amount) as total_revenue,
      COUNT(*) as total_transactions,
      AVG(amount) as average_transaction_value,
      DATE(t.created_at) as report_date
    FROM transactions t
    ${whereString}
    GROUP BY report_date
    ORDER BY report_date ASC;
  `;

  const { rows } = await db.query(query, queryParams);
  return rows;
};


// --- General Stats ---
const getSystemStats = async () => {
    const queries = {
        users: 'SELECT COUNT(*) FROM users',
        drivers: 'SELECT COUNT(*) FROM drivers WHERE status = $1',
        trips: 'SELECT COUNT(*) FROM trips WHERE status = $1',
        bookings: 'SELECT COUNT(*) FROM bookings WHERE status = $1',
        totalRevenue: "SELECT SUM(amount) FROM transactions WHERE status = 'completed'"
    };

    const userCount = await db.query(queries.users).then(res => res.rows[0].count);
    const approvedDrivers = await db.query(queries.drivers, ['approved']).then(res => res.rows[0].count);
    const pendingDrivers = await db.query(queries.drivers, ['pending_approval']).then(res => res.rows[0].count);
    const scheduledTrips = await db.query(queries.trips, ['scheduled']).then(res => res.rows[0].count);
    const completedTrips = await db.query(queries.trips, ['completed']).then(res => res.rows[0].count);
    const confirmedBookings = await db.query(queries.bookings, ['confirmed']).then(res => res.rows[0].count);
    const totalRevenue = await db.query(queries.totalRevenue).then(res => res.rows[0].sum || 0);

    return {
        userCount,
        approvedDrivers,
        pendingDrivers,
        scheduledTrips,
        completedTrips,
        confirmedBookings,
        totalRevenue
    };
};


// --- CSV Export Service ---
const getBookingsCsvStream = async (filters) => {
    // This service will return a stream for the controller to pipe to the response.
    const { data } = await getBookingsReport({ ...filters, limit: 10000, page: 1 }); // Get all data for CSV

    const csvStream = format({ headers: true });

    const transformedData = data.map(row => ({
        'Booking ID': row.id,
        'Booking Status': row.status,
        'Total Amount': row.total_amount,
        'Booking Time': new Date(row.booking_time).toLocaleString('fa-IR'),
        'Trip ID': row.trip_id,
        'Origin': row.origin_location,
        'Destination': row.destination_location,
        'User ID': row.user_id,
        'User Name': `${row.user_first_name || ''} ${row.user_last_name || ''}`.trim(),
        'Driver ID': row.driver_id,
        'Driver Name': row.driver_first_name,
    }));

    transformedData.forEach(row => csvStream.write(row));
    csvStream.end();

    return csvStream;
};


module.exports = {
  getBookingsReport,
  getFinancialReport,
  getSystemStats,
  getBookingsCsvStream,
};
