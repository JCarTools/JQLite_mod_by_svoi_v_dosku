const el     = id => document.getElementById(id);
const set    = (id, v) => { const e = el(id); if (e) e.textContent = v; };

/** runEnum may return a JSON string or a parsed object. */
function parseApiJson(raw) {
  if (raw == null || raw === '') return null;
  if (typeof raw === 'object') return raw;
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch(e) { return null; }
  }
  return null;
}

let jsReadySent = false;

/** Poll until window.androidApi exists (e.g. injected after script load). */
function waitForAndroidApi(callback, options = {}) {
  const interval = options.interval ?? 500;
  const maxMs = options.maxMs ?? 30000;
  const started = Date.now();
  const tick = () => {
    if (window.androidApi) {
      callback(window.androidApi);
      return;
    }
    if (Date.now() - started >= maxMs) return;
    setTimeout(tick, interval);
  };
  tick();
}

/** True when the Android bridge can accept launcher commands. */
function isAndroidBridgeOperational() {
  const api = window.androidApi;
  if (!api || typeof api.runEnum !== 'function') return false;
  return ensureJsReady();
}

/** Docs: onJsReady(TOKEN) before androidApi commands. */
function ensureJsReady() {
  if (jsReadySent) return true;
  const api = window.androidApi;
  if (!api || typeof api.onJsReady !== 'function') return false;
  try {
    api.onJsReady(TOKEN);
    jsReadySent = true;
    return true;
  } catch(e) {
    return false;
  }
}

function run(cmd) {
  if (!cmd) return false;
  const api = window.androidApi;
  if (!api || typeof api.runEnum !== 'function') return false;
  ensureJsReady();
  try {
    const raw = api.runEnum(TOKEN, cmd);
    return parseApiJson(raw) ?? raw ?? true;
  } catch(e) {
    return false;
  }
}

const runApp = pkg => {
  const api = window.androidApi;
  if (!api || typeof api.runApp !== 'function') return false;
  ensureJsReady();
  try {
    api.runApp(TOKEN, pkg);
    return true;
  } catch(e) {
    return false;
  }
};
const saveLS = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {} };
const loadLS = k => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch(e) { return null; } };

/** Inline SVG + currentColor — работает на file:// без CORS (в отличие от mask-image) */
function buildClIcon(icon, extraClass = '') {
  const cls = extraClass ? `cl-icon ${extraClass}` : 'cl-icon';
  const svg = typeof ICON_SVG !== 'undefined' ? ICON_SVG[icon] : null;
  if (svg) return `<div class="${cls}" aria-hidden="true">${svg}</div>`;
  return `<div class="${cls}"><img src="${icon}" alt=""></div>`;
}
