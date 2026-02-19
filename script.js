const projects = [
    {
        title: "Custom Wordle",
        description: "A two-player Wordle variant where one player sets the secret word and the other tries to guess it — turning the classic solo puzzle into a head-to-head challenge.",
        tags: ["HTML", "CSS", "JavaScript"],
        pageUrl: "/Wordle/wordle.html",
        imageUrl: "/Assets/wordle.png",
        year: "2025",
        index: "01",
    },
    {
        title: "Chromatic Memory",
        description: "A minimalist color-pattern memory game. Watch the sequence, memorise the colors, and repeat — how far can you go before your memory breaks?",
        tags: ["HTML", "CSS", "JavaScript"],
        pageUrl: "/chromatic/chromatic.html",
        imageUrl: "/Assets/ChromaticMemory.png",
        year: "2025",
        index: "02",
    },
    {
        title: "Portfolio Site",
        description: "This very portfolio — designed and built from scratch with vanilla HTML, CSS and JS. Focused on clean animation, dark mode, and mobile responsiveness.",
        tags: ["HTML", "CSS", "JavaScript"],
        pageUrl: "#",
        imageUrl: "",
        year: "2026",
        index: "03",
    },
    {
        title: "CLI Task Manager",
        description: "A lightweight command-line task manager built in Python. Create, complete, and archive tasks with keyboard shortcuts and a minimal terminal UI.",
        tags: ["Python", "CLI", "Terminal"],
        pageUrl: "#",
        imageUrl: "",
        year: "2025",
        index: "04",
    },
    {
        title: "Pixel Canvas",
        description: "A shared browser-based pixel art canvas where multiple users can draw simultaneously. Built with WebSockets for real-time collaboration.",
        tags: ["JavaScript", "WebSocket", "Canvas"],
        pageUrl: "#",
        imageUrl: "",
        year: "2026",
        index: "05",
    },
    {
        title: "Weather Dashboard",
        description: "A clean, real-time weather dashboard pulling live data from an open API. Displays hourly forecasts, wind, UV index and animated weather icons.",
        tags: ["JavaScript", "API", "CSS"],
        pageUrl: "#",
        imageUrl: "",
        year: "2025",
        index: "06",
    },
];

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
    { text: "Perfection is achieved not when there is nothing more to add, but rather when there is nothing more to take away.", author: "Antoine de Saint-Exupéry" },
    { text: "I have no special talents. I am only passionately curious", author: "Albert Einstein" },
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
    { text: "It's not a bug – it's an undocumented feature.", author: "Anonymous" },
    { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
    { text: "Learning to write programs stretches your mind and helps you think better.", author: "Bill Gates" },
    { text: "The computer was born to solve problems that did not exist before.", author: "Bill Gates" },
];

document.addEventListener("DOMContentLoaded", () => {
    initLoadingScreen();
    initProjects();
    initScrollAnimations();
    initSmoothScroll();
    initHeroAnimation();
    initEmailForm();
    initNavScroll();
    initBurgerMenu();
    initDarkMode();
    initScrollIndicator();
    initQuoteOfTheDay();
    applyAllLocks();
});

// ─── LOADING SCREEN ──────────────────────────────────────────────────
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

// ─── LOCK SYSTEM ─────────────────────────────────────────────────────
const LOCK_CONFIG = {
    projectsLocked: {
        sectionId: "projects",
        overlayId: "projectsLockOverlay",
        interactiveSelectors: [".carousel-card", ".carousel-link", ".carousel-track"],
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
    if (typeof SiteConfig === "undefined") return;
    Object.entries(LOCK_CONFIG).forEach(([key, opts]) => applySectionLock(SiteConfig[key] === true, opts));
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
        section._lockHandler = (e) => {
            if (!e.target.closest(".section-lock-overlay")) { e.preventDefault(); e.stopPropagation(); }
        };
        section.addEventListener("click",      section._lockHandler, true);
        section.addEventListener("touchstart", section._lockHandler, { capture: true, passive: false });
        section.addEventListener("touchend",   section._lockHandler, { capture: true, passive: false });
    } else {
        section.classList.remove("is-locked");
        els.forEach(el => { el.removeAttribute("tabindex"); el.removeAttribute("aria-hidden"); });
        if (section._lockHandler) {
            section.removeEventListener("click",      section._lockHandler, true);
            section.removeEventListener("touchstart", section._lockHandler, true);
            section.removeEventListener("touchend",   section._lockHandler, true);
        }
    }
}

