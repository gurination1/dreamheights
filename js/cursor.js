/**
 * Interactive Canvas Cursor based on ReGGae (Jesper Landberg - NXqjpo)
 * Features:
 * - Inner center dot (tracks mouse pointer)
 * - Outer concentric follower circle with fluid lerp interpolation (0.22)
 * - mix-blend-mode: difference for automatic high-contrast inversion on dark and light surfaces
 * - Interactive hover expansion on links, buttons, CTAs, tabs, and form elements
 * - Click (mousedown) spring compression feedback
 * - High-DPI (Retina) canvas crispness
 * - Safe mobile deactivation
 */

(function () {
  'use strict';

  function initCursor() {
    // Guard: Mobile touch screens under 768px
    if (window.innerWidth <= 768 && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
      return;
    }

    // Inject required CSS for clean cursor experience
    if (!document.getElementById('reggae-cursor-style')) {
      const style = document.createElement('style');
      style.id = 'reggae-cursor-style';
      style.textContent = `
        .reggae-cursor-canvas {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 2147483647;
          mix-blend-mode: difference;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .reggae-cursor-canvas.is-active {
          opacity: 1;
        }
        @media (min-width: 769px) {
          html, body, a, button, [role="button"], .btn-circle_link, input[type="submit"], input[type="button"] {
            cursor: none !important;
          }
          input[type="text"], input[type="email"], input[type="tel"], textarea {
            cursor: text !important;
          }
        }
        @media (max-width: 768px) {
          .reggae-cursor-canvas {
            display: none !important;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Create or retrieve canvas
    let canvas = document.querySelector('.reggae-cursor-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
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

    // Cursor state
    let mouseX = width / 2;
    let mouseY = height / 2;
    let isMouseInside = false;
    let isHovering = false;

    const circle = {
      x: mouseX,
      y: mouseY,
      radius: 14,
      baseRadius: 14,
      hoverRadius: 36,
      fillAlpha: 0,
      hoverAlpha: 0.18,
      strokeWidth: 1.5,
      scale: 1
    };

    const dot = {
      x: mouseX,
      y: mouseY,
      radius: 3,
      baseRadius: 3,
      scale: 1
    };

    // Lerp utility matching ReGGae NXqjpo
    function lerp(a, b, n) {
      return (1 - n) * a + n * b;
    }

    // Hover target selector
    const interactiveSelector = `
      a, button, [hover-nav-item], [data-hover], .btn-circle, .btn-circle_link,
      .nav-item, .tab_link, .accordion-item, .cursor-hover, [role="button"],
      input[type="submit"], input[type="button"], [data-modal-cta-btn],
      .card_preview, .swiper-button-prev, .swiper-button-next, .lightbox-link,
      .menu_btn, .nav_item, .footer_link, .brand
    `.trim();

    // Mouse move
    window.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isMouseInside) {
        isMouseInside = true;
        canvas.classList.add('is-active');
        circle.x = mouseX;
        circle.y = mouseY;
        dot.x = mouseX;
        dot.y = mouseY;
      }
    }, { passive: true });

    // Window leave / enter
    document.addEventListener('mouseleave', function () {
      isMouseInside = false;
      canvas.classList.remove('is-active');
    });

    document.addEventListener('mouseenter', function (e) {
      isMouseInside = true;
      mouseX = e.clientX;
      mouseY = e.clientY;
      canvas.classList.add('is-active');
    });

    // Mousedown / Mouseup physical feedback
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

    // Event delegation for dynamic hover support
    document.addEventListener('mouseover', function (e) {
      const target = e.target.closest(interactiveSelector);
      if (target && !isHovering) {
        isHovering = true;
        if (window.gsap) {
          gsap.to(circle, {
            radius: circle.hoverRadius,
            fillAlpha: circle.hoverAlpha,
            duration: 0.3,
            ease: 'power2.out',
            overwrite: 'auto'
          });
          gsap.to(dot, {
            radius: 2,
            duration: 0.3,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        } else {
          circle.radius = circle.hoverRadius;
          circle.fillAlpha = circle.hoverAlpha;
          dot.radius = 2;
        }
      }
    });

    document.addEventListener('mouseout', function (e) {
      const target = e.target.closest(interactiveSelector);
      if (target) {
        const related = e.relatedTarget ? e.relatedTarget.closest(interactiveSelector) : null;
        if (!related) {
          isHovering = false;
          if (window.gsap) {
            gsap.to(circle, {
              radius: circle.baseRadius,
              fillAlpha: 0,
              duration: 0.3,
              ease: 'power2.out',
              overwrite: 'auto'
            });
            gsap.to(dot, {
              radius: dot.baseRadius,
              duration: 0.3,
              ease: 'power2.out',
              overwrite: 'auto'
            });
          } else {
            circle.radius = circle.baseRadius;
            circle.fillAlpha = 0;
            dot.radius = dot.baseRadius;
          }
        }
      }
    });

    // Render loop using requestAnimationFrame + lerp
    function render() {
      // Outer circle follows with 0.22 lerp (signature ReGGae lag)
      circle.x = lerp(circle.x, mouseX, 0.22);
      circle.y = lerp(circle.y, mouseY, 0.22);

      // Inner dot follows tightly (0.85 lerp)
      dot.x = lerp(dot.x, mouseX, 0.85);
      dot.y = lerp(dot.y, mouseY, 0.85);

      // Reset transform & clear
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      if (isMouseInside) {
        const curRadius = circle.radius * circle.scale;

        // 1. Outer Concentric Follower Circle
        if (curRadius > 0.5) {
          ctx.beginPath();
          ctx.arc(circle.x, circle.y, curRadius, 0, Math.PI * 2, false);

          if (circle.fillAlpha > 0.001) {
            ctx.fillStyle = `rgba(255, 255, 255, ${circle.fillAlpha})`;
            ctx.fill();
          }

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.lineWidth = circle.strokeWidth;
          ctx.stroke();
          ctx.closePath();
        }

        // 2. Inner Center Dot
        const curDotRadius = dot.radius * dot.scale;
        if (curDotRadius > 0.5) {
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, curDotRadius, 0, Math.PI * 2, false);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.closePath();
        }
      }

      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

    window.__reggaeCursor = { circle, dot, render };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCursor);
  } else {
    initCursor();
  }
})();
