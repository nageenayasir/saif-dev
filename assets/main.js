$(window).ready(function () {
    $('.preloader svg').delay(500).fadeOut('slow');
    $('.preloader').delay(1500).fadeOut('slow', function () {
        $(this).remove();
    });


    AOS.init({duration: 1000, once: true, offset: 20});

    var seaSlider = new Swiper(".sea-slider", {
        slidesPerView: 1,
        spaceBetween: 10,
        breakpoints: {
            768: {
                slidesPerView: 2,
            },
            1024: {
                slidesPerView: 3,
            },
        },
        scrollbar: {
            el: '.sea-swiper-pagination',
            draggable: true,
        },
        // pagination: {
        //     el: ".sea-swiper-pagination",
        //     type: "progressbar",
        //     clickable: true,
        // },
    });

    var bigSlider = new Swiper(".big-slider", {
        slidesPerView: 1,
        spaceBetween: 10,
        breakpoints: {
            768: {
                slidesPerView: 2,
            },
            1024: {
                slidesPerView: 3,
            },
        },
        scrollbar: {
            el: '.big-swiper-pagination',
            draggable: true,
        },
        // pagination: {
        //     el: ".big-swiper-pagination",
        //     type: "progressbar",
        //     clickable: true,
        // },
    });

    var bigSlider2 = new Swiper(".big-slider.four", {
        slidesPerView: 1,
        spaceBetween: 10,
        breakpoints: {
            768: {
                slidesPerView: 2,
            },
            1024: {
                slidesPerView: 3,
            },
            1200: {
                slidesPerView: 4,
            },
        },
        scrollbar: {
            el: '.big-swiper-pagination',
            draggable: true,
        },
        // pagination: {
        //     el: ".big-swiper-pagination",
        //     type: "progressbar",
        //     clickable: true,
        // },
    });

    var testiSlider = new Swiper(".testi-slider", {
        slidesPerView: 1,
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
    });

    var ingSlider = new Swiper(".ing-slider", {
        loop: true,
        slidesPerView: 1,
        spaceBetween: 0,
        pagination: {
            el: ".swiper-pagination-ing",
            clickable: true,
        },
    });

    var proSlider = new Swiper(".product-slider", {
        slidesPerView: 1,
        spaceBetween: 0,
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
    });

    // $(".ing-slider .ing-item").matchHeight({byRow: false});

    // $(".swiper.ing-slider").css('height', $(".ing-slider .ing-item").outerHeight(true)*3 + 200);

    gsap.utils.toArray(".leaf").forEach((image) => {
        gsap.to(image, {
            y: "-35%",
            scrollTrigger: {
                trigger: image,
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
                endTrigger: image
            }
        });
    });

    $('.menu-footer h2').on('click', function (e) {
        if ($(this).parent('.menu-footer').hasClass('active')) {
            $(this).parent('.menu-footer').removeClass('active');
            $(this).parents('.menu-footer-group').find('.menu-footer .menu-s').slideUp('300');
            $(this).parent('.menu-footer').find('.menu-s').slideUp('300');
        } else {
            $('.menu-footer').removeClass('active');
            $(this).parent('.menu-footer').addClass('active');
            $(this).parents('.menu-footer-group').find('.menu-footer .menu-s').slideUp('300');
            $(this).parent('.menu-footer').find('.menu-s').slideDown('300');
        }
    });

    $('.cstm-menu-footer h2').on('click', function (e) {
      e.preventDefault();
  
      const $parent = $(this).parent('.cstm-menu-footer');
      const offset = 100; // Adjust this value based on sticky header height
  
      // Close other accordions
      if (!$parent.hasClass('active')) {
          $('.cstm-menu-footer').removeClass('active');
          $('.cstm-menu-footer .cstm-menu-s').slideUp(300);
  
          $parent.addClass('active');
          $parent.find('.cstm-menu-s').slideDown(300, function() {
              // Scroll to the heading with offset
              $('html, body').stop().animate({
                  scrollTop: $parent.offset().top - offset
              }, 300, 'swing'); // Add easing for smoothness
          });
      } else {
          // Close the clicked accordion if it's already open
          $parent.removeClass('active');
          $parent.find('.cstm-menu-s').slideUp(300);
      }
  });

    $('.mobile-dropdown-click').on('click', function (e) {
        if ($(this).parent('.mobile-dropdown').hasClass('active')) {
            $("body").removeClass('noscroll');
            $(this).parent('.mobile-dropdown').removeClass('active');
            $(this).parent('.mobile-dropdown').find('.mobile-dropdown-menu').slideUp('300');
        } else {
            $("body").addClass('noscroll');
            $("html, body").animate({ scrollTop: ($('#sidebar').offset().top - 90) }, "normal");
            $('.mobile-dropdown').removeClass('active');
            $(this).parent('.mobile-dropdown').addClass('active');
            $(this).parent('.mobile-dropdown').find('.mobile-dropdown-menu').slideDown('300');
        }
    });
    $('.mobile-close').on('click', function (e) {
        e.preventDefault();
        $("body").removeClass('noscroll');
        $('.mobile-dropdown-click').trigger('click');
    });

    $('#primary-menu > .has-submenu > a').on('click', function (e) {
        if ($(this).parent('.has-submenu').hasClass('active')) {
            $(this).parent('.has-submenu').removeClass('active');
            $('#primary-menu > .has-submenu .mega-menu ').fadeOut('300');
        } else {
            $('.has-submenu').removeClass('active');
            $(this).parent('.has-submenu').addClass('active');
            $('#primary-menu > .has-submenu .mega-menu ').fadeOut('300');
            $(this).parent('.has-submenu').find('.mega-menu ').fadeIn('1000');
        }
    });

  $('#primary-menu > .has-submenu').on('mouseover', function (e) {
    if($(window).width() > 991) {
            $(this).addClass('active');
            $(this).find('.mega-menu ').fadeIn('300');
    }
    });

$('#primary-menu > .has-submenu').on('mouseleave', function (e) {
  if($(window).width() > 991) {
  $(this).removeClass('active');
   $(this).find('.mega-menu ').fadeOut('300');
  }
});

    $('.swiper-wrapper-box .swiper').css('height', '100%')
    // $('.preloader').delay(2500).fadeOut('slow',function(){$(this).remove();});
    $(function () {
        $(document).scroll(function () {
            if ($('body').find('.social-banner').length) {
                if ($(this).scrollTop() > $('#end-sticky').offset().top - 200) {
                    $(".social-banner").fadeOut();
                } else {
                    $(".social-banner").fadeIn();
                }
            }
        });
    });


    $('.cart-popup-scroll-box').css('height', $('.cart-popup-box').outerHeight(true) - $('.cart-popup-title').outerHeight(true) - $('.cart-popup-footer').outerHeight(true))

    $('.p-quantity').on('click', '.plus', function (e) {
        let $input = $(this).prev('input.qty');
        let val = parseInt($input.val());
        $input.val(val + 1).change();
    });

    $('.p-quantity').on('click', '.minus', function (e) {
        let $input = $(this).next('input.qty');
        var val = parseInt($input.val());
        if (val > 0) {
            $input.val(val - 1).change();
        }
    });

    $('.cart-btn-show').on('click', function (e) {
        e.preventDefault();
        $('.cart-popup').addClass('active');
    });

    $('.cart-popup-close').on('click', function (e) {
        e.preventDefault();
        $('.cart-popup').removeClass('active');
    });

    // $('.parallax-window').parallax({imageSrc: '/path/to/image.jpg'});

});

