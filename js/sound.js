/**
 * @fileoverview Sound Manager - sound effects for the quiz
 *
 * The sounds are generated with the Web Audio API instead of audio files,
 * so the app stays fully self-contained and works offline.
 *
 * SOUNDS:
 * - playCorrect() - bright rising arpeggio when the answer is correct
 * - playWrong()   - low descending buzz when the answer is wrong
 *
 * HOW IT WORKS:
 * Browsers block audio until the user interacts with the page, so the
 * AudioContext is created lazily on the first gesture (unlock()).
 */

/**
 * SOUND MANAGER
 */
export class SoundManager {
  constructor(volume = 0.3) {
    this.volume = volume; // master volume (0 - 1)
    this.enabled = true;
    this.context = null;
  }

  /**
   * Create the AudioContext (once) and make sure it is running.
   * Call this from a user gesture (click/keypress) to unlock audio.
   */
  unlock() {
    const ctx = this.getContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume();
    }
    return ctx;
  }

  /**
   * Get (and create if needed) the AudioContext
   */
  getContext() {
    if (!this.context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;

      // browser doesn't support the Web Audio API
      if (!AudioContextClass) return null;

      this.context = new AudioContextClass();
    }
    return this.context;
  }

  /**
   * Play a single note with a fast attack and a smooth fade out
   * @param {number} frequency - pitch in Hz
   * @param {number} startTime - when to start (AudioContext time)
   * @param {number} duration - how long the note lasts (seconds)
   * @param {object} options - { type: oscillator type, gain: volume }
   */
  playTone(frequency, startTime, duration, options = {}) {
    const ctx = this.context;
    if (!ctx) return;

    const { type = "sine", gain = 1 } = options;

    const oscillator = ctx.createOscillator();
    const amplifier = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);

    // fade in -> fade out (never use 0 with exponential ramps)
    amplifier.gain.setValueAtTime(0.0001, startTime);
    amplifier.gain.exponentialRampToValueAtTime(
      this.volume * gain,
      startTime + 0.02
    );
    amplifier.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    oscillator.connect(amplifier);
    amplifier.connect(ctx.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.05);
  }

  /**
   * Correct answer - happy rising arpeggio (C5 - E5 - G5 - C6)
   */
  playCorrect() {
    if (!this.enabled) return;

    const ctx = this.unlock();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];

    notes.forEach((frequency, index) => {
      this.playTone(frequency, now + index * 0.09, 0.35, {
        type: "triangle",
        gain: 1 - index * 0.12,
      });
    });
  }

  /**
   * Wrong answer - low descending buzz
   */
  playWrong() {
    if (!this.enabled) return;

    const ctx = this.unlock();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [329.63, 246.94, 185.0];

    notes.forEach((frequency, index) => {
      this.playTone(frequency, now + index * 0.12, 0.28, {
        type: "sawtooth",
        gain: 0.5,
      });
    });
  }

  /**
   * Turn the sounds on / off
   */
  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

// One shared instance for the whole app
const sound = new SoundManager();

export default sound;
