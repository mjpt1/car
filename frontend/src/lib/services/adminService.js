import apiClient from '../apiClient';

// --- User Management ---
export const listUsers = async (params) => {
  // params: { search, page, limit }
  try {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  } catch (error) {
    console.error('Error listing users:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to list users');
  }
};

// --- Driver Management ---
export const listDrivers = async (params) => {
  // params: { status, page, limit }
  try {
    const response = await apiClient.get('/admin/drivers', { params });
    return response.data;
  } catch (error) {
    console.error('Error listing drivers:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to list drivers');
  }
};

export const getDriverDetails = async (driverId) => {
  try {
    const response = await apiClient.get(`/admin/drivers/${driverId}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting driver details for ID ${driverId}:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to get driver details');
  }
};

export const updateDriverStatus = async (driverId, status) => {
  try {
    const response = await apiClient.post(`/admin/drivers/${driverId}/update-status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating driver status for ID ${driverId}:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to update driver status');
  }
};

export const updateDocumentStatus = async (documentId, status, review_notes) => {
  try {
    const response = await apiClient.post(`/admin/documents/${documentId}/update-status`, { status, review_notes });
    return response.data;
  } catch (error) {
    console.error(`Error updating document status for ID ${documentId}:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to update document status');
  }
};

// --- Trip Management (to be added) ---
// export const adminListTrips = async (params) => { ... }
// export const adminUpdateTrip = async (tripId, data) => { ... }
// export const adminDeleteTrip = async (tripId) => { ... }
