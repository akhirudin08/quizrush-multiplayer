// ============================================================
// QuizRush - Sound Manager
// Uses Web Audio API — no external audio files needed!
// ============================================================

class SoundManager {
  constructor() {
    this._ctx = null;
    this._muted = false;
    this._masterGain = null;
    this._initialized = false;
  }

  // Lazy-init AudioContext (must be after user gesture)
  _init() {
    if (this._initialized) return;
    try {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._masterGain = this._ctx.createGain();
      this._masterGain.connect(this._ctx.destination);
      this._masterGain.gain.value = 0.6;
      this._initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  get isMuted() {
    return this._muted;
  }

  mute() {
    this._muted = true;
    if (this._masterGain) this._masterGain.gain.value = 0;
  }

  unmute() {
    this._muted = false;
    if (this._masterGain) this._masterGain.gain.value = 0.6;
  }

  toggleMute() {
    if (this._muted) this.unmute(); else this.mute();
    return this._muted;
  }

  // ---- Low-level helpers ----

  _createOscillator(type, freq, gainVal, duration, startTime) {
    if (!this._ctx || this._muted) return;
    const osc = this._ctx.createOscillator();
    const gain = this._ctx.createGain();
    osc.connect(gain);
    gain.connect(this._masterGain);

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(gainVal, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  _now() {
    return this._ctx ? this._ctx.currentTime : 0;
  }

  // ---- Sound Presets ----

  play(type) {
    this._init();
    if (!this._initialized || this._muted) return;

    // Resume if suspended (autoplay policy)
    if (this._ctx.state === 'suspended') {
      this._ctx.resume();
    }

    switch (type) {
      case 'correct':   this._playCorrect();   break;
      case 'wrong':     this._playWrong();     break;
      case 'tick':      this._playTick();      break;
      case 'combo':     this._playCombo();     break;
      case 'finish':    this._playFinish();    break;
      case 'powerup':   this._playPowerup();   break;
      case 'skip':      this._playSkip();      break;
      case 'addtime':   this._playAddTime();   break;
      case 'countdown': this._playCountdown(); break;
      case 'go':        this._playGo();        break;
      default: break;
    }
  }

  _playCorrect() {
    // Cheerful ascending arpeggio
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    const now = this._now();
    notes.forEach((freq, i) => {
      this._createOscillator('sine', freq, 0.4, 0.2, now + i * 0.08);
    });
  }

  _playWrong() {
    // Descending "buzz" thud
    const now = this._now();
    const osc = this._ctx.createOscillator();
    const gain = this._ctx.createGain();
    osc.connect(gain);
    gain.connect(this._masterGain);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.3);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  _playTick() {
    // Short crisp click for countdown
    const now = this._now();
    this._createOscillator('square', 880, 0.15, 0.05, now);
  }

  _playCombo() {
    // Triumphant rising sequence for streak
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5-E5-G5-C6
    const now = this._now();
    notes.forEach((freq, i) => {
      this._createOscillator('sine', freq, 0.35, 0.15, now + i * 0.06);
    });
    // Extra sparkle on top
    this._createOscillator('triangle', 2093, 0.2, 0.3, now + 0.18);
  }

  _playFinish() {
    // Victory fanfare
    const melody = [
      { f: 523.25, t: 0.00, d: 0.15 },
      { f: 659.25, t: 0.15, d: 0.15 },
      { f: 783.99, t: 0.30, d: 0.15 },
      { f: 1046.5, t: 0.45, d: 0.50 },
      { f: 880.00, t: 0.55, d: 0.15 },
      { f: 1046.5, t: 0.70, d: 0.60 }
    ];
    const now = this._now();
    melody.forEach(note => {
      this._createOscillator('sine', note.f, 0.3, note.d, now + note.t);
    });
  }

  _playPowerup() {
    // Magic shimmer
    const now = this._now();
    [400, 600, 900, 1200].forEach((f, i) => {
      this._createOscillator('triangle', f, 0.25, 0.15, now + i * 0.05);
    });
  }

  _playSkip() {
    // Whoosh up
    const now = this._now();
    const osc = this._ctx.createOscillator();
    const gain = this._ctx.createGain();
    osc.connect(gain);
    gain.connect(this._masterGain);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.25);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  _playAddTime() {
    // Gentle "bloop bloop" up
    const now = this._now();
    this._createOscillator('sine', 440, 0.3, 0.12, now);
    this._createOscillator('sine', 660, 0.3, 0.12, now + 0.13);
  }

  _playCountdown() {
    // Deep metronome tick
    const now = this._now();
    this._createOscillator('square', 440, 0.2, 0.08, now);
  }

  _playGo() {
    // Energetic "GO!" burst
    const now = this._now();
    [523.25, 783.99, 1046.5].forEach((f, i) => {
      this._createOscillator('sine', f, 0.4, 0.25, now + i * 0.05);
    });
  }
}

// Global instance
const Sounds = new SoundManager();
