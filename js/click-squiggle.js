/* click-squiggle.js — hand-drawn squiggle burst on click */

(function () {
  function getAccentColor() {
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--color-accent').trim() || '#c8392b';
  }

  function spawnSquiggle(x, y) {
    var color = getAccentColor();
    var size  = 36 + Math.random() * 16;
    var half  = size / 2;

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width',  size);
    svg.setAttribute('height', size);
    svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
    svg.style.cssText = [
      'position:fixed',
      'left:' + (x - half) + 'px',
      'top:'  + (y - half) + 'px',
      'pointer-events:none',
      'z-index:99999',
      'overflow:visible',
      'opacity:1',
      'transition:opacity 0.45s ease-out, transform 0.45s ease-out',
      'transform:scale(1)',
      'transform-origin:' + half + 'px ' + half + 'px'
    ].join(';');

    /* Build a wobbly circle using 4 cubic bezier segments with random jitter */
    var jitter = function (v) { return v + (Math.random() - 0.5) * size * 0.22; };
    var cx = half, cy = half, r = half * 0.82;

    /* Approximate circle with 4 cubic beziers, each control point jittered */
    var k = 0.5523;
    var d = [
      'M', jitter(cx),       jitter(cy - r),
      'C', jitter(cx + r*k), jitter(cy - r),
           jitter(cx + r),   jitter(cy - r*k),
           jitter(cx + r),   jitter(cy),
      'C', jitter(cx + r),   jitter(cy + r*k),
           jitter(cx + r*k), jitter(cy + r),
           jitter(cx),       jitter(cy + r),
      'C', jitter(cx - r*k), jitter(cy + r),
           jitter(cx - r),   jitter(cy + r*k),
           jitter(cx - r),   jitter(cy),
      'C', jitter(cx - r),   jitter(cy - r*k),
           jitter(cx - r*k), jitter(cy - r),
           jitter(cx),       jitter(cy - r),
      'Z'
    ].join(' ');

    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', '1.8');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');

    /* Stroke dash animation — draws the squiggle on */
    var len = 999;
    path.style.cssText = [
      'stroke-dasharray:' + len,
      'stroke-dashoffset:' + len,
      'animation:squiggle-draw 0.22s ease-out forwards'
    ].join(';');

    svg.appendChild(path);
    document.body.appendChild(svg);

    /* Fade + scale out */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        svg.style.opacity   = '0';
        svg.style.transform = 'scale(1.35)';
      });
    });

    setTimeout(function () {
      if (svg.parentNode) svg.parentNode.removeChild(svg);
    }, 500);
  }

  /* Inject keyframe once */
  var style = document.createElement('style');
  style.textContent =
    '@keyframes squiggle-draw {' +
      'to { stroke-dashoffset: 0; }' +
    '}';
  document.head.appendChild(style);

  document.addEventListener('click', function (e) {
    /* skip if inside a draggable / scroll — only true taps/clicks */
    spawnSquiggle(e.clientX, e.clientY);
  });

  /* Touch support */
  document.addEventListener('touchstart', function (e) {
    var t = e.changedTouches[0];
    spawnSquiggle(t.clientX, t.clientY);
  }, { passive: true });
})();
