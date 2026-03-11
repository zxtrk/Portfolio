/* ═══════════════════════════════════════════════════════════════
   RETRO TV COLOUR PALETTE — tv.js  v5

   CHANGES v5:
   1. TV body click NO LONGER turns TV on/off.
      The dedicated power button (below the TV) is the only way
      to power on/off. The overlay is kept for channel switching
      only (when the TV is already on).

   2. Power button wired up: click/touch toggles power.
      Button shows "Press to turn on" label when TV is off,
      label hidden when TV is on.

   3. Wire path updated — curves from left side of TV down to
      the power button positioned below the TV.
   ═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    /* ── PALETTE DATA ── */
    const PALETTES = [
        { name: 'PETRICHOR',      colors: ['#1A1814','#3D3228','#7A6248','#C4A882','#E8D5B0'] },
        { name: 'DUSK WIRE',      colors: ['#0D0F1A','#1A2040','#2E4080','#6080C0','#A0B8E8'] },
        { name: 'EMBER STATIC',   colors: ['#1A0A00','#3D1800','#8B3A00','#D4722A','#F0B870'] },
        { name: 'MOSS SIGNAL',    colors: ['#0A1208','#1A2818','#2E4828','#5A7848','#9AB880'] },
        { name: 'LAVENDER HAZE',  colors: ['#120A1A','#281840','#4A3070','#8060A8','#C0A0D8'] },
        { name: 'COLD IRON',      colors: ['#0A0C0E','#1A1E22','#2E3840','#5A6878','#98A8B8'] },
        { name: 'DESERT TAPE',    colors: ['#1A1008','#382218','#6A4830','#A87858','#D8B890'] },
        { name: 'NEON GHOST',     colors: ['#080A10','#101828','#183048','#284870','#48A888'] },
        { name: 'VELVET BURN',    colors: ['#100810','#281820','#502840','#903060','#C87090'] },
        { name: 'CHALK STATIC',   colors: ['#181614','#302C28','#504840','#808070','#C8C4B8'] },
        { name: 'COPPER DREAM',   colors: ['#0E0A06','#281A0C','#583A1A','#986030','#D09860'] },
        { name: 'STORM CHANNEL',  colors: ['#080C12','#101820','#1E3040','#386080','#60A0C0'] },
    ];

    /* ── STATE ── */
    let tvOn       = false;
    let booting    = false;
    let palIdx     = 0;
    let cycleTimer = null;
    let noiseRaf   = null;
    let noiseCtx   = null;

    /* ── DOM refs ── */
    const tvWrap           = document.getElementById('tvWrap');
    const tvScreen         = document.getElementById('tvScreen');
    const tvNoiseCanvas    = document.getElementById('tvNoiseCanvas');
    const tvLoading        = document.getElementById('tvLoading');
    const tvPaletteDisplay = document.getElementById('tvPaletteDisplay');
    const tvPaletteName    = document.getElementById('tvPaletteName');
    const tvSwatches       = document.getElementById('tvSwatches');
    const tvChannelTag     = document.getElementById('tvChannelTag');
    const tvStatusBar      = document.getElementById('tvStatusBar');
    const tvStatusName     = document.getElementById('tvStatusName');
    const tvStatusHex      = document.getElementById('tvStatusHex');
    const tvOnAir          = document.getElementById('tvOnAir');
    const tvOnAirDot       = document.getElementById('tvOnAirDot');
    const tvGlowRing       = document.getElementById('tvGlowRing');
    const tvChannelDots    = document.getElementById('tvChannelDots');
    const tvNowShowing     = document.getElementById('tvNowShowing');
    const tvNowName        = document.getElementById('tvNowName');
    const tvTextSide       = document.getElementById('tvTextSide');
    const tvPowerBtn       = document.getElementById('tvPowerBtn');
    const tvPowerLabel     = document.getElementById('tvPowerLabel');

    const previewSwatches = [0,1,2,3,4].map(i => document.getElementById('tvPs' + i));

    /* ── Bail early if core elements missing ── */
    if (!tvWrap || !tvScreen) return;

    /* ══════════════════════════════════════════════════════════
       TOUCH OVERLAY — channel switching only (TV must be ON)
    ══════════════════════════════════════════════════════════ */

    function _createTouchOverlay() {
        tvWrap.style.position = 'relative';

        const overlay = document.createElement('div');
        overlay.id = 'tvTouchOverlay';
        overlay.style.cssText = [
            'position:absolute',
            'inset:0',
            'z-index:99999',
            'background:transparent',
            '-webkit-tap-highlight-color:transparent',
            'tap-highlight-color:transparent',
            'touch-action:manipulation',
            'user-select:none',
            '-webkit-user-select:none',
            'cursor:pointer',
            'pointer-events:auto',
            'opacity:0',
        ].join(';');

        tvWrap.appendChild(overlay);

        overlay.addEventListener('touchstart', e => {
            e.preventDefault();
            e.stopPropagation();
        }, { passive: false });

        overlay.addEventListener('touchend', e => {
            e.preventDefault();
            e.stopPropagation();
            /* Only switch channels — never power on/off */
            if (tvOn) nextChannel();
        }, { passive: false });

        overlay.addEventListener('touchcancel', e => {
            e.preventDefault();
        }, { passive: false });

        overlay.addEventListener('click', e => {
            e.preventDefault();
            /* Only switch channels — never power on/off */
            if (tvOn) nextChannel();
        });

        return overlay;
    }

    /* ── inject smooth-transition CSS ── */
    function _injectTvTransitionCSS() {
        if (document.getElementById('tv-transition-styles')) return;
        const s = document.createElement('style');
        s.id = 'tv-transition-styles';
        s.textContent = `
            .tv-swatch {
                transition: background 0.55s cubic-bezier(0.22,1,0.36,1) !important;
            }
            #tvPaletteName {
                transition: opacity 0.3s ease, transform 0.3s ease;
            }
            #tvPaletteName.tv-name-exit {
                opacity: 0;
                transform: translateY(-4px);
            }
            #tvPaletteName.tv-name-enter {
                opacity: 0;
                transform: translateY(4px);
            }
            #tvStatusName, #tvStatusHex {
                transition: opacity 0.25s ease;
            }
            #tvStatusName.tv-fade-out, #tvStatusHex.tv-fade-out {
                opacity: 0;
            }
            #tvChannelTag {
                transition: opacity 0.2s ease;
            }
            .tv-ch-dot {
                transition: transform 0.2s ease, box-shadow 0.2s ease !important;
            }
            #tvPaletteDisplay {
                transition: opacity 0.25s ease !important;
            }
            #tvNoiseCanvas {
                transition: opacity 0.18s ease !important;
            }
            #tvNowShowing {
                transition: opacity 0.3s ease !important;
            }
            /* Power button label */
            #tvPowerLabel {
                transition: opacity 0.4s ease, transform 0.4s ease;
            }
            #tvPowerLabel.hidden {
                opacity: 0 !important;
                transform: translateY(4px);
                pointer-events: none;
            }
        `;
        document.head.appendChild(s);
    }

    /* ── NOISE CANVAS ── */
    function getScreenSize() {
        const rect = tvScreen.getBoundingClientRect();
        return {
            w: Math.round(rect.width)  || tvScreen.offsetWidth  || 360,
            h: Math.round(rect.height) || tvScreen.offsetHeight || 270,
        };
    }

    function startNoise(opacity) {
        const { w, h } = getScreenSize();
        tvNoiseCanvas.width  = w;
        tvNoiseCanvas.height = h;
        noiseCtx = tvNoiseCanvas.getContext('2d');
        tvNoiseCanvas.style.opacity = opacity || 0.18;
        function drawNoise() {
            const img  = noiseCtx.createImageData(tvNoiseCanvas.width, tvNoiseCanvas.height);
            const data = img.data;
            for (let i = 0; i < data.length; i += 4) {
                const v = Math.random() * 255 | 0;
                data[i] = data[i+1] = data[i+2] = v;
                data[i+3] = 80;
            }
            noiseCtx.putImageData(img, 0, 0);
            noiseRaf = requestAnimationFrame(drawNoise);
        }
        drawNoise();
    }

    function stopNoise() {
        if (noiseRaf) { cancelAnimationFrame(noiseRaf); noiseRaf = null; }
        tvNoiseCanvas.style.opacity = 0;
    }

    /* ── APPLY PALETTE (smooth) ── */
    function applyPalette(idx) {
        const p = PALETTES[idx];

        tvSwatches.querySelectorAll('.tv-swatch').forEach((el, i) => {
            el.style.transitionDelay = `${i * 0.07}s`;
            el.style.background = p.colors[i] || '#000';
            const hexEl = el.querySelector('.tv-swatch-hex');
            if (hexEl) hexEl.textContent = p.colors[i] || '';
        });

        previewSwatches.forEach((el, i) => {
            if (el) el.style.background = p.colors[i] || 'transparent';
        });

        if (tvPaletteName) {
            tvPaletteName.classList.add('tv-name-exit');
            setTimeout(() => {
                tvPaletteName.textContent = p.name;
                tvPaletteName.classList.remove('tv-name-exit');
                tvPaletteName.classList.add('tv-name-enter');
                requestAnimationFrame(() => {
                    tvPaletteName.classList.remove('tv-name-enter');
                });
            }, 150);
        }

        if (tvChannelTag) tvChannelTag.textContent = 'CH ' + String(idx + 1).padStart(2, '0');

        if (tvStatusName) {
            tvStatusName.classList.add('tv-fade-out');
            tvStatusHex && tvStatusHex.classList.add('tv-fade-out');
            setTimeout(() => {
                if (tvStatusName) { tvStatusName.textContent = p.name; tvStatusName.classList.remove('tv-fade-out'); }
                if (tvStatusHex)  { tvStatusHex.textContent  = p.colors[0]; tvStatusHex.classList.remove('tv-fade-out'); }
            }, 130);
        }

        if (tvNowName)    tvNowName.textContent = p.name;
        if (tvNowShowing) tvNowShowing.classList.add('active');

        const glowCol = p.colors[2] || p.colors[0];
        if (tvGlowRing) {
            tvGlowRing.style.background =
                'radial-gradient(ellipse 80% 70% at 50% 55%, ' + glowCol + '18 0%, transparent 65%)';
            tvGlowRing.style.opacity = '0.7';
        }

        tvChannelDots.querySelectorAll('.tv-ch-dot').forEach((d, i) => {
            d.classList.toggle('active', i === idx % 8);
            d.style.setProperty('--tv-active-color', p.colors[2]);
        });
    }

    /* ── AUTO CYCLE ── */
    function startCycle() {
        stopCycle();
        cycleTimer = setInterval(() => {
            if (!tvOn) return;
            _switchChannel((palIdx + 1) % PALETTES.length);
        }, 5000);
    }

    function stopCycle() {
        if (cycleTimer) { clearInterval(cycleTimer); cycleTimer = null; }
    }

    /* ── Shared channel switch logic ── */
    function _switchChannel(targetIdx) {
        stopCycle();
        tvNoiseCanvas.style.opacity = '0.28';
        tvPaletteDisplay.style.opacity = '0';
        setTimeout(() => {
            palIdx = targetIdx;
            applyPalette(palIdx);
            tvPaletteDisplay.style.opacity = '1';
            tvNoiseCanvas.style.opacity    = '0.07';
            startCycle();
        }, 180);
    }

    /* ── BIOS LINES ── */
    const BIOS_LINES = [
        'PETRICHOR BIOS v2.07',
        'Copyright (C) 1998-2001',
        '',
        'CPU: PALETTE-386 @ 33MHz',
        'Memory Test: 640K OK',
        'Checking extended memory...',
        '4096K OK',
        '',
        'Detecting drives...',
        'HDD0: COLOUR_BANK  [OK]',
        'HDD1: PALETTE_DB   [OK]',
        '',
        'Loading PETRICHOR OS...',
        'Press any key to continue_',
    ];

    /* ── BOOT SEQUENCE ── */
    function bootTV() {
        if (booting) return;
        booting = true;

        /* Update power button state */
        if (tvPowerBtn) tvPowerBtn.classList.add('btn-on');
        if (tvPowerLabel) tvPowerLabel.classList.add('hidden');

        const tvOffState = document.querySelector('#tvScreen .tv-screen-content');
        if (tvOffState) tvOffState.style.opacity = '0';

        tvScreen.style.background = '#111';
        startNoise(0.6);

        setTimeout(() => {
            stopNoise();
            tvScreen.style.background = '#050302';

            tvLoading.style.opacity        = '1';
            tvLoading.style.flexDirection  = 'column';
            tvLoading.style.alignItems     = 'flex-start';
            tvLoading.style.padding        = '14px 18px';
            tvLoading.style.justifyContent = 'flex-start';
            tvLoading.style.gap            = '0px';

            let biosEl = document.getElementById('tvBiosText');
            if (!biosEl) {
                biosEl = document.createElement('div');
                biosEl.id = 'tvBiosText';
                biosEl.style.cssText = [
                    'font-family:"Share Tech Mono",monospace',
                    'font-size:9px',
                    'line-height:1.6',
                    'color:rgba(160,220,160,0.92)',
                    'text-shadow:0 0 6px rgba(120,200,120,0.5)',
                    'white-space:pre',
                    'width:100%',
                    'letter-spacing:0.04em',
                ].join(';');
                tvLoading.appendChild(biosEl);
            }
            biosEl.textContent = '';
            const tvLoadText = document.getElementById('tvLoadText');
            if (tvLoadText) tvLoadText.style.display = 'none';
            const barWrap = tvLoading.querySelector('.tv-load-bar-wrap');
            if (barWrap) barWrap.style.display = 'none';

            let lineI = 0;
            function typeLine() {
                if (lineI >= BIOS_LINES.length) { setTimeout(showWinProgress, 300); return; }
                biosEl.textContent += BIOS_LINES[lineI] + '\n';
                lineI++;
                const delay = BIOS_LINES[lineI - 1] === '' ? 40 : 90 + Math.random() * 80;
                setTimeout(typeLine, delay);
            }
            typeLine();
        }, 600);
    }

    function showWinProgress() {
        tvLoading.innerHTML = '';

        const winEl = document.createElement('div');
        winEl.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;gap:18px;';

        const title = document.createElement('div');
        title.style.cssText = 'font-family:"Share Tech Mono",monospace;font-size:15px;letter-spacing:0.12em;color:rgba(200,200,220,0.9);text-shadow:0 0 12px rgba(160,160,220,0.6);text-transform:uppercase;';
        title.textContent = 'PETRICHOR OS';

        const sub = document.createElement('div');
        sub.style.cssText = 'font-family:"Share Tech Mono",monospace;font-size:8px;letter-spacing:0.2em;color:rgba(140,140,180,0.6);text-transform:uppercase;margin-top:-12px;';
        sub.textContent = 'Professional Edition';

        const trackWrap = document.createElement('div');
        trackWrap.style.cssText = 'width:55%;height:14px;background:rgba(20,20,30,0.8);border:1px solid rgba(100,100,160,0.4);border-radius:2px;overflow:hidden;display:flex;gap:2px;padding:2px;';

        const SEGS = 12, segs = [];
        for (let i = 0; i < SEGS; i++) {
            const s = document.createElement('div');
            s.style.cssText = 'flex:1;height:100%;border-radius:1px;background:rgba(60,80,180,0.15);transition:background 0.15s ease;';
            trackWrap.appendChild(s); segs.push(s);
        }

        const statusTxt = document.createElement('div');
        statusTxt.style.cssText = 'font-family:"Share Tech Mono",monospace;font-size:8px;letter-spacing:0.14em;color:rgba(120,120,180,0.7);text-transform:uppercase;';
        statusTxt.textContent = 'Starting up...';

        winEl.appendChild(title); winEl.appendChild(sub); winEl.appendChild(trackWrap); winEl.appendChild(statusTxt);
        tvLoading.appendChild(winEl);

        const statusMsgs = ['Loading palettes...','Calibrating colours...','Almost ready...','Done.'];
        let seg = 0, msgI = 0;
        const segTimer = setInterval(() => {
            if (seg < SEGS) {
                segs[seg].style.background = 'linear-gradient(to bottom,rgba(100,130,255,0.9),rgba(60,80,200,0.8))';
                segs[seg].style.boxShadow  = '0 0 6px rgba(100,130,255,0.5)';
                seg++;
                if (seg % Math.ceil(SEGS / statusMsgs.length) === 0 && msgI < statusMsgs.length) statusTxt.textContent = statusMsgs[msgI++];
            } else {
                clearInterval(segTimer);
                setTimeout(launchPalette, 400);
            }
        }, 130);
    }

    function launchPalette() {
        tvLoading.style.opacity = '0';
        setTimeout(() => {
            tvLoading.innerHTML = '';
            const tvLoadText = document.getElementById('tvLoadText');
            if (tvLoadText) tvLoadText.style.display = '';

            tvNoiseCanvas.style.opacity    = '0.07';
            tvPaletteDisplay.style.opacity = '1';
            if (tvChannelTag) tvChannelTag.style.color = 'rgba(255,255,255,0.45)';
            tvStatusBar && tvStatusBar.querySelectorAll('span').forEach(s => { s.style.color = 'rgba(255,255,255,0.4)'; });

            if (tvOnAir)    tvOnAir.style.color         = 'rgba(200,80,80,0.9)';
            if (tvOnAirDot) { tvOnAirDot.style.background = '#c85050'; tvOnAirDot.style.boxShadow = '0 0 6px #c85050'; }

            applyPalette(palIdx);
            tvOn = true; booting = false;
            if (tvWrap) tvWrap.classList.add('tv-on');
            startCycle();
        }, 300);
    }

    /* ── POWER OFF ── */
    function powerOff() {
        if (booting) return;
        tvOn = false;
        stopCycle();
        stopNoise();

        if (tvWrap) tvWrap.classList.remove('tv-on');
        if (tvPowerBtn) tvPowerBtn.classList.remove('btn-on');
        if (tvPowerLabel) tvPowerLabel.classList.remove('hidden');

        /* Fade out palette display */
        if (tvPaletteDisplay) tvPaletteDisplay.style.opacity = '0';
        if (tvNoiseCanvas)    tvNoiseCanvas.style.opacity    = '0';

        /* Flash of static then off */
        startNoise(0.5);
        setTimeout(() => {
            stopNoise();
            tvScreen.style.background = '#050302';
        }, 200);

        /* Reset ON AIR */
        if (tvOnAir)    tvOnAir.style.color         = 'rgba(180,80,80,0.0)';
        if (tvOnAirDot) { tvOnAirDot.style.background = 'rgba(200,80,80,0.0)'; tvOnAirDot.style.boxShadow = 'none'; }

        /* Show off-dot */
        const tvOffState = document.querySelector('#tvScreen .tv-screen-content');
        if (tvOffState) {
            setTimeout(() => { tvOffState.style.opacity = '1'; }, 250);
        }

        if (tvGlowRing) {
            tvGlowRing.style.background = '';
            tvGlowRing.style.opacity = '0';
        }

        /* Reset channel dots */
        tvChannelDots && tvChannelDots.querySelectorAll('.tv-ch-dot').forEach(d => {
            d.classList.remove('active');
        });
        const first = tvChannelDots && tvChannelDots.querySelector('.tv-ch-dot');
        if (first) first.classList.add('active');
        palIdx = 0;
    }

    /* ── POWER BUTTON HANDLER ── */
    function _handlePowerBtn() {
        if (!tvOn && !booting) bootTV();
        else if (tvOn && !booting) powerOff();
    }

    /* ── Wire up power button ── */
    if (tvPowerBtn) {
        tvPowerBtn.addEventListener('touchstart', e => {
            e.preventDefault();
            e.stopPropagation();
        }, { passive: false });

        tvPowerBtn.addEventListener('touchend', e => {
            e.preventDefault();
            e.stopPropagation();
            _handlePowerBtn();
        }, { passive: false });

        tvPowerBtn.addEventListener('click', e => {
            e.stopPropagation();
            _handlePowerBtn();
        });
    }

    /* ── NEXT CHANNEL (tap on screen when on) ── */
    function nextChannel() {
        _switchChannel((palIdx + 1) % PALETTES.length);
    }

    /* ── CHANNEL DOTS ── */
    tvChannelDots && tvChannelDots.querySelectorAll('.tv-ch-dot').forEach((dot, i) => {
        function switchTo() {
            if (!tvOn) return;
            _switchChannel(i < PALETTES.length ? i : i % PALETTES.length);
        }
        dot.addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); }, { passive: false });
        dot.addEventListener('touchend',   e => { e.preventDefault(); e.stopPropagation(); switchTo(); }, { passive: false });
        dot.addEventListener('click',      e => { e.stopPropagation(); switchTo(); });
    });

    /* ── REVEAL text side ── */
    const revObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) { tvTextSide && tvTextSide.classList.add('revealed'); revObserver.unobserve(e.target); }
        });
    }, { threshold: 0.15 });
    const sec = document.getElementById('tvPaletteSection');
    if (sec) revObserver.observe(sec);

    /* ── RESIZE ── */
    window.addEventListener('resize', () => {
        if (tvNoiseCanvas && noiseCtx) {
            const { w, h } = getScreenSize();
            tvNoiseCanvas.width = w; tvNoiseCanvas.height = h;
        }
    }, { passive: true });

    /* ── INIT ── */
    _injectTvTransitionCSS();

    tvWrap.style.webkitTapHighlightColor = 'transparent';
    tvWrap.style.tapHighlightColor = 'transparent';
    tvWrap.style.touchAction = 'manipulation';
    tvWrap.style.userSelect = 'none';
    tvWrap.style.webkitUserSelect = 'none';

    if (tvScreen) {
        tvScreen.style.webkitTapHighlightColor = 'transparent';
        tvScreen.style.tapHighlightColor = 'transparent';
        tvScreen.style.touchAction = 'manipulation';
        tvScreen.style.userSelect = 'none';
        tvScreen.style.webkitUserSelect = 'none';
    }

    /* Single touchstart prevention on tvWrap */
    tvWrap.addEventListener('touchstart', e => { e.preventDefault(); }, { passive: false });

    /* Create overlay (handles channel switching when on) */
    _createTouchOverlay();

    /* Desktop keyboard */
    tvWrap.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (tvOn) nextChannel(); }
    });

})();