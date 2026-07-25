/**
 * Pace-Guided Audio-Visual Breathing Circle Component
 * Supports Box Breathing (4-4-4-4) and Calm Breathing (4-7-8)
 */
class BreathingCircle {
  constructor() {
    this.isActive = false;
    this.timer = null;
    this.mode = 'box'; // 'box' or 'calm'
    this.initEvents();
  }

  initEvents() {
    const toggleBtn = document.getElementById('toggle-breath-btn');
    const startActionBtn = document.getElementById('start-breathing-action');
    
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleBreathing());
    }
    if (startActionBtn) {
      startActionBtn.addEventListener('click', () => {
        // Scroll to breathing widget and start
        const widget = document.getElementById('breath-circle');
        if (widget) widget.scrollIntoView({ behavior: 'smooth' });
        if (!this.isActive) this.startBreathing();
      });
    }

    // Mode Selector Chips
    const chips = document.querySelectorAll('.breath-mode-selector .mode-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        chips.forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        this.mode = e.target.getAttribute('data-mode');
        if (this.isActive) this.stopBreathing();
      });
    });
  }

  toggleBreathing() {
    if (this.isActive) {
      this.stopBreathing();
    } else {
      this.startBreathing();
    }
  }

  startBreathing() {
    this.isActive = true;
    const toggleBtn = document.getElementById('toggle-breath-btn');
    if (toggleBtn) toggleBtn.innerText = 'Stop Breathing Session';
    
    // Play subtle chime
    window.audioFxEngine.playChimeTone(432, 1);
    this.runCycle();
  }

  stopBreathing() {
    this.isActive = false;
    clearTimeout(this.timer);
    const circle = document.getElementById('breath-circle');
    const label = document.getElementById('breath-instruction');
    const timerLabel = document.getElementById('breath-timer');
    const toggleBtn = document.getElementById('toggle-breath-btn');

    if (circle) {
      circle.className = 'breath-circle';
    }
    if (label) label.innerText = 'Tap to Start';
    if (timerLabel) timerLabel.innerText = '0.0s';
    if (toggleBtn) toggleBtn.innerText = 'Start Breathing Session';

    window.voiceEngine.stopSpeaking();
  }

  runCycle() {
    if (!this.isActive) return;

    const circle = document.getElementById('breath-circle');
    const label = document.getElementById('breath-instruction');
    const timerLabel = document.getElementById('breath-timer');

    if (this.mode === 'box') {
      // Box Breathing: Inhale 4s, Hold 4s, Exhale 4s, Hold 4s
      this.stepInhale(circle, label, timerLabel, 4, () => {
        this.stepHold(circle, label, timerLabel, 4, () => {
          this.stepExhale(circle, label, timerLabel, 4, () => {
            this.stepHold(circle, label, timerLabel, 4, () => {
              if (this.isActive) this.runCycle();
            });
          });
        });
      });
    } else {
      // 4-7-8 Calm Breathing: Inhale 4s, Hold 7s, Exhale 8s
      this.stepInhale(circle, label, timerLabel, 4, () => {
        this.stepHold(circle, label, timerLabel, 7, () => {
          this.stepExhale(circle, label, timerLabel, 8, () => {
            if (this.isActive) this.runCycle();
          });
        });
      });
    }
  }

  stepInhale(circle, label, timerLabel, seconds, onComplete) {
    if (!this.isActive) return;
    circle.className = 'breath-circle inhale';
    label.innerText = 'Inhale...';
    window.voiceEngine.speakText('Inhale gently');
    this.countDown(timerLabel, seconds, onComplete);
  }

  stepHold(circle, label, timerLabel, seconds, onComplete) {
    if (!this.isActive) return;
    circle.className = 'breath-circle hold';
    label.innerText = 'Hold...';
    this.countDown(timerLabel, seconds, onComplete);
  }

  stepExhale(circle, label, timerLabel, seconds, onComplete) {
    if (!this.isActive) return;
    circle.className = 'breath-circle exhale';
    label.innerText = 'Exhale...';
    window.voiceEngine.speakText('Exhale slowly');
    this.countDown(timerLabel, seconds, onComplete);
  }

  countDown(timerLabel, seconds, callback) {
    let remaining = seconds;
    const interval = setInterval(() => {
      if (!this.isActive) {
        clearInterval(interval);
        return;
      }
      remaining -= 0.1;
      if (timerLabel) timerLabel.innerText = Math.max(0, remaining).toFixed(1) + 's';
      if (remaining <= 0) {
        clearInterval(interval);
        if (callback) callback();
      }
    }, 100);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.breathingCircle = new BreathingCircle();
});
