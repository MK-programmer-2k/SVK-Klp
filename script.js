document.addEventListener("DOMContentLoaded", () => {

    // ─── SCROLL PROGRESS & NAVBAR ─────────────────────────────────────────────
    const navbar = document.querySelector(".navbar");
    const backToTopBtn = document.getElementById("back-to-top");
    const scrollProgress = document.getElementById("scroll-progress");

    window.addEventListener("scroll", () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;

        if (docHeight > 0) {
            scrollProgress.style.width = (scrollTop / docHeight) * 100 + "%";
        }

        navbar.classList.toggle("sticky", scrollTop > 50);
        backToTopBtn.classList.toggle("show", scrollTop > 300);
        scrollSpy();
    });

    backToTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // ─── MOBILE MENU ──────────────────────────────────────────────────────────
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const navLinksContainer = document.querySelector(".nav-links");

    mobileMenuBtn.addEventListener("click", () => {
        navLinksContainer.classList.toggle("active");
        const icon = mobileMenuBtn.querySelector("i");
        icon.classList.toggle("fa-bars");
        icon.classList.toggle("fa-xmark");
    });

    document.querySelectorAll(".nav-links a").forEach(link => {
        link.addEventListener("click", () => {
            navLinksContainer.classList.remove("active");
            const icon = mobileMenuBtn.querySelector("i");
            icon.classList.add("fa-bars");
            icon.classList.remove("fa-xmark");
        });
    });

    // ─── SCROLL SPY ───────────────────────────────────────────────────────────
    const sections = document.querySelectorAll("section");
    const menuItems = document.querySelectorAll(".nav-links a");

    function scrollSpy() {
        let current = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute("id");
            }
        });

        menuItems.forEach(item => {
            item.classList.remove("active");
            if (item.getAttribute("href").slice(1) === current) {
                item.classList.add("active");
            }
        });
    }

    // ─── GALLERY - DYNAMIC IMAGE LOADER ───────────────────────────────────────
    const galleryGrid = document.getElementById("gallery-masonry-grid");
    const eventTabsContainer = document.getElementById("gallery-event-tabs");
    const yearTabsContainer = document.getElementById("gallery-year-tabs");
    const emptyGalleryMsg = document.getElementById("gallery-empty");

    // Image mapping - linking klp IDs to their display names and folder naming
    const galleryConfig = {
        klp1: {
            name: "பொங்கல் விளையாட்டு",
            folder: "SVK BOYS",
            yearsAvailable: [2023, 2025, 2026],
            imageCount: 1
        },
        klp2: {
            name: "ஸ்ரீ அழகுநாச்சியம்மன் - பூச்சொரிதல்",
            folder: "SVK BOYS",
            yearsAvailable: [2022, 2025, 2026],
            hasVideo: true
        },
        klp3: {
            name: "17-வது மண்டகப்படி",
            folder: "SVK BOYS",
            yearsAvailable: [2022, 2023, 2024],
            hasVideo: true
        },
        klp4: {
            name: "கோடை நிகழ்ச்சி",
            folder: "SVK BOYS",
            yearsAvailable: [2023, 2025, 2026],
            hasVideo: true
        },
        klp5: {
            name: "விநாயகர் சதுர்த்தி",
            folder: "SVK BOYS",
            yearsAvailable: [2024],
            hasVideo: true
        }
    };

    // List of files we know exist (from the folder structure)
    const knownFiles = [
        // klp1 files
        { klp: "klp1", year: 2023, file: "klp1_2023.heic", type: "image" },
        { klp: "klp1", year: 2023, file: "klp1_2023 (2).heic", type: "image" },
        { klp: "klp1", year: 2025, file: "klp1_2025.heic", type: "image" },
        { klp: "klp1", year: 2026, file: "klp1_2026.jpeg", type: "image" },
        
        // klp2 files
        { klp: "klp2", year: 2022, file: "klp2_2022.jpg", type: "image" },
        { klp: "klp2", year: 2025, file: "klp2_2025.mp4", type: "video" },
        { klp: "klp2", year: 2026, file: "klp2_2026.heic", type: "image" },
        { klp: "klp2", year: 2026, file: "klp2_2026.mp4", type: "video" },
        
        // klp3 files
        { klp: "klp3", year: 2022, file: "klp3_2022.jpg", type: "image" },
        { klp: "klp3", year: 2022, file: "klp3_2022 (2).jpg", type: "image" },
        { klp: "klp3", year: 2022, file: "klp3_2022.mp4", type: "video" },
        { klp: "klp3", year: 2023, file: "klp3_2023.heic", type: "image" },
        { klp: "klp3", year: 2023, file: "klp3_2023.mp4", type: "video" },
        { klp: "klp3", year: 2024, file: "klp3_2024.heic", type: "image" },
        
        // klp4 files
        { klp: "klp4", year: 2023, file: "klp4_2023.mp4", type: "video" },
        { klp: "klp4", year: 2025, file: "klp4_2025.mp4", type: "video" },
        { klp: "klp4", year: 2026, file: "klp4_2026.mp4", type: "video" },
        
        // klp5 files
        { klp: "klp5", year: 2024, file: "klp5_2024.heic", type: "image" },
        { klp: "klp5", year: 2024, file: "klp5_2024 (2).heic", type: "image" },
        { klp: "klp5", year: 2024, file: "klp5_2024.mp4", type: "video" },
        { klp: "klp5", year: 2024, file: "klp5_2024 (2).mp4", type: "video" }
    ];

    let currentFilter = "all";
    let currentYear = "all";
    let allGalleryItems = [];

    // Create gallery items from known files (encode paths, gracefully handle unsupported formats like HEIC)
    function createGalleryItems() {
        galleryGrid.innerHTML = '';
        allGalleryItems = [];

        knownFiles.forEach(file => {
            const item = document.createElement("div");
            item.className = "gallery-item";
            item.setAttribute("data-klp", file.klp);
            item.setAttribute("data-year", file.year);

            // Build a safe URL for the file path
            const rawPath = `images/SVK BOYS/${file.file}`;
            const imagePath = encodeURI(rawPath);

            if (file.type === "video") {
                item.innerHTML = `
                    <video width="100%" height="100%" style="object-fit: cover;">
                        <source src="${imagePath}" type="video/mp4">
                    </video>
                    <div class="video-badge"><i class="fas fa-play"></i> வீடியோ</div>
                    <div class="gallery-overlay">
                        <h4>${galleryConfig[file.klp].name}</h4>
                        <span>${file.year}</span>
                    </div>
                `;

                item.addEventListener("click", () => openLightbox(file, imagePath));
                galleryGrid.appendChild(item);
                allGalleryItems.push(item);
                return;
            }

            // For images create an <img> element so we can attach error handling
            const img = document.createElement('img');
            img.loading = 'lazy';
            img.alt = `${galleryConfig[file.klp].name} - ${file.year}`;

            // Assign src and handle unsupported formats (HEIC/HEIF) or load errors
            img.src = imagePath;
            img.style.objectFit = 'cover';

            // Fallback SVG placeholder generator
            function placeholderDataUrl(title, year) {
                const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'>\n                    <defs>\n                        <linearGradient id='g' x1='0' x2='1'>\n                            <stop stop-color='%23E6E9ED' offset='0'/>\n                            <stop stop-color='%23D1D5DB' offset='1'/>\n                        </linearGradient>\n                    </defs>\n                    <rect width='100%' height='100%' fill='url(%23g)' />\n                    <text x='50%' y='45%' dominant-baseline='middle' text-anchor='middle' font-family='Poppins, sans-serif' font-size='36' fill='%23938E99'>${escapeHtml(title)}</text>\n                    <text x='50%' y='57%' dominant-baseline='middle' text-anchor='middle' font-family='Poppins, sans-serif' font-size='22' fill='%23838B90'>${escapeHtml(year.toString())}</text>\n                </svg>`;
                return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
            }

            function escapeHtml(s) {
                return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            }

            img.addEventListener('error', function () {
                // If the file is HEIC/HEIF sometimes browsers don't support it — show placeholder or try .jpg sibling
                const ext = (file.file.split('.').pop() || '').toLowerCase();
                if (ext === 'heic' || ext === 'heif') {
                    // Try a .jpg sibling first (common conversion); if that fails placeholder will remain
                    const jpgPath = encodeURI(`images/SVK BOYS/${file.file.replace(/\.(heic|heif)$/i, '.jpg')}`);
                    if (jpgPath !== imagePath) {
                        this.onerror = null;
                        this.src = jpgPath;
                        return;
                    }
                }

                this.onerror = null;
                this.src = placeholderDataUrl(galleryConfig[file.klp].name, file.year);
                this.classList.add('unsupported');
            });

            item.appendChild(img);

            // Overlay
            const overlay = document.createElement('div');
            overlay.className = 'gallery-overlay';
            overlay.innerHTML = `<h4>${galleryConfig[file.klp].name}</h4><span>${file.year}</span>`;
            item.appendChild(overlay);

            item.addEventListener("click", () => openLightbox(file, imagePath));
            galleryGrid.appendChild(item);
            allGalleryItems.push(item);
        });

        updateGalleryDisplay();
    }

    const eventOptions = document.querySelectorAll(".option");

    function setActiveEventOption(eventKey) {
        eventOptions.forEach(option => {
            const isActive = option.dataset.event === eventKey;
            option.classList.toggle("active", isActive);
        });

        currentFilter = eventKey;
        document.querySelectorAll("#gallery-event-tabs .gallery-tab-btn").forEach(btn => {
            btn.classList.toggle("active", btn.dataset.filter === eventKey);
        });
        updateGalleryDisplay();
    }

    eventOptions.forEach(option => {
        option.addEventListener("click", () => {
            setActiveEventOption(option.dataset.event);
        });
    });

    // Initialize gallery filter from the active option (if any)
    const initialActiveOption = document.querySelector('.option.active');
    if (initialActiveOption) {
        setActiveEventOption(initialActiveOption.dataset.event);
    }

    // Filter gallery
    function updateGalleryDisplay() {
        let visibleCount = 0;

        allGalleryItems.forEach(item => {
            const klp = item.getAttribute("data-klp");
            const year = item.getAttribute("data-year");

            const klpMatch = currentFilter === "all" || klp === currentFilter;
            const yearMatch = currentYear === "all" || year === currentYear;

            if (klpMatch && yearMatch) {
                item.classList.remove("hide");
                visibleCount++;
            } else {
                item.classList.add("hide");
            }
        });

        emptyGalleryMsg.style.display = visibleCount === 0 ? "block" : "none";
    }

    // Event filter buttons
    if (eventTabsContainer) {
        eventTabsContainer.addEventListener("click", (e) => {
            if (e.target.classList.contains("gallery-tab-btn")) {
                document.querySelectorAll("#gallery-event-tabs .gallery-tab-btn").forEach(btn => {
                    btn.classList.remove("active");
                });
                e.target.classList.add("active");
                currentFilter = e.target.getAttribute("data-filter");
                updateGalleryDisplay();
            }
        });
    }

    // Year filter buttons
    if (yearTabsContainer) {
        yearTabsContainer.addEventListener("click", (e) => {
            if (e.target.classList.contains("gallery-tab-btn")) {
                document.querySelectorAll("#gallery-year-tabs .gallery-tab-btn").forEach(btn => {
                    btn.classList.remove("active");
                });
                e.target.classList.add("active");
                currentYear = e.target.getAttribute("data-year");
                updateGalleryDisplay();
            }
        });
    }

    // Initialize gallery
    createGalleryItems();

    // ─── LIGHTBOX ─────────────────────────────────────────────────────────────
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.querySelector(".lightbox-img");
    const lightboxVideo = document.querySelector(".lightbox-video");
    const lightboxCaption = document.querySelector(".lightbox-caption");
    const lightboxClose = document.querySelector(".lightbox-close");

    function openLightbox(file, path) {
        lightbox.classList.add("active");
        lightboxCaption.textContent = `${galleryConfig[file.klp].name} - ${file.year}`;

        if (file.type === "video") {
            lightboxImg.style.display = "none";
            lightboxVideo.style.display = "block";
            lightboxVideo.querySelector("source").src = path;
        } else {
            lightboxVideo.style.display = "none";
            lightboxImg.style.display = "block";
            lightboxImg.src = path;
        }
    }

    lightboxClose.addEventListener("click", () => {
        lightbox.classList.remove("active");
        lightboxVideo.pause();
    });

    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove("active");
            lightboxVideo.pause();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && lightbox.classList.contains("active")) {
            lightbox.classList.remove("active");
            lightboxVideo.pause();
        }
    });

    // ─── CONTACT FORM ─────────────────────────────────────────────────────────
    const contactForm = document.getElementById("contact-form");
    
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const name = document.getElementById("name").value;
            const phone = document.getElementById("phone").value;
            const message = document.getElementById("message").value;

            // Simple validation
            if (!name || !phone || !message) {
                alert("அனைத்து புலங்களையும் நிரப்பவும்");
                return;
            }

            // You can integrate with a backend API here
            console.log("Message:", { name, phone, message });

            // Show success message
            alert("உங்கள் செய்தி வெற்றிகரமாக அனுப்பப்பட்டுள்ளது! நன்றி.");
            contactForm.reset();
        });
    }

    // ─── REVEAL ANIMATIONS (Intersection Observer) ────────────────────────────
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px"
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll(".reveal, .reveal-left, .reveal-right").forEach(el => {
        observer.observe(el);
    });

});
