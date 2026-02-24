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
        year: "2026",
        index: "02",
    },
    {
        title: "Coming Soon",
        description: "A new project is currently in development. Something interesting is on the way — check back soon.",
        tags: ["In Progress"],
        pageUrl: "404.html",
        imageUrl: "",
        year: "202?",
        index: "03",
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

    initMobileSectionObserver();

    setTimeout(() => {
        initInstantTapFeedback();
    }, 600);
});

// ─── BURGER MENU DECORATION INJECTION ────────────────────────────────
let _burgerDecorated = false;

function injectBurgerMenuDecoration() {
    if (window.innerWidth > 768) return;
    if (_burgerDecorated) return;
    _burgerDecorated = true;

    const navLinks = document.getElementById("navLinks");
    if (!navLinks) return;

    const links = navLinks.querySelectorAll("a[data-nav]");
    const indices = ["01", "02", "03"];
    links.forEach((link, i) => {
        const text = link.textContent.trim();
        link.innerHTML = `
            <span class="menu-index">${indices[i] || "0" + (i + 1)}</span>
            <span class="menu-text">${text}</span>
            <span class="menu-arrow">→</span>
        `;
    });

    const topbar = document.createElement("div");
    topbar.className = "nav-menu-topbar";
    topbar.innerHTML = `<span>Portfolio / 2026</span><span>Navigation</span>`;
    navLinks.appendChild(topbar);

    const bottombar = document.createElement("div");
    bottombar.className = "nav-menu-bottombar";
    bottombar.innerHTML = `
        <span style="display:flex;align-items:center;gap:6px">
            <span class="nav-menu-statusdot"></span>Online
        </span>
        <span>Based in United Kingdom</span>
    `;
    navLinks.appendChild(bottombar);

    ["tl", "tr", "bl", "br"].forEach((pos) => {
        const corner = document.createElement("div");
        corner.className = `nav-menu-corner nav-menu-corner--${pos}`;
        navLinks.appendChild(corner);
    });

    const line = document.createElement("div");
    line.className = "nav-menu-line";
    navLinks.appendChild(line);

    const dotsWrap = document.createElement("div");
    dotsWrap.className = "nav-menu-dots";
    dotsWrap.innerHTML = `
        <div class="nav-menu-dot"></div>
        <div class="nav-menu-dot"></div>
        <div class="nav-menu-dot"></div>
        <div class="nav-menu-dot"></div>
    `;
    navLinks.appendChild(dotsWrap);
}

// ─── MOBILE SECTION SCROLL OBSERVER ──────────────────────────────────
function initMobileSectionObserver() {
    if (window.innerWidth > 768) return;

    const sections = document.querySelectorAll(
        ".about-section, .projects-section, .quote-section, .contact-section"
    );

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                const el = entry.target;
                if (entry.isIntersecting) {
                    el.classList.add("section-visible");
                    el.classList.remove("section-above");
                } else {
                    const rect = el.getBoundingClientRect();
                    if (rect.top < 0) {
                        el.classList.add("section-above");
                        el.classList.remove("section-visible");
                    } else {
                        el.classList.remove("section-visible");
                        el.classList.remove("section-above");
                    }
                }
            });
        },
        { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    sections.forEach((s) => observer.observe(s));
}

