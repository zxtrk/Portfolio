/* ═══════════════════════════════════════════════════════════════
   RETRO TV COLOUR PALETTE — tv.js  v4

   FIXES:
   1. Yellow tap highlight — overlay now appends INSIDE tvWrap
      (not tvStage/tvStageInner) so it only covers the TV body.
      tvWrap gets position:relative so the overlay's
      position:absolute covers exactly the TV card area.
      All touch events on the overlay call preventDefault()
      before the browser can render any highlight colour.

   2. Smoother palette transitions — CSS trans4itions on swatches,
      palette name, status bar text. Channel dot active state
      also transitions. The noise flash between channels is
      shorter and the palette crossfade uses opacity smoothly.

   3. Status bar animates — name and hex fade in on each change.
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
    const tvOffState       = document.getElementById('tvOffState');
    const tvLoading        = document.getElementById('tvLoading');
    const tvLoadText       = document.getElementById('tvLoadText');
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
    const tvStage          = document.getElementById('tvStage');

    const previewSwatches = [0,1,2,3,4].map(i => document.getElementById('tvPs' + i));

    /* ══════════════════════════════════════════════════════════
       YELLOW HIGHLIGHT FIX v4

       Root cause: the previous overlay was appended to
       tvStage/tvStageInner which is a flex-row containing BOTH
       the TV card AND the text side. The overlay therefore
       covered the text side too, causing layout/interaction
       issues — but worse, it wasn't sized correctly over the TV.

       Correct approach:
       - Append overlay directly inside tvWrap.
       - Set tvWrap { position:relative } so the overlay's
         position:absolute covers exactly tvWrap's bounding box.
       - tvWrap already wraps only the TV card, nothing else.
       - preventDefault on every touchstart/touchend kills the
         yellow highlight at the earliest possible moment.
    ══════════════════════════════════════════════════════════ */

    function _createTouchOverlay() {
        // Ensure tvWrap is a positioning context
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

        // Append inside tvWrap — covers only the TV card
        tvWrap.appendChild(overlay);

        // preventDefault on touchstart is the critical step:
        // it stops WebKit from painting the yellow highlight
        // before JavaScript even runs.
        overlay.addEventListener('touchstart', e => {
            e.preventDefault();
            e.stopPropagation();
        }, { passive: false });

        overlay.addEventListener('touchend', e => {
            e.preventDefault();
            e.stopPropagation();
            _handleTap();
        }, { passive: false });

        overlay.addEventListener('touchcancel', e => {
            e.preventDefault();
        }, { passive: false });

        // Desktop click
        overlay.addEventListener('click', e => {
            e.preventDefault();
            _handleTap();
        });

        return overlay;
    }

    function _handleTap() {
        if (!tvOn && !booting) bootTV();
        else if (tvOn) nextChannel();
    }

    /* ── inject smooth-transition CSS ── */
    function _injectTvTransitionCSS() {
        if (document.getElementById('tv-transition-styles')) return;
        const s = document.createElement('style');
        s.id = 'tv-transition-styles';
        s.textContent = `
            /* Swatch colour crossfade */
            .tv-swatch {
                transition: background 0.55s cubic-bezier(0.22,1,0.36,1) !important;
            }
            /* Palette name fade */
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
            /* Status bar */
            #tvStatusName, #tvStatusHex {
                transition: opacity 0.25s ease;
            }
            #tvStatusName.tv-fade-out, #tvStatusHex.tv-fade-out {
                opacity: 0;
            }
            /* Channel tag */
            #tvChannelTag {
                transition: opacity 0.2s ease;
            }
            /* Channel dots */
            .tv-ch-dot {
                transition: transform 0.2s ease, box-shadow 0.2s ease !important;
            }
            /* Palette display crossfade */
            #tvPaletteDisplay {
                transition: opacity 0.25s ease !important;
            }
            /* Noise canvas */
            #tvNoiseCanvas {
                transition: opacity 0.18s ease !important;
            }
            /* Now-showing badge */
            #tvNowShowing {
                transition: opacity 0.3s ease !important;
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

    /* ── MOBILE OPTIMIZATION ── */
    function isMobile() {
        return window.innerWidth <= 900;
    }

    function adjustForMobile() {
        if (!isMobile()) return;

        // Ensure TV is properly sized for mobile
        const tvBody = document.querySelector('.tv-body');
        if (tvBody) {
            tvBody.style.width = '320px';
        }

        // Ensure loading animation is visible
        if (tvLoading) {
            tvLoading.style.opacity = tvOn ? '0' : '1';
        }

        // Ensure palette display is visible
        if (tvPaletteDisplay) {
            tvPaletteDisplay.style.opacity = tvOn ? '1' : '0';
        }
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

        // Swatches: CSS transition handles the colour fade
        tvSwatches.querySelectorAll('.tv-swatch').forEach((el, i) => {
            // Stagger via transition-delay so it feels like a wipe
            el.style.transitionDelay = `${i * 0.07}s`;
            el.style.background = p.colors[i] || '#000';
            const hexEl = el.querySelector('.tv-swatch-hex');
            if (hexEl) hexEl.textContent = p.colors[i] || '';
        });

        // Preview swatches on text side
        previewSwatches.forEach((el, i) => {
            if (el) el.style.background = p.colors[i] || 'transparent';
        });

        // Palette name: exit → update → enter
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

        // Channel tag
        if (tvChannelTag) tvChannelTag.textContent = 'CH ' + String(idx + 1).padStart(2, '0');

        // Status bar fade
        if (tvStatusName) {
            tvStatusName.classList.add('tv-fade-out');
            tvStatusHex && tvStatusHex.classList.add('tv-fade-out');
            setTimeout(() => {
                if (tvStatusName) { tvStatusName.textContent = p.name; tvStatusName.classList.remove('tv-fade-out'); }
                if (tvStatusHex)  { tvStatusHex.textContent  = p.colors[0]; tvStatusHex.classList.remove('tv-fade-out'); }
            }, 130);
        }

        // Now showing badge
        if (tvNowName)    tvNowName.textContent = p.name;
        if (tvNowShowing) tvNowShowing.classList.add('active');

        // Glow ring
        const glowCol = p.colors[2] || p.colors[0];
        if (tvGlowRing) {
            tvGlowRing.style.background =
                'radial-gradient(ellipse 80% 70% at 50% 55%, ' + glowCol + '18 0%, transparent 65%)';
            tvGlowRing.style.opacity = '0.7';
        }

        // Channel dots
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

    /* ── Shared channel switch logic (used by cycle + tap + dots) ── */
    function _switchChannel(targetIdx) {
        stopCycle();
        // Quick noise flash
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

        tvOffState.style.opacity = '0';
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
            if (tvLoadText) tvLoadText.style.display = 'none';
            const barWrap = document.querySelector('.tv-load-bar-wrap');
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
            if (tvLoadText) tvLoadText.style.display = '';

            tvNoiseCanvas.style.opacity    = '0.07';
            tvPaletteDisplay.style.opacity = '1';
            if (tvChannelTag) tvChannelTag.style.color = 'rgba(255,255,255,0.45)';
            tvStatusBar && tvStatusBar.querySelectorAll('span').forEach(s => { s.style.color = 'rgba(255,255,255,0.4)'; });

            if (tvOnAir)    tvOnAir.style.color         = 'rgba(200,80,80,0.9)';
            if (tvOnAirDot) { tvOnAirDot.style.background = '#c85050'; tvOnAirDot.style.boxShadow = '0 0 6px #c85050'; }

            applyPalette(palIdx);
            tvOn = true; booting = false;
            startCycle();

            // Mobile optimization
            adjustForMobile();
        }, 300);
    }

    /* ── NEXT CHANNEL (tap) ── */
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

    // Apply touch highlight prevention directly to TV elements
    tvWrap.style.webkitTapHighlightColor = 'transparent';
    tvWrap.style.tapHighlightColor = 'transparent';
    tvWrap.style.touchAction = 'manipulation';
    tvWrap.style.userSelect = 'none';
    tvWrap.style.webkitUserSelect = 'none';

    // Also apply to the TV screen to ensure no yellow highlight
    if (tvScreen) {
        tvScreen.style.webkitTapHighlightColor = 'transparent';
        tvScreen.style.tapHighlightColor = 'transparent';
        tvScreen.style.touchAction = 'manipulation';
        tvScreen.style.userSelect = 'none';
        tvScreen.style.webkitUserSelect = 'none';
    }

    // Belt-and-suspenders: kill touchstart on tvWrap itself too
    tvWrap.addEventListener('touchstart', e => { e.preventDefault(); }, { passive: false });
    tvWrap.addEventListener('touchend',   e => { e.preventDefault(); }, { passive: false });

    // Create the overlay (appended INSIDE tvWrap)
    _createTouchOverlay();

    // Desktop fallback click on tvWrap
    tvWrap.addEventListener('click', () => _handleTap());

    tvWrap.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); _handleTap(); }
    });

    // Mobile optimization on resize
    window.addEventListener('resize', adjustForMobile, { passive: true });
    adjustForMobile();

})();