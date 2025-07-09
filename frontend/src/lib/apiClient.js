import axios from 'axios';
import Cookies from 'js-cookie';

// Determine the backend URL based on the environment
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('authToken'); // Assuming you store token in a cookie named 'authToken'
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Interceptor to handle responses, e.g., for global error handling like 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized errors, e.g., redirect to login, clear session
      // This might be better handled in AuthContext or specific page/component logic
      // For now, just log it or re-throw
      console.error('Unauthorized access - 401', error.response.data);
      // Cookies.remove('authToken');
      // window.location.href = '/login'; // Force redirect - careful with this in Next.js
    }
    return Promise.reject(error);
  }
);

export default apiClient;
