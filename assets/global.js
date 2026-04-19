/* ============================================
   TRIBE ORGANICS — GLOBAL JS
   Vanilla JS, no jQuery, built for performance
   ============================================ */

'use strict';

// Slider functionality (testimonials, reviews)
(function () {
  document.querySelectorAll('[data-direction]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var trackId = btn.dataset.target;
      var track = document.getElementById(trackId);
      if (!track) return;

      var itemWidth = track.querySelector('*').offsetWidth;
      var gap = parseInt(getComputedStyle(track).gap) || 20;
      var scrollAmount = itemWidth + gap;

      if (btn.dataset.direction === 'prev') {
        track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    });
  });

  // Slider dot sync
  document.querySelectorAll('[data-target].slider-dot').forEach(function (dot) {
    dot.addEventListener('click', function () {
      var trackId = dot.dataset.target;
      var track = document.getElementById(trackId);
      if (!track) return;

      var index = parseInt(dot.dataset.index);
      var itemWidth = track.querySelector('*').offsetWidth;
      var gap = parseInt(getComputedStyle(track).gap) || 20;

      track.scrollTo({ left: index * (itemWidth + gap), behavior: 'smooth' });
    });
  });

  // Sync dots on scroll
  document.querySelectorAll('[id^="TestimonialsTrack-"]').forEach(function (track) {
    track.addEventListener('scroll', function () {
      var dots = document.querySelectorAll('[data-target="' + track.id + '"].slider-dot');
      if (!dots.length) return;

      var itemWidth = track.querySelector('*').offsetWidth;
      var gap = parseInt(getComputedStyle(track).gap) || 20;
      var index = Math.round(track.scrollLeft / (itemWidth + gap));

      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === index);
      });
    }, { passive: true });
  });
})();

// Reduce motion
(function () {
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReducedMotion.matches) {
    document.documentElement.style.setProperty('--duration-short', '0.01ms');
    document.documentElement.style.setProperty('--duration-default', '0.01ms');
    document.documentElement.style.setProperty('--duration-long', '0.01ms');
  }
})();

// Focus trap helper
function trapFocus(container, focusElement) {
  var focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  var first = focusableElements[0];
  var last = focusableElements[focusableElements.length - 1];

  container.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  if (focusElement) {
    focusElement.focus();
  } else if (first) {
    first.focus();
  }
}

// Escape key close helper
function onKeyUpEscape(event) {
  if (event.key !== 'Escape') return;
  var openDetails = event.target.closest('details[open]');
  if (!openDetails) return;
  var summary = openDetails.querySelector('summary');
  openDetails.removeAttribute('open');
  if (summary) summary.focus();
}

// Debounce helper
function debounce(fn, delay) {
  var timer;
  return function () {
    var args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(null, args);
    }, delay);
  };
}
