const db = require('../../config/db');

// Helper function to parse seat_layout (this can be more sophisticated)
const parseSeatLayout = (seatLayout) => {
  if (!seatLayout || typeof seatLayout !== 'object') {
    // Default to a generic small layout if none provided or invalid
    console.warn('Invalid or missing seatLayout, defaulting to 2x2.');
    return { rows: 2, cols: 2, layout_type: 'default_2x2', disabled_seats: [], special_seats: {} };
  }
  // Basic validation/defaults for core properties
  return {
    rows: parseInt(seatLayout.rows, 10) || 2,
    cols: parseInt(seatLayout.cols, 10) || 2,
    layout_type: seatLayout.layout_type || 'custom',
    disabled_seats: Array.isArray(seatLayout.disabled_seats) ? seatLayout.disabled_seats : [],
    special_seats: typeof seatLayout.special_seats === 'object' ? seatLayout.special_seats : {},
    // aisles_after_cols: Array.isArray(seatLayout.aisles_after_cols) ? seatLayout.aisles_after_cols : [], // For more complex rendering
  };
};


const createTrip = async (tripData) => {
  const {
    origin_location,
    destination_location,
    departure_time,
    estimated_arrival_time,
    driver_id,
    base_seat_price,
    notes,
  } = tripData;

  // 1. Validate Driver and get seat_layout
  const { rows: driverRows } = await db.query(
    'SELECT id, seat_layout, vehicle_details FROM drivers WHERE id = $1 AND status = $2', // Assuming driver must be 'approved'
    [driver_id, 'approved'] // Only approved drivers can have trips
  );

  if (driverRows.length === 0) {
    throw new Error('Approved driver not found or driver does not have a seat layout.');
  }
  const driver = driverRows[0];
  if (!driver.seat_layout) {
      // Fallback to vehicle_details.seat_layout if main seat_layout is null (for backward compatibility or other structures)
      if (driver.vehicle_details && driver.vehicle_details.seat_layout) {
          driver.seat_layout = driver.vehicle_details.seat_layout;
      } else {
        throw new Error(`Seat layout for driver ID ${driver_id} is not defined. Cannot create trip.`);
      }
  }

  const layout = parseSeatLayout(driver.seat_layout);
  let totalSeats = 0;
  const seatNumbers = [];

  // Generate seat numbers based on layout (e.g., A1, A2, B1, B2)
  // This is a simple row/col generation. Real layouts can be more complex.
  for (let r = 0; r < layout.rows; r++) {
    for (let c = 0; c < layout.cols; c++) {
      const seatNum = `${String.fromCharCode(65 + r)}${c + 1}`; // A1, A2, B1, B2 etc.
      if (!layout.disabled_seats.includes(seatNum)) {
        seatNumbers.push(seatNum);
        totalSeats++;
      }
    }
  }
  if (totalSeats === 0) {
      throw new Error('No valid seats could be generated from the seat layout. Ensure layout is correct.');
  }


  // Use a database transaction to ensure atomicity
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 2. Insert into Trips table
    const tripInsertQuery = `
      INSERT INTO trips (origin_location, destination_location, departure_time, estimated_arrival_time, driver_id, base_seat_price, available_seats, notes, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'scheduled')
      RETURNING id, available_seats;
    `;
    const { rows: tripRows } = await client.query(tripInsertQuery, [
      origin_location,
      destination_location,
      departure_time,
      estimated_arrival_time,
      driver_id,
      base_seat_price,
      totalSeats, // Initially all generated seats are available
      notes,
    ]);
    const newTrip = tripRows[0];

    // 3. Insert into Seats table for the new trip
    const seatInsertPromises = seatNumbers.map(seatNum => {
      let seatStatus = 'available';
      // Check if seat has special designation (e.g., female_only)
      if (layout.special_seats && layout.special_seats[seatNum]) {
        // Example: "female_only" status could be "reserved_female" or a specific type
        // For now, let's assume special_seats might define a status directly, or we map it.
        // e.g. if layout.special_seats[seatNum] === "female_only", status = "reserved_female"
        // This needs a clear convention in your seat_layout JSON.
        // For simplicity, we'll keep it 'available' but front-end can use special_seats info for display/rules.
        // Or, you can have a seat_type column in Seats table.
      }

      // Price for this seat (can be base_seat_price or adjusted based on type)
      const seatPrice = base_seat_price; // TODO: Adjust if seat types have different prices

      return client.query(
        'INSERT INTO seats (trip_id, seat_number, status, price) VALUES ($1, $2, $3, $4)',
        [newTrip.id, seatNum, seatStatus, seatPrice]
      );
    });

    await Promise.all(seatInsertPromises);

    await client.query('COMMIT');
    return { ...newTrip, driver_info: { id: driver.id, vehicle_details: driver.vehicle_details }, seat_layout_used: layout };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error creating trip:", error);
    throw new Error(`Failed to create trip: ${error.message}`);
  } finally {
    client.release();
  }
};


