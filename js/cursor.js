/**
 * Interactive Canvas Cursor based on ReGGae (Jesper Landberg - NXqjpo)
 * - Normal state: ONLY the inner dot tracks the pointer
 * - Hover state: Outer concentric circle smoothly expands (36px) around the dot
 * - mix-blend-mode: difference for automatic high-contrast inversion
 * - Interactive hover expansion on links, buttons, CTAs, and interactive elements
 * - Responsive to mouse, pointer, and touch
 * - High-DPI (Retina) crispness
 */

(function () {
  'use strict';

  function setupCursor() {
    let canvas = document.getElementById('cursor-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'cursor-canvas';
      canvas.className = 'reggae-cursor-canvas js-canvas';
      document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    let dpr = window.devicePixelRatio || 1;
    let width = window.innerWidth;
    let height = window.innerHeight;

    function resize() {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    let mouseX = width / 2;
    let mouseY = height / 2;
    let hasMoved = false;
    let isHovering = false;

    // Outer concentric circle: 0 in normal state, expands on hover
    const circle = {
      x: mouseX,
      y: mouseY,
      radius: 0,
      baseRadius: 0,
      hoverRadius: 36,
      fillAlpha: 0,
      hoverAlpha: 0.22,
      strokeWidth: 1.5,
      scale: 1,
      opacity: 0
    };

    // Inner dot: always visible in normal state
    const dot = {
      x: mouseX,
      y: mouseY,
      radius: 3.5,
      baseRadius: 3.5,
      scale: 1
    };

    function lerp(a, b, n) {
      return (1 - n) * a + n * b;
    }

    function updatePos(x, y) {
      mouseX = x;
      mouseY = y;
      if (!hasMoved) {
        hasMoved = true;
        circle.x = mouseX;
        circle.y = mouseY;
        dot.x = mouseX;
        dot.y = mouseY;
      }
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

    // Interactive element hover selectors
    const interactiveSelector = [
      'a', 'button', '[role="button"]', 'input', 'textarea', 'select',
      '.btn-circle', '.btn-circle_link', '[hover-nav-item]', '[data-hover]',
      '.nav-item', '.tab_link', '.accordion-item', '.cursor-hover',
      '[data-modal-cta-btn]', '[data-modal-menu-btn]', '[data-tab-trigger]',
      '[data-filter-trigger]', '.card_preview', '.swiper-button-prev',
      '.swiper-button-next', '.lightbox-link', '.menu_btn', '.brand',
      '.footer_link', '[data-scroll-reveal]', '.loc-path-s_title'
    ].join(', ');

    window.addEventListener('mousedown', function () {
      if (window.gsap) {
        gsap.to(circle, { scale: 0.75, duration: 0.15, ease: 'power2.out', overwrite: 'auto' });
        gsap.to(dot, { scale: 1.4, duration: 0.15, ease: 'power2.out', overwrite: 'auto' });
      } else {
        circle.scale = 0.75;
        dot.scale = 1.4;
      }
    });

    window.addEventListener('mouseup', function () {
      if (window.gsap) {
        gsap.to(circle, { scale: 1, duration: 0.25, ease: 'back.out(2)', overwrite: 'auto' });
        gsap.to(dot, { scale: 1, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
      } else {
        circle.scale = 1;
        dot.scale = 1;
      }
    });

    // Hover triggers: bloom outer concentric circle, contract dot slightly
    document.addEventListener('mouseover', function (e) {
      const target = e.target.closest(interactiveSelector);
      if (target && !isHovering) {
        isHovering = true;
        if (window.gsap) {
          gsap.to(circle, {
            radius: circle.hoverRadius,
            fillAlpha: circle.hoverAlpha,
            opacity: 1,
            duration: 0.28,
            ease: 'power2.out',
            overwrite: 'auto'
          });
          gsap.to(dot, {
            scale: 0.8,
            duration: 0.28,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        } else {
          circle.radius = circle.hoverRadius;
          circle.fillAlpha = circle.hoverAlpha;
          circle.opacity = 1;
          dot.scale = 0.8;
        }
      }
    });

    // Leave triggers: collapse outer circle back to 0 (only dot remains in normal state)
    document.addEventListener('mouseout', function (e) {
      const target = e.target.closest(interactiveSelector);
      if (target) {
        const related = e.relatedTarget ? e.relatedTarget.closest(interactiveSelector) : null;
        if (!related) {
          isHovering = false;
          if (window.gsap) {
            gsap.to(circle, {
              radius: 0,
              fillAlpha: 0,
              opacity: 0,
              duration: 0.25,
              ease: 'power2.inOut',
              overwrite: 'auto'
            });
            gsap.to(dot, {
              scale: 1,
              duration: 0.25,
              ease: 'power2.out',
              overwrite: 'auto'
            });
          } else {
            circle.radius = 0;
            circle.fillAlpha = 0;
            circle.opacity = 0;
            dot.scale = 1;
          }
        }
      }
    });

    function render() {
      // Outer circle trails with fluid 0.22 lerp
      circle.x = lerp(circle.x, mouseX, 0.22);
      circle.y = lerp(circle.y, mouseY, 0.22);

      // Inner dot follows tightly
      dot.x = lerp(dot.x, mouseX, 0.88);
      dot.y = lerp(dot.y, mouseY, 0.88);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // 1. Outer Concentric Circle: only rendered when blooming on hover
      const curRadius = circle.radius * circle.scale;
      if (curRadius > 1 && circle.opacity > 0.01) {
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, curRadius, 0, Math.PI * 2, false);
        if (circle.fillAlpha > 0.01) {
          ctx.fillStyle = `rgba(255, 255, 255, ${circle.fillAlpha * circle.opacity})`;
          ctx.fill();
        }
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.95 * circle.opacity})`;
        ctx.lineWidth = circle.strokeWidth;
        ctx.stroke();
        ctx.closePath();
      }

      // 2. Inner Center Dot: ALWAYS present in normal state and hover
      const curDotRadius = dot.radius * dot.scale;
      if (curDotRadius > 0.5) {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, curDotRadius, 0, Math.PI * 2, false);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.closePath();
      }

      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
    window.__reggaeCursor = { circle, dot, render };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCursor);
  } else {
    setupCursor();
  }
})();
