window.onAndroidEvent = function(type, data) {
  const typeNorm = String(type || '').toLowerCase();
  const themeTypes = /^(theme|uimode|nightmode|systemtheme|darkmode|uimodechange|daynight|appearance|configurationchanged)$/;

  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (themeTypes.test(typeNorm)) {
      try {
        data = JSON.parse(trimmed);
      } catch(e) {
        ThemeManager.handleThemeEvent(typeNorm, trimmed);
        return;
      }
    } else if (typeNorm === 'musicinfo') {
      try { data = JSON.parse(trimmed); } catch(e) { return; }
    } else {
      try { data = JSON.parse(trimmed); } catch(e) { return; }
    }
  }
  if (data == null) {
    if (themeTypes.test(typeNorm)) {
      ThemeManager.scheduleThemeRefresh();
    }
    return;
  }

  switch (typeNorm) {
    case 'musicinfo': {
      const title = data.SongName || '', artist = data.SongArtist || '', hasTrack = !!(title||artist);
      set('track-title', hasTrack ? title : 'Не воспроизводится');
      set('track-artist', hasTrack ? artist : '—');
      const art = el('album-art');
      if (data.SongAlbumPicture) { art.src = 'data:image/png;base64,'+data.SongAlbumPicture; art.classList.remove('empty'); }
      else { art.src = 'img/music-placeholder.svg'; art.classList.toggle('empty', !hasTrack); }
      const pos = parseFloat(data.Trpos||0), dur = parseFloat(data.Trdur||0);
      trackDuration = dur; trackPosition = pos; positionTimestamp = Date.now();
      setProgress(pos, dur);
      const playing = data.isPlaying===true||data.isPlaying==='true'||data.isPlaying===1;
      if (playing !== isPlaying) setPlayState(playing);
      break;
    }
    case 'theme':
      ThemeManager.handleThemeEvent('theme', data);
      break;
    case 'uimode':
    case 'nightmode':
    case 'systemtheme':
    case 'darkmode':
    case 'uimodechange':
    case 'daynight':
    case 'appearance':
    case 'configurationchanged':
      ThemeManager.handleThemeEvent(typeNorm, data);
      break;
  }
};
