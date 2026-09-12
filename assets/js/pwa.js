/* Installation is browser-controlled; never imitate an unavailable native prompt. */
(function () {
  'use strict';
  var actions = document.getElementById('pwa-actions');
  var install = document.getElementById('pwa-install');
  var help = document.getElementById('pwa-help');
  var status = document.getElementById('pwa-status');
  var update = document.getElementById('pwa-update');
  var refresh = document.getElementById('pwa-refresh');
  var standalone = window.matchMedia('(display-mode: standalone)');
  var promptEvent = null;
  var registration;
  var reloading = false;
  var updating = false;
  var offlineReady = false;

  function installed() { return standalone.matches || window.navigator.standalone === true; }
  function render() {
    actions.hidden = false;
    help.hidden = installed();
    install.hidden = installed() || !promptEvent;
    if (!navigator.onLine) {
      status.textContent = 'You are offline. External project links and contact services need internet.';
    } else if (offlineReady) {
      status.textContent = 'Portfolio saved for offline use. External links need internet.';
    } else {
      status.textContent = installed() ? 'Running as an installed app.' : '';
    }
  }
  render();
  window.addEventListener('online', render);
  window.addEventListener('offline', render);
  if (standalone.addEventListener) standalone.addEventListener('change', render);
  window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault();
    promptEvent = event;
    render();
  });
  window.addEventListener('appinstalled', function () {
    promptEvent = null;
    render();
    help.hidden = true;
    status.textContent = 'Portfolio installed. Open it from your device’s apps.';
  });
  install.addEventListener('click', async function () {
    if (!promptEvent) return;
    var event = promptEvent;
    promptEvent = null;
    install.disabled = true;
    try {
      await event.prompt();
      await event.userChoice;
    } catch (error) {
      console.warn('Install prompt unavailable:', error);
    } finally {
      install.disabled = false;
      render();
    }
  });
  document.getElementById('pwa-later').addEventListener('click', function () {
    update.hidden = true;
  });
  refresh.addEventListener('click', function () {
    if (!registration || !registration.waiting) return;
    updating = true;
    refresh.disabled = true;
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  });
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (updating && !reloading) {
      reloading = true;
      window.location.reload();
    }
  });
  window.addEventListener('load', async function () {
    try {
      registration = await navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' });
      if (registration.waiting) update.hidden = false;
      registration.addEventListener('updatefound', function () {
        var worker = registration.installing;
        if (!worker) return;
        worker.addEventListener('statechange', function () {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) update.hidden = false;
        });
      });
      await navigator.serviceWorker.ready;
      offlineReady = true;
      render();
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible' && navigator.onLine) {
          registration.update().catch(function () { /* Retry on next visit. */ });
        }
      });
    } catch (error) {
      console.warn('Offline setup failed:', error);
      status.textContent = 'Offline setup is unavailable. You can still browse online; try reloading later.';
    }
  });
})();
