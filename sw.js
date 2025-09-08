const CACHE_NAME = 'bodega-lang-v1.0.0';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './retiro-styles.css',
  './script.js',
  './productos-adicionales.js',
  './firebase-config.js',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Error caching files:', error);
      })
  );
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercepción de peticiones (estrategia cache-first)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si está en cache, devolver desde cache
        if (response) {
          return response;
        }
        
        // Si no está en cache, hacer fetch y cachear
        return fetch(event.request).then((response) => {
          // Verificar si la respuesta es válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clonar respuesta para el cache
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // Si está offline y es una página HTML, mostrar página offline básica
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      })
  );
});

// Notificaciones push (opcional)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación de Bodega L.A.N.G.',
    icon: './manifest.json',
    badge: './manifest.json',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver detalles',
        icon: './manifest.json'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: './manifest.json'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Bodega L.A.N.G.', options)
  );
});

// Manejo de clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow('./'));
  }
});
