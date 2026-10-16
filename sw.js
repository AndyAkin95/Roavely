const CACHE='roavely-v13-owner-terms-20261015';
const ASSETS=['./','./index.html','./styles.css','./phase3.css','./app.js','./phase3-discover.js','./phase3-crew.js','./phase3-planner.js','./phase4.css','./phase4-board.js','./phase4-finance.js','./phase4-personal.js','./phase4-packing.js','./phase4-location.js','./phase4-memories.js','./cloud.css','./trip-theme.css','./terms.html','./themes/japan.svg','./themes/australia.svg','./themes/iceland.svg','./themes/italy.svg','./cloud-core.js','./cloud-actions.js','./roavely-bundle.js','./manifest.json','./icons/apple-touch-icon.png','./icons/favicon.png','./icons/roavely.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()]))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
  e.respondWith(fetch(e.request).then(res=>{
    if(res.ok){const copy=res.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put(e.request,copy)))}
    return res;
  }).catch(async()=>await caches.match(e.request,{ignoreSearch:true})||((e.request.mode==='navigate')?await caches.match('./index.html'):Response.error())));
});
