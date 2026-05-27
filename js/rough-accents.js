/* rough-accents.js — all Rough.js sketch accent logic
   Requires roughjs CDN to be loaded first. */

(function () {
  'use strict';

  var INK = function () {
    return (
      getComputedStyle(document.documentElement)
        .getPropertyValue('--color-ink')
        .trim() || '#1A1A18'
    );
  };

  var ACCENT = function () {
    return (
      getComputedStyle(document.documentElement)
        .getPropertyValue('--color-accent')
        .trim() || '#C96B2D'
    );
  };

  var baseOpts = { roughness: 2, strokeWidth: 1.5 };

  /* ── helpers ──────────────────────────────────────────────────────────── */

  function ensureRelative(el) {
    if (getComputedStyle(el).position === 'static') {
      el.style.position = 'relative';
    }
  }

  function clearCanvas(el, cls) {
    var old = el.querySelector('canvas.' + cls);
    if (old) old.remove();
  }

  function makeCanvas(el, cls) {
    clearCanvas(el, cls);
    ensureRelative(el);
    var c = document.createElement('canvas');
    c.className = cls;
    c.style.cssText =
      'position:absolute;top:0;left:0;pointer-events:none;z-index:-1;overflow:visible;';
    el.appendChild(c);
    return c;
  }

  /* ── drawUnderline ────────────────────────────────────────────────────── */

  window.drawUnderline = function (el) {
    if (typeof rough === 'undefined') return;
    var w = el.offsetWidth;
    var h = el.offsetHeight;
    if (w === 0) return;

    var c = makeCanvas(el, 'rough-underline');
    c.width  = w + 6;
    c.height = h + 10;
    c.style.top  = '0';
    c.style.left = '-3px';

    var rc = rough.canvas(c);
    var y  = h + 5;
    rc.line(0, y, w + 6, y, Object.assign({}, baseOpts, { stroke: INK() }));
  };

  /* ── drawCircle ───────────────────────────────────────────────────────── */

  window.drawCircle = function (el) {
    if (typeof rough === 'undefined') return;
    var w = el.offsetWidth;
    var h = el.offsetHeight;
    if (w === 0) return;

    var pad = 10;
    var c = makeCanvas(el, 'rough-circle');
    var cw = w + pad * 2;
    var ch = h + pad * 2;
    c.width  = cw;
    c.height = ch;
    c.style.top  = -pad + 'px';
    c.style.left = -pad + 'px';

    var rc = rough.canvas(c);
    rc.ellipse(
      cw / 2, ch / 2, cw - 6, ch - 6,
      Object.assign({}, baseOpts, { roughness: 2.5, stroke: INK(), fill: 'none' })
    );
  };

  /* ── drawBox ──────────────────────────────────────────────────────────── */

  window.drawBox = function (el) {
    if (typeof rough === 'undefined') return;
    var w = el.offsetWidth;
    var h = el.offsetHeight;
    if (w === 0) return;

    var pad = 7;
    var c = makeCanvas(el, 'rough-box');
    var cw = w + pad * 2;
    var ch = h + pad * 2;
    c.width  = cw;
    c.height = ch;
    c.style.top  = -pad + 'px';
    c.style.left = -pad + 'px';

    var rc = rough.canvas(c);
    rc.rectangle(
      3, 3, cw - 6, ch - 6,
      Object.assign({}, baseOpts, { stroke: INK(), fill: 'none' })
    );
  };

  /* ── animateStroke ────────────────────────────────────────────────────── */

  window.animateStroke = function (el) {
    if (typeof rough === 'undefined') return;

    var existing = el.querySelector('svg.rough-hover-svg');
    if (existing) existing.remove();

    var isBlock =
      getComputedStyle(el).display === 'block' ||
      getComputedStyle(el).display === 'flex'  ||
      getComputedStyle(el).display === 'grid';

    var w   = el.offsetWidth;
    var h   = el.offsetHeight;
    var pad = isBlock ? 8 : 3;

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('rough-hover-svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    var svgW = w + pad * 2;
    var svgH = isBlock ? h + pad * 2 : h + 10;

    svg.setAttribute('width',  svgW);
    svg.setAttribute('height', svgH);
    svg.style.cssText =
      'position:absolute;top:' + (-pad) + 'px;left:' + (-pad) +
      'px;pointer-events:none;z-index:0;overflow:visible;';

    ensureRelative(el);

    var rs   = rough.svg(svg);
    var opts = Object.assign({}, baseOpts, { stroke: INK(), fill: 'none' });
    var drawn;

    if (isBlock) {
      drawn = rs.rectangle(3, 3, svgW - 6, svgH - 6, opts);
    } else {
      drawn = rs.line(0, h + 6, svgW, h + 6, opts);
    }

    svg.appendChild(drawn);
    el.appendChild(svg);

    var paths = svg.querySelectorAll('path');
    paths.forEach(function (p) {
      try {
        var len = p.getTotalLength();
        p.style.strokeDasharray  = len;
        p.style.strokeDashoffset = len;
        p.style.transition = 'stroke-dashoffset 420ms cubic-bezier(0.25,0.46,0.45,0.94)';
      } catch (e) {
        p.style.strokeDasharray  = '300';
        p.style.strokeDashoffset = '300';
        p.style.transition = 'stroke-dashoffset 420ms ease';
      }
    });

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        paths.forEach(function (p) {
          p.style.strokeDashoffset = '0';
        });
      });
    });
  };

  /* ── retractStroke ────────────────────────────────────────────────────── */

  window.retractStroke = function (el) {
    var svg = el.querySelector('svg.rough-hover-svg');
    if (!svg) return;
    var paths = svg.querySelectorAll('path');
    paths.forEach(function (p) {
      p.style.transition       = 'stroke-dashoffset 260ms ease';
      p.style.strokeDashoffset = p.style.strokeDasharray || '300';
    });
    setTimeout(function () { svg.remove(); }, 280);
  };

  /* ── drawHeroArrow ────────────────────────────────────────────────────── */

  window.drawHeroArrow = function (canvasId) {
    if (typeof rough === 'undefined') return;
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    var w = 50;
    var h = 68;
    canvas.width  = w;
    canvas.height = h;

    var rc   = rough.canvas(canvas);
    var opts = Object.assign({}, baseOpts, { roughness: 1.8, stroke: INK() });

    rc.line(w / 2, 6,      w / 2,     h - 18, opts);
    rc.line(w / 2, h - 18, w / 2 - 13, h - 34, opts);
    rc.line(w / 2, h - 18, w / 2 + 13, h - 34, opts);
  };

  /* ── drawNextArrow ────────────────────────────────────────────────────── */

  window.drawNextArrow = function (canvasId) {
    if (typeof rough === 'undefined') return;
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    var w = 60;
    var h = 30;
    canvas.width  = w;
    canvas.height = h;

    var rc   = rough.canvas(canvas);
    var opts = Object.assign({}, baseOpts, { roughness: 1.8, stroke: INK() });

    rc.line(6,      h / 2, w - 12, h / 2,     opts);
    rc.line(w - 12, h / 2, w - 24, h / 2 - 10, opts);
    rc.line(w - 12, h / 2, w - 24, h / 2 + 10, opts);
  };

  /* ── initAccents ──────────────────────────────────────────────────────── */

  window.initAccents = function () {
    if (typeof rough === 'undefined') return;

    document.querySelectorAll('.sketch-underline').forEach(function (el) {
      drawUnderline(el);
    });

    document.querySelectorAll('.sketch-circle').forEach(function (el) {
      drawCircle(el);
    });

    document.querySelectorAll('.sketch-box').forEach(function (el) {
      drawBox(el);
    });

    document.querySelectorAll('.sketch-hover').forEach(function (el) {
      if (el._roughBound) return;
      el._roughBound = true;

      el.addEventListener('mouseenter', function () {
        animateStroke(el);
      });
      el.addEventListener('mouseleave', function () {
        retractStroke(el);
      });
    });
  };

  /* ── resize debounce ──────────────────────────────────────────────────── */

  var _resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(function () {
      document.querySelectorAll('.sketch-underline').forEach(function (el) {
        var c = el.querySelector('canvas.rough-underline');
        if (c) c.remove();
        drawUnderline(el);
      });
      document.querySelectorAll('.sketch-circle').forEach(function (el) {
        var c = el.querySelector('canvas.rough-circle');
        if (c) c.remove();
        drawCircle(el);
      });
      document.querySelectorAll('.sketch-box').forEach(function (el) {
        var c = el.querySelector('canvas.rough-box');
        if (c) c.remove();
        drawBox(el);
      });
    }, 150);
  });
})();