// ─── INSTANT TAP FEEDBACK (mobile) ───────────────────────────────────
function initInstantTapFeedback() {
    if (window.innerWidth > 768) return;

    const FLASH_DURATION = 150;

    const logo = document.querySelector(".logo");
    if (logo) {
        logo.addEventListener("touchstart", () => {
            logo.style.transition = "color 0.1s ease, transform 0.1s ease";
            logo.style.color = "var(--color-accent)";
            logo.style.transform = "scale(1.08) rotate(-4deg)";
        }, { passive: true });
        const logoReset = () => {
            setTimeout(() => {
                logo.style.color = "";
                logo.style.transform = "";
                setTimeout(() => { logo.style.transition = ""; }, 300);
            }, FLASH_DURATION);
        };
        logo.addEventListener("touchend", logoReset, { passive: true });
        logo.addEventListener("touchcancel", logoReset, { passive: true });
    }

    document.querySelectorAll(".contact-link").forEach((el) => {
        el.addEventListener("touchstart", () => {
            el.style.transition = "border-color 0.1s ease, transform 0.1s ease";
            el.style.borderColor = "var(--color-accent)";
            el.style.transform = "translateX(5px)";
        }, { passive: true });
        const reset = () => {
            setTimeout(() => {
                el.style.borderColor = "";
                el.style.transform = "";
                setTimeout(() => { el.style.transition = ""; }, 300);
            }, FLASH_DURATION);
        };
        el.addEventListener("touchend", reset, { passive: true });
        el.addEventListener("touchcancel", reset, { passive: true });
    });

    const submitBtn = document.querySelector(".submit-button");
    if (submitBtn) {
        submitBtn.addEventListener("touchstart", () => {
            submitBtn.style.transition = "opacity 0.1s ease, transform 0.1s ease";
            submitBtn.style.opacity = "0.78";
            submitBtn.style.transform = "scale(0.98)";
        }, { passive: true });
        const reset = () => {
            setTimeout(() => {
                submitBtn.style.opacity = "";
                submitBtn.style.transform = "";
                setTimeout(() => { submitBtn.style.transition = ""; }, 300);
            }, FLASH_DURATION);
        };
        submitBtn.addEventListener("touchend", reset, { passive: true });
        submitBtn.addEventListener("touchcancel", reset, { passive: true });
    }

    document.querySelectorAll(".feature-item").forEach((el) => {
        el.addEventListener("touchstart", () => {
            el.style.transition = "transform 0.1s ease, border-left-width 0.1s ease";
            el.style.borderLeftWidth = "6px";
            el.style.transform = "translateX(5px)";
        }, { passive: true });
        const reset = () => {
            setTimeout(() => {
                el.style.borderLeftWidth = "";
                el.style.transform = "";
                setTimeout(() => { el.style.transition = ""; }, 300);
            }, FLASH_DURATION + 50);
        };
        el.addEventListener("touchend", reset, { passive: true });
        el.addEventListener("touchcancel", reset, { passive: true });
    });

    document.querySelectorAll(".project-grid-card").forEach((el) => {
        el.addEventListener("touchstart", () => {
            el.style.transition = "border-color 0.1s ease";
            el.style.borderColor = "var(--color-accent)";
        }, { passive: true });
        const reset = () => {
            setTimeout(() => {
                el.style.borderColor = "";
                setTimeout(() => { el.style.transition = ""; }, 300);
            }, FLASH_DURATION);
        };
        el.addEventListener("touchend", reset, { passive: true });
        el.addEventListener("touchcancel", reset, { passive: true });
    });
}

// ─── LOADING SCREEN ───────────────────────────────────────────────────
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

// ─── LOCK SYSTEM ──────────────────────────────────────────────────────
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
    if (typeof SiteConfig === "undefined") return;
    Object.entries(LOCK_CONFIG).forEach(([key, opts]) =>
        applySectionLock(SiteConfig[key] === true, opts)
    );
}

function applySectionLock(isLocked, opts) {
    const section = document.getElementById(opts.sectionId);
    const overlay = document.getElementById(opts.overlayId);
    if (!section || !overlay) return;
    const els = opts.interactiveSelectors
        ? opts.interactiveSelectors.flatMap((s) => [...document.querySelectorAll(s)])
        : [];
    if (isLocked) {
        section.classList.add("is-locked");
        els.forEach((el) => {
            el.setAttribute("tabindex", "-1");
            el.setAttribute("aria-hidden", "true");
        });
        section._lockHandler = (e) => {
            if (!e.target.closest(".section-lock-overlay")) {
                e.preventDefault();
                e.stopPropagation();
            }
        };
        section.addEventListener("click", section._lockHandler, true);
        section.addEventListener("touchstart", section._lockHandler, { capture: true, passive: false });
        section.addEventListener("touchend", section._lockHandler, { capture: true, passive: false });
    } else {
        section.classList.remove("is-locked");
        els.forEach((el) => {
            el.removeAttribute("tabindex");
            el.removeAttribute("aria-hidden");
        });
        if (section._lockHandler) {
            section.removeEventListener("click", section._lockHandler, true);
            section.removeEventListener("touchstart", section._lockHandler, true);
            section.removeEventListener("touchend", section._lockHandler, true);
        }
    }
}

