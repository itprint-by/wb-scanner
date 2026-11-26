const CACHE = 'itprint-scanner-v6-2';
const SHELL = ['./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('itprint-scanner-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
 const u = new URL(e.request.url);
 if (e.request.method !== 'GET' || u.origin !== self.location.origin) return;
 const catalog = u.pathname === new URL('./catalog.json', self.location.href).pathname;
 const page = e.request.mode === 'navigate' && [new URL('./',self.location.href).pathname,new URL('./index.html',self.location.href).pathname].includes(u.pathname);
 if (!catalog && !page) return;
 const key = new URL(catalog ? './catalog.json' : './index.html',self.location.href).href;
 e.respondWith((async () => { const c = await caches.open(CACHE); try { const r = await fetch(e.request,{cache:'no-store'}); if (!r.ok) throw Error('HTTP '+r.status); if(catalog) await r.clone().json(); await c.put(key,r.clone()); return r; } catch(err) { return await c.match(key) || Response.error(); } })());
});
