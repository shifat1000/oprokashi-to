/**
 * OPROKASHI — Firebase Service Wrapper
 * Optimized for Firestore Caching, Auth Tracking & Storage
 */

class OprokashiFirebase {
  constructor() {
    this.db = null;
    this.auth = null;
    this.storage = null;
    this.initialized = false;
  }

  /**
   * Initialize Firebase with local configuration object
   * @param {Object} firebaseConfig 
   */
  init(firebaseConfig) {
    if (this.initialized) return;

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    this.db = firebase.firestore();
    this.auth = firebase.auth();
    this.storage = firebase.storage();

    // Enable offline persistence for Firestore
    this.db.enablePersistence({ synchronizeTabs: true })
      .catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('Firestore persistence failed: Multiple tabs open');
        } else if (err.code === 'unimplemented') {
          console.warn('Firestore persistence unsupported in browser');
        }
      });

    this.initialized = true;
    console.log('Oprokashi Firebase Services Initialized Successfully.');
  }

  // Getters for Service References
  get DB() {
    if (!this.initialized) throw new Error("Firebase not initialized yet!");
    return this.db;
  }

  get Auth() {
    if (!this.initialized) throw new Error("Firebase not initialized yet!");
    return this.auth;
  }

  get Storage() {
    if (!this.initialized) throw new Error("Firebase not initialized yet!");
    return this.storage;
  }
}

// Global Singleton Instance
window.OprokashiDB = new OprokashiFirebase();