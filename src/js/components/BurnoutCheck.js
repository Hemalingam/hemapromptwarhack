class BurnoutCheck {
  constructor() {
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.score = 0;
    
    this.modal = document.getElementById('burnout-modal');
    this.modalBody = document.getElementById('burnout-modal-body');
    this.startBtn = document.getElementById('btn-burnout-check');
    this.closeBtn = document.getElementById('close-burnout-modal');
    
    this.initEvents();
  }

  initEvents() {
    if (this.startBtn) {
      this.startBtn.addEventListener('click', () => this.startAssessment());
    }
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.closeModal());
    }
  }

  closeModal() {
    this.modal.classList.add('hidden');
  }

  async startAssessment() {
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.modal.classList.remove('hidden');
    
    this.modalBody.innerHTML = `
      <div style="text-align:center; padding: 2rem;">
        <div class="typing-indicator" style="justify-content:center; margin-bottom:1rem;">
          <span></span><span></span><span></span>
        </div>
        <p style="color:var(--text-secondary);">AI is generating a personalized burnout assessment...</p>
      </div>
    `;

    try {
      // Prompt Gemini to generate 3 questions
      const prompt = `Generate exactly 3 simple yes/no questions to assess caregiver burnout for someone supporting a loved one in addiction recovery. Return ONLY a valid JSON array of 3 strings. Example: ["Do you feel exhausted?", "Are you losing sleep?"]`;
      
      let aiResponse = await window.genAiEngine.answerClinicalQuery(prompt);
      
      // Clean up markdown block if present
      aiResponse = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      
      this.questions = JSON.parse(aiResponse);
      
      if (!Array.isArray(this.questions) || this.questions.length < 1) {
        throw new Error("Invalid format");
      }
    } catch (e) {
      console.error("AI Generation Failed, using fallback questions", e);
      this.questions = [
        "Have you felt physically or emotionally exhausted in the past week?",
        "Do you feel like you are sacrificing your own needs for your loved one?",
        "Are you experiencing trouble sleeping or feeling constantly anxious?"
      ];
    }

    this.renderQuestion();
  }

  renderQuestion() {
    if (this.currentQuestionIndex >= this.questions.length) {
      this.renderResults();
      return;
    }

    const qText = this.questions[this.currentQuestionIndex];
    this.modalBody.innerHTML = `
      <div style="text-align:center;">
        <p style="font-size: 0.9rem; color:var(--text-secondary); margin-bottom:0.5rem;">Question ${this.currentQuestionIndex + 1} of ${this.questions.length}</p>
        <h3 style="margin-top:0; margin-bottom:1.5rem; font-size:1.2rem; line-height:1.4;">${qText}</h3>
        
        <div style="display:flex; gap:1rem; justify-content:center;">
          <button class="btn-secondary" id="btn-no" style="flex:1; padding:1rem; font-size:1.1rem;">No</button>
          <button class="btn-primary" id="btn-yes" style="flex:1; padding:1rem; font-size:1.1rem; background:var(--accent-red); border-color:var(--accent-red);">Yes</button>
        </div>
      </div>
    `;

    document.getElementById('btn-yes').addEventListener('click', () => this.answerQuestion(true));
    document.getElementById('btn-no').addEventListener('click', () => this.answerQuestion(false));
  }

  answerQuestion(isYes) {
    if (isYes) this.score++;
    this.currentQuestionIndex++;
    this.renderQuestion();
  }

  renderResults() {
    let percentage = Math.round((this.score / this.questions.length) * 100);
    
    let advice = "";
    let color = "";
    
    if (this.score === 0) {
      color = "var(--accent-emerald)";
      advice = "You are managing well. Keep prioritizing your self-care!";
    } else if (this.score === 1) {
      color = "#f59e0b"; // Amber
      advice = "You are showing mild signs of burnout. Please take 15 minutes today just for yourself.";
    } else {
      color = "var(--accent-red)";
      advice = "You are experiencing high burnout. You cannot pour from an empty cup. Please seek support from a peer group or therapist immediately.";
    }

    this.modalBody.innerHTML = `
      <div style="text-align:center;">
        <h3 style="margin-top:0;">Your Burnout Score</h3>
        
        <div style="margin: 2rem auto; width:120px; height:120px; border-radius:50%; border: 8px solid ${color}; display:flex; align-items:center; justify-content:center;">
          <span style="font-size:2rem; font-weight:bold; color:${color};">${percentage}%</span>
        </div>
        
        <p style="font-size:1.1rem; line-height:1.5; color:var(--text-primary); margin-bottom:1.5rem;">
          ${advice}
        </p>
        
        <button class="btn-primary" id="btn-finish-burnout" style="width:100%;">Close Assessment</button>
      </div>
    `;

    document.getElementById('btn-finish-burnout').addEventListener('click', () => this.closeModal());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.burnoutCheck = new BurnoutCheck();
});