// ─── PROJECT GRID ─────────────────────────────────────────────────────
function initProjects() {
    const grid = document.getElementById("projectGrid");
    if (!grid) return;

    projects.forEach((p, i) => {
        const card = createProjectCard(p, i);
        grid.appendChild(card);
    });
}

function createProjectCard(project, index) {
    const card = document.createElement("article");
    card.className = "project-grid-card";
    card.setAttribute("data-reveal", "");
    card.style.animationDelay = `${index * 0.15}s`;

    const hasImage = project.imageUrl && project.imageUrl.trim() !== "";
    const isPlaceholder = project.title === "Coming Soon";

    const imageHtml = hasImage
        ? `<div class="pgc-image"><img src="${project.imageUrl}" alt="${project.title}" /></div>`
        : `<div class="pgc-image pgc-image--empty">
               <div class="pgc-empty-grid"></div>
               <span class="pgc-empty-label">${isPlaceholder ? "In Development" : "No Preview"}</span>
           </div>`;

    const tagsHtml = project.tags.map((t) => `<span class="pgc-tag">${t}</span>`).join("");

    const linkHtml = isPlaceholder
        ? `<span class="pgc-link pgc-link--disabled">Coming Soon <span class="pgc-link-arrow">·</span></span>`
        : `<a href="${project.pageUrl}" class="pgc-link">View Project <span class="pgc-link-arrow">→</span></a>`;

    card.innerHTML = `
        <span class="pgc-corner pgc-corner--tl"></span>
        <span class="pgc-corner pgc-corner--tr"></span>
        <span class="pgc-corner pgc-corner--bl"></span>
        <span class="pgc-corner pgc-corner--br"></span>
        <div class="pgc-year">${project.year}</div>
        ${imageHtml}
        <div class="pgc-body">
            <div class="pgc-title-row">
                <h3 class="pgc-title">${project.title}</h3>
                <span class="pgc-title-line"></span>
            </div>
            <p class="pgc-desc">${project.description}</p>
            <div class="pgc-tags">${tagsHtml}</div>
            <div class="pgc-footer">
                ${linkHtml}
                <span class="pgc-index-ghost">${project.index}</span>
            </div>
        </div>
    `;

    return card;
}

// ─── QUOTE ────────────────────────────────────────────────────────────
function initQuoteOfTheDay() {
    const quoteText = document.getElementById("quoteText");
    const quoteAuthor = document.getElementById("quoteAuthor");
    if (!quoteText || !quoteAuthor) return;
    const now = new Date();
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
    const q = dailyQuotes[dayOfYear % dailyQuotes.length];
    quoteText.textContent = q.text;
    quoteAuthor.textContent = `— ${q.author}`;
}

// ─── SCROLL ANIMATIONS ────────────────────────────────────────────────
function initScrollAnimations() {
    const observer = new IntersectionObserver(
        (entries) =>
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add("revealed");
                    observer.unobserve(e.target);
                }
            }),
        { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
}

// ─── SMOOTH SCROLL ────────────────────────────────────────────────────
// iOS Safari has a known bug where JS-driven requestAnimationFrame scroll
// combined with css scroll-behavior:smooth causes stuttering/glitching.
// On mobile we disable css smooth-scroll on <html> and use a clean
// JS easing scroll that doesn't fight the browser compositor.

function isMobile() {
    return window.innerWidth <= 768;
}

