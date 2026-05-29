function notifyAndroidReady() {
  ensureJsReady();
}

function bootAndroidBridge() {
  if (!window.androidApi) return;
  notifyAndroidReady();
  VolumeManager.init();
  MuteManager.syncFromDevice();
  ThemeManager.scheduleThemeRefresh();
}

let bridgeWatcherTimer = null;
let bridgeWatcherDone = false;

function stopBridgeWatcher() {
  if (bridgeWatcherTimer) {
    clearInterval(bridgeWatcherTimer);
    bridgeWatcherTimer = null;
  }
}

function startBridgeWatcher() {
  if (bridgeWatcherDone) return;
  const started = Date.now();
  const MAX_MS = 30000;
  const tick = () => {
    bootAndroidBridge();
    if (isAndroidBridgeOperational()) {
      bridgeWatcherDone = true;
      stopBridgeWatcher();
      return;
    }
    if (Date.now() - started >= MAX_MS) {
      bridgeWatcherDone = true;
      stopBridgeWatcher();
    }
  };
  tick();
  bridgeWatcherTimer = setInterval(tick, 500);
}

bootAndroidBridge();
startBridgeWatcher();

[100, 500, 1500].forEach(ms => {
  setTimeout(bootAndroidBridge, ms);
});

waitForAndroidApi(() => bootAndroidBridge());

const DockExtraReveal = (() => {
  const REQUIRED_TAPS = 5;
  const RESET_MS = 2000;
  let taps = 0;
  let resetTimer = null;

  function isVisible() {
    const node = el('dock-extra');
    return !!node && !node.classList.contains('dock-extra-hidden');
  }

  function setVisible(show) {
    const node = el('dock-extra');
    if (!node) return;
    node.classList.toggle('dock-extra-hidden', !show);
    if (show) {
      TempManager.scheduleRefresh();
    } else {
      TempManager.stopPoll();
    }
  }

  function onClockTap() {
    taps += 1;
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => { taps = 0; }, RESET_MS);
    if (taps >= REQUIRED_TAPS) {
      taps = 0;
      clearTimeout(resetTimer);
      setVisible(!isVisible());
    }
  }

  el('clock-block')?.addEventListener('click', onClockTap);

  return { isVisible, setVisible };
})();
