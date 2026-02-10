const projects = [
    {
        title: "Custom Wordle",
        description:
            "This is a custom Wordle game mode designed for two users, where one user chooses the target word and the other user tries to guess it.",
        tags: ["HTML", "CSS", "JAVASCRIPT"],
        pageUrl: "/Wordle/wordle.html",
        imageUrl: "/Assets/wordle.png",
    },
    {
        title: "Chromatic Memory",
        description:
            "Chromatic Memory is a minimalistic game, where the player has to memorise the color pattern to win. ",
        tags: ["HTML", "CSS", "JAVASCRIPT"],
        pageUrl: "/chromatic/chromatic.html",
        imageUrl: "/Assets/ChromaticMemory.png",
    },
    {
        title: "Temp/Noth",
        description: "Temp/Noth",
        tags: ["Temp/Noth", "Temp/Noth", "Temp/Noth"],
        pageUrl: "project3.html",
        imageUrl: "",
    },
];

// Daily quotes collection
const dailyQuotes = [
    {
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
    },
    {
        text: "Innovation distinguishes between a leader and a follower.",
        author: "Steve Jobs",
    },
    {
        text: "Code is like humor. When you have to explain it, it's bad.",
        author: "Cory House",
    },
    {
        text: "First, solve the problem. Then, write the code.",
        author: "John Johnson",
    },
    {
        text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
        author: "Martin Fowler",
    },
    {
        text: "The best way to predict the future is to invent it.",
        author: "Alan Kay",
    },
    {
        text: "Simplicity is the soul of efficiency.",
        author: "Austin Freeman",
    },
    {
        text: "Make it work, make it right, make it fast.",
        author: "Kent Beck",
    },
    {
        text: "Technology is best when it brings people together.",
        author: "Matt Mullenweg",
    },
    {
        text: "The function of good software is to make the complex appear to be simple.",
        author: "Grady Booch",
    },
    {
        text: "Perfection is achieved not when there is nothing more to add, but rather when there is nothing more to take away.",
        author: "Antoine de Saint-Exupéry",
    },
    {
        text: "I have no special talents. I am only passionately curious",
        author: "Albert Einstein",
    },
    {
        text: "Continuous improvement is better than delayed perfection.",
        author: "Mark Twain",
    },
    {
        text: "Programs must be written for people to read, and only incidentally for machines to execute.",
        author: "Harold Abelson",
    },
    {
        text: "The most disastrous thing that you can ever learn is your first programming language.",
        author: "Alan Kay",
    },
    {
        text: "Software is a great combination between artistry and engineering.",
        author: "Bill Gates",
    },
    {
        text: "Good design is as little design as possible.",
        author: "Dieter Rams",
    },
    {
        text: "Debugging is twice as hard as writing the code in the first place.",
        author: "Brian Kernighan",
    },
    {
        text: "Every great developer you know got there by solving problems they were unqualified to solve until they actually did it.",
        author: "Patrick McKenzie",
    },
    {
        text: "Walking on water and developing software from a specification are easy if both are frozen.",
        author: "Edward V. Berard",
    },
    {
        text: "The best error message is the one that never shows up.",
        author: "Thomas Fuchs",
    },
    {
        text: "Don't comment bad code — rewrite it.",
        author: "Brian Kernighan",
    },
    {
        text: "Experience is the name everyone gives to their mistakes.",
        author: "Oscar Wilde",
    },
    {
        text: "Quality is not an act, it is a habit.",
        author: "Aristotle",
    },
    {
        text: "Design is not just what it looks like and feels like. Design is how it works.",
        author: "Steve Jobs",
    },
    {
        text: "The only impossible journey is the one you never begin.",
        author: "Tony Robbins",
    },
    {
        text: "It's not a bug – it's an undocumented feature.",
        author: "Anonymous",
    },
    {
        text: "Talk is cheap. Show me the code.",
        author: "Linus Torvalds",
    },
    {
        text: "Learning to write programs stretches your mind and helps you think better.",
        author: "Bill Gates",
    },
    {
        text: "The computer was born to solve problems that did not exist before.",
        author: "Bill Gates",
    },
];

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
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
});

// Initialize Quote of the Day
function initQuoteOfTheDay() {
    const quoteText = document.getElementById("quoteText");
    const quoteAuthor = document.getElementById("quoteAuthor");

    if (!quoteText || !quoteAuthor) return;

    // Get the day of the year (1-365/366)
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    // Use the day of year to select a quote (cycles through the quotes array)
    const quoteIndex = dayOfYear % dailyQuotes.length;
    const todaysQuote = dailyQuotes[quoteIndex];

    // Set the quote and author
    quoteText.textContent = todaysQuote.text;
    quoteAuthor.textContent = `— ${todaysQuote.author}`;
}

// Populate projects grid
function initProjects() {
    const projectsGrid = document.getElementById("projectsGrid");

    projects.forEach((project, index) => {
        const projectCard = createProjectCard(project, index);
        projectsGrid.appendChild(projectCard);
    });
}