/**
 * iOS-safe smooth scroll.
 * Uses a clean easeInOutQuad and temporarily removes scroll-behavior:smooth
 * on the html element to prevent iOS Safari double-interpolation glitches.
 * Duration is slightly longer on mobile for a relaxed feel.
 */
function smoothScrollToMobile(targetY, duration) {
    // Disable native smooth scroll during our animation to avoid iOS glitch
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.scrollBehavior = "auto";

    const startY = window.pageYOffset;
    const distance = targetY - startY;
    let startTime = null;

    // easeInOutQuad — smooth start and end, no bounce
    function ease(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    function step(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = ease(progress);

        window.scrollTo(0, startY + distance * easedProgress);

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            // Restore smooth scroll behaviour after animation completes
            document.documentElement.style.scrollBehavior = "";
            document.body.style.scrollBehavior = "";
        }
    }

    requestAnimationFrame(step);
}

/**
 * Desktop smooth scroll — original cubic easing, unchanged.
 */
function smoothScrollToDesktop(to, dur) {
    const start = window.pageYOffset;
    const dist = to - start;
    let t0 = null;
    const ease = (t, b, c, d) => {
        t /= d / 2;
        if (t < 1) return (c / 2) * t * t * t + b;
        t -= 2;
        return (c / 2) * (t * t * t + 2) + b;
    };
    const tick = (now) => {
        if (!t0) t0 = now;
        const e = now - t0;
        window.scrollTo(0, ease(e, start, dist, dur));
        if (e < dur) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}

function initSmoothScroll() {
    document.querySelectorAll("[data-nav]").forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute("href"));
            if (!target) return;

            const targetY = target.offsetTop - 80;

            if (isMobile()) {
                // Mobile: close the burger menu first, then scroll after a short
                // delay so the menu close animation doesn't fight the scroll.
                // Duration: 900ms — noticeable but smooth, matches the AJ logo feel.
                closeBurgerMenu();
                setTimeout(() => {
                    smoothScrollToMobile(targetY, 900);
                }, 80);
            } else {
                // Desktop: original behaviour, unchanged
                smoothScrollToDesktop(targetY, 1200);
            }
        });
    });
}

// ─── BURGER MENU ─────────────────────────────────────────────────────
// Extracted close logic into its own function so smoothScroll can call it.
let _burgerCloseCallback = null;

function closeBurgerMenu() {
    if (_burgerCloseCallback) _burgerCloseCallback();
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

    if (window.innerWidth <= 768) return;

    let visible = true;
    let fadeTimeout = null;

    const enableFade = () => {
        el.style.animation = "none";
        el.style.transition = "opacity 0.9s ease, transform 0.9s ease";
        el.style.opacity = "1";
        el.style.transform = "translateX(-50%) translateY(0)";
        window.removeEventListener("scroll", enableFade);
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
    };

    const handleScroll = () => {
        const shouldHide = window.pageYOffset > 100;
        if (shouldHide && visible) {
            visible = false;
            el.style.opacity = "0";
            el.style.transform = "translateX(-50%) translateY(14px)";
            clearTimeout(fadeTimeout);
            fadeTimeout = setTimeout(() => {
                el.style.visibility = "hidden";
            }, 900);
        } else if (!shouldHide && !visible) {
            visible = true;
            clearTimeout(fadeTimeout);
            el.style.visibility = "visible";
            el.style.opacity = "1";
            el.style.transform = "translateX(-50%) translateY(0)";
        }
    };

    setTimeout(enableFade, 2800);
}

let ticking = false;
window.addEventListener("scroll", () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            const s = window.pageYOffset;
            document.querySelectorAll(".shape").forEach((sh, i) => {
                sh.style.transform = `translateY(${s * (0.05 + i * 0.02)}px)`;
            });
            document.querySelectorAll(".dot").forEach((d, i) => {
                d.style.transform = `translateY(${-s * (0.03 + i * 0.01)}px) scale(${1 + s * 0.0001})`;
            });
            if (window.checkFormVisibility) window.checkFormVisibility();
            ticking = false;
        });
        ticking = true;
    }
});

