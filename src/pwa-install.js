export default () => {
  // Determine whether the PWA has already been installed.
  let pwaInstalled = localStorage.getItem('pwaInstalled') === 'yes';

  // Check if the display-mode indicates a PWA.
  if (!pwaInstalled && window.matchMedia('(display-mode: standalone)').matches) {
    localStorage.setItem('pwaInstalled', 'yes');
    pwaInstalled = true;
  }

  // Check if the navigator is in standalone mode.
  if (!pwaInstalled && window.navigator.standalone === true) {
    localStorage.setItem('pwaInstalled', 'yes');
    pwaInstalled = true;
  }

  // Store the deferred prompt event.
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
  });

  window.addEventListener('appinstalled', () => {
    localStorage.setItem('pwaInstalled', 'yes');
    pwaInstalled = true;
  });

  // Return a prompt() function that can be called to trigger the install prompt.
  return async () => {
    if (!deferredPrompt) {
      console.log('PWA install prompt is not available.');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('PWA was installed successfully.');
      localStorage.setItem('pwaInstalled', 'yes');
      pwaInstalled = true;
    } else {
      console.log('PWA installation was rejected.');
    }
    deferredPrompt = null;
  };
};

