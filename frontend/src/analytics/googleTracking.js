let installed = false;
let configuration = { trackingMode: 'off' };
let lastPage = '';
function script(id, src) {
  if (document.getElementById(id)) return;
  const element = document.createElement('script');
  element.id = id;
  element.async = true;
  element.src = src;
  document.head.appendChild(element);
}
export function installGoogleTracking(settings) {
  if (installed) return;
  configuration = settings;
  if (settings.trackingMode === 'gtm' && /^GTM-[A-Z0-9]+$/.test(settings.gtmId)) {
    installed = true;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    script('site-gtm', `https://www.googletagmanager.com/gtm.js?id=${settings.gtmId}`);
  } else if (settings.trackingMode === 'direct') {
    const ids = [settings.ga4Id, settings.googleAdsId].filter((id) =>
      /^(G-[A-Z0-9]+|AW-[0-9]+)$/.test(id),
    );
    if (!ids.length) return;
    installed = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function () {
        window.dataLayer.push(arguments);
      };
    window.gtag('js', new Date());
    for (const id of ids) window.gtag('config', id, { send_page_view: false });
    script('site-google-tag', `https://www.googletagmanager.com/gtag/js?id=${ids[0]}`);
  }
}
export function trackGooglePage(path) {
  if (!installed || lastPage === path) return;
  lastPage = path;
  // Report the path only: account/order IDs and search parameters are excluded.
  if (configuration.trackingMode === 'gtm')
    window.dataLayer.push({ event: 'store_page_view', page_path: path });
  else if (configuration.ga4Id)
    window.gtag('event', 'page_view', {
      send_to: configuration.ga4Id,
      page_location: window.location.origin + path,
    });
}
