/* ═══════════════════════════════════════════════════════════════
   PORTFOLIO — script.js
   Includes: site logic + hidden admin panel (type "hitman2" / triple-tap footer)
   ═══════════════════════════════════════════════════════════════ */

"use strict";

// ─── PROJECT DATA ─────────────────────────────────────────────────────
const projects = [
    {
        title: "Temporary Removed",
        description: "Project has been temporarily removed due to issues with the code — last updated 14/02/26",
        tags: ["HTML", "CSS", "JavaScript"],
        pageUrl: "404.html",
        imageUrl: "",
        year: "202?",
        index: "01",
    },
    {
        title: "Coming Soon",
        description: "A new project is currently in development. Something interesting is on the way — check back soon.",
        tags: ["In Progress"],
        pageUrl: null,
        imageUrl: "",
        year: "202?",
        index: "02",
    },
    {
        title: "Coming Soon",
        description: "A new project is currently in development. Something interesting is on the way — check back soon.",
        tags: ["Not Started"],
        pageUrl: null,
        imageUrl: "",
        year: "202?",
        index: "03",
    },
];

// ─── QUOTE DATA ────────────────────────────────────────────────────────
const dailyQuotes = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
    { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
    { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
    { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler" },
    { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
    { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
    { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
    { text: "Technology is best when it brings people together.", author: "Matt Mullenweg" },
    { text: "The function of good software is to make the complex appear to be simple.", author: "Grady Booch" },
    { text: "Perfection is achieved not when there is nothing more to add, but rather when there is nothing more to take away.", author: "Antoine de Saint-Exupery" },
    { text: "I have no special talents. I am only passionately curious.", author: "Albert Einstein" },
    { text: "Continuous improvement is better than delayed perfection.", author: "Mark Twain" },
    { text: "Programs must be written for people to read, and only incidentally for machines to execute.", author: "Harold Abelson" },
    { text: "The most disastrous thing that you can ever learn is your first programming language.", author: "Alan Kay" },
    { text: "Software is a great combination between artistry and engineering.", author: "Bill Gates" },
    { text: "Good design is as little design as possible.", author: "Dieter Rams" },
    { text: "Debugging is twice as hard as writing the code in the first place.", author: "Brian Kernighan" },
    { text: "Every great developer you know got there by solving problems they were unqualified to solve until they actually did it.", author: "Patrick McKenzie" },
    { text: "Walking on water and developing software from a specification are easy if both are frozen.", author: "Edward V. Berard" },
    { text: "The best error message is the one that never shows up.", author: "Thomas Fuchs" },
    { text: "Don't comment bad code — rewrite it.", author: "Brian Kernighan" },
    { text: "Experience is the name everyone gives to their mistakes.", author: "Oscar Wilde" },
    { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
    { text: "Design is not just what it looks like and feels like. Design is how it works.", author: "Steve Jobs" },
    { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
    { text: "It's not a bug - it's an undocumented feature.", author: "Anonymous" },
    { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
    { text: "Learning to write programs stretches your mind and helps you think better.", author: "Bill Gates" },
    { text: "The computer was born to solve problems that did not exist before.", author: "Bill Gates" },
];

/* ═══════════════════════════════════════════════════════════════
   SOUND ENGINE
   One sound only: the admin panel open chime.
   A refined two-note ascending perfect fifth (G4 -> D5) with
   soft harmonics and a reverb tail — clean, modern, premium.
   ═══════════════════════════════════════════════════════════════ */
const SoundEngine = (() => {
    let ctx = null;
    let _adminSoundPlayed = false;
    let _pendingQueue = [];
    let _unlockListenersAdded = false;

    function _ensureCtx() {
        if (ctx) return ctx;
        try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
        return ctx;
    }

    function _addUnlockListeners() {
        if (_unlockListenersAdded) return;
        _unlockListenersAdded = true;
        const handler = () => {
            _ensureCtx();
            if (!ctx) return;
            ctx.resume().then(() => {
                const q = _pendingQueue.splice(0);
                q.forEach(fn => { try { fn(); } catch (e) {} });
            });
        };
        ["mousedown", "touchstart", "keydown", "pointerdown"].forEach(ev =>
            document.addEventListener(ev, handler, { once: true, passive: true })
        );
    }

    function _whenReady(fn) {
        _ensureCtx();
        if (!ctx) return;
        if (ctx.state === "running") {
            try { fn(); } catch (e) {}
        } else {
            _pendingQueue.push(fn);
            ctx.resume().then(() => {
                const idx = _pendingQueue.indexOf(fn);
                if (idx !== -1) {
                    _pendingQueue.splice(idx, 1);
                    try { fn(); } catch (e) {}
                }
            }).catch(() => {});
        }
    }

    /*
     * ADMIN OPEN — premium access chime
     *
     * Two-note ascending interval: G4 (392 Hz) -> D5 (587 Hz), a
     * perfect fifth. Each note is built from a fundamental + gentle
     * harmonics to give it body without harshness. A lightweight
     * reverb simulation (delayed copies at low volume) adds air and
     * space. Master gain is kept very low — noticeable but discreet.
     */
    function _playAdminOpen(ac) {
        const t = ac.currentTime + 0.04;

        // Master output gain — quiet overall
        const master = ac.createGain();
        master.gain.setValueAtTime(0.11, t);

        const comp = ac.createDynamicsCompressor();
        comp.threshold.value = -18;
        comp.knee.value = 10;
        comp.ratio.value = 3;
        comp.attack.value = 0.004;
        comp.release.value = 0.22;
        comp.connect(ac.destination);
        master.connect(comp);

        // Build one chime note with harmonics + reverb tail
        function chimeNote(freq, start, vol, decay) {
            // Harmonics: fundamental, 2nd (quiet), 3rd (very quiet)
            [[1, 1.0], [2, 0.15], [3, 0.04]].forEach(([mult, rel]) => {
                const osc  = ac.createOscillator();
                const gain = ac.createGain();
                osc.type = "sine";
                osc.frequency.value = freq * mult;
                osc.connect(gain);
                gain.connect(master);
                gain.gain.setValueAtTime(0, start);
                gain.gain.linearRampToValueAtTime(vol * rel, start + 0.007);
                gain.gain.exponentialRampToValueAtTime(vol * rel * 0.35, start + 0.14);
                gain.gain.exponentialRampToValueAtTime(0.0001, start + decay);
                osc.start(start);
                osc.stop(start + decay + 0.05);
            });

            // Reverb tail — two delayed echo copies
            [0.05, 0.095].forEach((delayT, i) => {
                const osc  = ac.createOscillator();
                const dly  = ac.createDelay(0.5);
                const gain = ac.createGain();
                osc.type = "sine";
                osc.frequency.value = freq;
                dly.delayTime.value = delayT;
                osc.connect(dly);
                dly.connect(gain);
                gain.connect(master);
                const rv = vol * (i === 0 ? 0.14 : 0.07);
                gain.gain.setValueAtTime(0, start);
                gain.gain.linearRampToValueAtTime(rv, start + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.0001, start + decay * 0.7);
                osc.start(start);
                osc.stop(start + decay + 0.05);
            });
        }

        // Note 1: G4 — the "open" arrival
        chimeNote(392.00, t,        1.0, 1.5);

        // Note 2: D5 — the resolving rise (slight delay, slightly louder)
        chimeNote(587.33, t + 0.19, 1.1, 1.9);

        // High shimmer on note 2 for a clean, airy presence
        const shimOsc  = ac.createOscillator();
        const shimGain = ac.createGain();
        shimOsc.type = "sine";
        shimOsc.frequency.setValueAtTime(1174.66, t + 0.19); // D6
        shimOsc.frequency.exponentialRampToValueAtTime(1210, t + 0.55);
        shimGain.gain.setValueAtTime(0, t + 0.19);
        shimGain.gain.linearRampToValueAtTime(0.018, t + 0.23);
        shimGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.15);
        shimOsc.connect(shimGain);
        shimGain.connect(master);
        shimOsc.start(t + 0.19);
        shimOsc.stop(t + 1.25);
    }

    function playAdminOpen() {
        if (_adminSoundPlayed) return;
        _adminSoundPlayed = true;
        _whenReady(() => { if (ctx) _playAdminOpen(ctx); });
    }

    function resetAdminSoundGuard() { _adminSoundPlayed = false; }

    _ensureCtx();
    _addUnlockListeners();

    return { playAdminOpen, resetAdminSoundGuard };
})();

/* ═══════════════════════════════════════════════════════════════
   FLOATING IMAGE SYSTEM
   ═══════════════════════════════════════════════════════════════ */
const FloatingImageSystem = (() => {
    const floaters = new Map();
    let _db = null;
    let _dragging = null;
    let _globalHandlersReady = false;

    function getSize() {
        return window.innerWidth <= 768 ? 180 : 340;
    }

    function setupGlobalHandlers() {
        if (_globalHandlersReady) return;
        _globalHandlersReady = true;

        const move = (cx, cy) => {
            if (!_dragging) return;
            const f = _dragging;
            const size = getSize();
            const now = performance.now();
            const dt = now - f._lastT;
            if (dt > 0) {
                f._velX = (cx - f._lastX) / dt * 16;
                f._velY = (cy - f._lastY) / dt * 16;
            }
            f._lastX = cx; f._lastY = cy; f._lastT = now;
            f.x = Math.max(0, Math.min(window.innerWidth - size, cx - f._dragOffX));
            f.y = Math.max(0, Math.min(window.innerHeight - 80, cy - f._dragOffY));
            const tilt = Math.max(-18, Math.min(18, f._velX * 0.35));
            f.el.style.transform = `translate(${f.x}px,${f.y}px) rotate(${tilt}deg) scale(1.06)`;
        };

        const up = () => {
            if (!_dragging) return;
            const f = _dragging;
            f.vx = f._velX * 0.65;
            f.vy = f._velY * 0.65;
            f.dragging = false;
            f.el.style.cursor = "grab";
            f.el.style.filter = "drop-shadow(0 10px 36px rgba(0,0,0,0.32))";
            f.el.style.zIndex = "9999990";
            _dragging = null;
        };

        document.addEventListener("mousemove", e => move(e.clientX, e.clientY));
        document.addEventListener("mouseup", up);
        document.addEventListener("touchmove", e => {
            if (!_dragging) return;
            e.preventDefault();
            move(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: false });
        document.addEventListener("touchend", up);
        document.addEventListener("touchcancel", up);
    }

    function init(db) {
        _db = db;
        if (!_db) return;
        _db.ref("funnyImages").on("child_added", snap => {
            if (!floaters.has(snap.key)) spawnFloater(snap.key, snap.val().src);
        });
        _db.ref("funnyImages").on("child_removed", snap => {
            dismiss(snap.key);
        });
    }

    async function add(rawSrc) {
        const src = await _compressImage(rawSrc, 420, 0.74);
        if (_db) {
            _db.ref("funnyImages").push({ src, ts: Date.now() });
        } else {
            spawnFloater("local_" + Date.now(), src);
        }
    }

    function clearAll() {
        if (_db) {
            _db.ref("funnyImages").remove();
        } else {
            [...floaters.keys()].forEach(dismiss);
        }
    }

    function _compressImage(src, maxDim, quality) {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => {
                try {
                    const ratio = Math.min(1, maxDim / Math.max(img.width, img.height));
                    const canvas = document.createElement("canvas");
                    canvas.width  = Math.round(img.width  * ratio);
                    canvas.height = Math.round(img.height * ratio);
                    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL("image/jpeg", quality));
                } catch { resolve(src); }
            };
            img.onerror = () => resolve(src);
            img.src = src;
        });
    }

    function spawnFloater(key, src) {
        setupGlobalHandlers();
        const size = getSize();
        const el = document.createElement("div");
        el.style.cssText = `
            position:fixed; left:0; top:0; width:${size}px; z-index:9999990;
            pointer-events:none; cursor:grab;
            user-select:none; -webkit-user-select:none; touch-action:none;
            filter:drop-shadow(0 10px 36px rgba(0,0,0,0.32));
            will-change:transform; opacity:0;
        `;
        const img = document.createElement("img");
        img.src = src;
        img.draggable = false;
        img.style.cssText = `width:100%; height:auto; display:block; border-radius:16px; pointer-events:none;`;
        el.appendChild(img);
        document.body.appendChild(el);

        if (!document.getElementById("fis-css")) {
            const style = document.createElement("style");
            style.id = "fis-css";
            style.textContent = `
                @keyframes fisBloomSpin {
                    0%   { transform: scale(0.05) rotate(-180deg); opacity: 0; }
                    18%  { opacity: 1; }
                    55%  { transform: scale(1.12) rotate(12deg); }
                    75%  { transform: scale(0.94) rotate(-4deg); }
                    90%  { transform: scale(1.04) rotate(2deg); }
                    100% { transform: scale(1.00) rotate(0deg); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        const f = {
            key, el, x: 0, y: 0, vx: 0, vy: 0,
            dragging: false, alive: true, phase: "entry", floatT: 0,
            _dragOffX: 0, _dragOffY: 0, _velX: 0, _velY: 0, _lastX: 0, _lastY: 0, _lastT: 0,
        };
        floaters.set(key, f);

        el.addEventListener("mousedown", e => {
            if (f.phase !== "floating") return;
            e.preventDefault();
            _startDrag(f, e.clientX, e.clientY);
        });
        el.addEventListener("touchstart", e => {
            if (f.phase !== "floating") return;
            e.preventDefault();
            _startDrag(f, e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: false });

        _runEntryAnimation(f, img, size);
    }

    function _startDrag(f, cx, cy) {
        _dragging = f;
        f.dragging = true;
        f._dragOffX = cx - f.x; f._dragOffY = cy - f.y;
        f._lastX = cx; f._lastY = cy; f._lastT = performance.now();
        f._velX = 0; f._velY = 0;
        f.el.style.cursor = "grabbing";
        f.el.style.filter = "drop-shadow(0 20px 56px rgba(0,0,0,0.45))";
        f.el.style.zIndex = "9999996";
    }

    function _runEntryAnimation(f, imgEl, size) {
        const vw = window.innerWidth, vh = window.innerHeight;
        const bloomX = vw * 0.5  - size * 0.5 + (Math.random() - 0.5) * vw * 0.18;
        const bloomY = vh * 0.42 - size * 0.5 + (Math.random() - 0.5) * vh * 0.12;
        const pad = size * 0.15;
        const finalX = pad + Math.random() * (vw - size - pad * 2);
        const finalY = 90  + Math.random() * (vh - size - 200);
        const DURATION = 2000;
        const start = performance.now();
        const easeOut = t => 1 - Math.pow(1 - t, 3);
        const easeSpring = t => {
            const c4 = (2 * Math.PI) / 3;
            if (t === 0) return 0; if (t === 1) return 1;
            return Math.pow(2, -9 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
        };
        const lerp = (a, b, t) => a + (b - a) * t;
        const PHASE_SPLIT = 0.42;
        imgEl.style.animation = `fisBloomSpin ${DURATION * PHASE_SPLIT}ms cubic-bezier(0.34,1.56,0.64,1) both`;
        f.el.style.opacity = "1";
        f.el.style.transform = `translate(${bloomX}px,${bloomY}px) scale(0.05)`;
        const tick = (now) => {
            if (!f.alive) return;
            const prog = Math.min((now - start) / DURATION, 1);
            if (prog < PHASE_SPLIT) {
                const sc = easeOut(prog / PHASE_SPLIT);
                f.el.style.transform = `translate(${bloomX}px,${bloomY}px) scale(${sc})`;
            } else {
                const sp = easeSpring((prog - PHASE_SPLIT) / (1 - PHASE_SPLIT));
                const x = lerp(bloomX, finalX, sp), y = lerp(bloomY, finalY, sp);
                const tilt = lerp(0, (finalX - bloomX > 0 ? 6 : -6), Math.sin((prog - PHASE_SPLIT) / (1 - PHASE_SPLIT) * Math.PI));
                f.el.style.transform = `translate(${x}px,${y}px) rotate(${tilt}deg)`;
                if (imgEl.style.animation) imgEl.style.animation = "";
            }
            if (prog < 1) { requestAnimationFrame(tick); }
            else {
                f.x = finalX; f.y = finalY; f.vx = 0; f.vy = 0;
                f.phase = "floating"; f.el.style.pointerEvents = "all";
                imgEl.style.animation = "";
                f.el.style.transform = `translate(${finalX}px,${finalY}px) rotate(0deg)`;
                _startPhysics(f, size);
            }
        };
        requestAnimationFrame(tick);
    }

    function _startPhysics(f, size) {
        const DAMPING = 0.968, BOUNCE = 0.38, BOB_AMP = 8, BOB_SPD = 0.00130, DRIFT_AMP = 3.5;
        let lastT = performance.now();
        const loop = (now) => {
            if (!f.alive || f.phase !== "floating") return;
            requestAnimationFrame(loop);
            if (f.dragging) return;
            const dt = Math.min(now - lastT, 33); lastT = now; f.floatT += dt;
            f.x += f.vx; f.y += f.vy; f.vx *= DAMPING; f.vy *= DAMPING;
            const vw = window.innerWidth, vh = window.innerHeight;
            if (f.x < 0)        { f.x = 0;         f.vx =  Math.abs(f.vx) * BOUNCE; }
            if (f.x > vw - size){ f.x = vw - size;  f.vx = -Math.abs(f.vx) * BOUNCE; }
            if (f.y < 0)        { f.y = 0;          f.vy =  Math.abs(f.vy) * BOUNCE; }
            if (f.y > vh - 80)  { f.y = vh - 80;    f.vy = -Math.abs(f.vy) * BOUNCE; }
            const speed = Math.sqrt(f.vx * f.vx + f.vy * f.vy);
            let bobX = 0, bobY = 0;
            if (speed < 0.5) {
                bobY = Math.sin(f.floatT * BOB_SPD) * BOB_AMP;
                bobX = Math.sin(f.floatT * BOB_SPD * 0.618 + 2.1) * DRIFT_AMP;
            }
            const tilt = speed < 0.5 ? 0 : Math.max(-12, Math.min(12, f.vx * 1.4));
            f.el.style.transform = `translate(${f.x + bobX}px,${f.y + bobY}px) rotate(${tilt}deg)`;
        };
        requestAnimationFrame(loop);
    }

    function dismiss(key) {
        const f = floaters.get(key);
        if (!f) return;
        f.alive = false;
        if (_dragging === f) _dragging = null;
        f.el.style.transition = "opacity 0.45s ease, transform 0.45s cubic-bezier(0.4,0,1,1)";
        f.el.style.opacity = "0";
        f.el.style.transform += " scale(0.4) rotate(25deg)";
        setTimeout(() => { f.el.remove(); floaters.delete(key); }, 500);
    }

    return { init, add, clearAll };
})();

// ─── INIT ──────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    initDarkMode();
    applyAllLocks();
    initLoadingScreen();
    initProjects();
    initScrollAnimations();
    initSmoothScroll();
    initHeroAnimation();
    initEmailForm();
    initNavScroll();
    initBurgerMenu();
    initScrollIndicator();
    initQuoteOfTheDay();
    initMobileSectionObserver();
    initAdminPanel();
    setTimeout(initInstantTapFeedback, 600);
});

// ─── DARK MODE ────────────────────────────────────────────────────────
function initDarkMode() {
    const body = document.body;
    const saved = localStorage.getItem("darkMode");
    if (saved === "true") {
        body.classList.add("dark-mode");
    } else if (saved === null) {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            body.classList.add("dark-mode");
            localStorage.setItem("darkMode", "true");
        } else {
            localStorage.setItem("darkMode", "false");
        }
    }
    const toggle = () => {
        body.classList.toggle("dark-mode");
        localStorage.setItem("darkMode", body.classList.contains("dark-mode").toString());
    };
    document.getElementById("darkModeToggleDesktop")?.addEventListener("click", toggle);
    document.getElementById("darkModeToggle")?.addEventListener("click", toggle);
}

// ─── LOADING SCREEN ────────────────────────────────────────────────────
function initLoadingScreen() {
    const loader = document.getElementById("loadingScreen");
    if (!loader) return;
    document.body.style.overflow = "hidden";
    setTimeout(() => {
        loader.classList.add("loader-exit");
        setTimeout(() => {
            loader.style.display = "none";
            document.body.style.overflow = "";
        }, 900);
    }, 2300);
}

// ─── LOCK SYSTEM ───────────────────────────────────────────────────────
const LOCK_CONFIG = {
    projectsLocked: {
        sectionId: "projects",
        overlayId: "projectsLockOverlay",
        interactiveSelectors: [".project-grid-card", ".project-grid-link"],
    },
    aboutLocked: {
        sectionId: "about",
        overlayId: "aboutLockOverlay",
        interactiveSelectors: [".feature-item", ".about-text-block", ".intro-paragraph"],
    },
    contactLocked: {
        sectionId: "contact",
        overlayId: "contactLockOverlay",
        interactiveSelectors: [".contact-link", ".email-form-container", "#emailButton"],
    },
};

function applyAllLocks() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem("siteConfig") || "{}"); } catch (e) {}
    const merged = { ...(window.SiteConfig || {}), ...saved };
    Object.entries(LOCK_CONFIG).forEach(([key, opts]) =>
        applySectionLock(merged[key] === true, opts)
    );
}

function applySectionLock(isLocked, opts) {
    const section = document.getElementById(opts.sectionId);
    const overlay = document.getElementById(opts.overlayId);
    if (!section || !overlay) return;
    const els = opts.interactiveSelectors
        ? opts.interactiveSelectors.flatMap(s => [...document.querySelectorAll(s)])
        : [];
    if (isLocked) {
        section.classList.add("is-locked");
        els.forEach(el => { el.setAttribute("tabindex", "-1"); el.setAttribute("aria-hidden", "true"); });
        if (!section._lockHandler) {
            section._lockHandler = e => {
                if (!e.target.closest(".section-lock-overlay")) { e.preventDefault(); e.stopPropagation(); }
            };
            section.addEventListener("click", section._lockHandler, true);
            section.addEventListener("touchstart", section._lockHandler, { capture: true, passive: false });
            section.addEventListener("touchend", section._lockHandler, { capture: true, passive: false });
        }
    } else {
        section.classList.remove("is-locked");
        els.forEach(el => { el.removeAttribute("tabindex"); el.removeAttribute("aria-hidden"); });
        if (section._lockHandler) {
            section.removeEventListener("click", section._lockHandler, true);
            section.removeEventListener("touchstart", section._lockHandler, true);
            section.removeEventListener("touchend", section._lockHandler, true);
            section._lockHandler = null;
        }
    }
}

// ─── PROJECT GRID ──────────────────────────────────────────────────────
function initProjects() {
    const grid = document.getElementById("projectGrid");
    if (!grid) return;
    projects.forEach((p, i) => grid.appendChild(createProjectCard(p, i)));
}

function createProjectCard(project, index) {
    const card = document.createElement("article");
    card.className = "project-grid-card";
    card.setAttribute("data-reveal", "");
    card.style.animationDelay = `${index * 0.15}s`;
    const hasImage = project.imageUrl && project.imageUrl.trim() !== "";
    const imageHtml = hasImage
        ? `<div class="pgc-image"><img src="${project.imageUrl}" alt="${project.title}" /></div>`
        : `<div class="pgc-image pgc-image--empty"><div class="pgc-empty-grid"></div><span class="pgc-empty-label">${project.emptyLabel || "In Development"}</span></div>`;
    const tagsHtml = project.tags.map(t => `<span class="pgc-tag">${t}</span>`).join("");
    const linkHtml = project.pageUrl && project.pageUrl !== "#"
        ? `<a href="${project.pageUrl}" class="pgc-link">View Project <span class="pgc-link-arrow">&#x2192;</span></a>`
        : `<span class="pgc-link pgc-link--disabled">Coming Soon <span class="pgc-link-arrow">&middot;</span></span>`;
    card.innerHTML = `
        <span class="pgc-corner pgc-corner--tl"></span>
        <span class="pgc-corner pgc-corner--tr"></span>
        <span class="pgc-corner pgc-corner--bl"></span>
        <span class="pgc-corner pgc-corner--br"></span>
        <div class="pgc-year">${project.year}</div>
        ${imageHtml}
        <div class="pgc-body">
            <div class="pgc-title-row"><h3 class="pgc-title">${project.title}</h3><span class="pgc-title-line"></span></div>
            <p class="pgc-desc">${project.description}</p>
            <div class="pgc-tags">${tagsHtml}</div>
            <div class="pgc-footer">${linkHtml}<span class="pgc-index-ghost">${project.index}</span></div>
        </div>`;
    return card;
}

// ─── QUOTE OF THE DAY ──────────────────────────────────────────────────
function initQuoteOfTheDay() {
    const quoteText = document.getElementById("quoteText");
    const quoteAuthor = document.getElementById("quoteAuthor");
    if (!quoteText || !quoteAuthor) return;
    const now = new Date();
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
    const q = dailyQuotes[dayOfYear % dailyQuotes.length];
    quoteText.textContent = q.text;
    quoteAuthor.textContent = `\u2014 ${q.author}`;
}

// ─── SCROLL ANIMATIONS ─────────────────────────────────────────────────
function initScrollAnimations() {
    const observer = new IntersectionObserver(
        entries => entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add("revealed"); observer.unobserve(e.target); }
        }),
        { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    document.querySelectorAll("[data-reveal]").forEach(el => observer.observe(el));
}

// ─── SMOOTH SCROLL ─────────────────────────────────────────────────────
function isMobile() { return window.innerWidth <= 768; }

function smoothScrollTo(targetY, duration) {
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.scrollBehavior = "auto";
    const startY = window.pageYOffset, dist = targetY - startY;
    let startTime = null;
    const ease = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const step = now => {
        if (!startTime) startTime = now;
        const progress = Math.min((now - startTime) / duration, 1);
        window.scrollTo(0, startY + dist * ease(progress));
        if (progress < 1) { requestAnimationFrame(step); }
        else { document.documentElement.style.scrollBehavior = ""; document.body.style.scrollBehavior = ""; }
    };
    requestAnimationFrame(step);
}

function initSmoothScroll() {
    document.querySelectorAll("[data-nav]").forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute("href"));
            if (!target) return;
            const targetY = target.offsetTop - 80;
            if (isMobile()) { closeBurgerMenu(); setTimeout(() => smoothScrollTo(targetY, 900), 80); }
            else { smoothScrollTo(targetY, 1200); }
        });
    });
}

// ─── HERO ANIMATION ────────────────────────────────────────────────────
function initHeroAnimation() {
    setTimeout(() => {
        document.querySelector(".title-line")?.classList.add("revealed");
        document.querySelector(".hero-subtitle")?.classList.add("revealed");
    }, 300);
}

// ─── SCROLL INDICATOR ──────────────────────────────────────────────────
function initScrollIndicator() {
    const el = document.getElementById("scrollIndicator");
    if (!el || window.innerWidth <= 768) return;
    let visible = true, fadeTimeout = null;
    const enableFade = () => {
        el.style.cssText = "animation:none;transition:opacity 0.9s ease,transform 0.9s ease;opacity:1;transform:translateX(-50%) translateY(0)";
        window.removeEventListener("scroll", enableFade);
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
    };
    const handleScroll = () => {
        const shouldHide = window.pageYOffset > 100;
        if (shouldHide && visible) {
            visible = false;
            el.style.opacity = "0"; el.style.transform = "translateX(-50%) translateY(14px)";
            clearTimeout(fadeTimeout);
            fadeTimeout = setTimeout(() => { el.style.visibility = "hidden"; }, 900);
        } else if (!shouldHide && !visible) {
            visible = true; clearTimeout(fadeTimeout);
            el.style.visibility = "visible"; el.style.opacity = "1"; el.style.transform = "translateX(-50%) translateY(0)";
        }
    };
    setTimeout(enableFade, 2800);
}

// ─── PARALLAX ─────────────────────────────────────────────────────────
let ticking = false;
window.addEventListener("scroll", () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            const s = window.pageYOffset;
            document.querySelectorAll(".shape").forEach((sh, i) => { sh.style.transform = `translateY(${s * (0.05 + i * 0.02)}px)`; });
            document.querySelectorAll(".dot").forEach((d, i) => { d.style.transform = `translateY(${-s * (0.03 + i * 0.01)}px) scale(${1 + s * 0.0001})`; });
            if (window.checkFormVisibility) window.checkFormVisibility();
            ticking = false;
        });
        ticking = true;
    }
}, { passive: true });

