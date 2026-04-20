/* ═══════════════════════════════════════════════════════════════
   PARALLAX-HERO.JS — 3D perspective effect on hero video
   Uses CSS 3D transforms on the video element to give the
   illusion of viewing from multiple angles (like maxmilkin.com)
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Configuration ───────────────────────────────────────────
  var LERP_FACTOR = 0.06;           // Smoothness (lower = smoother)
  var MAX_ROTATE_X = 4;             // Max rotation in degrees (vertical)
  var MAX_ROTATE_Y = 6;             // Max rotation in degrees (horizontal)
  var MAX_TRANSLATE_X = 15;         // Subtle shift in px
  var MAX_TRANSLATE_Y = 10;         // Subtle shift in px
  var SCALE = 1.08;                 // Scale up to prevent edge gaps during rotation

  // ── State ───────────────────────────────────────────────────
  var perspective = null;
  var video = null;
  var isActive = true;
  var rafId = null;

  // Mouse position normalized to [-1, 1]
  var targetX = 0;
  var targetY = 0;
  var currentX = 0;
  var currentY = 0;

  // ── Lerp utility ────────────────────────────────────────────
  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  // ── Mouse tracking ──────────────────────────────────────────
  function handleMouseMove(e) {
    // Normalize to [-1, 1] from center of viewport
    targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  }

  // ── Reset on mouse leave ────────────────────────────────────
  function handleMouseLeave() {
    targetX = 0;
    targetY = 0;
  }

  // ── Animation loop ──────────────────────────────────────────
  function loop() {
    if (!isActive) return;

    // Lerp towards target
    currentX = lerp(currentX, targetX, LERP_FACTOR);
    currentY = lerp(currentY, targetY, LERP_FACTOR);

    // Calculate transform values
    // rotateY follows horizontal mouse (look left-right)
    // rotateX follows vertical mouse (look up-down, inverted)
    var rotateY = currentX * MAX_ROTATE_Y;
    var rotateX = -currentY * MAX_ROTATE_X;
    var translateX = currentX * MAX_TRANSLATE_X;
    var translateY = currentY * MAX_TRANSLATE_Y;

    // Apply 3D transform to the video element
    if (video) {
      video.style.transform =
        'scale(' + SCALE + ') ' +
        'translate3d(' + translateX + 'px, ' + translateY + 'px, 0) ' +
        'rotateX(' + rotateX + 'deg) ' +
        'rotateY(' + rotateY + 'deg)';
    }

    rafId = requestAnimationFrame(loop);
  }

  function startLoop() {
    if (rafId) return;
    isActive = true;
    rafId = requestAnimationFrame(loop);
  }

  function stopLoop() {
    isActive = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    // Reset transform smoothly (CSS transition handles it)
    if (video) {
      video.style.transform =
        'scale(' + SCALE + ') translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg)';
    }
  }

  // ── Video autoplay management ───────────────────────────────
  function playVideo() {
    if (video) {
      video.play().catch(function () {
        // Autoplay blocked — will start on first user interaction
      });
    }
  }

  function pauseVideo() {
    if (video) {
      video.pause();
    }
  }

  // ── Init ────────────────────────────────────────────────────
  function init() {
    perspective = document.getElementById('hero-perspective');
    video = document.getElementById('hero-video');
    if (!perspective || !video) return;

    // Mouse tracking (only on non-touch)
    if (window.matchMedia('(hover: hover)').matches) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    // Start active since hero is the first room
    isActive = true;
    startLoop();
    playVideo();

    // Listen for room changes to start/stop animation & video
    if (window.RoomState) {
      window.RoomState.onChange(function (newState) {
        var room = newState.room;
        if (room && room.id === 'hero') {
          startLoop();
          playVideo();
        } else {
          stopLoop();
          pauseVideo();
        }
      });
    }
  }

  // ── Public API ──────────────────────────────────────────────
  window.ParallaxHero = {
    init: init,
  };

})();
