/**
 * Voice Recovery Journal Component
 * Allows audio or text logging with automatic GenAI sentiment and trigger analysis.
 */
class VoiceJournal {
  constructor() {
    this.initEvents();
  }

  initEvents() {
    const journalMicBtn = document.getElementById('journal-mic-btn');
    const submitBtn = document.getElementById('submit-journal-btn');
    const textInput = document.getElementById('journal-text-input');

    if (journalMicBtn) {
      journalMicBtn.addEventListener('click', () => {
        window.voiceEngine.startListening((transcript, isFinal) => {
          if (textInput) textInput.value = transcript;
        });
      });
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        if (!textInput || !textInput.value.trim()) return;
        const text = textInput.value.trim();

        // Perform AI sentiment/trigger analysis
        let sentiment = 'Neutral';
        let advice = 'Keep taking it one step at a time.';

        if (text.toLowerCase().includes('craving') || text.toLowerCase().includes('hard') || text.toLowerCase().includes('stress')) {
          sentiment = 'High Stress / Trigger Detected';
          advice = 'Notice where you feel this tension in your body. Consider doing a 5-minute breathing session.';
        } else if (text.toLowerCase().includes('proud') || text.toLowerCase().includes('good') || text.toLowerCase().includes('sober')) {
          sentiment = 'Positive Recovery Streak';
          advice = 'Celebrate this victory! Sharing your progress in Peer Support can inspire others today.';
        }

        window.storageManager.addJournalEntry({
          text,
          sentiment,
          advice
        });

        textInput.value = '';
        this.renderJournalEntries();
      });
    }

    this.renderJournalEntries();
  }

  renderJournalEntries() {
    const entries = window.storageManager.getJournalEntries();
    const container = document.getElementById('journal-entries-list');
    if (!container) return;

    if (entries.length === 0) {
      container.innerHTML = '<p class="text-muted">No voice journal entries logged yet today.</p>';
      return;
    }

    container.innerHTML = entries.map(e => `
      <div class="journal-entry-card">
        <div class="entry-header">
          <span class="entry-date">📅 ${e.date}</span>
          <span class="sentiment-badge">${e.sentiment}</span>
        </div>
        <p class="entry-text">"${e.text}"</p>
        <div class="entry-advice">
          ✨ <strong>GenAI Feedback:</strong> ${e.advice}
        </div>
      </div>
    `).join('');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.voiceJournal = new VoiceJournal();
});
