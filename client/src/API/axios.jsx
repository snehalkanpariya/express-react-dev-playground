import axios from 'axios';

// Create a dedicated Axios instance
const API = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true, // 👈 REQUIRED: Tells browser to include HttpOnly cookies with cross-origin requests
  headers: { 'Content-Type': 'application/json' }
});

// In-memory variable to hold the short-lived access token securely
let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => {
  return accessToken;
};

// 1. REQUEST INTERCEPTOR: Attach Access Token to every outgoing request
API.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. RESPONSE INTERCEPTOR: Handle expired tokens & silent refresh
API.interceptors.response.use(
  (response) => response, // Pass through successful responses
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 (Unauthorized) and we haven't tried retrying yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark request as retried to prevent infinite loops

      try {
        // Call the refresh endpoint (HttpOnly cookie goes automatically with withCredentials: true)
        const response = await axios.post('http://localhost:3000/api/auth/refresh', {}, {
          withCredentials: true
        });

        const newAccessToken = response.data.accessToken;
        
        // Save the new token in memory
        setAccessToken(newAccessToken);

        // Update authorization header on the original failed request and retry it
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return API(originalRequest);
      } catch (refreshError) {
        // If refresh token is also expired or invalid, force logout / redirect to login
        console.error('Refresh token expired or invalid. Logging out.');
        setAccessToken(null);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;