// ─── EMAIL FORM ────────────────────────────────────────────────────────
function initEmailForm() {
    const emailButton = document.getElementById("emailButton");
    const emailFormContainer = document.getElementById("emailFormContainer");
    const emailForm = document.getElementById("emailForm");
    const formConfirmation = document.getElementById("formConfirmation");
    const formError = document.getElementById("formError");
    const submitButton = emailForm?.querySelector(".submit-button");
    if (!emailButton || !emailForm) return;
    let formIsOpen = false;
    emailButton.addEventListener("click", e => {
        e.preventDefault();
        formIsOpen = !formIsOpen;
        if (formIsOpen) {
            emailFormContainer.classList.add("active");
            setTimeout(() => emailFormContainer.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
        } else {
            emailFormContainer.classList.remove("active");
            formConfirmation?.classList.remove("show");
            formError?.classList.remove("show");
        }
    });
    emailForm.addEventListener("submit", async e => {
        e.preventDefault();
        submitButton.disabled = true; submitButton.textContent = "Sending...";
        formConfirmation?.classList.remove("show"); formError?.classList.remove("show");
        try {
            const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: new FormData(emailForm) });
            const data = await res.json();
            if (data.success) {
                formConfirmation?.classList.add("show"); emailForm.reset();
                submitButton.disabled = false; submitButton.textContent = "Send Message";
                setTimeout(() => {
                    formConfirmation?.classList.remove("show");
                    setTimeout(() => {
                        emailFormContainer.classList.remove("active"); formIsOpen = false;
                        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }, 500);
                }, 3000);
            } else throw new Error(data.message || "Something went wrong.");
        } catch (err) {
            if (formError) { formError.textContent = `\u2717 ${err.message || "Network error."}`; formError.classList.add("show"); }
            submitButton.disabled = false; submitButton.textContent = "Send Message";
            setTimeout(() => formError?.classList.remove("show"), 5000);
        }
    });
    window.checkFormVisibility = () => {
        if (!formIsOpen) return;
        const r = emailFormContainer.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight + 200) {
            emailFormContainer.classList.remove("active");
            formConfirmation?.classList.remove("show"); formError?.classList.remove("show");
            formIsOpen = false;
        }
    };
}

