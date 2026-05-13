/* ═══════════════════════════════════════════════════════════════
   MAIN.JS — Orchestrator
   Initializes all modules, handles video autoplay, reveal animations
   Updated for hierarchical context-based navigation
   This must be the LAST script loaded (before image-processor)
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── VIDEO AUTOPLAY (on room enter/exit) ─────────────────────
  function initVideoAutoplay() {
    if (!window.RoomState) return;

    window.RoomState.onChange(function (newState, oldState) {
      // Pause video in old room
      if (oldState && oldState.room) {
        var oldVideo = oldState.room.querySelector('.room__video');
        if (oldVideo) oldVideo.pause();
      }

      // Play video in new room
      if (newState && newState.room) {
        var newVideo = newState.room.querySelector('.room__video');
        if (newVideo) {
          setTimeout(function () {
            newVideo.play().catch(function () {
              // Autoplay blocked — user hasn't interacted yet
            });
          }, 300);
        }
      }
    });
  }

  // ── PROCESS INTRO VIDEO (plays once → auto-navigates to matrices) ──
  function initProcessIntroVideo() {
    if (!window.RoomState) return;
    var room = document.getElementById('process-intro');
    if (!room) return;
    var video = room.querySelector('.process-intro__bg');
    if (!video) return;

    // When video ends, go straight to first matrix
    video.addEventListener('ended', function () {
      window.RoomState.goToRoom('process-matriz-01');
    });

    // Play/reset on room enter, pause/reset on leave
    window.RoomState.onChange(function (newState, oldState) {
      if (newState && newState.roomId === 'process-intro') {
        video.currentTime = 0;
        video.play().catch(function () {});
      } else if (oldState && oldState.roomId === 'process-intro') {
        video.pause();
        video.currentTime = 0;
      }
    });
  }

  // ── REVEAL ANIMATIONS (on room enter) ───────────────────────
  function initRoomReveal() {
    if (!window.RoomState) return;

    window.RoomState.onChange(function (newState) {
      if (!newState || !newState.room) return;

      var reveals = newState.room.querySelectorAll('[data-reveal]');
      if (!reveals.length) return;

      // Reset reveals first (in case re-entering a room)
      reveals.forEach(function (el) {
        el.classList.remove('is-revealed');
      });

      // Stagger reveal with delay
      reveals.forEach(function (el, i) {
        setTimeout(function () {
          el.classList.add('is-revealed');
        }, 300 + (i * 100));
      });
    });
  }


  // ── SECTION JUMP BUTTONS ────────────────────────────────
  function initSectionJumps() {
    if (!window.RoomState) return;

    var SECTIONS = [
      {
        name: 'matrix',
        first: 'process-matriz-01',
        rooms: ['process-intro','process-matriz-01','process-matriz-02','process-matriz-03',
                'process-matriz-04','process-matriz-05','process-matriz-06','process-matriz-07',
                'process-matriz-08','process-matriz-09','process-matriz-10','process-matriz-11',
                'process-matriz-12','process-matriz-13','process-matriz-14','process-matriz-15',
                'process-matriz-16','process-matriz-17']
      },
      {
        name: 'videos',
        first: 'works-video-constellations',
        rooms: ['works-video-intro','works-video-constellations','works-video-01','works-video-02',
                'works-video-03','works-video-04','works-video-05']
      }
    ];

    var prevBtn   = document.getElementById('jump-prev-section');
    var nextBtn   = document.getElementById('jump-next-section');
    var prevLabel = document.getElementById('jump-prev-label');
    var nextLabel = document.getElementById('jump-next-label');
    if (!prevBtn || !nextBtn) return;

    function getSectionIdx(roomId) {
      for (var i = 0; i < SECTIONS.length; i++) {
        if (SECTIONS[i].rooms.indexOf(roomId) !== -1) return i;
      }
      return -1;
    }

    function update(newState) {
      if (!newState) return;
      var idx = getSectionIdx(newState.roomId);

      prevBtn.classList.remove('is-visible');
      nextBtn.classList.remove('is-visible');
      if (idx === -1) return;

      if (idx > 0) {
        var ps = SECTIONS[idx - 1];
        var psLang = window.I18n ? window.I18n.getLang() : 'en';
        var psLabels = { matrix: { en: 'matrix', es: 'matrices' }, videos: { en: 'Videos', es: 'Videos' } };
        prevLabel.textContent = (psLabels[ps.name] || {})[psLang] || ps.name;
        prevLabel.dataset.section = ps.name;
        prevBtn.dataset.target = ps.first;
        prevBtn.classList.add('is-visible');
      }
      if (idx < SECTIONS.length - 1) {
        var ns = SECTIONS[idx + 1];
        var nsLang = window.I18n ? window.I18n.getLang() : 'en';
        var nsLabels = { matrix: { en: 'matrix', es: 'matrices' }, videos: { en: 'Videos', es: 'Videos' } };
        nextLabel.textContent = (nsLabels[ns.name] || {})[nsLang] || ns.name;
        nextLabel.dataset.section = ns.name;
        nextBtn.dataset.target = ns.first;
        nextBtn.classList.add('is-visible');
      }
    }

    prevBtn.addEventListener('click', function () {
      if (this.dataset.target) window.RoomState.goToRoom(this.dataset.target);
    });
    nextBtn.addEventListener('click', function () {
      if (this.dataset.target) window.RoomState.goToRoom(this.dataset.target);
    });

    window.RoomState.onChange(update);
    update(window.RoomState.makeState ? window.RoomState.makeState() : null);
  }

  // ── GLOBAL SCROLL BUTTONS ────────────────────────────────
  function initGlobalScroll() {
    var upBtn   = document.getElementById('global-up');
    var downBtn = document.getElementById('global-down');
    if (!upBtn || !downBtn || !window.RoomState) return;

    upBtn.addEventListener('click', function () {
      window.RoomState.prev();
    });
    downBtn.addEventListener('click', function () {
      window.RoomState.next();
    });
  }

  // ── INIT ALL MODULES ────────────────────────────────────────
  function init() {
    // 1. Core: State machine (must be first)
    if (window.RoomState) {
      window.RoomState.init();
    }

    // 2. Cursor system
    if (window.Cursor) {
      window.Cursor.init();
    }

    // 3. Pigment canvas
    if (window.Pigment) {
      window.Pigment.init();
    }

    // 4. Magnetic buttons
    if (window.Magnetic) {
      window.Magnetic.init();
    }

    // 5. Tilt effect
    if (window.Tilt) {
      window.Tilt.init();
    }

    // 6. Scattered letters (room-based)
    if (window.Words) {
      window.Words.init();
    }

    // 6b. Bio-proyecto: Diccionario Secreto words
    if (window.WordsBio) {
      window.WordsBio.init();
    }

    // 7. Hero parallax
    if (window.ParallaxHero) {
      window.ParallaxHero.init();
    }

    // 8. Sound
    if (window.Sound) {
      window.Sound.init();
    }

    // 9. Gallery navigation (wheel, keys, swipe, clicks)
    if (window.Gallery) {
      window.Gallery.init();
      window.Gallery.initZoom();
    }

    // 10. Image processing handled by image-processor.js (self-contained)

    // 11. Video autoplay on room change
    initVideoAutoplay();

    // 11b. process-intro: video bg plays once, then navigates to first matrix
    initProcessIntroVideo();

    // 12. Reveal animations on room change
    initRoomReveal();

    // 13. Section jump buttons (matrix / generated / motion)
    initSectionJumps();

    // 14. Global scroll up/down
    initGlobalScroll();

    // 15. Touch device: adapt bio hint text + add touch class to body
    (function () {
      var isTouch = window.matchMedia('(hover: none)').matches ||
                    ('ontouchstart' in window) ||
                    (navigator.maxTouchPoints > 0);
      if (!isTouch) return;

      document.body.classList.add('is-touch');

      function applyTouchHint() {
        var lang = window.I18n ? window.I18n.getLang() : 'en';
        var h = lang === 'es' ? 'tocá una palabra' : 'tap a word';
        document.querySelectorAll('[data-i18n="bio.footer.hint"]')
          .forEach(function (el) { el.textContent = h; });
      }

      applyTouchHint();

      // Re-apply when language is toggled
      var langBtn = document.getElementById('lang-toggle');
      if (langBtn) {
        langBtn.addEventListener('click', function () {
          // I18n.toggle runs first; give it a tick to update
          setTimeout(applyTouchHint, 50);
        });
      }
    }());

    // 16. Reveal initial room's elements
    var initialRoom = document.querySelector('.room.is-active');
    if (initialRoom) {
      var reveals = initialRoom.querySelectorAll('[data-reveal]');
      reveals.forEach(function (el, i) {
        setTimeout(function () {
          el.classList.add('is-revealed');
        }, 600 + (i * 100));
      });
    }
  }

  // ── Start ───────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
