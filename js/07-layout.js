function updateAppsLayout() {
  const root = el('root');
  const bottom = el('bottom');
  const appsCard = el('card-apps');
  const passengerCard = el('card-passenger');
  if (!root || !bottom || !appsCard || !passengerCard) return;

  const rootStyle = getComputedStyle(document.documentElement);
  const bottomStyle = getComputedStyle(bottom);
  const cardStyle = getComputedStyle(appsCard);

  const minTile = Math.min(
    parseFloat(rootStyle.getPropertyValue('--app-slot-min-w')) || 100,
    parseFloat(rootStyle.getPropertyValue('--seat-btn-w')) || 120
  );
  const gridGap = parseFloat(rootStyle.getPropertyValue('--apps-grid-gap')) || 16;
  const cardGap = parseFloat(bottomStyle.gap) || 16;
  const appsCols = parseFloat(rootStyle.getPropertyValue('--apps-grid-cols')) || 4;
  const driverCols = LAYOUT.driverCols || 0;
  const passengerTileCols = LAYOUT.passengerCols;
  const cardCount = driverCols > 0 ? 3 : 2;
  const padX = parseFloat(cardStyle.paddingLeft) + parseFloat(cardStyle.paddingRight);
  const cardBorderX = (parseFloat(cardStyle.borderLeftWidth) || 0)
    + (parseFloat(cardStyle.borderRightWidth) || 0);

  const totalBtnCols = driverCols + passengerTileCols + appsCols;
  const innerGaps = gridGap * (
    Math.max(0, driverCols - 1) + Math.max(0, passengerTileCols - 1) + Math.max(0, appsCols - 1)
  );
  const cardGaps = cardGap * LAYOUT.cardGaps;
  const available = bottom.clientWidth - cardCount * padX - innerGaps - cardGaps - cardBorderX * cardCount;
  let tileW = Math.floor((available / totalBtnCols) * 100) / 100;

  const appsInner = bottom.clientWidth - padX - cardBorderX - gridGap * (appsCols - 1);
  const appsTileW = appsInner / appsCols;
  const halfW = (bottom.clientWidth - cardGap) / 2 - padX - cardBorderX;
  const seatCols = Math.max(driverCols, passengerTileCols);
  const seatTileW = seatCols > 0
    ? (halfW - gridGap * (seatCols - 1)) / seatCols
    : Infinity;
  const stacked = tileW < minTile || appsTileW < minTile || seatTileW < minTile;

  root.classList.toggle('apps-stacked', stacked);

  if (stacked) {
    root.style.removeProperty('--unified-tile-w');
  } else {
    root.style.setProperty('--unified-tile-w', `${tileW}px`);
  }
}

function initAppsLayout() {
  const bottom = el('bottom');
  if (!bottom) return;
  updateAppsLayout();
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(() => updateAppsLayout()).observe(bottom);
  } else {
    window.addEventListener('resize', updateAppsLayout);
  }
}

initAppsLayout();
