import apiClient from '../apiClient';

export const createRating = async (ratingData) => {
  // ratingData = { trip_id: number, rating: number, comment?: string }
  try {
    const response = await apiClient.post('/ratings', ratingData);
    return response.data; // Expected: { success: true, message: '...', rating: ... }
  } catch (error) {
    console.error('Error submitting rating:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to submit rating');
  }
};
