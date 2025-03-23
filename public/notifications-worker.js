self.addEventListener('push', event => {
  const data = event.data.json();
  const title = data.title || "Сповіщення";
  const options = {
    body: data.body,
    icon: '/icons/icon-256x256.png',
    data: { url: data.url }
  };
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close(); // Закриваємо сповіщення
  const url = event.notification.data.url;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (let client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
