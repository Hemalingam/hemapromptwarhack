/**
 * Zero-Typing Wheel & Micro-Intervention Component
 * Handles single-tap emotion selectors and voice express mic logic.
 */
class ZeroTypingWheel {
  constructor() {
    this.initEvents();
  }

  initEvents() {
    // 1-Tap Emotion Matrix Buttons
    const matrix = document.getElementById('emotion-matrix');
    if (matrix) {
      matrix.addEventListener('click', (e) => {
        const btn = e.target.closest('.emotion-btn');
        if (btn) {
          const emotion = btn.getAttribute('data-emotion');
          const intensity = btn.getAttribute('data-intensity');
          const prompt = btn.getAttribute('data-prompt');
          this.handleEmotionTap(emotion, intensity, prompt);
        }
      });
    }

    // Voice Express Mic Hero Button
    const micBtn = document.getElementById('mic-main-btn');
    if (micBtn) {
      micBtn.addEventListener('click', () => {
        this.toggleVoiceRecording();
      });
    }

    // Audio Output Playback
    const speakBtn = document.getElementById('speak-ai-output-btn');
    if (speakBtn) {
      speakBtn.addEventListener('click', () => {
        const text = document.getElementById('ai-response-text').innerText;
        window.voiceEngine.speakText(text);
      });
    }
  }

  handleEmotionTap(emotion, intensity, prompt) {
    const outputCard = document.getElementById('ai-intervention-output');
    const textEl = document.getElementById('ai-response-text');

    // Generate GenAI response
    const intervention = window.genAiEngine.generateMicroIntervention(emotion, intensity, prompt);
    
    // Render Output
    textEl.innerHTML = intervention.text.replace(/\n/g, '<br>');
    outputCard.classList.remove('hidden');

    // Scroll smoothly to output
    outputCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Audio Chime FX & auto-speak short summary
    window.audioFxEngine.playChimeTone(528, 1);
  }

  toggleVoiceRecording() {
    const micBtn = document.getElementById('mic-main-btn');
    const statusLabel = document.getElementById('mic-status-label');
    const visualizer = document.getElementById('voice-visualizer');
    const previewEl = document.getElementById('voice-transcript-preview');

    if (!window.voiceEngine.isListening) {
      const started = window.voiceEngine.startListening((transcript, isFinal) => {
        previewEl.innerText = `"${transcript}"`;
        if (isFinal && transcript.trim().length > 0) {
          // Process voice input through GenAI
          this.handleEmotionTap('Voice Expressed Urge', 7, transcript);
          micBtn.classList.remove('recording');
          statusLabel.innerText = 'Tap to Speak';
          visualizer.classList.add('hidden');
        }
      });

      if (started) {
        micBtn.classList.add('recording');
        statusLabel.innerText = 'Listening...';
        visualizer.classList.remove('hidden');
      }
    } else {
      window.voiceEngine.stopListening();
      micBtn.classList.remove('recording');
      statusLabel.innerText = 'Tap to Speak';
      visualizer.classList.add('hidden');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.zeroTypingWheel = new ZeroTypingWheel();
});
