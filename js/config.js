/**
 * OPROKASHI — Enterprise System Configuration
 * Strict Relative Paths & App Global Constants
 */

const OPROKASHI_CONFIG = Object.freeze({
  APP_NAME: "অপ্রকাশিত",
  APP_ENGLISH_NAME: "Oprokashi",
  VERSION: "2.0.0",
  DEFAULT_LANGUAGE: "bn",
  
  // Pagination Limits
  PAGINATION: {
    HOMEPAGE_BOOKS_PER_SHELF: 10,
    SEARCH_RESULTS_LIMIT: 20,
    ADMIN_STORIES_PER_PAGE: 15
  },
  
  // Firebase SDK Versions and CDN Compatibility
  FIREBASE_VERSION: "10.8.0",
  
  // Default Library State Presets
  LIBRARY_DEFAULTS: {
    THEME: "night",
    WEATHER: "clear",
    AMBIENT_SOUND: false,
    PAGE_FLIP_SOUND: true,
    AUTO_DAY_NIGHT: true
  }
});

// Freeze Config to prevent runtime tampering
window.OPROKASHI_CONFIG = OPROKASHI_CONFIG;