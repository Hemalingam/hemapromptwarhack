const CACHE_NAME = 'anchor-pwa-v1';
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
  './src/js/ai/voice-engine.js',
  './src/js/ai/crisis-ai.js',
  './src/js/components/ZeroTypingWheel.js',
  './src/js/components/BreathingCircle.js',
  './src/js/components/EmergencySOS.js',
  './src/js/components/VoiceJournal.js',
  './src/js/components/SafetyCheckin.js',
  './src/js/components/CaregiverCoach.js',
  './src/js/components/EducationHub.js',
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
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
