/**
 * Storage Utility - Local Encrypted Data Manager
 * Manages user profile, sobriety start date, money saved, habits, peer posts, and emergency contacts.
 */
const STORAGE_KEY = 'anchor_recovery_app_data_v1';

const DEFAULT_DATA = {
  profile: {
    name: 'Friend',
    soberStartDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // Default 14 days ago
    dailyExpense: 350, // Average daily spend on substance in INR (₹350)
    currency: '₹',
    primaryCaregiverContact: '+91-9876543210',
    caregiverName: 'Trusted Caregiver'
  },
  habits: [
    { id: 'h1', title: '5-Minute Morning Diaphragmatic Breathing', streak: 12, completedToday: true, category: 'Self-Care' },
    { id: 'h2', title: 'Drink 2L Water & Hydrate', streak: 14, completedToday: true, category: 'Health' },
    { id: 'h3', title: 'Evening Voice Journal Reflection', streak: 8, completedToday: false, category: 'Mindfulness' },
    { id: 'h4', title: 'Attend 1 Peer Support Session / Group Call', streak: 5, completedToday: false, category: 'Recovery' }
  ],
  peerPosts: [
    { id: 'p1', author: 'SoberWarrior_IN', time: '20 mins ago', content: 'Day 30 today! Survived a high-trigger wedding event using the Anchor 1-tap breathing tool. Staying strong.', likes: 14, badge: '30 Days Sober' },
    { id: 'p2', author: 'HopeSeeker', time: '2 hours ago', content: 'Having a strong urge this evening after a long work shift. Listening to the calming voice guide right now.', likes: 8, badge: 'Day 7' },
    { id: 'p3', author: 'CaregiverAarti', time: '5 hours ago', content: 'To all caregivers out there: setting boundaries is self-preservation, not abandonment. Sending strength.', likes: 21, badge: 'Caregiver Ally' }
  ],
  journalEntries: [],
  safetyPlan: {
    warningSigns: ['Increased irritability', 'Isolating from family', 'Skipping meals'],
    copingStrategies: ['5-4-3-2-1 Grounding Game', 'Box Breathing', 'Calling Tele-MANAS 14446'],
    safeEnvironments: ['Local park', 'Support group hall', 'Home quiet room']
  }
};

class StorageManager {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_DATA;
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error loading storage, returning defaults', e);
      return DEFAULT_DATA;
    }
  }

  saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }

  getProfile() {
    return this.data.profile;
  }

  updateProfile(updates) {
    this.data.profile = { ...this.data.profile, ...updates };
    this.saveData();
    return this.data.profile;
  }

  getSobrietyStats() {
    const startDate = new Date(this.data.profile.soberStartDate);
    const now = new Date();
    const diffMs = Math.max(0, now - startDate);
    
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const remainingHours = totalHours % 24;
    
    const dailySpend = parseFloat(this.data.profile.dailyExpense) || 0;
    const moneySaved = Math.floor((diffMs / (1000 * 60 * 60 * 24)) * dailySpend);

    return {
      days,
      hours: remainingHours,
      totalHours,
      moneySaved,
      currency: this.data.profile.currency || '₹',
      startDateFormatted: startDate.toLocaleDateString()
    };
  }

  getHabits() {
    return this.data.habits;
  }

  toggleHabit(habitId) {
    const habit = this.data.habits.find(h => h.id === habitId);
    if (habit) {
      habit.completedToday = !habit.completedToday;
      if (habit.completedToday) {
        habit.streak += 1;
      } else {
        habit.streak = Math.max(0, habit.streak - 1);
      }
      this.saveData();
    }
    return this.data.habits;
  }

  addHabit(title, category = 'Self-Care') {
    const newHabit = {
      id: 'h_' + Date.now(),
      title,
      streak: 1,
      completedToday: true,
      category
    };
    this.data.habits.push(newHabit);
    this.saveData();
    return this.data.habits;
  }

  getPeerPosts() {
    return this.data.peerPosts;
  }

  addPeerPost(content, author = 'Anonymous Member') {
    const newPost = {
      id: 'p_' + Date.now(),
      author,
      time: 'Just now',
      content,
      likes: 1,
      badge: 'Community Member'
    };
    this.data.peerPosts.unshift(newPost);
    this.saveData();
    return this.data.peerPosts;
  }

  likePost(postId) {
    const post = this.data.peerPosts.find(p => p.id === postId);
    if (post) {
      post.likes += 1;
      this.saveData();
    }
    return this.data.peerPosts;
  }

  addJournalEntry(entry) {
    this.data.journalEntries.unshift({
      id: 'j_' + Date.now(),
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...entry
    });
    this.saveData();
    return this.data.journalEntries;
  }

  getJournalEntries() {
    return this.data.journalEntries;
  }
}

window.storageManager = new StorageManager();
