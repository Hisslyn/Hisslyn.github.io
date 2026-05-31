// Client-side easter egg only — not real authentication. Password is intentionally visible.
(function () {
    var PASSWORD = 'LuntikxDinulik4Ever';
    var skipBtn = document.getElementById('secret-skip');

    if (sessionStorage.getItem('secretUnlocked') === 'true') {
        skipBtn.removeAttribute('hidden');
    }

    skipBtn.addEventListener('click', function () {
        window.location.href = 'timer.html';
    });

    function check() {
        var input = document.getElementById('secret-password');
        var msg = document.getElementById('secret-message');
        if (input.value === PASSWORD) {
            sessionStorage.setItem('secretUnlocked', 'true');
            window.location.href = 'timer.html';
        } else {
            msg.textContent = 'wrong password :)';
            input.value = '';
            input.focus();
        }
    }

    document.getElementById('secret-submit').addEventListener('click', check);
    document.getElementById('secret-password').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') check();
    });
}());
