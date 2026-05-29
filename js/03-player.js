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

el('btn-prev').addEventListener('click', () => run('MEDIA_BLACK'));
el('btn-next').addEventListener('click', () => run('MEDIA_NEXT'));
el('btn-play').addEventListener('click', () => { run(isPlaying ? 'MEDIA_PAUSE' : 'MEDIA_PLAY'); setPlayState(!isPlaying); });
