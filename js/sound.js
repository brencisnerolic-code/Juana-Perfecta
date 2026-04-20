/* ═══════════════════════════════════════════════════════════════
   SOUND.JS — Web Audio API ambient sound with toggle
   Lazy-loads audio on first user interaction
   Provides smooth fade in/out
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Configuration ───────────────────────────────────────────
  const AUDIO_SRC = 'audio/ambient.mp3';
  const MAX_VOLUME = 0.3;
  const FADE_DURATION = 2; // seconds

  // ── State ───────────────────────────────────────────────────
  let audioCtx = null;
  let gainNode = null;
  let audioSource = null;
  let audioBuffer = null;
  let isPlaying = false;
  let isLoaded = false;
  let isLoading = false;

  // ── DOM ─────────────────────────────────────────────────────
  var toggleBtn = null;

  // ── Load audio ──────────────────────────────────────────────
  function loadAudio(callback) {
    if (isLoaded || isLoading) return;
    isLoading = true;

    // Create audio context on user interaction
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioCtx.createGain();
    gainNode.connect(audioCtx.destination);
    gainNode.gain.value = 0;

    fetch(AUDIO_SRC)
      .then(function (response) {
        if (!response.ok) throw new Error('Audio not found');
        return response.arrayBuffer();
      })
      .then(function (buffer) {
        return audioCtx.decodeAudioData(buffer);
      })
      .then(function (decoded) {
        audioBuffer = decoded;
        isLoaded = true;
        isLoading = false;
        if (callback) callback();
      })
      .catch(function (err) {
        isLoading = false;
        console.warn('[Sound] Could not load audio:', err.message);
        // Hide toggle if audio file doesn't exist
        if (toggleBtn) toggleBtn.style.display = 'none';
      });
  }

  // ── Play with fade in ──────────────────────────────────────
  function play() {
    if (!isLoaded || !audioCtx) return;

    // Resume context (required after user gesture in some browsers)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Create new source (AudioBufferSourceNode can only be played once)
    audioSource = audioCtx.createBufferSource();
    audioSource.buffer = audioBuffer;
    audioSource.loop = true;
    audioSource.connect(gainNode);

    // Fade in
    gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(MAX_VOLUME, audioCtx.currentTime + FADE_DURATION);

    audioSource.start(0);
    isPlaying = true;

    if (toggleBtn) toggleBtn.classList.add('is-playing');
  }

  // ── Stop with fade out ─────────────────────────────────────
  function stop() {
    if (!isPlaying || !audioCtx || !audioSource) return;

    // Fade out
    gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
    gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + FADE_DURATION);

    // Stop source after fade
    var source = audioSource;
    setTimeout(function () {
      try { source.stop(); } catch (e) { /* already stopped */ }
    }, FADE_DURATION * 1000 + 100);

    audioSource = null;
    isPlaying = false;

    if (toggleBtn) toggleBtn.classList.remove('is-playing');
  }

  // ── Toggle ──────────────────────────────────────────────────
  function toggle() {
    if (!isLoaded) {
      // First click: load and play
      loadAudio(function () {
        play();
      });
      return;
    }

    if (isPlaying) {
      stop();
    } else {
      play();
    }
  }

  // ── Init ────────────────────────────────────────────────────
  function init() {
    toggleBtn = document.getElementById('sound-toggle');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', toggle);

    // Check if audio file exists (don't load yet, just check)
    fetch(AUDIO_SRC, { method: 'HEAD' })
      .then(function (response) {
        if (!response.ok) {
          // Audio file doesn't exist — hide button but keep it in DOM
          toggleBtn.style.opacity = '0.15';
          toggleBtn.title = 'Audio no disponible aún';
        }
      })
      .catch(function () {
        toggleBtn.style.opacity = '0.15';
        toggleBtn.title = 'Audio no disponible aún';
      });
  }

  // ── Public API ──────────────────────────────────────────────
  window.Sound = {
    init: init,
    play: play,
    stop: stop,
    toggle: toggle,
    isPlaying: function () { return isPlaying; },
  };

})();
