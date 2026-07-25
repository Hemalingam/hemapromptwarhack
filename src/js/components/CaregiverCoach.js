/**
 * Caregiver Boundary Coach Component
 * Generates situation-specific caregiver scripts and boundary guidance.
 */
class CaregiverCoach {
  constructor() {
    this.initEvents();
  }

  initEvents() {
    const btn = document.getElementById('get-caregiver-guidance-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        const select = document.getElementById('caregiver-scenario-select');
        const scenario = select ? select.value : 'refusing_treatment';
        const script = window.crisisAiEngine.generateEmergencyScript(scenario === 'refusing_treatment' ? 'caregiver_confrontation' : 'caregiver_deescalate');

        const outputBox = document.getElementById('caregiver-script-output');
        if (outputBox) {
          outputBox.innerHTML = `
            <strong>💙 Caregiver Empathetic Script:</strong><br><br>
            ${script.replace(/\n/g, '<br>')}<br><br>
            <em>Remember: Your well-being and safety matter just as much. Setting a boundary is an act of self-care.</em>
          `;
          outputBox.classList.remove('hidden');
        }
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.caregiverCoach = new CaregiverCoach();
});
