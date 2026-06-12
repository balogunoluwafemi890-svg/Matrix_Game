/* ================================================================
   engine.js
   Shared game engine: level navigation, board rendering helpers,
   hint system, and option-button helpers used by all 7 levels.

   Depends on: util.js (S, LEVELS, rand, etc.), sound.js (SoundSystem)
   Used by: questions.js (initL1-7, renderL1-7)
   ================================================================ */

/* ----------------------------------------------------------------
   NAVIGATION
   ---------------------------------------------------------------- */

function updateHeader() {
  document.getElementById('levelLabel').textContent = 'Level ' + (S.currentLevel + 1) + ' of ' + LEVELS.length;
  document.getElementById('scoreDisplay').textContent = S.score + ' pts';
  var dotsContainer = document.getElementById('progressDots');
  dotsContainer.innerHTML = '';
  for (var i = 0; i < LEVELS.length; i++) {
    var dot = document.createElement('div');
    dot.className = 'progress-dot';
    if (i === S.currentLevel) dot.classList.add('active');
    else if (S.completed[i]) dot.classList.add('done');
    dotsContainer.appendChild(dot);
  }
  saveState();
}

function completeLevel() {
  if (!S.completed[S.currentLevel]) {
    S.completed[S.currentLevel] = true;
    S.score += 50;
    celebrate();
    SoundSystem.playCelebration();
    showToast('Level Complete! +50 pts', 'success');
  }
  updateHeader();
  document.getElementById('nextBtn').disabled = S.currentLevel >= LEVELS.length - 1;
}

/** Navigate to a level on level.html (cross-page). */
function startLevel(n) {
  if (n < 0 || n >= LEVELS.length) return;
  S.currentLevel = n;
  saveState();
  goToPage('level.html?level=' + (n + 1));
}

/** Render a level in-page (used by level.html for next/prev/reset). */
function goToLevel(n) {
  if (n < 0 || n >= LEVELS.length) return;
  S.currentLevel = n;
  S.levelData = {};
  S.wrongAttempts = 0; // Reset penalty counter for new level
  SoundSystem.init();
  SoundSystem.startBgMusic();
  updateHeader();
  hideHint();
  initLevel(n);
  renderLevel(n);
  document.getElementById('prevBtn').disabled = n === 0;
  document.getElementById('nextBtn').disabled = !S.completed[n];
  updateSoundBtnIcon();
  // Keep the URL in sync with the current level
  var url = new URL(window.location);
  url.searchParams.set('level', n + 1);
  window.history.replaceState({}, '', url);
}

function initLevel(n)  { [initL1,initL2,initL3,initL4,initL5,initL6,initL7][n](); }
function renderLevel(n) { [renderL1,renderL2,renderL3,renderL4,renderL5,renderL6,renderL7][n](); }


/* ----------------------------------------------------------------
   BOARD HELPERS
   ---------------------------------------------------------------- */

/** Create a checkerboard grid of divs. Returns the grid element. */
function makeBoard(rows, cols, cellSz, container) {
  var grid = document.createElement('div');
  grid.className = 'board-grid';
  grid.style.gridTemplateColumns = 'repeat(' + cols + ',' + cellSz + 'px)';
  grid.style.gridTemplateRows = 'repeat(' + rows + ',' + cellSz + 'px)';
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      var cell = document.createElement('div');
      cell.className = 'cell ' + ((r + c) % 2 === 0 ? 'cell-light' : 'cell-dark');
      cell.style.width = cellSz + 'px';
      cell.style.height = cellSz + 'px';
      cell.style.fontSize = (cellSz * 0.3) + 'px';
      cell.setAttribute('data-r', r);
      cell.setAttribute('data-c', c);
      grid.appendChild(cell);
    }
  }
  container.appendChild(grid);
  return grid;
}

/** Get a cell element from a board by its row and column. */
function getCell(board, r, c) {
  return board.querySelector('[data-r="' + r + '"][data-c="' + c + '"]');
}

/** Fill every cell in a board with the number from a matrix. */
function fillBoardNumbers(board, matrix, rows, cols) {
  for (var r = 0; r < rows; r++)
    for (var c = 0; c < cols; c++)
      getCell(board, r, c).innerHTML = '<span style="font-weight:800;color:var(--text)">' + matrix[r][c] + '</span>';
}

/** Remove .cell-highlight from all highlighted cells in a board. */
function clearHighlights(board) {
  var cells = board.querySelectorAll('.cell-highlight');
  for (var i = 0; i < cells.length; i++) cells[i].classList.remove('cell-highlight');
}

/** Handle a wrong answer — applies penalty after 3 wrong attempts in a level.
 *  Each wrong answer from the 3rd onward deducts 5 points. */
function handleWrongAnswer() {
  S.wrongAttempts++;
  if (S.wrongAttempts >= 3) {
    S.score = Math.max(0, S.score - 5);
    updateHeader();
    // Show floating "-5" text centered in the board area
    var area = document.getElementById('boardArea');
    var floater = document.createElement('div');
    floater.className = 'float-text';
    floater.textContent = '-5';
    floater.style.color = 'var(--accent2)';
    floater.style.left = '50%';
    floater.style.top = '40%';
    floater.style.transform = 'translateX(-50%)';
    floater.style.fontSize = '24px';
    floater.style.zIndex = '20';
    area.appendChild(floater);
    setTimeout(function () { if (floater.parentNode) floater.parentNode.removeChild(floater); }, 1000);
    showToast('Penalty: -5 pts (' + S.wrongAttempts + ' wrong in this level)', 'error');
  }
}


/* ----------------------------------------------------------------
   HINT SYSTEM
   ---------------------------------------------------------------- */

/** Set the hint text. Pass null to hide the hint button entirely. */
function setHint(text) {
  var btn = document.getElementById('hintBtn');
  var hintEl = document.getElementById('hintText');
  if (!text) {
    btn.style.display = 'none';
    hintEl.style.display = 'none';
    hintEl.textContent = '';
    btn.classList.remove('hint-active');
    return;
  }
  hintEl.textContent = text;
  hintEl.style.display = 'none';
  btn.style.display = 'inline-flex';
  btn.classList.remove('hint-active');
}

function hideHint() { setHint(null); }

var _hintBtnEl = document.getElementById('hintBtn');
if (_hintBtnEl) {
  _hintBtnEl.addEventListener('click', function () {
    var hintEl = document.getElementById('hintText');
    var isVisible = hintEl.style.display !== 'none';
    hintEl.style.display = isVisible ? 'none' : 'block';
    this.classList.toggle('hint-active', !isVisible);
  });
}


/* ----------------------------------------------------------------
   SHARED OPTION BUTTON HELPERS
   ---------------------------------------------------------------- */

/** Render 4 option buttons into a container and wire their click handlers. */
function renderOptions(container, options, onPick) {
  container.innerHTML = '';
  for (var i = 0; i < options.length; i++) {
    var btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = options[i];
    (function (val, b) { b.addEventListener('click', function () { SoundSystem.playTap(); onPick(val, b); }); })(options[i], btn);
    container.appendChild(btn);
  }
}

/** Disable all option buttons (after a correct answer). */
function disableOptions(container) {
  var btns = container.querySelectorAll('.option-btn');
  for (var i = 0; i < btns.length; i++) btns[i].style.pointerEvents = 'none';
}

/** Re-enable option buttons and remove wrong styling (after a wrong answer). */
function enableOptions(container) {
  var btns = container.querySelectorAll('.option-btn');
  for (var i = 0; i < btns.length; i++) {
    btns[i].style.pointerEvents = 'auto';
    btns[i].classList.remove('wrong');
  }
}


