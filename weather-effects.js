/* ═══════════════════════════════════════════════════════════════
   WEATHER & THEME EFFECTS SYSTEM — weather-effects.js  v3
   Fixes:
   • Canvas z-index raised so effects are visible on desktop
   • Canvas pointer-events kept none so it never blocks interaction
   ═══════════════════════════════════════════════════════════════ */

"use strict";

const WeatherEffects = (() => {

    const COVENTRY_LAT  = 52.4082;
    const COVENTRY_LON  = -1.5109;
    const POLL_INTERVAL = 18 * 60 * 1000;
    const CACHE_KEY     = "wx_cache";
    const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let _canvas        = null;
    let _ctx           = null;
    let _rafId         = null;
    let _particles     = [];
    let _currentEffect = "none";
    let _decorations   = {};
    let _wxPollTimer   = null;
    let _density       = 1.0;

    /* ══════════════════════════════════════════════════════════
       PARTICLE DEFINITIONS
    ══════════════════════════════════════════════════════════ */

    const Effects = {

        snow: {
            baseCount: () => REDUCED_MOTION ? 0 : Math.min(Math.floor(window.innerWidth / 8), 160),
            create() {
                return {
                    x:   Math.random() * window.innerWidth,
                    y:   Math.random() * -window.innerHeight,
                    r:   1.2 + Math.random() * 3.5,
                    vx:  (Math.random() - 0.5) * 0.6,
                    vy:  0.4 + Math.random() * 1.2,
                    op:  0.4 + Math.random() * 0.55,
                    wob: Math.random() * Math.PI * 2,
                    wobS:0.008 + Math.random() * 0.012,
                };
            },
            update(p) {
                p.wob += p.wobS;
                p.x   += p.vx + Math.sin(p.wob) * 0.55;
                p.y   += p.vy;
                if (p.y > window.innerHeight + 10) { p.y = -10; p.x = Math.random() * window.innerWidth; }
                if (p.x < -10) p.x = window.innerWidth + 10;
                if (p.x > window.innerWidth + 10) p.x = -10;
            },
            draw(ctx, p) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${p.op})`;
                ctx.fill();
            },
        },

        rain: {
            baseCount: () => REDUCED_MOTION ? 0 : Math.min(Math.floor(window.innerWidth / 5), 220),
            create() {
                return {
                    x:   Math.random() * window.innerWidth,
                    y:   Math.random() * -window.innerHeight,
                    len: 8 + Math.random() * 18,
                    vx:  -0.8 + Math.random() * 0.3,
                    vy:  9 + Math.random() * 7,
                    op:  0.15 + Math.random() * 0.35,
                };
            },
            update(p) {
                p.x += p.vx; p.y += p.vy;
                if (p.y > window.innerHeight + 20) { p.y = -20; p.x = Math.random() * window.innerWidth; }
            },
            draw(ctx, p) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + p.vx * (p.len / p.vy), p.y + p.len);
                ctx.strokeStyle = `rgba(174,214,241,${p.op})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
            },
        },

        autumn: {
            baseCount: () => REDUCED_MOTION ? 0 : 55,
            create() {
                const hue = 15 + Math.floor(Math.random() * 35);
                const sat = 70 + Math.floor(Math.random() * 25);
                return {
                    x:    Math.random() * window.innerWidth,
                    y:    Math.random() * -window.innerHeight,
                    r:    5 + Math.random() * 11,
                    vx:   (Math.random() - 0.5) * 1.4,
                    vy:   0.6 + Math.random() * 1.0,
                    rot:  Math.random() * Math.PI * 2,
                    rotS: (Math.random() - 0.5) * 0.04,
                    op:   0.45 + Math.random() * 0.4,
                    color:`hsl(${hue},${sat}%,55%)`,
                    wob:  Math.random() * Math.PI * 2,
                    wobS: 0.006 + Math.random() * 0.01,
                };
            },
            update(p) {
                p.wob += p.wobS; p.rot += p.rotS;
                p.x   += p.vx + Math.sin(p.wob) * 0.9;
                p.y   += p.vy;
                if (p.y > window.innerHeight + 20) { p.y = -20; p.x = Math.random() * window.innerWidth; }
            },
            draw(ctx, p) {
                ctx.save();
                ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = p.op;
                ctx.beginPath();
                ctx.moveTo(0, -p.r);
                ctx.bezierCurveTo( p.r * 0.8, -p.r * 0.5,  p.r,  p.r * 0.4, 0,  p.r);
                ctx.bezierCurveTo(-p.r,         p.r * 0.4, -p.r * 0.8, -p.r * 0.5, 0, -p.r);
                ctx.fillStyle = p.color; ctx.fill();
                ctx.restore(); ctx.globalAlpha = 1;
            },
        },

        spring: {
            baseCount: () => REDUCED_MOTION ? 0 : 70,
            create() {
                const hues = [330, 340, 355, 310, 280];
                const hue  = hues[Math.floor(Math.random() * hues.length)];
                return {
                    x:    Math.random() * window.innerWidth,
                    y:    Math.random() * -window.innerHeight,
                    r:    3 + Math.random() * 7,
                    vx:   (Math.random() - 0.5) * 1.0,
                    vy:   0.3 + Math.random() * 0.8,
                    rot:  Math.random() * Math.PI * 2,
                    rotS: (Math.random() - 0.5) * 0.035,
                    op:   0.5 + Math.random() * 0.4,
                    color:`hsl(${hue},75%,75%)`,
                    wob:  Math.random() * Math.PI * 2,
                    wobS: 0.007 + Math.random() * 0.013,
                };
            },
            update(p) {
                p.wob += p.wobS; p.rot += p.rotS;
                p.x   += p.vx + Math.cos(p.wob) * 0.7;
                p.y   += p.vy;
                if (p.y > window.innerHeight + 20) { p.y = -20; p.x = Math.random() * window.innerWidth; }
            },
            draw(ctx, p) {
                ctx.save();
                ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = p.op;
                for (let i = 0; i < 5; i++) {
                    ctx.save(); ctx.rotate((i / 5) * Math.PI * 2);
                    ctx.beginPath();
                    ctx.ellipse(0, -p.r * 0.65, p.r * 0.45, p.r * 0.7, 0, 0, Math.PI * 2);
                    ctx.fillStyle = p.color; ctx.fill(); ctx.restore();
                }
                ctx.beginPath(); ctx.arc(0, 0, p.r * 0.28, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,230,100,0.9)`; ctx.fill();
                ctx.restore(); ctx.globalAlpha = 1;
            },
        },

        summer: {
            baseCount: () => REDUCED_MOTION ? 0 : 50,
            create() {
                return {
                    x:    Math.random() * window.innerWidth,
                    y:    Math.random() * window.innerHeight,
                    r:    0.6 + Math.random() * 2.2,
                    vx:   (Math.random() - 0.5) * 0.4,
                    vy:   -(0.15 + Math.random() * 0.5),
                    op:   0,
                    maxOp:0.3 + Math.random() * 0.55,
                    life: 0,
                    maxL: 180 + Math.floor(Math.random() * 200),
                    hue:  38 + Math.floor(Math.random() * 20),
                };
            },
            update(p) {
                p.life++;
                p.x += p.vx + (Math.random() - 0.5) * 0.2;
                p.y += p.vy;
                const prog = p.life / p.maxL;
                p.op = prog < 0.2
                    ? p.maxOp * (prog / 0.2)
                    : p.maxOp * (1 - (prog - 0.2) / 0.8);
                if (p.life >= p.maxL || p.y < -10) {
                    p.x = Math.random() * window.innerWidth;
                    p.y = window.innerHeight + 10;
                    p.life = 0; p.op = 0;
                    p.maxL = 180 + Math.floor(Math.random() * 200);
                    p.vy   = -(0.15 + Math.random() * 0.5);
                }
            },
            draw(ctx, p) {
                if (p.op <= 0.005) return;
                ctx.beginPath();
                const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.5);
                grd.addColorStop(0, `hsla(${p.hue},100%,75%,${p.op})`);
                grd.addColorStop(1, `hsla(${p.hue},100%,75%,0)`);
                ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
                ctx.fillStyle = grd; ctx.fill();
            },
        },
    };

    /* ══════════════════════════════════════════════════════════
       CANVAS SETUP & RENDER LOOP
       FIX: z-index raised to 9990 so canvas renders above all
       background layers on desktop (grain, shapes, dots, etc.)
       pointer-events:none ensures it never blocks clicks.
    ══════════════════════════════════════════════════════════ */

    function _initCanvas() {
        if (_canvas) return;
        _canvas = document.createElement("canvas");
        _canvas.id = "wx-canvas";
        _canvas.style.cssText = [
            "position:fixed",
            "inset:0",
            "width:100%",
            "height:100%",
            "pointer-events:none",
            "z-index:9990",          // high enough to sit above background, below nav/admin
            "will-change:transform",
            "opacity:1",
        ].join(";");
        document.body.appendChild(_canvas);   // append to body end so stacking context is clear
        _ctx = _canvas.getContext("2d");
        _resizeCanvas();
        window.addEventListener("resize", _debounce(_resizeCanvas, 250), { passive: true });
    }

    function _resizeCanvas() {
        if (!_canvas) return;
        _canvas.width  = window.innerWidth;
        _canvas.height = window.innerHeight;
    }

    function _spawnParticles(effectKey) {
        const eff = Effects[effectKey];
        if (!eff) { _particles = []; return; }
        const count = Math.round(eff.baseCount() * Math.max(0.05, _density));
        _particles = Array.from({ length: count }, () => eff.create());
    }

    function _startLoop() {
        if (_rafId) return;
        const loop = () => {
            if (_currentEffect === "none" || !_ctx) { _rafId = null; return; }
            const eff = Effects[_currentEffect];
            if (!eff) { _rafId = null; return; }
            _ctx.clearRect(0, 0, _canvas.width, _canvas.height);
            for (const p of _particles) { eff.update(p); eff.draw(_ctx, p); }
            _rafId = requestAnimationFrame(loop);
        };
        _rafId = requestAnimationFrame(loop);
    }

    function _stopLoop() {
        if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
        if (_ctx) _ctx.clearRect(0, 0, _canvas?.width || 0, _canvas?.height || 0);
        _particles = [];
    }

    /* ══════════════════════════════════════════════════════════
       DECORATION SYSTEM
    ══════════════════════════════════════════════════════════ */

    function _removeAllDecorations() {
        const toRemove = [
            "wx-frosted","wx-winter-glow","wx-warm-overlay",
            "wx-leaf-corners","wx-darker-tone","wx-mist",
        ];
        document.documentElement.classList.remove(...toRemove);
        [
            "wx-lights-canvas","wx-leaf-corners-el","wx-mist-el",
            "wx-snowman","wx-icicles","wx-pumpkin","wx-spiderweb",
            "wx-umbrella","wx-puddles","wx-butterfly","wx-rainbow",
            "wx-sun","wx-beach",
        ].forEach(id => document.getElementById(id)?.remove());
    }

    function _applyDecorations(effect, decs) {
        _removeAllDecorations();
        if (!decs) return;

        if (effect === "snow") {
            if (decs.frostedBorders)  document.documentElement.classList.add("wx-frosted");
            if (decs.winterGlow)      document.documentElement.classList.add("wx-winter-glow");
            if (decs.christmasLights) _spawnLights();
            if (decs.snowman)         _spawnSnowman();
            if (decs.icicles)         _spawnIcicles();
        }
        if (effect === "autumn") {
            if (decs.warmOverlay)  document.documentElement.classList.add("wx-warm-overlay");
            if (decs.leafCorners)  _spawnLeafCorners();
            if (decs.pumpkin)      _spawnPumpkin();
            if (decs.spiderweb)    _spawnSpiderweb();
        }
        if (effect === "rain") {
            if (decs.darkerTone)  document.documentElement.classList.add("wx-darker-tone");
            if (decs.mistEffect)  _spawnMist();
            if (decs.umbrella)    _spawnUmbrella();
            if (decs.puddles)     _spawnPuddles();
        }
        if (effect === "spring") {
            if (decs.butterfly)   _spawnButterfly();
            if (decs.rainbow)     _spawnRainbow();
        }
        if (effect === "summer") {
            if (decs.sun)         _spawnSun();
            if (decs.beach)       _spawnBeach();
        }
    }

    /* ── SNOW decorations ─────────────────────────────────── */

    function _spawnSnowman() {
        const el = document.createElement("div");
        el.id = "wx-snowman";
        el.style.cssText = "position:fixed;bottom:0;right:32px;pointer-events:none;z-index:3;";
        el.innerHTML = `
        <svg width="110" height="170" viewBox="0 0 110 170" fill="none" xmlns="http://www.w3.org/2000/svg"
             style="filter:drop-shadow(0 4px 16px rgba(180,220,255,0.3))">
          <style>
            @keyframes wxManBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
            .wx-man-g { animation: wxManBob 4s ease-in-out infinite; transform-origin: 55px 170px; }
          </style>
          <g class="wx-man-g">
            <ellipse cx="55" cy="162" rx="48" ry="10" fill="rgba(255,255,255,0.55)"/>
            <ellipse cx="55" cy="122" rx="34" ry="36" fill="rgba(245,252,255,0.95)" stroke="rgba(180,220,255,0.5)" stroke-width="1.5"/>
            <ellipse cx="55" cy="72" rx="25" ry="26" fill="rgba(248,254,255,0.97)" stroke="rgba(180,220,255,0.5)" stroke-width="1.5"/>
            <ellipse cx="55" cy="34" rx="20" ry="20" fill="rgba(255,255,255,1)" stroke="rgba(180,220,255,0.5)" stroke-width="1.5"/>
            <rect x="36" y="17" width="38" height="4" rx="2" fill="#2a2a3a"/>
            <rect x="41" y="0" width="28" height="18" rx="2" fill="#2a2a3a"/>
            <rect x="41" y="14" width="28" height="4" fill="var(--color-accent)" opacity="0.8"/>
            <circle cx="48" cy="29" r="2.5" fill="#2a2a3a"/>
            <circle cx="62" cy="29" r="2.5" fill="#2a2a3a"/>
            <line x1="45" y1="25" x2="51" y2="24" stroke="#2a2a3a" stroke-width="1.2" stroke-linecap="round"/>
            <line x1="59" y1="24" x2="65" y2="25" stroke="#2a2a3a" stroke-width="1.2" stroke-linecap="round"/>
            <polygon points="55,34 70,37 55,40" fill="#e8834a"/>
            <path d="M46 44 Q55 50 64 44" stroke="#2a2a3a" stroke-width="1.5" stroke-linecap="round" fill="none"/>
            <path d="M31 58 Q55 52 79 58 Q78 68 55 65 Q32 68 31 58Z" fill="var(--color-accent)" opacity="0.8"/>
            <ellipse cx="33" cy="62" rx="6" ry="9" fill="var(--color-accent)" opacity="0.65"/>
            <circle cx="55" cy="98"  r="3" fill="#2a2a3a" opacity="0.45"/>
            <circle cx="55" cy="112" r="3" fill="#2a2a3a" opacity="0.45"/>
            <circle cx="55" cy="126" r="3" fill="#2a2a3a" opacity="0.45"/>
            <circle cx="55" cy="76"  r="2.5" fill="#2a2a3a" opacity="0.3"/>
            <circle cx="55" cy="86"  r="2.5" fill="#2a2a3a" opacity="0.3"/>
            <line x1="22" y1="88"  x2="2"  y2="68" stroke="#7a5c2a" stroke-width="3.5" stroke-linecap="round"/>
            <line x1="2"  y1="68"  x2="-6" y2="56" stroke="#7a5c2a" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="2"  y1="68"  x2="-2" y2="60" stroke="#7a5c2a" stroke-width="2"   stroke-linecap="round"/>
            <line x1="2"  y1="68"  x2="4"  y2="58" stroke="#7a5c2a" stroke-width="1.8" stroke-linecap="round"/>
            <line x1="88" y1="88"  x2="108" y2="68" stroke="#7a5c2a" stroke-width="3.5" stroke-linecap="round"/>
            <line x1="108" y1="68" x2="116" y2="56" stroke="#7a5c2a" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="108" y1="68" x2="112" y2="60" stroke="#7a5c2a" stroke-width="2"   stroke-linecap="round"/>
            <line x1="108" y1="68" x2="106" y2="58" stroke="#7a5c2a" stroke-width="1.8" stroke-linecap="round"/>
          </g>
        </svg>`;
        document.body.appendChild(el);
    }

    function _spawnIcicles() {
        const el = document.createElement("div");
        el.id = "wx-icicles";
        el.style.cssText = "position:fixed;top:0;left:0;width:100%;pointer-events:none;z-index:9996;overflow:hidden;";
        const vw    = window.innerWidth;
        const count = Math.ceil(vw / 48);
        let svg = `<svg width="${vw}" height="60" viewBox="0 0 ${vw} 60" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">
          <defs>
            <linearGradient id="iciGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="rgba(200,235,255,0.85)"/>
              <stop offset="100%" stop-color="rgba(180,225,255,0.2)"/>
            </linearGradient>
          </defs>`;
        for (let i = 0; i < count; i++) {
            const x     = (i / count) * vw + Math.random() * (vw / count * 0.6);
            const h     = 20 + Math.random() * 36;
            const w     = 5  + Math.random() * 8;
            const delay = (Math.random() * 3).toFixed(2);
            svg += `
              <g style="animation:wxIciDrip ${2.5 + Math.random()}s ${delay}s ease-in-out infinite alternate;transform-origin:${(x+w/2).toFixed(1)}px 0">
                <polygon points="${x.toFixed(1)},0 ${(x+w).toFixed(1)},0 ${(x+w/2).toFixed(1)},${h.toFixed(1)}"
                         fill="url(#iciGrad)" stroke="rgba(180,225,255,0.3)" stroke-width="0.5"/>
                <circle  cx="${(x+w/2).toFixed(1)}" cy="${(h+3).toFixed(1)}" r="3"
                         fill="rgba(180,225,255,0.5)"
                         style="animation:wxIciDrop ${2+Math.random()}s ${delay}s ease-in infinite"/>
              </g>`;
        }
        svg += `</svg>`;
        el.innerHTML = svg;
        document.body.appendChild(el);
    }

    /* ── AUTUMN decorations ───────────────────────────────── */

    function _spawnPumpkin() {
        const el = document.createElement("div");
        el.id = "wx-pumpkin";
        el.style.cssText = "position:fixed;bottom:0;left:28px;pointer-events:none;z-index:3;";
        el.innerHTML = `
        <svg width="130" height="150" viewBox="0 0 130 150" fill="none" xmlns="http://www.w3.org/2000/svg"
             style="filter:drop-shadow(0 4px 20px rgba(200,80,20,0.2))">
          <style>
            @keyframes wxPumpkinGlow { 0%,100%{opacity:0.7} 50%{opacity:1} }
            @keyframes wxPumpBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
            .wx-pump-g { animation: wxPumpBob 5s ease-in-out infinite; transform-origin: 65px 150px; }
          </style>
          <g class="wx-pump-g">
            <path d="M65 32 Q68 18 78 12 Q72 20 70 32" fill="#4a7a2a" stroke="#3a6020" stroke-width="1"/>
            <path d="M70 28 Q88 10 92 22 Q80 20 70 28Z" fill="#5a8a30" opacity="0.8"/>
            <ellipse cx="35" cy="82" rx="18" ry="48" fill="#d4611a" transform="rotate(-8,35,82)"/>
            <ellipse cx="52" cy="80" rx="22" ry="52" fill="#e07020"/>
            <ellipse cx="65" cy="78" rx="23" ry="54" fill="#e8801a"/>
            <ellipse cx="78" cy="80" rx="22" ry="52" fill="#e07020"/>
            <ellipse cx="95" cy="82" rx="18" ry="48" fill="#d4611a" transform="rotate(8,95,82)"/>
            <path d="M52 30 Q48 78 52 128" stroke="#c05010" stroke-width="2" fill="none" opacity="0.5"/>
            <path d="M78 30 Q82 78 78 128" stroke="#c05010" stroke-width="2" fill="none" opacity="0.5"/>
            <ellipse cx="65" cy="88" rx="30" ry="35" fill="#ff9933" style="animation:wxPumpkinGlow 2s ease-in-out infinite" opacity="0.18"/>
            <polygon points="48,72 56,72 52,62" fill="#1a0a00" opacity="0.85"/>
            <polygon points="74,72 82,72 78,62" fill="#1a0a00" opacity="0.85"/>
            <polygon points="65,78 69,83 65,88 61,83" fill="#1a0a00" opacity="0.85"/>
            <path d="M46 98 L53 92 L58 98 L65 93 L72 98 L77 92 L84 98" stroke="#1a0a00" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.85"/>
            <ellipse cx="65" cy="88" rx="22" ry="26" fill="#ffcc44" style="animation:wxPumpkinGlow 1.8s ease-in-out infinite" opacity="0.08"/>
            <ellipse cx="65" cy="145" rx="44" ry="8" fill="rgba(100,60,20,0.3)"/>
          </g>
        </svg>`;
        document.body.appendChild(el);
    }

    function _spawnSpiderweb() {
        const el = document.createElement("div");
        el.id = "wx-spiderweb";
        el.style.cssText = "position:fixed;top:60px;right:0;pointer-events:none;z-index:3;";
        el.innerHTML = `
        <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg"
             style="opacity:0.55;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.2))">
          <style>
            @keyframes wxSpiderSwing { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(8px) rotate(3deg)} }
            .wx-spider { animation:wxSpiderSwing 3s ease-in-out infinite; transform-origin:90px 0; }
          </style>
          <line x1="160" y1="0" x2="0"   y2="160" stroke="rgba(200,200,200,0.6)" stroke-width="0.8"/>
          <line x1="160" y1="0" x2="60"  y2="160" stroke="rgba(200,200,200,0.6)" stroke-width="0.8"/>
          <line x1="160" y1="0" x2="120" y2="160" stroke="rgba(200,200,200,0.6)" stroke-width="0.8"/>
          <line x1="160" y1="0" x2="160" y2="100" stroke="rgba(200,200,200,0.6)" stroke-width="0.8"/>
          <line x1="160" y1="0" x2="0"   y2="80"  stroke="rgba(200,200,200,0.6)" stroke-width="0.8"/>
          <line x1="160" y1="0" x2="0"   y2="40"  stroke="rgba(200,200,200,0.6)" stroke-width="0.8"/>
          <path d="M160,22 Q120,22 110,60" stroke="rgba(200,200,200,0.5)" stroke-width="0.7" fill="none"/>
          <path d="M160,45 Q108,42 90,100" stroke="rgba(200,200,200,0.5)" stroke-width="0.7" fill="none"/>
          <path d="M160,70 Q96,64 70,138" stroke="rgba(200,200,200,0.5)" stroke-width="0.7" fill="none"/>
          <path d="M155,95 Q84,85 50,160" stroke="rgba(200,200,200,0.5)" stroke-width="0.7" fill="none"/>
          <path d="M145,118 Q68,108 30,160" stroke="rgba(200,200,200,0.5)" stroke-width="0.7" fill="none"/>
          <line x1="90" y1="0" x2="90" y2="52" stroke="rgba(180,180,180,0.7)" stroke-width="0.8"/>
          <g class="wx-spider">
            <ellipse cx="90" cy="58" rx="5" ry="7" fill="#1a1a1a" opacity="0.8"/>
            <ellipse cx="90" cy="52" rx="4" ry="4" fill="#1a1a1a" opacity="0.8"/>
            <circle cx="88" cy="51" r="1" fill="rgba(255,80,80,0.9)"/>
            <circle cx="92" cy="51" r="1" fill="rgba(255,80,80,0.9)"/>
            <line x1="85" y1="54" x2="76" y2="48" stroke="#1a1a1a" stroke-width="0.9" stroke-linecap="round"/>
            <line x1="85" y1="57" x2="75" y2="55" stroke="#1a1a1a" stroke-width="0.9" stroke-linecap="round"/>
            <line x1="85" y1="60" x2="76" y2="62" stroke="#1a1a1a" stroke-width="0.9" stroke-linecap="round"/>
            <line x1="85" y1="63" x2="77" y2="68" stroke="#1a1a1a" stroke-width="0.9" stroke-linecap="round"/>
            <line x1="95" y1="54" x2="104" y2="48" stroke="#1a1a1a" stroke-width="0.9" stroke-linecap="round"/>
            <line x1="95" y1="57" x2="105" y2="55" stroke="#1a1a1a" stroke-width="0.9" stroke-linecap="round"/>
            <line x1="95" y1="60" x2="104" y2="62" stroke="#1a1a1a" stroke-width="0.9" stroke-linecap="round"/>
            <line x1="95" y1="63" x2="103" y2="68" stroke="#1a1a1a" stroke-width="0.9" stroke-linecap="round"/>
          </g>
        </svg>`;
        document.body.appendChild(el);
    }

    /* ── RAIN decorations ─────────────────────────────────── */

    function _spawnUmbrella() {
        const el = document.createElement("div");
        el.id = "wx-umbrella";
        el.style.cssText = "position:fixed;bottom:0;right:28px;pointer-events:none;z-index:3;";
        el.innerHTML = `
        <svg width="120" height="180" viewBox="0 0 120 180" fill="none" xmlns="http://www.w3.org/2000/svg"
             style="filter:drop-shadow(0 4px 14px rgba(100,150,200,0.25))">
          <style>
            @keyframes wxUmbBob { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-7px) rotate(1deg)} }
            .wx-umb-g { animation:wxUmbBob 4s ease-in-out infinite; transform-origin:60px 180px; }
          </style>
          <g class="wx-umb-g">
            <path d="M10 70 Q60 10 110 70" fill="var(--color-accent)" opacity="0.85"/>
            <path d="M10 70 Q35 30 60 25 Q60 50 10 70Z" fill="rgba(255,255,255,0.12)"/>
            <path d="M110 70 Q85 30 60 25 Q60 50 110 70Z" fill="rgba(0,0,0,0.08)"/>
            <line x1="60" y1="24" x2="10"  y2="70" stroke="rgba(255,255,255,0.35)" stroke-width="0.8"/>
            <line x1="60" y1="24" x2="35"  y2="64" stroke="rgba(255,255,255,0.35)" stroke-width="0.8"/>
            <line x1="60" y1="24" x2="60"  y2="70" stroke="rgba(255,255,255,0.35)" stroke-width="0.8"/>
            <line x1="60" y1="24" x2="85"  y2="64" stroke="rgba(255,255,255,0.35)" stroke-width="0.8"/>
            <line x1="60" y1="24" x2="110" y2="70" stroke="rgba(255,255,255,0.35)" stroke-width="0.8"/>
            <path d="M10 70 Q20 78 30 70 Q40 78 50 70 Q60 78 70 70 Q80 78 90 70 Q100 78 110 70"
                  stroke="rgba(255,255,255,0.4)" stroke-width="1.5" fill="none"/>
            <line x1="60" y1="24" x2="60" y2="152" stroke="#5a4a3a" stroke-width="4" stroke-linecap="round"/>
            <path d="M60 152 Q60 168 48 172 Q36 176 36 166" stroke="#5a4a3a" stroke-width="4" stroke-linecap="round" fill="none"/>
            <circle cx="60" cy="86" r="10" fill="#3a3a4a" opacity="0.5"/>
            <path d="M52 96 Q60 130 68 96" fill="#3a3a4a" opacity="0.4"/>
            <line x1="25" y1="10" x2="22" y2="22" stroke="rgba(180,210,240,0.6)" stroke-width="1.2" stroke-linecap="round"/>
            <line x1="45" y1="5"  x2="42" y2="17" stroke="rgba(180,210,240,0.6)" stroke-width="1.2" stroke-linecap="round"/>
            <line x1="80" y1="8"  x2="77" y2="20" stroke="rgba(180,210,240,0.6)" stroke-width="1.2" stroke-linecap="round"/>
            <line x1="100" y1="12" x2="97" y2="24" stroke="rgba(180,210,240,0.6)" stroke-width="1.2" stroke-linecap="round"/>
          </g>
        </svg>`;
        document.body.appendChild(el);
    }

    function _spawnPuddles() {
        const el = document.createElement("div");
        el.id = "wx-puddles";
        el.style.cssText = "position:fixed;bottom:0;left:0;width:100%;height:30px;pointer-events:none;z-index:2;";
        const vw    = window.innerWidth;
        const count = 4 + Math.floor(Math.random() * 3);
        let svg = `<svg width="${vw}" height="30" viewBox="0 0 ${vw} 30" xmlns="http://www.w3.org/2000/svg">`;
        for (let i = 0; i < count; i++) {
            const cx    = 80 + Math.random() * (vw - 160);
            const rx    = 30 + Math.random() * 50;
            const delay = (Math.random() * 2).toFixed(2);
            svg += `
              <ellipse cx="${cx.toFixed(0)}" cy="20" rx="${rx.toFixed(0)}" ry="6"
                       fill="rgba(160,200,230,0.22)" stroke="rgba(160,200,230,0.35)" stroke-width="0.8"/>
              <ellipse cx="${cx.toFixed(0)}" cy="20" rx="${(rx*0.5).toFixed(0)}" ry="3"
                       fill="none" stroke="rgba(180,215,245,0.3)" stroke-width="0.6"
                       style="animation:wxRipple 2s ${delay}s ease-out infinite"/>
              <ellipse cx="${cx.toFixed(0)}" cy="20" rx="${(rx*0.25).toFixed(0)}" ry="1.5"
                       fill="none" stroke="rgba(180,215,245,0.4)" stroke-width="0.5"
                       style="animation:wxRipple 2s ${(parseFloat(delay)+0.5).toFixed(2)}s ease-out infinite"/>`;
        }
        svg += `</svg>`;
        el.innerHTML = svg;
        document.body.appendChild(el);
    }

    /* ── SPRING decorations ───────────────────────────────── */

    function _spawnButterfly() {
        const el = document.createElement("div");
        el.id = "wx-butterfly";
        el.style.cssText = "position:fixed;bottom:60px;left:28px;pointer-events:none;z-index:3;";
        el.innerHTML = `
        <svg width="140" height="120" viewBox="0 0 140 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <style>
            @keyframes wxBflyFlap { 0%,100%{transform:scaleX(1)} 50%{transform:scaleX(0.5)} }
            @keyframes wxBflyFloat {
              0%{transform:translate(0,0) rotate(-3deg)}
              25%{transform:translate(8px,-12px) rotate(2deg)}
              50%{transform:translate(18px,-5px) rotate(-1deg)}
              75%{transform:translate(10px,-18px) rotate(3deg)}
              100%{transform:translate(0,0) rotate(-3deg)}
            }
            .wx-bfly { animation:wxBflyFloat 6s ease-in-out infinite; }
            .wx-wing-l { animation:wxBflyFlap 0.35s ease-in-out infinite; transform-origin:70px 60px; }
            .wx-wing-r { animation:wxBflyFlap 0.35s ease-in-out infinite reverse; transform-origin:70px 60px; }
          </style>
          <g class="wx-bfly">
            <g class="wx-wing-l">
              <path d="M68 58 Q30 20 18 48 Q10 68 68 72Z" fill="rgba(255,160,200,0.75)" stroke="rgba(220,100,160,0.4)" stroke-width="0.8"/>
              <path d="M68 58 Q40 30 28 50" stroke="rgba(220,100,160,0.3)" stroke-width="0.6" fill="none"/>
              <circle cx="38" cy="46" r="5" fill="rgba(255,200,100,0.4)"/>
            </g>
            <g class="wx-wing-r">
              <path d="M72 58 Q110 20 122 48 Q130 68 72 72Z" fill="rgba(180,130,255,0.75)" stroke="rgba(140,80,220,0.4)" stroke-width="0.8"/>
              <path d="M72 58 Q100 30 112 50" stroke="rgba(140,80,220,0.3)" stroke-width="0.6" fill="none"/>
              <circle cx="102" cy="46" r="5" fill="rgba(255,200,100,0.4)"/>
            </g>
            <g class="wx-wing-l">
              <path d="M68 64 Q24 78 26 100 Q30 118 68 92Z" fill="rgba(255,180,100,0.7)" stroke="rgba(220,130,50,0.4)" stroke-width="0.8"/>
            </g>
            <g class="wx-wing-r">
              <path d="M72 64 Q116 78 114 100 Q110 118 72 92Z" fill="rgba(100,210,180,0.7)" stroke="rgba(50,170,140,0.4)" stroke-width="0.8"/>
            </g>
            <ellipse cx="70" cy="72" rx="3.5" ry="18" fill="#3a2a1a" opacity="0.7"/>
            <circle cx="70" cy="53" r="4.5" fill="#3a2a1a" opacity="0.7"/>
            <path d="M68 50 Q58 36 54 28" stroke="#3a2a1a" stroke-width="1" stroke-linecap="round" fill="none" opacity="0.6"/>
            <circle cx="54" cy="28" r="2.5" fill="rgba(255,160,200,0.8)"/>
            <path d="M72 50 Q82 36 86 28" stroke="#3a2a1a" stroke-width="1" stroke-linecap="round" fill="none" opacity="0.6"/>
            <circle cx="86" cy="28" r="2.5" fill="rgba(180,130,255,0.8)"/>
          </g>
        </svg>`;
        document.body.appendChild(el);
    }

    function _spawnRainbow() {
        const el = document.createElement("div");
        el.id = "wx-rainbow";
        el.style.cssText = "position:fixed;top:0;left:0;width:100%;pointer-events:none;z-index:1;opacity:0.18;";
        const vw = window.innerWidth;
        const vh = Math.min(window.innerHeight * 0.55, 400);
        el.innerHTML = `
        <svg width="${vw}" height="${vh}" viewBox="0 0 ${vw} ${vh}" xmlns="http://www.w3.org/2000/svg"
             preserveAspectRatio="none">
          ${["#FF0000","#FF7700","#FFFF00","#00CC00","#0066FF","#8800CC"].map((c, i) => {
              const r = vh - i * 14;
              return `<path d="M0,${vh} A${vw/2},${r} 0 0,1 ${vw},${vh}"
                            fill="none" stroke="${c}" stroke-width="12" opacity="0.7"/>`;
          }).join("")}
        </svg>`;
        document.body.appendChild(el);
    }

    /* ── SUMMER decorations ───────────────────────────────── */

    function _spawnSun() {
        const el = document.createElement("div");
        el.id = "wx-sun";
        el.style.cssText = "position:fixed;top:60px;right:40px;pointer-events:none;z-index:3;";
        el.innerHTML = `
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <style>
            @keyframes wxSunSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
            .wx-sun-rays { animation:wxSunSpin 18s linear infinite; transform-origin:60px 60px; }
          </style>
          <circle cx="60" cy="60" r="42" fill="rgba(255,220,60,0.08)"/>
          <circle cx="60" cy="60" r="34" fill="rgba(255,210,40,0.1)"/>
          <g class="wx-sun-rays">
            ${Array.from({length:12},(_,i)=>{
              const a = (i/12)*Math.PI*2;
              const x1 = (60+32*Math.cos(a)).toFixed(1), y1=(60+32*Math.sin(a)).toFixed(1);
              const x2 = (60+46*Math.cos(a)).toFixed(1), y2=(60+46*Math.sin(a)).toFixed(1);
              return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
                           stroke="rgba(255,200,30,0.7)" stroke-width="${i%3===0?2.5:1.5}" stroke-linecap="round"/>`;
            }).join("")}
          </g>
          <circle cx="60" cy="60" r="26" fill="rgba(255,215,40,0.92)" stroke="rgba(255,180,20,0.5)" stroke-width="1.5"/>
          <circle cx="50" cy="50" r="7" fill="rgba(255,255,255,0.2)"/>
          <circle cx="53" cy="57" r="3" fill="rgba(180,100,20,0.6)"/>
          <circle cx="67" cy="57" r="3" fill="rgba(180,100,20,0.6)"/>
          <path d="M51 66 Q60 73 69 66" stroke="rgba(180,100,20,0.6)" stroke-width="2" stroke-linecap="round" fill="none"/>
        </svg>`;
        document.body.appendChild(el);
    }

    function _spawnBeach() {
        const el = document.createElement("div");
        el.id = "wx-beach";
        el.style.cssText = "position:fixed;bottom:0;left:0;width:100%;pointer-events:none;z-index:2;";
        const vw = window.innerWidth;
        el.innerHTML = `
        <svg width="${vw}" height="70" viewBox="0 0 ${vw} 70" xmlns="http://www.w3.org/2000/svg"
             preserveAspectRatio="none">
          <rect x="0" y="42" width="${vw}" height="28" fill="rgba(240,210,140,0.35)"/>
          <path d="M0,30 Q${vw*0.25},10 ${vw*0.5},30 Q${vw*0.75},50 ${vw},30 L${vw},70 L0,70Z"
                fill="rgba(64,164,223,0.22)"/>
          <path d="M0,38 Q${vw*0.25},22 ${vw*0.5},38 Q${vw*0.75},54 ${vw},38 L${vw},70 L0,70Z"
                fill="rgba(64,164,223,0.14)"/>
          <circle cx="${vw*0.15}" cy="34" r="3" fill="rgba(255,255,255,0.5)"/>
          <circle cx="${vw*0.35}" cy="28" r="2" fill="rgba(255,255,255,0.5)"/>
          <circle cx="${vw*0.6}"  cy="32" r="3" fill="rgba(255,255,255,0.5)"/>
          <circle cx="${vw*0.82}" cy="30" r="2" fill="rgba(255,255,255,0.5)"/>
        </svg>`;
        document.body.appendChild(el);
    }

    /* ── Original decorations ─────────────────────────────── */

    function _spawnLights() {
        const el = document.createElement("div");
        el.id = "wx-lights-canvas";
        el.style.cssText = "position:fixed;top:0;left:0;width:100%;height:28px;pointer-events:none;z-index:9997;overflow:visible;";
        const colors = ["#ff4444","#44ff88","#ffcc00","#44aaff","#ff88cc","#ffffff"];
        const count  = Math.ceil(window.innerWidth / 38);
        let html = `<svg width="${window.innerWidth}" height="28" style="overflow:visible" xmlns="http://www.w3.org/2000/svg">`;
        html += `<path d="M0 8`;
        for (let i = 0; i <= count; i++) {
            const x = i * (window.innerWidth / count);
            html += ` Q${x - 18} 18 ${x} 8 Q${x + 18} 0 ${x + window.innerWidth / count * 0.5} 8`;
        }
        html += `" fill="none" stroke="rgba(0,0,0,0.35)" stroke-width="1.5"/>`;
        for (let i = 0; i < count; i++) {
            const x   = (i + 0.5) * (window.innerWidth / count);
            const col = colors[i % colors.length];
            const delay = (i * 0.15).toFixed(2);
            html += `<g>
                <line x1="${x}" y1="8" x2="${x}" y2="14" stroke="rgba(0,0,0,0.3)" stroke-width="1"/>
                <ellipse cx="${x}" cy="18" rx="5" ry="7" fill="${col}" opacity="0.85"
                  style="animation:wxLightBlink 1.8s ${delay}s ease-in-out infinite alternate"/>
                <ellipse cx="${x}" cy="18" rx="8" ry="10" fill="${col}" opacity="0.12"
                  style="animation:wxLightBlink 1.8s ${delay}s ease-in-out infinite alternate"/>
            </g>`;
        }
        html += `</svg>`;
        el.innerHTML = html;
        document.body.appendChild(el);
    }

    function _spawnLeafCorners() {
        const el = document.createElement("div");
        el.id = "wx-leaf-corners-el";
        el.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2;overflow:hidden;";
        const leaf = `<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 55 C5 20 50 5 55 5 C55 5 20 10 5 55Z" fill="rgba(200,100,30,0.18)"/>
            <path d="M5 55 L55 5 M5 55 L30 18 M5 55 L18 38" stroke="rgba(180,80,20,0.15)" stroke-width="1"/>
        </svg>`;
        el.innerHTML = `
            <div style="position:absolute;top:60px;left:0;width:80px;height:80px;transform:rotate(0deg)">${leaf}</div>
            <div style="position:absolute;top:60px;right:0;width:80px;height:80px;transform:scaleX(-1)">${leaf}</div>
            <div style="position:absolute;bottom:0;left:0;width:90px;height:90px;transform:rotate(90deg)">${leaf}</div>
            <div style="position:absolute;bottom:0;right:0;width:90px;height:90px;transform:rotate(180deg)">${leaf}</div>
        `;
        document.body.appendChild(el);
    }

    function _spawnMist() {
        const el = document.createElement("div");
        el.id = "wx-mist-el";
        el.style.cssText = "position:fixed;bottom:0;left:0;width:100%;height:22vh;pointer-events:none;z-index:1;background:linear-gradient(to top,rgba(150,170,190,0.13),transparent);animation:wxMistDrift 8s ease-in-out infinite alternate;";
        document.body.appendChild(el);
    }

    /* ══════════════════════════════════════════════════════════
       INJECT GLOBAL CSS
    ══════════════════════════════════════════════════════════ */

    function _injectCSS() {
        if (document.getElementById("wx-styles")) return;
        const s = document.createElement("style");
        s.id = "wx-styles";
        s.textContent = `
            .wx-frosted .project-grid-card,
            .wx-frosted .feature-item,
            .wx-frosted .contact-link,
            .wx-frosted .email-form {
                border-color: rgba(200,230,255,0.35) !important;
                box-shadow: 0 0 0 1px rgba(200,230,255,0.12), inset 0 1px 0 rgba(255,255,255,0.08);
            }
            .wx-winter-glow body,
            .wx-winter-glow .hero {
                background-image: radial-gradient(ellipse 70% 50% at 50% 0%, rgba(180,220,255,0.06) 0%, transparent 60%) !important;
            }
            .wx-winter-glow .section-title::after { background: linear-gradient(90deg, #a8d8f0, transparent) !important; }
            .wx-warm-overlay::before {
                content:''; position:fixed; inset:0; pointer-events:none; z-index:0;
                background: radial-gradient(ellipse 120% 80% at 50% 50%, rgba(180,80,20,0.045) 0%, transparent 70%);
            }
            .wx-warm-overlay .section-title { color: #c87040; }
            body.dark-mode .wx-warm-overlay .section-title { color: #e09060; }
            .wx-darker-tone { --color-bg: #eff2f5 !important; }
            body.dark-mode.wx-darker-tone { --color-bg: #0c0e10 !important; }

            @keyframes wxMistDrift { from{opacity:0.7;transform:translateX(0)} to{opacity:1;transform:translateX(12px)} }
            @keyframes wxLightBlink { from{opacity:0.55} to{opacity:1.0} }
            @keyframes wxIciDrip { from{transform:scaleY(1)} to{transform:scaleY(1.12)} }
            @keyframes wxIciDrop {
                0%{opacity:0.6;transform:translateY(0) scale(1)}
                80%{opacity:0.3;transform:translateY(14px) scale(0.7)}
                100%{opacity:0;transform:translateY(20px) scale(0.3)}
            }
            @keyframes wxRipple {
                0%{opacity:0.6;transform:scale(1)} 100%{opacity:0;transform:scale(2.5)}
            }

            /* ── Admin panel additions ── */
            .adm-fx-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
                margin-bottom: 12px;
            }
            @media(max-width:480px){ .adm-fx-grid { grid-template-columns: repeat(2,1fr); } }

            .adm-fx-btn {
                display: flex; flex-direction: column; align-items: center; gap: 5px;
                padding: 11px 6px 9px;
                background: var(--color-light);
                border: 1.5px solid var(--color-border);
                border-radius: 8px;
                cursor: pointer;
                font-family: var(--font-mono);
                font-size: 10px; letter-spacing:.06em; text-transform:uppercase;
                color: var(--color-secondary);
                transition: all .2s ease;
                -webkit-tap-highlight-color:transparent;
                user-select:none;
            }
            .adm-fx-btn:hover { border-color:var(--color-accent); color:var(--color-text); }
            .adm-fx-btn.active {
                border-color: var(--color-accent);
                background: rgba(193,122,90,.12);
                color: var(--color-accent);
                box-shadow: 0 2px 12px rgba(193,122,90,.15);
            }
            .adm-fx-btn .fx-icon { font-size: 22px; line-height:1; }
            .adm-fx-btn .fx-label { line-height:1.2; text-align:center; }

            .adm-fx-decs {
                background: rgba(193,122,90,.05);
                border: 1px solid rgba(193,122,90,.15);
                border-radius: 8px;
                padding: 10px 12px;
                margin-bottom:10px;
                animation: admStageFadeIn .3s ease both;
            }
            .adm-fx-decs-title {
                font-size:9px; letter-spacing:.12em; text-transform:uppercase;
                color:var(--color-secondary); opacity:.6; margin-bottom:8px;
            }
            .adm-fx-dec-row {
                display:flex; justify-content:space-between; align-items:center;
                padding:7px 0; border-bottom:1px solid var(--color-border);
                font-size:13px; color:var(--color-text);
            }
            .adm-fx-dec-row:last-child { border-bottom:none; }

            .adm-density-row {
                padding: 10px 0 6px;
                border-bottom: 1px solid var(--color-border);
            }
            .adm-density-row:last-child { border-bottom: none; }
            .adm-density-lbl {
                display:flex; justify-content:space-between; align-items:center;
                font-size:13px; color:var(--color-text); margin-bottom:7px;
            }
            .adm-density-val {
                font-family:var(--font-mono); font-size:11px;
                color:var(--color-accent); font-weight:700;
            }

            .adm-wx-status {
                display:flex; align-items:center; gap:8px;
                font-size:12px; color:var(--color-secondary);
                padding:8px 0; letter-spacing:.03em;
            }
            .adm-wx-dot {
                width:7px; height:7px; border-radius:50%;
                background:var(--color-border); flex-shrink:0;
                transition: background .4s ease;
            }
            .adm-wx-dot.live { background:#4caf81; animation:admPulse 2s ease-in-out infinite; }
            .adm-wx-dot.error { background:#e05555; }
        `;
        document.head.appendChild(s);
    }

    /* ══════════════════════════════════════════════════════════
       PUBLIC API
    ══════════════════════════════════════════════════════════ */

    function applyEffect(effectKey, decs, density) {
        _currentEffect = effectKey || "none";
        if (density !== undefined) _density = density;
        _stopLoop();
        _applyDecorations(_currentEffect, decs || {});

        if (_currentEffect !== "none") {
            _initCanvas();
            _spawnParticles(_currentEffect);
            _startLoop();
        } else if (_canvas) {
            _ctx.clearRect(0, 0, _canvas.width, _canvas.height);
        }

        document.querySelectorAll(".adm-fx-btn").forEach(b => {
            b.classList.toggle("active", b.dataset.fx === _currentEffect);
        });
        _updateDecPanelVisibility(_currentEffect, decs || {});
    }

    /* ══════════════════════════════════════════════════════════
       COVENTRY WEATHER SYNC
    ══════════════════════════════════════════════════════════ */

    const _wmoToEffect = code => {
        if ([71,73,75,77,85,86].includes(code)) return "snow";
        if ([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)) return "rain";
        return "none";
    };

    async function _fetchWeather() {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${COVENTRY_LAT}&longitude=${COVENTRY_LON}&current_weather=true&timezone=Europe%2FLondon`;
        const res  = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return data.current_weather?.weathercode ?? -1;
    }

    async function pollWeather(saveCallback) {
        const cache = (() => {
            try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"); } catch { return {}; }
        })();
        const stale = !cache.ts || (Date.now() - cache.ts) > POLL_INTERVAL;
        let code = cache.code ?? -1;
        if (stale) {
            try {
                code = await _fetchWeather();
                localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), code }));
                _updateWxStatus("live", `Coventry: WMO ${code}`);
            } catch (e) {
                console.warn("[WX] Fetch failed:", e.message);
                _updateWxStatus("error", "Weather unavailable");
            }
        } else {
            _updateWxStatus("live", `Coventry: WMO ${code} (cached)`);
        }
        const effect = _wmoToEffect(code);
        if (typeof saveCallback === "function") saveCallback(effect);
        return effect;
    }

    function startWeatherSync(saveCallback) {
        stopWeatherSync();
        pollWeather(saveCallback);
        _wxPollTimer = setInterval(() => pollWeather(saveCallback), POLL_INTERVAL);
    }

    function stopWeatherSync() {
        if (_wxPollTimer) { clearInterval(_wxPollTimer); _wxPollTimer = null; }
        _updateWxStatus("off", "Manual mode");
    }

    function _updateWxStatus(state, msg) {
        const dot  = document.getElementById("admWxDot");
        const text = document.getElementById("admWxText");
        if (!dot || !text) return;
        dot.className    = `adm-wx-dot ${state === "live" ? "live" : state === "error" ? "error" : ""}`;
        text.textContent = msg || "";
    }

    /* ══════════════════════════════════════════════════════════
       ADMIN PANEL INJECTION
    ══════════════════════════════════════════════════════════ */

    const FX_BTNS = [
        { key:"none",   icon:"✕",  label:"Off"    },
        { key:"snow",   icon:"❄️",  label:"Snow"   },
        { key:"rain",   icon:"🌧️",  label:"Rain"   },
        { key:"autumn", icon:"🍂",  label:"Autumn" },
        { key:"spring", icon:"🌸",  label:"Spring" },
        { key:"summer", icon:"☀️",  label:"Summer" },
    ];

    const DEC_DEFS = {
        snow:   [
            { key:"frostedBorders",  label:"Frosted Borders" },
            { key:"winterGlow",      label:"Winter Glow" },
            { key:"christmasLights", label:"Christmas Lights 🎄" },
            { key:"snowman",         label:"Snowman ⛄" },
            { key:"icicles",         label:"Icicles 🧊" },
        ],
        rain:   [
            { key:"darkerTone",   label:"Darker Tone" },
            { key:"mistEffect",   label:"Mist Effect" },
            { key:"umbrella",     label:"Umbrella ☂️" },
            { key:"puddles",      label:"Puddle Ripples 💧" },
        ],
        autumn: [
            { key:"warmOverlay",  label:"Warm Overlay" },
            { key:"leafCorners",  label:"Leaf Corners" },
            { key:"pumpkin",      label:"Jack-o-Lantern 🎃" },
            { key:"spiderweb",    label:"Spiderweb 🕸️" },
        ],
        spring: [
            { key:"butterfly",    label:"Butterfly 🦋" },
            { key:"rainbow",      label:"Rainbow 🌈" },
        ],
        summer: [
            { key:"sun",          label:"Animated Sun ☀️" },
            { key:"beach",        label:"Beach Waves 🏖️" },
        ],
    };

    function injectAdminSection(saveConfig, getConfig) {
        const body = document.querySelector(".adm-body");
        if (!body || body.querySelector("#admFxSection")) return;

        const sec = document.createElement("div");
        sec.className = "adm-sec";
        sec.id = "admFxSection";

        const fxBtnsHtml = FX_BTNS.map(b =>
            `<button class="adm-fx-btn" data-fx="${b.key}" title="${b.label}">
                <span class="fx-icon">${b.icon}</span>
                <span class="fx-label">${b.label}</span>
             </button>`
        ).join("");

        sec.innerHTML = `
            <div class="adm-sec-lbl">Visual Effects / Themes</div>
            <div class="adm-fx-grid" id="admFxGrid">${fxBtnsHtml}</div>
            <div id="admFxDecsWrap" style="display:none"></div>
            <div class="adm-sec-lbl" style="margin-top:10px">Coventry Weather Sync</div>
            <div class="adm-trow">
                <span>Live Weather Auto-Match</span>
                <label class="adm-sw">
                    <input type="checkbox" id="admWxSync">
                    <span class="adm-sw-track"><span class="adm-sw-thumb"></span></span>
                </label>
            </div>
            <div class="adm-wx-status">
                <span class="adm-wx-dot" id="admWxDot"></span>
                <span id="admWxText">Manual mode</span>
            </div>
        `;

        const danger = body.querySelector(".adm-sec--danger");
        danger ? body.insertBefore(sec, danger) : body.appendChild(sec);

        const cfg    = getConfig();
        const curFx  = cfg.weatherEffect      || "none";
        const curDec = cfg.weatherDecorations || {};
        const curDen = cfg.weatherDensity     !== undefined ? cfg.weatherDensity : 1.0;
        _density     = curDen;

        document.querySelectorAll(".adm-fx-btn").forEach(b => {
            b.classList.toggle("active", b.dataset.fx === curFx);
            b.addEventListener("click", () => {
                const fx = b.dataset.fx;
                document.querySelectorAll(".adm-fx-btn").forEach(x => x.classList.remove("active"));
                b.classList.add("active");
                const newCfg = saveConfig({ weatherEffect: fx });
                applyEffect(fx, newCfg.weatherDecorations || {}, newCfg.weatherDensity ?? 1.0);
                _rebuildDecPanel(fx, newCfg.weatherDecorations || {}, newCfg.weatherDensity ?? 1.0, saveConfig, getConfig);
            });
        });

        _rebuildDecPanel(curFx, curDec, curDen, saveConfig, getConfig);

        const wxCheck = document.getElementById("admWxSync");
        if (wxCheck) {
            wxCheck.checked = !!cfg.weatherSync;
            if (cfg.weatherSync) startWeatherSync(fx => {
                saveConfig({ weatherEffect: fx });
                applyEffect(fx, getConfig().weatherDecorations || {}, getConfig().weatherDensity ?? 1.0);
            });
            wxCheck.addEventListener("change", e => {
                saveConfig({ weatherSync: e.target.checked });
                if (e.target.checked) {
                    startWeatherSync(fx => {
                        saveConfig({ weatherEffect: fx });
                        applyEffect(fx, getConfig().weatherDecorations || {}, getConfig().weatherDensity ?? 1.0);
                    });
                } else {
                    stopWeatherSync();
                }
            });
        }
    }

    function _rebuildDecPanel(fx, curDec, curDen, saveConfig, getConfig) {
        const wrap = document.getElementById("admFxDecsWrap");
        if (!wrap) return;
        const defs = DEC_DEFS[fx] || [];

        if (!defs.length && fx === "none") { wrap.style.display = "none"; wrap.innerHTML = ""; return; }

        wrap.style.display = "block";

        const densityHtml = fx !== "none" ? `
            <div class="adm-fx-decs" style="margin-bottom:10px">
                <div class="adm-fx-decs-title">Particle Density</div>
                <div class="adm-density-row">
                    <div class="adm-density-lbl">
                        <span>Amount of particles</span>
                        <span class="adm-density-val" id="admDensityVal">${Math.round(curDen * 100)}%</span>
                    </div>
                    <input type="range" id="admDensitySlider" min="5" max="200" value="${Math.round(curDen * 100)}"
                           step="5" class="adm-range-input"/>
                    <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--color-secondary);opacity:.5;margin-top:4px;letter-spacing:.06em;">
                        <span>5% — sparse</span><span>200% — dense</span>
                    </div>
                </div>
            </div>` : "";

        const decRows = defs.map(d => `
            <div class="adm-fx-dec-row">
                <span>${d.label}</span>
                <label class="adm-sw">
                    <input type="checkbox" data-dec="${d.key}" ${curDec[d.key] ? "checked" : ""}>
                    <span class="adm-sw-track"><span class="adm-sw-thumb"></span></span>
                </label>
            </div>
        `).join("");

        const decorHtml = defs.length ? `
            <div class="adm-fx-decs">
                <div class="adm-fx-decs-title">Decorations — ${fx}</div>
                ${decRows}
            </div>` : "";

        wrap.innerHTML = densityHtml + decorHtml;

        const slider   = document.getElementById("admDensitySlider");
        const valLabel = document.getElementById("admDensityVal");
        let densityTimer = null;
        if (slider) {
            slider.addEventListener("input", e => {
                const pct = parseInt(e.target.value, 10);
                if (valLabel) valLabel.textContent = `${pct}%`;
                _density = pct / 100;
                if (_currentEffect !== "none") {
                    _stopLoop();
                    _spawnParticles(_currentEffect);
                    _startLoop();
                }
                clearTimeout(densityTimer);
                densityTimer = setTimeout(() => saveConfig({ weatherDensity: _density }), 400);
            });
        }

        wrap.querySelectorAll("input[data-dec]").forEach(el => {
            el.addEventListener("change", () => {
                const cfg  = getConfig();
                const decs = { ...(cfg.weatherDecorations || {}), [el.dataset.dec]: el.checked };
                const newCfg = saveConfig({ weatherDecorations: decs });
                applyEffect(cfg.weatherEffect || "none", decs, _density);
            });
        });
    }

    function _updateDecPanelVisibility(fx, decs) {
        const wrap = document.getElementById("admFxDecsWrap");
        if (!wrap) return;
        wrap.querySelectorAll("input[data-dec]").forEach(el => {
            el.checked = !!decs[el.dataset.dec];
        });
        const valLabel = document.getElementById("admDensityVal");
        const slider   = document.getElementById("admDensitySlider");
        if (valLabel) valLabel.textContent = `${Math.round(_density * 100)}%`;
        if (slider)   slider.value         = Math.round(_density * 100);
    }

    /* ══════════════════════════════════════════════════════════
       BOOTSTRAP
    ══════════════════════════════════════════════════════════ */

    function _debounce(fn, ms) {
        let t;
        return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
    }

    function init() {
        _injectCSS();

        let _lastInjectedPanel = null;

        const _adminObserver = new MutationObserver(() => {
            const screen = document.getElementById("admMainScreen");
            if (!screen || screen.classList.contains("adm-screen--off")) return;
            const body = document.querySelector(".adm-body");
            if (!body || body === _lastInjectedPanel) return;
            _lastInjectedPanel = body;
            injectAdminSection(_localSave, _localGet);
        });

        _adminObserver.observe(document.body, {
            childList: true, subtree: true, attributes: true, attributeFilter: ["class"],
        });

        const cfg = _localGet();
        const fx  = cfg.weatherEffect      || "none";
        const dec = cfg.weatherDecorations || {};
        const den = cfg.weatherDensity     !== undefined ? cfg.weatherDensity : 1.0;
        _density  = den;
        if (fx !== "none") applyEffect(fx, dec, den);

        if (cfg.weatherSync) {
            startWeatherSync(effect => {
                _localSave({ weatherEffect: effect });
                applyEffect(effect, _localGet().weatherDecorations || {}, _localGet().weatherDensity ?? 1.0);
            });
        }

        const _tryFb = setInterval(() => {
            if (typeof firebase === "undefined" || !window.FIREBASE_ENABLED) return;
            try {
                const db = firebase.apps.length ? firebase.app().database() : null;
                if (!db) return;
                clearInterval(_tryFb);
                db.ref("siteConfig").on("value", snap => {
                    const data = snap.val();
                    if (!data) return;
                    const rfx  = data.weatherEffect      || "none";
                    const rdec = data.weatherDecorations || {};
                    const rden = data.weatherDensity     !== undefined ? data.weatherDensity : 1.0;
                    _density   = rden;
                    applyEffect(rfx, rdec, rden);
                    const scr = document.getElementById("admMainScreen");
                    if (scr && !scr.classList.contains("adm-screen--off")) {
                        document.querySelectorAll(".adm-fx-btn").forEach(b =>
                            b.classList.toggle("active", b.dataset.fx === rfx));
                        _updateDecPanelVisibility(rfx, rdec);
                        const wxCheck = document.getElementById("admWxSync");
                        if (wxCheck) wxCheck.checked = !!data.weatherSync;
                    }
                });
            } catch(e) { clearInterval(_tryFb); }
        }, 500);
    }

    const DEFAULTS_EXT = { weatherEffect:"none", weatherDecorations:{}, weatherSync:false, weatherDensity:1.0 };

    function _localGet() {
        try { return { ...DEFAULTS_EXT, ...JSON.parse(localStorage.getItem("siteConfig") || "{}") }; }
        catch { return { ...DEFAULTS_EXT }; }
    }

    function _localSave(updates) {
        const next = { ..._localGet(), ...updates, _lastUpdated: Date.now() };
        localStorage.setItem("siteConfig", JSON.stringify(next));
        try {
            if (window.FIREBASE_ENABLED && firebase?.apps?.length) {
                firebase.app().database().ref("siteConfig").update({ ...updates, _lastUpdated: Date.now() });
            }
        } catch(e) {}
        return next;
    }

    return { init, applyEffect, pollWeather, startWeatherSync, stopWeatherSync };

})();

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", WeatherEffects.init);
} else {
    WeatherEffects.init();
}