// ─── NAV SCROLL ────────────────────────────────────────────────────────
function initNavScroll() {
    const nav = document.querySelector(".main-nav");
    if (!nav) return;
    window.addEventListener("scroll", () => nav.classList.toggle("scrolled", window.scrollY > 50), { passive: true });
}

// ─── BURGER MENU ───────────────────────────────────────────────────────
let _burgerCloseCallback = null;
function closeBurgerMenu() { if (_burgerCloseCallback) _burgerCloseCallback(); }

let _burgerDecorated = false;
function injectBurgerMenuDecoration() {
    if (window.innerWidth > 768 || _burgerDecorated) return;
    _burgerDecorated = true;
    const navLinks = document.getElementById("navLinks");
    if (!navLinks) return;
    navLinks.querySelectorAll("a[data-nav]").forEach((link, i) => {
        const text = link.textContent.trim();
        link.innerHTML = `<span class="menu-index">${["01","02","03"][i] || "0"+(i+1)}</span><span class="menu-text">${text}</span><span class="menu-arrow">&#x2192;</span>`;
    });
    const topbar = document.createElement("div");
    topbar.className = "nav-menu-topbar";
    topbar.innerHTML = `<span>Portfolio / 2026</span><span>Navigation</span>`;
    navLinks.appendChild(topbar);
    const bottombar = document.createElement("div");
    bottombar.className = "nav-menu-bottombar";
    bottombar.innerHTML = `<span style="display:flex;align-items:center;gap:6px"><span class="nav-menu-statusdot"></span>Available for work</span><span>Based in Latvia</span>`;
    navLinks.appendChild(bottombar);
    ["tl","tr","bl","br"].forEach(pos => {
        const corner = document.createElement("div");
        corner.className = `nav-menu-corner nav-menu-corner--${pos}`;
        navLinks.appendChild(corner);
    });
    const line = document.createElement("div");
    line.className = "nav-menu-line";
    navLinks.appendChild(line);
    const dotsWrap = document.createElement("div");
    dotsWrap.className = "nav-menu-dots";
    dotsWrap.innerHTML = `<div class="nav-menu-dot"></div><div class="nav-menu-dot"></div><div class="nav-menu-dot"></div><div class="nav-menu-dot"></div>`;
    navLinks.appendChild(dotsWrap);
}

