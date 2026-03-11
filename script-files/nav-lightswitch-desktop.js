(function() {
    'use strict';

    var btn    = document.getElementById('navLsBtnDesktop');
    var knob   = document.getElementById('navLsKnobDesktop');
    var ropeEl = document.getElementById('ls-rope-desktop');
    var tabEl  = document.getElementById('ls-rope-end-desktop');

    if (!btn || !knob) return;

    /* Rope geometry — anchor fixed at (AX, AY) in SVG space */
    var AX = 6, AY = 0, REST_LEN = 60, PULL_EXTRA = 26;

    /* Spring (vertical pull) */
    var V_STIFF = 240, V_DAMP = 11;

    /* Pendulum (swing after release) */
    var P_OMEGA = 7.8, P_ZETA = 0.22;

    var stretch = { pos: 0, vel: 0, target: 0 };
    var pend    = { angle: 0, vel: 0 };

    var isDown = false, toggled = false;
    var rafId = null, lastTs = null;
    var pendDir = 1;

    function syncKnob() {
        var isDark = document.body.classList.contains('dark-mode');
        var targetX = isDark ? 0 : 62;
        btn.classList.toggle('ls-is-light', !isDark);
        knob.style.transform = 'translateX(' + targetX + 'px)';
    }

    function renderRope() {
        var ropeLen = REST_LEN + stretch.pos * PULL_EXTRA;
        var endX = AX + Math.sin(pend.angle) * ropeLen;
        var endY = AY + Math.cos(pend.angle) * ropeLen;
        var ctrlX = (AX + endX) * 0.5 + (-pend.vel * 4.5);
        var ctrlY = (AY + endY) * 0.5 + (stretch.pos * 6);
        if (ropeEl) {
            ropeEl.setAttribute('d',
                'M' + AX + ' ' + AY +
                ' Q' + ctrlX.toFixed(2) + ' ' + ctrlY.toFixed(2) +
                ' ' + endX.toFixed(2) + ' ' + endY.toFixed(2));
        }
        if (tabEl) {
            var deg = (pend.angle * 180 / Math.PI).toFixed(2);
            tabEl.setAttribute('transform',
                'translate(' + endX.toFixed(2) + ',' + endY.toFixed(2) + ')' +
                ' rotate(' + deg + ',0,0)');
        }
    }

    function tick(ts) {
        if (lastTs === null) lastTs = ts;
        var dt = Math.min((ts - lastTs) / 1000, 0.048);
        lastTs = ts;

        var vF = -V_STIFF * (stretch.pos - stretch.target) - V_DAMP * stretch.vel;
        stretch.vel += vF * dt;
        stretch.pos += stretch.vel * dt;

        var pA = -(P_OMEGA * P_OMEGA) * pend.angle - 2 * P_ZETA * P_OMEGA * pend.vel;
        pend.vel += pA * dt;
        pend.angle += pend.vel * dt;

        renderRope();

        var vS = Math.abs(stretch.pos - stretch.target) < 0.0015 && Math.abs(stretch.vel) < 0.015;
        var pS = Math.abs(pend.angle) < 0.0008 && Math.abs(pend.vel) < 0.005;
        if (vS && pS) {
            stretch.pos = stretch.target; stretch.vel = 0;
            pend.angle = 0; pend.vel = 0;
            renderRope(); rafId = null; lastTs = null;
        } else {
            rafId = requestAnimationFrame(tick);
        }
    }

    function startAnim() {
        if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
        lastTs = null;
        rafId = requestAnimationFrame(tick);
    }

    function onDown() {
        if (isDown) return;
        isDown = true; toggled = false;
        stretch.target = 1.0;
        startAnim();
    }

    function onUp() {
        if (!isDown) return;
        isDown = false;
        stretch.target = 0;
        stretch.vel -= 15;
        pendDir = -pendDir;
        pend.vel = pendDir * 3.6;
        startAnim();
        if (!toggled) {
            toggled = true;
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode').toString());
            syncKnob();
            /* Keep mobile switch in sync if menu is open */
            if (typeof _syncLightSwitchToTheme === 'function') {
                _syncLightSwitchToTheme(true);
            }
        }
    }

    function onCancel() {
        if (!isDown) return;
        isDown = false;
        stretch.target = 0;
        stretch.vel -= 5;
        startAnim();
    }

    btn.addEventListener('mousedown',  onDown);
    btn.addEventListener('mouseup',    onUp);
    btn.addEventListener('mouseleave', onCancel);
    btn.addEventListener('touchstart',  function(e) { e.preventDefault(); onDown(); },   { passive: false });
    btn.addEventListener('touchend',    function(e) { e.preventDefault(); onUp(); },     { passive: false });
    btn.addEventListener('touchcancel', function(e) { e.preventDefault(); onCancel(); }, { passive: false });

    /* Initial state — defer so script.js initDarkMode() runs first */
    setTimeout(function() { syncKnob(); renderRope(); }, 0);
})();
