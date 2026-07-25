/**
 * Habit Tool Component
 * Tracks daily recovery & self-care habits with streak counts.
 */
class HabitTracker {
  constructor() {
    this.initUI();
  }

  async initUI() {
    await this.renderHabits();
  }

  async renderHabits() {
    const habits = await window.storageManager.getHabits();
    const container = document.getElementById('habits-list-container');
    if (!container) return;

    container.innerHTML = habits.map(h => `
      <div class="habit-item ${h.completedToday ? 'completed' : ''}" data-id="${h.id}">
        <div class="habit-left">
          <button class="habit-check-btn ${h.completedToday ? 'active' : ''}" onclick="window.habitTracker.toggle('${h.id}')">
            ${h.completedToday ? '✓' : ''}
          </button>
          <div>
            <h4 class="habit-title">${h.title}</h4>
            <span class="habit-category">${h.category}</span>
          </div>
        </div>
        <div class="habit-streak">
          🔥 <strong>${h.streak}</strong> day streak
        </div>
      </div>
    `).join('');
  }

  async toggle(id) {
    await window.storageManager.toggleHabit(id);
    await this.renderHabits();
    window.audioFxEngine.playChimeTone(659, 0.4);
  }

  async addNewHabit(title, category) {
    if (!title || !title.trim()) return;
    await window.storageManager.addHabit(title.trim(), category);
    await this.renderHabits();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.habitTracker = new HabitTracker();
});
