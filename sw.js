const V='v1',S='CACHE_STATIC_'+V.toUpperCase(),D='CACHE_DYNAMIC_'+V.toUpperCase();
const SHELL=['./','index.html','offline.html','manifest.webmanifest','css/styles.css','js/db.js','js/seed-data.js','js/kanban.js','js/scheduler.js','js/clients.js','js/pwa-features.js','js/app.js','favicon.svg','assets/agac-badge.svg','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>{
 e.waitUntil(caches.open(S).then(c=>c.addAll(SHELL)));
 try{ if(e.addRoutes) e.addRoutes([{condition:{requestMode:'navigate'},source:'fetch-event'}]); }catch(_){}
});
self.addEventListener('activate',e=>e.waitUntil((async()=>{
 for(const k of await caches.keys()) if(k!==S&&k!==D) await caches.delete(k);
 await self.clients.claim();})()));
self.addEventListener('message',e=>{ if(e.data&&e.data.type==='SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch',e=>{
 const r=e.request; if(r.method!=='GET'||!r.url.startsWith(self.location.origin)) return;
 if(r.mode==='navigate'){
  e.respondWith(fetch(r).catch(async()=>(await caches.match(r,{ignoreSearch:true}))||(await caches.match('index.html'))||caches.match('offline.html')));return;}
 e.respondWith(caches.match(r).then(hit=>{
  const net=fetch(r).then(res=>{ if(res.ok){const cp=res.clone();caches.open(D).then(c=>c.put(r,cp));} return res;}).catch(()=>hit);
  return hit||net;}));
});
const idb=()=>new Promise((res,rej)=>{const q=indexedDB.open('TaskFlowAllocatorDB',1);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error);});
const all=(db,s)=>new Promise((res,rej)=>{const q=db.transaction(s).objectStore(s).getAll();q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error);});
async function urgent(){
 const db=await idb(),t=(await all(db,'tasks')).filter(x=>x.status!=='closed'&&!x.archived);
 const today=new Date().toISOString().slice(0,10);
 return t.filter(x=>x.priority==='Critical'||x.dueDate<today);}
async function refreshBadge(){
 try{const u=await urgent();
  if(self.navigator.setAppBadge){u.length?await self.navigator.setAppBadge(u.length):await self.navigator.clearAppBadge();}
  return u;}catch(_){return [];}}
self.addEventListener('sync',e=>{ if(e.tag==='tf-sync') e.waitUntil((async()=>{
 const db=await idb();await new Promise(r=>{const x=db.transaction('sync_queue','readwrite');x.objectStore('sync_queue').clear();x.oncomplete=r;});
 for(const c of await self.clients.matchAll()) c.postMessage({type:'SYNC_DONE'});})()); });
self.addEventListener('periodicsync',e=>{ if(e.tag==='sla-check') e.waitUntil((async()=>{
 const u=await refreshBadge();
 if(u.length&&self.Notification&&Notification.permission==='granted')
  await self.registration.showNotification('TaskFlow: '+u.length+' urgent or overdue',{body:u[0].id+' '+u[0].title,tag:'sla',data:{url:'./index.html?task='+u[0].id}});})()); });
self.addEventListener('push',e=>{
 let d={};try{d=e.data?e.data.json():{};}catch(_){d={title:'TaskFlow',body:e.data&&e.data.text()};}
 e.waitUntil(self.registration.showNotification(d.title||'TaskFlow',{body:d.body||'',data:{url:d.url||'./index.html'},badge:'icons/icon-96.png',icon:'icons/icon-192.png'}).then(refreshBadge));});
self.addEventListener('notificationclick',e=>{
 e.notification.close();const url=new URL((e.notification.data&&e.notification.data.url)||'./index.html',self.registration.scope).href;
 e.waitUntil((async()=>{const cs=await self.clients.matchAll({type:'window'});
  for(const c of cs){ if('focus' in c){ await c.focus(); c.postMessage({type:'OPEN',url}); return; } }
  return self.clients.openWindow(url);})());});