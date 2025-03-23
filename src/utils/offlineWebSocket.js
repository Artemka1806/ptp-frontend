import { offlineStorage } from './offlineStorage';

export class OfflineAwareWebSocket {
  constructor(url, options = {}) {
    this.url = url;
    this.options = options;
    this.connection = null;
    this.isConnected = false;
    this.reconnectInterval = options.reconnectInterval || 5000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
    this.reconnectAttempts = 0;
    this.storageKey = options.storageKey || 'default-websocket';
    this.handlers = {
      message: [],
      open: [],
      close: [],
      error: []
    };

    // Перевірка статусу з'єднання при створенні
    this.checkConnectionStatus();

    // Додати слухачів стану мережі
    window.addEventListener('online', this.handleOnlineStatus);
    window.addEventListener('offline', this.handleOfflineStatus);
  }

  // Підключення до WebSocket серверу
  connect() {
    if (!navigator.onLine) {
      console.log('Пристрій офлайн, використовуються кешовані дані');
      this.loadCachedData();
      return;
    }

    try {
      this.connection = new WebSocket(this.url);

      this.connection.onopen = (event) => {
        console.log('WebSocket з\'єднання встановлено');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.triggerHandlers('open', event);
      };

      this.connection.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // Кешуємо отримані дані
        offlineStorage.saveWebSocketData(this.storageKey, data);
        this.triggerHandlers('message', { data });
      };

      this.connection.onerror = (error) => {
        console.error('Помилка WebSocket:', error);
        this.triggerHandlers('error', error);
      };

      this.connection.onclose = (event) => {
        this.isConnected = false;
        console.log('WebSocket з\'єднання закрито:', event);
        this.triggerHandlers('close', event);

        if (navigator.onLine && this.reconnectAttempts < this.maxReconnectAttempts) {
          console.log(`Спроба повторного підключення ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts}...`);
          this.reconnectAttempts++;
          setTimeout(() => this.connect(), this.reconnectInterval);
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.log('Досягнуто максимальну кількість спроб підключення');
          this.loadCachedData();
        }
      };
    } catch (error) {
      console.error('Помилка створення WebSocket з\'єднання:', error);
      this.loadCachedData();
    }
  }

  // Завантаження кешованих даних при відсутності з'єднання
  loadCachedData() {
    const cachedData = offlineStorage.getWebSocketData(this.storageKey);
    if (cachedData) {
      const timestamp = offlineStorage.getWebSocketTimestamp(this.storageKey);
      const age = timestamp ? Math.floor((Date.now() - timestamp) / 1000 / 60) : 'невідомо';

      console.log(`Використовуються кешовані дані (вік: ${age} хв)`);
      this.triggerHandlers('message', {
        data: cachedData,
        offline: true,
        timestamp: timestamp
      });
    } else {
      console.log('Немає кешованих даних WebSocket');
      this.triggerHandlers('error', {
        message: 'No cached data available',
        offline: true
      });
    }
  }

  // Перевірка та відображення статусу з'єднання
  checkConnectionStatus() {
    if (!navigator.onLine) {
      this.handleOfflineStatus();
    } else {
      this.connect();
    }
  }

  // Обробник події переходу в онлайн режим
  handleOnlineStatus = () => {
    console.log('З\'єднання відновлено, перепідключаємось до WebSocket');
    if (this.connection) {
      this.connection.close();
    }
    this.reconnectAttempts = 0;
    this.connect();
  }

  // Обробник події переходу в офлайн режим
  handleOfflineStatus = () => {
    console.log('З\'єднання втрачено, переходимо в офлайн режим');
    if (this.connection) {
      this.connection.close();
    }
    this.loadCachedData();
  }

  // Закриття з'єднання
  close() {
    if (this.connection) {
      this.connection.close();
    }
    window.removeEventListener('online', this.handleOnlineStatus);
    window.removeEventListener('offline', this.handleOfflineStatus);
  }

  // Реєстрація обробників подій
  on(event, callback) {
    if (this.handlers[event]) {
      this.handlers[event].push(callback);
    }
    return this;
  }

  // Виклик обробників подій
  triggerHandlers(event, data) {
    if (this.handlers[event]) {
      this.handlers[event].forEach(handler => handler(data));
    }
  }
}
