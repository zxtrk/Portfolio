/* ═══════════════════════════════════════════════════════════════
   WEATHER & THEME EFFECTS SYSTEM — weather-effects.js
   Drop-in extension for the existing portfolio admin panel.

   FEATURES
   ─────────
   • Particle canvas for: snow, rain, autumn, spring, summer
   • Per-theme CSS decoration classes (frosted borders, tints, etc.)
   • Optional Christmas lights overlay
   • Real-time Coventry weather sync (Open-Meteo — no API key needed)
   • Admin panel section injection (hooks into existing initAdminPanel)
   • Firebase-backed global persistence + graceful local fallback
   • 15-min weather poll with localStorage caching
   • Respects prefers-reduced-motion

   HOW TO USE
   ──────────
   1. Add  <script src="weather-effects.js"></script>
      AFTER script.js in your HTML.
   2. Done — the system auto-inits after DOMContentLoaded.

   DB SCHEMA ADDITIONS (Firebase Realtime DB)
   ────────────────────────────────────────────
   siteConfig: {
     ...existing fields...,
     weatherEffect: "none" | "snow" | "rain" | "autumn" | "spring" | "summer",
     weatherDecorations: {
       frostedBorders:    bool,
       winterGlow:        bool,
       christmasLights:   bool,
       warmOverlay:       bool,
       leafCorners:       bool,
       darkerTone:        bool,
       mistEffect:        bool
     },
     weatherSync: bool   // sync with Coventry live weather
   }
   ═══════════════════════════════════════════════════════════════ */

"use strict";

