import apiClient from '../apiClient'; // Assuming apiClient is configured for JWT

export const searchTrips = async (params) => {
  // params = { origin: string, destination: string, date: string (YYYY-MM-DD), passengers?: int }
  try {
    const response = await apiClient.get('/trips/search', { params });
    return response.data; // Expected to be an array of trips or { message, trips }
  } catch (error) {
    console.error('Error searching trips:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to search trips');
  }
};

export const getTripDetails = async (tripId) => {
  try {
    const response = await apiClient.get(`/trips/${tripId}`);
    return response.data; // Expected to be detailed trip object with seats and layout
  } catch (error) {
    console.error(`Error fetching trip details for ID ${tripId}:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch trip details');
  }
};

// Admin function - to be used in Phase 5, but defined here as part of trip services
export const createTrip = async (tripData) => {
  // tripData = { origin_location, destination_location, departure_time, estimated_arrival_time, driver_id, base_seat_price, notes? }
  try {
    const response = await apiClient.post('/trips', tripData);
    return response.data; // Expected to be { message, trip }
  } catch (error) {
    console.error('Error creating trip:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to create trip');
  }
};
