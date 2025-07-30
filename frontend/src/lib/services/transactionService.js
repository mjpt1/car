import apiClient from '../apiClient';

// For regular users to see their own transactions
export const listMyTransactions = async (params) => {
  // params: { page, limit }
  try {
    const response = await apiClient.get('/transactions', { params });
    return response.data;
  } catch (error) {
    console.error('Error listing user transactions:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to list user transactions');
  }
};

// For admins to see all transactions
export const listAllTransactions = async (params) => {
  // params: { page, limit, userId, status }
  try {
    const response = await apiClient.get('/admin/transactions', { params });
    return response.data;
  } catch (error) {
    console.error('Error listing all transactions:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to list all transactions');
  }
};
