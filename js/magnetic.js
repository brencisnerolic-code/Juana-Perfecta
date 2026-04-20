/* ═══════════════════════════════════════════════════════════════
   MAGNETIC.JS — Magnetic button effect
   Elements pull toward cursor when within activation radius
   Updated selectors for room-based navigation
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const isTouch = window.matchMedia('(hover: none)').matches;
  if (isTouch) return;

  const RADIUS   = 80;    // Activation radius in px
  const STRENGTH = 0.35;  // Pull strength (0–1)

  function init() {
    // Updated selectors for room system
    var buttons = document.querySelectorAll('.mag-btn, .nav-overlay__link, .topbar__logo, .sound-toggle');
    if (!buttons.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener('mousemove', onMove, { passive: true });
      btn.addEventListener('mouseleave', onLeave);
      btn.addEventListener('mouseenter', onEnter);
    });
  }

  function onEnter(e) {
    e.currentTarget.style.transition = 'transform var(--dur-fast) ease';
  }

  function onMove(e) {
    var btn  = e.currentTarget;
    var rect = btn.getBoundingClientRect();
    var cx   = rect.left + rect.width / 2;
    var cy   = rect.top + rect.height / 2;

    var dx = e.clientX - cx;
    var dy = e.clientY - cy;
    var dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < RADIUS) {
      var tx = dx * STRENGTH;
      var ty = dy * STRENGTH;
      btn.style.transform = 'translate(' + tx + 'px, ' + ty + 'px)';
    }
  }

  function onLeave(e) {
    var btn = e.currentTarget;
    btn.style.transition = 'transform var(--dur-slow) var(--ease-out-expo)';
    btn.style.transform = 'translate(0, 0)';
  }

  // ── Public API ──────────────────────────────────────────────
  window.Magnetic = {
    init: init,
  };

})();
