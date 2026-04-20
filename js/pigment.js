/* ═══════════════════════════════════════════════════════════════
   PIGMENT.JS — Canvas overlay that creates a paint trail
   Samples colors from artwork images under the cursor,
   draws soft paint dots that fade over time
   Inspired by lusion.co / activetheory.net
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Bail on touch devices ───────────────────────────────────
  const isTouch = window.matchMedia('(hover: none)').matches;
  if (isTouch) return;

  // ── Configuration ───────────────────────────────────────────
  const TRAIL_DECAY = 0.92;          // Opacity decay factor per frame (closer to 1 = longer trail)
  const SAMPLE_INTERVAL = 6;         // Sample color every N frames
  const MIN_BRUSH_SIZE = 4;          // Minimum brush radius
  const MAX_BRUSH_SIZE = 18;         // Maximum brush radius
  const MAX_SPEED = 30;              // Speed cap for brush size calculation
  const BASE_OPACITY = 0.5;          // Base paint opacity
  const MAX_TRAIL_POINTS = 80;       // Maximum trail points stored

  // ── State ───────────────────────────────────────────────────
  let canvas, ctx;
  let cw = 0, ch = 0;
  let isActive = false;
  let rafId = null;
  let frameCount = 0;

  // Trail points array
  var trail = [];

  // Previous mouse position for velocity
  var prevMouse = { x: 0, y: 0 };
  var currentColor = { r: 200, g: 138, b: 58 }; // Start with accent color

  // Temp canvas for color sampling
  var sampleCanvas = null;
  var sampleCtx = null;

  // ── Resize canvas ───────────────────────────────────────────
  function resize() {
    if (!canvas) return;
    cw = window.innerWidth;
    ch = window.innerHeight;
    canvas.width = cw;
    canvas.height = ch;
  }

  // ── Sample color under cursor ───────────────────────────────
  function sampleColor(mx, my) {
    // Find the image element under the cursor
    var el = document.elementFromPoint(mx, my);
    if (!el) return;

    var img = el.closest('.room__image') || el;
    if (img.tagName !== 'IMG' || !img.complete) return;

    try {
      // Create temp canvas if needed
      if (!sampleCanvas) {
        sampleCanvas = document.createElement('canvas');
        sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
      }

      // Scale down for performance (we only need 1 pixel)
      sampleCanvas.width = 1;
      sampleCanvas.height = 1;

      // Calculate the pixel position relative to the image
      var rect = img.getBoundingClientRect();
      var relX = (mx - rect.left) / rect.width;
      var relY = (my - rect.top) / rect.height;

      if (relX < 0 || relX > 1 || relY < 0 || relY > 1) return;

      // Draw 1×1 pixel from the source image
      sampleCtx.drawImage(
        img,
        relX * img.naturalWidth, relY * img.naturalHeight,
        1, 1,
        0, 0,
        1, 1
      );

      var data = sampleCtx.getImageData(0, 0, 1, 1).data;

      // Only use the color if it's not pure white/black
      if (data[3] > 50) { // Has some opacity
        currentColor.r = data[0];
        currentColor.g = data[1];
        currentColor.b = data[2];
      }
    } catch (e) {
      // CORS or other error — just keep current color
    }
  }

  // ── Add trail point ─────────────────────────────────────────
  function addTrailPoint(mx, my) {
    // Calculate velocity
    var dx = mx - prevMouse.x;
    var dy = my - prevMouse.y;
    var speed = Math.sqrt(dx * dx + dy * dy);
    var clampedSpeed = Math.min(speed, MAX_SPEED);

    // Brush size varies with speed (faster = larger)
    var brushSize = MIN_BRUSH_SIZE + (clampedSpeed / MAX_SPEED) * (MAX_BRUSH_SIZE - MIN_BRUSH_SIZE);

    trail.push({
      x: mx,
      y: my,
      r: currentColor.r,
      g: currentColor.g,
      b: currentColor.b,
      size: brushSize,
      opacity: BASE_OPACITY,
    });

    // Limit trail length
    if (trail.length > MAX_TRAIL_POINTS) {
      trail.shift();
    }

    prevMouse.x = mx;
    prevMouse.y = my;
  }

  // ── Draw frame ──────────────────────────────────────────────
  function draw() {
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, cw, ch);

    // Draw and decay trail points
    var i = trail.length;
    while (i--) {
      var point = trail[i];

      if (point.opacity < 0.01) {
        trail.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + point.r + ',' + point.g + ',' + point.b + ',' + point.opacity + ')';
      ctx.fill();

      // Decay
      point.opacity *= TRAIL_DECAY;
      // Also shrink slightly
      point.size *= 0.995;
    }
  }

  // ── Mouse handler ───────────────────────────────────────────
  function handleMouseMove(e) {
    if (!isActive) return;

    var mx = e.clientX;
    var my = e.clientY;

    // Sample color periodically
    if (++frameCount % SAMPLE_INTERVAL === 0) {
      sampleColor(mx, my);
    }

    addTrailPoint(mx, my);
  }

  // ── Animation loop ──────────────────────────────────────────
  function loop() {
    if (!isActive) return;
    draw();
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
    // Clear trail
    trail = [];
    if (ctx) ctx.clearRect(0, 0, cw, ch);
  }

  // ── Init ────────────────────────────────────────────────────
  function init() {
    canvas = document.getElementById('cursor-pigment');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    if (!ctx) return;

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Only activate on artwork rooms
    if (window.RoomState) {
      window.RoomState.onChange(function (newState) {
        var room = newState.room;
        if (!room) return;

        var roomType = room.dataset.roomType;
        var hasImage = room.classList.contains('room--artwork') ||
                       room.classList.contains('room--fullimg') ||
                       room.classList.contains('room--cinema') ||
                       room.classList.contains('room--video-full') ||
                       roomType === 'artwork' ||
                       roomType === 'video';
        if (hasImage) {
          startLoop();
        } else {
          stopLoop();
        }
      });
    }
  }

  // ── Public API ──────────────────────────────────────────────
  window.Pigment = {
    init: init,
  };

})();
