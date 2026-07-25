/**
 * Emergency SOS & High Cognitive Load Crisis Overlay Component
 * Provides instant 1-tap crisis options, spoken audio de-escalation,
 * Web Push notification dispatch, and Narcan visual steps.
 */
class EmergencySOS {
  constructor() {
    this.initEvents();
  }

  initEvents() {
    // SOS Header Trigger Pill Button
    const sosTriggerBtn = document.getElementById('hero-sos-trigger');
    const closeModalBtn = document.getElementById('close-sos-modal-btn');
    const overlay = document.getElementById('sos-modal-overlay');

    if (sosTriggerBtn) {
      sosTriggerBtn.addEventListener('click', () => this.openSOSOverlay());
    }

    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => this.closeSOSOverlay());
    }

    // Play SOS Calming Audio Button in Modal
    const sosAudioBtn = document.getElementById('sos-calm-audio-btn');
    if (sosAudioBtn) {
      sosAudioBtn.addEventListener('click', () => {
        const calmingScript = `Pause right now. You are safe. Put your feet flat on the floor. Take a slow, deep breath in... and let it out. Help is immediately available. If you need someone right now, tap Call 988 or 14446. You are valued and you are not alone.`;
        window.voiceEngine.speakText(calmingScript);
      });
    }

    // Direct Narcan Guide Button in Modal
    const sosNarcanBtn = document.getElementById('sos-open-narcan-btn');
    if (sosNarcanBtn) {
      sosNarcanBtn.addEventListener('click', () => {
        this.closeSOSOverlay();
        // Switch to emergency tab and scroll to narcan
        if (window.appRouter) window.appRouter.switchTab('tab-emergency');
        const narcanCard = document.querySelector('.narcan-guide-card');
        if (narcanCard) narcanCard.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Caregiver Web Alert Broadcast Button
    const alertBtn = document.getElementById('broadcast-contacts-btn');
    if (alertBtn) {
      alertBtn.addEventListener('click', async () => {
        const res = await window.crisisAiEngine.triggerCaregiverWebPushAlert();
        alert(`🚨 ALERT DISPATCHED!\n\n${res.message}\n\nTimestamp: ${res.timestamp}\nCaregiver view receives location & emergency de-escalation script.`);
      });
    }

    // Narcan Spoken Voice Steps Button
    const speakNarcanBtn = document.getElementById('speak-narcan-steps-btn');
    if (speakNarcanBtn) {
      speakNarcanBtn.addEventListener('click', () => {
        const narcanScript = `Opioid Overdose Emergency Instructions. Step 1: Check for unresponsiveness and slow breathing. Step 2: Call 911 immediately. Step 3: Peel Naloxone nasal spray package. Insert tip fully into one nostril and press plunger firmly. Step 4: Turn person onto their side in recovery position. Give second dose in other nostril if no response in 2 to 3 minutes.`;
        window.voiceEngine.speakText(narcanScript);
      });
    }

    // Emergency De-Escalation Generator Button
    const genScriptBtn = document.getElementById('generate-script-btn');
    if (genScriptBtn) {
      genScriptBtn.addEventListener('click', () => {
        const roleSelect = document.getElementById('script-role-select');
        const role = roleSelect ? roleSelect.value : 'user_craving';
        const script = window.crisisAiEngine.generateEmergencyScript(role);

        const displayBox = document.getElementById('emergency-script-display');
        const contentBox = document.getElementById('emergency-script-content');

        contentBox.innerText = script;
        displayBox.classList.remove('hidden');

        window.voiceEngine.speakText(script);
      });
    }

    // Read Emergency Script Aloud
    const speakEmergencyScriptBtn = document.getElementById('speak-emergency-script-btn');
    if (speakEmergencyScriptBtn) {
      speakEmergencyScriptBtn.addEventListener('click', () => {
        const text = document.getElementById('emergency-script-content').innerText;
        window.voiceEngine.speakText(text);
      });
    }
  }

  async openSOSOverlay() {
    const overlay = document.getElementById('sos-modal-overlay');
    if (overlay) {
      overlay.classList.remove('hidden');
      window.audioFxEngine.playChimeTone(587, 0.8);
      // Automatically trigger caregiver web push alert on SOS activation
      await window.crisisAiEngine.triggerCaregiverWebPushAlert();
    }
  }

  closeSOSOverlay() {
    const overlay = document.getElementById('sos-modal-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
      window.voiceEngine.stopSpeaking();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.emergencySos = new EmergencySOS();
});
