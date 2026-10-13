import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor — pass through response, handle global auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';

    // If unauthorized, redirect to login (except for /auth/me)
    if (
      error.response?.status === 401 &&
      !error.config.url.includes('/auth/me')
    ) {
      window.location.href = '/login';
    }

    const customErr = new Error(message);
    customErr.code = error.response?.data?.code;
    customErr.details = error.response?.data?.details;
    customErr.status = error.response?.status;
    customErr.response = error.response;

    return Promise.reject(customErr);
  }
);

export default api;
