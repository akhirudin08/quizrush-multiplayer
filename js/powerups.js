// ============================================================
// QuizRush - Power-Up Manager
// 3 power-ups per game, each usable once:
//   50:50     — Remove 2 wrong answers
//   Extra Time — Add 5 seconds to the timer
//   Skip       — Skip current question, no penalty
// ============================================================

class PowerUpManager {
  constructor() {
    this.powerups = {
      fifty:    { label: '50:50',  icon: '✂️',  desc: 'Hapus 2 jawaban salah',  used: false },
      addtime:  { label: '+5s',    icon: '⏱️',  desc: 'Tambah 5 detik',         used: false },
      skip:     { label: 'Skip',   icon: '⏭️',  desc: 'Skip soal ini',           used: false }
    };

    // Callbacks — assigned by App
    this.onFiftyFifty = null; // (optionButtons) => void
    this.onAddTime    = null; // () => void
    this.onSkip       = null; // () => void
  }

  /** Reset all power-ups for a new game */
  reset() {
    Object.values(this.powerups).forEach(p => p.used = false);
  }

  /** Return true if any power-up is still available */
  hasAny() {
    return Object.values(this.powerups).some(p => !p.used);
  }

  /**
   * Render the power-up bar into a container element.
   * Should be called after reset() and before each question.
   */
  render(container) {
    container.innerHTML = '';
    Object.entries(this.powerups).forEach(([key, pu]) => {
      const btn = document.createElement('button');
      btn.className = 'powerup-btn' + (pu.used ? ' powerup-used' : '');
      btn.id = `pu-${key}`;
      btn.title = pu.desc;
      btn.disabled = pu.used;
      btn.innerHTML = `
        <span class="powerup-icon">${pu.icon}</span>
        <span class="powerup-label">${pu.label}</span>
      `;
      btn.addEventListener('click', () => this._use(key, container));
      container.appendChild(btn);
    });
  }

  /** Update button states (e.g. after using a power-up mid-game) */
  _refreshBtn(key) {
    const btn = document.getElementById(`pu-${key}`);
    if (!btn) return;
    const pu = this.powerups[key];
    if (pu.used) {
      btn.classList.add('powerup-used');
      btn.disabled = true;
    }
  }

  /** Internal: use a power-up by key */
  _use(key, container) {
    const pu = this.powerups[key];
    if (!pu || pu.used) return;

    pu.used = true;
    this._refreshBtn(key);
    Sounds.play('powerup');

    // Animate button used
    const btn = document.getElementById(`pu-${key}`);
    if (btn) {
      btn.classList.add('powerup-flash');
      setTimeout(() => btn.classList.remove('powerup-flash'), 500);
    }

    switch (key) {
      case 'fifty':
        if (this.onFiftyFifty) this.onFiftyFifty();
        break;
      case 'addtime':
        Sounds.play('addtime');
        if (this.onAddTime) this.onAddTime();
        break;
      case 'skip':
        Sounds.play('skip');
        if (this.onSkip) this.onSkip();
        break;
    }
  }
}
