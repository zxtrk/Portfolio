/**
 * ════════════════════════════════════════════════════════════
 *  PORTFOLIO CONFIG
 * ════════════════════════════════════════════════════════════
 */

window.firebaseConfig = {
  apiKey: "AIzaSyCr4UENGhylVqE6FDJ0XB9EkqO-HI9kIzU",
  authDomain: "aj-portfolio-deb89.firebaseapp.com",
  databaseURL: "https://aj-portfolio-deb89-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "aj-portfolio-deb89",
  storageBucket: "aj-portfolio-deb89.firebasestorage.app",
  messagingSenderId: "677250630995",
  appId: "1:677250630995:web:6c0fb8affd471b7b168da6"
};

window.FIREBASE_ENABLED = true;

// Default lock states — overridden live by admin panel via Firebase
window.SiteConfig = {
  projectsLocked: false,
  aboutLocked: false,
  contactLocked: false,
};