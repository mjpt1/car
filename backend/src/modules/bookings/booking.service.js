const db = require('../../config/db');

const createBooking = async (userId, bookingData) => {
  const { trip_id, seat_ids } = bookingData;

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Validate Trip
    const { rows: tripRows } = await client.query('SELECT id, status, base_seat_price FROM trips WHERE id = $1 FOR UPDATE', [trip_id]);
    if (tripRows.length === 0) {
      throw new Error('Trip not found.');
    }
    const trip = tripRows[0];
    if (trip.status !== 'scheduled') {
      throw new Error('This trip is not available for booking (e.g., already departed, completed, or cancelled).');
    }

    // 2. Validate Seats
    // Fetch all selected seats for the given trip to check their status and price
    // Ensure they belong to the trip_id and are available
    const seatsQuery = `
      SELECT id, seat_number, status, price
      FROM seats
      WHERE id = ANY($1::int[]) AND trip_id = $2 FOR UPDATE;
    `; // Use ANY($1::int[]) to check multiple seat_ids
       // FOR UPDATE locks these rows
    const { rows: selectedSeats } = await client.query(seatsQuery, [seat_ids, trip_id]);

    if (selectedSeats.length !== seat_ids.length) {
      throw new Error('One or more selected seats do not exist or do not belong to this trip.');
    }

    let totalAmount = 0;
    for (const seat of selectedSeats) {
      if (seat.status !== 'available') {
        // TODO: More specific error: is it booked by someone else, or by the current user in another transaction, or locked?
        // For now, a general message.
        throw new Error(`Seat ${seat.seat_number} is not available for booking. Status: ${seat.status}`);
      }
      // TODO: Add gender validation logic if applicable (e.g. user.gender vs seat.special_type)
      totalAmount += parseFloat(seat.price);
    }

    // 3. Create Booking record
    const bookingInsertQuery = `
      INSERT INTO bookings (user_id, trip_id, total_amount, status)
      VALUES ($1, $2, $3, 'pending_payment')
      RETURNING id, status, booking_time, total_amount;
    `; // Default status: 'pending_payment'. Can be 'confirmed' if no payment step.
    const { rows: bookingRows } = await client.query(bookingInsertQuery, [userId, trip_id, totalAmount]);
    const newBooking = bookingRows[0];

    // 4. Create BookingItems and Update Seat statuses
    const bookingItemPromises = [];
    const updateSeatPromises = [];

    for (const seat of selectedSeats) {
      bookingItemPromises.push(
        client.query(
          'INSERT INTO booking_items (booking_id, seat_id, price_at_booking) VALUES ($1, $2, $3)',
          [newBooking.id, seat.id, seat.price]
        )
      );
      updateSeatPromises.push(
        client.query(
          "UPDATE seats SET status = 'booked', user_id = $1, booking_id = $2 WHERE id = $3",
          [userId, newBooking.id, seat.id]
          // Using 'booked' directly. If a 'locked' status for payment window is needed, logic changes.
        )
      );
    }

    await Promise.all(bookingItemPromises);
    await Promise.all(updateSeatPromises);

    // 5. Update available_seats on the trip (optional, could be a calculated view/query too)
    // This is a simple decrement. More robust calculation might be needed if seats can be 'locked' etc.
    await client.query(
        'UPDATE trips SET available_seats = available_seats - $1 WHERE id = $2',
        [selectedSeats.length, trip_id]
    );


    await client.query('COMMIT');

    return {
      booking_id: newBooking.id,
      trip_id: trip_id,
      user_id: userId,
      seats_booked: selectedSeats.map(s => ({ id: s.id, seat_number: s.seat_number, price: s.price })),
      total_amount: newBooking.total_amount,
      status: newBooking.status,
      booking_time: newBooking.booking_time,
      message: 'Booking created successfully. Awaiting payment.', // Adjust if payment not next step
    };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error creating booking:", error);
    // More specific error messages based on error codes or types could be useful here
    if (error.message.includes('not available') || error.message.includes('not found') || error.message.includes('not belong')) {
        throw error; // Re-throw specific, known errors
    }
    throw new Error(`Failed to create booking: ${error.message}`); // General fallback
  } finally {
    client.release();
  }
};


