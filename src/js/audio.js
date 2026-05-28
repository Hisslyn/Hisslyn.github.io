(function () {
  var audio = document.getElementById('bg-audio');
  var btn = document.getElementById('audio-toggle');
  if (!audio || !btn) return;

  var MUTED_ICON = '🔇';
  var UNMUTED_ICON = '🔊';

  function isMuted() {
    return localStorage.getItem('bgAudioMuted') !== 'false';
  }

  function applyState(muted) {
    audio.muted = muted;
    btn.setAttribute('aria-pressed', String(!muted));
    btn.setAttribute('aria-label', muted ? 'Unmute background music' : 'Mute background music');
    btn.textContent = muted ? MUTED_ICON : UNMUTED_ICON;
  }

  applyState(isMuted());

  try {
    audio.play().catch(function () {});
  } catch (e) {}

  btn.addEventListener('click', function () {
    var nowMuted = !audio.muted;
    localStorage.setItem('bgAudioMuted', String(nowMuted));
    applyState(nowMuted);
    if (!nowMuted) {
      try {
        audio.play().catch(function () {});
      } catch (e) {}
    }
  });
}());
