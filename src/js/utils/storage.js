/**
 * Storage Utility - IndexedDB with Web Crypto API Encryption
 * Compliant with 42 CFR Part 2 conceptual guidelines (local encryption).
 */
const DB_NAME = 'NudgeFlowDB';
const DB_VERSION = 1;
const STORE_NAME = 'secure_store';

const DEFAULT_DATA = {
  profile: {
    name: 'Friend',
    soberStartDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    dailyExpense: 350,
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
    { id: 'p1', author: 'SoberWarrior_IN', time: '20 mins ago', content: 'Day 30 today! Survived a high-trigger event. Staying strong.', likes: 14, badge: '30 Days Sober' },
    { id: 'p2', author: 'HopeSeeker', time: '2 hours ago', content: 'Having a strong urge. Listening to the calming voice guide right now.', likes: 8, badge: 'Day 7' }
  ],
  journalEntries: [],
  safetyPlan: {
    warningSigns: ['Increased irritability', 'Isolating from family'],
    copingStrategies: ['5-4-3-2-1 Grounding Game', 'Calling Tele-MANAS 14446'],
    safeEnvironments: ['Local park', 'Support group hall']
  }
};

class StorageManager {
  constructor() {
    this.db = null;
    this.cryptoKey = null;
    this.data = null;
    this.readyPromise = this.init();
  }

  async init() {
    await this.initCrypto();
    await this.initDB();
    await this.loadData();
  }

  // --- CRYPTO LOGIC ---
  async initCrypto() {
    const rawKey = localStorage.getItem('nudgeflow_device_key');
    if (!rawKey) {
      // Generate new key
      this.cryptoKey = await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );
      const exported = await crypto.subtle.exportKey("raw", this.cryptoKey);
      const exportedAsString = String.fromCharCode.apply(null, new Uint8Array(exported));
      const exportedAsBase64 = window.btoa(exportedAsString);
      localStorage.setItem('nudgeflow_device_key', exportedAsBase64);
    } else {
      // Import existing key
      const binaryString = window.atob(rawKey);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      this.cryptoKey = await crypto.subtle.importKey(
        "raw",
        bytes,
        { name: "AES-GCM" },
        true,
        ["encrypt", "decrypt"]
      );
    }
  }

  async encryptData(dataStr) {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(dataStr);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      this.cryptoKey,
      encoded
    );
    return {
      iv: Array.from(iv),
      cipher: Array.from(new Uint8Array(encrypted))
    };
  }

  async decryptData(encryptedObj) {
    const iv = new Uint8Array(encryptedObj.iv);
    const cipher = new Uint8Array(encryptedObj.cipher);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      this.cryptoKey,
      cipher
    );
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  // --- INDEXED DB LOGIC ---
  initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve();
      };

      request.onerror = (e) => reject(e);
    });
  }

  async loadData() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get('app_state');

      request.onsuccess = async () => {
        if (request.result) {
          try {
            const decryptedStr = await this.decryptData(request.result);
            this.data = JSON.parse(decryptedStr);
          } catch (e) {
            console.error("Decryption failed. Re-initializing.", e);
            this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
          }
        } else {
          this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
        }
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveData() {
    const dataStr = JSON.stringify(this.data);
    const encryptedObj = await this.encryptData(dataStr);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(encryptedObj, 'app_state');

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- ASYNC API METHODS ---
  async getProfile() {
    await this.readyPromise;
    return this.data.profile;
  }

  async updateProfile(updates) {
    await this.readyPromise;
    this.data.profile = { ...this.data.profile, ...updates };
    await this.saveData();
    return this.data.profile;
  }

  async getSobrietyStats() {
    await this.readyPromise;
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

  async getHabits() {
    await this.readyPromise;
    return this.data.habits;
  }

  async toggleHabit(habitId) {
    await this.readyPromise;
    const habit = this.data.habits.find(h => h.id === habitId);
    if (habit) {
      habit.completedToday = !habit.completedToday;
      if (habit.completedToday) {
        habit.streak += 1;
      } else {
        habit.streak = Math.max(0, habit.streak - 1);
      }
      await this.saveData();
    }
  }

  async addHabit(title, category) {
    await this.readyPromise;
    this.data.habits.push({
      id: 'h' + Date.now(),
      title,
      category,
      streak: 0,
      completedToday: false
    });
    await this.saveData();
  }

  async getPeerPosts() {
    await this.readyPromise;
    return this.data.peerPosts;
  }

  async likePost(postId) {
    await this.readyPromise;
    const post = this.data.peerPosts.find(p => p.id === postId);
    if (post) {
      post.likes = (post.likes || 0) + 1;
      await this.saveData();
    }
  }

  async addPeerPost(content) {
    await this.readyPromise;
    this.data.peerPosts.unshift({
      id: 'p' + Date.now(),
      author: 'You',
      time: 'Just now',
      content,
      likes: 0,
      badge: 'Recovery Warrior'
    });
    await this.saveData();
  }

  async getJournalEntries() {
    await this.readyPromise;
    return this.data.journalEntries || [];
  }

  async addJournalEntry(entry) {
    await this.readyPromise;
    if (!this.data.journalEntries) this.data.journalEntries = [];
    this.data.journalEntries.unshift({
      id: 'j' + Date.now(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...entry
    });
    await this.saveData();
  }
}

window.storageManager = new StorageManager();
