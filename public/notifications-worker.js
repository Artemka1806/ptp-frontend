self.addEventListener('push', event => {
  const data = event.data.json();
  const title = data.title || "Сповіщення";
  const options = {
    body: data.body,
    icon: '/icons/icon-256x256.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url,
      timestamp: new Date().getTime()
    },
    actions: [
      {
        action: 'view',
        title: 'Переглянути'
      },
      {
        action: 'close',
        title: 'Закрити'
      }
    ]
  };
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
