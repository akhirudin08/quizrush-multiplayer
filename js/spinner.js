// ============================================================
// QuizRush - Spin the Wheel 🎡
// Randomly picks a player from a spinning canvas wheel
// ============================================================

class SpinWheel {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.names = [];
    this.currentAngle = -Math.PI / 2; // Pointer at top
    this.isSpinning = false;
    this.animationId = null;
    this.lastTickIndex = -1;

    // Callbacks
    this.onResult = null;
    this.onTick = null;

    this.colors = [
      '#6C5CE7', '#00B894', '#FDCB6E', '#E17055', '#74B9FF',
      '#FD79A8', '#A29BFE', '#55EFC4', '#D63031', '#0984E3',
      '#6AB04C', '#EB4D4B'
    ];

    this.initSize();
  }

  initSize() {
    if (!this.canvas || !this.canvas.parentElement) return;
    const container = this.canvas.parentElement;
    const size = Math.min(container.clientWidth - 24, 360);
    this.canvas.width = size;
    this.canvas.height = size;
    this.radius = size / 2 - 14;
    this.cx = size / 2;
    this.cy = size / 2;
    this.draw(this.currentAngle);
  }

  setNames(names) {
    this.names = [...names].filter(n => n.trim() !== '');
    this.currentAngle = -Math.PI / 2;
    this.isSpinning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.lastTickIndex = -1;
    this.draw(this.currentAngle);
  }

  hexToRgb(hex) {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) }
              : { r: 108, g: 92, b: 231 };
  }

  draw(angle) {
    if (!this.canvas) return;
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    ctx.clearRect(0, 0, W, H);

    const n = this.names.length;

    if (n === 0) {
      // Empty wheel placeholder
      ctx.save();
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.arc(this.cx, this.cy, this.radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Tambah nama dulu!', this.cx, this.cy);
      ctx.restore();
      this.drawPointer();
      return;
    }

    const sliceAngle = (2 * Math.PI) / n;

    // Outer glow ring
    ctx.save();
    const outerGlow = ctx.createRadialGradient(
      this.cx, this.cy, this.radius - 5,
      this.cx, this.cy, this.radius + 15
    );
    outerGlow.addColorStop(0, 'rgba(108,92,231,0.35)');
    outerGlow.addColorStop(1, 'rgba(108,92,231,0)');
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, this.radius + 15, 0, Math.PI * 2);
    ctx.fillStyle = outerGlow;
    ctx.fill();
    ctx.restore();

    // Draw segments
    for (let i = 0; i < n; i++) {
      const start = angle + i * sliceAngle;
      const end = start + sliceAngle;
      const mid = start + sliceAngle / 2;

      // Segment fill
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(this.cx, this.cy);
      ctx.arc(this.cx, this.cy, this.radius, start, end);
      ctx.closePath();

      const base = this.hexToRgb(this.colors[i % this.colors.length]);
      const grd = ctx.createRadialGradient(this.cx, this.cy, 0, this.cx, this.cy, this.radius);
      grd.addColorStop(0, `rgba(${Math.min(255, base.r + 60)},${Math.min(255, base.g + 60)},${Math.min(255, base.b + 60)},1)`);
      grd.addColorStop(0.65, `rgba(${base.r},${base.g},${base.b},1)`);
      grd.addColorStop(1, `rgba(${Math.max(0, base.r - 40)},${Math.max(0, base.g - 40)},${Math.max(0, base.b - 40)},1)`);
      ctx.fillStyle = grd;
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Text label
      ctx.save();
      ctx.translate(this.cx, this.cy);
      ctx.rotate(mid);

      const textDist = this.radius * 0.63;
      const fontSize = Math.max(9, Math.min(15, 120 / n));
      ctx.font = `bold ${fontSize}px Outfit, Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.shadowColor = 'rgba(0,0,0,0.85)';
      ctx.shadowBlur = 5;

      const maxLen = n <= 5 ? 14 : n <= 8 ? 11 : 8;
      const label = this.names[i].length > maxLen
        ? this.names[i].slice(0, maxLen - 2) + '..'
        : this.names[i];
      ctx.fillText(label, textDist, 0);
      ctx.restore();
    }

    // Outer border
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // Center pin
    ctx.save();
    const pinGrd = ctx.createRadialGradient(this.cx - 4, this.cy - 4, 2, this.cx, this.cy, 22);
    pinGrd.addColorStop(0, '#fff');
    pinGrd.addColorStop(1, '#ddd');
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, 22, 0, Math.PI * 2);
    ctx.fillStyle = pinGrd;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#6C5CE7';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 0;
    ctx.fillText('⚡', this.cx, this.cy + 1);
    ctx.restore();

    // Arrow pointer
    this.drawPointer();
  }

  drawPointer() {
    const ctx = this.ctx;
    const px = this.cx;
    const pw = 15;
    const ptop = 2;
    const pbot = 28;

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;

    ctx.beginPath();
    ctx.moveTo(px, pbot);       // tip (pointing down into wheel)
    ctx.lineTo(px - pw, ptop);  // top-left
    ctx.lineTo(px + pw, ptop);  // top-right
    ctx.closePath();

    const pGrd = ctx.createLinearGradient(px, ptop, px, pbot);
    pGrd.addColorStop(0, '#FDCB6E');
    pGrd.addColorStop(1, '#E17055');
    ctx.fillStyle = pGrd;
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 0;
    ctx.stroke();
    ctx.restore();
  }

  spin() {
    if (this.isSpinning || this.names.length < 2) return;

    this.isSpinning = true;
    const spins = 5 + Math.random() * 5;   // 5–10 full rotations
    const extra = Math.random() * Math.PI * 2;
    const totalRotation = -(spins * Math.PI * 2 + extra); // negative = counter-clockwise

    const startAngle = this.currentAngle;
    const endAngle = startAngle + totalRotation;
    const duration = 3500 + Math.random() * 1500; // 3.5–5 s
    const startTime = performance.now();
    const n = this.names.length;
    const sliceAngle = (2 * Math.PI) / n;

    const animate = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4); // ease-out quart

      this.currentAngle = startAngle + (endAngle - startAngle) * eased;
      this.draw(this.currentAngle);

      // Segment tick detection (for sound)
      const norm = ((-this.currentAngle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
      const idx = Math.floor(norm / sliceAngle) % n;
      if (idx !== this.lastTickIndex) {
        this.lastTickIndex = idx;
        if (this.onTick) this.onTick();
      }

      if (t < 1) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        this.isSpinning = false;
        this.currentAngle = endAngle;
        const winner = this.getWinner();
        if (this.onResult) this.onResult(winner);
      }
    };

    this.animationId = requestAnimationFrame(animate);
  }

  getWinner() {
    const n = this.names.length;
    const sliceAngle = (2 * Math.PI) / n;
    // Pointer is at top = angle -π/2 from 0
    let norm = ((-this.currentAngle - Math.PI / 2) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    const idx = Math.floor(norm / sliceAngle) % n;
    return {
      name: this.names[idx],
      index: idx,
      color: this.colors[idx % this.colors.length]
    };
  }
}

// ============================================================
// SpinnerManager — handles UI for the Spin the Wheel modal
// ============================================================

class SpinnerManager {
  constructor() {
    this.wheel = null;
    this.names = [];
    this._tickThrottle = 0;
  }

  /** Open the modal, optionally preloading names */
  open(preloadNames = []) {
    // Preload from game session players if names list is empty
    if (this.names.length === 0 && preloadNames.length > 0) {
      this.names = [...preloadNames];
    }

    const modal = document.getElementById('spinner-modal');
    if (!modal) return;
    modal.style.display = 'flex';

    this.renderNamesList();

    // Init wheel after modal is visible so canvas size is correct
    setTimeout(() => {
      this.wheel = new SpinWheel('spin-wheel-canvas');
      this.wheel.setNames(this.names);

      this.wheel.onResult = (winner) => this._showWinner(winner);

      // Throttle tick sounds so they don't overlap and stay audible
      this.wheel.onTick = () => {
        const now = performance.now();
        if (now - this._tickThrottle > 80) {
          this._tickThrottle = now;
          Sounds.play('tick');
        }
      };
    }, 80);
  }

  /** Close the spin modal */
  close() {
    const modal = document.getElementById('spinner-modal');
    if (modal) modal.style.display = 'none';
    if (this.wheel && this.wheel.animationId) {
      cancelAnimationFrame(this.wheel.animationId);
    }
  }

  /** Add a name to the wheel */
  addName(name) {
    name = (name || '').trim();
    if (!name) return;
    if (name.length > 20) name = name.slice(0, 20);
    if (this.names.includes(name)) return; // avoid duplicates
    this.names.push(name);
    this.renderNamesList();
    if (this.wheel) this.wheel.setNames(this.names);
  }

  /** Remove name by index */
  removeName(index) {
    this.names.splice(index, 1);
    this.renderNamesList();
    if (this.wheel) this.wheel.setNames(this.names);
  }

  /** Clear all names */
  clearAll() {
    this.names = [];
    this.renderNamesList();
    if (this.wheel) this.wheel.setNames(this.names);
  }

  /** Render the chips list */
  renderNamesList() {
    const list = document.getElementById('spinner-names-list');
    if (!list) return;

    if (this.names.length === 0) {
      list.innerHTML = '<p class="spinner-empty-hint">Belum ada nama. Tambah di atas!</p>';
      return;
    }

    list.innerHTML = this.names.map((name, i) => `
      <div class="spinner-name-chip">
        <span class="spinner-chip-text">${name}</span>
        <button class="spinner-remove-btn" onclick="App.spinnerManager.removeName(${i})" title="Hapus">✕</button>
      </div>
    `).join('');
  }

  /** Trigger the spin */
  spin() {
    if (!this.wheel) return;
    if (this.names.length < 2) {
      const errEl = document.getElementById('spinner-input-error');
      if (errEl) {
        errEl.textContent = 'Tambahkan minimal 2 nama dulu!';
        setTimeout(() => { errEl.textContent = ''; }, 2500);
      }
      return;
    }
    // Change button appearance while spinning
    const btn = document.getElementById('btn-spin-wheel');
    if (btn) {
      btn.textContent = '⏳ Sedang Putar...';
      btn.disabled = true;
    }
    this.wheel.spin();
  }

  /** Show the winner overlay */
  _showWinner(winner) {
    // Reset spin button
    const btn = document.getElementById('btn-spin-wheel');
    if (btn) {
      btn.innerHTML = '🎰 PUTAR!';
      btn.disabled = false;
    }

    const overlay = document.getElementById('spinner-winner-overlay');
    const nameEl = document.getElementById('spinner-winner-name');
    const barEl = document.getElementById('spinner-winner-color-bar');

    if (nameEl) nameEl.textContent = winner.name;
    if (barEl) barEl.style.background = winner.color;

    if (overlay) {
      overlay.style.display = 'flex';
      overlay.style.opacity = '0';
      requestAnimationFrame(() => {
        overlay.style.transition = 'opacity 0.35s ease';
        overlay.style.opacity = '1';
      });
    }

    Sounds.play('finish');
  }

  /** Close the winner overlay */
  closeWinner() {
    const overlay = document.getElementById('spinner-winner-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
      setTimeout(() => { overlay.style.display = 'none'; }, 350);
    }
  }
}
