/* ================================================================
   auth-page.js
   Page script for auth.html. Wires up signup/login form toggles,
   form submissions, guest access, and the back button.

   Depends on: util.js, firebase.js, sound.js, auth.js
   ================================================================ */

// --- Toggle between signup and login forms ---
document.getElementById('showLogin').addEventListener('click', function (e) {
  e.preventDefault();
  showAuthLogin();
});

document.getElementById('showSignup').addEventListener('click', function (e) {
  e.preventDefault();
  showAuthSignup();
});

// --- Form submissions ---
document.getElementById('signupBtn').addEventListener('click', function () { handleSignup(); });
document.getElementById('loginBtn').addEventListener('click', function () { handleLogin(); });
document.getElementById('guestBtn').addEventListener('click', function () {
  SoundSystem.init();
  initFirebase();
  handleGuest();
});

document.getElementById('authBackBtn').addEventListener('click', function () {
  goToPage('index.html');
});

// --- Enter key navigation within signup form ---
document.getElementById('signupUsername').addEventListener('keydown', function (e) { if (e.key === 'Enter') document.getElementById('signupPassword').focus(); });
document.getElementById('signupPassword').addEventListener('keydown', function (e) { if (e.key === 'Enter') document.getElementById('signupConfirm').focus(); });
document.getElementById('signupConfirm').addEventListener('keydown', function (e) { if (e.key === 'Enter') handleSignup(); });

// --- Enter key navigation within login form ---
document.getElementById('loginUsername').addEventListener('keydown', function (e) { if (e.key === 'Enter') document.getElementById('loginPassword').focus(); });
document.getElementById('loginPassword').addEventListener('keydown', function (e) { if (e.key === 'Enter') handleLogin(); });

// --- Startup: show signup or login form based on ?mode= query param ---
(function () {
  var params = new URLSearchParams(window.location.search);
  if (params.get('mode') === 'login') {
    showAuthLogin();
  } else {
    showAuthSignup();
  }
})();
