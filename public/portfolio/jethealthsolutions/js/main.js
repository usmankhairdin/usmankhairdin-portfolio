// Wait for the page to fully load
$(window).on('load', function () {
  // Hide preloader
  $('#loader').fadeOut();

  // Show main content
  $('#main-wrapper').css('visibility', 'visible');
});

AOS.init();

$(document).ready(function () {
  'use strict';

  // Variables
  var $testim = $("#testim"),
    $testimDots = $("#testim-dots").children(),
    $testimContent = $("#testim-content").children(),
    $testimLeftArrow = $("#left-arrow"),
    $testimRightArrow = $("#right-arrow"),
    testimSpeed = 4500,
    currentSlide = 0,
    testimTimer,
    ignoreTouch = 30,
    touchStartPos,
    touchEndPos,
    touchPosDiff;

  // Function to play a specific slide
  function playSlide(slide) {
    // Reset classes for all slides and dots
    $testimContent.removeClass("active inactive");
    $testimDots.removeClass("active");

    // Adjust slide index for circular navigation
    if (slide < 0) {
      slide = $testimContent.length - 1;
    }
    if (slide >= $testimContent.length) {
      slide = 0;
    }

    // Set the current slide and update classes
    $testimContent.eq(slide).addClass("active");
    $testimDots.eq(slide).addClass("active");

    // Add 'inactive' class to the previous slide for animation
    if (currentSlide !== slide) {
      $testimContent.eq(currentSlide).addClass("inactive");
    }

    // Update the current slide
    currentSlide = slide;

    // Restart timer for autoplay
    clearTimeout(testimTimer);
    testimTimer = setTimeout(function () {
      playSlide(currentSlide + 1);
    }, testimSpeed);
  }

  // Event listeners for arrows
  $testimLeftArrow.click(function () {
    playSlide(currentSlide - 1);
  });

  $testimRightArrow.click(function () {
    playSlide(currentSlide + 1);
  });

  // Event listeners for dots
  $testimDots.each(function (index) {
    $(this).click(function () {
      playSlide(index);
    });
  });

  // Keyboard navigation
  $(document).keyup(function (e) {
    if (e.key === "ArrowLeft") {
      $testimLeftArrow.click();
    } else if (e.key === "ArrowRight") {
      $testimRightArrow.click();
    }
  });

  // Touch navigation
  $testim.on("touchstart", function (e) {
    touchStartPos = e.originalEvent.changedTouches[0].clientX;
  });

  $testim.on("touchend", function (e) {
    touchEndPos = e.originalEvent.changedTouches[0].clientX;
    touchPosDiff = touchStartPos - touchEndPos;

    if (touchPosDiff > ignoreTouch) {
      $testimRightArrow.click(); // Swipe left
    } else if (touchPosDiff < -ignoreTouch) {
      $testimLeftArrow.click(); // Swipe right
    }
  });

  // Start the autoplay
  playSlide(currentSlide);
});


$(document).ready(function () {

  // Load Header from includes folder
  $('#header').load('header.html', function () {

    // Dynamically add active class to the parent .nav-item based on current page
    const currentPage = window.location.pathname.split('/').pop(); // Get current file name
    $('#header .navbar-nav .nav-item').each(function () {
      const linkPage = $(this).find('.nav-link').attr('href');
      if (linkPage === currentPage) {
        $(this).addClass('active'); // Add active class to .nav-item
      }
    });
    $('#header .navbar-nav .dropdown').each(function () {
      const currentPage = window.location.pathname.split('/').pop() || 'index.html'; // Get current file name
      let isActive = false;

      // Loop through all dropdown items to find a match
      $(this).find('.dropdown-menu .dropdown-item').each(function () {
        const linkPage = $(this).attr('href'); // Get href of dropdown item
        if (linkPage === currentPage) {
          isActive = true; // Set flag to true if there's a match
          $(this).addClass('active'); // Add active class to the matching dropdown-item
        }
      });

      // Add active class to parent dropdown if any child matches
      if (isActive) {
        $(this).addClass('active');
      }
    });
    // Disable the "Schedule a Demo" button if on request-demo.php
    if (currentPage === 'request-demo.html') {
      $('.btn.schedule-btn').addClass('disabled').attr('disabled', true); // Add 'disabled' class and attribute
    }
    $('#header .navbar-nav .nav-item .dropdown-menu li').each(function () {
      const linkPage = $(this).find('.dropdown-item').attr('href');
      if (linkPage === currentPage) {
        $(this).addClass('active'); // Add active class to .nav-item
      }
    });
  });
});

