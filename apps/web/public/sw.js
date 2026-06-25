const CACHE = 'dehna-static-v1';
const STATIC = ['/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'];

const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Dehna — offline</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.5rem;padding:2rem;background:#f5f3ef;color:#1c1510;text-align:center}
    h1{font-size:1.8rem;font-weight:300;letter-spacing:-0.02em}
    p{font-size:0.9rem;color:#6b6358;max-width:300px;line-height:1.6}
    button{margin-top:.5rem;padding:.7rem 2rem;background:#d3643b;color:#fff;border:none;border-radius:999px;font-size:1rem;cursor:pointer}
  </style>
</head>
<body>
  <h1>ደህና</h1>
  <p>You're offline. Your timer and history are still saved — reconnect to resume.</p>
  <button onclick="location.reload()">Try again</button>
</body>
</html>`;

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => {
        return Promise.allSettled(STATIC.map((url) => c.add(url)));
      })
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  // Static assets: cache-first
  if (
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/manifest.json' ||
    url.pathname.match(/\.(png|svg|ico|webp|woff2?)$/)
  ) {
    e.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
          return res;
        });
      }),
    );
    return;
  }

  // Navigation: network-first, inline offline page on failure
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).catch(() =>
        new Response(OFFLINE_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8' } }),
      ),
    );
  }
});
