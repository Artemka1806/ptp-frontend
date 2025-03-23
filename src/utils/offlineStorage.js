export const offlineStorage = {
  saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },

  getData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },

  removeData(key) {
    localStorage.removeItem(key);
  },

  // Зберігання кешованих API відповідей
  saveApiResponse(endpoint, data) {
    const apiCache = this.getData('api-cache') || {};
    apiCache[endpoint] = {
      data,
      timestamp: Date.now(),
    };
    this.saveData('api-cache', apiCache);
  },

  getApiResponse(endpoint) {
    const apiCache = this.getData('api-cache') || {};
    return apiCache[endpoint]?.data || null;
  },

  // Додати до черги запитів для синхронізації
  addToSyncQueue(method, endpoint, data) {
    const syncQueue = this.getData('sync-queue') || [];
    syncQueue.push({
      method,
      endpoint,
      data,
      timestamp: Date.now()
    });
    this.saveData('sync-queue', syncQueue);
  },

  getSyncQueue() {
    return this.getData('sync-queue') || [];
  },

  clearSyncItem(index) {
    const syncQueue = this.getSyncQueue();
    syncQueue.splice(index, 1);
    this.saveData('sync-queue', syncQueue);
  },

  // Збереження останніх даних WebSocket
  saveWebSocketData(key, data) {
    const wsData = {
      data: data,
      timestamp: Date.now()
    };
    localStorage.setItem(`ws-${key}`, JSON.stringify(wsData));
  },

  // Отримання збережених даних WebSocket
  getWebSocketData(key) {
    const wsDataStr = localStorage.getItem(`ws-${key}`);
    if (wsDataStr) {
      try {
        return JSON.parse(wsDataStr).data;
      } catch (e) {
        console.error('Помилка парсингу кешованих WebSocket даних', e);
        return null;
      }
    }
    return null;
  },

  // Отримання часу останнього оновлення даних WebSocket
  getWebSocketTimestamp(key) {
    const wsDataStr = localStorage.getItem(`ws-${key}`);
    if (wsDataStr) {
      try {
        return JSON.parse(wsDataStr).timestamp;
      } catch (e) {
        return null;
      }
    }
    return null;
  }
};