// Create a project card element
function createProjectCard(project, index) {
    const card = document.createElement("div");
    card.className = "project-card";
    card.style.animationDelay = `${index * 0.1}s`;
    card.setAttribute("data-reveal", "");

    card.innerHTML = `
        <div class="project-number">Project ${String(index + 1).padStart(2, "0")}</div>
        <h3 class="project-title">${project.title}</h3>
        <div class="project-image">
            <img src="${project.imageUrl}" alt="${project.title}" />
        </div>
        <p class="project-description">${project.description}</p>
        <div class="project-tags">
            ${project.tags.map((tag) => `<span class="project-tag">${tag}</span>`).join("")}
        </div>
        <a href="${project.pageUrl}" class="project-link">
            View Project
        </a>
    `;

    // Add click handler to open project page
    card.addEventListener("click", (e) => {
        // Don't trigger if clicking directly on the link
        if (e.target.classList.contains("project-link")) return;
        window.location.href = project.pageUrl;
    });

    return card;
}

// Initialize scroll-triggered animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("revealed");
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all elements with data-reveal attribute
    const revealElements = document.querySelectorAll("[data-reveal]");
    revealElements.forEach((el) => observer.observe(el));
}

// Smooth scroll for navigation links - UPDATED WITH CUSTOM EASING
function initSmoothScroll() {
    const navLinks = document.querySelectorAll("[data-nav]");

    navLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = link.getAttribute("href");
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;

                // Custom smooth scroll with easing for slower, more elegant animation
                smoothScrollTo(offsetTop, 1200); // 1200ms duration
            }
        });
    });
}

// Custom smooth scroll function with easing
function smoothScrollTo(targetPosition, duration) {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = easeInOutCubic(
            timeElapsed,
            startPosition,
            distance,
            duration,
        );
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    // Easing function for smooth deceleration
    function easeInOutCubic(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return (c / 2) * t * t * t + b;
        t -= 2;
        return (c / 2) * (t * t * t + 2) + b;
    }

    requestAnimationFrame(animation);
}

// Hero animation on load
function initHeroAnimation() {
    // Trigger hero animations after a short delay
    setTimeout(() => {
        const titleLine = document.querySelector(".title-line");
        const heroSubtitle = document.querySelector(".hero-subtitle");

        if (titleLine) titleLine.classList.add("revealed");
        if (heroSubtitle) heroSubtitle.classList.add("revealed");
    }, 300);
}

// Initialize scroll indicator visibility based on scroll position
function initScrollIndicator() {
    const scrollIndicator = document.getElementById("scrollIndicator");

    if (!scrollIndicator) return;

    function updateScrollIndicator() {
        const scrollPosition =
            window.pageYOffset || document.documentElement.scrollTop;

        // Hide indicator when scrolled down more than 100px
        if (scrollPosition > 100) {
            scrollIndicator.classList.add("hidden");
        } else {
            scrollIndicator.classList.remove("hidden");
        }
    }

    // Check on scroll
    window.addEventListener("scroll", updateScrollIndicator);

    // Initial check
    updateScrollIndicator();
}

// Add parallax effect to section numbers on scroll
let ticking = false;
window.addEventListener("scroll", () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const scrolled = window.pageYOffset;
            const sectionNumbers = document.querySelectorAll(".section-number");

            sectionNumbers.forEach((number) => {
                const speed = 0.5;
                const yPos = -(scrolled * speed);
                number.style.transform = `translateY(${yPos}px)`;
            });

            // Parallax for floating shapes
            const shapes = document.querySelectorAll(".shape");
            shapes.forEach((shape, index) => {
                const speed = 0.05 + index * 0.02;
                const yPos = scrolled * speed;
                shape.style.transform = `translateY(${yPos}px)`;
            });

            // Parallax for decorative dots
            const dots = document.querySelectorAll(".dot");
            dots.forEach((dot, index) => {
                const speed = 0.03 + index * 0.01;
                const yPos = -scrolled * speed;
                dot.style.transform = `translateY(${yPos}px) scale(${1 + scrolled * 0.0001})`;
            });

            // Check if user scrolled away from form
            if (window.checkFormVisibility) {
                window.checkFormVisibility();
            }

            ticking = false;
        });
        ticking = true;
    }
});