const getMyBookings = async (userId) => {
  const query = `
    SELECT
      b.id as booking_id,
      b.status as booking_status,
      b.total_amount,
      b.booking_time,
      t.id as trip_id,
      t.origin_location,
      t.destination_location,
      t.departure_time,
      t.estimated_arrival_time,
      (
        SELECT json_agg(json_build_object('seat_id', s.id, 'seat_number', s.seat_number, 'price', bi.price_at_booking))
        FROM booking_items bi
        JOIN seats s ON bi.seat_id = s.id
        WHERE bi.booking_id = b.id
      ) as booked_seats_details,
      dr.id as driver_id,
      du.first_name as driver_first_name,
      du.last_name as driver_last_name
    FROM bookings b
    JOIN trips t ON b.trip_id = t.id
    JOIN drivers dr ON t.driver_id = dr.id
    JOIN users du ON dr.user_id = du.id
    WHERE b.user_id = $1
    ORDER BY b.booking_time DESC;
  `;
  const { rows } = await db.query(query, [userId]);
  return rows;
};

// TODO: Add cancelBooking service (handles seat status updates, potential refunds logic later)

const cancelBooking = async (userId, bookingId) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Find the booking and verify ownership and status
    const { rows: bookingRows } = await client.query(
      'SELECT id, user_id, trip_id, status FROM bookings WHERE id = $1 FOR UPDATE',
      [bookingId]
    );
    if (bookingRows.length === 0) {
      throw new Error('Booking not found.');
    }
    const booking = bookingRows[0];
    if (booking.user_id !== userId) {
      // In a real app, an admin might be able to cancel, but for now, only the user can.
      throw new Error('Forbidden: You are not authorized to cancel this booking.');
    }
    if (booking.status !== 'confirmed' && booking.status !== 'pending_payment') {
      throw new Error(`Cannot cancel a booking with status: ${booking.status}.`);
    }

    // 2. Check cancellation policy (e.g., cannot cancel 24 hours before departure)
    const { rows: tripRows } = await client.query('SELECT departure_time FROM trips WHERE id = $1', [booking.trip_id]);
    const departureTime = new Date(tripRows[0].departure_time);
    const now = new Date();
    const hoursBeforeDeparture = (departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Example policy: Cannot cancel if less than 24 hours to departure
    if (hoursBeforeDeparture < 24) {
      throw new Error('Cancellation failed: Cannot cancel a trip less than 24 hours before departure.');
    }

    // 3. Update booking status
    await client.query(
      "UPDATE bookings SET status = 'cancelled_by_user' WHERE id = $1",
      [bookingId]
    );

    // 4. Find all seats associated with this booking and make them available again
    const { rows: bookingItems } = await client.query(
      'SELECT seat_id FROM booking_items WHERE booking_id = $1',
      [bookingId]
    );
    const seatIdsToRelease = bookingItems.map(item => item.seat_id);

    if (seatIdsToRelease.length > 0) {
      await client.query(
        "UPDATE seats SET status = 'available', user_id = NULL, booking_id = NULL WHERE id = ANY($1::int[])",
        [seatIdsToRelease]
      );

      // 5. Update available_seats count on the trip
      await client.query(
        'UPDATE trips SET available_seats = available_seats + $1 WHERE id = $2',
        [seatIdsToRelease.length, booking.trip_id]
      );
    }

    // TODO: Trigger a notification to the driver
    // const io = getIoInstance(); // Needs a way to access io
    // io.to(`user:${driverUserId}`).emit(...)

    await client.query('COMMIT');
    return { success: true, message: 'Booking cancelled successfully.' };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error cancelling booking ${bookingId}:`, error);
    if (error.message.startsWith('Forbidden') || error.message.startsWith('Cannot cancel') || error.message.startsWith('Cancellation failed')) {
        throw error;
    }
    throw new Error(`Failed to cancel booking: ${error.message}`);
  } finally {
    client.release();
  }
};


module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
};
