/* main.js — init, IntersectionObserver, scroll behavior, custom cursor */

/* ── Custom cursor ──────────────────────────────────────────────────────── */

function initCursor() {
  if (!window.matchMedia('(hover: hover)').matches) return;

  var cursor = document.createElement('div');
  cursor.id = 'cursor';
  cursor.setAttribute('data-state', 'default');
  document.body.appendChild(cursor);

  document.addEventListener('mousemove', function (e) {
    cursor.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px) translate(-50%,-50%)';
    cursor.style.opacity = '1';
  });

  document.addEventListener('mouseleave', function () { cursor.style.opacity = '0'; });
  document.addEventListener('mouseenter', function () { cursor.style.opacity = '1'; });

  var currentState = 'default';

  function getState(el) {
    if (!el) return 'default';
    if (el.closest('[data-cursor="text"]')) return 'text';
    if (el.closest('[data-cursor="hover"]') || el.closest('a') || el.closest('button')) return 'hover';
    return 'default';
  }

  document.addEventListener('mouseover', function (e) {
    var next = getState(e.target);
    if (next === currentState) return;
    currentState = next;
    cursor.setAttribute('data-state', currentState);
  });
}

/* ── IntersectionObserver for scroll reveals ────────────────────────────── */

function initScrollReveal() {
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll('.reveal, .reveal-stagger').forEach(function (el) {
    observer.observe(el);
  });
}

/* ── Nav initialization ─────────────────────────────────────────────────── */

function initNav() {
  var nav = document.getElementById('site-nav');
  if (!nav) return;

  var path = window.location.pathname.toLowerCase();
  var page =
    path.includes('work') || path.includes('case-study') ? 'work' :
    path.includes('art')                                  ? 'art'  :
    path.includes('about')                                ? 'about': 'home';

  nav.querySelectorAll('.nav-link').forEach(function (link) {
    if (link.dataset.page === page) {
      link.classList.add('is-active');
    }
  });

  var hamburger = document.getElementById('nav-hamburger');
  var overlay   = document.getElementById('nav-overlay');
  var closeBtn  = document.getElementById('nav-overlay-close');

  if (hamburger && overlay) {
    hamburger.addEventListener('click', function () {
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        overlay.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    }

    overlay.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        overlay.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

  window.addEventListener('scroll', function () {
    if (window.scrollY > 60) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
  }, { passive: true });
}

/* ── Load component HTML ────────────────────────────────────────────────── */

function loadNav() {
  var placeholder = document.getElementById('nav-placeholder');
  if (!placeholder) return;

  fetch('components/nav.html')
    .then(function (r) { return r.text(); })
    .then(function (html) {
      placeholder.innerHTML = html;
      initNav();
      document.fonts.ready.then(function () {
        if (typeof initAccents !== 'undefined') initAccents();
      });
    })
    .catch(function (err) {
      console.warn('Nav load failed:', err);
    });
}

function loadFooter() {
  var placeholder = document.getElementById('footer-placeholder');
  if (!placeholder) return;

  fetch('components/footer.html')
    .then(function (r) { return r.text(); })
    .then(function (html) {
      placeholder.innerHTML = html;
    })
    .catch(function (err) {
      console.warn('Footer load failed:', err);
    });
}

/* ── Boot ───────────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', function () {
  initCursor();
  initTransitions();
  loadNav();
  loadFooter();
  initScrollReveal();
});
