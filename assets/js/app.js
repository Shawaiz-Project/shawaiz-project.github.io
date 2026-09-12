/* Shawaiz Ali — Portfolio interactions: vanilla JavaScript only. */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var prefersReduced = reducedMotion.matches;
  var revealEls = document.querySelectorAll('.reveal');

  if (!prefersReduced && 'IntersectionObserver' in window) {
    var perParent = new Map();
    revealEls.forEach(function (el) {
      var count = perParent.get(el.parentNode) || 0;
      el.style.setProperty('--d', Math.min(count * 0.075, 0.38) + 's');
      perParent.set(el.parentNode, count + 1);
    });

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  var bars = document.querySelectorAll('.bar-fill[data-value]');
  function fillBar(bar) {
    var value = Number(bar.getAttribute('data-value'));
    bar.style.width = Math.min(100, Math.max(0, value || 0)) + '%';
  }

  if (bars.length && !prefersReduced && 'IntersectionObserver' in window) {
    var barObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          fillBar(entry.target);
          barObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });
    bars.forEach(function (bar) { barObserver.observe(bar); });
  } else {
    bars.forEach(fillBar);
  }

  if (!prefersReduced && window.matchMedia('(pointer: fine)').matches) {
    var glowCards = document.querySelectorAll('.hero, .paper, .exp-list > li, .skills-col, .edu-card');
    glowCards.forEach(function (card) {
      card.addEventListener('pointermove', function (event) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', (event.clientX - rect.left) + 'px');
        card.style.setProperty('--my', (event.clientY - rect.top) + 'px');
      }, { passive: true });
    });
  }
})();