// Email form functionality with Web3Forms integration
function initEmailForm() {
    const emailButton = document.getElementById("emailButton");
    const emailFormContainer = document.getElementById("emailFormContainer");
    const emailForm = document.getElementById("emailForm");
    const formConfirmation = document.getElementById("formConfirmation");
    const formError = document.getElementById("formError");
    const submitButton = emailForm.querySelector(".submit-button");

    let formIsOpen = false;

    // Toggle form on email button click
    emailButton.addEventListener("click", (e) => {
        e.preventDefault();
        formIsOpen = !formIsOpen;

        if (formIsOpen) {
            emailFormContainer.classList.add("active");
            // Scroll to form smoothly
            setTimeout(() => {
                emailFormContainer.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                });
            }, 100);
        } else {
            emailFormContainer.classList.remove("active");
            formConfirmation.classList.remove("show");
            formError.classList.remove("show");
        }
    });

    // Handle form submission with Web3Forms
    emailForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Disable submit button
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";

        // Hide any previous messages
        formConfirmation.classList.remove("show");
        formError.classList.remove("show");

        // Get form data
        const formData = new FormData(emailForm);

        try {
            // Submit to Web3Forms
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                // Show success message
                formConfirmation.classList.add("show");

                // Reset form
                emailForm.reset();

                // Re-enable submit button
                submitButton.disabled = false;
                submitButton.textContent = "Send Message";

                // Hide form and scroll back after 3 seconds
                setTimeout(() => {
                    formConfirmation.classList.remove("show");
                    setTimeout(() => {
                        emailFormContainer.classList.remove("active");
                        formIsOpen = false;

                        // Scroll back to contact section
                        document.getElementById("contact").scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                        });
                    }, 500);
                }, 3000);
            } else {
                // Show error message
                formError.textContent = `✗ ${data.message || "Something went wrong. Please try again."}`;
                formError.classList.add("show");

                // Re-enable submit button
                submitButton.disabled = false;
                submitButton.textContent = "Send Message";

                // Hide error after 5 seconds
                setTimeout(() => {
                    formError.classList.remove("show");
                }, 5000);
            }
        } catch (error) {
            console.error("Form submission error:", error);

            // Show error message
            formError.textContent =
                "✗ Network error. Please check your connection and try again.";
            formError.classList.add("show");

            // Re-enable submit button
            submitButton.disabled = false;
            submitButton.textContent = "Send Message";

            // Hide error after 5 seconds
            setTimeout(() => {
                formError.classList.remove("show");
            }, 5000);
        }
    });

    // Check if form is visible in viewport
    function checkFormVisibility() {
        if (!formIsOpen) return;

        const formRect = emailFormContainer.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // If form is completely out of view (above or below viewport)
        if (formRect.bottom < 0 || formRect.top > windowHeight + 200) {
            emailFormContainer.classList.remove("active");
            formConfirmation.classList.remove("show");
            formError.classList.remove("show");
            formIsOpen = false;
        }
    }

    // Export checkFormVisibility for use in scroll handler
    window.checkFormVisibility = checkFormVisibility;
}

// Handle navigation background on scroll
function initNavScroll() {
    const nav = document.querySelector(".main-nav");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            nav.classList.add("scrolled");
        } else {
            nav.classList.remove("scrolled");
        }
    });
}

// Burger menu functionality
function initBurgerMenu() {
    const burgerMenu = document.getElementById("burgerMenu");
    const navLinks = document.getElementById("navLinks");
    const navOverlay = document.getElementById("navOverlay");
    const navLinkItems = document.querySelectorAll(".nav-links a");

    if (!burgerMenu) return; // Exit if burger menu doesn't exist

    // Toggle menu
    function toggleMenu() {
        const isActive = burgerMenu.classList.contains("active");

        if (isActive) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    // Open menu
    function openMenu() {
        burgerMenu.classList.add("active");
        navLinks.classList.add("active");
        navOverlay.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    // Close menu
    function closeMenu() {
        burgerMenu.classList.remove("active");
        navLinks.classList.remove("active");
        navOverlay.classList.remove("active");
        document.body.style.overflow = "";
    }

    // Burger menu click
    burgerMenu.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    // Overlay click
    navOverlay.addEventListener("click", closeMenu);

    // Close menu when clicking nav links
    navLinkItems.forEach((link) => {
        link.addEventListener("click", (e) => {
            closeMenu();
        });
    });

    // Close menu on escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && navLinks.classList.contains("active")) {
            closeMenu();
        }
    });
}

// Dark mode functionality - MODIFIED to start in light mode by default
function initDarkMode() {
    const darkModeToggleDesktop = document.getElementById(
        "darkModeToggleDesktop",
    );
    const darkModeToggleMobile = document.getElementById("darkModeToggle");
    const body = document.body;

    // Check for saved dark mode preference - only apply dark mode if explicitly saved as "true"
    const savedDarkMode = localStorage.getItem("darkMode");
    const isDarkMode = savedDarkMode === "true";

    // Apply dark mode ONLY if it was previously enabled and saved
    if (isDarkMode) {
        body.classList.add("dark-mode");
    } else {
        // Explicitly ensure we're in light mode
        body.classList.remove("dark-mode");
        // If there's no saved preference, set it to false (light mode)
        if (savedDarkMode === null) {
            localStorage.setItem("darkMode", "false");
        }
    }

    // Toggle dark mode function
    function toggleDarkMode() {
        body.classList.toggle("dark-mode");
        const isDark = body.classList.contains("dark-mode");
        localStorage.setItem("darkMode", isDark);
    }

    // Add event listeners to both toggle buttons
    if (darkModeToggleDesktop) {
        darkModeToggleDesktop.addEventListener("click", toggleDarkMode);
    }

    if (darkModeToggleMobile) {
        darkModeToggleMobile.addEventListener("click", toggleDarkMode);
    }
}