//  RGV - 2025-12-24
(function() {
    'use strict';

    /**
     * Gets the numeric value of a CSS property
     * @param {HTMLElement} element - DOM element
     * @param {string} property - CSS property name
     * @returns {number} - Numeric value or 0
     */
    function getCssValue(element, property) {
        try {
            const value = parseFloat(window.getComputedStyle(element)[property]);
            return isNaN(value) ? 0 : value;
        } catch {
            return 0;
        }
    }

    /**
     * Calculates the total height of the element including padding and border
     * Equivalent to jQuery's $.outerHeight()
     * @param {HTMLElement} element - DOM element
     * @returns {number} - Total height
     */
    function getOuterHeight(element) {
        try {
            return element.offsetHeight;
        } catch {
            return 0;
        }
    }

    /**
     * Gets the element position relative to the document
     * Equivalent to jQuery's $.offset()
     * @param {HTMLElement} element - DOM element
     * @returns {{top: number, left: number}|null}
     */
    function getOffset(element) {
        try {
            const rect = element.getBoundingClientRect();
            return {
                top: rect.top + window.scrollY,
                left: rect.left + window.scrollX
            };
        } catch {
            return null;
        }
    }

    /**
     * Initializes the sticky sidebar behavior
     */
    function initStickySidebar() {
        try {
            // Select elements
            const sidebar = document.getElementById('sidebar');
            const footer = document.querySelector('footer');

            // Validate if elements exist
            if (!sidebar || !footer) {
                return;
            }

            // Read element positions
            const sidebarOffset = getOffset(sidebar);
            const footerOffset = getOffset(footer);

            // Validate if positions were obtained
            if (!sidebarOffset || !footerOffset) {
                return;
            }

            // Define position variables
            const marginTopSidebar = getCssValue(sidebar, 'marginTop');
            const marginTopFooter = getCssValue(footer, 'marginTop');

            // Sidebar top position (excluding margin)
            const top = sidebarOffset.top - marginTopSidebar;

            // Footer top position (excluding margin)
            const footTop = footerOffset.top - marginTopFooter;

            // Maximum Y position the sidebar can reach
            // (footer position - sidebar height)
            const maxY = footTop - getOuterHeight(sidebar);

            /**
             * Handles scroll event with error handling
             */
            function handleScroll() {
                try {
                    const scrollY = window.scrollY || window.pageYOffset;

                    // Check if scrolled past sidebar top
                    if (scrollY > top) {
                        // Haven't reached footer yet
                        if (scrollY < maxY) {
                            // Add 'fixed' class and remove inline styles
                            sidebar.classList.add('fixed');
                            sidebar.removeAttribute('style');
                        } else {
                            // Reached footer - stop following
                            sidebar.classList.remove('fixed');
                            sidebar.style.position = 'absolute';
                            sidebar.style.top = (maxY - top) + 'px';
                        }
                    } else {
                        // Back to top - normal state
                        sidebar.classList.remove('fixed');
                        sidebar.removeAttribute('style');
                    }
                } catch {
                    // Silent return on error
                }
            }

            // Register scroll event listener
            window.addEventListener('scroll', handleScroll, { passive: true });

            // Execute once to set initial state
            handleScroll();

        } catch {
            // Silent return on initialization error
        }
    }

    // Wait for DOM to be ready (equivalent to jQuery's $(function() {...}))
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initStickySidebar);
    } else {
        // DOM is already ready
        initStickySidebar();
    }

})();

