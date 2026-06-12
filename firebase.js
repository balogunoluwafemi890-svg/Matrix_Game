/* ================================================================
   firebase.js
   Firebase configuration and initialization for Firestore-backed
   leaderboard. Other modules check `firebaseReady` and `db`
   before attempting Firestore calls.
   ================================================================ */

var firebaseConfig = {
  apiKey: "AIzaSyBx5LpLZRM1UeCbpKLvDOE7RgMq3P4dE1s",
  authDomain: "matrix-checkers-game.firebaseapp.com",
  projectId: "matrix-checkers-game",
  storageBucket: "matrix-checkers-game.firebasestorage.app",
  messagingSenderId: "548236193057",
  appId: "1:548236193057:web:c6e32a4c3e4d6e3c7ab9e5"
};

var firebaseApp = null;
var db = null;
var firebaseReady = false;

/** Initialize Firebase app + Firestore, enabling offline persistence. */
function initFirebase() {
  if (firebaseReady) return;
  try {
    firebaseApp = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    // Enable offline persistence so the app works even without internet
    db.enablePersistence({ synchronizeTabs: true }).catch(function (err) {
      if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time
        console.warn('Firebase persistence: multiple tabs open');
      } else if (err.code === 'unimplemented') {
        // Browser doesn't support persistence
        console.warn('Firebase persistence: not supported by browser');
      }
    });
    firebaseReady = true;
  } catch (e) {
    console.error('Firebase init failed:', e);
    firebaseReady = false;
  }
}
