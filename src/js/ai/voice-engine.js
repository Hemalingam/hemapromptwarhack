/**
 * Web Speech Engine Integration
 * Handles SpeechRecognition (Voice Input) and SpeechSynthesis (Natural Text-to-Speech Output)
 */
class VoiceEngine {
  constructor() {
    this.recognition = null;
    this.synth = window.speechSynthesis;
    this.isListening = false;
    this.onTranscriptCallback = null;
    this.initSpeechRecognition();
  }

  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        console.log('[VoiceEngine] Listening started...');
      };

      this.recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (this.onTranscriptCallback) {
          this.onTranscriptCallback(transcript, event.results[0].isFinal);
        }
      };

      this.recognition.onerror = (err) => {
        console.warn('[VoiceEngine] Recognition error:', err);
        this.isListening = false;
      };

      this.recognition.onend = () => {
        this.isListening = false;
        console.log('[VoiceEngine] Listening ended');
      };
    } else {
      console.warn('[VoiceEngine] SpeechRecognition API not supported in this browser.');
    }
  }

  startListening(callback) {
    if (!this.recognition) {
      alert('Voice recognition is not supported on this browser. Please use Chrome, Edge, or Safari.');
      return false;
    }
    this.onTranscriptCallback = callback;
    try {
      this.recognition.start();
      return true;
    } catch (e) {
      console.error('[VoiceEngine] Failed to start recognition', e);
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  speakText(text, onEndCallback = null) {
    if (!this.synth) {
      console.warn('SpeechSynthesis not available');
      return;
    }

    // Cancel any ongoing speech
    this.synth.cancel();

    // Strip markdown formatting for natural speech
    const cleanText = text
      .replace(/[*_#`~🚨🌊🌱🌬️🧠📚💡⚠️]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95; // Slightly slower, calm pace for high-cognitive load
    utterance.pitch = 1.0;

    // Pick a smooth natural voice if available
    const voices = this.synth.getVoices();
    const preferredVoice = voices.find(v => (v.lang.includes('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Karen'))));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    if (onEndCallback) {
      utterance.onend = onEndCallback;
    }

    this.synth.speak(utterance);
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

window.voiceEngine = new VoiceEngine();
