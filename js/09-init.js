function notifyAndroidReady() {
  ensureJsReady();
}

function bootAndroidBridge() {
  if (!window.androidApi) return;
  notifyAndroidReady();
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
