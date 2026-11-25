// Procedural 8-Bit / Arcade Sound Synthesizer (Web Audio API)
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type, duration, vol = 0.15, slideFreq = null) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideFreq) {
      osc.frequency.exponentialRampToValueAtTime(slideFreq, now + duration);
    }

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  jump() {
    this.playTone(220, 'square', 0.16, 0.12, 580);
  }

  shoot(charType) {
    if (charType === 'programmer') {
      // Crisp cyan semicolon pew
      this.playTone(680, 'square', 0.09, 0.1, 240);
    } else if (charType === 'tester') {
      // High-tech QA laser beam
      this.playTone(920, 'sawtooth', 0.14, 0.11, 310);
    } else {
      // Intern rapid coffee pop
      this.playTone(520, 'triangle', 0.08, 0.13, 790);
    }
  }

  coin() {
    if (!this.enabled) return;
    this.playTone(987.77, 'square', 0.07, 0.11); // B5
    setTimeout(() => this.playTone(1318.51, 'square', 0.22, 0.11), 65); // E6
  }

  blockBump() {
    this.playTone(140, 'triangle', 0.1, 0.18, 90);
  }

  powerupSpawn() {
    const notes = [330, 392, 659, 523, 587, 784];
    notes.forEach((n, i) => {
      setTimeout(() => this.playTone(n, 'square', 0.08, 0.1), i * 55);
    });
  }

  powerupCollect() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => {
      setTimeout(() => this.playTone(n, 'triangle', 0.12, 0.15), i * 65);
    });
  }

  stomp() {
    this.playTone(360, 'square', 0.12, 0.15, 110);
  }

  enemyHit() {
    this.playTone(190, 'sawtooth', 0.07, 0.1, 110);
  }

  hurt() {
    this.playTone(210, 'sawtooth', 0.25, 0.18, 75);
  }

  special() {
    const notes = [440, 554, 659, 880, 1108];
    notes.forEach((n, i) => {
      setTimeout(() => this.playTone(n, 'sawtooth', 0.14, 0.14), i * 45);
    });
  }

  victory() {
    const notes = [523, 659, 784, 1046, 784, 1046];
    const delays = [0, 120, 240, 360, 520, 660];
    notes.forEach((n, i) => {
      setTimeout(() => this.playTone(n, 'square', 0.18, 0.14), delays[i]);
    });
  }
}

window.sfx = new SoundEngine();

