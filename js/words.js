/* ═══════════════════════════════════════════════════════════════
   WORDS.JS — Scattered letters room (poetic transition)
   Letters appear scattered across the viewport when the
   letters room becomes active. Plays each time you enter.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Configuration ───────────────────────────────────────────
  var PHRASE = 'JUANA PERFECTA — ARTISTA VISUAL';
  var STAGGER_IN  = 30;   // ms between each letter appearing
  var FLOAT_RANGE = 8;    // px of gentle floating motion

  // ── State ───────────────────────────────────────────────────
  var elements = [];
  var built = false;
  var floatRAF = null;
  var startTime = 0;

  // ── Build scattered letters ─────────────────────────────────
  function build(container) {
    container.innerHTML = '';
    elements = [];

    var chars = PHRASE.split('');
    var cols = Math.ceil(Math.sqrt(chars.length * 1.8));
    var rows = Math.ceil(chars.length / cols);

    chars.forEach(function (c, i) {
      if (c === ' ') {
        elements.push(null);
        return;
      }

      var el = document.createElement('span');
      el.className = 'loading-letter';
      el.textContent = c;

      // Scatter positions with controlled randomness
      var col = i % cols;
      var row = Math.floor(i / cols);
      var cw = 80 / cols;
      var ch = 60 / rows;

      var x = 10 + col * cw + (Math.random() - 0.5) * cw * 0.8;
      var y = 20 + row * ch + (Math.random() - 0.5) * ch * 0.6;

      el.style.left = x + '%';
      el.style.top  = y + '%';

      // Store random phase offset for floating
      el._phase = Math.random() * Math.PI * 2;
      el._speed = 0.3 + Math.random() * 0.4;

      container.appendChild(el);
      elements.push(el);
    });

    built = true;
  }

  // ── Play entrance animation ─────────────────────────────────
  function play() {
    var visible = elements.filter(function (e) { return e !== null; });

    // Reset all letters
    visible.forEach(function (el) {
      el.classList.remove('is-visible', 'is-fading');
    });

    // Stagger appearance
    visible.forEach(function (el, i) {
      setTimeout(function () {
        el.classList.add('is-visible');
      }, i * STAGGER_IN);
    });

    // Start gentle floating after all letters appear
    var totalAppear = visible.length * STAGGER_IN;
    setTimeout(function () {
      startFloat();
    }, totalAppear + 200);
  }

  // ── Gentle floating motion ──────────────────────────────────
  function startFloat() {
    if (floatRAF) cancelAnimationFrame(floatRAF);
    startTime = performance.now();

    function animate() {
      var t = (performance.now() - startTime) / 1000;
      var visible = elements.filter(function (e) { return e !== null; });

      visible.forEach(function (el) {
        var offsetY = Math.sin(t * el._speed + el._phase) * FLOAT_RANGE;
        var offsetX = Math.cos(t * el._speed * 0.7 + el._phase) * (FLOAT_RANGE * 0.5);
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

  // ── Reset (when leaving the room) ───────────────────────────
  function reset() {
    stopFloat();
    var visible = elements.filter(function (e) { return e !== null; });
    visible.forEach(function (el) {
      el.classList.remove('is-visible', 'is-fading');
      el.style.transform = '';
    });
  }

  // ── Init ──────────────────────────────────────────────────
  function init() {
    var container = document.getElementById('letters-field');
    if (!container) return;

    build(container);

    // Listen for room changes
    if (window.RoomState) {
      window.RoomState.onChange(function (newState, oldState) {
        if (newState.roomId === 'letters') {
          // Entering letters room: play animation
          setTimeout(play, 200);
        } else if (oldState && oldState.roomId === 'letters') {
          // Leaving letters room: stop floating
          stopFloat();
        }
      });
    }
  }

  // ── Public API ────────────────────────────────────────────
  window.Words = {
    init: init
  };

})();
