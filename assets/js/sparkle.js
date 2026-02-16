// ============================================
// Cursor Sparkle — twinkling star aura
// Canvas-based particle system that spawns
// small glowing stars around the cursor.
// ============================================

(function () {
  var canvas = document.getElementById('sparkle-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var particles = [];
  var mouseX = -100;
  var mouseY = -100;
  var lastSpawn = 0;
  var raf;

  // How often we spawn (ms between bursts)
  var SPAWN_INTERVAL = 40;
  // Particles per burst
  var SPAWN_COUNT = 2;
  // Max particles alive at once
  var MAX_PARTICLES = 80;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  // Track mouse
  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Read sparkle colours from CSS custom properties
  function getSparkleColors() {
    var style = getComputedStyle(document.documentElement);
    return [
      style.getPropertyValue('--sparkle-1').trim() || '#38BDF8',
      style.getPropertyValue('--sparkle-2').trim() || '#818CF8',
      style.getPropertyValue('--sparkle-3').trim() || '#A78BFA',
      style.getPropertyValue('--sparkle-4').trim() || '#C084FC',
    ];
  }

  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createParticle() {
    var colors = getSparkleColors();
    var color = colors[Math.floor(Math.random() * colors.length)];
    var angle = Math.random() * Math.PI * 2;
    var speed = randomRange(0.3, 1.2);
    var size = randomRange(1.5, 4);

    return {
      x: mouseX + randomRange(-12, 12),
      y: mouseY + randomRange(-12, 12),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - randomRange(0.2, 0.8), // slight upward drift
      size: size,
      maxSize: size,
      life: 1, // 1 → 0
      decay: randomRange(0.012, 0.025),
      color: color,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: randomRange(-0.05, 0.05),
      // Star or circle
      isStar: Math.random() > 0.35,
    };
  }

  // Draw a 4-point star
  function drawStar(cx, cy, size, rotation, color, alpha) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.globalAlpha = alpha;

    // Outer rays
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

    // Glow
    ctx.shadowColor = color;
    ctx.shadowBlur = size * 2;
    ctx.fill();

    ctx.restore();
  }

  // Draw a soft circle
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

  function loop(now) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Spawn new particles near cursor
    if (now - lastSpawn > SPAWN_INTERVAL && mouseX > 0) {
      for (var s = 0; s < SPAWN_COUNT; s++) {
        if (particles.length < MAX_PARTICLES) {
          particles.push(createParticle());
        }
      }
      lastSpawn = now;
    }

    // Update and draw
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];

      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      p.rotation += p.rotSpeed;

      // Ease-out size: full at life=1, 0 at life=0
      var t = p.life;
      var currentSize = p.maxSize * t;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      // Fade: quick in, slow out
      var alpha = t < 0.3 ? t / 0.3 : 1;
      alpha *= 0.7; // overall softness

      if (p.isStar) {
        drawStar(p.x, p.y, currentSize, p.rotation, p.color, alpha);
      } else {
        drawDot(p.x, p.y, currentSize, p.color, alpha);
      }
    }

    raf = requestAnimationFrame(loop);
  }

  // Only run sparkles on non-touch devices
  if (!('ontouchstart' in window)) {
    raf = requestAnimationFrame(loop);
  }

  // Cleanup on page hide
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else if (!('ontouchstart' in window)) {
      raf = requestAnimationFrame(loop);
    }
  });
})();
