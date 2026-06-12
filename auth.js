/* ================================================================
   auth.js
   User account management: signup, login, guest access, logout,
   session handling, and auth screen UI helpers.

   Depends on: util.js (S, showToast, showScreen, SAVE_KEY, etc.),
   leaderboard.js (initLeaderboardEntry, updateLeaderboardForCurrentUser),
   sound.js (SoundSystem)
   ================================================================ */

/* ================================================================
   AUTH SYSTEM
   ================================================================ */

/** Get all registered users from localStorage. */
function getUsers() {
  try {
    var raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) { return {}; }
}

/** Save users object to localStorage. */
function saveUsers(users) {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch (e) {}
}

/** Get current logged-in user from session. */
function getCurrentUser() {
  try {
    var raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    var session = JSON.parse(raw);
    return session || null;
  } catch (e) { return null; }
}

/** Set current logged-in user session. */
function setCurrentUser(username, isGuest) {
  var session = { username: username, isGuest: !!isGuest };
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch (e) {}
}

/** Clear current session (logout). */
function clearSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
}

/** Simple hash for password (not cryptographically secure, but better than plaintext). */
function simpleHash(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    var char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'h' + Math.abs(hash).toString(36);
}

/** Handle signup. */
function handleSignup() {
  var username = document.getElementById('signupUsername').value.trim();
  var password = document.getElementById('signupPassword').value;
  var confirm = document.getElementById('signupConfirm').value;

  if (!username || username.length < 3) {
    showToast('Username must be at least 3 characters', 'error');
    return;
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    showToast('Username can only contain letters, numbers, and underscores', 'error');
    return;
  }
  if (!password || password.length < 4) {
    showToast('Password must be at least 4 characters', 'error');
    return;
  }
  if (password !== confirm) {
    showToast('Passwords do not match', 'error');
    return;
  }

  var users = getUsers();
  if (users[username.toLowerCase()]) {
    showToast('Username already taken', 'error');
    return;
  }

  users[username.toLowerCase()] = {
    username: username,
    passwordHash: simpleHash(password),
    createdAt: Date.now()
  };
  saveUsers(users);
  setCurrentUser(username, false);

  // Initialize leaderboard entry
  initLeaderboardEntry(username, false);

  showToast('Account created! Welcome, ' + username, 'success');
  updateLoginUI();
  startLevel(0);
}

/** Handle login. */
function handleLogin() {
  var username = document.getElementById('loginUsername').value.trim();
  var password = document.getElementById('loginPassword').value;

  if (!username || !password) {
    showToast('Please enter username and password', 'error');
    return;
  }

  var users = getUsers();
  var userData = users[username.toLowerCase()];
  if (!userData || userData.passwordHash !== simpleHash(password)) {
    showToast('Invalid username or password', 'error');
    return;
  }

  setCurrentUser(userData.username, false);
  showToast('Welcome back, ' + userData.username + '!', 'success');
  updateLoginUI();

  // Load user's saved progress
  loadState();
  startLevel(S.currentLevel);
}

/** Handle guest access. */
function handleGuest() {
  var guestName = 'Guest_' + Math.floor(Math.random() * 10000);
  setCurrentUser(guestName, true);
  initLeaderboardEntry(guestName, true);
  showToast('Playing as guest. Scores won\'t be saved permanently.', 'info');
  updateLoginUI();
  startLevel(0);
}

/** Log out current user. */
function handleLogout() {
  updateLeaderboardForCurrentUser();
  clearSession();
  clearSave();
  S.currentLevel = 0;
  S.score = 0;
  S.completed = {};
  S.levelData = {};
  S.wrongAttempts = 0;
  updateLoginUI();
  showToast('Logged out successfully', 'info');
  var dropdown = document.getElementById('userDropdown');
  if (dropdown) dropdown.style.display = 'none';
  goToPage('index.html');
}

/** Update UI elements based on login state. Safe to call on any page —
 *  only updates elements that exist on the current page. */
function updateLoginUI() {
  var user = getCurrentUser();
  var loggedInBadge = document.getElementById('loggedInAs');
  var loggedInName = document.getElementById('loggedInName');
  var dropdownUsername = document.getElementById('dropdownUsername');

  if (user) {
    if (loggedInBadge) loggedInBadge.style.display = 'inline-flex';
    if (loggedInName) loggedInName.textContent = user.isGuest ? 'Guest' : user.username;
    if (dropdownUsername) dropdownUsername.textContent = user.isGuest ? 'Guest' : user.username;
  } else {
    if (loggedInBadge) loggedInBadge.style.display = 'none';
    if (dropdownUsername) dropdownUsername.textContent = 'Guest';
  }
}

/** Show signup form on auth.html (in-page toggle). */
function showAuthSignup() {
  document.getElementById('signupForm').style.display = 'block';
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('authTitle').textContent = 'Sign Up';
  document.getElementById('authSubtitle').textContent = 'Create an account to track your progress and compete on the leaderboard';
  document.getElementById('signupUsername').focus();
}

/** Show login form on auth.html (in-page toggle). */
function showAuthLogin() {
  document.getElementById('signupForm').style.display = 'none';
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('authTitle').textContent = 'Log In';
  document.getElementById('authSubtitle').textContent = 'Welcome back! Log in to continue your progress';
  document.getElementById('loginUsername').focus();
}

