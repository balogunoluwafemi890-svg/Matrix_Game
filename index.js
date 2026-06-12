/* ================================================================
   index.js
   Page script for index.html (intro/landing page).
   Builds the decorative intro board and wires the Start/Leaderboard
   buttons plus keyboard shortcut.

   Depends on: util.js, firebase.js, sound.js, engine.js (startLevel),
   auth.js (getCurrentUser, updateLoginUI), questions etc not needed here.
   ================================================================ */

/** Build the small decorative checkerboard shown on the intro screen. */
function buildIntroBoard() {
  var board = document.getElementById('introBoard');
  var bgColors = ['var(--board-dark)', 'var(--board-light)'];
  for (var r = 0; r < 4; r++)
    for (var c = 0; c < 4; c++) {
      var cell = document.createElement('div');
      cell.style.cssText = 'width:40px;height:40px;background:' + bgColors[(r + c) % 2] + ';display:flex;align-items:center;justify-content:center';
      if ((r + c) % 2 === 1 && ((r < 2 && Math.random() > 0.4) || (r > 1 && Math.random() > 0.4))) {
        var piece = document.createElement('div');
        piece.className = 'piece ' + (r < 2 ? 'piece-teal' : 'piece-red');
        piece.style.width = '28px'; piece.style.height = '28px'; piece.style.fontSize = '10px';
        if (Math.random() > 0.5) piece.textContent = rand(1, 3);
        cell.appendChild(piece);
      }
      board.appendChild(cell);
    }
}

/** Start button: go straight to the saved level if logged in, else auth.html. */
function handleStart() {
  SoundSystem.init();
  initFirebase();
  var user = getCurrentUser();
  if (user) {
    loadState();
    startLevel(S.currentLevel);
  } else {
    goToPage('auth.html');
  }
}

// --- Event listeners ---
document.getElementById('startBtn').addEventListener('click', handleStart);

document.getElementById('introLeaderboardBtn').addEventListener('click', function () {
  SoundSystem.init();
  initFirebase();
  goToPage('leaderboard.html');
});

// --- Keyboard shortcut: Enter triggers Start ---
document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') handleStart();
});

// --- Startup ---
buildIntroBoard();
updateLoginUI();
