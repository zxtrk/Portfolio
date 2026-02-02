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
        title: "Temp/Noth",
        description: "Temp/Noth",
        tags: ["Temp/Noth", "Temp/Noth", "Temp/Noth"],
        pageUrl: "vika.html",
        imageUrl: "/Assets/vika.png",
    },
    {
        title: "Temp/Noth",
        description: "Temp/Noth",
        tags: ["Temp/Noth", "Temp/Noth", "Temp/Noth"],
        pageUrl: "project3.html",
        imageUrl:
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
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
});

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
        window.location.href = project.pageUrl; // Changed to navigate to HTML page
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

// Smooth scroll for navigation links
function initSmoothScroll() {
    const navLinks = document.querySelectorAll("[data-nav]");

    navLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = link.getAttribute("href");
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: "smooth",
                });
            }
        });
    });
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
