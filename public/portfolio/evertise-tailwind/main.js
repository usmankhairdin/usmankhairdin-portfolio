document.addEventListener('DOMContentLoaded', () => {
  // === Mobile Menu Toggle ===
  const toggleBtn = document.getElementById('mobileToggle');
  const closeBtn = document.getElementById('mobileClose');
  const mobileMenu = document.getElementById('mobileMenu');
  const overlay = document.getElementById('mobileOverlay');

  function openMenu() {
    mobileMenu.classList.add('open');
    overlay.classList.add('show');
    document.body.classList.add('overflow-hidden');
  }

  function closeMenu() {
    mobileMenu.classList.remove('open');
    overlay.classList.remove('show');
    document.body.classList.remove('overflow-hidden');
  }

  toggleBtn?.addEventListener('click', openMenu);
  closeBtn?.addEventListener('click', closeMenu);
  overlay?.addEventListener('click', closeMenu);

  // === Accordion Toggle for Mobile Menu ===
  document.querySelectorAll('.accordion-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const content = document.getElementById('mobile-submenu-solutions');

      toggle.classList.toggle('open');

      if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        content.classList.remove('block'); // ensure it's clean
        content.classList.add('block');
      } else {
        content.classList.remove('block');
        content.classList.add('hidden');
      }
    });
  });

  // === Carousel Logic ===
  const carouselTrack = document.getElementById('carousel-track');
  const nextBtn = document.getElementById('carousel-next');
  const prevBtn = document.getElementById('carousel-prev');

  if (carouselTrack && nextBtn && prevBtn) {
    const itemWidth = 180 + 32;
    let scrollIndex = 0;
    const totalItems = carouselTrack.querySelectorAll('.logo-box').length;
    const maxIndex = totalItems - 6;

    function updateCarousel() {
      const translateX = scrollIndex * itemWidth;
      carouselTrack.style.transform = `translateX(-${translateX}px)`;
    }

    nextBtn.addEventListener('click', () => {
      if (scrollIndex < maxIndex) {
        scrollIndex++;
        updateCarousel();
      }
    });

    prevBtn.addEventListener('click', () => {
      if (scrollIndex > 0) {
        scrollIndex--;
        updateCarousel();
      }
    });

    updateCarousel();
  }

  // === Platform Tabs Logic ===
  const tabButtons = document.querySelectorAll('.tab-btn');
  const prTab = document.getElementById('prTab');
  const irTab = document.getElementById('irTab');
  const prLogo = document.getElementById('tabPRLogo');
  const irLogo = document.getElementById('tabIRLogo');

  tabButtons.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      const isPR = idx === 0;

      prTab.classList.toggle('hidden', !isPR);
      prTab.classList.toggle('block', isPR);
      irTab.classList.toggle('hidden', isPR);
      irTab.classList.toggle('block', !isPR);

      tabButtons[0].classList.toggle('bg-white', isPR);
      tabButtons[0].classList.toggle('text-[var(--primary-color)]', isPR);
      tabButtons[0].classList.toggle('bg-transparent', !isPR);
      tabButtons[0].classList.toggle('text-white', !isPR);

      tabButtons[1].classList.toggle('bg-white', !isPR);
      tabButtons[1].classList.toggle('text-[var(--primary-color)]', !isPR);
      tabButtons[1].classList.toggle('bg-transparent', isPR);
      tabButtons[1].classList.toggle('text-white', isPR);

      const arrow1 = tabButtons[0].querySelector('.tab-arrow');
      const arrow2 = tabButtons[1].querySelector('.tab-arrow');
      if (arrow1 && arrow2) {
        arrow1.classList.toggle('hidden', !isPR);
        arrow2.classList.toggle('hidden', isPR);
      }

      prLogo.src = isPR ? 'images/tab-logo.png' : 'images/tab-logo-white.png';
      irLogo.src = isPR ? 'images/tab-logo-white.png' : 'images/tab-logo.png';
    });
  });

  // === FAQ Section Loader ===
fetch('faqs.json')
  .then(response => response.json())
  .then(faqs => {
    const container = document.getElementById('faqContainer');

    faqs.forEach((faq, index) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'm-0 p-0';

      const button = document.createElement('button');
      button.className =
        'faq-btn w-full py-4 text-left flex items-center justify-between text-[20px] font-bold leading-[1.7] text-[var(--primary-color)] border-b border-gray-200';
      button.innerHTML = `<span>${faq.question}</span><span class="text-3xl font-light leading-none">+</span>`;

      const answer = document.createElement('div');
      answer.className = 'faq-answer';
      answer.textContent = faq.answer;

      // ✅ Open first answer only
      if (index === 0) {
        answer.classList.add('open');
        button.querySelector('span:last-child').textContent = '-';
      }

      button.addEventListener('click', () => {
        const allAnswers = document.querySelectorAll('.faq-answer');
        const allButtons = document.querySelectorAll('.faq-btn');

        allAnswers.forEach(a => a.classList.remove('open'));
        allButtons.forEach(b => {
          const icon = b.querySelector('span:last-child');
          if (icon) icon.textContent = '+';
        });

        const isOpen = answer.classList.contains('open');

        if (!isOpen) {
          answer.classList.add('open');
          button.querySelector('span:last-child').textContent = '-';
        }
      });

      wrapper.appendChild(button);
      wrapper.appendChild(answer);
      container.appendChild(wrapper);
    });
  })
  .catch(error => console.error('Error loading FAQs:', error));


  // === Swiper (Testimonial Slider) ===
  new Swiper('.testimonial-swiper', {
    loop: true,
    navigation: {
      nextEl: '.swiper-button-next-custom',
      prevEl: '.swiper-button-prev-custom',
    },
    autoplay: {
      delay: 5000,
    },
  });
});
