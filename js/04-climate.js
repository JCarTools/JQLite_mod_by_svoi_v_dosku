function resetControlUI(itemId) {
  const btn = el(itemId);
  if (!btn || (climateState[itemId] || 0) === 0) return;
  climateState[itemId] = 0;
  btn.querySelectorAll('.cl-dot').forEach(d => d.classList.remove('on'));
  btn.classList.remove('active');
}

function mountControl(item, grid) {
  const btn = document.createElement('div');
  btn.className = 'cl-btn';
  btn.id = item.id;

  if (item.memory) {
    btn.classList.add('cl-btn-memory');
    btn.innerHTML = item.memory.map((_, i) =>
      `<button type="button" class="cl-memory-seg" data-lv="${i + 1}">${i + 1}</button>`
    ).join('');

    const updateMemoryUI = (level) => {
      btn.querySelectorAll('.cl-memory-seg').forEach(seg => {
        seg.classList.toggle('active', parseInt(seg.dataset.lv, 10) === level);
      });
    };

    updateMemoryUI(climateState[item.id] || 0);

    btn.querySelectorAll('.cl-memory-seg').forEach(seg => {
      seg.addEventListener('click', (e) => {
        e.stopPropagation();
        const level = parseInt(seg.dataset.lv, 10);
        climateState[item.id] = level;
        updateMemoryUI(level);
        run(item.memory[level - 1]);
      });
    });

    grid.appendChild(btn);
    return;
  }

  const max = parseInt(item.max) || 1;
  btn.dataset.on = item.on;
  btn.dataset.off = item.off;
  btn.dataset.max = String(max);
  const dots = Array.from({length: max}, (_, i) => `<div class="cl-dot" data-lv="${i+1}"></div>`).join('');
  btn.innerHTML = `${buildClIcon(item.icon, item.iconMirrorX ? 'cl-icon-mirror-x' : '')}<div class="cl-dots">${dots}</div>`;

  btn.addEventListener('click', () => {
    const next = ((climateState[item.id] || 0) + 1) % (max + 1);
    climateState[item.id] = next;
    btn.querySelectorAll('.cl-dot').forEach(d => d.classList.toggle('on', parseInt(d.dataset.lv) <= next));
    btn.classList.toggle('active', next > 0);
    if (next > 0) {
      const exclusiveId = CLIMATE_EXCLUSIVE[item.id];
      if (exclusiveId) resetControlUI(exclusiveId);
    }
    run(next === 0 ? btn.dataset.off : (max > 1 ? btn.dataset.on + '_' + next : btn.dataset.on));
  });

  if (max > 1) {
    let lt;
    const sl = () => { lt = setTimeout(() => { if ((climateState[item.id]||0) > 0) { climateState[item.id]=0; btn.querySelectorAll('.cl-dot').forEach(d=>d.classList.remove('on')); btn.classList.remove('active'); run(btn.dataset.off); btn.blur(); btn.classList.add('force-release'); setTimeout(()=>btn.classList.remove('force-release'),50); } }, 600); };
    const cl = () => clearTimeout(lt);
    btn.addEventListener('touchstart', sl, {passive:true});
    btn.addEventListener('touchend', cl);
    btn.addEventListener('touchcancel', cl);
    btn.addEventListener('mousedown', sl);
    btn.addEventListener('mouseup', cl);
    btn.addEventListener('mouseleave', cl);
  }

  grid.appendChild(btn);
}

function buildDriverControls() {
  const grid = el('driver-grid');
  if (!grid) return;
  grid.innerHTML = '';
  DRIVER_CONTROLS.forEach(item => mountControl(item, grid));
}

function buildPassengerControls() {
  const grid = el('passenger-grid');
  if (!grid) return;
  grid.innerHTML = '';
  PASSENGER_CONTROLS.forEach(item => mountControl(item, grid));
}

buildDriverControls();
buildPassengerControls();

function buildShutterControls() {
  const wrap = el('passenger-vol');
  if (!wrap) return;
  wrap.innerHTML = '';
  SHUTTER_CONTROLS.forEach(item => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cl-btn cl-btn-vol';
    btn.id = item.id;
    btn.setAttribute('aria-label', item.aria);
    btn.innerHTML = buildClIcon(item.icon);
    btn.addEventListener('click', () => run(item.cmd));
    wrap.appendChild(btn);
  });
}

buildShutterControls();

function buildCenterVolumeControls() {
  const wrap = el('volume-controls');
  if (!wrap) return;
  wrap.innerHTML = '';
  VOLUME_CENTER_CONTROLS.forEach(item => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cl-btn cl-btn-vol cl-btn-vol-media';
    btn.id = item.id;
    btn.setAttribute('aria-label', item.aria);
    btn.innerHTML = buildClIcon(item.icon);
    if (item.action === 'up') {
      btn.addEventListener('click', () => VolumeManager.volumeUp());
    } else if (item.action === 'down') {
      btn.addEventListener('click', () => VolumeManager.volumeDown());
    }
    wrap.appendChild(btn);
  });
  MuteManager.init();
}

buildCenterVolumeControls();
