// ── Плеер ──────────────────────────────────────────────────
let isPlaying = false;
let trackDuration = 0, trackPosition = 0, positionTimestamp = 0;
let progressTimer = null;

function setProgress(pos, dur) {
  const pct = dur > 0 ? Math.min(pos / dur * 100, 100) : 0;
  const fill = document.getElementById('progress-fill');
  if (fill) fill.style.width = pct.toFixed(1) + '%';
  const fmt = ms => { const s = Math.max(0, Math.floor(ms/1000)); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); };
  set('time-cur', fmt(pos));
  set('time-dur', fmt(dur));
}

function startProgressTick() {
  stopProgressTick();
  progressTimer = setInterval(() => {
    if (!isPlaying || trackDuration <= 0) return;
    const pos = Math.min(trackPosition + (Date.now() - positionTimestamp), trackDuration);
    setProgress(pos, trackDuration);
  }, 1000);
}

function stopProgressTick() {
  if (progressTimer) { clearInterval(progressTimer); progressTimer = null; }
}

function setPlayState(playing) {
  isPlaying = playing;
  el("icon-play").style.display  = playing ? "none"  : "block";
  el("icon-pause").style.display = playing ? "block" : "none";
  if (playing) startProgressTick(); else stopProgressTick();
}

const MuteManager = (() => {
  let userMuted = false;
  let savedVolume = null;
  let toggleLock = false;

  function updateUI() {
    const btn = el('btn-mute');
    if (!btn) return;
    btn.classList.toggle('active', userMuted);
    btn.setAttribute('aria-label', userMuted ? 'Включить звук' : 'Без звука');
    btn.setAttribute('aria-pressed', userMuted ? 'true' : 'false');
  }

  function toggle() {
    if (toggleLock) return;
    toggleLock = true;
    setTimeout(() => { toggleLock = false; }, 400);

    if (userMuted) {
      userMuted = false;
      if (savedVolume != null && savedVolume > 0) {
        VolumeManager.setVolume(savedVolume);
      }
      savedVolume = null;
    } else {
      const current = VolumeManager.getVolume();
      if (current > 0) savedVolume = current;
      userMuted = true;
      VolumeManager.setVolume(0);
    }
    updateUI();
  }

  function syncFromDevice() {
    if (userMuted) return;
    VolumeManager.fetchVolume();
    if (VolumeManager.getVolume() === 0) {
      userMuted = true;
      updateUI();
    }
  }

  function onVolumeChange(v) {
    if (userMuted && v > 0) {
      userMuted = false;
      savedVolume = null;
      updateUI();
    } else if (!userMuted && v === 0) {
      userMuted = true;
      updateUI();
    }
  }

  function init() {
    const btn = el('btn-mute');
    if (!btn) return;
    btn.innerHTML = buildClIcon('icons/mute-button.svg');
    btn.addEventListener('click', toggle);
    VolumeManager.subscribe(onVolumeChange);
    syncFromDevice();
  }

  init();
  return { syncFromDevice };
})();

el('btn-next').addEventListener('click', () => run('MEDIA_NEXT'));
el('btn-play').addEventListener('click', () => { run(isPlaying ? 'MEDIA_PAUSE' : 'MEDIA_PLAY'); setPlayState(!isPlaying); });
