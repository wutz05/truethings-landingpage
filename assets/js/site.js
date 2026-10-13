// TrueThings website: menu, cookie consent and analytics. No dependencies.
// Google Analytics loads only after consent (same storage key as the old site,
// so earlier choices carry over).
(function () {
  'use strict';

  var GA_ID = 'G-9DBQZPQXPS';
  var KEY = 'tt_cookie_consent';

  // ---- menu (mobile)
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.menu-toggle');
  if (header && toggle) {
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('open')) {
        header.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  // ---- consent
  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function store(value) {
    try { localStorage.setItem(KEY, value); } catch (e) { /* private mode: ask again next time */ }
  }

  function loadGA() {
    if (window.gtag || document.getElementById('ga-script')) return;
    var s = document.createElement('script');
    s.id = 'ga-script';
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true });
  }

  var banner = document.getElementById('cookie-banner');
  function showBanner() { if (banner) banner.classList.add('visible'); }
  function hideBanner() { if (banner) banner.classList.remove('visible'); }

  if (banner) {
    banner.querySelector('[data-consent="accept"]').addEventListener('click', function () {
      store('accepted'); hideBanner(); loadGA();
    });
    banner.querySelector('[data-consent="decline"]').addEventListener('click', function () {
      store('declined'); hideBanner();
    });
  }
  document.querySelectorAll('[data-open-cookie-settings]').forEach(function (el) {
    el.addEventListener('click', showBanner);
  });

  var consent = stored();
  if (consent === 'accepted') loadGA();
  else if (!consent) setTimeout(showBanner, 1200);

  // ---- measure App Store clicks (only reaches Google with consent)
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-cta]');
    if (!a || !window.gtag) return;
    window.gtag('event', 'app_store_click', { cta_location: a.getAttribute('data-cta'), page_path: location.pathname });
  });
})();