// ─── CAROUSEL ────────────────────────────────────────────────────────
function initProjects() {
    const track        = document.getElementById("carouselTrack");
    const progressFill = document.getElementById("carouselProgress");
    const prevBtn      = document.getElementById("carouselPrev");
    const nextBtn      = document.getElementById("carouselNext");
    const countEl      = document.getElementById("carouselCount");
    const flashBar     = document.getElementById("carouselFlash");
    const swipeHint    = document.querySelector(".carousel-swipe-hint");
    const dragHint     = document.querySelector(".carousel-drag-hint");

    if (!track) return;

    // Build cards
    projects.forEach((p, i) => track.appendChild(createCarouselCard(p, i)));

    const total = projects.length;
    let currentIndex = 0;
    let flashTimeout = null;

    // ── Flash bar ──────────────────────────────────────────────────
    const triggerFlash = () => {
        if (!flashBar) return;
        clearTimeout(flashTimeout);
        flashBar.classList.remove("flash-active");
        void flashBar.offsetWidth; // reflow to restart animation
        flashBar.classList.add("flash-active");
        flashTimeout = setTimeout(() => flashBar.classList.remove("flash-active"), 600);
    };

    // ── Update counter + progress from a given index ───────────────
    const setActiveIndex = (idx) => {
        const clamped = Math.max(0, Math.min(total - 1, idx));
        const changed = clamped !== currentIndex;
        currentIndex = clamped;

        if (countEl) {
            countEl.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
        }
        if (progressFill) {
            const pct = total > 1 ? (currentIndex / (total - 1)) * 100 : 100;
            progressFill.style.width = pct + "%";
        }
        if (changed) triggerFlash();

        if (currentIndex > 0) {
            swipeHint?.classList.add("hint-faded");
            dragHint?.classList.add("hint-faded");
        }
    };

    // ── Calculate active index from scroll position ─────────────────
    // Find which card's left edge is closest to the track's scroll left + padding.
    // This is reliable on both desktop (drag/wheel) and mobile (snap).
    const getCardEls = () => [...track.querySelectorAll(".carousel-card")];

    const updateIndexFromScroll = () => {
        const cards = getCardEls();
        if (!cards.length) return;
        const paddingLeft = parseFloat(getComputedStyle(track).paddingLeft) || 0;
        const scrollLeft  = track.scrollLeft;
        let bestIdx = 0;
        let bestDist = Infinity;
        cards.forEach((card, i) => {
            const dist = Math.abs(card.offsetLeft - paddingLeft - scrollLeft);
            if (dist < bestDist) { bestDist = dist; bestIdx = i; }
        });
        setActiveIndex(bestIdx);
    };

    // Listen to scroll on the track for real-time counter updates
    track.addEventListener("scroll", updateIndexFromScroll, { passive: true });

    // ── Scroll a specific card into view ──────────────────────────
    const scrollToCard = (idx) => {
        const cards = getCardEls();
        const card  = cards[Math.max(0, Math.min(total - 1, idx))];
        if (!card) return;
        const paddingLeft = parseFloat(getComputedStyle(track).paddingLeft) || 0;
        track.scrollTo({ left: card.offsetLeft - paddingLeft, behavior: "smooth" });
    };

    // ── Arrow buttons ──────────────────────────────────────────────
    prevBtn?.addEventListener("click", () => scrollToCard(currentIndex - 1));
    nextBtn?.addEventListener("click", () => scrollToCard(currentIndex + 1));

    // ── Desktop pointer drag ───────────────────────────────────────
    const isMobile = () => window.matchMedia("(max-width: 768px)").matches;
    let isDragging = false, startX = 0, scrollStart = 0, velX = 0, lastX = 0, lastT = 0, rafId = null;

    track.addEventListener("pointerdown", (e) => {
        if (isMobile() || e.pointerType === "touch") return;
        isDragging = true; startX = e.clientX; scrollStart = track.scrollLeft;
        lastX = e.clientX; lastT = Date.now(); velX = 0;
        track.setPointerCapture(e.pointerId);
        track.classList.add("is-dragging");
        cancelAnimationFrame(rafId);
    });
    track.addEventListener("pointermove", (e) => {
        if (!isDragging) return;
        track.scrollLeft = scrollStart - (e.clientX - startX);
        const now = Date.now(), dt = now - lastT || 1;
        velX = (lastX - e.clientX) / dt; lastX = e.clientX; lastT = now;
    });
    track.addEventListener("pointerup", () => {
        if (!isDragging) return;
        isDragging = false; track.classList.remove("is-dragging");
        const momentum = () => {
            if (Math.abs(velX) < 0.05) return;
            track.scrollLeft += velX * 16; velX *= 0.93;
            rafId = requestAnimationFrame(momentum);
        };
        rafId = requestAnimationFrame(momentum);
    });
    track.addEventListener("pointercancel", () => { isDragging = false; track.classList.remove("is-dragging"); });

    // ── Scroll wheel → horizontal ──────────────────────────────────
    track.addEventListener("wheel", (e) => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
        e.preventDefault();
        track.scrollLeft += e.deltaY * 1.5;
    }, { passive: false });

    // ── Keyboard navigation ────────────────────────────────────────
    track.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") scrollToCard(currentIndex + 1);
        if (e.key === "ArrowLeft")  scrollToCard(currentIndex - 1);
    });

    // ── Init display ───────────────────────────────────────────────
    if (countEl) countEl.textContent = `01 / ${String(total).padStart(2, "0")}`;
    if (progressFill) progressFill.style.width = "0%";
}

