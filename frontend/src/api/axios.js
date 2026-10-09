import axios from 'axios';

let inMemoryToken = null;
let isRefreshing = false;
let failedQueue = [];

/**
 * Update the in-memory access token.
 * Strictly stored in JS memory—never written to localStorage or sessionStorage.
 */
export const setAccessToken = (token) => {
  inMemoryToken = token;
};

export const getAccessToken = () => inMemoryToken;

// Replay or reject queued requests once refresh completes
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // CRITICAL: ensures HttpOnly refresh cookie is sent
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Request Interceptor:
 * Attaches the in-memory Access Token as Bearer in the Authorization header.
 */
api.interceptors.request.use(
  (config) => {
    if (inMemoryToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${inMemoryToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor:
 * Catches 401 Unauthorized, queues concurrent outgoing requests,
 * executes silent refresh against /api/auth/refresh using HttpOnly cookie,
 * and replays original requests with the fresh Access Token.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await api.post('/auth/refresh');
        const newAccessToken = response.data.accessToken;

        setAccessToken(newAccessToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

if (typeof window !== 'undefined') {
  window.tokenStorage = { setAccessToken, getAccessToken };
  window.api = api;
}

export default api;
