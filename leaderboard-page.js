/* ================================================================
   leaderboard-page.js
   Page script for leaderboard.html. Renders the leaderboard table
   and wires the back/play buttons.

   Depends on: util.js, firebase.js, sound.js, auth.js, leaderboard.js
   ================================================================ */

// --- Back button: return to the page the user came from, or index ---
document.getElementById('lbBackBtn').addEventListener('click', function () {
  if (window.history.length > 1 && document.referrer.indexOf(window.location.host) !== -1) {
    window.history.back();
  } else {
    goToPage('index.html');
  }
});

// --- Play Now button ---
document.getElementById('lbPlayBtn').addEventListener('click', function () {
  SoundSystem.init();
  initFirebase();
  var user = getCurrentUser();
  if (user) {
    loadState();
    startLevel(S.currentLevel);
  } else {
    goToPage('auth.html');
  }
});

// --- Startup ---
initFirebase();
updateLoginUI();
renderLeaderboard();
