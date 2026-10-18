// Brand marks are bundled here: current Lucide releases no longer include them.
// Replace them before createIcons so every archived page keeps visible social links.
const brandMarks = {
    youtube: '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 6 3-6 3Z"/>',
    twitter: '<path d="m4 3 16 18h-4L0 3h4Z" transform="translate(2 0)"/><path d="M21 3 3 21"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/>',
};
for (const icon of document.querySelectorAll('i[data-lucide]')) {
    const name = icon.getAttribute('data-lucide');
    if (!brandMarks[name]) continue;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('class', icon.className);
    svg.innerHTML = brandMarks[name];
    icon.replaceWith(svg);
}

// Initialize the remaining Lucide interface icons.
lucide.createIcons();

// DOM Elements
const mobileMenuButton = document.querySelector('[data-lucide="menu"]');
const mobileMenu = document.createElement('div');
mobileMenu.className = 'mobile-menu';

// Mobile Menu Setup
document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu();
    setupVideoThumbnails();
    setupLightbox();
    setupAnimations();
    setupHeaderScroll();
    setupPhotoFilters();
});

// Header scroll behavior: make header black on scroll
function setupHeaderScroll() {
    const nav = document.querySelector('nav');
    if (!nav) return;
    const logo = nav.querySelector('.nav-logo');
    const onScroll = () => {
        if (window.scrollY > 20) {
            // remove transparent class so solid bg wins, then add solid bg and shadow
            nav.classList.remove('bg-transparent');
            nav.classList.add('bg-black', 'shadow-md');
            // increase logo size if present
            if (logo) {
                logo.classList.remove('h-20');
                logo.classList.add('h-16');
            }
        } else {
            // remove solid bg and shadow, restore transparent header
            nav.classList.remove('bg-black', 'shadow-md');
            nav.classList.add('bg-transparent');
            if (logo) {
                logo.classList.remove('h-16');
                logo.classList.add('h-20');
            }
        }
    };
    // Run once to set initial state
    onScroll();
    window.addEventListener('scroll', debounce(onScroll, 15));
}

// Mobile Menu
function setupMobileMenu() {
    const nav = document.querySelector('nav');
    mobileMenu.innerHTML = `
        <div class="flex flex-col space-y-4">
            <a href="index.html" class="text-white hover:text-yellow-400">Home</a>
            <a href="characters.html" class="text-white hover:text-yellow-400">Characters</a>
            <a href="videos.html" class="text-white hover:text-yellow-400">Videos</a>
            <a href="photos.html" class="text-white hover:text-yellow-400">Photos</a>
            <a href="about.html" class="text-white hover:text-yellow-400">About</a>
            <a href="producers.html" class="text-white hover:text-yellow-400">For Producers</a>
            <a href="contact.html" class="text-white hover:text-yellow-400">Contact</a>
        </div>
    `;
    nav.parentNode.insertBefore(mobileMenu, nav.nextSibling);

    mobileMenuButton.parentElement.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
    });
}

// Video Thumbnails
function setupVideoThumbnails() {
    const thumbnails = document.querySelectorAll('.video-thumbnail');
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', (e) => {
            const videoId = e.currentTarget.dataset.videoId;
            if (videoId) {
                // Open video in a modal or redirect to video page
                console.log(`Playing video: ${videoId}`);
            }
        });
    });
}

// Lightbox
function setupLightbox() {
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');

    const galleryItems = document.querySelectorAll('.gallery-item');
    let currentIndex = 0;
    let visibleItems = [];

    if (!lightboxModal || galleryItems.length === 0) return;

    function updateVisibleItems() {
        visibleItems = Array.from(galleryItems).filter(item => item.style.display !== 'none');
    }

    function openLightbox(index) {
        updateVisibleItems();
        const actualIndex = Array.from(galleryItems).indexOf(visibleItems[index]);
        currentIndex = index;

        const item = visibleItems[currentIndex];
        const img = item.querySelector('img');
        const caption = item.dataset.caption || '';

        lightboxImage.src = img.src;
        lightboxImage.alt = img.alt;
        lightboxCaption.textContent = caption;
        lightboxModal.classList.add('active');

        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightboxModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    function nextImage() {
        updateVisibleItems();
        currentIndex = (currentIndex + 1) % visibleItems.length;
        openLightbox(currentIndex);
    }

    function prevImage() {
        updateVisibleItems();
        currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
        openLightbox(currentIndex);
    }

    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            updateVisibleItems();
            const visibleIndex = visibleItems.indexOf(item);
            if (visibleIndex !== -1) {
                openLightbox(visibleIndex);
            }
        });
    });

    lightboxClose.addEventListener('click', (e) => {
        e.stopPropagation();
        closeLightbox();
    });

    lightboxPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        prevImage();
    });

    lightboxNext.addEventListener('click', (e) => {
        e.stopPropagation();
        nextImage();
    });

    lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!lightboxModal.classList.contains('active')) return;

        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'ArrowRight') nextImage();
    });
}

// Scroll Animations
function setupAnimations() {
    const animatedElements = document.querySelectorAll('.fade-in');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        observer.observe(element);
    });
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Photo Filters
function setupPhotoFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const masonryItems = document.querySelectorAll('.masonry-item');

    if (filterButtons.length === 0 || masonryItems.length === 0) return;

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;

            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Filter items
            masonryItems.forEach(item => {
                if (filter === 'all' || item.dataset.category === filter) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// Handle window resize
window.addEventListener('resize', debounce(() => {
    if (window.innerWidth >= 768) {
        mobileMenu.classList.remove('active');
    }
}, 250));
