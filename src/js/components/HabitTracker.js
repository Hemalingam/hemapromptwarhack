/**
 * Habit Tool Component
 * Tracks daily recovery & self-care habits with streak counts.
 */
class HabitTracker {
  constructor() {
    this.initUI();
  }

  initUI() {
    this.renderHabits();
  }

  renderHabits() {
    const habits = window.storageManager.getHabits();
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

  toggle(id) {
    window.storageManager.toggleHabit(id);
    this.renderHabits();
    window.audioFxEngine.playChimeTone(659, 0.4);
  }

  addNewHabit(title, category) {
    if (!title || !title.trim()) return;
    window.storageManager.addHabit(title.trim(), category);
    this.renderHabits();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.habitTracker = new HabitTracker();
});
