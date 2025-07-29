const db = require('../../config/db');

const createRating = async (raterUserId, ratingData) => {
  const { trip_id, rating, comment } = ratingData;

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Verify the trip exists and is completed.
    // Also, verify the rater was a passenger on this trip.
    const { rows: tripRows } = await client.query(
      `SELECT t.id, t.status, t.driver_id, d.user_id as driver_user_id
       FROM trips t
       JOIN drivers d ON t.driver_id = d.id
       WHERE t.id = $1`,
      [trip_id]
    );

    if (tripRows.length === 0) {
      throw new Error('Trip not found.');
    }
    const trip = tripRows[0];

    // For now, let's assume only 'completed' trips can be rated.
    // This could be adjusted (e.g., allow rating after departure_time has passed).
    if (trip.status !== 'completed') {
      throw new Error(`Cannot rate a trip that is not completed. Current status: ${trip.status}`);
    }

    // Verify the rater was on this trip
    const { rows: bookingRows } = await client.query(
        'SELECT id FROM bookings WHERE trip_id = $1 AND user_id = $2 AND status IN ($3, $4)',
        [trip_id, raterUserId, 'confirmed', 'completed']
    );

    if (bookingRows.length === 0) {
        throw new Error('Forbidden: You were not a passenger on this trip.');
    }

    // 2. Determine who is being rated.
    // For now, we assume a passenger is rating the driver of the trip.
    const ratedUserId = trip.driver_user_id;
    if (raterUserId === ratedUserId) {
        throw new Error("You cannot rate yourself.");
    }

    // 3. Insert the rating, handling potential unique constraint violation
    const insertQuery = `
      INSERT INTO ratings (trip_id, rater_user_id, rated_user_id, rating, comment)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (trip_id, rater_user_id, rated_user_id)
      DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, created_at = NOW()
      RETURNING *;
    `;
    const { rows: ratingRows } = await client.query(insertQuery, [
      trip_id,
      raterUserId,
      ratedUserId,
      rating,
      comment
    ]);

    await client.query('COMMIT');
    return {
      success: true,
      message: 'Rating submitted successfully.',
      rating: ratingRows[0],
    };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating rating:', error);
     if (error.message.startsWith('Forbidden') || error.message.startsWith('Cannot rate')) {
        throw error;
    }
    throw new Error('Failed to submit rating.');
  } finally {
    client.release();
  }
};

module.exports = {
  createRating,
};
