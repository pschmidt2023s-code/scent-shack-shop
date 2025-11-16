const CACHE_NAME = 'aldenair-v2'
const STATIC_CACHE = 'aldenair-static-v2'
const DYNAMIC_CACHE = 'aldenair-dynamic-v2'

const staticAssets = [
  '/',
  '/manifest.json',
]

// Install - cache static assets
self.addEventListener('install', event => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(staticAssets))
  )
})

// Activate - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map(key => caches.delete(key))
      )
    )
  )
  return self.clients.claim()
})

// Fetch - Network First for API, Cache First for assets
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip Supabase requests
  if (url.hostname.includes('supabase.co')) {
    return event.respondWith(fetch(request))
  }

  // Network first for HTML
  if (request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone()
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, clone))
          return response
        })
        .catch(() => caches.match(request))
    )
    return
  }

  // Cache first for assets
  event.respondWith(
    caches.match(request)
      .then(cached => cached || fetch(request)
        .then(response => {
          const clone = response.clone()
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, clone))
          return response
        })
      )
  )
})
