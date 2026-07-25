/**
 * Sobriety Tracker & Money Saved Calculator Component
 * Calculates exact days, hours, and financial savings in ₹/$.
 */
class SobrietyTracker {
  constructor() {
    this.initUI();
  }

  async initUI() {
    await this.renderSobrietyCard();
  }

  async renderSobrietyCard() {
    const stats = await window.storageManager.getSobrietyStats();
    const container = document.getElementById('sobriety-tracker-container');
    if (!container) return;

    container.innerHTML = `
      <div class="card sobriety-hero-card">
        <div class="card-header">
          <div>
            <span class="badge-tag">Sobriety Milestone</span>
            <h3>Days Sober Counter</h3>
          </div>
          <button id="edit-sobriety-btn" class="btn-secondary">⚙️ Settings</button>
        </div>

        <div class="sobriety-metrics-grid">
          <div class="metric-box">
            <span class="metric-val">${stats.days}</span>
            <span class="metric-lbl">Days Clean & Sober</span>
          </div>
          <div class="metric-box">
            <span class="metric-val">${stats.hours}</span>
            <span class="metric-lbl">Hours Today</span>
          </div>
          <div class="metric-box highlight-money">
            <span class="metric-val">${stats.currency}${stats.moneySaved.toLocaleString()}</span>
            <span class="metric-lbl">Money Saved Total</span>
          </div>
        </div>

        <div class="sobriety-footer">
          <span>Started: <strong>${stats.startDateFormatted}</strong></span>
          <span class="motto">"One day at a time."</span>
        </div>
      </div>
    `;

    const editBtn = document.getElementById('edit-sobriety-btn');
    if (editBtn) {
      editBtn.addEventListener('click', () => this.openEditModal());
    }
  }

  async openEditModal() {
    const profile = await window.storageManager.getProfile();
    const newDaily = prompt('Enter your estimated daily spend on substances (in ₹ or currency):', profile.dailyExpense);
    if (newDaily !== null && !isNaN(parseFloat(newDaily))) {
      await window.storageManager.updateProfile({ dailyExpense: parseFloat(newDaily) });
      await this.renderSobrietyCard();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.sobrietyTracker = new SobrietyTracker();
});