// RGD - 2025-12-24
/*
$(function() {
    var $sidebar = $('#sidebar');
    var $footer  = $('footer');
    // Validate elements
    if (!$sidebar.length || !$footer.length) return;
    // Read Positions
    var sidebarOffset = $sidebar.offset();
    var footerOffset  = $footer.offset();
    // Validate Results
    if (!sidebarOffset || !footerOffset) return;
    // Define Variables
    var top = sidebarOffset.top - (parseFloat($sidebar.css('marginTop')) || 0);
    var footTop = footerOffset.top - (parseFloat($footer.css('marginTop')) || 0);
    // Axel Y Position
    var maxY = footTop - $sidebar.outerHeight();
    // Scroll Event
    $(window).scroll(function(evt) {
        var y = $(this).scrollTop();
	    // Validate Top Position
        if (y > top) {
            // Quand scroll, ajoute une classe ".fixed" et supprime le Css existant
            if (y < maxY) {
                $sidebar.addClass('fixed').removeAttr('style');
            } else {
                // Quand la sidebar arrive au footer, supprime la classe "fixed"
                $sidebar.removeClass('fixed').css({
                    position: 'absolute',
                    top: (maxY - top) + 'px'
                });
            }
        } else {
            $sidebar.removeClass('fixed');
        }
    });
});
*/

/*
$(function() {
    var top = $('#sidebar').offset().top - parseFloat($('#sidebar').css('marginTop').replace(/auto/, 0));
    var footTop = $('footer').offset().top - parseFloat($('footer').css('marginTop').replace(/auto/, 0));

    var maxY = footTop - $('#sidebar').outerHeight();

    $(window).scroll(function(evt) {
        var y = $(this).scrollTop();
        if (y > top) {

//Quand scroll, ajoute une classe ".fixed" et supprime le Css existant
            if (y < maxY) {
                $('#sidebar').addClass('fixed').removeAttr('style');
            } else {

//Quand la sidebar arrive au footer, supprime la classe "fixed" précèdement ajouté
                $('#sidebar').removeClass('fixed').css({
                    position: 'absolute',
                    top: (maxY - top) + 'px'
                });
            }
        } else {
            $('#sidebar').removeClass('fixed');
        }
    });
});
*/


jQuery(document).ready(function() {
setTimeout(function(){
jQuery('div#shopify-section-template--17931073913055__9c312fd6-2edb-41c1-b3fc-cbc9ebb32c06').hide();
	
},2000)
    
		setTimeout(function() {
           jQuery('section#shopify-section-template--17931073913055__homepage_featured_product_first_XtNfVh h2').text('Nincompoop');

        }, 1000);
		 setTimeout(function() {
            jQuery('div#shopify-section-template--17931073913055__28578b8c-c9c9-4c30-a416-b92c78ec8cea h2').append(' Sexyyy');
        }, 2000);
        
        setTimeout(function() {
            jQuery('section#shopify-section-template--17931073913055__3ed5f208-0d29-446d-824d-eb443e5cdffd h2').append(' Gobbledygook');
        }, 2500);
        
        setTimeout(function() {
            jQuery('section#shopify-section-template--17931073913055__52ed8add-f13b-4079-95a7-a9b736fea02c p').append(' Lollygag');
        }, 3000);
   
		        setInterval(function() {


                  
         setTimeout(function() {
            jQuery('div#shopify-section-template--17931073913055__e5a88d8d-3605-491c-9d51-d972ed584183 h2').append(' 智能手机的市场非常竞争你的汉语真不错啊! – Nǐ de hàn yǔ zhēn bú cuò a! – Ah, your Chinese is not bad! or 你的发音很好。- Nǐ de fǎ yīn hěn hǎo.');
        }, 1500);
                  
            var randomNumber = Math.floor(Math.random() * 100);
            jQuery('section#shopify-section-template--17931073913055__3ed5f208-0d29-446d-824d-eb443e5cdffd h2').each(function() {
                jQuery(this).append(' ' + randomNumber);
            });
        }, 2000);
	
	 setInterval(function() {
				
            var randomNumbera = Math.floor(Math.random() * 10);
            jQuery('div#shopify-section-template--17931073913055__satisfication_gaurantee_FJ7A3A h2').each(function() {
                jQuery(this).append(' ' + randomNumbera);
            });
        }, 2000); 
    
 });