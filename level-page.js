/* ================================================================
   level-page.js
   Page script for level.html (the main game screen). Reads the
   ?level= query param, wires navigation/footer/header buttons,
   keyboard shortcuts, and the user dropdown menu.

   Depends on: util.js, firebase.js, sound.js, engine.js, questions.js,
   auth.js, leaderboard.js
   ================================================================ */

// --- Guard: must be logged in (or guest) to access the game ---
function requireUser() {
  var user = getCurrentUser();
  if (!user) {
    goToPage('auth.html');
    return null;
  }
  return user;
}

// --- Header buttons ---
document.getElementById('gameLeaderboardBtn').addEventListener('click', function () {
  initFirebase();
  updateLeaderboardForCurrentUser();
  goToPage('leaderboard.html');
});

// --- User menu dropdown ---
document.getElementById('userMenuBtn').addEventListener('click', function (e) {
  e.stopPropagation();
  var dropdown = document.getElementById('userDropdown');
  dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('logoutBtn').addEventListener('click', function () { handleLogout(); });

// Close dropdown when clicking outside
document.addEventListener('click', function (e) {
  var dropdown = document.getElementById('userDropdown');
  var menu = document.getElementById('headerUserMenu');
  if (dropdown && menu && !menu.contains(e.target)) {
    dropdown.style.display = 'none';
  }
});

// --- Footer navigation buttons ---
document.getElementById('prevBtn').addEventListener('click', function () { SoundSystem.playClick(); goToLevel(S.currentLevel - 1); });
document.getElementById('nextBtn').addEventListener('click', function () { SoundSystem.playClick(); goToLevel(S.currentLevel + 1); });
document.getElementById('resetBtn').addEventListener('click', function () { SoundSystem.playClick(); goToLevel(S.currentLevel); });
document.getElementById('clearProgressBtn').addEventListener('click', function () {
  clearSave();
  showToast('All progress cleared', 'info');
  goToPage('index.html');
});

// --- Keyboard shortcuts ---
document.addEventListener('keydown', function (e) {
  if (e.key === 'ArrowRight' && S.completed[S.currentLevel]) goToLevel(S.currentLevel + 1);
  if (e.key === 'ArrowLeft') goToLevel(S.currentLevel - 1);
  if (e.key === 'r' || e.key === 'R') goToLevel(S.currentLevel);
});

// --- Hint button sound (updateSoundBtnIcon lives in sound.js) ---
document.getElementById('hintBtn').addEventListener('click', function () {
  SoundSystem.playClick();
});


/* ----------------------------------------------------------------
   STARTUP
   ---------------------------------------------------------------- */

(function () {
  var user = requireUser();
  if (!user) return;

  initFirebase();
  updateLoginUI();

  // Load saved progress
  loadState();

  // Determine which level to show: ?level= query param (1-indexed),
  // falling back to the saved current level.
  var params = new URLSearchParams(window.location.search);
  var levelParam = parseInt(params.get('level'), 10);
  var levelIdx = (!isNaN(levelParam) && levelParam >= 1 && levelParam <= LEVELS.length)
    ? levelParam - 1
    : S.currentLevel;

  goToLevel(levelIdx);
})();
