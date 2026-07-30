// ============================================================
// QuizRush - High Impact Effects
// 1. Full-screen Confetti Canvas (results page)
// 2. Live Emoji Reactions (during quiz)
// 3. Dramatic streak visuals (fire/lightning tiers)
// 4. Critical timer shake + pulse
// ============================================================

// ==========================================
// 1. CONFETTI CANVAS
// ==========================================

const Confetti = (() => {
  let canvas, ctx, particles = [], animId = null;

  const COLORS = [
    '#6C5CE7', '#a78bfa', '#00B894', '#55EFC4',
    '#FDCB6E', '#E17055', '#74B9FF', '#FD79A8',
    '#00CEC9', '#F9CA24', '#F0932B', '#EB4D4B'
  ];

  function createParticle() {
    const side = Math.random() < 0.5 ? -1 : 1;
    return {
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 30,
      w: 8 + Math.random() * 8,
      h: 4 + Math.random() * 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vx: side * (1 + Math.random() * 2),
      vy: 3 + Math.random() * 4,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.15,
      gravity: 0.1 + Math.random() * 0.1,
      opacity: 1,
      shape: Math.random() < 0.4 ? 'circle' : 'rect'
    };
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rot += p.rotSpeed;
      p.opacity -= 0.004;

      if (p.y > canvas.height + 40 || p.opacity <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    }

    if (particles.length > 0) {
      animId = requestAnimationFrame(draw);
    } else {
      stop();
    }
  }

  function start(count = 180) {
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'confetti-canvas';
      canvas.style.cssText = `
        position: fixed; top: 0; left: 0;
        width: 100%; height: 100%;
        pointer-events: none; z-index: 9998;
      `;
      document.body.appendChild(canvas);
      ctx = canvas.getContext('2d');
    }
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.display = 'block';

    if (animId) cancelAnimationFrame(animId);
    particles = [];

    // Burst in waves
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        if (particles.length < 400) particles.push(createParticle());
      }, i * 12);
    }

    animId = requestAnimationFrame(draw);

    // Auto-stop after 6 seconds
    setTimeout(stop, 6000);
  }

  function stop() {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    if (canvas) canvas.style.display = 'none';
    particles = [];
  }

  return { start, stop };
})();


// ==========================================
// 2. LIVE EMOJI REACTIONS
// ==========================================

