/* ═══════════════════════════════════════════════════════════════
   WORDS-BIO.JS — "El Diccionario Secreto"
   Emotion-words scattered across bio-proyecto room.
   Same floating aesthetic as #letters. Hover reveals AI images.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var BASE = 'img/Organic%20%26%20AI/Imagenes%20AI%20hechas%20con%20matriz/';

  // ── Emotion words + associated AI images ────────────────────
  // Per-image config: threshold, darkBg, method
  // method: 'canvas' = pixel-level bg removal | 'multiply' = blend mode (white/translucent subjects)
  var IMG = {
    A: { src: BASE + 'Bc49FfOJNcWyak9jFdP-E_a3cf14f72a804bf1b7637ba43932cf44.jpg',      method: 'canvas',   threshold: 52 },
    B: { src: BASE + 'I-uTOWbBJWASCfyiymIeJ_85518a4a89d4481784403011ae7a40a5.jpg',      method: 'canvas',   threshold: 38 },
    C: { src: BASE + 'S8bOFNi3J24oAZxmeAYfp_0174aa1fe3cf4302a74c5c39d8be74b8.jpg',      method: 'canvas',   threshold: 58, darkBg: true },
    D: { src: BASE + 'S91-xcFCQShXPAY9ybxDn_9adf6c1ae1224eeea66a2dbb892aa47c_Fotor.jpg', method: 'canvas',   threshold: 46 },
    E: { src: BASE + 'dHHw9gVi3RfQbgzs1pjgb_be69660c388548c7b771ef60d5984edf.jpg',      method: 'canvas',   threshold: 44 },
    F: { src: BASE + 'dxoK86GhuC8KruLtIIBpS_caf3f70280354f6a965eaa0c27d01ed5.jpg',      method: 'canvas',   threshold: 40 },
    G: { src: BASE + 'jDOi_SfSbu621h4FA67B-_c2c77ecb265f4a22bce3dd09b7b99544.jpg',      method: 'asis'                   },
    H: { src: BASE + 'lqpMkYAhgjFotRhMPxAeH_c198ef1bfb0c413ebf818b3f6a86fd14.jpg',      method: 'multiply'               },
    I: { src: BASE + 'siTHB9N3JD0AHap5nkOkJ_e2f8aa74df57417c9329d6b7aa6a6ca3.jpg',      method: 'multiply'               },
    J: { src: BASE + 'wosONvXwBB27sTftl4-NO_1e0683987285434f8e5c7fb738ed3195.jpg',       method: 'canvas',   threshold: 35 }
  };

  var WORDS = [
    { word: 'AWE',           cfg: IMG.A },
    { word: 'TRANSMUTATION', cfg: IMG.A },
    { word: 'EMERGENCE',     cfg: IMG.A },
    { word: 'JOY',           cfg: IMG.B },
    { word: 'EMBODIMENT',    cfg: IMG.B },
    { word: 'MATERIALITY',   cfg: IMG.B },
    { word: 'HOPE',          cfg: IMG.C },
    { word: 'POROSITY',      cfg: IMG.C },
    { word: 'LIMINALITY',    cfg: IMG.C },
    { word: 'GROWTH',        cfg: IMG.D },
    { word: 'RESONANCE',     cfg: IMG.D },
    { word: 'THRESHOLD',     cfg: IMG.D },
    { word: 'PRIDE',         cfg: IMG.E },
    { word: 'INSCRIPTION',   cfg: IMG.E },
    { word: 'VOLATILITY',    cfg: IMG.E },
    { word: 'GRATITUDE',     cfg: IMG.F },
    { word: 'EPIPHANY',      cfg: IMG.F },
    { word: 'BELONGING',     cfg: IMG.F },
    { word: 'CLARITY',       cfg: IMG.G },
    { word: 'TENSION',       cfg: IMG.G },
    { word: 'CONFUSION',     cfg: IMG.G },
    { word: 'LIBERATION',    cfg: IMG.H },
    { word: 'EXPANSION',     cfg: IMG.H },
    { word: 'OPTIMISM',      cfg: IMG.H },
    { word: 'OVERWHELM',     cfg: IMG.I },
    { word: 'EXHAUSTION',    cfg: IMG.I },
    { word: 'ISOLATION',     cfg: IMG.I },
    { word: 'EMPOWERED',     cfg: IMG.J },
    { word: 'INSPIRATION',   cfg: IMG.J },
    { word: 'DETERMINATION', cfg: IMG.J }
  ];

  var STAGGER_IN  = 60;   // ms between each word appearing
  var FLOAT_RANGE = 6;    // px of gentle floating motion

  // ── State ───────────────────────────────────────────────────
  var elements   = [];
  var floatRAF   = null;
  var startTime  = 0;
  var hideTimer  = null;
  var previewEl  = null;
  var previewCanvas = null;
  var previewImg = null;   // kept for fallback
  var bgCache    = {};     // processed canvas data URLs, keyed by img src

  // ── Build scattered words ────────────────────────────────────
  function build(container) {
    container.innerHTML = '';
    elements = [];

    // Distribute 30 words in a 5×6 grid with randomness
    var cols = 5;
    var rows = 6;

    WORDS.forEach(function (item, i) {
      var el = document.createElement('span');
      el.className = 'bio-word';
      el.textContent = item.word;

      // Grid position with randomness — avoid center rectangle
      var col = i % cols;
      var row = Math.floor(i / cols);

      var cw = 88 / cols;   // column width as % of viewport
      var ch = 78 / rows;   // row height as % of viewport

      var x = 6 + col * cw + (Math.random() - 0.5) * cw * 0.5;
      var y = 10 + row * ch + (Math.random() - 0.5) * ch * 0.5;

      // Vary opacity per word for depth effect
      var baseOpacity = 0.25 + Math.random() * 0.45;
      el.style.setProperty('--base-opacity', baseOpacity);

      // Vary font size for rhythm
      var sizes = ['0.6rem', '0.75rem', '0.85rem', '1rem', '1.15rem'];
      el.style.fontSize = sizes[Math.floor(Math.random() * sizes.length)];

      el.style.left = x + '%';
      el.style.top  = y + '%';

      // Float params
      el._phase = Math.random() * Math.PI * 2;
      el._speed = 0.25 + Math.random() * 0.35;
      el._cfg   = item.cfg;

      // Hover handlers
      el.addEventListener('mouseenter', function () { onHover(el); });
      el.addEventListener('mouseleave', function () { onLeave(); });

      container.appendChild(el);
      elements.push(el);
    });
  }

  // ── Play entrance animation ─────────────────────────────────
  function play() {
    elements.forEach(function (el) {
      el.classList.remove('is-visible');
    });

    elements.forEach(function (el, i) {
      setTimeout(function () {
        el.classList.add('is-visible');
      }, i * STAGGER_IN);
    });

    var totalAppear = elements.length * STAGGER_IN;
    setTimeout(function () {
      startFloat();
    }, totalAppear + 200);
  }

  // ── Gentle floating motion ───────────────────────────────────
  function startFloat() {
    if (floatRAF) cancelAnimationFrame(floatRAF);
    startTime = performance.now();

    function animate() {
      var t = (performance.now() - startTime) / 1000;
      elements.forEach(function (el) {
        var offsetY = Math.sin(t * el._speed + el._phase) * FLOAT_RANGE;
        var offsetX = Math.cos(t * el._speed * 0.7 + el._phase) * (FLOAT_RANGE * 0.4);
        el.style.transform = 'translate(' + offsetX + 'px, ' + offsetY + 'px)';
      });
      floatRAF = requestAnimationFrame(animate);
    }
    floatRAF = requestAnimationFrame(animate);
  }

  function stopFloat() {
    if (floatRAF) {
      cancelAnimationFrame(floatRAF);
      floatRAF = null;
    }
  }

  // ── Background removal via Canvas ───────────────────────────
  function removeBackground(cfg, callback) {
    var cacheKey = cfg.src;
    if (bgCache[cacheKey]) { callback(bgCache[cacheKey]); return; }

    var img = new Image();
    img.onload = function () {
      try {
        var w = img.naturalWidth;
        var h = img.naturalHeight;
        var canvas = document.createElement('canvas');
        canvas.width  = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        var data = ctx.getImageData(0, 0, w, h); // may throw SecurityError on file://
        var px   = data.data;

        // Sample corners to get background color
        function sampleAt(x, y) {
          var i = (y * w + x) * 4;
          return [px[i], px[i+1], px[i+2]];
        }
        var corners = [
          sampleAt(2, 2), sampleAt(w-3, 2),
          sampleAt(2, h-3), sampleAt(w-3, h-3),
          sampleAt(Math.floor(w/2), 2), sampleAt(2, Math.floor(h/2))
        ];
        var avgR = 0, avgG = 0, avgB = 0;
        corners.forEach(function(c){ avgR+=c[0]; avgG+=c[1]; avgB+=c[2]; });
        avgR = Math.round(avgR/corners.length);
        avgG = Math.round(avgG/corners.length);
        avgB = Math.round(avgB/corners.length);

        var THRESHOLD = cfg.threshold || 48;
        var FEATHER   = 28;

        for (var i = 0; i < px.length; i += 4) {
          var dr = px[i]   - avgR;
          var dg = px[i+1] - avgG;
          var db = px[i+2] - avgB;
          var dist = Math.sqrt(dr*dr + dg*dg + db*db);
          if (dist < THRESHOLD) {
            px[i+3] = 0;
          } else if (dist < THRESHOLD + FEATHER) {
            var t = (dist - THRESHOLD) / FEATHER;
            px[i+3] = Math.round(t * 255);
          }
        }

        ctx.putImageData(data, 0, 0);
        var dataURL = canvas.toDataURL('image/png');
        bgCache[cacheKey] = dataURL;
        callback(dataURL);
      } catch (e) {
        // Canvas pixel read blocked (file:// security) — signal fallback
        callback(null);
      }
    };
    img.onerror = function () { callback(null); };
    img.src = cfg.src;
  }

  // ── Apply method to preview elements ────────────────────────
  var previewImgEl = null;  // <img> for multiply/asis methods

  function showWithCanvas(cfg) {
    // Hide img fallback, show canvas
    if (previewImgEl) previewImgEl.style.display = 'none';
    previewCanvas.style.display = '';
    previewEl.style.mixBlendMode = '';

    var cacheKey = cfg.src;
    if (previewCanvas.dataset.current === cacheKey) {
      previewCanvas.style.opacity = '';
      previewCanvas.style.transform = '';
      return;
    }

    previewCanvas.style.opacity = '0';
    previewCanvas.style.transform = 'scale(0.96)';
    setTimeout(function () {
      removeBackground(cfg, function (dataURL) {
        if (!dataURL) {
          // Canvas blocked — fallback to multiply blend so image always shows
          previewCanvas.style.display = 'none';
          previewCanvas.dataset.current = '';
          showWithBlend(cfg, 'multiply');
          return;
        }
        var img = new Image();
        img.onload = function () {
          previewCanvas.width  = img.naturalWidth;
          previewCanvas.height = img.naturalHeight;
          var ctx = previewCanvas.getContext('2d');
          ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
          ctx.drawImage(img, 0, 0);
          previewCanvas.dataset.current = cacheKey;
          previewCanvas.style.opacity = '';
          previewCanvas.style.transform = '';
        };
        img.src = dataURL;
      });
    }, 180);
  }

  function showWithBlend(cfg, blendMode) {
    // Hide canvas, show img with blend mode
    previewCanvas.style.display = 'none';
    if (!previewImgEl) {
      previewImgEl = document.createElement('img');
      previewImgEl.className = 'words-bio-preview__img';
      previewEl.appendChild(previewImgEl);
    }
    previewImgEl.style.display = '';
    previewEl.style.mixBlendMode = blendMode || 'multiply';

    if (previewImgEl.dataset.current === cfg.src) {
      previewImgEl.style.opacity = '';
      previewImgEl.style.transform = '';
      return;
    }
    previewImgEl.style.opacity = '0';
    previewImgEl.style.transform = 'scale(0.96)';
    setTimeout(function () {
      previewImgEl.src = cfg.src;
      previewImgEl.dataset.current = cfg.src;
      previewImgEl.style.opacity = '';
      previewImgEl.style.transform = '';
    }, 180);
  }

  // ── Hover: show AI image ─────────────────────────────────────
  function onHover(el) {
    if (!previewCanvas) return;
    clearTimeout(hideTimer);

    elements.forEach(function (e) {
      e.classList.remove('is-hovered');
      e.classList.add('is-dimmed');
    });
    el.classList.remove('is-dimmed');
    el.classList.add('is-hovered');

    var cfg = el._cfg;
    if (cfg.method === 'canvas') {
      showWithCanvas(cfg);
    } else if (cfg.method === 'multiply') {
      showWithBlend(cfg, 'multiply');
    } else {
      // 'asis' — show as-is, no blend
      showWithBlend(cfg, 'normal');
    }

    previewEl.classList.add('is-visible');
  }

  function onLeave() {
    elements.forEach(function (e) {
      e.classList.remove('is-hovered', 'is-dimmed');
    });
    hideTimer = setTimeout(function () {
      if (previewEl) previewEl.classList.remove('is-visible');
    }, 300);
  }

  // ── Reset ────────────────────────────────────────────────────
  function reset() {
    stopFloat();
    elements.forEach(function (el) {
      el.classList.remove('is-visible', 'is-hovered', 'is-dimmed');
      el.style.transform = '';
    });
    if (previewEl) {
      previewEl.classList.remove('is-visible');
      previewEl.style.mixBlendMode = '';
    }
    if (previewCanvas) previewCanvas.style.opacity = '0';
  }

  // ── Init ─────────────────────────────────────────────────────
  function init() {
    var container = document.getElementById('bio-words-field');
    if (!container) return;

    previewEl  = document.getElementById('bio-words-preview');
    previewImg = document.getElementById('bio-words-preview-img');

    // Reset cache so re-init picks up fresh config (thresholds may have changed)
    bgCache = {};

    // Use existing canvas if already created, otherwise replace <img>
    var existingCanvas = document.getElementById('bio-words-preview-canvas');
    if (existingCanvas) {
      previewCanvas = existingCanvas;
      previewCanvas.dataset.current = '';
    } else if (previewImg && previewImg.parentNode) {
      var cv = document.createElement('canvas');
      cv.id        = 'bio-words-preview-canvas';
      cv.className = previewImg.className;
      cv.dataset.current = '';
      previewImg.parentNode.replaceChild(cv, previewImg);
      previewCanvas = cv;
    }

    build(container);

    if (window.RoomState) {
      window.RoomState.onChange(function (newState, oldState) {
        if (newState.roomId === 'bio-proyecto') {
          setTimeout(play, 250);
        } else if (oldState && oldState.roomId === 'bio-proyecto') {
          reset();
        }
      });

      // If already active on load (deep link via hash)
      var current = window.RoomState.getState && window.RoomState.getState();
      if (current && current.roomId === 'bio-proyecto') {
        setTimeout(play, 400);
      }
    }
  }

  window.WordsBio = { init: init };

})();
