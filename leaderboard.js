/* ================================================================
   leaderboard.js
   Leaderboard system — Firebase Firestore with localStorage
   fallback/offline cache. Handles initializing entries, updating
   scores, and rendering the leaderboard table.

   Depends on: util.js (S, LEADERBOARD_KEY, escapeHTML),
   firebase.js (firebaseReady, db, firebase),
   auth.js (getCurrentUser)
   ================================================================ */

function getLeaderboardLocal() {
  try {
    var raw = localStorage.getItem(LEADERBOARD_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}

/** Save leaderboard data to localStorage (fallback). */
function saveLeaderboardLocal(data) {
  try { localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(data)); } catch (e) {}
}

/** Initialize a leaderboard entry for a new user. */
function initLeaderboardEntry(username, isGuest) {
  // Save to Firestore
  if (firebaseReady && db) {
    var docRef = db.collection('leaderboard').doc(username);
    docRef.get().then(function(doc) {
      if (!doc.exists) {
        docRef.set({
          username: username,
          score: 0,
          levelsCompleted: 0,
          isGuest: isGuest,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(function(err) {
          console.error('Firebase initLeaderboardEntry set error:', err);
        });
      }
    }).catch(function(err) {
      console.error('Firebase initLeaderboardEntry get error:', err);
    });
  }

  // Also keep localStorage as offline cache
  var lb = getLeaderboardLocal();
  for (var i = 0; i < lb.length; i++) {
    if (lb[i].username === username) return;
  }
  lb.push({ username: username, score: 0, levelsCompleted: 0, isGuest: isGuest, updatedAt: Date.now() });
  saveLeaderboardLocal(lb);
}

/** Update leaderboard entry for the current user (writes to Firestore). */
function updateLeaderboardForCurrentUser() {
  var user = getCurrentUser();
  if (!user) return;

  var levelsCompleted = 0;
  for (var key in S.completed) {
    if (S.completed[key]) levelsCompleted++;
  }

  // Update Firestore
  if (firebaseReady && db) {
    var docRef = db.collection('leaderboard').doc(user.username);
    db.runTransaction(function(transaction) {
      return transaction.get(docRef).then(function(doc) {
        var data;
        if (!doc.exists) {
          // Create new entry
          data = {
            username: user.username,
            score: S.score,
            levelsCompleted: levelsCompleted,
            isGuest: user.isGuest || false,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          };
          transaction.set(docRef, data);
        } else {
          // Only update if score or levels improved
          var existing = doc.data();
          var newScore = Math.max(existing.score || 0, S.score);
          var newLevels = Math.max(existing.levelsCompleted || 0, levelsCompleted);
          transaction.update(docRef, {
            score: newScore,
            levelsCompleted: newLevels,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
      });
    }).catch(function(err) {
      console.error('Firestore transaction failed:', err);
    });
  }

  // Also update localStorage as offline cache
  var lb = getLeaderboardLocal();
  var found = false;
  for (var i = 0; i < lb.length; i++) {
    if (lb[i].username === user.username) {
      if (S.score > lb[i].score) {
        lb[i].score = S.score;
        lb[i].levelsCompleted = levelsCompleted;
        lb[i].updatedAt = Date.now();
      } else if (levelsCompleted > lb[i].levelsCompleted) {
        lb[i].levelsCompleted = levelsCompleted;
        lb[i].updatedAt = Date.now();
      }
      found = true;
      break;
    }
  }
  if (!found) {
    lb.push({ username: user.username, score: S.score, levelsCompleted: levelsCompleted, isGuest: user.isGuest, updatedAt: Date.now() });
  }
  lb.sort(function (a, b) {
    if (b.score !== a.score) return b.score - a.score;
    if (b.levelsCompleted !== a.levelsCompleted) return b.levelsCompleted - a.levelsCompleted;
    return a.updatedAt - b.updatedAt;
  });
  if (lb.length > 50) lb = lb.slice(0, 50);
  saveLeaderboardLocal(lb);
}

/** Sort an array of leaderboard entries by score desc, then levelsCompleted desc.
 *  Used both for the localStorage fallback and to break ties within a single
 *  Firestore orderBy('score') result, since Firestore itself only orders by score. */
function sortLeaderboardEntries(lb) {
  lb.sort(function (a, b) {
    var scoreA = a.score || 0, scoreB = b.score || 0;
    if (scoreB !== scoreA) return scoreB - scoreA;
    var levelsA = a.levelsCompleted || 0, levelsB = b.levelsCompleted || 0;
    return levelsB - levelsA;
  });
  return lb;
}

/** Render the leaderboard screen (fetches from Firestore, falls back to localStorage). */
function renderLeaderboard() {
  var user = getCurrentUser();
  var tbody = document.getElementById('leaderboardBody');
  var emptyMsg = document.getElementById('lbEmpty');
  var tableWrap = document.querySelector('.leaderboard-table-wrap');

  tbody.innerHTML = '';

  // Show loading state
  emptyMsg.style.display = 'none';
  tableWrap.style.display = 'block';
  tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:24px;color:var(--muted)"><i class="fa-solid fa-spinner fa-spin" style="margin-right:8px"></i>Loading leaderboard...</td></tr>';

  // Try Firestore first.
  // NOTE: we only orderBy a single field ('score') here on purpose — a
  // second orderBy('levelsCompleted') would require a composite index to be
  // manually created in the Firebase console, and if that index is ever
  // missing the query fails silently and falls back to the local (per-device)
  // cache, making the leaderboard look empty to everyone else. Instead we
  // pull a slightly larger batch by score alone (which Firestore can always
  // do with just the automatic single-field index) and break the
  // score/levelsCompleted tie client-side in sortLeaderboardEntries().
  if (firebaseReady && db) {
    db.collection('leaderboard')
      .orderBy('score', 'desc')
      .limit(50)
      .get()
      .then(function(querySnapshot) {
        var lb = [];
        querySnapshot.forEach(function(doc) {
          lb.push(doc.data());
        });
        sortLeaderboardEntries(lb);
        var top20 = lb.slice(0, 20);
        displayLeaderboard(top20, user, tbody, emptyMsg, tableWrap);
      })
      .catch(function(err) {
        console.error('Firestore fetch failed, using local cache:', err);
        // Fall back to localStorage
        var lbLocal = getLeaderboardLocal();
        var topLocal = lbLocal.slice(0, 20);
        displayLeaderboard(topLocal, user, tbody, emptyMsg, tableWrap);
      });
  } else {
    // No Firebase — use localStorage
    var lbLocal = getLeaderboardLocal();
    var topLocal = lbLocal.slice(0, 20);
    displayLeaderboard(topLocal, user, tbody, emptyMsg, tableWrap);
  }
}

/** Display leaderboard data in the table. */
function displayLeaderboard(lb, user, tbody, emptyMsg, tableWrap) {
  tbody.innerHTML = '';

  if (lb.length === 0) {
    emptyMsg.style.display = 'block';
    tableWrap.style.display = 'none';
    return;
  }

  emptyMsg.style.display = 'none';
  tableWrap.style.display = 'block';

  var medals = ['🥇', '🥈', '🥉'];

  for (var i = 0; i < lb.length; i++) {
    var entry = lb[i];
    var tr = document.createElement('tr');

    // Highlight current user's row
    if (user && entry.username === user.username) {
      tr.classList.add('lb-current-user');
    }

    // Rank cell
    var rankTd = document.createElement('td');
    rankTd.className = 'lb-rank';
    if (i < 3) {
      rankTd.innerHTML = '<div class="lb-rank-cell"><span class="lb-medal">' + medals[i] + '</span></div>';
    } else {
      rankTd.innerHTML = '<div class="lb-rank-cell"><span class="lb-rank-number">' + (i + 1) + '</span></div>';
    }
    tr.appendChild(rankTd);

    // Player cell
    var playerTd = document.createElement('td');
    playerTd.className = 'lb-player';
    var nameHTML = '<div class="lb-player-name">';
    if (entry.isGuest) {
      nameHTML += '<i class="fa-solid fa-user-secret lb-guest-icon"></i> ';
    }
    nameHTML += escapeHTML(entry.username);
    if (user && entry.username === user.username) {
      nameHTML += ' <span class="lb-you-tag">You</span>';
    }
    nameHTML += '</div>';
    playerTd.innerHTML = nameHTML;
    tr.appendChild(playerTd);

    // Score cell
    var scoreTd = document.createElement('td');
    scoreTd.className = 'lb-score';
    scoreTd.textContent = entry.score + ' pts';
    tr.appendChild(scoreTd);

    // Levels cell
    var levelsTd = document.createElement('td');
    levelsTd.className = 'lb-levels';
    levelsTd.textContent = entry.levelsCompleted + '/7';
    tr.appendChild(levelsTd);

    tbody.appendChild(tr);
  }
}
