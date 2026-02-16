// ============================================
// EPD Studios — Main JS
// ============================================

(function () {

  // ------------------------------------------
  // Mobile Menu Toggle
  // ------------------------------------------
  var menuToggle = document.getElementById('mobile-menu-toggle');
  var mobileMenu = document.getElementById('mobile-menu');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      menuToggle.classList.toggle('active');
      // Toggle between hidden and flex display
      if (mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.remove('hidden');
        mobileMenu.classList.add('flex');
      } else {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('flex');
      }
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menuToggle.classList.remove('active');
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('flex');
      });
    });
  }

  // ------------------------------------------
  // Intersection Observer — Fade In on Scroll
  // ------------------------------------------
  var fadeElements = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    fadeElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    fadeElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // ------------------------------------------
  // Smooth scroll for anchor links
  // ------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;

      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var offset = 80; // header height
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  // ------------------------------------------
  // Header shadow on scroll
  // ------------------------------------------
  var header = document.querySelector('header');

  if (header) {
    window.addEventListener('scroll', function () {
      if (window.pageYOffset > 100) {
        header.classList.add('shadow-md');
      } else {
        header.classList.remove('shadow-md');
      }
    });
  }

})();