function initEmailForm() {
    const emailButton = document.getElementById("emailButton");
    const emailFormContainer = document.getElementById("emailFormContainer");
    const emailForm = document.getElementById("emailForm");
    const formConfirmation = document.getElementById("formConfirmation");
    const formError = document.getElementById("formError");
    const submitButton = emailForm.querySelector(".submit-button");
    let formIsOpen = false;

    emailButton.addEventListener("click", (e) => {
        e.preventDefault();
        formIsOpen = !formIsOpen;
        if (formIsOpen) {
            emailFormContainer.classList.add("active");
            setTimeout(() => emailFormContainer.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
        } else {
            emailFormContainer.classList.remove("active");
            formConfirmation.classList.remove("show");
            formError.classList.remove("show");
        }
    });

    emailForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
        formConfirmation.classList.remove("show");
        formError.classList.remove("show");
        try {
            const res = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: new FormData(emailForm),
            });
            const data = await res.json();
            if (data.success) {
                formConfirmation.classList.add("show");
                emailForm.reset();
                submitButton.disabled = false;
                submitButton.textContent = "Send Message";
                setTimeout(() => {
                    formConfirmation.classList.remove("show");
                    setTimeout(() => {
                        emailFormContainer.classList.remove("active");
                        formIsOpen = false;
                        document.getElementById("contact").scrollIntoView({ behavior: "smooth", block: "start" });
                    }, 500);
                }, 3000);
            } else throw new Error(data.message || "Something went wrong.");
        } catch (err) {
            formError.textContent = `✗ ${err.message || "Network error."}`;
            formError.classList.add("show");
            submitButton.disabled = false;
            submitButton.textContent = "Send Message";
            setTimeout(() => formError.classList.remove("show"), 5000);
        }
    });

    window.checkFormVisibility = () => {
        if (!formIsOpen) return;
        const r = emailFormContainer.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight + 200) {
            emailFormContainer.classList.remove("active");
            formConfirmation.classList.remove("show");
            formError.classList.remove("show");
            formIsOpen = false;
        }
    };
}

function initNavScroll() {
    const nav = document.querySelector(".main-nav");
    window.addEventListener("scroll", () => nav.classList.toggle("scrolled", window.scrollY > 50));
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

    // Expose close to smoothScroll
    _burgerCloseCallback = close;

    burger.addEventListener("click", (e) => {
        e.stopPropagation();
        burger.classList.contains("active") ? close() : open();
    });
    overlay.addEventListener("click", close);

    // Nav links: close is now handled inside initSmoothScroll for [data-nav] links.
    // For any other links (non data-nav) inside the menu, close normally.
    links.querySelectorAll("a:not([data-nav])").forEach((a) => a.addEventListener("click", close));

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && links.classList.contains("active")) close();
    });

    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 768) {
                burger.classList.remove("active");
                links.classList.remove("active");
                overlay.classList.remove("active");
                document.body.style.overflow = "";
                links.style.display = "";
                links.style.position = "";
                links.style.top = "";
                links.style.left = "";
                links.style.width = "";
                links.style.height = "";
                links.style.flexDirection = "";
                links.style.justifyContent = "";
                links.style.alignItems = "";
                links.style.zIndex = "";
                links.style.padding = "";
                links.style.gap = "";
                links.style.background = "";
                links.style.backgroundImage = "";
                links.style.overflow = "";
            }
        }, 50);
    });
}

function initDarkMode() {
    const d = document.getElementById("darkModeToggleDesktop");
    const m = document.getElementById("darkModeToggle");
    const b = document.body;
    const s = localStorage.getItem("darkMode");
    if (s === "true") b.classList.add("dark-mode");
    else if (!s) localStorage.setItem("darkMode", "false");
    const t = () => {
        b.classList.toggle("dark-mode");
        localStorage.setItem("darkMode", b.classList.contains("dark-mode"));
    };
    d?.addEventListener("click", t);
    m?.addEventListener("click", t);
}