$(document).ready(function () {

  $('#footer').load('footer.html', function () {
    // Dynamically add active class to the parent .nav-item based on current page
    const currentPage = window.location.pathname.split('/').pop(); // Get current file name
    $('#footer .footer-widget ul li').each(function () {
      const linkPage = $(this).find('a').attr('href');
      if (linkPage === currentPage) {
        $(this).addClass('active'); // Add active class to .nav-item
      }
    });
    const currentYear = new Date().getFullYear();
    $('#current-year').text(currentYear);
  });
});

$(document).ready(function () {

  // Validate the newsletter form
  $("#newsletterForm").validate();

});

$(document).ready(function () {

  // Validate the contact form
  $("#contactForm").validate({
    messages: {
      Name: {
        required: 'The field is required.'
      },

      Phone: {
        required: 'The field is required.'
      },

      Message: {
        required: 'The field is required.'
      },
      Email: {
        required: 'The field is required.'
      }
    }
  });
  $('#Phone').inputmask('+(999)-999-9999');

  $('.error').each(function () {
    // get element text
    var text = $(this).text();
    // modify text
    text = text.replace('This field is required', 'The field is required.');
    // update element text
    $(this).text(text);
  });

  // Phone validation on change event
  $('#Phone').change(function () {
    var phone = $('#Phone').val();
    /*var phoneNum = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;*/
    var phoneNum = /^\+[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/;

    if (phone == "") {
      $("#phoneError").text("The field is required.").css("color", "#dc3232");
    } else if (!phone.match(phoneNum) || phone.length != 15) {
      $("#phoneError").text("Please enter valid phone").css("color", "#dc3232");
    }

    else {
      $("#phoneError").text("").css("color", "whire");
    }
  });
  $("#Phone").keypress(function (e) {
    if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
      $("#phoneError").html("Enter only digits").css('color', '#dc3232');
      return false;
    }
  });
});


$(document).ready(function () {
  // Pagination: Previous Button
  $('#pagination-prev').click(function () {
    var docViewTop = $(window).scrollTop();
    var headerHeight = 68;
    var elemTop;

    // Select all sections
    var sections = $('section');
    if (isMobileBrowser()) {
      sections = $('sectionMobile'); // Use 'sectionMobile' for mobile views
    }

    // Loop through sections in reverse order for previous button functionality
    $(sections.toArray().reverse()).each(function () {
      elemTop = $(this).offset().top - headerHeight;

      if ($(this).height() > 0 && docViewTop - elemTop >= 1) {
        $('html, body').animate({ scrollTop: elemTop });
        return false; // Break the loop once a valid section is found
      }
    });

    // If no previous section found, scroll to the top
    if (!(docViewTop - elemTop >= 1)) {
      $('html, body').animate({ scrollTop: 0 });
    }
  });

  // Pagination: Next Button
  $('#pagination-next').click(function () {
    var docViewTop = $(window).scrollTop();
    var headerHeight = 68;
    var elemTop;

    // Select all sections
    var sections = $('section');
    if (isMobileBrowser()) {
      sections = $('sectionMobile'); // Use 'sectionMobile' for mobile views
    }

    // Loop through sections for next button functionality
    $(sections).each(function () {
      elemTop = $(this).offset().top - headerHeight;

      if (elemTop - docViewTop >= 1) {
        $('html, body').animate({ scrollTop: elemTop });
        return false; // Break the loop once a valid section is found
      }
    });

    // If no next section found, scroll to the bottom of the page
    if (!(elemTop - docViewTop >= 1)) {
      $('html, body').animate({ scrollTop: $(document).height() });
    }
  });

  // Scroll-based visibility for pagination arrows
  $(window).on('scroll', function () {
    var scrollTop = $(window).scrollTop();
    var docHeight = $(document).height();
    var windowHeight = $(window).height();

    // Show the 'Previous' arrow after scrolling past a certain point
    $('#pagination-prev').css('opacity', scrollTop >= 200 ? '1' : '0');

    // Hide the 'Next' arrow when scrolled to the bottom of the page
    $('#pagination-next').css('opacity', scrollTop >= (docHeight - windowHeight - 200) ? '0' : '1');
  });

  // Check if the browser is mobile
  function isMobileBrowser() {
    return /Mobi|Android/i.test(navigator.userAgent);
  }
});