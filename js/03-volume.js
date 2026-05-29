// ── Громкость (setvol + echo-suppress, fallback runEnum) ───
const VolumeManager = (() => {
  const ECHO_SUPPRESS_MS = 4000;
  const VOL_STEP = 5;
  const STUCK_VOL = 48;
  const ENUM_STEP_MS = 90;

  let currentVolume = 50;
  let lastSetValue = null;
  let lastSetTime = 0;
  let mode = null;
  let modeResolved = false;
  let enumTimer = null;
  let callbacks = [];

  function isSuppressing() {
    return lastSetValue != null && (Date.now() - lastSetTime) < ECHO_SUPPRESS_MS;
  }

  function notify() {
    callbacks.forEach(cb => {
      try { cb(currentVolume); } catch (e) {}
    });
  }

  function readRawVolume() {
    if (!hasVolApi()) return null;
    const raw = callVolApi('getvol') ?? callVolApi('getVolume');
    if (raw === -1) return null;
    return clampMediaVolume(raw);
  }

  function fetchVolume() {
    const v = readRawVolume();
    if (v == null) return currentVolume;
    if (isSuppressing() && v !== lastSetValue) return currentVolume;
    if (v !== currentVolume) {
      currentVolume = v;
      notify();
    }
    return currentVolume;
  }

  function resolveMode() {
    if (modeResolved) return mode || 'direct';
    const cached = loadLS('lite_vol_mode');
    if (cached === 'direct' || cached === 'enum') {
      mode = cached;
      modeResolved = true;
      return mode;
    }
    mode = 'direct';
    modeResolved = true;
    return mode;
  }

  function setMode(next) {
    if (next !== 'direct' && next !== 'enum') return;
    mode = next;
    modeResolved = true;
    saveLS('lite_vol_mode', next);
  }

  function getMode() {
    return resolveMode();
  }

  function setVolumeDirect(value) {
    const v = clampMediaVolume(value);
    if (v == null) return;
    lastSetValue = v;
    lastSetTime = Date.now();
    callVolApi('setvol', v) ?? callVolApi('setVolume', v);
    if (v !== currentVolume) {
      currentVolume = v;
      notify();
    }
  }

  function clearEnumTimer() {
    if (enumTimer) {
      clearTimeout(enumTimer);
      enumTimer = null;
    }
  }

  function enumChange(delta) {
    const step = delta > 0 ? 1 : -1;
    const count = Math.abs(delta);
    for (let i = 0; i < count; i++) runVolumeStep(step);
    const est = clampMediaVolume(currentVolume + delta);
    if (est != null) {
      currentVolume = est;
      notify();
    }
  }

  function stepTowardEnum(target, attemptsLeft) {
    if (attemptsLeft <= 0) {
      clearEnumTimer();
      return;
    }
    const live = readRawVolume();
    const current = live ?? currentVolume;
    if (current === target || (target === 0 && current <= 0)) {
      currentVolume = target;
      notify();
      clearEnumTimer();
      return;
    }
    runVolumeStep(current < target ? 1 : -1);
    enumTimer = setTimeout(() => stepTowardEnum(target, attemptsLeft - 1), ENUM_STEP_MS);
  }

  function setVolume(value) {
    const v = clampMediaVolume(value);
    if (v == null) return;
    if (getMode() === 'enum') {
      clearEnumTimer();
      stepTowardEnum(v, 120);
      return;
    }
    setVolumeDirect(v);
  }

  function volumeUp(step = VOL_STEP) {
    if (getMode() === 'enum') {
      enumChange(step);
      return;
    }
    setVolumeDirect(Math.min(100, currentVolume + step));
  }

  function volumeDown(step = VOL_STEP) {
    if (getMode() === 'enum') {
      enumChange(-step);
      return;
    }
    setVolumeDirect(Math.max(0, currentVolume - step));
  }

  function probeMode() {
    if (!hasVolApi()) return;
    const cached = loadLS('lite_vol_mode');
    if (cached === 'direct' || cached === 'enum') {
      mode = cached;
      modeResolved = true;
      return;
    }

    const before = readRawVolume();
    if (before == null) return;

    const target = before <= 35 ? Math.min(100, before + 15) : 30;
    callVolApi('setvol', target);
    lastSetValue = target;
    lastSetTime = Date.now();

    setTimeout(() => {
      const after = readRawVolume();
      if (after == null) return;
      if (after === target || Math.abs(after - target) <= 2) {
        setMode('direct');
        currentVolume = after;
        notify();
      } else if (after === STUCK_VOL || (after === before && after !== target)) {
        setMode('enum');
      }
      lastSetValue = null;
    }, 350);
  }

  function handleVolumeFromSystem(volume) {
    const v = clampMediaVolume(volume ?? parseApiNumber(volume));
    if (v == null) return;
    lastSetValue = null;
    if (v !== currentVolume) {
      currentVolume = v;
      notify();
    }
  }

  function init() {
    fetchVolume();
    probeMode();
  }

  return {
    init,
    fetchVolume,
    getVolume: () => currentVolume,
    setVolume,
    volumeUp,
    volumeDown,
    handleVolumeFromSystem,
    getMode,
    subscribe(cb) {
      if (typeof cb !== 'function') return () => {};
      callbacks.push(cb);
      cb(currentVolume);
      return () => {
        const i = callbacks.indexOf(cb);
        if (i !== -1) callbacks.splice(i, 1);
      };
    },
  };
})();
