/* ═══════════════════════════════════════════════════════════════
   TILT.JS — 3D perspective tilt on artwork images in rooms
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const isTouch = window.matchMedia('(hover: none)').matches;
  if (isTouch) return;

  const MAX_ROTATION = 5; // degrees (reduced for subtlety)

  function init() {
    // Delegate on the rooms container for dynamic elements
    var rooms = document.getElementById('rooms');
    if (!rooms) return;

    rooms.addEventListener('mousemove', onMove, { passive: true });
    rooms.addEventListener('mouseenter', onEnter, true);
    rooms.addEventListener('mouseleave', onLeave, true);
  }

  function getMedia(e) {
    return e.target.closest('.room__media');
  }

  function onEnter(e) {
    var media = getMedia(e);
    if (media) {
      media.style.transition = 'transform var(--dur-fast) ease';
    }
  }

  function onMove(e) {
    var media = getMedia(e);
    if (!media) return;

    var rect = media.getBoundingClientRect();

    // Normalized -1 to 1 from center
    var x = (e.clientX - rect.left) / rect.width;
    var y = (e.clientY - rect.top) / rect.height;

    var dx = (x - 0.5) * 2;
    var dy = (y - 0.5) * 2;

    var rotateY =  dx * MAX_ROTATION;
    var rotateX = -dy * MAX_ROTATION;

    media.style.transform = 'perspective(1200px) rotateY(' + rotateY + 'deg) rotateX(' + rotateX + 'deg)';
  }

  function onLeave(e) {
    var media = getMedia(e);
    if (media) {
      media.style.transition = 'transform var(--dur-slow) var(--ease-out-expo)';
      media.style.transform = 'perspective(1200px) rotateY(0deg) rotateX(0deg)';
    }
  }

  // ── Public API ──────────────────────────────────────────────
  window.Tilt = {
    init: init,
  };

})();
