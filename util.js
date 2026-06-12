/* ================================================================
   util.js
   General utility functions, global state, constants, and
   localStorage save/load helpers.
   ================================================================ */

/* ----------------------------------------------------------------
   UTILITY FUNCTIONS
   ---------------------------------------------------------------- */

/** Return a random integer between min and max (inclusive). */
function rand(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** Shuffle an array in-place and return it. */
function shuffle(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = rand(0, i);
    var temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

/** Generate 4 unique multiple-choice options around a correct value. */
function generateOptions(correct, range) {
  if (range === undefined) range = 5;
  var unique = {};
  unique[correct] = true;
  var tries = 0;
  while (Object.keys(unique).length < 4 && tries < 60) {
    tries++;
    var candidate = correct + rand(-range, range);
    if (candidate !== correct && candidate >= 0) unique[candidate] = true;
  }
  var filler = 1;
  while (Object.keys(unique).length < 4) {
    if (!unique[correct + filler * 3]) unique[correct + filler * 3] = true;
    filler++;
  }
  return shuffle(Object.keys(unique).map(Number));
}

/** Like generateOptions but allows negative values (for determinant). */
function generateSignedOptions(correct, range) {
  var unique = {};
  unique[correct] = true;
  var tries = 0;
  while (Object.keys(unique).length < 4 && tries < 80) {
    tries++;
    var c = correct + rand(-range, range);
    if (c !== correct) unique[c] = true;
  }
  var offset = 1;
  while (Object.keys(unique).length < 4) {
    if (!unique[correct + offset]) unique[correct + offset] = true;
    if (Object.keys(unique).length < 4 && !unique[correct - offset]) unique[correct - offset] = true;
    offset++;
  }
  return shuffle(Object.keys(unique).map(Number));
}

/** Generate a rows×cols matrix with random integers between min and max. */
function genMat(rows, cols, min, max) {
  if (min === undefined) min = 1;
  if (max === undefined) max = 5;
  var matrix = [];
  for (var r = 0; r < rows; r++) {
    var row = [];
    for (var c = 0; c < cols; c++) row.push(rand(min, max));
    matrix.push(row);
  }
  return matrix;
}

/** Navigate to another page. */
function goToPage(url) {
  window.location.href = url;
}

/** Show a toast notification that auto-dismisses after ~2 seconds. */
function showToast(message, type) {
  if (!type) type = 'info';
  var container = document.getElementById('toasts');
  if (!container) return;
  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(function () { toast.classList.add('show'); });
  setTimeout(function () {
    toast.classList.remove('show');
    setTimeout(function () { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
  }, 2200);
}

/** Burst of confetti particles for level completion. */
function celebrate() {
  var colors = ['#f59e0b', '#22c55e', '#ef4444', '#14b8a6', '#f97316', '#a855f7'];
  var container = document.getElementById('confetti');
  if (!container) return;
  for (var i = 0; i < 40; i++) {
    var p = document.createElement('div');
    p.className = 'confetti';
    p.style.left = Math.random() * 100 + '%';
    p.style.backgroundColor = colors[rand(0, colors.length - 1)];
    p.style.setProperty('--drift', (Math.random() * 200 - 100) + 'px');
    p.style.animationDelay = Math.random() * 0.6 + 's';
    p.style.animationDuration = (1.2 + Math.random() * 0.8) + 's';
    p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    p.style.width = rand(6, 12) + 'px';
    p.style.height = rand(6, 12) + 'px';
    container.appendChild(p);
    (function (el) { setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 2500); })(p);
  }
}

/** Show a floating "+N" label above an element, then remove it. */
function showFloatText(targetEl, text, color) {
  var area = document.getElementById('boardArea');
  var rect = targetEl.getBoundingClientRect();
  var areaRect = area.getBoundingClientRect();
  var floater = document.createElement('div');
  floater.className = 'float-text';
  floater.textContent = text;
  floater.style.color = color;
  floater.style.left = (rect.left - areaRect.left + rect.width / 2 - 20) + 'px';
  floater.style.top = (rect.top - areaRect.top - 10) + 'px';
  area.appendChild(floater);
  setTimeout(function () { if (floater.parentNode) floater.parentNode.removeChild(floater); }, 1000);
}

/** Escape HTML special characters to prevent XSS. */
function escapeHTML(str) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}


/* ----------------------------------------------------------------
   STORAGE KEYS
   ---------------------------------------------------------------- */

var SAVE_KEY = 'matrix_checkers_save';
var SAVE_VERSION = 2;
var USERS_KEY = 'matrix_checkers_users';
var LEADERBOARD_KEY = 'matrix_checkers_leaderboard';
var SESSION_KEY = 'matrix_checkers_session';


/* ----------------------------------------------------------------
   STATE & CONSTANTS
   ---------------------------------------------------------------- */

var S = { currentLevel: 0, score: 0, completed: {}, levelData: {}, wrongAttempts: 0 };

var LEVELS = [
  { title: 'Grid Coordinates',      icon: 'fa-crosshairs' },
  { title: 'Matrix Dimensions',     icon: 'fa-ruler-combined' },
  { title: 'Matrix Addition',       icon: 'fa-plus' },
  { title: 'Scalar Multiplication', icon: 'fa-xmark' },
  { title: 'Matrix Multiplication', icon: 'fa-layer-group' },
  { title: 'Determinant',           icon: 'fa-divide' },
  { title: 'Checker Battle',        icon: 'fa-chess' }
];

var isMobile = window.innerWidth < 768;
var ORDINALS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th'];


/* ----------------------------------------------------------------
   LOCAL STORAGE — PROGRESS SAVE/LOAD
   ---------------------------------------------------------------- */

/** Persist current progress to localStorage and sync leaderboard. */
function saveState() {
  var data = { currentLevel: S.currentLevel, score: S.score, completed: S.completed, wrongAttempts: S.wrongAttempts, version: SAVE_VERSION };
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch (e) { /* storage full or disabled */ }
  // Also update leaderboard for current user
  if (typeof updateLeaderboardForCurrentUser === 'function') updateLeaderboardForCurrentUser();
}

/** Load saved progress. Returns true if a valid save was found. */
function loadState() {
  try {
    var raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    var data = JSON.parse(raw);
    if (!data || data.version !== SAVE_VERSION) return false;
    S.currentLevel = data.currentLevel || 0;
    S.score = data.score || 0;
    S.completed = data.completed || {};
    S.wrongAttempts = data.wrongAttempts || 0;
    return true;
  } catch (e) { return false; }
}

/** Erase all saved progress and reset state. */
function clearSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
  S.currentLevel = 0;
  S.score = 0;
  S.completed = {};
  S.wrongAttempts = 0;
}
