/* ═══════════════════════════════════════════════════════════════
   IMAGE-PROCESSOR.JS — White-to-transparent pixel processing
   Converts near-white/light pixels to transparent so the page
   beige (#E8E0D4) background shows through seamlessly.
   Self-contained: runs on window.load, no dependencies.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var BG_THRESHOLD = 140;   // Min channel value to start fading to transparent
  var processed = [];        // Track processed image elements

  function processImageWhites(img) {
    var c = document.createElement('canvas');
    var ctx = c.getContext('2d', { willReadFrequently: true });

    var w = img.naturalWidth;
    var h = img.naturalHeight;
    if (!w || !h) return false;

    c.width = w;
    c.height = h;

    ctx.drawImage(img, 0, 0, w, h);

    var imageData = ctx.getImageData(0, 0, w, h);
    var data = imageData.data;
    var range = 255 - BG_THRESHOLD;

    for (var i = 0; i < data.length; i += 4) {
      var minC = Math.min(data[i], data[i + 1], data[i + 2]);

      if (minC >= BG_THRESHOLD) {
        var t = (minC - BG_THRESHOLD) / range;
        var transparency = t * t * t;   // Cubic: gentle start, aggressive at whites
        data[i + 3] = Math.round((1 - transparency) * 255);
      }
    }

    ctx.putImageData(imageData, 0, 0);
    img.src = c.toDataURL('image/png');
    return true;
  }

  function processAll() {
    var images = document.querySelectorAll('.room__image');
    images.forEach(function (img) {
      if (processed.indexOf(img) !== -1) return;
      if (img.src.indexOf('data:') === 0) return;

      if (img.complete && img.naturalWidth > 0) {
        try {
          if (processImageWhites(img)) {
            processed.push(img);
          }
        } catch (e) {
          // CORS or canvas security — skip silently
        }
      }
    });
  }

  // ── Run when all resources are loaded ─────────────────────
  function start() {
    processAll();

    // Safety net: also process images on room change
    // (in case some weren't ready at initial load)
    if (window.RoomState) {
      window.RoomState.onChange(function (newIndex) {
        // Small delay to let the room become visible
        setTimeout(processAll, 100);
      });
    }
  }

  // ── Entry point ───────────────────────────────────────────
  if (document.readyState === 'complete') {
    start();
  } else {
    window.addEventListener('load', start);
  }

})();
