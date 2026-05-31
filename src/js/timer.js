(function () {
    'use strict';

    var BARS = [
        {
            id: 1,
            lsStart:   'timerBar1Start',
            lsEnd:     'timerBar1End',
            lsLabel:   'timerBar1Name',
            lsNextDay: 'timerBar1NextDay',
            defaultStart: '09:00',
            defaultEnd:   '17:00',
            defaultLabel: 'Diana',
        },
        {
            id: 2,
            lsStart:   'timerBar2Start',
            lsEnd:     'timerBar2End',
            lsLabel:   'timerBar2Name',
            lsNextDay: 'timerBar2NextDay',
            defaultStart: '09:00',
            defaultEnd:   '18:00',
            defaultLabel: 'Azat',
        },
    ];

    function parseHHMM(str) {
        if (typeof str !== 'string') return null;
        var match = str.trim().match(/^(\d{1,2}):(\d{1,2})$/);
        if (!match) return null;
        var h = parseInt(match[1], 10);
        var m = parseInt(match[2], 10);
        if (h > 23 || m > 59) return null;
        return h * 60 + m;
    }

    function normalizeHHMM(str) {
        var v = parseHHMM(str);
        if (v === null) return str;
        return String(Math.floor(v / 60)).padStart(2, '0') + ':' + String(v % 60).padStart(2, '0');
    }

    // Returns seconds since epoch for today's HH:MM, or tomorrow's if nextDay=true.
    // We use absolute timestamps so cross-midnight windows work correctly
    // regardless of whether the current wall-clock time is before or after midnight.
    function toAbsMs(hhmm, nextDay) {
        var d = new Date();
        d.setHours(Math.floor(hhmm / 60), hhmm % 60, 0, 0);
        if (nextDay) d.setDate(d.getDate() + 1);
        return d.getTime();
    }

    // Compute bar state using absolute timestamps.
    // startMin / endMin are minutes (0-1439). nextDay: whether end is +24h.
    // Returns null if the window is invalid (end <= start, nextDay unchecked).
    function computeState(startMin, endMin, nextDay) {
        var nowMs   = Date.now();
        var startMs = toAbsMs(startMin, false);
        var endMs   = toAbsMs(endMin, nextDay);

        // Without nextDay, if end <= start the window makes no sense — signal invalid.
        if (!nextDay && endMin <= startMin) return null;

        var span    = endMs - startMs;   // always positive (nextDay guarantees it when end<=start)
        var elapsed = nowMs - startMs;

        if (elapsed < 0) {
            return { pct: 100, fill: 0, upcoming: true, done: false, urgency: false };
        }
        if (elapsed >= span) {
            return { pct: 0, fill: 100, upcoming: false, done: true, urgency: false };
        }
        var fillFrac = elapsed / span;
        var remFrac  = 1 - fillFrac;
        var pct      = remFrac * 100;
        return { pct: pct, fill: fillFrac * 100, upcoming: false, done: false, urgency: pct < 15 };
    }

    function shake(el) {
        el.classList.remove('timer-shake');
        void el.offsetWidth;
        el.classList.add('timer-shake');
        el.addEventListener('animationend', function h() {
            el.classList.remove('timer-shake');
            el.removeEventListener('animationend', h);
        });
    }

    function applyMask(input, hintEl) {
        input.addEventListener('keydown', function (e) {
            var key = e.key;
            if (key === 'ArrowUp' || key === 'ArrowDown') {
                var v = parseHHMM(input.value);
                if (v !== null) {
                    v += key === 'ArrowUp' ? 1 : -1;
                    if (v < 0)     v += 1440;
                    if (v >= 1440) v -= 1440;
                    var hh = String(Math.floor(v / 60)).padStart(2, '0');
                    var mm = String(v % 60).padStart(2, '0');
                    input.value = hh + ':' + mm;
                    e.preventDefault();
                    input.dispatchEvent(new Event('input'));
                    input.dispatchEvent(new Event('change'));
                }
                return;
            }
            var allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Home', 'End'];
            if (allowed.indexOf(key) !== -1) return;
            if (!/^[\d:]$/.test(key)) { e.preventDefault(); }
        });

        input.addEventListener('blur', function () {
            var val = input.value.trim();
            var parsed = parseHHMM(val);
            if (parsed === null) {
                input.dataset.invalid = 'true';
                shake(input);
                if (hintEl) {
                    hintEl.textContent = 'use HH:MM (00:00 – 23:59)';
                    hintEl.classList.add('visible');
                }
            } else {
                input.value = normalizeHHMM(val);
                delete input.dataset.invalid;
                if (hintEl) hintEl.classList.remove('visible');
            }
        });

        input.addEventListener('focus', function () {
            delete input.dataset.invalid;
            if (hintEl) hintEl.classList.remove('visible');
            input.select();
        });
    }

    function initLabel(labelEl, lsKey, defaultText) {
        var saved = localStorage.getItem(lsKey);
        if (saved) labelEl.textContent = saved;
        labelEl.setAttribute('contenteditable', 'plaintext-only');
        labelEl.setAttribute('spellcheck', 'false');
        labelEl.setAttribute('role', 'textbox');
        labelEl.setAttribute('aria-label', 'Bar name');
        labelEl.addEventListener('blur', function () {
            var text = (labelEl.textContent || '').trim();
            if (!text) { labelEl.textContent = defaultText; text = defaultText; }
            localStorage.setItem(lsKey, text);
        });
        labelEl.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { e.preventDefault(); labelEl.blur(); }
        });
    }

    var barStates = [];

    function initBar(cfg) {
        var wrapper    = document.getElementById('timer-bar-' + cfg.id);
        var startInput = document.getElementById('timer-start-' + cfg.id);
        var endInput   = document.getElementById('timer-end-' + cfg.id);
        var nextDayCb  = document.getElementById('timer-nextday-' + cfg.id);
        var fill       = document.getElementById('timer-fill-' + cfg.id);
        var track      = document.getElementById('timer-track-' + cfg.id);
        var pctEl      = document.getElementById('timer-pct-' + cfg.id);
        var labelEl    = wrapper.querySelector('.timer-bar-label');

        var timeRow = wrapper.querySelector('.timer-time-row');
        var hintEl  = document.createElement('div');
        hintEl.className = 'timer-hint';
        hintEl.setAttribute('aria-live', 'polite');
        timeRow.insertAdjacentElement('afterend', hintEl);

        initLabel(labelEl, cfg.lsLabel, cfg.defaultLabel);

        var savedStart   = localStorage.getItem(cfg.lsStart)   || cfg.defaultStart;
        var savedEnd     = localStorage.getItem(cfg.lsEnd)      || cfg.defaultEnd;
        var savedNextDay = localStorage.getItem(cfg.lsNextDay) === 'true';
        if (parseHHMM(savedStart) === null) savedStart = cfg.defaultStart;
        if (parseHHMM(savedEnd)   === null) savedEnd   = cfg.defaultEnd;

        startInput.value    = savedStart;
        endInput.value      = savedEnd;
        nextDayCb.checked   = savedNextDay;

        applyMask(startInput, hintEl);
        applyMask(endInput,   hintEl);

        function save() {
            if (parseHHMM(startInput.value) !== null)
                localStorage.setItem(cfg.lsStart, startInput.value);
            if (parseHHMM(endInput.value) !== null)
                localStorage.setItem(cfg.lsEnd, endInput.value);
            localStorage.setItem(cfg.lsNextDay, nextDayCb.checked ? 'true' : 'false');
        }

        startInput.addEventListener('change', save);
        endInput.addEventListener('change', save);
        nextDayCb.addEventListener('change', save);

        var lastPct      = '';
        var wasDone      = false;
        var enteringDone = false;

        function update(skipRoll) {
            var s       = parseHHMM(startInput.value);
            var e       = parseHHMM(endInput.value);
            var nextDay = nextDayCb.checked;
            if (s === null || e === null) return;

            var state = computeState(s, e, nextDay);

            // Invalid window (end <= start, nextDay unchecked)
            if (state === null) {
                fill.style.width = '0%';
                if (lastPct !== '__invalid__') {
                    lastPct = '__invalid__';
                    pctEl.textContent = '—';
                    track.setAttribute('aria-valuenow', '0');
                    track.setAttribute('aria-valuetext', 'invalid window');
                }
                wrapper.dataset.done     = 'false';
                wrapper.dataset.upcoming = 'false';
                wrapper.dataset.urgency  = 'false';
                hintEl.textContent = 'end ≤ start — enable "Next day" for overnight windows';
                hintEl.classList.add('visible');
                return;
            }

            // Clear hint if state is valid
            if (!endInput.dataset.invalid) hintEl.classList.remove('visible');

            fill.style.width = state.fill.toFixed(3) + '%';

            var pctFixed = state.pct.toFixed(2);
            if (pctFixed !== lastPct) {
                if (!skipRoll && state.pct !== parseFloat(lastPct)) {
                    pctEl.classList.remove('pct-changing');
                    void pctEl.offsetWidth;
                    pctEl.classList.add('pct-changing');
                    pctEl.addEventListener('animationend', function h() {
                        pctEl.classList.remove('pct-changing');
                        pctEl.removeEventListener('animationend', h);
                    });
                }
                lastPct = pctFixed;
                var text;
                if (state.done) {
                    text = '✓ done';
                } else if (state.upcoming) {
                    var sv = parseHHMM(startInput.value);
                    var hh = String(Math.floor(sv / 60)).padStart(2, '0');
                    var mm = String(sv % 60).padStart(2, '0');
                    text = 'starts ' + hh + ':' + mm;
                } else {
                    text = pctFixed + '% left';
                }
                pctEl.textContent = text;
                track.setAttribute('aria-valuenow', state.pct.toFixed(2));
                track.setAttribute('aria-valuetext', state.done ? 'done' : state.upcoming ? '100% remaining' : pctFixed + '% remaining');
            }

            if (state.done && !wasDone && !enteringDone) {
                wrapper.classList.remove('timer-done-pulse');
                void wrapper.offsetWidth;
                wrapper.classList.add('timer-done-pulse');
                wrapper.addEventListener('animationend', function h() {
                    wrapper.classList.remove('timer-done-pulse');
                    wrapper.removeEventListener('animationend', h);
                });
            }
            wasDone = state.done;

            wrapper.dataset.done     = state.done     ? 'true' : 'false';
            wrapper.dataset.upcoming = state.upcoming ? 'true' : 'false';
            wrapper.dataset.urgency  = state.urgency  ? 'true' : 'false';
        }

        startInput.addEventListener('change', function () { update(false); });
        endInput.addEventListener('change',   function () { update(false); });
        startInput.addEventListener('input',  function () { update(false); });
        endInput.addEventListener('input',    function () { update(false); });
        nextDayCb.addEventListener('change',  function () { update(false); });

        enteringDone = wrapper.dataset.done === 'true';
        update(true);

        var targetFill = fill.style.width;
        fill.style.width = '0%';
        fill.classList.add('timer-fill--entering');
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                fill.style.width = targetFill;
                fill.addEventListener('transitionend', function h() {
                    fill.classList.remove('timer-fill--entering');
                    fill.removeEventListener('transitionend', h);
                    enteringDone = false;
                });
            });
        });

        barStates.push(function () { update(true); });
    }

    function tick() {
        for (var i = 0; i < barStates.length; i++) barStates[i]();
        requestAnimationFrame(tick);
    }

    document.addEventListener('DOMContentLoaded', function () {
        BARS.forEach(initBar);
        requestAnimationFrame(tick);
    });
}());
