self.addEventListener('push', event => {
  const data = event.data.json();
  const title = data.title || "Сповіщення";
  const options = {
    body: data.body,
    icon: '/icons/icon-48x48.png'
  };
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