const WeatherEffects = (() => {

    /* ── Constants ─────────────────────────────────────────── */
    const COVENTRY_LAT  = 52.4082;
    const COVENTRY_LON  = -1.5109;
    const POLL_INTERVAL = 18 * 60 * 1000;  // 18 minutes
    const CACHE_KEY     = "wx_cache";
    const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ── State ──────────────────────────────────────────────── */
    let _canvas       = null;
    let _ctx          = null;
    let _rafId        = null;
    let _particles    = [];
    let _currentEffect = "none";
    let _decorations  = {};
    let _wxPollTimer  = null;
    let _db           = null;   // assigned from window after Firebase init

    /* ══════════════════════════════════════════════════════════
       PARTICLE DEFINITIONS
       Each effect returns a factory {create, update, draw}
    ══════════════════════════════════════════════════════════ */

    const Effects = {

        snow: {
            particleCount: () => REDUCED_MOTION ? 0 : Math.min(Math.floor(window.innerWidth / 8), 160),
            create() {
                return {
                    x:    Math.random() * window.innerWidth,
                    y:    Math.random() * -window.innerHeight,
                    r:    1.2 + Math.random() * 3.5,
                    vx:   (Math.random() - 0.5) * 0.6,
                    vy:   0.4 + Math.random() * 1.2,
                    op:   0.4 + Math.random() * 0.55,
                    wob:  Math.random() * Math.PI * 2,
                    wobS: 0.008 + Math.random() * 0.012,
                };
            },
            update(p) {
                p.wob += p.wobS;
                p.x  += p.vx + Math.sin(p.wob) * 0.55;
                p.y  += p.vy;
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
            particleCount: () => REDUCED_MOTION ? 0 : Math.min(Math.floor(window.innerWidth / 5), 220),
            create() {
                return {
                    x:  Math.random() * window.innerWidth,
                    y:  Math.random() * -window.innerHeight,
                    len: 8 + Math.random() * 18,
                    vx: -0.8 + Math.random() * 0.3,
                    vy: 9 + Math.random() * 7,
                    op: 0.15 + Math.random() * 0.35,
                };
            },
            update(p) {
                p.x += p.vx;
                p.y += p.vy;
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
            particleCount: () => REDUCED_MOTION ? 0 : 55,
            _shapes: ["M0-8C4-8 8-4 8 0S4 8 0 8-8 4-8 0-4-8 0-8",   // circle
                      "M0-10L3-3 10-3 4 1 6 8 0 4-6 8-4 1-10-3-3-3Z"], // star-ish
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
                p.wob += p.wobS;
                p.rot += p.rotS;
                p.x  += p.vx + Math.sin(p.wob) * 0.9;
                p.y  += p.vy;
                if (p.y > window.innerHeight + 20) { p.y = -20; p.x = Math.random() * window.innerWidth; }
            },
            draw(ctx, p) {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                ctx.globalAlpha = p.op;
                // Simple leaf shape
                ctx.beginPath();
                ctx.moveTo(0, -p.r);
                ctx.bezierCurveTo( p.r * 0.8,  -p.r * 0.5,  p.r,  p.r * 0.4,  0,  p.r);
                ctx.bezierCurveTo(-p.r,          p.r * 0.4, -p.r * 0.8, -p.r * 0.5, 0, -p.r);
                ctx.fillStyle = p.color;
                ctx.fill();
                ctx.restore();
                ctx.globalAlpha = 1;
            },
        },

        spring: {
            particleCount: () => REDUCED_MOTION ? 0 : 70,
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
                p.wob += p.wobS;
                p.rot += p.rotS;
                p.x  += p.vx + Math.cos(p.wob) * 0.7;
                p.y  += p.vy;
                if (p.y > window.innerHeight + 20) { p.y = -20; p.x = Math.random() * window.innerWidth; }
            },
            draw(ctx, p) {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                ctx.globalAlpha = p.op;
                // 5-petal flower
                for (let i = 0; i < 5; i++) {
                    ctx.save();
                    ctx.rotate((i / 5) * Math.PI * 2);
                    ctx.beginPath();
                    ctx.ellipse(0, -p.r * 0.65, p.r * 0.45, p.r * 0.7, 0, 0, Math.PI * 2);
                    ctx.fillStyle = p.color;
                    ctx.fill();
                    ctx.restore();
                }
                // centre
                ctx.beginPath();
                ctx.arc(0, 0, p.r * 0.28, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,230,100,0.9)`;
                ctx.fill();
                ctx.restore();
                ctx.globalAlpha = 1;
            },
        },

        summer: {
            particleCount: () => REDUCED_MOTION ? 0 : 50,
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
                ctx.fillStyle = grd;
                ctx.fill();
            },
        },
    };

    /* ══════════════════════════════════════════════════════════
       CANVAS SETUP & RENDER LOOP
    ══════════════════════════════════════════════════════════ */

    function _initCanvas() {
        if (_canvas) return;
        _canvas = document.createElement("canvas");
        _canvas.id = "wx-canvas";
        _canvas.style.cssText = [
            "position:fixed", "inset:0", "width:100%", "height:100%",
            "pointer-events:none", "z-index:0",
            "will-change:transform", "opacity:1",
        ].join(";");
        document.body.insertBefore(_canvas, document.body.firstChild);
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
        const count = eff.particleCount();
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

    function _applyDecorations(effect, decs) {
        // Remove all previous decoration classes
        const toRemove = [
            "wx-frosted","wx-winter-glow","wx-warm-overlay",
            "wx-leaf-corners","wx-darker-tone","wx-mist",
        ];
        document.documentElement.classList.remove(...toRemove);
        document.getElementById("wx-lights-canvas")?.remove();
        document.getElementById("wx-leaf-corners-el")?.remove();
        document.getElementById("wx-mist-el")?.remove();

        if (!decs) return;

        if (effect === "snow") {
            if (decs.frostedBorders)  document.documentElement.classList.add("wx-frosted");
            if (decs.winterGlow)      document.documentElement.classList.add("wx-winter-glow");
            if (decs.christmasLights) _spawnLights();
        }
        if (effect === "autumn") {
            if (decs.warmOverlay)  document.documentElement.classList.add("wx-warm-overlay");
            if (decs.leafCorners)  _spawnLeafCorners();
        }
        if (effect === "rain") {
            if (decs.darkerTone)  document.documentElement.classList.add("wx-darker-tone");
            if (decs.mistEffect)  _spawnMist();
        }
    }

    function _spawnLights() {
        const el = document.createElement("div");
        el.id = "wx-lights-canvas";
        el.style.cssText = "position:fixed;top:0;left:0;width:100%;height:28px;pointer-events:none;z-index:9997;overflow:visible;";
        const colors = ["#ff4444","#44ff88","#ffcc00","#44aaff","#ff88cc","#ffffff"];
        const count  = Math.ceil(window.innerWidth / 38);
        let html = `<svg width="${window.innerWidth}" height="28" style="overflow:visible" xmlns="http://www.w3.org/2000/svg">`;
        // Wire
        html += `<path d="M0 8`;
        for (let i = 0; i <= count; i++) {
            const x = i * (window.innerWidth / count);
            html += ` Q${x - 18} 18 ${x} 8 Q${x + 18} 0 ${x + window.innerWidth / count * 0.5} 8`;
        }
        html += `" fill="none" stroke="rgba(0,0,0,0.35)" stroke-width="1.5"/>`;
        // Bulbs
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
            /* ── Decoration: frosted borders ── */
            .wx-frosted .project-grid-card,
            .wx-frosted .feature-item,
            .wx-frosted .contact-link,
            .wx-frosted .email-form {
                border-color: rgba(200,230,255,0.35) !important;
                box-shadow: 0 0 0 1px rgba(200,230,255,0.12), inset 0 1px 0 rgba(255,255,255,0.08);
            }

            /* ── Decoration: winter glow ── */
            .wx-winter-glow body,
            .wx-winter-glow .hero {
                background-image: radial-gradient(ellipse 70% 50% at 50% 0%, rgba(180,220,255,0.06) 0%, transparent 60%) !important;
            }
            .wx-winter-glow .section-title::after { background: linear-gradient(90deg, #a8d8f0, transparent) !important; }

            /* ── Decoration: autumn warm overlay ── */
            .wx-warm-overlay::before {
                content:'';
                position:fixed; inset:0; pointer-events:none; z-index:0;
                background: radial-gradient(ellipse 120% 80% at 50% 50%, rgba(180,80,20,0.045) 0%, transparent 70%);
            }
            .wx-warm-overlay .section-title { color: #c87040; }
            body.dark-mode .wx-warm-overlay .section-title { color: #e09060; }

            /* ── Decoration: rain darker tone ── */
            .wx-darker-tone {
                --color-bg: #eff2f5 !important;
            }
            body.dark-mode.wx-darker-tone {
                --color-bg: #0c0e10 !important;
            }

            /* ── Decoration: mist drift ── */
            @keyframes wxMistDrift {
                from { opacity:0.7; transform:translateX(0); }
                to   { opacity:1;   transform:translateX(12px); }
            }

            /* ── Christmas lights blink ── */
            @keyframes wxLightBlink {
                from { opacity:0.55; }
                to   { opacity:1.0; }
            }

            /* ── Admin panel section styles ── */
            .adm-fx-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
                margin-bottom: 12px;
            }
            @media(max-width:480px){ .adm-fx-grid { grid-template-columns: repeat(2,1fr); } }

            .adm-fx-btn {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;
                padding: 11px 6px 9px;
                background: var(--color-light);
                border: 1.5px solid var(--color-border);
                border-radius: 8px;
                cursor: pointer;
                font-family: var(--font-mono);
                font-size: 10px;
                letter-spacing: .06em;
                text-transform: uppercase;
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
       PUBLIC API — apply an effect + decorations
    ══════════════════════════════════════════════════════════ */

    function applyEffect(effectKey, decs) {
        _currentEffect = effectKey || "none";
        _stopLoop();
        _applyDecorations(_currentEffect, decs || {});

        if (_currentEffect !== "none") {
            _initCanvas();
            _spawnParticles(_currentEffect);
            _startLoop();
        } else if (_canvas) {
            _ctx.clearRect(0, 0, _canvas.width, _canvas.height);
        }

        // Sync highlight in admin panel if open
        document.querySelectorAll(".adm-fx-btn").forEach(b => {
            b.classList.toggle("active", b.dataset.fx === _currentEffect);
        });
        _updateDecPanelVisibility(_currentEffect, decs || {});
    }

    /* ══════════════════════════════════════════════════════════
       COVENTRY WEATHER SYNC
       Uses Open-Meteo (free, no API key).
       WMO codes → effect mapping.
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
        dot.className  = `adm-wx-dot ${state === "live" ? "live" : state === "error" ? "error" : ""}`;
        text.textContent = msg || "";
    }

    /* ══════════════════════════════════════════════════════════
       ADMIN PANEL INJECTION
       Called once the main admin panel's DOM exists.
    ══════════════════════════════════════════════════════════ */

    const FX_BTNS = [
        { key:"none",   icon:"✕", label:"Off" },
        { key:"snow",   icon:"❄️", label:"Snow" },
        { key:"rain",   icon:"🌧️", label:"Rain" },
        { key:"autumn", icon:"🍂", label:"Autumn" },
        { key:"spring", icon:"🌸", label:"Spring" },
        { key:"summer", icon:"☀️", label:"Summer" },
    ];

    const DEC_DEFS = {
        snow:   [
            { key:"frostedBorders",  label:"Frosted Borders" },
            { key:"winterGlow",      label:"Winter Glow" },
            { key:"christmasLights", label:"Christmas Lights 🎄" },
        ],
        rain:   [
            { key:"darkerTone",   label:"Darker Tone" },
            { key:"mistEffect",   label:"Mist Effect" },
        ],
        autumn: [
            { key:"warmOverlay",  label:"Warm Overlay" },
            { key:"leafCorners",  label:"Leaf Corners" },
        ],
        spring: [],
        summer: [],
    };

    function injectAdminSection(saveConfig, getConfig) {
        const body = document.querySelector(".adm-body");
        if (!body) return;
        // Section already in this exact DOM instance — skip
        if (body.querySelector("#admFxSection")) return;

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

        // Insert before danger zone
        const danger = body.querySelector(".adm-sec--danger");
        danger ? body.insertBefore(sec, danger) : body.appendChild(sec);

        // Load current config
        const cfg = getConfig();
        const curFx  = cfg.weatherEffect    || "none";
        const curDec = cfg.weatherDecorations || {};
        const curSync= !!cfg.weatherSync;

        document.querySelectorAll(".adm-fx-btn").forEach(b => {
            b.classList.toggle("active", b.dataset.fx === curFx);
            b.addEventListener("click", () => {
                const fx = b.dataset.fx;
                document.querySelectorAll(".adm-fx-btn").forEach(x => x.classList.remove("active"));
                b.classList.add("active");
                const newCfg = saveConfig({ weatherEffect: fx });
                applyEffect(fx, newCfg.weatherDecorations || {});
                _rebuildDecPanel(fx, newCfg.weatherDecorations || {}, saveConfig, getConfig);
            });
        });

        _rebuildDecPanel(curFx, curDec, saveConfig, getConfig);

        const wxCheck = document.getElementById("admWxSync");
        if (wxCheck) {
            wxCheck.checked = curSync;
            if (curSync) startWeatherSync(fx => {
                saveConfig({ weatherEffect: fx });
                applyEffect(fx, getConfig().weatherDecorations || {});
            });
            wxCheck.addEventListener("change", e => {
                saveConfig({ weatherSync: e.target.checked });
                if (e.target.checked) {
                    startWeatherSync(fx => {
                        saveConfig({ weatherEffect: fx });
                        applyEffect(fx, getConfig().weatherDecorations || {});
                    });
                } else {
                    stopWeatherSync();
                }
            });
        }
    }

    function _rebuildDecPanel(fx, curDec, saveConfig, getConfig) {
        const wrap = document.getElementById("admFxDecsWrap");
        if (!wrap) return;
        const defs = DEC_DEFS[fx] || [];
        if (!defs.length) { wrap.style.display = "none"; wrap.innerHTML = ""; return; }

        wrap.style.display = "block";
        const rows = defs.map(d => `
            <div class="adm-fx-dec-row">
                <span>${d.label}</span>
                <label class="adm-sw">
                    <input type="checkbox" data-dec="${d.key}" ${curDec[d.key] ? "checked" : ""}>
                    <span class="adm-sw-track"><span class="adm-sw-thumb"></span></span>
                </label>
            </div>
        `).join("");

        wrap.innerHTML = `
            <div class="adm-fx-decs">
                <div class="adm-fx-decs-title">Decorations — ${fx}</div>
                ${rows}
            </div>`;

        wrap.querySelectorAll("input[data-dec]").forEach(el => {
            el.addEventListener("change", () => {
                const cfg    = getConfig();
                const decs   = { ...(cfg.weatherDecorations || {}), [el.dataset.dec]: el.checked };
                const newCfg = saveConfig({ weatherDecorations: decs });
                applyEffect(cfg.weatherEffect || "none", decs);
            });
        });
    }

    function _updateDecPanelVisibility(fx, decs) {
        const wrap = document.getElementById("admFxDecsWrap");
        if (!wrap) return;
        const defs = DEC_DEFS[fx] || [];
        if (!defs.length) { wrap.style.display = "none"; return; }
        wrap.style.display = "block";
        // Sync checkboxes
        wrap.querySelectorAll("input[data-dec]").forEach(el => {
            el.checked = !!decs[el.dataset.dec];
        });
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

        // Watch for the admin panel to open (and reopen after close).
        // The existing panel removes its DOM on close, so we can't use a
        // one-shot check — instead we use a MutationObserver on document.body
        // that fires whenever children are added or class attributes change.
        // Each time admMainScreen appears without adm-screen--off we reinject.

        let _lastInjectedPanel = null; // track which panel instance we injected into

        const _adminObserver = new MutationObserver(() => {
            const screen = document.getElementById("admMainScreen");
            if (!screen) return;
            if (screen.classList.contains("adm-screen--off")) return;

            // The panel DOM was destroyed and recreated — reinject every time
            // admMainScreen is present and visible.
            const body = document.querySelector(".adm-body");
            if (!body) return;
            if (body === _lastInjectedPanel) return; // already injected into this instance
            _lastInjectedPanel = body;

            injectAdminSection(_localSave, _localGet);
        });

        _adminObserver.observe(document.body, {
            childList: true,      // catches panel being added / removed
            subtree: true,        // catches class changes deep in the tree
            attributes: true,     // catches adm-screen--off being removed
            attributeFilter: ["class"],
        });

        // Apply persisted effect immediately on page load.
        const cfg = _localGet();
        const fx  = cfg.weatherEffect || "none";
        const dec = cfg.weatherDecorations || {};
        if (fx !== "none") applyEffect(fx, dec);

        // Restore weather sync if it was on
        if (cfg.weatherSync) {
            startWeatherSync(effect => {
                _localSave({ weatherEffect: effect });
                applyEffect(effect, _localGet().weatherDecorations || {});
            });
        }

        // Also hook Firebase once it's ready
        const _tryFb = setInterval(() => {
            if (typeof firebase === "undefined" || !window.FIREBASE_ENABLED) return;
            try {
                const db = firebase.apps.length
                    ? firebase.app().database()
                    : null;
                if (!db) return;
                clearInterval(_tryFb);
                db.ref("siteConfig").on("value", snap => {
                    const data = snap.val();
                    if (!data) return;
                    const rfx  = data.weatherEffect    || "none";
                    const rdec = data.weatherDecorations || {};
                    applyEffect(rfx, rdec);
                    // Reinject admin panel state if open
                    const scr = document.getElementById("admMainScreen");
                    if (scr && !scr.classList.contains("adm-screen--off")) {
                        // Sync FX buttons
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

    /* ── Local config shim (mirrors existing admin pattern) ── */
    const DEFAULTS_EXT = { weatherEffect:"none", weatherDecorations:{}, weatherSync:false };

    function _localGet() {
        try { return { ...DEFAULTS_EXT, ...JSON.parse(localStorage.getItem("siteConfig") || "{}") }; }
        catch { return { ...DEFAULTS_EXT }; }
    }

    function _localSave(updates) {
        const next = { ..._localGet(), ...updates, _lastUpdated: Date.now() };
        localStorage.setItem("siteConfig", JSON.stringify(next));
        // Push to Firebase if available
        try {
            if (window.FIREBASE_ENABLED && firebase?.apps?.length) {
                firebase.app().database().ref("siteConfig").update({ ...updates, _lastUpdated: Date.now() });
            }
        } catch(e) {}
        return next;
    }

    /* ── Public surface ── */
    return { init, applyEffect, pollWeather, startWeatherSync, stopWeatherSync };

})();

/* Auto-init after DOM is ready */
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", WeatherEffects.init);
} else {
    WeatherEffects.init();
}