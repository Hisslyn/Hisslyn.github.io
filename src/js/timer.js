(function () {
    'use strict';

    var BARS = [
        {
            id: 1,
            lsStart:   'timerBar1Start',
            lsEnd:     'timerBar1End',
            lsLabel:   'timerBar1Name',
            lsDayMode: 'timerBar1DayMode',
            // legacy key for migration
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
            lsDayMode: 'timerBar2DayMode',
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

    function toAbsMs(hhmm, dayOffset) {
        var d = new Date();
        d.setHours(Math.floor(hhmm / 60), hhmm % 60, 0, 0);
        if (dayOffset !== 0) d.setDate(d.getDate() + dayOffset);
        return d.getTime();
    }

    // dayMode: 'same' | 'next' | 'prev'
    // same: start=today@start, end=today@end. Invalid if end<=start.
    // next: start=today@start, end=tomorrow@end.
    // prev: start=yesterday@start, end=today@end.
    function computeState(startMin, endMin, dayMode) {
        var nowMs, startMs, endMs, span, elapsed, fillFrac, remFrac, pct;

        if (dayMode === 'next') {
            startMs = toAbsMs(startMin, 0);
            endMs   = toAbsMs(endMin, 1);
        } else if (dayMode === 'prev') {
            startMs = toAbsMs(startMin, -1);
            endMs   = toAbsMs(endMin, 0);
        } else {
            // same day — invalid if end <= start
            if (endMin <= startMin) return null;
            startMs = toAbsMs(startMin, 0);
            endMs   = toAbsMs(endMin, 0);
        }

        nowMs   = Date.now();
        span    = endMs - startMs;
        elapsed = nowMs - startMs;

        if (elapsed < 0) {
            return { pct: 100, fill: 0, upcoming: true, done: false, urgency: false };
        }
        if (elapsed >= span) {
            return { pct: 0, fill: 100, upcoming: false, done: true, urgency: false };
        }
        fillFrac = elapsed / span;
        remFrac  = 1 - fillFrac;
        pct      = remFrac * 100;
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
                e.preventDefault();
                var raw = input.value;
                var parsed = parseHHMM(raw);
                if (parsed === null) {
                    input.value = '00:00';
                    parsed = 0;
                }
                var caretPos = input.selectionStart;
                var colonIdx = input.value.indexOf(':');
                // caret at or before colon = hour segment; after colon = minute segment
                var inHour = (colonIdx === -1 || caretPos <= colonIdx);
                var h = Math.floor(parsed / 60);
                var m = parsed % 60;
                var delta = key === 'ArrowUp' ? 1 : -1;
                if (inHour) {
                    h = (h + delta + 24) % 24;
                } else {
                    m = (m + delta + 60) % 60;
                }
                var hh = String(h).padStart(2, '0');
                var mm = String(m).padStart(2, '0');
                input.value = hh + ':' + mm;
                // restore caret inside the same segment
                var newColon = input.value.indexOf(':');
                var newPos = inHour ? Math.min(caretPos, newColon) : Math.max(caretPos, newColon + 1);
                input.setSelectionRange(newPos, newPos);
                input.dispatchEvent(new Event('input'));
                input.dispatchEvent(new Event('change'));
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
        var fill       = document.getElementById('timer-fill-' + cfg.id);
        var track      = document.getElementById('timer-track-' + cfg.id);
        var pctEl      = document.getElementById('timer-pct-' + cfg.id);
        var labelEl    = wrapper.querySelector('.timer-bar-label');
        var radios     = wrapper.querySelectorAll('input[name="timer-daymode-' + cfg.id + '"]');

        var timeRow = wrapper.querySelector('.timer-time-row');
        var hintEl  = document.createElement('div');
        hintEl.className = 'timer-hint';
        hintEl.setAttribute('aria-live', 'polite');
        timeRow.insertAdjacentElement('afterend', hintEl);

        initLabel(labelEl, cfg.lsLabel, cfg.defaultLabel);

        var savedStart = localStorage.getItem(cfg.lsStart) || cfg.defaultStart;
        var savedEnd   = localStorage.getItem(cfg.lsEnd)   || cfg.defaultEnd;
        if (parseHHMM(savedStart) === null) savedStart = cfg.defaultStart;
        if (parseHHMM(savedEnd)   === null) savedEnd   = cfg.defaultEnd;

        // Resolve dayMode — migrate legacy boolean if needed
        var savedDayMode = localStorage.getItem(cfg.lsDayMode);
        if (!savedDayMode || (savedDayMode !== 'same' && savedDayMode !== 'next' && savedDayMode !== 'prev')) {
            var legacyNextDay = localStorage.getItem(cfg.lsNextDay);
            savedDayMode = (legacyNextDay === 'true') ? 'next' : 'same';
        }

        startInput.value = savedStart;
        endInput.value   = savedEnd;

        // Apply saved radio
        for (var i = 0; i < radios.length; i++) {
            radios[i].checked = (radios[i].value === savedDayMode);
        }

        applyMask(startInput, hintEl);
        applyMask(endInput,   hintEl);

        function getDayMode() {
            for (var j = 0; j < radios.length; j++) {
                if (radios[j].checked) return radios[j].value;
            }
            return 'same';
        }

        function save() {
            if (parseHHMM(startInput.value) !== null)
                localStorage.setItem(cfg.lsStart, startInput.value);
            if (parseHHMM(endInput.value) !== null)
                localStorage.setItem(cfg.lsEnd, endInput.value);
            localStorage.setItem(cfg.lsDayMode, getDayMode());
        }

        startInput.addEventListener('change', save);
        endInput.addEventListener('change', save);
        for (var r = 0; r < radios.length; r++) {
            radios[r].addEventListener('change', save);
        }

        var lastPct      = '';
        var wasDone      = false;
        var enteringDone = false;

        function update(skipRoll) {
            var s       = parseHHMM(startInput.value);
            var e       = parseHHMM(endInput.value);
            var dayMode = getDayMode();
            if (s === null || e === null) return;

            var state = computeState(s, e, dayMode);

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
                hintEl.textContent = 'end ≤ start — use Next or Prev day for overnight windows';
                hintEl.classList.add('visible');
                return;
            }

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
        for (var k = 0; k < radios.length; k++) {
            radios[k].addEventListener('change', function () { update(false); });
        }

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
