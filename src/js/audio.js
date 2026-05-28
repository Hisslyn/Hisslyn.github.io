(function () {
  var audio = document.getElementById('bg-audio');
  var muteBtn = document.getElementById('audio-toggle');
  var nextBtn = document.getElementById('audio-next');
  var volBtn = document.getElementById('audio-volume');
  if (!audio || !muteBtn) return;

  var MUTED_ICON = '🔇';
  var UNMUTED_ICON = '🔊';
  var AUDIO_BASE = '../../assets/audio/';
  var tracks = null;
  var VOLUME_STEPS = [0.1, 0.25, 0.5, 1.0];

  var FADE_IN_MS = 400;
  var FADE_OUT_MS = 350;

  var targetVolume = getVolume();
  var fadeRaf = null;

  function cancelFade() {
    if (fadeRaf !== null) {
      cancelAnimationFrame(fadeRaf);
      fadeRaf = null;
    }
  }

  function fadeIn(onDone) {
    cancelFade();
    var start = null;
    var startVol = audio.volume;
    function step(ts) {
      if (start === null) start = ts;
      var t = Math.min((ts - start) / FADE_IN_MS, 1);
      audio.volume = startVol + (targetVolume - startVol) * t;
      if (t < 1) {
        fadeRaf = requestAnimationFrame(step);
      } else {
        audio.volume = targetVolume;
        fadeRaf = null;
        if (onDone) onDone();
      }
    }
    fadeRaf = requestAnimationFrame(step);
  }

  function fadeOut(onDone) {
    cancelFade();
    var start = null;
    var startVol = audio.volume;
    function step(ts) {
      if (audio.paused && !audio.ended) {
        audio.volume = 0;
        fadeRaf = null;
        if (onDone) onDone();
        return;
      }
      if (start === null) start = ts;
      var t = Math.min((ts - start) / FADE_OUT_MS, 1);
      audio.volume = startVol * (1 - t);
      if (t < 1) {
        fadeRaf = requestAnimationFrame(step);
      } else {
        audio.volume = 0;
        fadeRaf = null;
        if (onDone) onDone();
      }
    }
    fadeRaf = requestAnimationFrame(step);
  }

  function startPlay() {
    audio.volume = 0;
    try {
      var p = audio.play();
      if (p && p.catch) p.catch(function () {});
    } catch (e) {}
    if (!audio.muted) fadeIn();
    else audio.volume = targetVolume;
  }

  function isMuted() {
    return localStorage.getItem('bgAudioMuted') !== 'false';
  }

  function applyMuteState(muted) {
    audio.muted = muted;
    muteBtn.setAttribute('aria-pressed', String(!muted));
    muteBtn.setAttribute('aria-label', muted ? 'Unmute background music' : 'Mute background music');
    muteBtn.textContent = muted ? MUTED_ICON : UNMUTED_ICON;
  }

  function getVolume() {
    var stored = parseFloat(localStorage.getItem('bgAudioVolume'));
    if (VOLUME_STEPS.indexOf(stored) !== -1) return stored;
    return 0.1;
  }

  function applyVolumeUI(vol) {
    if (volBtn) {
      var pct = Math.round(vol * 100) + '%';
      volBtn.textContent = pct;
      volBtn.setAttribute('aria-label', 'Volume ' + Math.round(vol * 100) + ' percent, click to change');
    }
  }

  function cycleVolume() {
    var current = targetVolume;
    var idx = VOLUME_STEPS.indexOf(current);
    var next = VOLUME_STEPS[(idx + 1) % VOLUME_STEPS.length];
    targetVolume = next;
    localStorage.setItem('bgAudioVolume', String(next));
    applyVolumeUI(next);
    if (!audio.muted && !audio.paused) {
      audio.volume = Math.min(audio.volume, next);
    } else if (!audio.muted) {
      audio.volume = next;
    }
  }

  function getIndex() {
    var idx = parseInt(localStorage.getItem('bgAudioTrack'), 10);
    if (isNaN(idx) || idx < 0) return 0;
    if (tracks && idx >= tracks.length) return 0;
    return idx;
  }

  function setIndex(idx) {
    localStorage.setItem('bgAudioTrack', String(idx));
  }

  function loadTrack(idx) {
    if (!tracks || !tracks.length) return;
    idx = ((idx % tracks.length) + tracks.length) % tracks.length;
    setIndex(idx);
    var source = audio.querySelector('source');
    if (source) {
      source.src = AUDIO_BASE + tracks[idx];
    } else {
      audio.src = AUDIO_BASE + tracks[idx];
    }
    audio.load();
  }

  function nextTrack() {
    if (!tracks || !tracks.length) return;
    var next = (getIndex() + 1) % tracks.length;
    cancelFade();
    fadeOut(function () {
      loadTrack(next);
      startPlay();
    });
  }

  function autoAdvance() {
    if (!tracks || !tracks.length) return;
    var next = (getIndex() + 1) % tracks.length;
    loadTrack(next);
    startPlay();
  }

  audio.addEventListener('ended', autoAdvance);

  if (nextBtn) {
    nextBtn.addEventListener('click', nextTrack);
  }

  if (volBtn) {
    volBtn.addEventListener('click', cycleVolume);
  }

  muteBtn.addEventListener('click', function () {
    var nowMuted = !audio.muted;
    localStorage.setItem('bgAudioMuted', String(nowMuted));
    applyMuteState(nowMuted);
    if (!nowMuted) {
      audio.volume = 0;
      try {
        var p = audio.play();
        if (p && p.catch) p.catch(function () {});
      } catch (e) {}
      fadeIn();
    } else {
      cancelFade();
    }
  });

  targetVolume = getVolume();
  applyVolumeUI(targetVolume);
  applyMuteState(isMuted());

  fetch('../../data/tracks.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      tracks = Array.isArray(data) && data.length ? data : null;
      if (tracks) {
        var idx = getIndex();
        loadTrack(idx);
      }
      applyMuteState(isMuted());
      startPlay();
    })
    .catch(function () {
      tracks = null;
      applyMuteState(isMuted());
      startPlay();
    });
}());
