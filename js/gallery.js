/* ═══════════════════════════════════════════════════════════════
   GALLERY.JS — Navigation input handler (hierarchical)
   Handles: wheel, keyboard, clicks (prev/next/back/hub cards),
   swipe, nav overlay
   Depends on: state.js (window.RoomState)
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Configuration ───────────────────────────────────────────
  var WHEEL_COOLDOWN = 800;
  var SWIPE_THRESHOLD = 55;   // slightly higher for better accuracy
  var SWIPE_MAX_TIME  = 500;  // more time allowed for deliberate swipes

  // ── State ───────────────────────────────────────────────────
  var lastWheelTime     = 0;
  var touchStartY       = 0;
  var touchStartX       = 0;
  var touchStartTime    = 0;
  var touchInScrollable = false;  // true when touch started inside a scrollable panel

  // ── Scrollable container detection ──────────────────────────
  // Prevents swipe-navigation from firing when user is scrolling
  // inside a panel that has its own overflow-y: auto
  var SCROLLABLE_CLASSES = [
    'room__text',
    'hub__inner',
    'room__split-text',
    'room__content--centered',
    'room__split'
  ];

  function isInScrollableContainer(el) {
    var node = el;
    while (node && node !== document.body) {
      if (node.classList) {
        for (var i = 0; i < SCROLLABLE_CLASSES.length; i++) {
          if (node.classList.contains(SCROLLABLE_CLASSES[i])) return true;
        }
      }
      node = node.parentElement;
    }
    return false;
  }

  // ── DOM cache ───────────────────────────────────────────────
  var navOverlay = document.getElementById('nav-overlay');
  var navToggle  = document.querySelector('[data-nav-toggle]');

  // ── Wheel Navigation ───────────────────────────────────────
  function handleWheel(e) {
    e.preventDefault();

    var now = Date.now();
    if (now - lastWheelTime < WHEEL_COOLDOWN) return;
    if (window.RoomState.isLocked()) return;

    var delta = Math.sign(e.deltaY);
    if (delta === 0) return;

    lastWheelTime = now;

    // On the hub, don't scroll-navigate forward (user must click a card)
    var curId = window.RoomState.getCurrentRoomId();
    if (curId === 'hub' && delta > 0) return;

    if (delta > 0) {
      window.RoomState.next();
    } else {
      window.RoomState.prev();
    }
  }

  // ── Keyboard Navigation ───────────────────────────────────
  function handleKeydown(e) {
    // If nav overlay is open, Escape closes it
    if (navOverlay && navOverlay.classList.contains('is-open')) {
      if (e.key === 'Escape') {
        closeNav();
        return;
      }
      return;
    }

    if (window.RoomState.isLocked()) return;

    var curId = window.RoomState.getCurrentRoomId();

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
      case ' ':
        e.preventDefault();
        if (curId === 'hub') return; // must click cards
        window.RoomState.next();
        break;

      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        window.RoomState.prev();
        break;

      case 'Escape':
        e.preventDefault();
        if (window.RoomState.getCurrentContext() !== 'main') {
          window.RoomState.exitContext();
        } else {
          window.RoomState.goToRoom('hero');
        }
        break;
    }
  }

  // ── Touch / Swipe ─────────────────────────────────────────
  function handleTouchStart(e) {
    var t = e.touches[0];
    touchStartY       = t.clientY;
    touchStartX       = t.clientX;
    touchStartTime    = Date.now();
    // Detect if touch originated inside a scrollable panel
    touchInScrollable = isInScrollableContainer(e.target);
  }

  function handleTouchEnd(e) {
    if (window.RoomState.isLocked()) return;
    // Don't navigate when user is scrolling a panel
    if (touchInScrollable) return;

    var t  = e.changedTouches[0];
    var dy = touchStartY - t.clientY;
    var dx = touchStartX - t.clientX;
    var dt = Date.now() - touchStartTime;

    if (dt > SWIPE_MAX_TIME) return;
    if (Math.abs(dy) < SWIPE_THRESHOLD) return;
    if (Math.abs(dx) > Math.abs(dy)) return; // horizontal swipe → ignore

    var curId = window.RoomState.getCurrentRoomId();

    if (dy > 0) {
      if (curId === 'hub') return; // hub: must tap a card
      window.RoomState.next();
    } else {
      window.RoomState.prev();
    }
  }

  // ── Click handler (delegated) ─────────────────────────────
  function handleClick(e) {
    // 1. Hub card / enter-context clicks
    var ctxBtn = e.target.closest('[data-enter-context]');
    if (ctxBtn) {
      e.preventDefault();
      var ctx = ctxBtn.dataset.enterContext;
      var startIdx = parseInt(ctxBtn.dataset.contextIndex) || 0;
      if (ctx) {
        closeNav();
        setTimeout(function () {
          window.RoomState.enterContext(ctx, startIdx);
        }, navOverlay && navOverlay.classList.contains('is-open') ? 150 : 0);
      }
      return;
    }

    // 2. Exit-context / back button
    var backBtn = e.target.closest('[data-exit-context]');
    if (backBtn) {
      e.preventDefault();
      window.RoomState.exitContext();
      return;
    }

    // 3. Regular prev/next buttons
    var navBtn = e.target.closest('.room__nav');
    if (navBtn) {
      e.preventDefault();
      if (navBtn.classList.contains('room__nav--next')) {
        window.RoomState.next();
      } else if (navBtn.classList.contains('room__nav--prev')) {
        window.RoomState.prev();
      }
      return;
    }
  }

  // ── Navigation Overlay ────────────────────────────────────
  function openNav() {
    if (!navOverlay) return;
    navOverlay.classList.add('is-open');
    navOverlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('nav-is-open');
  }

  function closeNav() {
    if (!navOverlay) return;
    navOverlay.classList.remove('is-open');
    navOverlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('nav-is-open');
  }

  function toggleNav() {
    if (!navOverlay) return;
    if (navOverlay.classList.contains('is-open')) {
      closeNav();
    } else {
      openNav();
    }
  }

  // ── Init ──────────────────────────────────────────────────
  function init() {
    // Wheel
    window.addEventListener('wheel', handleWheel, { passive: false });

    // Keyboard
    window.addEventListener('keydown', handleKeydown);

    // Touch
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    // All clicks (delegated)
    document.body.addEventListener('click', handleClick);

    // Nav overlay toggle
    if (navToggle) {
      navToggle.addEventListener('click', toggleNav);
    }

    // Close overlay on background click
    if (navOverlay) {
      navOverlay.addEventListener('click', function (e) {
        if (e.target === navOverlay) closeNav();
      });
    }
  }

  // ── Zoom on double-click / double-tap ────────────────────
  function initZoom() {
    document.querySelectorAll('.room__image').forEach(function (img) {
      // Desktop: double-click to toggle zoom
      img.addEventListener('dblclick', function (e) {
        e.stopPropagation();
        img.classList.toggle('is-zoomed');
      });

      // Mobile: double-tap to toggle zoom
      var lastTap = 0;
      img.addEventListener('touchend', function (e) {
        var now = Date.now();
        var delta = now - lastTap;
        if (delta < 350 && delta > 0) {
          e.preventDefault();
          e.stopPropagation();
          img.classList.toggle('is-zoomed');
        }
        lastTap = now;
      });

      // Single click: exit zoom if active (prevents navigation trigger)
      img.addEventListener('click', function (e) {
        if (img.classList.contains('is-zoomed')) {
          e.stopPropagation();
          img.classList.remove('is-zoomed');
        }
      });
    });

    // Escape key deactivates zoom
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        document.querySelectorAll('.room__image.is-zoomed')
          .forEach(function (img) { img.classList.remove('is-zoomed'); });
      }
    });
  }

  // ── Public API ────────────────────────────────────────────
  window.Gallery = {
    init: init,
    openNav: openNav,
    closeNav: closeNav,
    initZoom: initZoom
  };

})();
