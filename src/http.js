import axios from 'axios';
import router from './router';
import { offlineStorage } from './utils/offlineStorage';

const API_URL = import.meta.env.VITE_API_URL;

const $api = axios.create({
  withCredentials: true,
  baseURL: API_URL,
});

$api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (!navigator.onLine) {
    // Для GET запитів повертаємо кешовані дані
    if (config.method === 'get') {
      const cachedData = offlineStorage.getApiResponse(config.url);
      if (cachedData) {
        const mockResponse = {
          data: cachedData,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: config,
          offline: true
        };

        return Promise.resolve({
          ...config,
          adapter: () => Promise.resolve(mockResponse)
        });
      }

      // Якщо немає кешованих даних, повідомляємо про помилку
      return Promise.reject({
        message: 'No cached data available for this request',
        offline: true,
        noCache: true
      });
    } else {
      // Для не-GET запитів додаємо до черги синхронізації
      offlineStorage.addToSyncQueue(config.method, config.url, config.data);
      return Promise.resolve({
        ...config,
        adapter: () => Promise.resolve({
          data: { message: 'Request queued for sync', offline: true },
          status: 202,
          statusText: 'Accepted',
          headers: {},
          config: config
        })
      });
    }
  }

  return config;
}, error => Promise.reject(error));

$api.interceptors.response.use(
  response => {
    // Кешуємо відповіді для GET запитів за нормальної мережі
    if (response.config.method === 'get' && navigator.onLine) {
      offlineStorage.saveApiResponse(response.config.url, response.data);
    }
    return response;
  },
  async error => {
    // Оброблення помилок офлайн-режиму було переміщено до request interceptor
    // Це обробляє тільки реальні помилки від сервера

    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 404 &&
      error.response.data &&
      error.response.data.detail === "Authorized user could not be found" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        let exchangeData = await exchange();
        if (exchangeData.status != 200) {
          localStorage.removeItem("token");
          return router.push('login');
        }
        originalRequest.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
        return $api(originalRequest);
      } catch (e) {
        return Promise.reject(e);
      }
    }

    // Для офлайн-помилок без кешу - показуємо повідомлення користувачу
    if (error.offline && error.noCache) {
      console.warn('No cached data available while offline');
    }

    return Promise.reject(error);
  }
);

// Auth endpoints
export const signup = (userData) => {
  return $api.post('/v1/auth/signup', userData)
    .then(response => {
      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      return response;
    });
};

export const login = (credentials) => {
  return $api.post('/v1/auth/login', credentials)
    .then(response => {
      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      return response;
    });
};

export const exchange = () => {
  return $api.post('/v1/auth/exchange', {}, {
    validateStatus: () => true
  })
    .then(response => {
      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      return response;
    });
};

export const logout = () => {
  return $api.post('/v1/auth/logout', {}, {
    withCredentials: true,
    validateStatus: () => true
  })
    .then(response => {
      localStorage.removeItem("token");
      return response;
    })
    .catch(error => {
      localStorage.removeItem("token");
      throw error;
    });
};

// User endpoints
export const getMe = () => {
  return $api.get('/v1/user/me');
};

export const getUserPlants = () => {
  return $api.get('/v1/user/plants');
};

export const subscribeToNotifications = (subscription) => {
  return $api.post('/v1/subscription/subscribe', subscription);
}

// Plant endpoints
export const createPlant = (plantData) => {
  return $api.post('/v1/plant', plantData);
};

export const getPlantByCode = (code) => {
  return $api.get(`/v1/plant/${code}`);
};

export const getPlanHistoryById = (id) => {
  return $api.get(`/v1/plant/${id}/history?limit=7`);
};

export const getPlantAdviceById = (id) => {
  return $api.get(`/v1/plant/${id}/advice`);
};

export const getPlantWeeklyAdviceById = (id) => {
  return $api.get(`/v1/plant/${id}/weekly-advice`);
};

export const updatePlantByCode = (code, plantStats) => {
  return $api.put(`/v1/plant/${code}`, plantStats);
};

export const deletePlantById = (id) => {
  return $api.delete(`/v1/plant/${id}`);
}

// Function to sync offline requests
export async function syncOfflineRequests() {
  const queue = offlineStorage.getSyncQueue();

  for (let i = 0; i < queue.length; i++) {
    const request = queue[i];
    try {
      await $api({
        method: request.method,
        url: request.endpoint,
        data: request.data
      });
      offlineStorage.clearSyncItem(i);
      i--; // Adjust index after removing item from queue
    } catch (error) {
      console.error('Sync error:', error);
      // Leave request in queue for next attempt
    }
  }
}

