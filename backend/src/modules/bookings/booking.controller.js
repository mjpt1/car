const bookingService = require('./booking.service');

const handleCreateBooking = async (req, res) => {
  try {
    const userId = req.user.userId; // Assuming authenticateToken middleware populates req.user
    const bookingData = req.body; // Should contain trip_id and seat_ids

    const newBooking = await bookingService.createBooking(userId, bookingData);
    res.status(201).json(newBooking);
  } catch (error) {
    console.error('Create Booking Error:', error);
    // Specific errors thrown by service should be passed through or handled
    if (error.message.includes('not found') ||
        error.message.includes('not available') ||
        error.message.includes('not belong') ||
        error.message.includes('This trip is not available for booking')) {
      return res.status(400).json({ message: error.message });
    }
    // General error for other cases
    res.status(500).json({ message: 'Failed to create booking.', details: error.message });
  }
};

const handleGetMyBookings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const bookings = await bookingService.getMyBookings(userId);
    if (bookings.length === 0) {
        return res.status(200).json({ message: 'You have no bookings yet.', bookings: []});
    }
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Get My Bookings Error:', error);
    res.status(500).json({ message: 'Failed to retrieve your bookings.', details: error.message });
  }
};

module.exports = {
  handleCreateBooking,
  handleGetMyBookings,
};
