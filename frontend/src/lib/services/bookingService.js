import apiClient from '../apiClient';

export const createBooking = async (bookingData) => {
  // bookingData = { trip_id: number, seat_ids: number[] }
  try {
    const response = await apiClient.post('/bookings', bookingData);
    return response.data; // Expected to be the new booking object with details
  } catch (error) {
    console.error('Error creating booking:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to create booking');
  }
};

export const getMyBookings = async () => {
  try {
    const response = await apiClient.get('/bookings/my-bookings');
    return response.data; // Expected to be an array of user's bookings or { message, bookings }
  } catch (error) {
    console.error('Error fetching my bookings:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch bookings');
  }
};

// cancelBooking might be added later
// export const cancelBooking = async (bookingId) => {
//   try {
//     const response = await apiClient.post(`/bookings/${bookingId}/cancel`);
//     return response.data;
//   } catch (error) {
//     console.error(`Error cancelling booking ${bookingId}:`, error.response?.data || error.message);
//     throw error.response?.data || new Error('Failed to cancel booking');
//   }
// };
