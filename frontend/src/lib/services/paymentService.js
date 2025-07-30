import apiClient from '../apiClient';

export const requestPayment = async (bookingId, gateway = 'mock_gateway') => {
  try {
    const response = await apiClient.post('/payments/request', {
      booking_id: bookingId,
      gateway: gateway,
    });
    return response.data; // Expected: { payment_url, transaction_id, message }
  } catch (error) {
    console.error('Error requesting payment:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to request payment');
  }
};

// The verify payment is handled by a backend endpoint and redirect,
// so no direct service call is needed from the frontend for verification itself.
// The result page will just display the query params from the redirect URL.
