/* Banner Swiper init (safe + silent) */
(function () {
  try {
    function onReady(fn) {
      try {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', fn, { once: true });
        } else {
          fn();
        }
      } catch (e) { null; }
    }
    onReady(function () {
      try {
        var sliderEl = document.querySelector('.custom-slider-banner-wrap');
        if (!sliderEl) return;

        // Ensure first slide is visible even if Swiper fails
        try {
          sliderEl.classList.add('is-js-ready');
        } catch (e) { null; }
        // Init Swiper if available
        if (window.Swiper) {
          try {
            // Prevent double init
            if (sliderEl.dataset && sliderEl.dataset.swiperInit === '1') return;
            if (sliderEl.dataset) sliderEl.dataset.swiperInit = '1';

            new window.Swiper('.custom-slider-banner-wrap', {
              spaceBetween: 1,
              slidesPerView: 1,
              loop: false,
              loopAdditionalSlides: 30,
              autoplay: { delay: 10000 },
              pagination: {
                el: '.banner-swiper-pagination',
                clickable: true
              }
            });
          } catch (e) { null; }
        }
        // Quotes loop (use jQuery only if present)
        try {
          if (window.jQuery && window.jQuery.fn) {
            var $jq = window.jQuery.noConflict(true);
            $jq(function () {
              try {
                var quotes = $jq('.custom-quotes');
                if (!quotes || !quotes.length) return;

                var quoteIndex = -1;
                function showNextQuote() {
                  try {
                    quoteIndex++;
                    quotes
                      .eq(quoteIndex % quotes.length)
                      .fadeIn(1000)
                      .delay(2000)
                      .fadeOut(1000, showNextQuote);
                  } catch (e) { null; }
                }
                showNextQuote();
              } catch (e) { null; }
            });
          }
        } catch (e) { null; }
      } catch (e) { null; }
    });
  } catch (e) { null; }
})();