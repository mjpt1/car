import apiClient from '../apiClient';

export const getDashboardData = async () => {
  try {
    const response = await apiClient.get('/users/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch dashboard data');
  }
};

// You can also move getUserProfile and updateUserProfile here from UserProfileForm component
// to centralize all user-related API calls.

// export const getUserProfile = async () => { ... };
// export const updateUserProfile = async (profileData) => { ... };
