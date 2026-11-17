/**
 * This project ships as a PWA, so a production build registers a service worker
 * that caches assets. `next dev` then serves different assets from the same
 * origin, and the stale worker answers with old JS chunks — which surfaces as
 * "Element type is invalid. Received a promise that resolves to: undefined".
 *
 * This used to be a client component, but a client component is itself a JS
 * chunk the stale worker can serve stale. So it is an inline script in the HTML
 * instead: it runs before React and does not depend on any cached chunk.
 * Rendered only in development; production output contains nothing.
 */
const SCRIPT = `(function(){
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.getRegistrations().then(function(regs){
    if (!regs.length) return;
    return Promise.all(regs.map(function(r){ return r.unregister(); }))
      .then(function(){ return window.caches ? caches.keys() : []; })
      .then(function(keys){ return Promise.all(keys.map(function(k){ return caches.delete(k); })); })
      .then(function(){
        try { if (sessionStorage.getItem('dev-sw-cleared')) return; sessionStorage.setItem('dev-sw-cleared','1'); } catch (e) {}
        console.info('[dev] Removed a stale service worker and its caches. Reloading.');
        location.reload();
      });
  }).catch(function(){});
})();`;

export default function DevSwGuard() {
  if (process.env.NODE_ENV !== 'development') return null;
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
