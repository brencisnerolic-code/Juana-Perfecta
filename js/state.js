/* ═══════════════════════════════════════════════════════════════
   STATE.JS — Hierarchical context-based state machine
   Manages nested navigation: Main → Hub → Work categories → Rooms
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Context definitions ─────────────────────────────────────
  // Each context is an ordered array of room IDs
  var CONTEXTS = {
    main:         ['hero', 'letters', 'hub'],
    biomaterials: ['bio-proyecto', 'process-intro', 'process-matriz-01', 'process-matriz-02', 'process-matriz-03', 'process-matriz-04', 'process-matriz-05', 'process-matriz-06', 'process-matriz-07', 'process-matriz-08', 'process-matriz-09', 'process-matriz-10', 'process-matriz-11', 'process-matriz-12', 'process-matriz-13', 'process-matriz-14', 'process-matriz-15', 'process-matriz-16', 'process-matriz-17', 'works-video-intro', 'works-video-constellations', 'works-video-01', 'works-video-02', 'works-video-03', 'works-video-04', 'works-video-05'],
    abstract:     ['abstract-intro', 'art-abstracta-01', 'art-abstracta-02', 'art-abstracta-03', 'art-abstracta-04', 'art-abstracta-05', 'art-abstracta-06', 'art-abstracta-07', 'art-abstracta-08', 'art-abstracta-09', 'art-abstracta-10'],
    platasi:      ['platasi-intro', 'art-platasi-01', 'art-platasi-02', 'art-platasi-03', 'art-platasi-04', 'art-platasi-05', 'art-platasi-06', 'art-platasi-07', 'art-platasi-08'],
    artista:      ['statement', 'about', 'contact'],
    caso:         ['caso-01', 'caso-02', 'caso-03', 'caso-04', 'caso-05', 'caso-06', 'caso-07', 'caso-08', 'caso-09']
  };

  // ── State ───────────────────────────────────────────────────
  var roomEls = {};          // id → DOM element
  var currentCtx = 'main';
  var currentIdx = 0;
  var returnStack = [];      // [{ctx, idx}] for back navigation
  var locked = false;
  var DURATION = 800;        // must match CSS --room-transition
  var listeners = [];

  // ── Initialize ──────────────────────────────────────────────
  function init() {
    // Build room element map
    document.querySelectorAll('.room').forEach(function (el) {
      roomEls[el.id] = el;
      el.classList.remove('is-active', 'is-entering-forward', 'is-entering-backward');
    });

    // Check URL hash for deep linking
    var hash = location.hash.slice(1);
    if (hash && roomEls[hash]) {
      for (var c in CONTEXTS) {
        var i = CONTEXTS[c].indexOf(hash);
        if (i !== -1) {
          currentCtx = c;
          currentIdx = i;
          if (c !== 'main') {
            returnStack.push({ ctx: 'main', idx: 2 }); // return to hub
          }
          break;
        }
      }
    }

    // Activate initial room (no transition)
    var initialEl = roomEls[curId()];
    if (initialEl) initialEl.classList.add('is-active');

    updateUI();
    fire(null, 'init');
  }

  // ── Current state helpers ───────────────────────────────────
  function curId()   { return CONTEXTS[currentCtx][currentIdx]; }
  function curRoom() { return roomEls[curId()] || null; }

  function makeState() {
    return {
      room: curRoom(),
      roomId: curId(),
      context: currentCtx,
      subIndex: currentIdx
    };
  }

  // ── Core transition ─────────────────────────────────────────
  function go(toCtx, toIdx, dir) {
    if (locked) return false;
    var fromId = curId();
    var toId = CONTEXTS[toCtx] && CONTEXTS[toCtx][toIdx];
    if (!toId || !roomEls[toId] || fromId === toId) return false;

    locked = true;

    var fromEl = roomEls[fromId];
    var toEl   = roomEls[toId];
    var oldState = makeState();

    // Directional animation class
    toEl.classList.add('is-entering-' + dir);
    void toEl.offsetHeight; // force reflow
    toEl.classList.add('is-active');
    requestAnimationFrame(function () {
      toEl.classList.remove('is-entering-' + dir);
    });

    // Deactivate old room
    fromEl.classList.remove('is-active');

    // Update state
    currentCtx = toCtx;
    currentIdx = toIdx;

    // URL
    history.replaceState(null, '', '#' + toId);

    updateUI();
    fire(oldState, dir);

    setTimeout(function () { locked = false; }, DURATION);
    return true;
  }

  // Navigation intents can arrive while a transition is still locked
  // (e.g. clicking a menu link right after landing on a room). Instead of
  // silently dropping them, retry once the lock clears instead of losing
  // the user's action. Bounded so a permanently-stuck lock can't loop forever.
  var RETRY_DELAY = 100;
  var RETRY_MAX   = Math.ceil(DURATION / RETRY_DELAY) + 2;

  function retryIfLocked(fn, attempt) {
    attempt = attempt || 0;
    if (!locked) { fn(); return; }
    if (attempt >= RETRY_MAX) return; // give up: lock genuinely stuck
    setTimeout(function () { retryIfLocked(fn, attempt + 1); }, RETRY_DELAY);
  }

  // ── Linear navigation within context ────────────────────────
  function next() {
    if (locked) { retryIfLocked(next); return; }
    if (currentIdx < CONTEXTS[currentCtx].length - 1) {
      return go(currentCtx, currentIdx + 1, 'forward');
    }
    return false;
  }

  function prev() {
    if (locked) { retryIfLocked(prev); return; }
    if (currentIdx > 0) {
      return go(currentCtx, currentIdx - 1, 'backward');
    } else if (currentCtx !== 'main') {
      // At first room of a sub-context: go back to parent
      return exitContext();
    }
    return false;
  }

  // ── Context navigation ──────────────────────────────────────
  function enterContext(name, startIdx) {
    if (!CONTEXTS[name]) return;
    if (locked) { retryIfLocked(function () { enterContext(name, startIdx); }); return; }
    returnStack.push({ ctx: currentCtx, idx: currentIdx });
    go(name, startIdx || 0, 'forward');
  }

  function exitContext() {
    if (!returnStack.length) return false;
    if (locked) { retryIfLocked(exitContext); return; }
    var ret = returnStack.pop();
    return go(ret.ctx, ret.idx, 'backward');
  }

  // ── Direct room navigation ─────────────────────────────────
  function goToRoom(roomId) {
    for (var c in CONTEXTS) {
      var i = CONTEXTS[c].indexOf(roomId);
      if (i !== -1) {
        if (c === currentCtx) {
          // Same context: navigate within it
          var dir = i > currentIdx ? 'forward' : 'backward';
          go(c, i, dir);
        } else {
          // Different context: set return stack and enter
          returnStack = c !== 'main' ? [{ ctx: 'main', idx: 2 }] : [];
          go(c, i, 'forward');
        }
        return;
      }
    }
  }

  // ── UI updates ──────────────────────────────────────────────
  function updateUI() {
    // Progress bar: shows progress within current context
    var fill = document.getElementById('progress-fill');
    if (fill) {
      var len = CONTEXTS[currentCtx].length;
      fill.style.width = ((currentIdx + 1) / len * 100) + '%';
    }

    // Counter: hidden on main context, visible in sub-contexts
    var cEl = document.getElementById('room-current');
    var tEl = document.getElementById('room-total');
    var counter = document.querySelector('.topbar__counter');

    if (currentCtx === 'main' || currentCtx === 'biomaterials') {
      if (counter) counter.style.opacity = '0';
    } else {
      if (counter) counter.style.opacity = '1';
      var ctx = CONTEXTS[currentCtx];
      if (cEl) cEl.textContent = String(currentIdx + 1).padStart(2, '0');
      if (tEl) tEl.textContent = String(ctx.length).padStart(2, '0');
    }

    // Body data attribute for CSS hooks
    document.body.dataset.context = currentCtx;
  }

  // ── Listeners ───────────────────────────────────────────────
  function fire(oldState, dir) {
    var newState = makeState();
    listeners.forEach(function (fn) {
      try { fn(newState, oldState, dir); } catch (e) { console.error(e); }
    });
  }

  function onChange(fn) {
    if (typeof fn === 'function') listeners.push(fn);
  }

  // ── Public API ──────────────────────────────────────────────
  window.RoomState = {
    init:              init,
    next:              next,
    prev:              prev,
    enterContext:      enterContext,
    exitContext:       exitContext,
    goToRoom:          goToRoom,
    getCurrentRoom:    curRoom,
    getCurrentRoomId:  curId,
    getCurrentContext: function () { return currentCtx; },
    getCurrentSubIndex: function () { return currentIdx; },
    getContextLength:  function () { return CONTEXTS[currentCtx].length; },
    onChange:           onChange,
    isLocked:          function () { return locked; },
    makeState:         makeState,
    getState:          makeState
  };

})();
