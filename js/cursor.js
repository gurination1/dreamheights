/**
 * 1:1 Implementation of ReGGae Canvas Cursor (Jesper Landberg - NXqjpo)
 * Source: https://codepen.io/ReGGae/full/NXqjpo
 * Features:
 * - Single reactive canvas dot/circle with mix-blend-mode: difference
 * - Fluid lerp trailing (0.25)
 * - Smooth 3x scale expansion on hover of interactive elements
 * - Zero extra concentric rings (exact ReGGae pen behavior)
 */

(function () {
  'use strict';

  function setupCursor() {
    let canvas = document.getElementById('cursor-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'cursor-canvas';
      canvas.className = 'js-canvas';
      document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    let dpr = window.devicePixelRatio || 1;
    let width = canvas.width = window.innerWidth * dpr;
    let height = canvas.height = window.innerHeight * dpr;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    const circle = {
      radius: 10,
      baseRadius: 10,
      hoverRadius: 30,
      lastX: mouseX,
      lastY: mouseY
    };

    function onResize() {
      dpr = window.devicePixelRatio || 1;
      width = canvas.width = window.innerWidth * dpr;
      height = canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    }

    onResize();
    window.addEventListener('resize', onResize, false);

    function lerp(a, b, n) {
      return (1 - n) * a + n * b;
    }

    function render() {
      circle.lastX = lerp(circle.lastX, mouseX, 0.25);
      circle.lastY = lerp(circle.lastY, mouseY, 0.25);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      ctx.beginPath();
      ctx.arc(circle.lastX, circle.lastY, circle.radius, 0, Math.PI * 2, false);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.closePath();

      requestAnimationFrame(render);
    }

    function updatePos(x, y) {
      mouseX = x;
      mouseY = y;
    }

    window.addEventListener('mousemove', function (e) {
      updatePos(e.clientX, e.clientY);
    }, { passive: true });

    window.addEventListener('pointermove', function (e) {
      updatePos(e.clientX, e.clientY);
    }, { passive: true });

    window.addEventListener('touchmove', function (e) {
      if (e.touches && e.touches[0]) {
        updatePos(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchstart', function (e) {
      if (e.touches && e.touches[0]) {
        updatePos(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    const interactiveSelector = [
      'a', 'button', '[role="button"]', 'input', 'textarea', 'select',
      '.btn-circle', '.btn-circle_link', '[hover-nav-item]', '[data-hover]',
      '.nav-item', '.tab_link', '.accordion-item', '.cursor-hover',
      '[data-modal-cta-btn]', '[data-modal-menu-btn]', '[data-tab-trigger]',
      '[data-filter-trigger]', '.card_preview', '.swiper-button-prev',
      '.swiper-button-next', '.lightbox-link', '.menu_btn', '.brand',
      '.footer_link', '[data-scroll-reveal]', '.loc-path-s_title'
    ].join(', ');

    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(interactiveSelector)) {
        if (window.gsap) {
          gsap.to(circle, {
            radius: circle.hoverRadius,
            duration: 0.25,
            ease: 'power1.easeInOut',
            overwrite: 'auto'
          });
        } else {
          circle.radius = circle.hoverRadius;
        }
      }
    });

    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(interactiveSelector)) {
        const related = e.relatedTarget ? e.relatedTarget.closest(interactiveSelector) : null;
        if (!related) {
          if (window.gsap) {
            gsap.to(circle, {
              radius: circle.baseRadius,
              duration: 0.25,
              ease: 'power1.easeInOut',
              overwrite: 'auto'
            });
          } else {
            circle.radius = circle.baseRadius;
          }
        }
      }
    });

    requestAnimationFrame(render);
    window.__reggaeCursor = { circle, render };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCursor);
  } else {
    setupCursor();
  }
})();
