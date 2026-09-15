"use strict";
const CACHE_NAME="blockforge-v1.0.8";
const CORE_ASSETS=["./","./index.html","./style.css","./game.js","./manifest.webmanifest","./icons/icon.svg","./icons/icon-maskable.svg"];
self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE_ASSETS.map(url=>new Request(url,{cache:"reload"})))));
  // Activate after existing game tabs close, so versions are not mixed mid-game.
});
self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("blockforge-")&&key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=="GET"||url.origin!==self.location.origin) return;
  event.respondWith(caches.open(CACHE_NAME).then(async cache=>{
    const cached=await cache.match(event.request.mode==="navigate"?"./index.html":event.request,{ignoreSearch:true});
    return cached||fetch(event.request);
  }));
});




self.addEventListener("message",event=>{
  if(event.data?.type==="ACTIVATE_UPDATE") event.waitUntil(self.skipWaiting());
});



