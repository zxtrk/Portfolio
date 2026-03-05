/* ═══════════════════════════════════════════════════════════════
   RETRO TV COLOUR PALETTE — tv.js
   Fixes applied:
   - channel tag no longer overlaps palette name (smaller font, lower z)
   - glow ring is purely decorative behind TV (blurred, very faint)
   - tap highlight fully suppressed via touchstart preventDefault
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

    const previewSwatches = [
        document.getElementById('tvPs0'),
        document.getElementById('tvPs1'),
        document.getElementById('tvPs2'),
        document.getElementById('tvPs3'),
        document.getElementById('tvPs4'),
    ];

    /* ── NOISE CANVAS ── */
    function getScreenSize() {
        const rect = tvScreen.getBoundingClientRect();
        return {
            w: Math.round(rect.width)  || tvScreen.offsetWidth  || 360,
            h: Math.round(rect.height) || tvScreen.offsetHeight || 270,
        };
    }

    function startNoise(opacity) {
        const canvas = tvNoiseCanvas;
        const { w, h } = getScreenSize();
        canvas.width  = w;
        canvas.height = h;
        noiseCtx = canvas.getContext('2d');
        canvas.style.opacity = opacity || 0.18;
        function drawNoise() {
            const img  = noiseCtx.createImageData(canvas.width, canvas.height);
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

    /* ── APPLY PALETTE ── */
    function applyPalette(idx, animate) {
        const p       = PALETTES[idx];
        const swEls   = tvSwatches.querySelectorAll('.tv-swatch');

        swEls.forEach((el, i) => {
            const col = p.colors[i] || '#000';
            if (animate) {
                el.style.transition = `background 0.7s cubic-bezier(0.22,1,0.36,1) ${i*0.08}s`;
            }
            el.style.background = col;
            const hexEl = el.querySelector('.tv-swatch-hex');
            if (hexEl) hexEl.textContent = col;
        });

        tvPaletteName.textContent = p.name;
        /* Channel tag: short form only, e.g. "CH 01" */
        tvChannelTag.textContent  = 'CH ' + String(idx + 1).padStart(2, '0');
        tvStatusName.textContent  = p.name;
        tvStatusHex.textContent   = p.colors[0];

        previewSwatches.forEach((el, i) => {
            if (el) el.style.background = p.colors[i] || 'transparent';
        });

        tvNowName.textContent = p.name;
        tvNowShowing.classList.add('active');

        /* Glow ring: very subtle, only visible as ambient light behind TV body.
           Use a low-opacity radial gradient — never a solid fill. */
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
            tvNoiseCanvas.style.opacity = 0.35;
            setTimeout(() => {
                palIdx = (palIdx + 1) % PALETTES.length;
                applyPalette(palIdx, true);
                tvNoiseCanvas.style.opacity = 0.08;
            }, 200);
        }, 5000);
    }

    function stopCycle() {
        if (cycleTimer) { clearInterval(cycleTimer); cycleTimer = null; }
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

            tvLoading.style.opacity     = '1';
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
            tvLoadText.style.display = 'none';
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
        winEl.style.cssText = [
            'display:flex','flex-direction:column',
            'align-items:center','justify-content:center',
            'width:100%','height:100%','gap:18px',
        ].join(';');

        const title = document.createElement('div');
        title.style.cssText = [
            'font-family:"Share Tech Mono",monospace',
            'font-size:15px','letter-spacing:0.12em',
            'color:rgba(200,200,220,0.9)',
            'text-shadow:0 0 12px rgba(160,160,220,0.6)',
            'text-transform:uppercase',
        ].join(';');
        title.textContent = 'PETRICHOR OS';

        const sub = document.createElement('div');
        sub.style.cssText = [
            'font-family:"Share Tech Mono",monospace',
            'font-size:8px','letter-spacing:0.2em',
            'color:rgba(140,140,180,0.6)',
            'text-transform:uppercase',
            'margin-top:-12px',
        ].join(';');
        sub.textContent = 'Professional Edition';

        const trackWrap = document.createElement('div');
        trackWrap.style.cssText = [
            'width:55%','height:14px',
            'background:rgba(20,20,30,0.8)',
            'border:1px solid rgba(100,100,160,0.4)',
            'border-radius:2px','overflow:hidden',
            'display:flex','gap:2px','padding:2px',
        ].join(';');

        const SEGS = 12;
        const segs = [];
        for (let i = 0; i < SEGS; i++) {
            const s = document.createElement('div');
            s.style.cssText = [
                'flex:1','height:100%',
                'border-radius:1px',
                'background:rgba(60,80,180,0.15)',
                'transition:background 0.15s ease',
            ].join(';');
            trackWrap.appendChild(s);
            segs.push(s);
        }

        const statusTxt = document.createElement('div');
        statusTxt.style.cssText = [
            'font-family:"Share Tech Mono",monospace',
            'font-size:8px','letter-spacing:0.14em',
            'color:rgba(120,120,180,0.7)',
            'text-transform:uppercase',
        ].join(';');
        statusTxt.textContent = 'Starting up...';

        winEl.appendChild(title);
        winEl.appendChild(sub);
        winEl.appendChild(trackWrap);
        winEl.appendChild(statusTxt);
        tvLoading.appendChild(winEl);

        const statusMsgs = ['Loading palettes...','Calibrating colours...','Almost ready...','Done.'];
        let seg = 0, msgI = 0;
        const segTimer = setInterval(() => {
            if (seg < SEGS) {
                segs[seg].style.background = 'linear-gradient(to bottom,rgba(100,130,255,0.9),rgba(60,80,200,0.8))';
                segs[seg].style.boxShadow  = '0 0 6px rgba(100,130,255,0.5)';
                seg++;
                if (seg % Math.ceil(SEGS / statusMsgs.length) === 0 && msgI < statusMsgs.length) {
                    statusTxt.textContent = statusMsgs[msgI++];
                }
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

            tvNoiseCanvas.style.opacity = '0.07';
            tvPaletteDisplay.style.opacity = '1';
            /* Show the channel tag & status bar */
            tvChannelTag.style.color = 'rgba(255,255,255,0.45)';
            tvStatusBar.querySelectorAll('span').forEach(s => {
                s.style.color = 'rgba(255,255,255,0.4)';
            });

            tvOnAir.style.color         = 'rgba(200,80,80,0.9)';
            tvOnAirDot.style.background = '#c85050';
            tvOnAirDot.style.boxShadow  = '0 0 6px #c85050';

            applyPalette(palIdx, false);
            tvOn    = true;
            booting = false;
            startCycle();
        }, 300);
    }

    /* ── NEXT CHANNEL ── */
    function nextChannel() {
        stopCycle();
        tvNoiseCanvas.style.opacity = '0.3';
        tvPaletteDisplay.style.opacity = '0';
        setTimeout(() => {
            palIdx = (palIdx + 1) % PALETTES.length;
            applyPalette(palIdx, false);
            tvPaletteDisplay.style.opacity = '1';
            tvNoiseCanvas.style.opacity    = '0.07';
            startCycle();
        }, 250);
    }

    /* ── CLICK / TOUCH — no yellow flash ── */
    tvWrap.addEventListener('touchstart', e => { e.preventDefault(); }, { passive: false });
    tvWrap.addEventListener('touchend',   e => {
        e.preventDefault();
        if (!tvOn && !booting) bootTV();
        else if (tvOn) nextChannel();
    }, { passive: false });
    tvWrap.addEventListener('click', e => {
        e.preventDefault();
        if (!tvOn && !booting) bootTV();
        else if (tvOn) nextChannel();
    });
    tvWrap.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!tvOn && !booting) bootTV();
            else if (tvOn) nextChannel();
        }
    });

    /* ── CHANNEL DOTS ── */
    tvChannelDots.querySelectorAll('.tv-ch-dot').forEach((dot, i) => {
        function switchTo() {
            if (!tvOn) return;
            stopCycle();
            const target = i < PALETTES.length ? i : i % PALETTES.length;
            tvNoiseCanvas.style.opacity    = '0.3';
            tvPaletteDisplay.style.opacity = '0';
            setTimeout(() => {
                palIdx = target;
                applyPalette(palIdx, false);
                tvPaletteDisplay.style.opacity = '1';
                tvNoiseCanvas.style.opacity    = '0.07';
                startCycle();
            }, 200);
        }
        dot.addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); }, { passive: false });
        dot.addEventListener('touchend',   e => { e.preventDefault(); e.stopPropagation(); switchTo(); }, { passive: false });
        dot.addEventListener('click',      e => { e.stopPropagation(); switchTo(); });
    });

    /* ── REVEAL text side ── */
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                tvTextSide.classList.add('revealed');
                observer.unobserve(e.target);
            }
        });
    }, { threshold: 0.15 });
    const sec = document.getElementById('tvPaletteSection');
    if (sec) observer.observe(sec);

    /* ── Resize noise canvas ── */
    window.addEventListener('resize', () => {
        if (tvNoiseCanvas && noiseCtx) {
            const { w, h } = getScreenSize();
            tvNoiseCanvas.width  = w;
            tvNoiseCanvas.height = h;
        }
    }, { passive: true });

})();