function initBurgerMenu() {
    const burger = document.getElementById("burgerMenu");
    const links = document.getElementById("navLinks");
    const overlay = document.getElementById("navOverlay");
    if (!burger) return;
    const open = () => {
        injectBurgerMenuDecoration();
        burger.classList.add("active");
        links.classList.add("active");
        overlay.classList.add("active");
        document.body.style.overflow = "hidden";
    };
    const close = () => {
        burger.classList.remove("active");
        links.classList.remove("active");
        overlay.classList.remove("active");
        document.body.style.overflow = "";
    };
    _burgerCloseCallback = close;
    burger.addEventListener("click", e => { e.stopPropagation(); burger.classList.contains("active") ? close() : open(); });
    overlay.addEventListener("click", close);
    links.querySelectorAll("a:not([data-nav])").forEach(a => a.addEventListener("click", close));
    document.addEventListener("keydown", e => { if (e.key === "Escape" && links.classList.contains("active")) close(); });
    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { if (window.innerWidth > 768) close(); }, 50);
    });
}

// ─── MOBILE SECTION OBSERVER ───────────────────────────────────────────
function initMobileSectionObserver() {
    if (window.innerWidth > 768) return;
    const sections = document.querySelectorAll(".about-section,.projects-section,.quote-section,.contact-section");
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const el = entry.target;
            if (entry.isIntersecting) { el.classList.add("section-visible"); el.classList.remove("section-above"); }
            else {
                const rect = el.getBoundingClientRect();
                if (rect.top < 0) { el.classList.add("section-above"); el.classList.remove("section-visible"); }
                else { el.classList.remove("section-visible", "section-above"); }
            }
        });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    sections.forEach(s => observer.observe(s));
}

// ─── INSTANT TAP FEEDBACK ─────────────────────────────────────────────
function initInstantTapFeedback() {
    if (window.innerWidth > 768) return;
    const FLASH = 150;
    const flash = (el, inStyles, dur = FLASH) => {
        el.addEventListener("touchstart", () => Object.assign(el.style, { transition: "all 0.1s ease", ...inStyles }), { passive: true });
        const reset = () => setTimeout(() => { Object.keys(inStyles).forEach(k => el.style[k] = ""); setTimeout(() => el.style.transition = "", 300); }, dur);
        el.addEventListener("touchend", reset, { passive: true });
        el.addEventListener("touchcancel", reset, { passive: true });
    };
    const logo = document.querySelector(".logo");
    if (logo) flash(logo, { color: "var(--color-accent)", transform: "scale(1.08) rotate(-4deg)" });
    document.querySelectorAll(".contact-link").forEach(el => flash(el, { borderColor: "var(--color-accent)", transform: "translateX(5px)" }));
    document.querySelectorAll(".feature-item").forEach(el => flash(el, { borderLeftWidth: "6px", transform: "translateX(5px)" }, FLASH + 50));
    document.querySelectorAll(".project-grid-card").forEach(el => flash(el, { borderColor: "var(--color-accent)" }));
    const submitBtn = document.querySelector(".submit-button");
    if (submitBtn) flash(submitBtn, { opacity: "0.78", transform: "scale(0.98)" });
}


/* ═══════════════════════════════════════════════════════════════
   ADMIN PANEL
   - Desktop: type "hitman2" anywhere (not in an input)
   - Mobile:  triple-tap the footer
   - PIN:     2604
   ═══════════════════════════════════════════════════════════════ */

