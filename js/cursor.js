/* ═══════════════════════════════════════════════════════════════
   CURSOR.JS — Custom cursor system (dot + ring with lerp)
   Adapted for hierarchical room-based navigation
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Bail on touch devices ───────────────────────────────────
  const isTouch = window.matchMedia('(hover: none)').matches;
  if (isTouch) return;

  // ── DOM elements ────────────────────────────────────────────
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  // ── State ───────────────────────────────────────────────────
  const mouse   = { x: 0, y: 0 };
  const dotPos  = { x: 0, y: 0 };
  const ringPos = { x: 0, y: 0 };

  const LERP_RING = 0.12;
  let isHovering  = false;
  let isVisible   = false;
  let isDark      = false;
  let raf;

  // ── Hover targets ─────────────────────────────────────────
  const HOVER_SELECTORS = '.room__nav, .room__image, .room__video, .mag-btn, .nav-overlay__link, .topbar__logo, .topbar__social a, .sound-toggle, .hub__card, .hub__artista-link, a, button, [data-cursor-hover]';

  // ── Lerp utility ──────────────────────────────────────────
  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  // ── Mouse tracking ────────────────────────────────────────
  function onMouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    if (!isVisible) {
      isVisible = true;
      dot.style.opacity  = '1';
      ring.style.opacity = '1';
      dotPos.x  = mouse.x;
      dotPos.y  = mouse.y;
      ringPos.x = mouse.x;
      ringPos.y = mouse.y;
    }
  }

  function onMouseLeave() {
    isVisible = false;
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  }

  // ── Hover detection ───────────────────────────────────────
  function onMouseOver(e) {
    if (e.target.closest(HOVER_SELECTORS)) {
      if (!isHovering) {
        isHovering = true;
        dot.classList.add('is-hover');
        ring.classList.add('is-hover');
      }
    }
  }

  function onMouseOut(e) {
    if (e.target.closest(HOVER_SELECTORS)) {
      const related = e.relatedTarget;
      if (!related || !related.closest(HOVER_SELECTORS)) {
        isHovering = false;
        dot.classList.remove('is-hover');
        ring.classList.remove('is-hover');
      }
    }
  }

  // ── Dark-room detection ───────────────────────────────────
  function updateDarkState(newState) {
    if (!newState || !newState.room) return;

    var room = newState.room;
    var onDark = room.classList.contains('room--hero');

    if (onDark !== isDark) {
      isDark = onDark;
      if (isDark) {
        dot.classList.add('is-light');
        ring.classList.add('is-light');
        document.body.classList.add('room-is-dark');
      } else {
        dot.classList.remove('is-light');
        ring.classList.remove('is-light');
        document.body.classList.remove('room-is-dark');
      }
    }
  }

  // ── Animation loop ────────────────────────────────────────
  function animate() {
    dotPos.x = mouse.x;
    dotPos.y = mouse.y;
    ringPos.x = lerp(ringPos.x, mouse.x, LERP_RING);
    ringPos.y = lerp(ringPos.y, mouse.y, LERP_RING);

    dot.style.transform  = 'translate(' + (dotPos.x - 4) + 'px, ' + (dotPos.y - 4) + 'px) translate(-50%, -50%)';
    ring.style.transform = 'translate(' + ringPos.x + 'px, ' + ringPos.y + 'px) translate(-50%, -50%)';

    raf = requestAnimationFrame(animate);
  }

  // ── Init ──────────────────────────────────────────────────
  function init() {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseover', onMouseOver, { passive: true });
    document.addEventListener('mouseout', onMouseOut, { passive: true });

    // Listen for room changes (new API: receives state objects)
    if (window.RoomState) {
      window.RoomState.onChange(updateDarkState);
      // Set initial state
      var initialRoom = window.RoomState.getCurrentRoom();
      if (initialRoom) {
        updateDarkState({ room: initialRoom, roomId: initialRoom.id });
      }
    }

    raf = requestAnimationFrame(animate);
  }

  // ── Cleanup ───────────────────────────────────────────────
  function destroy() {
    cancelAnimationFrame(raf);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseleave', onMouseLeave);
    document.removeEventListener('mouseover', onMouseOver);
    document.removeEventListener('mouseout', onMouseOut);
  }

  // ── Public API ────────────────────────────────────────────
  window.Cursor = {
    init: init,
    destroy: destroy,
    getMouse: function () { return { x: mouse.x, y: mouse.y }; },
  };

})();
