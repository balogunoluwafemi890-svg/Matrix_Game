/* ================================================================
   sound.js
   SoundSystem — Web Audio API synthesized sound effects and
   ambient background music, plus the sound toggle button handler.
   ================================================================ */

var SoundSystem = {
  ctx: null,
  muted: false,
  bgMusicGain: null,
  bgOscillators: [],
  bgPlaying: false,

  /** Initialize the AudioContext (must be called after user gesture). */
  init: function () {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { /* Web Audio not supported */ }
  },

  /** Resume AudioContext if suspended (needed after user interaction). */
  resume: function () {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  /** Play a short percussive tap sound for cell/click interactions. */
  playTap: function () {
    if (this.muted || !this.ctx) return;
    this.resume();
    var now = this.ctx.currentTime;
    var osc = this.ctx.createOscillator();
    var gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  },

  /** Play a UI button click sound — crisp and short. */
  playClick: function () {
    if (this.muted || !this.ctx) return;
    this.resume();
    var now = this.ctx.currentTime;
    var osc = this.ctx.createOscillator();
    var gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.04);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  },

  /** Play a correct answer sound — ascending two-tone chime. */
  playCorrect: function () {
    if (this.muted || !this.ctx) return;
    this.resume();
    var now = this.ctx.currentTime;
    var self = this;

    // First note
    var osc1 = this.ctx.createOscillator();
    var gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523, now); // C5
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc1.connect(gain1);
    gain1.connect(self.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.2);

    // Second note (higher)
    var osc2 = this.ctx.createOscillator();
    var gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659, now + 0.1); // E5
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.setValueAtTime(0.2, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(self.ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.35);

    // Sparkle overtone
    var osc3 = this.ctx.createOscillator();
    var gain3 = this.ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(1047, now + 0.15); // C6
    gain3.gain.setValueAtTime(0.001, now);
    gain3.gain.setValueAtTime(0.1, now + 0.15);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc3.connect(gain3);
    gain3.connect(self.ctx.destination);
    osc3.start(now + 0.15);
    osc3.stop(now + 0.45);
  },

  /** Play a wrong answer sound — low descending buzz. */
  playWrong: function () {
    if (this.muted || !this.ctx) return;
    this.resume();
    var now = this.ctx.currentTime;
    var osc = this.ctx.createOscillator();
    var gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.25);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  },

  /** Play a celebration fanfare for level completion. */
  playCelebration: function () {
    if (this.muted || !this.ctx) return;
    this.resume();
    var now = this.ctx.currentTime;
    var self = this;

    // Triumphant 4-note fanfare: C5 → E5 → G5 → C6
    var notes = [
      { freq: 523, time: 0, dur: 0.2 },     // C5
      { freq: 659, time: 0.12, dur: 0.2 },   // E5
      { freq: 784, time: 0.24, dur: 0.2 },   // G5
      { freq: 1047, time: 0.36, dur: 0.5 }   // C6 (sustained)
    ];

    for (var i = 0; i < notes.length; i++) {
      (function (note) {
        var osc = self.ctx.createOscillator();
        var gain = self.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.freq, now + note.time);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.setValueAtTime(0.2, now + note.time);
        gain.gain.setValueAtTime(0.2, now + note.time + note.dur * 0.7);
        gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.dur);
        osc.connect(gain);
        gain.connect(self.ctx.destination);
        osc.start(now + note.time);
        osc.stop(now + note.time + note.dur);
      })(notes[i]);
    }

    // Sparkle arpeggio overlay
    var sparkles = [1319, 1568, 2093]; // E6, G6, C7
    for (var j = 0; j < sparkles.length; j++) {
      (function (freq, idx) {
        var t = 0.5 + idx * 0.08;
        var osc = self.ctx.createOscillator();
        var gain = self.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + t);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.setValueAtTime(0.08, now + t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.3);
        osc.connect(gain);
        gain.connect(self.ctx.destination);
        osc.start(now + t);
        osc.stop(now + t + 0.3);
      })(sparkles[j], j);
    }
  },

  /** Start ambient background music — gentle learning-enhancing loop. */
  startBgMusic: function () {
    if (!this.ctx || this.bgPlaying) return;
    this.resume();
    this.bgPlaying = true;

    // Create a soft ambient pad with slow-moving harmonics
    this.bgMusicGain = this.ctx.createGain();
    this.bgMusicGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    this.bgMusicGain.connect(this.ctx.destination);

    // Base drone notes — a soft C major pad (C3, E3, G3)
    var freqs = [130.81, 164.81, 196.00]; // C3, E3, G3
    var self = this;

    for (var i = 0; i < freqs.length; i++) {
      var osc = this.ctx.createOscillator();
      var oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freqs[i], this.ctx.currentTime);

      // Slow volume modulation for breathing effect
      oscGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

      // LFO for gentle volume swell
      var lfo = this.ctx.createOscillator();
      var lfoGain = this.ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.1 + i * 0.05, this.ctx.currentTime); // Very slow
      lfoGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(oscGain.gain);
      lfo.start(this.ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(self.bgMusicGain);
      osc.start(this.ctx.currentTime);

      self.bgOscillators.push(osc, lfo);
    }

    // Add a very subtle high shimmer
    var shimmer = this.ctx.createOscillator();
    var shimmerGain = this.ctx.createGain();
    shimmer.type = 'sine';
    shimmer.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
    shimmerGain.gain.setValueAtTime(0.05, this.ctx.currentTime);

    var shimmerLfo = this.ctx.createOscillator();
    var shimmerLfoGain = this.ctx.createGain();
    shimmerLfo.type = 'sine';
    shimmerLfo.frequency.setValueAtTime(0.07, this.ctx.currentTime);
    shimmerLfoGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    shimmerLfo.connect(shimmerLfoGain);
    shimmerLfoGain.connect(shimmerGain.gain);
    shimmerLfo.start(this.ctx.currentTime);

    shimmer.connect(shimmerGain);
    shimmerGain.connect(self.bgMusicGain);
    shimmer.start(this.ctx.currentTime);

    self.bgOscillators.push(shimmer, shimmerLfo);
  },

  /** Stop background music. */
  stopBgMusic: function () {
    if (!this.bgPlaying) return;
    this.bgPlaying = false;

    // Fade out gracefully
    if (this.bgMusicGain) {
      try {
        this.bgMusicGain.gain.setValueAtTime(this.bgMusicGain.gain.value, this.ctx.currentTime);
        this.bgMusicGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
      } catch (e) {}
    }

    var self = this;
    setTimeout(function () {
      for (var i = 0; i < self.bgOscillators.length; i++) {
        try { self.bgOscillators[i].stop(); } catch (e) {}
        try { self.bgOscillators[i].disconnect(); } catch (e) {}
      }
      self.bgOscillators = [];
      if (self.bgMusicGain) {
        try { self.bgMusicGain.disconnect(); } catch (e) {}
        self.bgMusicGain = null;
      }
    }, 600);
  },

  /** Toggle mute state. Returns new muted state. */
  toggleMute: function () {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopBgMusic();
    } else {
      // Restart bg music if on game screen
      if (document.getElementById('gameScreen').classList.contains('active')) {
        this.startBgMusic();
      }
    }
    return this.muted;
  }
};


/* ----------------------------------------------------------------
   SOUND TOGGLE BUTTON
   ---------------------------------------------------------------- */

/** Update the sound toggle button icon based on mute state. */
function updateSoundBtnIcon() {
  var btn = document.getElementById('soundToggleBtn');
  if (!btn) return;
  var icon = btn.querySelector('i');
  if (SoundSystem.muted) {
    icon.className = 'fa-solid fa-volume-xmark';
    btn.title = 'Sound off';
  } else {
    icon.className = 'fa-solid fa-volume-high';
    btn.title = 'Sound on';
  }
}

document.addEventListener('DOMContentLoaded', function () {
  var btn = document.getElementById('soundToggleBtn');
  if (!btn) return;
  btn.addEventListener('click', function () {
    SoundSystem.init();
    SoundSystem.toggleMute();
    updateSoundBtnIcon();
    if (!SoundSystem.muted) SoundSystem.playClick();
  });
});
