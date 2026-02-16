// ============================================
// Brio Sparkle System
// 1. Ambient star field — DOM-based twinkling
//    stars scattered across the viewport
// 2. Ambient floating particles — slow canvas
//    dust drifting across the entire page
// 3. Cursor sparkle — bright interactive stars
//    that follow the pointer
// ============================================

(function () {
  'use strict';

  var canvas = document.getElementById('sparkle-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');

  // ---- State ----
  var mouseX = -100;
  var mouseY = -100;
  var lastSpawn = 0;
  var raf;

  // ---- Cursor sparkle config ----
  var SPAWN_INTERVAL = 40;
  var SPAWN_COUNT = 2;
  var MAX_CURSOR = 80;

  // ---- Ambient particle config ----
  var MAX_AMBIENT = 100;
  var AMBIENT_SPAWN_CHANCE = 0.12;    // ~12% chance per frame

  // ---- Ambient star field config ----
  var STAR_COUNT = 100;

  // ---- Pools ----
  var cursorParticles = [];
  var ambientParticles = [];

  // ---- Helpers ----
  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  function getSparkleColors() {
    var style = getComputedStyle(document.documentElement);
    return [
      style.getPropertyValue('--sparkle-1').trim() || '#38BDF8',
      style.getPropertyValue('--sparkle-2').trim() || '#818CF8',
      style.getPropertyValue('--sparkle-3').trim() || '#A78BFA',
      style.getPropertyValue('--sparkle-4').trim() || '#34D399',
    ];
  }

  function randomColor() {
    var c = getSparkleColors();
    return c[Math.floor(Math.random() * c.length)];
  }

  // ---- Canvas resize ----
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  // ---- Mouse tracking ----
  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });


  // =========================================
  // 1. AMBIENT STAR FIELD (DOM elements)
  //    Pure CSS animation — zero per-frame cost
  // =========================================

  function initStarField() {
    var container = document.getElementById('ambient-stars');
    if (!container) {
      container = document.createElement('div');
      container.id = 'ambient-stars';
      document.body.insertBefore(container, document.body.firstChild);
    }

    // Clear any existing stars
    container.innerHTML = '';

    var colors = getSparkleColors();
    var w = window.innerWidth;
    var h = window.innerHeight;

    for (var i = 0; i < STAR_COUNT; i++) {
      var star = document.createElement('div');
      star.className = 'ambient-star';

      var size = randomRange(1, 3);
      var dur = randomRange(2, 7);
      var delay = randomRange(0, 8);
      var color = colors[Math.floor(Math.random() * colors.length)];

      star.style.width = size + 'px';
      star.style.height = size + 'px';
      // Use percentages so they distribute across viewport
      star.style.left = (Math.random() * 100) + '%';
      star.style.top = (Math.random() * 100) + '%';
      star.style.color = color;
      star.style.setProperty('--tw-dur', dur + 's');
      star.style.setProperty('--tw-del', delay + 's');
      star.style.setProperty('--tw-glow', (size + 2) + 'px');

      container.appendChild(star);
    }
  }

  // Regenerate on theme change to pick new colors
  var observer = new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].attributeName === 'class') {
        initStarField();
        break;
      }
    }
  });
  observer.observe(document.documentElement, { attributes: true });


  // =========================================
  // 2. AMBIENT FLOATING PARTICLES (canvas)
  //    Slow, dreamy dust drifting everywhere
  // =========================================

  function createAmbientParticle() {
    var color = randomColor();
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: randomRange(-0.3, 0.3),
      vy: randomRange(-0.4, -0.05),
      size: randomRange(0.8, 2.5),
      life: 1,
      decay: randomRange(0.001, 0.004),   // Very slow — 4–16s lifetime
      color: color,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: randomRange(-0.02, 0.02),
      isStar: Math.random() > 0.5,
    };
  }


  // =========================================
  // 3. CURSOR SPARKLE (canvas)
  //    Bright, responsive, follows pointer
  // =========================================

  function createCursorParticle() {
    var color = randomColor();
    var angle = Math.random() * Math.PI * 2;
    var speed = randomRange(0.3, 1.2);
    var size = randomRange(1.5, 4);

    return {
      x: mouseX + randomRange(-12, 12),
      y: mouseY + randomRange(-12, 12),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - randomRange(0.2, 0.8),
      size: size,
      maxSize: size,
      life: 1,
      decay: randomRange(0.012, 0.025),
      color: color,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: randomRange(-0.05, 0.05),
      isStar: Math.random() > 0.35,
    };
  }


  // =========================================
  // Drawing functions
  // =========================================

  function drawStar(cx, cy, size, rotation, color, alpha) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.globalAlpha = alpha;

    var outer = size;
    var inner = size * 0.35;

    ctx.beginPath();
    for (var i = 0; i < 8; i++) {
      var r = i % 2 === 0 ? outer : inner;
      var a = (i * Math.PI) / 4;
      if (i === 0) {
        ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      } else {
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    ctx.shadowColor = color;
    ctx.shadowBlur = size * 2;
    ctx.fill();
    ctx.restore();
  }

  function drawDot(cx, cy, size, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = size * 3;
    ctx.fill();
    ctx.restore();
  }


  // =========================================
  // Main loop
  // =========================================

  function updateParticle(p) {
    p.x += p.vx;
    p.y += p.vy;
    p.life -= p.decay;
    p.rotation += p.rotSpeed;
  }

  function drawParticle(p, alphaMultiplier) {
    var t = p.life;
    var currentSize = (p.maxSize || p.size) * t;

    // Fade: quick in, slow out
    var alpha = t < 0.3 ? t / 0.3 : 1;
    alpha *= alphaMultiplier;

    if (p.isStar) {
      drawStar(p.x, p.y, currentSize, p.rotation, p.color, alpha);
    } else {
      drawDot(p.x, p.y, currentSize, p.color, alpha);
    }
  }

  function loop(now) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- Spawn ambient particles ---
    if (ambientParticles.length < MAX_AMBIENT && Math.random() < AMBIENT_SPAWN_CHANCE) {
      ambientParticles.push(createAmbientParticle());
    }

    // --- Spawn cursor particles ---
    if (now - lastSpawn > SPAWN_INTERVAL && mouseX > 0) {
      for (var s = 0; s < SPAWN_COUNT; s++) {
        if (cursorParticles.length < MAX_CURSOR) {
          cursorParticles.push(createCursorParticle());
        }
      }
      lastSpawn = now;
    }

    // --- Update & draw ambient particles (dimmer) ---
    for (var i = ambientParticles.length - 1; i >= 0; i--) {
      var ap = ambientParticles[i];
      updateParticle(ap);

      if (ap.life <= 0 || ap.y < -10 || ap.x < -10 || ap.x > canvas.width + 10) {
        ambientParticles.splice(i, 1);
        continue;
      }

      drawParticle(ap, 0.45);
    }

    // --- Update & draw cursor particles (brighter) ---
    for (var j = cursorParticles.length - 1; j >= 0; j--) {
      var cp = cursorParticles[j];
      updateParticle(cp);

      if (cp.life <= 0) {
        cursorParticles.splice(j, 1);
        continue;
      }

      drawParticle(cp, 0.7);
    }

    raf = requestAnimationFrame(loop);
  }


  // =========================================
  // Init
  // =========================================

  // Always init star field (works on all devices)
  initStarField();

  // Canvas particles only on non-touch devices
  if (!('ontouchstart' in window)) {
    raf = requestAnimationFrame(loop);
  }

  // Pause/resume on visibility change
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else if (!('ontouchstart' in window)) {
      raf = requestAnimationFrame(loop);
    }
  });

  // Handle window resize for star field
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      initStarField();
    }, 300);
  });
})();
