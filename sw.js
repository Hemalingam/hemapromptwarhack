const CACHE_NAME = 'anchor-pwa-v24';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './src/css/main.css',
  './src/css/components.css',
  './src/css/emergency.css',
  './src/js/utils/storage.js',
  './src/js/utils/audio-fx.js',
  './src/js/ai/genai-engine.js',
  './src/js/ai/genai-engine-v2.js',
  './src/js/ai/voice-engine.js',
  './src/js/ai/crisis-ai.js',
  './src/js/components/ZeroTypingWheel.js',
  './src/js/components/BreathingCircle.js',
  './src/js/components/BurnoutCheck.js',
  './src/js/components/EmergencySOS.js',
  './src/js/components/VoiceJournal.js',
  './src/js/components/SafetyCheckin.js',
  './src/js/components/CaregiverCoach.js',
  './src/js/components/EducationHub.js',
  './src/js/components/SobrietyTracker.js',
  './src/js/components/PeerSupport.js',
  './src/js/components/HabitTracker.js',
  './src/js/components/IndiaDirectory.js',
  './src/js/app.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching app shell & emergency resources');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Clearing old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Cache the new response for future use
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache if offline
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('./index.html');
          }
        });
      })
  );
});
