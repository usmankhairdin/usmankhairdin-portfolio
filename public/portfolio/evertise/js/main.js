$(document).ready(function () {
  "use strict";

  // Slick Carousel for Customer Logos
  if ($('.customer-logos').length) {
    $('.customer-logos').slick({
      slidesToShow: 6,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 1500,
      arrows: true,
      dots: false,
      pauseOnHover: false,
      prevArrow: $('.carousel-arrow-left'),
      nextArrow: $('.carousel-arrow-right'),
      responsive: [
        {
          breakpoint: 991,
          settings: { slidesToShow: 4 }
        },
        {
          breakpoint: 768,
          settings: { slidesToShow: 2 }
        },
        {
          breakpoint: 520,
          settings: { slidesToShow: 1 }
        }
      ]
    });
  }

  // Platform Tabs Icon Switching
  $('#platformTabs button[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
    // Reset all icons to white version
    $('#platformTabs .tab-icon').attr('src', 'images/tab-logo-white.png');

    // Set the active tab's icon to default version
    $(e.target).find('.tab-icon').attr('src', 'images/tab-logo.png');
  });

  // Testimonial Carousel (Owl Carousel)
  if ($('.testimonial-carousel').length) {
    $('.testimonial-carousel').owlCarousel({
      animateOut: 'slideOutDown',
      animateIn: 'zoomIn',
      loop: true,
      margin: 0,
      nav: true,
      smartSpeed: 300,
      autoplay: 7000,
      navText: [
        '<span class="arrow-left"></span>',
        '<span class="arrow-right"></span>'
      ],
      responsive: {
        0: { items: 1 },
        600: { items: 1 },
        800: { items: 1 },
        1024: { items: 1 }
      }
    });
  }

  // AOS Initialization
  AOS.init({
    duration: 2000, // 2 seconds = slow
    once: true      // Only animate once
  });

});