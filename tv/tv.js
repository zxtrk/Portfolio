/* tv.js v5 — Desktop retro TV palette .*/
(function () {
    'use strict';

    const PALETTES = [
        { name: 'PETRICHOR',      colors: ['#1A1814','#3D3228','#7A6248','#C4A882','#E8D5B0'] },
        { name: 'DUSK WIRE',      colors: ['#0D0F1A','#1A2040','#2E4080','#6080C0','#A0B8E8'] },
        { name: 'EMBER STATIC',   colors: ['#1A0A00','#3D1800','#8B3A00','#D4722A','#F0B870'] },
        { name: 'MOSS SIGNAL',    colors: ['#0A1208','#1A2818','#2E4828','#5A7848','#9AB880'] },
        { name: 'LAVENDER HAZE',  colors: ['#120A1A','#281840','#4A3070','#8060A8','#C0A0D8'] },
        { name: 'COLD IRON',      colors: ['#0A0C0E','#1A1E22','#2E3840','#5A6878','#98A8B8'] },
        { name: 'DESERT TAPE',    colors: ['#1A1008','#382218','#6A4830','#A87858','#D8B890'] },
        { name: 'NEON GHOST',     colors: ['#080A10','#101828','#183048','#284870','#48A888'] },
    ];

    let tvOn = false, booting = false, palIdx = 0;
    let cycleTimer = null, noiseRaf = null, noiseCtx = null;

    const $ = id => document.getElementById(id);
    const tvWrap        = $('tvWrap');
    const tvScreen      = $('tvScreen');
    const tvNoiseCanvas = $('tvNoiseCanvas');
    const tvLoading     = $('tvLoading');
    const tvPalDisplay  = $('tvPaletteDisplay');
    const tvPalName     = $('tvPaletteName');
    const tvSwatches    = $('tvSwatches');
    const tvChanTag     = $('tvChannelTag');
    const tvStatusBar   = $('tvStatusBar');
    const tvStatusName  = $('tvStatusName');
    const tvStatusHex   = $('tvStatusHex');
    const tvOnAir       = $('tvOnAir');
    const tvOnAirDot    = $('tvOnAirDot');
    const tvGlowRing    = $('tvGlowRing');
    const tvChanDots    = $('tvChannelDots');
    const tvNowShowing  = $('tvNowShowing');
    const tvNowName     = $('tvNowName');
    const tvTextSide    = $('tvTextSide');
    const tvPowerBtn    = $('tvPowerBtn');
    const tvHint        = $('tvHintDesktop');
    const tvLoadText    = tvLoading && tvLoading.querySelector('.tv-load-text');

    const prevSwatches  = [0,1,2,3,4].map(i => $('tvPs'+i));

    if (!tvWrap || !tvScreen) return;

    /* ── Inject transition CSS ── */
    (function() {
        if ($('tv-transition-styles')) return;
        const s = document.createElement('style');
        s.id = 'tv-transition-styles';
        s.textContent = `
            .tv-swatch { transition: background 0.55s cubic-bezier(0.22,1,0.36,1) !important; }
            #tvPaletteName { transition: opacity 0.3s ease, transform 0.3s ease; }
            #tvPaletteName.tv-name-exit { opacity:0; transform:translateY(-4px); }
            #tvPaletteName.tv-name-enter { opacity:0; transform:translateY(4px); }
            #tvStatusName, #tvStatusHex { transition: opacity 0.25s ease; }
            #tvStatusName.tv-fade-out, #tvStatusHex.tv-fade-out { opacity:0; }
            #tvPs0,#tvPs1,#tvPs2,#tvPs3,#tvPs4 {
                transition: background 0.6s cubic-bezier(0.22,1,0.36,1) !important;
            }
        `;
        document.head.appendChild(s);
    })();

    /* ── Noise canvas ── */
    function startNoise(opacity) {
        const w = tvScreen.offsetWidth || 360, h = tvScreen.offsetHeight || 270;
        tvNoiseCanvas.width = w; tvNoiseCanvas.height = h;
        noiseCtx = tvNoiseCanvas.getContext('2d');
        tvNoiseCanvas.style.opacity = opacity || 0.18;
        (function draw() {
            const img = noiseCtx.createImageData(w, h), d = img.data;
            for (let i = 0; i < d.length; i += 4) {
                const v = Math.random() * 255 | 0;
                d[i] = d[i+1] = d[i+2] = v; d[i+3] = 80;
            }
            noiseCtx.putImageData(img, 0, 0);
            noiseRaf = requestAnimationFrame(draw);
        })();
    }
    function stopNoise() {
        if (noiseRaf) { cancelAnimationFrame(noiseRaf); noiseRaf = null; }
        if (tvNoiseCanvas) tvNoiseCanvas.style.opacity = 0;
    }

    /* ── Clear preview (TV off) ── */
    function clearPreview() {
        prevSwatches.forEach(el => { if (el) el.style.background = 'transparent'; });
        if (tvNowShowing) tvNowShowing.classList.remove('active');
    }

    /* ── Apply palette ── */
    function applyPalette(idx) {
        const p = PALETTES[idx];
        tvSwatches.querySelectorAll('.tv-swatch').forEach((el, i) => {
            el.style.transitionDelay = (i * 0.07) + 's';
            el.style.background = p.colors[i] || '#000';
            const h = el.querySelector('.tv-swatch-hex');
            if (h) h.textContent = p.colors[i] || '';
        });
        prevSwatches.forEach((el, i) => { if (el) el.style.background = p.colors[i] || 'transparent'; });

        if (tvPalName) {
            tvPalName.classList.add('tv-name-exit');
            setTimeout(() => {
                tvPalName.textContent = p.name;
                tvPalName.classList.remove('tv-name-exit');
                tvPalName.classList.add('tv-name-enter');
                requestAnimationFrame(() => tvPalName.classList.remove('tv-name-enter'));
            }, 150);
        }
        if (tvChanTag) tvChanTag.textContent = 'CH ' + String(idx + 1).padStart(2, '0');
        if (tvStatusName) {
            tvStatusName.classList.add('tv-fade-out');
            if (tvStatusHex) tvStatusHex.classList.add('tv-fade-out');
            setTimeout(() => {
                if (tvStatusName) { tvStatusName.textContent = p.name; tvStatusName.classList.remove('tv-fade-out'); }
                if (tvStatusHex)  { tvStatusHex.textContent = p.colors[0]; tvStatusHex.classList.remove('tv-fade-out'); }
            }, 130);
        }
        if (tvNowName) tvNowName.textContent = p.name;
        if (tvNowShowing) tvNowShowing.classList.add('active');
        const gCol = p.colors[2] || p.colors[0];
        if (tvGlowRing) { tvGlowRing.style.background = `radial-gradient(ellipse 80% 70% at 50% 55%, ${gCol}18 0%, transparent 65%)`; tvGlowRing.style.opacity = '0.7'; }
        tvChanDots && tvChanDots.querySelectorAll('.tv-ch-dot').forEach((d, i) => {
            d.classList.toggle('active', i === idx % 8);
            d.style.setProperty('--tv-active-color', p.colors[2]);
        });
    }

    /* ── Cycle ── */
    function startCycle() {
        stopCycle();
        cycleTimer = setInterval(() => { if (tvOn) switchChan((palIdx + 1) % PALETTES.length); }, 5000);
    }
    function stopCycle() { if (cycleTimer) { clearInterval(cycleTimer); cycleTimer = null; } }

    function switchChan(idx) {
        stopCycle();
        tvNoiseCanvas.style.opacity = '0.28';
        tvPalDisplay.style.opacity = '0';
        setTimeout(() => {
            palIdx = idx; applyPalette(palIdx);
            tvPalDisplay.style.opacity = '1';
            tvNoiseCanvas.style.opacity = '0.07';
            startCycle();
        }, 180);
    }

    /* ── BIOS lines ── */
    const BIOS = [
        'PETRICHOR BIOS v2.07','Copyright (C) 1998-2001','',
        'CPU: PALETTE-386 @ 33MHz','Memory Test: 640K OK','',
        'HDD0: COLOUR_BANK  [OK]','HDD1: PALETTE_DB   [OK]','',
        'Loading PETRICHOR OS...','Press any key to continue_',
    ];

    /* ── Boot ── */
    function bootTV() {
        if (booting) return;
        booting = true;
        const offDot = tvScreen.querySelector('.tv-screen-content');
        if (offDot) offDot.style.opacity = '0';
        tvScreen.style.background = '#111';
        startNoise(0.6);

        setTimeout(() => {
            stopNoise();
            tvScreen.style.background = '#050302';
            tvLoading.style.opacity = '1';
            Object.assign(tvLoading.style, { flexDirection:'column', alignItems:'flex-start', padding:'14px 18px', justifyContent:'flex-start', gap:'0px' });

            let biosEl = document.getElementById('tvBiosText');
            if (!biosEl) {
                biosEl = document.createElement('div');
                biosEl.id = 'tvBiosText';
                biosEl.style.cssText = 'font-family:"Share Tech Mono",monospace;font-size:9px;line-height:1.6;color:rgba(160,220,160,0.92);text-shadow:0 0 6px rgba(120,200,120,0.5);white-space:pre;width:100%;letter-spacing:0.04em;';
                tvLoading.appendChild(biosEl);
            }
            biosEl.textContent = '';
            if (tvLoadText) tvLoadText.style.display = 'none';
            const bw = tvLoading.querySelector('.tv-load-bar-wrap');
            if (bw) bw.style.display = 'none';

            let li = 0;
            (function typeLine() {
                if (li >= BIOS.length) { setTimeout(showProgress, 300); return; }
                biosEl.textContent += BIOS[li] + '\n';
                li++;
                setTimeout(typeLine, BIOS[li-1] === '' ? 40 : 80 + Math.random()*80);
            })();
        }, 600);
    }

    function showProgress() {
        tvLoading.innerHTML = '';
        const wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;gap:18px;';

        const title = document.createElement('div');
        title.style.cssText = 'font-family:"Share Tech Mono",monospace;font-size:15px;letter-spacing:0.12em;color:rgba(200,200,220,0.9);text-shadow:0 0 12px rgba(160,160,220,0.6);text-transform:uppercase;';
        title.textContent = 'PETRICHOR OS';

        const track = document.createElement('div');
        track.style.cssText = 'width:55%;height:14px;background:rgba(20,20,30,0.8);border:1px solid rgba(100,100,160,0.4);border-radius:2px;overflow:hidden;display:flex;gap:2px;padding:2px;';
        const SEGS = 12, segs = [];
        for (let i=0;i<SEGS;i++) {
            const s = document.createElement('div');
            s.style.cssText = 'flex:1;height:100%;border-radius:1px;background:rgba(60,80,180,0.15);transition:background 0.15s ease;';
            track.appendChild(s); segs.push(s);
        }
        const status = document.createElement('div');
        status.style.cssText = 'font-family:"Share Tech Mono",monospace;font-size:8px;letter-spacing:0.14em;color:rgba(120,120,180,0.7);text-transform:uppercase;';
        status.textContent = 'Starting up...';

        wrap.append(title, track, status);
        tvLoading.appendChild(wrap);

        const msgs = ['Loading palettes...','Calibrating colours...','Almost ready...','Done.'];
        let seg=0, mi=0;
        const t = setInterval(() => {
            if (seg < SEGS) {
                segs[seg].style.background = 'linear-gradient(to bottom,rgba(100,130,255,0.9),rgba(60,80,200,0.8))';
                segs[seg].style.boxShadow = '0 0 6px rgba(100,130,255,0.5)';
                seg++;
                if (seg % Math.ceil(SEGS/msgs.length) === 0 && mi < msgs.length) status.textContent = msgs[mi++];
            } else { clearInterval(t); setTimeout(launchPalette, 400); }
        }, 130);
    }

    function launchPalette() {
        tvLoading.style.opacity = '0';
        setTimeout(() => {
            tvLoading.innerHTML = '';
            tvNoiseCanvas.style.opacity = '0.07';
            tvPalDisplay.style.opacity = '1';
            if (tvChanTag) tvChanTag.style.color = 'rgba(255,255,255,0.45)';
            tvStatusBar && tvStatusBar.querySelectorAll('span').forEach(s => s.style.color = 'rgba(255,255,255,0.4)');
            if (tvOnAir)    tvOnAir.style.color = 'rgba(200,80,80,0.9)';
            if (tvOnAirDot) { tvOnAirDot.style.background = '#c85050'; tvOnAirDot.style.boxShadow = '0 0 6px #c85050'; }
            applyPalette(palIdx);
            tvOn = true; booting = false;
            startCycle();
            tvWrap.classList.add('tv-on');
            if (tvPowerBtn) tvPowerBtn.classList.add('btn-on');
            if (tvHint) tvHint.style.opacity = '0';
        }, 300);
    }

    /* ── Power off ── */
    function powerOff() {
        if (!tvOn || booting) return;
        stopCycle(); tvOn = false;
        tvLoading.style.opacity = '0'; tvLoading.innerHTML = '';
        tvPalDisplay.style.opacity = '0';
        stopNoise();
        const offDot = tvScreen.querySelector('.tv-screen-content');
        if (offDot) offDot.style.opacity = '1';
        tvScreen.style.background = '#050302';
        if (tvChanTag) tvChanTag.style.color = 'rgba(255,255,255,0)';
        tvStatusBar && tvStatusBar.querySelectorAll('span').forEach(s => s.style.color = 'rgba(255,255,255,0)');
        if (tvOnAir)    tvOnAir.style.color = 'rgba(200,80,80,0)';
        if (tvOnAirDot) { tvOnAirDot.style.background = 'rgba(200,80,80,0)'; tvOnAirDot.style.boxShadow = 'none'; }
        if (tvGlowRing) tvGlowRing.style.opacity = '0';
        tvWrap.classList.remove('tv-on');
        if (tvPowerBtn) tvPowerBtn.classList.remove('btn-on');
        if (tvHint) tvHint.style.opacity = '0.5';
        clearPreview();
    }

    /* ── Channel dots ── */
    tvChanDots && tvChanDots.querySelectorAll('.tv-ch-dot').forEach((dot, i) => {
        function go() { if (!tvOn) return; switchChan(i < PALETTES.length ? i : i % PALETTES.length); }
        dot.addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); }, { passive:false });
        dot.addEventListener('touchend',   e => { e.preventDefault(); e.stopPropagation(); go(); }, { passive:false });
        dot.addEventListener('click',      e => { e.stopPropagation(); go(); });
    });

    /* ── TV click (channel change when on) ── */
    function handleTvTap() { if (tvOn) switchChan((palIdx + 1) % PALETTES.length); }
    tvWrap.addEventListener('touchstart', e => e.preventDefault(), { passive:false });
    (() => {
        const ov = document.createElement('div');
        ov.style.cssText = 'position:absolute;inset:0;z-index:99999;background:transparent;-webkit-tap-highlight-color:transparent;touch-action:manipulation;user-select:none;pointer-events:auto;';
        tvWrap.style.position = 'relative';
        tvWrap.appendChild(ov);
        ov.addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); }, { passive:false });
        ov.addEventListener('touchend',   e => { e.preventDefault(); e.stopPropagation(); handleTvTap(); }, { passive:false });
        ov.addEventListener('click',      e => { e.preventDefault(); handleTvTap(); });
    })();

    /* ── Reveal text side ── */
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { tvTextSide && tvTextSide.classList.add('revealed'); obs.unobserve(e.target); } });
    }, { threshold: 0.15 });
    const sec = document.getElementById('tvPaletteSection');
    if (sec) obs.observe(sec);

    /* ── Power button ── */
    if (tvPowerBtn) {
        tvPowerBtn.addEventListener('click', e => {
            e.stopPropagation();
            if (!tvOn && !booting) bootTV(); else if (tvOn) powerOff();
        });
    }

    /* ── Init ── */
    clearPreview();

})();