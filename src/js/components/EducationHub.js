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
    const clearBtn = document.getElementById('clear-chat-btn');

    // Load session history
    this.renderSessionHistory();

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        sessionStorage.removeItem('rag_chat_history');
        sessionStorage.removeItem('has_shown_guardrail');
        this.renderSessionHistory();
      });
    }

    if (queryInput && askBtn) {
      queryInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') askBtn.click();
      });
    }

    if (askBtn) {
      askBtn.addEventListener('click', async () => {
        if (!queryInput || !queryInput.value.trim()) return;
        const query = queryInput.value.trim();
        
        // Show Typing Indicator
        const history = JSON.parse(sessionStorage.getItem('rag_chat_history') || '[]');
        history.push({ query, answer: '<span style="color:var(--text-muted);"><i data-lucide="loader" class="spin"></i> AI is reviewing clinical corpus...</span>' });
        sessionStorage.setItem('rag_chat_history', JSON.stringify(history));
        this.renderSessionHistory();
        
        // Clear input quickly
        queryInput.value = '';

        // Fetch Live AI Answer
        const answer = await window.genAiEngine.answerClinicalQuery(query);

        // Update history with real answer
        const updatedHistory = JSON.parse(sessionStorage.getItem('rag_chat_history') || '[]');
        if (updatedHistory.length > 0) {
          updatedHistory[updatedHistory.length - 1].answer = answer;
          sessionStorage.setItem('rag_chat_history', JSON.stringify(updatedHistory));
        }

        this.renderSessionHistory();
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

  renderSessionHistory() {
    const answerBox = document.getElementById('rag-answer-box');
    if (!answerBox) return;

    const history = JSON.parse(sessionStorage.getItem('rag_chat_history') || '[]');
    if (history.length === 0) {
      answerBox.classList.add('hidden');
      return;
    }

    answerBox.innerHTML = history.map(item => `
      <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem;">
        
        <!-- User Bubble -->
        <div style="display: flex; justify-content: flex-end; padding-left: 2rem;">
          <div style="background: var(--accent-blue); color: var(--bg-dark); padding: 0.75rem 1.25rem; border-radius: 18px; border-bottom-right-radius: 4px; font-size: 0.95rem; box-shadow: 0 4px 12px rgba(56, 189, 248, 0.2);">
            ${item.query}
          </div>
        </div>

        <!-- AI Bubble -->
        <div style="display: flex; justify-content: flex-start; padding-right: 2rem; gap: 0.75rem;">
          <div style="flex-shrink: 0; width: 32px; height: 32px; background: rgba(52, 211, 153, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid var(--accent-emerald);">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
          </div>
          <div style="background: var(--bg-dark); color: var(--text-primary); padding: 0.85rem 1.25rem; border-radius: 18px; border-bottom-left-radius: 4px; border: 1px solid var(--border-color); font-size: 0.95rem; line-height: 1.5;">
            ${item.answer.replace(/\n/g, '<br>')}
          </div>
        </div>

      </div>
    `).join('');
    
    answerBox.classList.remove('hidden');
    answerBox.scrollTop = answerBox.scrollHeight;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.educationHub = new EducationHub();
});
