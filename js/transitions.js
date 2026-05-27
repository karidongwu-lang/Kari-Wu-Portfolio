/* transitions.js — page-to-page fade transitions */

function initTransitions() {
  document.body.classList.add('page-enter');

  /* Fix white screen on back navigation (bfcache restore) */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      document.body.classList.remove('page-exit');
      document.body.classList.add('page-enter');
    }
  });

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href]');
    if (!link) return;

    var href = link.getAttribute('href');
    if (
      !href ||
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      link.target === '_blank'
    ) return;

    e.preventDefault();
    document.body.classList.remove('page-enter');
    document.body.classList.add('page-exit');

    var dest = href;
    setTimeout(function () {
      window.location.href = dest;
    }, 200);
  });
}
