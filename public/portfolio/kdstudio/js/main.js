$(document).ready(function () {
  const $heroCarousel = $(".hero-carousel");

  $heroCarousel.owlCarousel({
    items: 1,
    loop: true,
    autoplay: true,
    autoplayTimeout: 6000,
    smartSpeed: 700,
    dots: false,
    nav: false,
    onInitialize: function () {
      $(".hero-section").addClass("owl-loaded");
    },
    onTranslate: function (event) {
      // Animate outgoing (real) slide out
      $(event.target).find(".owl-item:not(.cloned)").each(function () {
        const $item = $(this);
        $item.find(".left-col").removeClass("slide-in-left").addClass("slide-out-left");
        $item.find(".right-col").removeClass("slide-in-right").addClass("slide-out-right");
      });
    },
    onTranslated: function (event) {
      // Animate incoming (real) slide in
      const $newSlide = $(event.target).find(".owl-item").eq(event.item.index);
      if (!$newSlide.hasClass("cloned")) {
        $newSlide.find(".left-col").removeClass("slide-out-left").addClass("slide-in-left");
        $newSlide.find(".right-col").removeClass("slide-out-right").addClass("slide-in-right");
      }
    }
  });

  // Animate first real slide on page load
  setTimeout(() => {
    const $first = $(".hero-carousel .owl-item.active:not(.cloned)");
    $first.find(".left-col").addClass("slide-in-left");
    $first.find(".right-col").addClass("slide-in-right");
  }, 200);

  // Custom nav
  $(".hero-prev").click(() => $heroCarousel.trigger("prev.owl.carousel"));
  $(".hero-next").click(() => $heroCarousel.trigger("next.owl.carousel"));

  // Toggle mobile menu
$('#mobile-menu-toggle').on('click', function (e) {
  e.stopPropagation(); // prevent click from reaching document
  $('#mobile-nav').toggleClass('active');
});

// Close when clicking outside
$(document).on('click', function (e) {
  const $target = $(e.target);

  // Check if click is outside mobile nav and toggle button
  if (
    !$target.closest('#mobile-nav').length &&
    !$target.closest('#mobile-menu-toggle').length
  ) {
    $('#mobile-nav').removeClass('active');
  }
});

  // Header scroll
  const $header = $('#main-header');
  $(window).on('scroll', () => {
    $header.toggleClass('scrolled', $(window).scrollTop() > 10);
  });
});


