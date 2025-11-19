// FILE: gita/app.js
// Very simple router just for Gita Ashram mini-app

(function router() {
  function route() {
    let hash = window.location.hash || '';

    // For the Gita mini-app:
    // - If there is no hash, go to #gita-ashram
    // - If someone lands on #hub or #aurobindo by mistake, also go to #gita-ashram
    if (!hash || hash === '#hub' || hash === '#aurobindo') {
      hash = '#gita-ashram';
      if (window.location.hash !== '#gita-ashram') {
        window.location.hash = '#gita-ashram';
      }
    }

    // Show only the section that matches the hash
    document.querySelectorAll('main > section').forEach((sec) => {
      const idHash = '#' + sec.id;
      sec.style.display = (idHash === hash) ? 'block' : 'none';
    });
  }

  window.addEventListener('hashchange', route);
  window.addEventListener('DOMContentLoaded', route);
  route();
})();
