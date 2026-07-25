/**
 * Educational Hub & Clinical RAG Chatbot Component
 */
class EducationHub {
  constructor() {
    this.initEvents();
  }

  initEvents() {
    const askBtn = document.getElementById('rag-ask-btn');
    const queryInput = document.getElementById('rag-query-input');
    const answerBox = document.getElementById('rag-answer-box');

    if (askBtn) {
      askBtn.addEventListener('click', () => {
        if (!queryInput || !queryInput.value.trim()) return;
        const query = queryInput.value.trim();
        const answer = window.genAiEngine.answerClinicalQuery(query);

        if (answerBox) {
          answerBox.innerHTML = answer.replace(/\n/g, '<br>');
          answerBox.classList.remove('hidden');
        }
      });
    }

    // Quick RAG chip buttons
    const chips = document.querySelectorAll('.rag-chip-btn');
    chips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        const query = e.target.innerText.replace(/[🧪🧠💙🛡️]/g, '').trim();
        if (queryInput) queryInput.value = query;
        if (askBtn) askBtn.click();
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.educationHub = new EducationHub();
});