const searchTrips = async (queryParams) => {
  const { origin, destination, date } = queryParams;
  // Construct date range for the given day
  const startDate = new Date(`${date}T00:00:00.000Z`);
  const endDate = new Date(`${date}T23:59:59.999Z`);

  // Basic query, can be expanded with more filters, sorting, pagination
  // Also, calculating 'actual_available_seats' by joining with Seats table and counting 'available' ones.
  const query = `
    SELECT
      t.id,
      t.origin_location,
      t.destination_location,
      t.departure_time,
      t.estimated_arrival_time,
      t.base_seat_price,
      t.status,
      d.id as driver_id,
      u.first_name as driver_first_name,
      u.last_name as driver_last_name,
      d.vehicle_details,
      d.seat_layout,
      (SELECT COUNT(*) FROM seats s WHERE s.trip_id = t.id AND s.status = 'available') as actual_available_seats
    FROM trips t
    JOIN drivers d ON t.driver_id = d.id
    JOIN users u ON d.user_id = u.id
    WHERE t.origin_location ILIKE $1
      AND t.destination_location ILIKE $2
      AND t.departure_time >= $3
      AND t.departure_time <= $4
      AND t.status = 'scheduled' -- Only show scheduled trips
      AND (SELECT COUNT(*) FROM seats s WHERE s.trip_id = t.id AND s.status = 'available') > 0 -- Ensure there are available seats
    ORDER BY t.departure_time ASC;
  `;
  // Using ILIKE for case-insensitive search, can be made more robust (e.g., using Full-Text Search or specific location matching)
  const { rows } = await db.query(query, [`%${origin}%`, `%${destination}%`, startDate, endDate]);
  return rows;
};


const getTripDetails = async (tripId) => {
  const client = await db.pool.connect();
  try {
    // Fetch trip details
    const tripQuery = `
      SELECT
        t.*,
        d.id as driver_id,
        d.seat_layout as driver_seat_layout,
        d.vehicle_details as driver_vehicle_details,
        u.first_name as driver_first_name,
        u.last_name as driver_last_name,
        u.phone_number as driver_phone_number
      FROM trips t
      JOIN drivers d ON t.driver_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE t.id = $1;
    `;
    const { rows: tripRows } = await client.query(tripQuery, [tripId]);
    if (tripRows.length === 0) {
      throw new Error('Trip not found.');
    }
    const trip = tripRows[0];

    // Fetch seats for the trip
    const seatsQuery = 'SELECT id, seat_number, status, price, user_id FROM seats WHERE trip_id = $1 ORDER BY seat_number;';
    const { rows: seats } = await client.query(seatsQuery, [tripId]);

    // Combine and return
    return {
      ...trip,
      seats: seats,
      // seat_layout is already part of trip via driver_seat_layout
    };
  } catch (error) {
    console.error(`Error fetching trip details for ID ${tripId}:`, error);
    throw error; // Re-throw to be handled by controller
  } finally {
    client.release();
  }
};


const getChatHistory = async (tripId) => {
  const query = `
    SELECT
      cm.id,
      cm.trip_id,
      cm.sender_id,
      cm.message_text,
      cm.file_url,
      cm.created_at,
      u.first_name as sender_first_name,
      u.last_name as sender_last_name
    FROM chat_messages cm
    JOIN users u ON cm.sender_id = u.id
    WHERE cm.trip_id = $1
    ORDER BY cm.created_at ASC;
  `;
  const { rows } = await db.query(query, [tripId]);

  // Re-structure the sender info
  return rows.map(row => ({
    id: row.id,
    trip_id: row.trip_id,
    sender_id: row.sender_id,
    message_text: row.message_text,
    file_url: row.file_url,
    created_at: row.created_at,
    sender: {
      id: row.sender_id,
      first_name: row.sender_first_name,
      last_name: row.sender_last_name,
    }
  }));
};


module.exports = {
  createTrip,
  searchTrips,
  getTripDetails,
  getChatHistory,
};