function createCarouselCard(project, index) {
    const card = document.createElement("div");
    card.className = "carousel-card";
    card.setAttribute("role", "listitem");
    card.dataset.index = index;

    const hasImage = project.imageUrl && project.imageUrl.trim() !== "";
    const imageHtml = hasImage
        ? `<div class="carousel-card-image"><img src="${project.imageUrl}" alt="${project.title}" draggable="false" /></div>`
        : `<div class="carousel-card-image carousel-card-image--empty"><span class="image-placeholder-text">No Preview</span></div>`;

    card.innerHTML = `
        <div class="carousel-card-inner">
            <div class="carousel-card-header">
                <span class="carousel-card-num">${project.index}</span>
                <span class="carousel-card-year">${project.year}</span>
            </div>
            ${imageHtml}
            <div class="carousel-card-body">
                <h3 class="carousel-card-title">${project.title}</h3>
                <p class="carousel-card-desc">${project.description}</p>
                <div class="carousel-card-tags">
                    ${project.tags.map(t => `<span class="carousel-tag">${t}</span>`).join("")}
                </div>
                <a href="${project.pageUrl}" class="carousel-link" draggable="false">
                    View Project <span class="carousel-link-arrow">→</span>
                </a>
            </div>
        </div>
    `;
    return card;
}

// ─── QUOTE ─────────────────────────────────────────────────────────────
function initQuoteOfTheDay() {
    const quoteText   = document.getElementById("quoteText");
    const quoteAuthor = document.getElementById("quoteAuthor");
    if (!quoteText || !quoteAuthor) return;
    const now = new Date();
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
    const q = dailyQuotes[dayOfYear % dailyQuotes.length];
    quoteText.textContent   = q.text;
    quoteAuthor.textContent = `— ${q.author}`;
}

// ─── SCROLL ANIMATIONS ─────────────────────────────────────────────────
function initScrollAnimations() {
    const observer = new IntersectionObserver(
        (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("revealed"); observer.unobserve(e.target); } }),
        { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
    );
    document.querySelectorAll("[data-reveal]").forEach(el => observer.observe(el));
}

function initSmoothScroll() {
    document.querySelectorAll("[data-nav]").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute("href"));
            if (target) smoothScrollTo(target.offsetTop - 80, 1200);
        });
    });
}

function smoothScrollTo(to, dur) {
    const start = window.pageYOffset, dist = to - start;
    let t0 = null;
    const ease = (t, b, c, d) => { t /= d/2; if(t<1) return c/2*t*t*t+b; t-=2; return c/2*(t*t*t+2)+b; };
    const tick = (now) => { if (!t0) t0 = now; const e = now-t0; window.scrollTo(0, ease(e,start,dist,dur)); if(e<dur) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
}

function initHeroAnimation() {
    setTimeout(() => {
        document.querySelector(".title-line")?.classList.add("revealed");
        document.querySelector(".hero-subtitle")?.classList.add("revealed");
    }, 300);
}

function initScrollIndicator() {
    const el = document.getElementById("scrollIndicator");
    if (!el) return;
    const up = () => el.classList.toggle("hidden", window.pageYOffset > 100);
    window.addEventListener("scroll", up); up();
}

let ticking = false;
window.addEventListener("scroll", () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            const s = window.pageYOffset;
            document.querySelectorAll(".shape").forEach((sh, i) => { sh.style.transform = `translateY(${s*(0.05+i*0.02)}px)`; });
            document.querySelectorAll(".dot").forEach((d, i) => { d.style.transform = `translateY(${-s*(0.03+i*0.01)}px) scale(${1+s*0.0001})`; });
            if (window.checkFormVisibility) window.checkFormVisibility();
            ticking = false;
        });
        ticking = true;
    }
});

