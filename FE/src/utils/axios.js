import axios from 'axios';

// Create axios instance
const axiosInstance = axios.create({
      baseURL: process.env.REACT_APP_API_URL,
});

// Request interceptor to add token to headers
axiosInstance.interceptors.request.use(
      (config) => {
            const token = localStorage.getItem('token');

            // Add token to protected routes (exclude public routes)
            const publicRoutes = ['/api/v1/auth/signin', '/api/v1/auth/signup'];
            const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));

            if (token && !isPublicRoute) {
                  config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
      },
      (error) => {
            return Promise.reject(error);
      }
);

// Response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
            // If token is expired or invalid, clear it and redirect to login
            if (error.response?.status === 401) {
                  localStorage.removeItem('token');
                  // Optionally redirect to login page
                  // window.location.href = '/login';
            }
            return Promise.reject(error);
      }
);

export default axiosInstance;