const EmojiReact = (() => {
  const EMOJIS = ['😂', '🔥', '😱', '🤯', '👏', '💀', '🎉', '😭', '🤔', '⚡'];
  let bar = null;
  let container = null;

  function init() {
    if (document.getElementById('emoji-react-bar')) return;

    // Reaction bar (bottom of quiz page)
    bar = document.createElement('div');
    bar.id = 'emoji-react-bar';
    bar.className = 'emoji-react-bar';
    bar.innerHTML = EMOJIS.map(e =>
      `<button class="emoji-react-btn" data-emoji="${e}" title="React">${e}</button>`
    ).join('');

    // Floating emoji stage
    container = document.createElement('div');
    container.id = 'emoji-float-stage';
    container.className = 'emoji-float-stage';

    document.body.appendChild(bar);
    document.body.appendChild(container);

    bar.addEventListener('click', (e) => {
      const btn = e.target.closest('.emoji-react-btn');
      if (!btn) return;
      const emoji = btn.dataset.emoji;
      spawnFloat(emoji);
      btn.classList.add('react-pop');
      setTimeout(() => btn.classList.remove('react-pop'), 300);
    });
  }

  function spawnFloat(emoji, x = null) {
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'emoji-float';
    el.textContent = emoji;

    const startX = x !== null ? x : 10 + Math.random() * 80;
    el.style.cssText = `
      left: ${startX}%;
      --drift: ${(Math.random() - 0.5) * 60}px;
      font-size: ${1.6 + Math.random() * 1.2}rem;
      animation-duration: ${1.8 + Math.random() * 0.8}s;
    `;

    container.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

  function show() {
    if (!bar) init();
    if (bar) bar.classList.add('visible');
  }

  function hide() {
    if (bar) bar.classList.remove('visible');
  }

  // For multiplayer: called when receiving a reaction from Firebase
  function receive(emoji, side = null) {
    spawnFloat(emoji, side);
  }

  return { init, show, hide, receive, spawnFloat };
})();


// ==========================================
// 3. STREAK VISUAL TIERS
// ==========================================

const StreakFX = (() => {
  let lastTier = 0;
  let activeEl = null;

  const TIERS = [
    { min: 3,  max: 4,  label: '🔥 x{n} Hot!',         class: 'streak-tier-1', color: '#f59e0b' },
    { min: 5,  max: 7,  label: '🔥🔥 x{n} On Fire!',    class: 'streak-tier-2', color: '#ef4444' },
    { min: 8,  max: 9,  label: '⚡ x{n} Lightning!',    class: 'streak-tier-3', color: '#a78bfa' },
    { min: 10, max: 99, label: '💀 x{n} UNSTOPPABLE!',  class: 'streak-tier-4', color: '#06b6d4' },
  ];

  function getTier(streak) {
    if (streak < 3) return null;
    for (let i = TIERS.length - 1; i >= 0; i--) {
      if (streak >= TIERS[i].min) return TIERS[i];
    }
    return null;
  }

  function update(streak, streakEl) {
    const tier = getTier(streak);

    if (!tier) {
      // Reset
      if (streakEl) {
        streakEl.textContent = '';
        streakEl.className = 'quiz-streak-text';
      }
      lastTier = 0;
      return;
    }

    const label = tier.label.replace('{n}', streak);

    if (streakEl) {
      streakEl.textContent = label;
      streakEl.className = `quiz-streak-text streak-active ${tier.class}`;
      streakEl.style.setProperty('--streak-color', tier.color);
    }

    // Tier-up bump animation
    const tierLevel = TIERS.indexOf(tier) + 1;
    if (tierLevel > lastTier) {
      lastTier = tierLevel;
      spawnStreakBanner(label, tier.color);
      if (tier.min >= 5) Sounds.play('combo');
    }
  }

  function spawnStreakBanner(label, color) {
    const el = document.createElement('div');
    el.className = 'streak-banner';
    el.textContent = label;
    el.style.setProperty('--banner-color', color);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  }

  function reset() {
    lastTier = 0;
  }

  return { update, reset };
})();


// ==========================================
// 4. CRITICAL TIMER FX
// ==========================================

const TimerFX = (() => {
  let lastShakeAt = -1;
  let pulseInterval = null;
  let timerEl = null;
  let circleEl = null;

  function init(timerTextEl, timerCircleEl) {
    timerEl = timerTextEl;
    circleEl = timerCircleEl;
    lastShakeAt = -1;
  }

  function update(timeLeft, totalTime) {
    if (!timerEl) return;
    const pct = (timeLeft / totalTime) * 100;
    const sec = Math.ceil(timeLeft);

    // Remove all states first
    timerEl.classList.remove('timer-critical', 'timer-warning', 'timer-ok');

    if (pct <= 25 && timeLeft > 0) {
      timerEl.classList.add('timer-critical');

      // Shake on each whole second (when critical)
      if (sec !== lastShakeAt && Math.abs(timeLeft - sec) < 0.1) {
        lastShakeAt = sec;
        shakeTimer();
      }

      // Flash red border on the circle container
      const circle = circleEl ? circleEl.closest('.timer-circle') : null;
      if (circle) circle.classList.add('timer-danger-ring');
    } else {
      const circle = circleEl ? circleEl.closest('.timer-circle') : null;
      if (circle) circle.classList.remove('timer-danger-ring');

      if (pct <= 50) {
        timerEl.classList.add('timer-warning');
      } else {
        timerEl.classList.add('timer-ok');
      }
    }
  }

  function shakeTimer() {
    if (!timerEl) return;
    const container = timerEl.closest('.timer-circle') || timerEl;
    container.classList.remove('timer-shake');
    void container.offsetWidth; // reflow
    container.classList.add('timer-shake');
    setTimeout(() => container.classList.remove('timer-shake'), 400);
  }

  function reset() {
    lastShakeAt = -1;
    if (timerEl) timerEl.classList.remove('timer-critical', 'timer-warning', 'timer-ok');
    const circle = circleEl ? circleEl.closest('.timer-circle') : null;
    if (circle) circle.classList.remove('timer-danger-ring', 'timer-shake');
  }

  return { init, update, reset };
})();
