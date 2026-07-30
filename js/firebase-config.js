// ============================================================
// QuizRush - Firebase Configuration & Helpers
// Setup Firebase Realtime Database for multiplayer
// ============================================================

// ==========================================
// ⚠️ PASTE YOUR FIREBASE CONFIG BELOW
// ==========================================
// 1. Go to https://console.firebase.google.com
// 2. Create a project (or use existing)
// 3. Go to Project Settings > General > Your apps > Web app
// 4. Copy the firebaseConfig object and paste below

const firebaseConfig = {
  apiKey: "AIzaSyCVlcRi0Cgt5Vnf4zDvV4jm7MPvrsTsn88",
  authDomain: "quizrush-multiplayer.firebaseapp.com",
  databaseURL: "https://quizrush-multiplayer-default-rtdb.firebaseio.com",
  projectId: "quizrush-multiplayer",
  storageBucket: "quizrush-multiplayer.firebasestorage.app",
  messagingSenderId: "724623173331",
  appId: "1:724623173331:web:3b7f745231f76954c71626"
};

// ==========================================
// Firebase Initialization
// ==========================================

let firebaseApp = null;
let db = null;
let firebaseReady = false;

function initFirebase() {
  try {
    // Check if Firebase SDK is loaded
    if (typeof firebase === 'undefined') {
      console.warn('Firebase SDK not loaded. Multiplayer disabled.');
      return false;
    }

    // Check if config is set
    if (firebaseConfig.apiKey === 'YOUR_API_KEY') {
      console.warn('Firebase not configured. Set your config in firebase-config.js');
      return false;
    }

    firebaseApp = firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    firebaseReady = true;
    console.log('✅ Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('Firebase init error:', error);
    return false;
  }
}

/**
 * Check if Firebase is ready for multiplayer
 */
function isMultiplayerAvailable() {
  return firebaseReady && db !== null;
}

// ==========================================
// Database Helpers
// ==========================================

const FireDB = {
  /**
   * Write data to a path
   */
  async set(path, data) {
    if (!db) return null;
    try {
      await db.ref(path).set(data);
      return true;
    } catch (e) {
      console.error('DB set error:', e);
      return false;
    }
  },

  /**
   * Update data at a path (merge)
   */
  async update(path, data) {
    if (!db) return null;
    try {
      await db.ref(path).update(data);
      return true;
    } catch (e) {
      console.error('DB update error:', e);
      return false;
    }
  },

  /**
   * Read data once from a path
   */
  async get(path) {
    if (!db) return null;
    try {
      const snapshot = await db.ref(path).once('value');
      return snapshot.val();
    } catch (e) {
      console.error('DB get error:', e);
      return null;
    }
  },

  /**
   * Push a new entry (auto-generate key)
   */
  async push(path, data) {
    if (!db) return null;
    try {
      const ref = await db.ref(path).push(data);
      return ref.key;
    } catch (e) {
      console.error('DB push error:', e);
      return null;
    }
  },

  /**
   * Delete data at a path
   */
  async remove(path) {
    if (!db) return null;
    try {
      await db.ref(path).remove();
      return true;
    } catch (e) {
      console.error('DB remove error:', e);
      return false;
    }
  },

  /**
   * Listen for value changes at a path
   * @returns {Function} Unsubscribe function
   */
  onValue(path, callback) {
    if (!db) return () => { };
    const ref = db.ref(path);
    ref.on('value', (snapshot) => {
      callback(snapshot.val(), snapshot.key);
    });
    return () => ref.off('value');
  },

  /**
   * Listen for child added
   * @returns {Function} Unsubscribe function
   */
  onChildAdded(path, callback) {
    if (!db) return () => { };
    const ref = db.ref(path);
    ref.on('child_added', (snapshot) => {
      callback(snapshot.val(), snapshot.key);
    });
    return () => ref.off('child_added');
  },

  /**
   * Listen for child changed
   * @returns {Function} Unsubscribe function
   */
  onChildChanged(path, callback) {
    if (!db) return () => { };
    const ref = db.ref(path);
    ref.on('child_changed', (snapshot) => {
      callback(snapshot.val(), snapshot.key);
    });
    return () => ref.off('child_changed');
  },

  /**
   * Listen for child removed
   * @returns {Function} Unsubscribe function
   */
  onChildRemoved(path, callback) {
    if (!db) return () => { };
    const ref = db.ref(path);
    ref.on('child_removed', (snapshot) => {
      callback(snapshot.val(), snapshot.key);
    });
    return () => ref.off('child_removed');
  },

  /**
   * Remove all listeners from a path
   */
  offAll(path) {
    if (!db) return;
    db.ref(path).off();
  },

  /**
   * Get server timestamp
   */
  serverTimestamp() {
    return firebase.database.ServerValue.TIMESTAMP;
  }
};
