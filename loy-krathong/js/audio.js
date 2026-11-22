/**
 * 🎵 Loy Krathong Audio Engine
 * Dedicated player for the couple's Loy Krathong song:
 * "เพลงลอยกระทง วันลอยกระทง Loy Krathong Thailand 4k Video.mp3"
 * + Web Audio API synthesizer for interactive SFX (Sparkles, Splashes, Fireworks, Countdown chimes).
 */

class LoyKrathongAudio {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.volume = 0.7;
    this.masterGain = null;
    this.bgmAudio = null;

    // Single Loy Krathong song requested by user
    this.songFile = 'เพลงลอยกระทง วันลอยกระทง Loy Krathong Thailand 4k Video.mp3';
    this.tracks = [
      { id: 'loy-krathong', title: '🎶 เพลงวันลอยกระทง', src: this.songFile }
    ];
    this.currentTrack = 0;
  }

  init() {
    // 1. Web Audio API for interactive SFX
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // 2. HTML5 Audio element for the single BGM song
    if (!this.bgmAudio) {
      const existingEl = document.getElementById('bgm-audio');
      if (existingEl) {
        this.bgmAudio = existingEl;
      } else {
        this.bgmAudio = new Audio(encodeURI(this.songFile));
        this.bgmAudio.loop = true;
      }
      this.bgmAudio.volume = this.volume;

      // Keep UI state synchronized with real audio playback
      this.bgmAudio.addEventListener('play', () => {
        this.isPlaying = true;
        if (typeof window.onAudioStateChange === 'function') {
          window.onAudioStateChange(true);
        }
      });
      this.bgmAudio.addEventListener('pause', () => {
        this.isPlaying = false;
        if (typeof window.onAudioStateChange === 'function') {
          window.onAudioStateChange(false);
        }
      });
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.volume;
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  togglePlay() {
    this.init();
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  play() {
    this.init();
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.volume;
      const playPromise = this.bgmAudio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.isPlaying = true;
        }).catch(err => {
          console.warn('Audio playback waiting for user gesture:', err);
        });
      }
    }
    this.isPlaying = true;
    return true;
  }

  stop() {
    this.isPlaying = false;
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
  }

  restartAndPlay() {
    this.init();
    if (this.bgmAudio) {
      try {
        this.bgmAudio.currentTime = 0;
      } catch (e) {}
      this.bgmAudio.volume = this.volume;
      const playPromise = this.bgmAudio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.isPlaying = true;
          if (typeof window.onAudioStateChange === 'function') {
            window.onAudioStateChange(true);
          }
        }).catch(err => {
          console.warn('Audio playback waiting for user gesture:', err);
        });
      }
    }
    this.isPlaying = true;
    return true;
  }

  nextTrack() {
    // Only this single song exists, replay from beginning
    if (this.bgmAudio) {
      this.bgmAudio.currentTime = 0;
      if (!this.isPlaying) {
        this.play();
      }
    }
    return this.tracks[0];
  }

  setTrack() {
    return this.tracks[0];
  }

  // --- SOUND EFFECTS (SFX) ---
  scheduleChingRhythm(delaySec = 0, type = 'ching') {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime + delaySec;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(type === 'ching' ? 2400 : 1800, t);

    gain.gain.setValueAtTime(0.08, t);
    const decay = type === 'ching' ? 0.4 : 0.08;
    gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + decay);
  }

  playWaterSplash() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.4);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.5);
  }

  playSparkle() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    [1046, 1318, 1567, 2093].forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t + idx * 0.05);
      gain.gain.setValueAtTime(0.12, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.2);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.22);
    });
  }

  playFirework() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    // Whoosh up
    const whoosh = this.ctx.createOscillator();
    const wGain = this.ctx.createGain();
    whoosh.frequency.setValueAtTime(200, t);
    whoosh.frequency.exponentialRampToValueAtTime(800, t + 0.3);
    wGain.gain.setValueAtTime(0.15, t);
    wGain.gain.linearRampToValueAtTime(0.01, t + 0.3);
    whoosh.connect(wGain);
    wGain.connect(this.masterGain);
    whoosh.start(t);
    whoosh.stop(t + 0.32);

    // Boom
    setTimeout(() => {
      if (!this.ctx || !this.masterGain) return;
      const bt = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const bGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, bt);
      osc.frequency.exponentialRampToValueAtTime(30, bt + 0.6);
      bGain.gain.setValueAtTime(0.4, bt);
      bGain.gain.exponentialRampToValueAtTime(0.001, bt + 0.7);
      osc.connect(bGain);
      bGain.connect(this.masterGain);
      osc.start(bt);
      osc.stop(bt + 0.75);
    }, 280);
  }
}

// Export singleton instance
window.audioEngine = new LoyKrathongAudio();
