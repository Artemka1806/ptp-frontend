import axios from 'axios';
import router from './router';

const API_URL = import.meta.env.VITE_API_URL;

const $api = axios.create({
  withCredentials: true,
  baseURL: API_URL,
});

$api.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
  return config;
});

$api.interceptors.response.use(
  response => response,
  async error => {
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

// Plant endpoints
export const createPlant = (plantData) => {
  return $api.post('/v1/plant', plantData);
};

export const getPlantByCode = (code) => {
  return $api.get(`/v1/plant/${code}`);
};

export const getPlanHistoryByCode = (code) => {
  return $api.get(`/v1/plant/${code}/history?limit=10`);
};

export const getPlantAdviceByCode = (code) => {
  return $api.get(`/v1/plant/${code}/advice`);
};

export const updatePlantByCode = (code, plantStats) => {
  return $api.put(`/v1/plant/${code}`, plantStats);
};

export const deletePlantByCode = (code) => {
  return $api.delete(`/v1/plant/${code}`);
}

