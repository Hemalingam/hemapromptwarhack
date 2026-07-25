/**
 * Contextual Safety Check-in & 5-4-3-2-1 Grounding Component
 */
class SafetyCheckin {
  constructor() {
    this.groundingStep = 5;
    this.initEvents();
  }

  initEvents() {
    // Craving Temperature Slider
    const slider = document.getElementById('craving-slider');
    const valEl = document.getElementById('craving-value');
    const statusEl = document.getElementById('craving-status');
    const analyzeBtn = document.getElementById('analyze-craving-btn');
    const adviceBox = document.getElementById('craving-ai-advice');

    if (slider) {
      slider.addEventListener('input', (e) => {
        const val = e.target.value;
        if (valEl) valEl.innerText = val;

        if (val <= 3) {
          statusEl.innerText = 'Mild Urge (Low Risk)';
          statusEl.style.color = '#10B981';
        } else if (val <= 6) {
          statusEl.innerText = 'Moderate Urge (Manageable)';
          statusEl.style.color = '#F59E0B';
        } else {
          statusEl.innerText = 'Severe Craving Surge (High Risk)';
          statusEl.style.color = '#EF4444';
        }
      });
    }

    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', () => {
        const val = slider ? slider.value : 5;
        const res = window.genAiEngine.generateMicroIntervention('Craving Temperature', val, '');
        if (adviceBox) {
          adviceBox.innerHTML = res.text.replace(/\n/g, '<br>');
          adviceBox.classList.remove('hidden');
        }
      });
    }

    // 5-4-3-2-1 Sensory Grounding Game
    const tapGrid = document.getElementById('grounding-tap-grid');
    const nextBtn = document.getElementById('next-grounding-step-btn');

    if (tapGrid) {
      tapGrid.addEventListener('click', (e) => {
        const chip = e.target.closest('.ground-chip');
        if (chip) {
          chip.classList.toggle('tapped');
          window.audioFxEngine.playChimeTone(440, 0.2);
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.advanceGroundingStep());
    }
  }

  advanceGroundingStep() {
    this.groundingStep -= 1;
    if (this.groundingStep < 1) this.groundingStep = 5;

    const badge = document.getElementById('grounding-count-badge');
    const title = document.getElementById('grounding-prompt-title');
    const grid = document.getElementById('grounding-tap-grid');
    const progressBar = document.getElementById('grounding-progress-bar');

    const stepsData = {
      5: { count: '5 Things', title: 'Look around: Tap 5 things you can SEE right now', items: ['🪑 Chair / Desk', '📱 Phone / Screen', '💡 Light / Lamp', '🌳 Window / Plant', '👟 Shoes / Floor'] },
      4: { count: '4 Things', title: 'Feel your body: Tap 4 things you can TOUCH or FEEL right now', items: ['👕 Fabric of shirt', '🦶 Feet on solid floor', '🌬️ Air on skin', '📱 Smooth phone glass'] },
      3: { count: '3 Things', title: 'Listen carefully: Tap 3 sounds you can HEAR right now', items: ['💨 Fan or A/C hum', '🐦 Birds / Outside traffic', '🫁 Sound of your breath'] },
      2: { count: '2 Things', title: 'Focus on scent: Tap 2 things you can SMELL right now', items: ['☕ Coffee or Tea', '🧼 Soap or Lotion'] },
      1: { count: '1 Thing', title: 'Focus on taste: Tap 1 thing you can TASTE right now', items: ['💧 Fresh sip of water'] }
    };

    const current = stepsData[this.groundingStep];
    if (badge) badge.innerText = current.count;
    if (title) title.innerText = current.title;
    if (grid) {
      grid.innerHTML = current.items.map(item => `<button class="ground-chip">${item}</button>`).join('');
    }

    if (progressBar) {
      progressBar.style.width = `${((6 - this.groundingStep) / 5) * 100}%`;
    }

    window.audioFxEngine.playChimeTone(520, 0.4);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.safetyCheckin = new SafetyCheckin();
});
