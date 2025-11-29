// public/sw.js

self.addEventListener("install", (event) => {
  // opzionale: qui potresti mettere in cache asset statici
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Per ora lasciamo passare tutte le richieste direttamente alla rete.
  // In futuro puoi aggiungere logica di cache qui.
});