function initAdminPanel() {
    const ADMIN_PIN    = "2604";
    const TRIGGER_WORD = ["h","i","t","m","a","n","2"];

    let keyBuffer   = [];
    let panelOpen   = false;
    let pinVerified = false;
    let db          = null;
    let activityLog = [];
    let pinInput    = "";

    const DEFAULTS = {
        projectsLocked:  false,
        aboutLocked:     false,
        contactLocked:   false,
        accentColor:     "#c17a5a",
        secondaryColor:  "#7a8e7e",
        heroStatus:      "Online",
        heroSubtext:     "Currently, working on project",
        maintenanceMode: false,
        footerNote:      "Designed & developed with care.",
    };

    // ── Firebase ──────────────────────────────────────────────
    function initFirebase() {
        if (!window.FIREBASE_ENABLED || typeof firebase === "undefined") return;
        try {
            if (!firebase.apps.length) firebase.initializeApp(window.firebaseConfig);
            db = firebase.database();
            FloatingImageSystem.init(db);
            db.ref("siteConfig").on("value", snap => {
                const data = snap.val();
                if (!data) return;
                applyToSite(data);
                if (panelOpen && pinVerified) populatePanel(data);
            });
        } catch (e) { console.warn("[Admin] Firebase:", e.message); }
    }

    function pushFirebase(config) {
        if (!db) return;
        db.ref("siteConfig").set({ ...config, _lastUpdated: Date.now() });
    }

    function fetchLog() {
        if (!db) return;
        db.ref("adminLog").orderByChild("ts").limitToLast(20).once("value", snap => {
            const data = snap.val();
            if (!data) return;
            activityLog = Object.values(data).sort((a, b) => b.ts - a.ts);
            renderLog();
        });
    }

    // ── Config ────────────────────────────────────────────────
    function getConfig() {
        try { return JSON.parse(localStorage.getItem("siteConfig") || "{}"); } catch { return {}; }
    }

    function saveConfig(updates) {
        const next = { ...DEFAULTS, ...getConfig(), ...updates, _lastUpdated: Date.now() };
        localStorage.setItem("siteConfig", JSON.stringify(next));
        applyToSite(next);
        pushFirebase(next);
        logActivity("Updated: " + Object.keys(updates).join(", "));
        return next;
    }

    // ── Apply config to the live site ────────────────────────
    function applyToSite(config) {
        const c = { ...DEFAULTS, ...config };
        applySectionLock(c.aboutLocked,    LOCK_CONFIG.aboutLocked);
        applySectionLock(c.projectsLocked, LOCK_CONFIG.projectsLocked);
        applySectionLock(c.contactLocked,  LOCK_CONFIG.contactLocked);
        document.documentElement.style.setProperty("--color-accent",    c.accentColor);
        document.documentElement.style.setProperty("--color-secondary", c.secondaryColor);
        let colorOverride = document.getElementById("adminColorOverride");
        if (!colorOverride) {
            colorOverride = document.createElement("style");
            colorOverride.id = "adminColorOverride";
            document.head.appendChild(colorOverride);
        }
        colorOverride.textContent = `
            :root { --color-accent: ${c.accentColor} !important; --color-secondary: ${c.secondaryColor} !important; }
            body.dark-mode { --color-accent: ${c.accentColor} !important; --color-secondary: ${c.secondaryColor} !important; }
        `;
        const statusEl = document.querySelector(".hero-status");
        if (statusEl) {
            const dot = statusEl.querySelector(".hero-status-dot");
            statusEl.innerHTML = "";
            if (dot) statusEl.appendChild(dot);
            statusEl.appendChild(document.createTextNode(" " + (c.heroStatus || "Online")));
        }
        const metaEl = document.querySelector(".hero-meta-item");
        if (metaEl) metaEl.textContent = c.heroSubtext || DEFAULTS.heroSubtext;
        const footerNote = document.querySelector(".footer-note");
        if (footerNote) footerNote.textContent = c.footerNote || DEFAULTS.footerNote;
        document.querySelectorAll(".nav-menu-statusdot").forEach(d => { d.style.background = "var(--color-accent)"; });
        let banner = document.getElementById("adminMaintenanceBanner");
        if (c.maintenanceMode) {
            if (!banner) {
                banner = document.createElement("div");
                banner.id = "adminMaintenanceBanner";
                banner.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:99998;background:var(--color-accent);color:#fff;text-align:center;padding:8px 16px;font-family:var(--font-mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;";
                banner.textContent = "\u26a0 Site under maintenance \u2014 some features may be unavailable";
                document.body.prepend(banner);
            }
        } else { banner?.remove(); }
    }

    // ── Activity log ──────────────────────────────────────────
    function logActivity(msg) {
        const entry = { msg, ts: Date.now() };
        activityLog.unshift(entry);
        if (activityLog.length > 20) activityLog.pop();
        db?.ref("adminLog").push(entry);
        renderLog();
    }

    function renderLog() {
        const el = document.getElementById("adminActivityLog");
        if (!el) return;
        el.innerHTML = activityLog.slice(0, 8).map(e => {
            const t = new Date(e.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            return `<div class="adm-log-item"><span class="adm-log-time">${t}</span><span class="adm-log-msg">${e.msg}</span></div>`;
        }).join("") || '<span class="adm-log-empty">No activity yet</span>';
    }

    // ── Keyboard trigger ─────────────────────────────────────
    document.addEventListener("keydown", e => {
        if (["INPUT","TEXTAREA"].includes(document.activeElement?.tagName)) return;
        keyBuffer.push(e.key.toLowerCase());
        if (keyBuffer.length > TRIGGER_WORD.length) keyBuffer.shift();
        if (keyBuffer.join("") === TRIGGER_WORD.join("")) { keyBuffer = []; openPanel(); }
    });

    // ── Triple-tap footer (mobile) ────────────────────────────
    let tapCount = 0, tapTimer = null;
    document.addEventListener("touchend", e => {
        if (!e.target.closest(".main-footer")) return;
        tapCount++;
        clearTimeout(tapTimer);
        tapTimer = setTimeout(() => tapCount = 0, 800);
        if (tapCount >= 3) { tapCount = 0; openPanel(); }
    });

    // ── Open / Close ──────────────────────────────────────────
    function openPanel() {
        if (panelOpen) return;
        panelOpen = true;
        SoundEngine.playAdminOpen();
        injectPanel();
        requestAnimationFrame(() => {
            document.getElementById("adminPanel")?.classList.add("adm--visible");
            if (!pinVerified) showPin(); else showMain();
        });
    }

    function closePanel() {
        panelOpen = false;
        const p = document.getElementById("adminPanel");
        if (p) { p.classList.remove("adm--visible"); setTimeout(() => p.remove(), 500); }
    }

    // ── Inject HTML ───────────────────────────────────────────
    function injectPanel() {
        if (document.getElementById("adminPanel")) return;

        if (!document.getElementById("adminPanelStyles")) {
            const style = document.createElement("style");
            style.id = "adminPanelStyles";
            style.textContent = `
                #adminPanel{position:fixed;inset:0;z-index:999999;pointer-events:none;font-family:var(--font-mono,'IBM Plex Mono',monospace)}
                #adminPanel.adm--visible{pointer-events:all}
                .adm-backdrop{position:absolute;inset:0;background:rgba(0,0,0,0);backdrop-filter:blur(0);-webkit-backdrop-filter:blur(0);transition:all .4s ease}
                .adm--visible .adm-backdrop{background:rgba(0,0,0,.55);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
                .adm-drawer{position:absolute;bottom:0;left:0;right:0;max-height:92vh;background:var(--color-bg);border-top:3px solid var(--color-accent);border-radius:20px 20px 0 0;box-shadow:0 -24px 80px rgba(0,0,0,.22);transform:translateY(100%);transition:transform .45s cubic-bezier(.22,1,.36,1);display:flex;flex-direction:column;overflow:hidden}
                .adm--visible .adm-drawer{transform:translateY(0)}
                @media(min-width:769px){.adm-drawer{left:auto;right:0;top:0;bottom:0;width:480px;max-height:100vh;border-radius:0;border-top:none;border-left:3px solid var(--color-accent);transform:translateX(100%)}.adm--visible .adm-drawer{transform:translateX(0)}}
                .adm-handle{width:44px;height:5px;background:var(--color-border);border-radius:3px;margin:14px auto 0;flex-shrink:0;cursor:grab}
                @media(min-width:769px){.adm-handle{display:none}}
                .adm-screen{display:flex;flex-direction:column;flex:1;overflow:hidden}
                .adm-screen--off{display:none!important}
                .adm-mobile-close{display:flex;width:calc(100% - 2.5rem);margin:0.75rem 1.25rem 0;padding:13px;background:var(--color-light);border:1px solid var(--color-border);color:var(--color-text);font-family:var(--font-mono);font-size:13px;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;border-radius:8px;align-items:center;justify-content:center;gap:8px;transition:all .2s ease;-webkit-tap-highlight-color:transparent;flex-shrink:0}
                .adm-mobile-close:active{background:var(--color-accent);color:#fff;border-color:var(--color-accent)}
                @media(min-width:769px){.adm-mobile-close{display:none}}
                .adm-pin-wrap{display:flex;flex-direction:column;flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch}
                .adm-pin-head{text-align:center;padding:2rem 1.5rem .75rem}
                .adm-pin-icon{width:58px;height:58px;border-radius:50%;background:rgba(193,122,90,.1);border:1px solid rgba(193,122,90,.2);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;color:var(--color-accent)}
                .adm-pin-title{font-family:var(--font-display,cursive);font-size:1.6rem;font-weight:400;color:var(--color-text);margin-bottom:.3rem}
                .adm-pin-sub{font-size:13px;color:var(--color-secondary);letter-spacing:.04em}
                .adm-pin-dots{display:flex;justify-content:center;gap:18px;padding:1.25rem 1.5rem}
                .adm-pin-dot{width:15px;height:15px;border-radius:50%;border:2px solid var(--color-border);background:transparent;transition:all .2s cubic-bezier(.34,1.56,.64,1)}
                .adm-pin-dot--on{background:var(--color-accent);border-color:var(--color-accent);transform:scale(1.12)}
                .adm-pin-dots--err .adm-pin-dot{border-color:#e05555;background:#e05555;animation:admShake .4s ease}
                .adm-pin-dots--ok .adm-pin-dot{border-color:var(--color-secondary);background:var(--color-secondary)}
                @keyframes admShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
                .adm-pin-err{text-align:center;font-size:13px;color:#e05555;letter-spacing:.05em;min-height:18px;margin-bottom:.5rem}
                .adm-pin-pad{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:0 1.25rem}
                .adm-key{height:64px;background:var(--color-light);border:1px solid var(--color-border);color:var(--color-text);font-family:var(--font-display,cursive);font-size:1.6rem;cursor:pointer;border-radius:10px;transition:all .15s ease;-webkit-tap-highlight-color:transparent}
                .adm-key:active{transform:scale(.9);background:var(--color-accent);color:#fff;border-color:var(--color-accent)}
                @media(min-width:769px){.adm-key:hover{background:var(--color-accent);color:#fff;border-color:var(--color-accent)}}
                .adm-key--blank{background:transparent;border-color:transparent;pointer-events:none}
                .adm-pin-cancel{display:block;width:calc(100% - 2.5rem);margin:1rem 1.25rem 1.5rem;padding:13px;background:transparent;border:1px solid var(--color-border);color:var(--color-secondary);font-family:var(--font-mono);font-size:13px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;border-radius:6px;transition:all .2s ease;-webkit-tap-highlight-color:transparent}
                .adm-pin-cancel:hover{border-color:var(--color-accent);color:var(--color-accent)}
                .adm-header{display:flex;justify-content:space-between;align-items:center;padding:1.1rem 1.5rem 1rem;border-bottom:1px solid var(--color-border);flex-shrink:0;background:var(--color-bg);position:sticky;top:0;z-index:2}
                .adm-header-l{display:flex;align-items:center;gap:10px}
                .adm-live-dot{width:9px;height:9px;border-radius:50%;background:var(--color-accent);animation:admPulse 2s ease-in-out infinite;flex-shrink:0}
                @keyframes admPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}
                .adm-title{font-family:var(--font-display,cursive);font-size:1.25rem;font-weight:400;color:var(--color-text);letter-spacing:-.01em}
                .adm-ver{font-size:12px;letter-spacing:.1em;color:var(--color-secondary);opacity:.5}
                .adm-close{width:34px;height:34px;border-radius:50%;border:1px solid var(--color-border);background:transparent;color:var(--color-secondary);cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:all .2s ease;-webkit-tap-highlight-color:transparent}
                .adm-close:hover{border-color:var(--color-accent);color:var(--color-accent);background:rgba(193,122,90,.08)}
                .adm-body{overflow-y:auto;flex:1;-webkit-overflow-scrolling:touch;padding-bottom:calc(1.5rem + env(safe-area-inset-bottom,0))}
                .adm-sec{padding:1rem 1.5rem;border-bottom:1px solid var(--color-border)}
                .adm-sec:last-child{border-bottom:none}
                .adm-sec--danger{background:rgba(224,85,85,.04)}
                .adm-sec-lbl{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--color-secondary);opacity:.6;margin-bottom:.875rem}
                .adm-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
                .adm-stat{background:var(--color-light);border:1px solid var(--color-border);padding:10px 8px;text-align:center;border-radius:6px}
                .adm-stat-v{font-family:var(--font-display,cursive);font-size:1rem;color:var(--color-text);margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
                .adm-stat-l{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--color-secondary);opacity:.6}
                .adm-toggles{display:flex;flex-direction:column}
                .adm-trow{display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid var(--color-border);font-size:15px;color:var(--color-text)}
                .adm-trow:last-child{border-bottom:none}
                .adm-sw{position:relative;display:inline-flex;align-items:center;cursor:pointer}
                .adm-sw input{position:absolute;opacity:0;width:0;height:0}
                .adm-sw-track{width:44px;height:24px;background:var(--color-border);border-radius:12px;position:relative;transition:background .25s ease;border:1px solid var(--color-border)}
                .adm-sw input:checked+.adm-sw-track{background:var(--color-accent)}
                .adm-sw-thumb{position:absolute;top:3px;left:3px;width:16px;height:16px;background:#fff;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.15);transition:transform .25s cubic-bezier(.34,1.56,.64,1)}
                .adm-sw input:checked+.adm-sw-track .adm-sw-thumb{transform:translateX(20px)}
                .adm-colors{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
                .adm-clr-item{display:flex;flex-direction:column;gap:6px;font-size:12px;color:var(--color-secondary);letter-spacing:.04em;cursor:pointer}
                .adm-clr-row{display:flex;align-items:center;gap:10px;background:var(--color-light);border:1px solid var(--color-border);border-radius:6px;padding:8px 12px;transition:border-color .2s}
                .adm-clr-row:hover{border-color:var(--color-accent)}
                .adm-clr-item input[type=color]{width:28px;height:28px;border:none;border-radius:4px;cursor:pointer;padding:0;background:none;-webkit-appearance:none;flex-shrink:0}
                .adm-clr-item input[type=color]::-webkit-color-swatch-wrapper{padding:0;border-radius:4px}
                .adm-clr-item input[type=color]::-webkit-color-swatch{border:none;border-radius:4px}
                .adm-clr-hex{font-family:var(--font-mono);font-size:12px;color:var(--color-text);letter-spacing:.04em}
                .adm-field{margin-bottom:10px}
                .adm-field label{display:block;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--color-secondary);margin-bottom:5px}
                .adm-input{width:100%;background:var(--color-light);border:1px solid var(--color-border);color:var(--color-text);font-family:var(--font-mono);font-size:14px;padding:10px 12px;border-radius:6px;transition:border-color .2s;-webkit-appearance:none}
                .adm-input:focus{border-color:var(--color-accent);outline:none}
                .adm-btn{display:block;width:100%;padding:12px;background:var(--color-accent);color:#fff;border:none;font-family:var(--font-mono);font-size:13px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;border-radius:6px;transition:all .2s ease;margin-top:6px;-webkit-tap-highlight-color:transparent}
                .adm-btn:hover{opacity:.85;transform:translateY(-1px)}
                .adm-btn:active{transform:scale(.98)}
                .adm-btn--ghost{background:transparent;color:var(--color-secondary);border:1px solid var(--color-border);margin-top:8px}
                .adm-btn--ghost:hover{border-color:var(--color-accent);color:var(--color-accent)}
                .adm-btn--danger{background:rgba(224,85,85,.1);color:#e05555;border:1px solid rgba(224,85,85,.2)}
                .adm-btn--danger:hover{background:#e05555;color:#fff}
                .adm-funny-btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:13px;background:linear-gradient(135deg,rgba(193,122,90,.12),rgba(122,142,126,.08));border:1px dashed var(--color-accent);color:var(--color-text);font-family:var(--font-mono);font-size:13px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;border-radius:8px;transition:all .2s ease;-webkit-tap-highlight-color:transparent}
                .adm-funny-btn:hover{background:linear-gradient(135deg,rgba(193,122,90,.22),rgba(122,142,126,.14));transform:translateY(-1px);box-shadow:0 4px 16px rgba(193,122,90,.2)}
                .adm-funny-btn:active{transform:scale(.97)}
                .adm-funny-btn .funny-icon{font-size:18px;line-height:1;flex-shrink:0}
                .adm-funny-label{transition:opacity .2s}
                .adm-clear-images-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:11px;margin-top:10px;background:transparent;border:1px solid rgba(224,85,85,.25);color:#e05555;font-family:var(--font-mono);font-size:12px;letter-spacing:.09em;text-transform:uppercase;cursor:pointer;border-radius:8px;transition:all .2s ease;-webkit-tap-highlight-color:transparent}
                .adm-clear-images-btn:hover{background:rgba(224,85,85,.08);border-color:#e05555}
                .adm-clear-images-btn:active{transform:scale(.97)}
                .adm-img-count{display:inline-block;font-size:10px;letter-spacing:.1em;background:rgba(193,122,90,.12);border:1px solid rgba(193,122,90,.2);color:var(--color-accent);padding:2px 8px;border-radius:12px;margin-left:6px}
                .adm-log{max-height:160px;overflow-y:auto;-webkit-overflow-scrolling:touch}
                .adm-log-item{display:flex;gap:10px;align-items:baseline;padding:6px 0;border-bottom:1px solid var(--color-border);font-size:12px}
                .adm-log-item:last-child{border-bottom:none}
                .adm-log-time{color:var(--color-accent);flex-shrink:0;opacity:.75}
                .adm-log-msg{color:var(--color-text);opacity:.7}
                .adm-log-empty{font-size:12px;color:var(--color-secondary);opacity:.5;padding:6px 0;display:block}
                body.dark-mode .adm-key{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.07)}
                body.dark-mode .adm-stat{background:rgba(255,255,255,.04)}
                body.dark-mode .adm-input{background:rgba(255,255,255,.05)}
                body.dark-mode .adm-mobile-close{background:rgba(255,255,255,.05)}
                #admFunnyFileInput{position:absolute;opacity:0;pointer-events:none;width:0;height:0}
            `;
            document.head.appendChild(style);
        }

        const el = document.createElement("div");
        el.id = "adminPanel";
        el.innerHTML = `
          <div class="adm-backdrop" id="admBackdrop"></div>
          <div class="adm-drawer" id="admDrawer">
            <div class="adm-handle" id="admHandle"></div>
            <div class="adm-screen" id="admPinScreen">
              <button class="adm-mobile-close" id="admPinMobileClose">&#x2715; &nbsp;Close</button>
              <div class="adm-pin-wrap">
                <div class="adm-pin-head">
                  <div class="adm-pin-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
                  <h2 class="adm-pin-title">Admin Access</h2>
                  <p class="adm-pin-sub">Enter PIN to continue</p>
                </div>
                <div class="adm-pin-dots" id="admPinDots">
                  <div class="adm-pin-dot"></div><div class="adm-pin-dot"></div>
                  <div class="adm-pin-dot"></div><div class="adm-pin-dot"></div>
                </div>
                <div class="adm-pin-err" id="admPinErr"></div>
                <div class="adm-pin-pad">
                  ${[1,2,3,4,5,6,7,8,9,"",0,"\u232b"].map(k=>`<button class="adm-key ${k===''?'adm-key--blank':''}" data-k="${k}">${k}</button>`).join("")}
                </div>
                <button class="adm-pin-cancel" id="admPinCancel">Cancel</button>
              </div>
            </div>
            <div class="adm-screen adm-screen--off" id="admMainScreen">
              <button class="adm-mobile-close" id="admMainMobileClose">&#x2715; &nbsp;Close Panel</button>
              <div class="adm-header">
                <div class="adm-header-l"><div class="adm-live-dot"></div><span class="adm-title">Control Panel</span></div>
                <div style="display:flex;align-items:center;gap:10px">
                  <span class="adm-ver">AJ / 2026</span>
                  <button class="adm-close" id="admClose">&#x2715;</button>
                </div>
              </div>
              <div class="adm-body">
                <div class="adm-sec">
                  <div class="adm-sec-lbl">Site Status</div>
                  <div class="adm-stats">
                    <div class="adm-stat"><div class="adm-stat-v" id="admStatSync">&#x2014;</div><div class="adm-stat-l">Firebase</div></div>
                    <div class="adm-stat"><div class="adm-stat-v" id="admStatTime">&#x2014;</div><div class="adm-stat-l">Last Edit</div></div>
                    <div class="adm-stat"><div class="adm-stat-v" id="admStatDate">&#x2014;</div><div class="adm-stat-l">Date</div></div>
                  </div>
                </div>
                <div class="adm-sec">
                  <div class="adm-sec-lbl">Section Locks</div>
                  <div class="adm-toggles">
                    <div class="adm-trow"><span>About</span><label class="adm-sw"><input type="checkbox" id="admLockAbout"><span class="adm-sw-track"><span class="adm-sw-thumb"></span></span></label></div>
                    <div class="adm-trow"><span>Projects</span><label class="adm-sw"><input type="checkbox" id="admLockProjects"><span class="adm-sw-track"><span class="adm-sw-thumb"></span></span></label></div>
                    <div class="adm-trow"><span>Contact</span><label class="adm-sw"><input type="checkbox" id="admLockContact"><span class="adm-sw-track"><span class="adm-sw-thumb"></span></span></label></div>
                    <div class="adm-trow"><span>Maintenance Banner</span><label class="adm-sw"><input type="checkbox" id="admMaintenance"><span class="adm-sw-track"><span class="adm-sw-thumb"></span></span></label></div>
                  </div>
                </div>
                <div class="adm-sec">
                  <div class="adm-sec-lbl">Theme Colors</div>
                  <div class="adm-colors">
                    <label class="adm-clr-item"><span>Accent</span><div class="adm-clr-row"><input type="color" id="admColorAccent" value="#c17a5a"><span class="adm-clr-hex" id="admAccentHex">#c17a5a</span></div></label>
                    <label class="adm-clr-item"><span>Secondary</span><div class="adm-clr-row"><input type="color" id="admColorSecondary" value="#7a8e7e"><span class="adm-clr-hex" id="admSecHex">#7a8e7e</span></div></label>
                  </div>
                  <button class="adm-btn adm-btn--ghost" id="admResetColors">Reset Colors</button>
                </div>
                <div class="adm-sec">
                  <div class="adm-sec-lbl">Hero &amp; Footer Text</div>
                  <div class="adm-field"><label>Status Label</label><input class="adm-input" id="admHeroStatus" type="text" maxlength="30" placeholder="Online"></div>
                  <div class="adm-field"><label>Subtext</label><input class="adm-input" id="admHeroSub" type="text" maxlength="60" placeholder="Currently, working on project"></div>
                  <div class="adm-field"><label>Footer Note</label><input class="adm-input" id="admFooterNote" type="text" maxlength="80" placeholder="Designed &amp; developed with care."></div>
                  <button class="adm-btn" id="admSaveText">Save Text</button>
                </div>
                <div class="adm-sec">
                  <div class="adm-sec-lbl">Floating Images</div>
                  <input type="file" id="admFunnyFileInput" accept="image/*" />
                  <button class="adm-funny-btn" id="admFunnyBtn">
                    <span class="funny-icon">&#x1F680;</span>
                    <span class="adm-funny-label" id="admFunnyLabel">Launch Image</span>
                  </button>
                  <button class="adm-clear-images-btn" id="admClearImages">
                    &#x2715; &nbsp;Clear All Images
                    <span class="adm-img-count" id="admImgCount" style="display:none">0</span>
                  </button>
                  <p style="font-size:11px;color:var(--color-secondary);opacity:.5;margin-top:10px;text-align:center;letter-spacing:.04em;">Image flies across the screen, then floats &#x2014; grab &amp; toss it around!</p>
                </div>
                <div class="adm-sec">
                  <div class="adm-sec-lbl">Recent Activity</div>
                  <div class="adm-log" id="adminActivityLog"><span class="adm-log-empty">Loading...</span></div>
                </div>
                <div class="adm-sec adm-sec--danger">
                  <div class="adm-sec-lbl">Danger Zone</div>
                  <button class="adm-btn adm-btn--danger" id="admResetAll">Reset All Settings</button>
                  <button class="adm-btn adm-btn--ghost" id="admLockPanel">Lock Panel</button>
                </div>
              </div>
            </div>
          </div>`;
        document.body.appendChild(el);
        bindEvents();
    }

    function showPin() {
        document.getElementById("admPinScreen")?.classList.remove("adm-screen--off");
        document.getElementById("admMainScreen")?.classList.add("adm-screen--off");
        pinInput = ""; updateDots();
    }

    function showMain() {
        document.getElementById("admPinScreen")?.classList.add("adm-screen--off");
        document.getElementById("admMainScreen")?.classList.remove("adm-screen--off");
        loadMainPanel(); fetchLog();
    }

    function updateDots() {
        document.querySelectorAll(".adm-pin-dot").forEach((d, i) =>
            d.classList.toggle("adm-pin-dot--on", i < pinInput.length));
    }

    function handlePinKey(key) {
        if (key === "\u232b") { pinInput = pinInput.slice(0, -1); updateDots(); return; }
        if (pinInput.length >= 4) return;
        pinInput += key; updateDots();
        if (pinInput.length === 4) {
            if (pinInput === ADMIN_PIN) {
                pinVerified = true;
                document.getElementById("admPinDots")?.classList.add("adm-pin-dots--ok");
                setTimeout(showMain, 380);
                logActivity("Panel unlocked");
            } else {
                document.getElementById("admPinDots")?.classList.add("adm-pin-dots--err");
                if (document.getElementById("admPinErr")) document.getElementById("admPinErr").textContent = "Incorrect PIN";
                setTimeout(() => {
                    document.getElementById("admPinDots")?.classList.remove("adm-pin-dots--err");
                    if (document.getElementById("admPinErr")) document.getElementById("admPinErr").textContent = "";
                    pinInput = ""; updateDots();
                }, 750);
            }
        }
    }

    function loadMainPanel() {
        const load = data => {
            const c = { ...DEFAULTS, ...data };
            setCheck("admLockAbout",    c.aboutLocked);
            setCheck("admLockProjects", c.projectsLocked);
            setCheck("admLockContact",  c.contactLocked);
            setCheck("admMaintenance",  c.maintenanceMode);
            setVal("admColorAccent",    c.accentColor);
            setVal("admColorSecondary", c.secondaryColor);
            if (document.getElementById("admAccentHex")) document.getElementById("admAccentHex").textContent = c.accentColor;
            if (document.getElementById("admSecHex"))    document.getElementById("admSecHex").textContent    = c.secondaryColor;
            setVal("admHeroStatus",  c.heroStatus);
            setVal("admHeroSub",     c.heroSubtext);
            setVal("admFooterNote",  c.footerNote);
            if (c._lastUpdated) {
                const d = new Date(c._lastUpdated);
                if (document.getElementById("admStatTime")) document.getElementById("admStatTime").textContent = d.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
                if (document.getElementById("admStatDate")) document.getElementById("admStatDate").textContent = d.toLocaleDateString([], { month:"short", day:"numeric" });
            } else {
                if (document.getElementById("admStatDate")) document.getElementById("admStatDate").textContent = new Date().toLocaleDateString([], { month:"short", day:"numeric" });
            }
        };
        if (db) {
            if (document.getElementById("admStatSync")) document.getElementById("admStatSync").textContent = "\u2713 Live";
            db.ref("siteConfig").once("value").then(snap => load({ ...getConfig(), ...(snap.val() || {}) }));
        } else {
            if (document.getElementById("admStatSync")) document.getElementById("admStatSync").textContent = "Local";
            load(getConfig());
            if (document.getElementById("admStatDate")) document.getElementById("admStatDate").textContent = new Date().toLocaleDateString([], { month:"short", day:"numeric" });
        }
    }

    function populatePanel(data) { if (!pinVerified || !panelOpen) return; loadMainPanel(); }
    function setCheck(id, val) { const el = document.getElementById(id); if (el) el.checked = !!val; }
    function setVal(id, val)   { const el = document.getElementById(id); if (el && val !== undefined) el.value = val; }

    function bindEvents() {
        document.getElementById("admBackdrop")?.addEventListener("click",  closePanel);
        document.getElementById("admClose")?.addEventListener("click",     closePanel);
        document.getElementById("admPinCancel")?.addEventListener("click", closePanel);
        document.getElementById("admPinMobileClose")?.addEventListener("click",  closePanel);
        document.getElementById("admMainMobileClose")?.addEventListener("click", closePanel);
        document.getElementById("admLockPanel")?.addEventListener("click", () => { pinVerified = false; showPin(); });

        document.querySelectorAll(".adm-key:not(.adm-key--blank)").forEach(btn =>
            btn.addEventListener("click", () => handlePinKey(btn.dataset.k))
        );

        const toggleMap = {
            admLockAbout:    "aboutLocked",
            admLockProjects: "projectsLocked",
            admLockContact:  "contactLocked",
            admMaintenance:  "maintenanceMode",
        };
        Object.entries(toggleMap).forEach(([id, key]) => {
            document.getElementById(id)?.addEventListener("change", e => saveConfig({ [key]: e.target.checked }));
        });

        let accentSaveTimer = null;
        document.getElementById("admColorAccent")?.addEventListener("input", e => {
            const colorOverride = document.getElementById("adminColorOverride");
            if (colorOverride) {
                const secVal = document.getElementById("admColorSecondary")?.value || DEFAULTS.secondaryColor;
                colorOverride.textContent = `:root{--color-accent:${e.target.value}!important;--color-secondary:${secVal}!important}body.dark-mode{--color-accent:${e.target.value}!important;--color-secondary:${secVal}!important}`;
            }
            document.documentElement.style.setProperty("--color-accent", e.target.value);
            if (document.getElementById("admAccentHex")) document.getElementById("admAccentHex").textContent = e.target.value;
            clearTimeout(accentSaveTimer);
            accentSaveTimer = setTimeout(() => saveConfig({ accentColor: e.target.value }), 300);
        });
        document.getElementById("admColorAccent")?.addEventListener("change", e => {
            document.documentElement.style.setProperty("--color-accent", e.target.value);
            if (document.getElementById("admAccentHex")) document.getElementById("admAccentHex").textContent = e.target.value;
            clearTimeout(accentSaveTimer);
            saveConfig({ accentColor: e.target.value });
        });

        let secSaveTimer = null;
        document.getElementById("admColorSecondary")?.addEventListener("input", e => {
            const colorOverride = document.getElementById("adminColorOverride");
            if (colorOverride) {
                const accVal = document.getElementById("admColorAccent")?.value || DEFAULTS.accentColor;
                colorOverride.textContent = `:root{--color-accent:${accVal}!important;--color-secondary:${e.target.value}!important}body.dark-mode{--color-accent:${accVal}!important;--color-secondary:${e.target.value}!important}`;
            }
            document.documentElement.style.setProperty("--color-secondary", e.target.value);
            if (document.getElementById("admSecHex")) document.getElementById("admSecHex").textContent = e.target.value;
            clearTimeout(secSaveTimer);
            secSaveTimer = setTimeout(() => saveConfig({ secondaryColor: e.target.value }), 300);
        });
        document.getElementById("admColorSecondary")?.addEventListener("change", e => {
            document.documentElement.style.setProperty("--color-secondary", e.target.value);
            if (document.getElementById("admSecHex")) document.getElementById("admSecHex").textContent = e.target.value;
            clearTimeout(secSaveTimer);
            saveConfig({ secondaryColor: e.target.value });
        });

        document.getElementById("admResetColors")?.addEventListener("click", () => {
            saveConfig({ accentColor: DEFAULTS.accentColor, secondaryColor: DEFAULTS.secondaryColor });
            setVal("admColorAccent", DEFAULTS.accentColor); setVal("admColorSecondary", DEFAULTS.secondaryColor);
            if (document.getElementById("admAccentHex")) document.getElementById("admAccentHex").textContent = DEFAULTS.accentColor;
            if (document.getElementById("admSecHex"))    document.getElementById("admSecHex").textContent    = DEFAULTS.secondaryColor;
        });

        document.getElementById("admSaveText")?.addEventListener("click", () => {
            saveConfig({
                heroStatus:  document.getElementById("admHeroStatus")?.value  || DEFAULTS.heroStatus,
                heroSubtext: document.getElementById("admHeroSub")?.value     || DEFAULTS.heroSubtext,
                footerNote:  document.getElementById("admFooterNote")?.value  || DEFAULTS.footerNote,
            });
            const btn = document.getElementById("admSaveText");
            if (btn) { const orig = btn.textContent; btn.textContent = "Saved \u2713"; btn.style.background = "var(--color-secondary)"; setTimeout(() => { btn.textContent = orig; btn.style.background = ""; }, 1500); }
        });

        // Floating images
        const funnyBtn = document.getElementById("admFunnyBtn");
        const funnyFileInput = document.getElementById("admFunnyFileInput");
        const funnyLabel = document.getElementById("admFunnyLabel");
        const imgCount = document.getElementById("admImgCount");
        let _activeCount = 0;
        const updateCount = (n) => {
            _activeCount = Math.max(0, n);
            if (!imgCount) return;
            if (_activeCount > 0) { imgCount.textContent = String(_activeCount); imgCount.style.display = "inline-block"; }
            else { imgCount.style.display = "none"; }
        };
        if (db) { db.ref("funnyImages").on("value", snap => { updateCount(snap.numChildren ? snap.numChildren() : 0); }); }
        funnyBtn?.addEventListener("click", () => { funnyFileInput.value = ""; funnyFileInput.click(); });
        funnyFileInput?.addEventListener("change", async e => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (funnyLabel) funnyLabel.textContent = "Launching...";
            funnyBtn.style.opacity = "0.6"; funnyBtn.style.pointerEvents = "none";
            try {
                const reader = new FileReader();
                reader.onload = async (ev) => {
                    await FloatingImageSystem.add(ev.target.result);
                    if (!db) updateCount(_activeCount + 1);
                    logActivity("Floating image launched \uD83D\uDE80");
                    if (funnyLabel) funnyLabel.textContent = "Launch Image";
                    funnyBtn.style.opacity = ""; funnyBtn.style.pointerEvents = ""; funnyFileInput.value = "";
                };
                reader.onerror = () => { if (funnyLabel) funnyLabel.textContent = "Launch Image"; funnyBtn.style.opacity = ""; funnyBtn.style.pointerEvents = ""; };
                reader.readAsDataURL(file);
            } catch { if (funnyLabel) funnyLabel.textContent = "Launch Image"; funnyBtn.style.opacity = ""; funnyBtn.style.pointerEvents = ""; }
        });
        document.getElementById("admClearImages")?.addEventListener("click", () => {
            FloatingImageSystem.clearAll();
            if (!db) updateCount(0);
            logActivity("Cleared all floating images");
            const btn = document.getElementById("admClearImages");
            if (btn) { const orig = btn.innerHTML; btn.innerHTML = "\u2713 &nbsp;Cleared!"; btn.style.color = "var(--color-secondary)"; setTimeout(() => { btn.innerHTML = orig; btn.style.color = ""; }, 1500); }
        });

        document.getElementById("admResetAll")?.addEventListener("click", () => {
            if (!confirm("Reset all settings to defaults?")) return;
            localStorage.removeItem("siteConfig");
            pushFirebase({ ...DEFAULTS, _lastUpdated: Date.now() });
            applyToSite(DEFAULTS); loadMainPanel();
            SoundEngine.resetAdminSoundGuard();
            logActivity("Reset all settings to defaults");
        });

        // Swipe down to close
        const drawer = document.getElementById("admDrawer");
        const handle = document.getElementById("admHandle");
        if (drawer && handle) {
            let startY = 0, curY = 0, dragging = false;
            handle.addEventListener("touchstart", e => { startY = e.touches[0].clientY; dragging = true; drawer.style.transition = "none"; }, { passive: true });
            document.addEventListener("touchmove", e => { if (!dragging) return; curY = e.touches[0].clientY; drawer.style.transform = `translateY(${Math.max(0, curY - startY)}px)`; }, { passive: true });
            document.addEventListener("touchend", () => { if (!dragging) return; dragging = false; drawer.style.transition = ""; if (curY - startY > 120) closePanel(); else drawer.style.transform = ""; });
        }
    }

    initFirebase();
    const saved = getConfig();
    if (Object.keys(saved).length > 0) applyToSite(saved);
}