// ── Переключатели нижней строки дашборда ─────────────────────
const DashboardSettings = (() => {
  const STORAGE = {
    volume: 'lite_show_volume_controls',
    climate: 'lite_show_climate_controls',
  };

  const state = {
    volume: loadLS(STORAGE.volume) !== false,
    climate: loadLS(STORAGE.climate) !== false,
  };

  function apply() {
    const root = el('root');
    if (!root) return;
    root.classList.toggle('hide-volume-controls', !state.volume);
    root.classList.toggle('hide-climate-controls', !state.climate);
    const volumeSwitch = el('settings-volume');
    const climateSwitch = el('settings-climate');
    if (volumeSwitch) volumeSwitch.checked = state.volume;
    if (climateSwitch) climateSwitch.checked = state.climate;
  }

  function setVisible(key, visible) {
    if (!(key in state)) return;
    state[key] = !!visible;
    saveLS(STORAGE[key], state[key]);
    apply();
    const dockVisible = typeof DockExtraReveal !== 'undefined' && DockExtraReveal?.isVisible?.();
    if (key === 'climate' && state[key] && dockVisible) {
      TempManager.scheduleRefresh();
    }
    if (key === 'climate' && !state[key]) {
      TempManager.stopPoll();
    }
  }

  function bind() {
    el('settings-volume')?.addEventListener('change', e => setVisible('volume', e.currentTarget.checked));
    el('settings-climate')?.addEventListener('change', e => setVisible('climate', e.currentTarget.checked));
  }

  function init() {
    bind();
    apply();
  }

  init();

  return {
    apply,
    setVolumeVisible: value => setVisible('volume', value),
    setClimateVisible: value => setVisible('climate', value),
    isVolumeVisible: () => state.volume,
    isClimateVisible: () => state.climate,
  };
})();

const SettingsDialog = (() => {
  const backdrop = el('settings-backdrop');
  const openBtn = el('btn-settings');
  const closeBtn = el('settings-close');

  function open() {
    if (!backdrop) return;
    backdrop.classList.remove('settings-hidden');
    openBtn?.setAttribute('aria-expanded', 'true');
  }

  function close() {
    if (!backdrop) return;
    backdrop.classList.add('settings-hidden');
    openBtn?.setAttribute('aria-expanded', 'false');
  }

  openBtn?.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  backdrop?.addEventListener('click', e => {
    if (e.target === backdrop) close();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && backdrop && !backdrop.classList.contains('settings-hidden')) close();
  });

  return { open, close };
})();
