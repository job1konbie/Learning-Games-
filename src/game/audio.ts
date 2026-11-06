/**
 * Audio synthesis engine using Web Audio API for the 2D Slingshot Duck Game.
 * Fully self-contained, high quality, and responsive with zero external asset latency.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterVolume: number = 0.5;

  constructor() {
    // Read user mute preference if saved
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('duck_shot_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
      const savedVol = localStorage.getItem('duck_shot_vol');
      if (savedVol !== null) {
        this.masterVolume = parseFloat(savedVol) || 0.5;
      }
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('duck_shot_muted', String(this.isMuted));
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (typeof window !== 'undefined') {
      localStorage.setItem('duck_shot_vol', String(this.masterVolume));
    }
  }

  public getVolume(): number {
    return this.masterVolume;
  }

  /**
   * Slingshot rubber band stretch tension sound
   * pitch increases with stretch distance
   */
  public playStretch(tensionRatio: number) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    // Frequency shifts higher as band is pulled
    const freq = 120 + tensionRatio * 180;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq + 40, t + 0.05);

    gain.gain.setValueAtTime(0.04 * this.masterVolume, t);
    gain.gain.linearRampToValueAtTime(0.01 * this.masterVolume, t + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  /**
   * Slingshot release snap twang
   */
  public playRelease() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.12);

    gain.gain.setValueAtTime(0.2 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  /**
   * Quintessential rubber duck squeak / quack sound!
   * Pitch modulated oscillator to simulate a playful squeeze toy.
   */
  public playQuack(pitchMultiplier = 1) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // First part: high rubber squeak
    const squeakOsc = this.ctx.createOscillator();
    const squeakGain = this.ctx.createGain();

    squeakOsc.type = 'triangle';
    squeakOsc.frequency.setValueAtTime(650 * pitchMultiplier, t);
    squeakOsc.frequency.exponentialRampToValueAtTime(850 * pitchMultiplier, t + 0.06);
    squeakOsc.frequency.exponentialRampToValueAtTime(420 * pitchMultiplier, t + 0.22);

    squeakGain.gain.setValueAtTime(0.01, t);
    squeakGain.gain.linearRampToValueAtTime(0.22 * this.masterVolume, t + 0.04);
    squeakGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    squeakOsc.connect(squeakGain);
    squeakGain.connect(this.ctx.destination);

    squeakOsc.start(t);
    squeakOsc.stop(t + 0.26);

    // Second harmonic for nasal quack timbre
    const quackOsc = this.ctx.createOscillator();
    const quackGain = this.ctx.createGain();
    quackOsc.type = 'sawtooth';
    quackOsc.frequency.setValueAtTime(320 * pitchMultiplier, t + 0.04);
    quackOsc.frequency.linearRampToValueAtTime(380 * pitchMultiplier, t + 0.12);
    quackOsc.frequency.exponentialRampToValueAtTime(240 * pitchMultiplier, t + 0.25);

    quackGain.gain.setValueAtTime(0.12 * this.masterVolume, t + 0.04);
    quackGain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);

    quackOsc.connect(quackGain);
    quackGain.connect(this.ctx.destination);

    quackOsc.start(t + 0.04);
    quackOsc.stop(t + 0.27);
  }

  /**
   * Water splash sound
   */
  public playSplash() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Filtered noise + low sine drop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.25);

    gain.gain.setValueAtTime(0.25 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  /**
   * Wooden plank or crate impact
   */
  public playWoodHit() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.09);

    gain.gain.setValueAtTime(0.2 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.11);
  }

  /**
   * Explosive barrel / bomb detonation
   */
  public playExplosion() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Low boom
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.4);

    gain.gain.setValueAtTime(0.4 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.46);
  }

  /**
   * Splitter projectile activation
   */
  public playSplit() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [500, 750, 1000];
    freqs.forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t + i * 0.03);
      gain.gain.setValueAtTime(0.12 * this.masterVolume, t + i * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.03 + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t + i * 0.03);
      osc.stop(t + i * 0.03 + 0.11);
    });
  }

  /**
   * Victory / Level completed fanfare
   */
  public playVictory() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.0, 523.25, 659.25]; // C, E, G, C, E
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.09);

      gain.gain.setValueAtTime(0.18 * this.masterVolume, t + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.09 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t + idx * 0.09);
      osc.stop(t + idx * 0.09 + 0.36);
    });
  }

  /**
   * Star earned ding
   */
  public playStarDing(index: number) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const freq = [587.33, 739.99, 880.0][index % 3] || 880;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.2 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.42);
  }

  /**
   * Button UI click
   */
  public playClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.04);

    gain.gain.setValueAtTime(0.08 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.045);
  }
}

export const sounds = new SoundEngine();