function initEmailForm() {
    const emailButton        = document.getElementById("emailButton");
    const emailFormContainer = document.getElementById("emailFormContainer");
    const emailForm          = document.getElementById("emailForm");
    const formConfirmation   = document.getElementById("formConfirmation");
    const formError          = document.getElementById("formError");
    const submitButton       = emailForm.querySelector(".submit-button");
    let formIsOpen = false;

    emailButton.addEventListener("click", (e) => {
        e.preventDefault(); formIsOpen = !formIsOpen;
        if (formIsOpen) { emailFormContainer.classList.add("active"); setTimeout(() => emailFormContainer.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100); }
        else { emailFormContainer.classList.remove("active"); formConfirmation.classList.remove("show"); formError.classList.remove("show"); }
    });

    emailForm.addEventListener("submit", async (e) => {
        e.preventDefault(); submitButton.disabled = true; submitButton.textContent = "Sending...";
        formConfirmation.classList.remove("show"); formError.classList.remove("show");
        try {
            const res  = await fetch("https://api.web3forms.com/submit", { method: "POST", body: new FormData(emailForm) });
            const data = await res.json();
            if (data.success) {
                formConfirmation.classList.add("show"); emailForm.reset(); submitButton.disabled = false; submitButton.textContent = "Send Message";
                setTimeout(() => { formConfirmation.classList.remove("show"); setTimeout(() => { emailFormContainer.classList.remove("active"); formIsOpen = false; document.getElementById("contact").scrollIntoView({ behavior: "smooth", block: "start" }); }, 500); }, 3000);
            } else throw new Error(data.message || "Something went wrong.");
        } catch (err) {
            formError.textContent = `✗ ${err.message || "Network error."}`; formError.classList.add("show");
            submitButton.disabled = false; submitButton.textContent = "Send Message";
            setTimeout(() => formError.classList.remove("show"), 5000);
        }
    });

    window.checkFormVisibility = () => {
        if (!formIsOpen) return;
        const r = emailFormContainer.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight + 200) {
            emailFormContainer.classList.remove("active"); formConfirmation.classList.remove("show"); formError.classList.remove("show"); formIsOpen = false;
        }
    };
}

function initNavScroll() {
    const nav = document.querySelector(".main-nav");
    window.addEventListener("scroll", () => nav.classList.toggle("scrolled", window.scrollY > 50));
}

function initBurgerMenu() {
    const burger  = document.getElementById("burgerMenu");
    const links   = document.getElementById("navLinks");
    const overlay = document.getElementById("navOverlay");
    if (!burger) return;
    const open  = () => { burger.classList.add("active"); links.classList.add("active"); overlay.classList.add("active"); document.body.style.overflow = "hidden"; };
    const close = () => { burger.classList.remove("active"); links.classList.remove("active"); overlay.classList.remove("active"); document.body.style.overflow = ""; };
    burger.addEventListener("click", (e) => { e.stopPropagation(); burger.classList.contains("active") ? close() : open(); });
    overlay.addEventListener("click", close);
    document.querySelectorAll(".nav-links a").forEach(a => a.addEventListener("click", close));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && links.classList.contains("active")) close(); });
}

function initDarkMode() {
    const d = document.getElementById("darkModeToggleDesktop");
    const m = document.getElementById("darkModeToggle");
    const b = document.body;
    const s = localStorage.getItem("darkMode");
    if (s === "true") b.classList.add("dark-mode");
    else if (!s) localStorage.setItem("darkMode", "false");
    const t = () => { b.classList.toggle("dark-mode"); localStorage.setItem("darkMode", b.classList.contains("dark-mode")); };
    d?.addEventListener("click", t); m?.addEventListener("click", t);
}