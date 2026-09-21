// Page Loader
window.addEventListener("load", function () {
  // Wait for everything to load completely
  setTimeout(() => {
    const loader = document.getElementById("page-loader");
    const body = document.body;

    // Show body content
    body.classList.add("loaded");

    // Fade out loader
    loader.classList.add("fade-out");

    // Remove loader from DOM after fade out
    setTimeout(() => {
      loader.remove();
    }, 500);
  }, 500); // Small delay to ensure smooth transition
});

// Lucide Icons
document.addEventListener("DOMContentLoaded", function () {
  lucide.createIcons(); // refresh lucide icons

  // ... rest of your slider JS here ...
});


// Swiper JS

// ✅ Left side image: now static (Swiper removed)

// Right side text slider
const textSlider = new Swiper(".textSlider", {
  loop: true,
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
    renderBullet: function (index, className) {
      return `<span class="${className} inline-block w-12 h-2 rounded-md bg-[--light-blue-cyan] hover:bg-[--secondary-color] mx-1 opacity-[1] transition-colors duration-300"></span>`;
    },
  },
  autoplay: {
    delay: 3000,
    disableOnInteraction: false,
  },
});


// We Work With Slider
document.addEventListener("DOMContentLoaded", function () {
  try {
    // Grab list + items first
    const list = document.getElementById("workList");
    const items = Array.from(list.querySelectorAll(".work-list-item"));

    // helper: clear active
    function clearActive() {
      items.forEach(i => i.classList.remove("active"));
    }

    // helper: center item inside the scroll container
    function centerItem(el) {
      if (!el) return;
      const containerRect = list.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const offset =
        elRect.top + elRect.height / 2 -
        (containerRect.top + containerRect.height / 2);
      list.scrollBy({ top: offset, behavior: "smooth" });
    }

    // set active safely (checks items exist)
    function setActive(index) {
      if (!items.length) return;
      clearActive();
      const el = items[index] || items[0];
      el.classList.add("active");
      centerItem(el);
    }

    // Initialize Swiper (autoplay kept; autoHeight removed)
    const rightContent = new Swiper(".rightContent", {
      effect: "fade",
      fadeEffect: { crossFade: true },
      loop: true, // makes autoplay seamless
      autoplay: {
        delay: 3000, // 3s per slide
        disableOnInteraction: false, // keep autoplay after interaction
      },
    });

    // helper to count **real** slides (not the duplicated loop slides)
    function getRealSlideCount() {
      const slides = Array.from(document.querySelectorAll(".rightContent .swiper-slide"));
      return slides.filter(s => !s.classList.contains("swiper-slide-duplicate")).length;
    }

    // Ensure first slide + first li selected on load (no animation)
    rightContent.slideToLoop(0, 0); // use slideToLoop since loop:true
    setActive(0);

    // clicking list items -> control swiper and center clicked li
    items.forEach((item, index) => {
      item.addEventListener("click", () => {
        const realCount = getRealSlideCount() || items.length;
        // map the clicked index to a real slide index (safe if counts differ)
        const target = realCount ? index % realCount : index;
        rightContent.slideToLoop(target, 400);
        setActive(index);
      });
    });

    // when swiper changes (via autoplay/swipe) update list highlight
    rightContent.on("slideChange", function () {
      const realIdx =
        typeof rightContent.realIndex === "number"
          ? rightContent.realIndex
          : rightContent.activeIndex;

      const realCount = getRealSlideCount() || items.length;

      // Map real slide index back to a list index:
      // - if counts match: direct mapping
      // - otherwise: use modulo so highlight still updates predictably
      let mappedIndex;
      if (items.length === realCount) mappedIndex = realIdx;
      else mappedIndex = realIdx % items.length;

      setActive(mappedIndex);
    });

    // up/down arrow scrolls the list (no visible scrollbar)
    document.getElementById("scrollUp").addEventListener("click", () => {
      list.scrollBy({ top: -120, behavior: "smooth" });
    });
    document.getElementById("scrollDown").addEventListener("click", () => {
      list.scrollBy({ top: 120, behavior: "smooth" });
    });

    // warn in console if counts mismatch (helps debug if last items still not linked to slides)
    const realCount = getRealSlideCount();
    if (realCount !== items.length) {
      console.warn(`WeWorkWith: list items (${items.length}) != slides (${realCount}). Click mapping uses modulo. To have 1:1 mapping, ensure you have the same number of .swiper-slide elements (non-duplicate).`);
    }
  } catch (err) {
    console.error("WeWorkWith slider init error:", err);
  }
});



// We Work With Slider End


// Scroll-triggered animations
document.addEventListener("DOMContentLoaded", function () {
  // Store original animation classes and remove them initially
  const animatedElements = document.querySelectorAll('.wow');
  const elementAnimations = new Map();

  animatedElements.forEach(el => {
    // Store which animation this element should have
    if (el.classList.contains('animate__fadeInUp')) {
      elementAnimations.set(el, 'animate__fadeInUp');
    } else if (el.classList.contains('animate__fadeInLeft')) {
      elementAnimations.set(el, 'animate__fadeInLeft');
    } else if (el.classList.contains('animate__fadeInRight')) {
      elementAnimations.set(el, 'animate__fadeInRight');
    }

    // Remove all animation classes initially
    el.classList.remove('animate__animated', 'animate__fadeInUp', 'animate__fadeInLeft', 'animate__fadeInRight');
    // Make elements initially invisible
    el.style.opacity = '0';
  });

  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.2, // Trigger when 20% of element is visible
    rootMargin: '0px 0px -100px 0px' // Start animation 100px before element is fully visible
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const animationType = elementAnimations.get(element);

        if (animationType) {
          // Reset opacity and add animation classes
          element.style.opacity = '1';
          element.classList.add('animate__animated', animationType);
        }

        // Stop observing this element after animation triggers
        observer.unobserve(element);
      }
    });
  }, observerOptions);

  // Check for elements already visible in viewport and animate them immediately
  animatedElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

    if (isVisible) {
      // Element is already visible, animate it immediately
      const animationType = elementAnimations.get(el);
      if (animationType) {
        el.style.opacity = '1';
        el.classList.add('animate__animated', animationType);
      }
    } else {
      // Element not visible, observe it for scroll
      observer.observe(el);
    }
  });
});
