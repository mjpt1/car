import apiClient from '../apiClient';
import { format } from 'date-fns';

export const getBookingsReport = async (params) => {
  // params: { page, limit, status, driverId, startDate, endDate }
  try {
    const response = await apiClient.get('/admin/reports/bookings', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching bookings report:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch bookings report');
  }
};

export const getFinancialReport = async (params) => {
  // params: { startDate, endDate }
  try {
    const response = await apiClient.get('/admin/reports/financial', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching financial report:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch financial report');
  }
};

export const getSystemStats = async () => {
  try {
    const response = await apiClient.get('/admin/reports/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching system stats:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch system stats');
  }
};

export const downloadBookingsCsv = async (params) => {
    try {
        const response = await apiClient.get('/admin/reports/bookings/download', {
            params,
            responseType: 'blob', // Important to handle the file download correctly
        });

        // Create a URL for the blob
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        const fileName = `bookings_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        link.setAttribute('download', fileName);

        // Append to html link element page
        document.body.appendChild(link);

        // Start download
        link.click();

        // Clean up and remove the link
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error('Error downloading bookings CSV:', error);
        throw new Error('Failed to download report');
    }
};
