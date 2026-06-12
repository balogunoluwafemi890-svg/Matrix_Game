/* ================================================================
   questions.js
   All 7 level definitions: init + render functions for each
   level's questions, board setup, and interaction logic.

   Depends on: util.js, engine.js (makeBoard, getCell, renderOptions,
   setHint, handleWrongAnswer, completeLevel, etc.), sound.js
   ================================================================ */

/* ================================================================
   LEVEL 1: GRID COORDINATES
   ================================================================ */

function initL1() {
  var d = S.levelData;
  d.rows = 4; d.cols = 4; d.cellSz = isMobile ? 56 : 68;
  d.questions = []; d.qIdx = 0; d.correct = 0;
  var positions = [];
  for (var r = 0; r < 4; r++)
    for (var c = 0; c < 4; c++)
      if ((r + c) % 2 === 1) positions.push([r, c]);
  shuffle(positions);
  d.pieces = positions.slice(0, 8);
  var used = {};
  for (var i = 0; i < 5; i++) {
    var p;
    do { p = d.pieces[rand(0, d.pieces.length - 1)]; } while (used[p[0] + ',' + p[1]]);
    used[p[0] + ',' + p[1]] = true;
    d.questions.push(p);
  }
}

function renderL1() {
  var d = S.levelData;
  document.getElementById('levelBadge').textContent = '1';
  document.getElementById('levelTitle').textContent = LEVELS[0].title;
  document.getElementById('levelDesc').textContent =
    'A matrix is a grid of numbers in rows and columns. Each element lives at a unique position (row, column). Rows count top-to-bottom starting at 0. Columns count left-to-right starting at 0.';
  document.getElementById('learnBox').style.display = 'block';
  document.getElementById('learnContent').innerHTML =
    '<div style="color:var(--text);font-weight:700;margin-bottom:4px">Notation: A[row][col]</div>Row 0 is the <b style="color:var(--text)">top</b> row.<br>Column 0 is the <b style="color:var(--text)">left</b> column.<br><br>Example: The top-left cell is <b style="color:var(--accent)">(0, 0)</b>.';
  updateTask1(); updateStats1();
  var area = document.getElementById('boardArea');
  area.innerHTML = '';
  var wrap = document.createElement('div');
  wrap.style.position = 'relative'; wrap.style.display = 'inline-block';
  d.board = makeBoard(d.rows, d.cols, d.cellSz, wrap);
  for (var r = 0; r < d.rows; r++) {
    var lbl = document.createElement('div');
    lbl.style.cssText = 'position:absolute;left:-22px;top:' + (r * d.cellSz + d.cellSz / 2 - 8) + 'px;font-size:12px;font-weight:700;color:var(--accent)';
    lbl.textContent = r; wrap.appendChild(lbl);
  }
  for (var c = 0; c < d.cols; c++) {
    var lbl = document.createElement('div');
    lbl.style.cssText = 'position:absolute;top:-20px;left:' + (c * d.cellSz + d.cellSz / 2 - 6) + 'px;font-size:12px;font-weight:700;color:var(--accent)';
    lbl.textContent = c; wrap.appendChild(lbl);
  }
  for (var i = 0; i < d.pieces.length; i++) {
    var p = d.pieces[i];
    getCell(d.board, p[0], p[1]).innerHTML = '<div class="piece piece-red"></div>';
  }
  area.appendChild(wrap);
  var cells = d.board.querySelectorAll('.cell');
  for (var i = 0; i < cells.length; i++) {
    (function (cell) {
      cell.classList.add('cell-clickable');
      cell.addEventListener('click', function () {
        handleL1Click(parseInt(cell.getAttribute('data-r')), parseInt(cell.getAttribute('data-c')), cell);
      });
    })(cells[i]);
  }
}

function updateTask1() {
  var d = S.levelData;
  if (d.qIdx >= d.questions.length) {
    document.getElementById('taskText').innerHTML = '<span style="color:var(--success);font-weight:700">All correct! Well done!</span>';
    setHint(null); return;
  }
  var p = d.questions[d.qIdx];
  document.getElementById('taskText').innerHTML = 'Find the piece at <b style="color:var(--accent);font-size:18px">(' + p[0] + ', ' + p[1] + ')</b>';
  setHint('Row ' + p[0] + ' is the ' + ORDINALS[p[0]] + ' row from the top. Column ' + p[1] + ' is the ' + ORDINALS[p[1]] + ' column from the left. Look where they intersect on a dark square.');
}

function updateStats1() { document.getElementById('statsText').textContent = 'Progress: ' + S.levelData.correct + '/' + S.levelData.questions.length; }

function handleL1Click(r, c, cell) {
  var d = S.levelData;
  if (d.qIdx >= d.questions.length) return;
  var target = d.questions[d.qIdx];
  SoundSystem.playTap();
  if (r === target[0] && c === target[1]) {
    cell.classList.add('cell-correct');
    cell.querySelector('.piece').style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
    showFloatText(cell, '+10', 'var(--success)');
    SoundSystem.playCorrect();
    S.score += 10; d.correct++; d.qIdx++;
    updateHeader(); updateTask1(); updateStats1();
    if (d.qIdx >= d.questions.length) setTimeout(completeLevel, 600);
  } else {
    cell.classList.add('cell-wrong');
    SoundSystem.playWrong();
    handleWrongAnswer();
    setTimeout(function () { cell.classList.remove('cell-wrong'); }, 400);
    showToast('Not quite \u2014 check the row and column numbers', 'error');
  }
}


/* ================================================================
   LEVEL 2: MATRIX DIMENSIONS
   ================================================================ */

function initL2() {
  var d = S.levelData;
  d.matrices = [{ rows: 2, cols: 4, label: 'A' }, { rows: 3, cols: 3, label: 'B' }, { rows: 4, cols: 2, label: 'C' }];
  d.mIdx = 0; d.correct = 0; d.cellSz = isMobile ? 52 : 64;
}

function renderL2() {
  var d = S.levelData;
  document.getElementById('levelBadge').textContent = '2';
  document.getElementById('levelTitle').textContent = LEVELS[1].title;
  document.getElementById('levelDesc').textContent = 'Every matrix has a dimension written as "rows \u00d7 columns". A 2\u00d74 matrix has 2 rows and 4 columns.';
  document.getElementById('learnBox').style.display = 'block';
  document.getElementById('learnContent').innerHTML =
    '<b style="color:var(--text)">m \u00d7 n</b> means <b style="color:var(--text)">m</b> rows and <b style="color:var(--text)">n</b> columns.<br><br>Count the rows (horizontal) first, then columns (vertical).<br><br>A square matrix has equal rows and columns.';
  updateTask2(); updateStats2();
  var area = document.getElementById('boardArea'); area.innerHTML = '';
  if (d.mIdx >= d.matrices.length) return;
  var m = d.matrices[d.mIdx];
  var wrap = document.createElement('div'); wrap.style.textAlign = 'center';
  var label = document.createElement('div');
  label.style.cssText = 'font-size:20px;font-weight:800;color:var(--accent);margin-bottom:12px';
  label.textContent = 'Matrix ' + m.label; wrap.appendChild(label);
  d.board = makeBoard(m.rows, m.cols, d.cellSz, wrap);
  for (var r = 0; r < m.rows; r++)
    for (var c = 0; c < m.cols; c++)
      getCell(d.board, r, c).innerHTML = '<div class="piece piece-teal piece-number">' + rand(1, 9) + '</div>';
  var inp = document.createElement('div');
  inp.style.cssText = 'margin-top:20px;display:flex;align-items:center;gap:12px;justify-content:center;flex-wrap:wrap';
  inp.innerHTML = '<span style="color:var(--muted);font-weight:600">Dimensions:</span><input type="number" min="1" max="6" class="dim-input" id="dimRows" placeholder="?"><span style="color:var(--accent);font-weight:800;font-size:20px">\u00d7</span><input type="number" min="1" max="6" class="dim-input" id="dimCols" placeholder="?"><button id="dimSubmit" class="btn-primary">Check</button>';
  wrap.appendChild(inp); area.appendChild(wrap);
  document.getElementById('dimSubmit').addEventListener('click', function () { handleL2Submit(); });
  document.getElementById('dimRows').addEventListener('keydown', function (e) { if (e.key === 'Enter') handleL2Submit(); });
  document.getElementById('dimCols').addEventListener('keydown', function (e) { if (e.key === 'Enter') handleL2Submit(); });
  document.getElementById('dimRows').focus();
}

function updateTask2() {
  var d = S.levelData;
  if (d.mIdx >= d.matrices.length) {
    document.getElementById('taskText').innerHTML = '<span style="color:var(--success);font-weight:700">All correct!</span>';
    setHint(null); return;
  }
  document.getElementById('taskText').innerHTML = 'How many rows and columns does <b style="color:var(--accent)">Matrix ' + d.matrices[d.mIdx].label + '</b> have?';
  setHint('Count the <b>horizontal</b> lines of pieces \u2014 that\'s the number of rows. Then count the <b>vertical</b> lines \u2014 that\'s the number of columns. Enter them as: rows \u00d7 columns.');
}

function updateStats2() { document.getElementById('statsText').textContent = 'Progress: ' + S.levelData.correct + '/' + S.levelData.matrices.length; }

function handleL2Submit() {
  var d = S.levelData;
  if (d.mIdx >= d.matrices.length) return;
  var m = d.matrices[d.mIdx];
  var rv = parseInt(document.getElementById('dimRows').value);
  var cv = parseInt(document.getElementById('dimCols').value);
  if (isNaN(rv) || isNaN(cv)) { showToast('Enter both values', 'error'); return; }
  if (rv === m.rows && cv === m.cols) {
    SoundSystem.playCorrect();
    S.score += 15; d.correct++; d.mIdx++;
    updateHeader(); updateStats2(); updateTask2();
    showToast('Correct! +15 pts', 'success');
    if (d.mIdx >= d.matrices.length) setTimeout(completeLevel, 600);
    else setTimeout(renderL2, 500);
  } else {
    SoundSystem.playWrong();
    handleWrongAnswer();
    showToast('Wrong \u2014 count again carefully', 'error');
    document.getElementById('dimRows').value = '';
    document.getElementById('dimCols').value = '';
    document.getElementById('dimRows').focus();
  }
}


/* ================================================================
   LEVEL 3: MATRIX ADDITION
   ================================================================ */

function initL3() {
  var d = S.levelData;
  d.cellSz = isMobile ? 44 : 56;
  d.A = genMat(3, 3, 1, 5); d.B = genMat(3, 3, 1, 5);
  d.result = [[null,null,null],[null,null,null],[null,null,null]];
  d.filled = 0; d.total = 9; d.selR = -1; d.selC = -1;
}

function renderL3() {
  var d = S.levelData;
  document.getElementById('levelBadge').textContent = '3';
  document.getElementById('levelTitle').textContent = LEVELS[2].title;
  document.getElementById('levelDesc').textContent = 'Add two matrices by adding their corresponding elements. The result matrix has the same dimensions.';
  document.getElementById('learnBox').style.display = 'block';
  document.getElementById('learnContent').innerHTML =
    '<div style="color:var(--text);font-weight:700;margin-bottom:4px">Element-wise addition:</div><code style="color:var(--accent)">C[i][j] = A[i][j] + B[i][j]</code><br><br>Just add the numbers in the same position!';
  setHint(null); updateTask3(); updateStats3();
  var area = document.getElementById('boardArea'); area.innerHTML = '';
  var topRow = document.createElement('div');
  topRow.style.cssText = 'display:flex;align-items:flex-start;gap:16px;justify-content:center;flex-wrap:wrap';
  var aW = document.createElement('div'); aW.style.textAlign = 'center';
  aW.innerHTML = '<div style="font-weight:800;color:var(--accent);margin-bottom:6px;font-size:15px">A</div>';
  d.boardA = makeBoard(3, 3, d.cellSz, aW); fillBoardNumbers(d.boardA, d.A, 3, 3); topRow.appendChild(aW);
  var plus = document.createElement('div');
  plus.style.cssText = 'font-size:32px;font-weight:900;color:var(--accent);margin-top:40px'; plus.textContent = '+'; topRow.appendChild(plus);
  var bW = document.createElement('div'); bW.style.textAlign = 'center';
  bW.innerHTML = '<div style="font-weight:800;color:var(--accent);margin-bottom:6px;font-size:15px">B</div>';
  d.boardB = makeBoard(3, 3, d.cellSz, bW); fillBoardNumbers(d.boardB, d.B, 3, 3); topRow.appendChild(bW);
  area.appendChild(topRow);
  var eq = document.createElement('div');
  eq.style.cssText = 'text-align:center;font-size:28px;font-weight:900;color:var(--accent);margin:12px 0'; eq.textContent = '='; area.appendChild(eq);
  var rW = document.createElement('div'); rW.style.textAlign = 'center';
  rW.innerHTML = '<div style="font-weight:800;color:var(--success);margin-bottom:6px;font-size:15px">A + B</div>';
  d.boardR = makeBoard(3, 3, d.cellSz, rW);
  for (var r = 0; r < 3; r++)
    for (var c = 0; c < 3; c++) {
      var cell = getCell(d.boardR, r, c);
      cell.classList.add('cell-clickable');
      cell.innerHTML = '<span style="color:var(--muted);font-weight:700">?</span>';
      (function (rr, cc, cl) { cl.addEventListener('click', function () { handleL3Click(rr, cc, cl); }); })(r, c, cell);
    }
  area.appendChild(rW);
  d.optionsDiv = document.createElement('div'); d.optionsDiv.className = 'options-grid';
  d.optionsDiv.style.cssText = 'max-width:240px;margin:16px auto 0'; area.appendChild(d.optionsDiv);
}

function updateTask3() { document.getElementById('taskText').innerHTML = 'Click a <b style="color:var(--muted)">?</b> cell, then pick the correct sum.'; }
function updateStats3() { document.getElementById('statsText').textContent = 'Filled: ' + S.levelData.filled + '/' + S.levelData.total; }

function handleL3Click(r, c, cell) {
  var d = S.levelData;
  if (d.result[r][c] !== null) return;
  var allCells = d.boardR.querySelectorAll('.cell');
  for (var i = 0; i < allCells.length; i++) allCells[i].classList.remove('cell-selected');
  SoundSystem.playTap();
  cell.classList.add('cell-selected');
  clearHighlights(d.boardA); clearHighlights(d.boardB);
  getCell(d.boardA, r, c).classList.add('cell-highlight');
  getCell(d.boardB, r, c).classList.add('cell-highlight');
  d.selR = r; d.selC = c;
  var correct = d.A[r][c] + d.B[r][c];
  setHint('Look at the two highlighted cells. Add their numbers: <b>' + d.A[r][c] + ' + ' + d.B[r][c] + ' = ?</b>');
  renderOptions(d.optionsDiv, generateOptions(correct, 4), function (v, btn) { handleL3Answer(v, correct, cell, btn); });
}

function handleL3Answer(v, correct, cell, btn) {
  var d = S.levelData; disableOptions(d.optionsDiv);
  if (v === correct) {
    btn.classList.add('correct');
    SoundSystem.playCorrect();
    cell.innerHTML = '<span style="font-weight:800;color:var(--success)">' + correct + '</span>';
    cell.classList.add('cell-correct'); cell.classList.remove('cell-selected');
    d.result[d.selR][d.selC] = correct; d.filled++;
    S.score += 5; updateHeader(); updateStats3();
    showFloatText(cell, '+5', 'var(--success)');
    clearHighlights(d.boardA); clearHighlights(d.boardB);
    d.optionsDiv.innerHTML = '';
    if (d.filled >= d.total) setTimeout(completeLevel, 600);
  } else {
    btn.classList.add('wrong'); SoundSystem.playWrong(); handleWrongAnswer(); showToast('Not the right sum \u2014 try again', 'error');
    setTimeout(function () { enableOptions(d.optionsDiv); }, 600);
  }
}


/* ================================================================
   LEVEL 4: SCALAR MULTIPLICATION
   ================================================================ */

function initL4() {
  var d = S.levelData;
  d.cellSz = isMobile ? 56 : 68; d.scalar = rand(2, 4);
  d.mat = genMat(3, 3, 1, 5);
  d.result = [[null,null,null],[null,null,null],[null,null,null]];
  d.filled = 0; d.total = 9; d.selR = -1; d.selC = -1;
}

function renderL4() {
  var d = S.levelData;
  document.getElementById('levelBadge').textContent = '4';
  document.getElementById('levelTitle').textContent = LEVELS[3].title;
  document.getElementById('levelDesc').textContent = 'Multiply every element of a matrix by a single number (scalar). The matrix dimensions don\'t change.';
  document.getElementById('learnBox').style.display = 'block';
  document.getElementById('learnContent').innerHTML =
    '<div style="color:var(--text);font-weight:700;margin-bottom:4px">Scalar multiplication:</div><code style="color:var(--accent)">B[i][j] = k \u00d7 A[i][j]</code><br><br>Every element gets multiplied by <b style="color:var(--text)">k</b>.<br>Here, k = <b style="color:var(--accent)">' + d.scalar + '</b>';
  setHint(null); updateTask4(); updateStats4();
  var area = document.getElementById('boardArea'); area.innerHTML = '';
  var sc = document.createElement('div');
  sc.style.cssText = 'text-align:center;margin-bottom:12px';
  sc.innerHTML = '<span style="color:var(--muted);font-size:18px;font-weight:700">k = </span><span style="color:var(--accent);font-size:32px;font-weight:900">' + d.scalar + '</span>';
  area.appendChild(sc);
  var wrap = document.createElement('div'); wrap.style.textAlign = 'center';
  d.board = makeBoard(3, 3, d.cellSz, wrap);
  for (var r = 0; r < 3; r++)
    for (var c = 0; c < 3; c++) {
      var cell = getCell(d.board, r, c);
      cell.classList.add('cell-clickable');
      cell.innerHTML = '<span style="font-weight:800;color:var(--text)">' + d.mat[r][c] + '</span>';
      (function (rr, cc, cl) { cl.addEventListener('click', function () { handleL4Click(rr, cc, cl); }); })(r, c, cell);
    }
  area.appendChild(wrap);
  d.optionsDiv = document.createElement('div'); d.optionsDiv.className = 'options-grid';
  d.optionsDiv.style.cssText = 'max-width:240px;margin:16px auto 0'; area.appendChild(d.optionsDiv);
}

function updateTask4() { document.getElementById('taskText').innerHTML = 'Click a cell, then pick <b style="color:var(--accent)">' + S.levelData.scalar + ' \u00d7 value</b>.'; }
function updateStats4() { document.getElementById('statsText').textContent = 'Computed: ' + S.levelData.filled + '/' + S.levelData.total; }

function handleL4Click(r, c, cell) {
  var d = S.levelData;
  if (d.result[r][c] !== null) return;
  clearHighlights(d.board);
  var allCells = d.board.querySelectorAll('.cell');
  for (var i = 0; i < allCells.length; i++) allCells[i].classList.remove('cell-selected');
  SoundSystem.playTap();
  cell.classList.add('cell-selected');
  d.selR = r; d.selC = c;
  var correct = d.mat[r][c] * d.scalar;
  setHint('Multiply the cell number by k: <b>' + d.mat[r][c] + ' \u00d7 ' + d.scalar + ' = ?</b>');
  renderOptions(d.optionsDiv, generateOptions(correct, d.scalar * 2), function (v, btn) { handleL4Answer(v, correct, cell, btn); });
}

function handleL4Answer(v, correct, cell, btn) {
  var d = S.levelData; disableOptions(d.optionsDiv);
  if (v === correct) {
    btn.classList.add('correct');
    SoundSystem.playCorrect();
    cell.innerHTML = '<span style="font-weight:800;color:var(--success)">' + correct + '</span>';
    cell.classList.add('cell-correct'); cell.classList.remove('cell-selected');
    d.result[d.selR][d.selC] = correct; d.filled++;
    S.score += 5; updateHeader(); updateStats4();
    showFloatText(cell, '+5', 'var(--success)');
    d.optionsDiv.innerHTML = '';
    if (d.filled >= d.total) setTimeout(completeLevel, 600);
  } else {
    btn.classList.add('wrong'); SoundSystem.playWrong(); handleWrongAnswer(); showToast('Wrong product \u2014 try again', 'error');
    setTimeout(function () { enableOptions(d.optionsDiv); }, 600);
  }
}


/* ================================================================
   LEVEL 5: MATRIX MULTIPLICATION
   ================================================================ */

function initL5() {
  var d = S.levelData;
  d.cellSz = isMobile ? 40 : 52;
  d.A = genMat(2, 3, 1, 3); d.B = genMat(3, 2, 1, 3);
  d.C = [[null, null], [null, null]];
  d.step = 0; d.steps = [[0, 0], [0, 1], [1, 0], [1, 1]];
}

function renderL5() {
  var d = S.levelData;
  document.getElementById('levelBadge').textContent = '5';
  document.getElementById('levelTitle').textContent = LEVELS[4].title;
  document.getElementById('levelDesc').textContent = 'Multiply matrices using the dot product of rows and columns. The result dimensions come from the outer dimensions: (2\u00d73) \u00d7 (3\u00d72) = (2\u00d72).';
  document.getElementById('learnBox').style.display = 'block';
  document.getElementById('learnContent').innerHTML =
    '<div style="color:var(--text);font-weight:700;margin-bottom:4px">Dot product rule:</div><code style="color:var(--accent)">C[i][j] = \u03a3 A[i][k] \u00d7 B[k][j]</code><br><br>Multiply each element in row <b style="color:var(--text)">i</b> of A by the corresponding element in column <b style="color:var(--text)">j</b> of B, then sum them all.';
  setHint(null); updateTask5(); updateStats5();
  var area = document.getElementById('boardArea'); area.innerHTML = '';
  var topRow = document.createElement('div');
  topRow.style.cssText = 'display:flex;align-items:flex-start;gap:12px;justify-content:center;flex-wrap:wrap';
  var aW = document.createElement('div'); aW.style.textAlign = 'center';
  aW.innerHTML = '<div style="font-weight:800;color:var(--accent);margin-bottom:4px;font-size:14px">A (2\u00d73)</div>';
  d.boardA = makeBoard(2, 3, d.cellSz, aW); fillBoardNumbers(d.boardA, d.A, 2, 3); topRow.appendChild(aW);
  var mul = document.createElement('div');
  mul.style.cssText = 'font-size:28px;font-weight:900;color:var(--accent);margin-top:30px'; mul.textContent = '\u00d7'; topRow.appendChild(mul);
  var bW = document.createElement('div'); bW.style.textAlign = 'center';
  bW.innerHTML = '<div style="font-weight:800;color:var(--accent);margin-bottom:4px;font-size:14px">B (3\u00d72)</div>';
  d.boardB = makeBoard(3, 2, d.cellSz, bW); fillBoardNumbers(d.boardB, d.B, 3, 2); topRow.appendChild(bW);
  area.appendChild(topRow);
  d.compDiv = document.createElement('div'); d.compDiv.className = 'comp-box'; area.appendChild(d.compDiv);
  var rW = document.createElement('div'); rW.style.textAlign = 'center';
  rW.innerHTML = '<div style="font-weight:800;color:var(--success);margin-bottom:4px;font-size:14px">C = A\u00d7B (2\u00d72)</div>';
  d.boardC = makeBoard(2, 2, d.cellSz, rW);
  for (var r = 0; r < 2; r++)
    for (var c = 0; c < 2; c++) getCell(d.boardC, r, c).innerHTML = '<span style="color:var(--muted);font-weight:700">?</span>';
  area.appendChild(rW);
  d.optionsDiv = document.createElement('div'); d.optionsDiv.className = 'options-grid';
  d.optionsDiv.style.cssText = 'max-width:240px;margin:12px auto 0'; area.appendChild(d.optionsDiv);
  renderL5Step();
}

function renderL5Step() {
  var d = S.levelData;
  if (d.step >= 4) {
    document.getElementById('taskText').innerHTML = '<span style="color:var(--success);font-weight:700">All computed!</span>';
    d.compDiv.innerHTML = '<span style="color:var(--success);font-weight:700">Matrix multiplication complete!</span>';
    d.optionsDiv.innerHTML = ''; setHint(null); return;
  }
  var pos = d.steps[d.step], si = pos[0], sj = pos[1];
  clearHighlights(d.boardA); clearHighlights(d.boardB);
  for (var k = 0; k < 3; k++) getCell(d.boardA, si, k).classList.add('cell-highlight');
  for (var k = 0; k < 3; k++) getCell(d.boardB, k, sj).classList.add('cell-highlight');
  var html = '<div style="font-weight:700;color:var(--text);margin-bottom:6px">C[' + si + '][' + sj + '] = row ' + si + ' of A \u2022 column ' + sj + ' of B</div>';
  var parts = [], products = [];
  for (var k = 0; k < 3; k++) {
    parts.push('<span class="val">' + d.A[si][k] + '</span> <span class="op">\u00d7</span> <span class="val">' + d.B[k][sj] + '</span>');
    products.push(d.A[si][k] * d.B[k][sj]);
  }
  html += '<div class="computation-line">' + parts.join(' <span class="op">+</span> ') + '</div>';
  html += '<div class="computation-line"><span class="eq">=</span> ' + products.join(' <span class="op">+</span> ') + ' <span class="eq">=</span> <span class="result">?</span></div>';
  d.compDiv.innerHTML = html;
  var correct = products[0] + products[1] + products[2];
  setHint('Multiply each highlighted pair, then add all three products: ' + products.join(' + ') + ' = <b>' + correct + '</b>');
  updateTask5();
  renderOptions(d.optionsDiv, generateOptions(correct, 6), function (v, btn) { handleL5Answer(v, correct, btn); });
}

function updateTask5() {
  var d = S.levelData;
  if (d.step >= 4) return;
  var pos = d.steps[d.step];
  document.getElementById('taskText').innerHTML = 'Compute <b style="color:var(--accent)">C[' + pos[0] + '][' + pos[1] + ']</b> using the dot product.';
}

function updateStats5() { document.getElementById('statsText').textContent = 'Computed: ' + S.levelData.step + '/4'; }

function handleL5Answer(v, correct, btn) {
  var d = S.levelData; disableOptions(d.optionsDiv);
  if (v === correct) {
    btn.classList.add('correct');
    SoundSystem.playCorrect();
    var pos = d.steps[d.step];
    getCell(d.boardC, pos[0], pos[1]).innerHTML = '<span style="font-weight:800;color:var(--success)">' + correct + '</span>';
    getCell(d.boardC, pos[0], pos[1]).classList.add('cell-correct');
    d.C[pos[0]][pos[1]] = correct; d.step++;
    S.score += 15; updateHeader(); updateStats5();
    showToast('Correct! +15 pts', 'success');
    var resSpan = d.compDiv.querySelector('.result');
    if (resSpan) resSpan.textContent = correct;
    d.optionsDiv.innerHTML = '';
    if (d.step >= 4) setTimeout(completeLevel, 600);
    else setTimeout(renderL5Step, 700);
  } else {
    btn.classList.add('wrong'); SoundSystem.playWrong(); handleWrongAnswer(); showToast('Wrong sum \u2014 add the products carefully', 'error');
    setTimeout(function () { enableOptions(d.optionsDiv); }, 600);
  }
}


/* ================================================================
   LEVEL 6: DETERMINANT OF A 2×2 MATRIX
   ================================================================ */

function initL6() {
  var d = S.levelData;
  d.cellSz = isMobile ? 90 : 110;
  d.totalRounds = 4; d.mIdx = 0; d.step = 0; d.correct = 0;
  d.totalSteps = d.totalRounds * 3;
  d.matrices = []; d.answers = [];
  for (var i = 0; i < d.totalRounds; i++) {
    var m = genMat(2, 2, 1, 6);
    d.matrices.push(m);
    d.answers.push({ mainDiag: m[0][0] * m[1][1], antiDiag: m[0][1] * m[1][0], det: m[0][0] * m[1][1] - m[0][1] * m[1][0] });
  }
}

function renderL6() {
  var d = S.levelData;
  document.getElementById('levelBadge').textContent = '6';
  document.getElementById('levelTitle').textContent = LEVELS[5].title;
  document.getElementById('levelDesc').textContent = 'The determinant measures how a 2\u00d72 matrix transforms space. It is computed by multiplying the diagonal pairs and subtracting.';
  document.getElementById('learnBox').style.display = 'block';
  document.getElementById('learnContent').innerHTML =
    '<div style="color:var(--text);font-weight:700;margin-bottom:4px">Determinant formula:</div><code style="color:var(--accent)">| a  b | = a\u00d7d \u2212 b\u00d7c</code><br><code style="color:var(--accent)">| c  d |</code><br><br><span style="color:var(--accent)">&#9679;</span> <b style="color:var(--text)">Main diagonal</b> (a\u00d7d): gold<br><span style="color:var(--accent2)">&#9679;</span> <b style="color:var(--text)">Anti-diagonal</b> (b\u00d7c): red<br><br><b style="color:var(--text)">det &gt; 0</b>: No flip<br><b style="color:var(--text)">det &lt; 0</b>: Flipped (mirror)<br><b style="color:var(--text)">det = 0</b>: Collapsed space';
  setHint(null); updateTask6(); updateStats6();
  renderL6Step();
}

function renderL6Step() {
  var d = S.levelData;
  var area = document.getElementById('boardArea'); area.innerHTML = '';
  if (d.mIdx >= d.totalRounds) {
    document.getElementById('taskText').innerHTML = '<span style="color:var(--success);font-weight:700">All determinants computed!</span>';
    setHint(null);
    var done = document.createElement('div'); done.style.cssText = 'text-align:center;padding:32px';
    done.innerHTML = '<div style="font-size:48px;margin-bottom:16px"><i class="fa-solid fa-check-circle" style="color:var(--success)"></i></div><div class="font-display text-2xl font-bold" style="margin-bottom:8px">Determinant mastery!</div><div style="color:var(--muted)">One more level to go \u2014 a checker battle that puts everything together.</div>';
    area.appendChild(done); return;
  }
  var m = d.matrices[d.mIdx], ans = d.answers[d.mIdx], step = d.step;
  var label = document.createElement('div');
  label.style.cssText = 'text-align:center;font-size:20px;font-weight:800;color:var(--accent);margin-bottom:16px';
  label.textContent = 'Matrix ' + String.fromCharCode(65 + d.mIdx); area.appendChild(label);
  var wrap = document.createElement('div');
  wrap.style.cssText = 'position:relative;display:inline-block';
  d.board = makeBoard(2, 2, d.cellSz, wrap);
  for (var r = 0; r < 2; r++)
    for (var c = 0; c < 2; c++) {
      var cell = getCell(d.board, r, c);
      cell.style.fontSize = (d.cellSz * 0.35) + 'px';
      cell.innerHTML = '<span style="font-weight:900;color:var(--text)">' + m[r][c] + '</span>';
    }
  if (step >= 0) { getCell(d.board, 0, 0).classList.add('cell-diag-main'); getCell(d.board, 1, 1).classList.add('cell-diag-main'); }
  if (step >= 1) { getCell(d.board, 0, 1).classList.add('cell-diag-anti'); getCell(d.board, 1, 0).classList.add('cell-diag-anti'); }
  addVarLabel(wrap, 0, 0, 'a', d.cellSz); addVarLabel(wrap, 0, 1, 'b', d.cellSz);
  addVarLabel(wrap, 1, 0, 'c', d.cellSz); addVarLabel(wrap, 1, 1, 'd', d.cellSz);
  wrap.appendChild(createDiagonalSVG(d.cellSz, step));
  area.appendChild(wrap);
  d.compDiv = document.createElement('div'); d.compDiv.className = 'comp-box';
  d.compDiv.innerHTML = buildL6CompHTML(m, ans, step); area.appendChild(d.compDiv);
  if (step === 0) setHint('The <b style="color:var(--accent)">gold diagonal</b> goes top-left to bottom-right. Multiply a \u00d7 d: <b>' + m[0][0] + ' \u00d7 ' + m[1][1] + ' = ' + ans.mainDiag + '</b>');
  else if (step === 1) setHint('The <b style="color:var(--accent2)">red diagonal</b> goes top-right to bottom-left. Multiply b \u00d7 c: <b>' + m[0][1] + ' \u00d7 ' + m[1][0] + ' = ' + ans.antiDiag + '</b>');
  else setHint('Subtract the anti-diagonal from the main diagonal: <b>' + ans.mainDiag + ' \u2212 ' + ans.antiDiag + ' = ' + ans.det + '</b>');
  if (step < 3) {
    d.optionsDiv = document.createElement('div'); d.optionsDiv.className = 'options-grid';
    d.optionsDiv.style.cssText = 'max-width:300px;margin:16px auto 0';
    var correct, range;
    if (step === 0) { correct = ans.mainDiag; range = Math.max(5, Math.floor(ans.mainDiag * 0.4)); }
    else if (step === 1) { correct = ans.antiDiag; range = Math.max(5, Math.floor(ans.antiDiag * 0.4)); }
    else { correct = ans.det; range = Math.max(6, Math.abs(Math.floor(ans.det * 0.5)) + 3); }
    var opts = (step === 2) ? generateSignedOptions(correct, range) : generateOptions(correct, range);
    renderOptions(d.optionsDiv, opts, function (v, btn) { handleL6Answer(v, correct, btn); });
    area.appendChild(d.optionsDiv);
  }
}

function addVarLabel(wrap, r, c, letter, cellSz) {
  var lbl = document.createElement('div'); lbl.textContent = letter;
  lbl.style.cssText = 'position:absolute;font-size:13px;font-weight:800;pointer-events:none;z-index:5;top:' + (4 + r * cellSz + 4) + 'px;left:' + (4 + c * cellSz + 6) + 'px;color:var(--muted);opacity:0.7';
  wrap.appendChild(lbl);
}

function createDiagonalSVG(cellSz, step) {
  var w = cellSz * 2, h = cellSz * 2, ns = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', w); svg.setAttribute('height', h);
  svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
  svg.style.cssText = 'position:absolute;top:4px;left:4px;pointer-events:none;z-index:4';
  if (step >= 0) {
    var line1 = document.createElementNS(ns, 'line');
    line1.setAttribute('x1', cellSz * 0.5); line1.setAttribute('y1', cellSz * 0.5);
    line1.setAttribute('x2', cellSz * 1.5); line1.setAttribute('y2', cellSz * 1.5);
    line1.setAttribute('stroke', '#f59e0b'); line1.setAttribute('stroke-width', '5');
    line1.setAttribute('stroke-linecap', 'round'); line1.setAttribute('opacity', step === 0 ? '0.85' : '0.3');
    svg.appendChild(line1);
  }
  if (step >= 1) {
    var line2 = document.createElementNS(ns, 'line');
    line2.setAttribute('x1', cellSz * 1.5); line2.setAttribute('y1', cellSz * 0.5);
    line2.setAttribute('x2', cellSz * 0.5); line2.setAttribute('y2', cellSz * 1.5);
    line2.setAttribute('stroke', '#ef4444'); line2.setAttribute('stroke-width', '5');
    line2.setAttribute('stroke-linecap', 'round'); line2.setAttribute('opacity', step === 1 ? '0.85' : '0.3');
    svg.appendChild(line2);
  }
  return svg;
}

function buildL6CompHTML(m, ans, step) {
  var a = m[0][0], b = m[0][1], c = m[1][0], dd = m[1][1];
  var ac = 'val-main', bc = 'val-anti', cc = 'val-anti', dc = 'val-main';
  if (step === 0) { bc = 'val-plain'; cc = 'val-plain'; }
  if (step === 1) { ac = 'val-plain'; dc = 'val-plain'; }
  var matHTML = '<div class="det-matrix"><div class="det-matrix-row"><span class="' + ac + '">' + a + '</span><span class="' + bc + '">' + b + '</span></div><div class="det-matrix-bar"></div><div class="det-matrix-row"><span class="' + cc + '">' + c + '</span><span class="' + dc + '">' + dd + '</span></div></div>';
  if (step === 0) return '<div style="font-weight:700;color:var(--accent);margin-bottom:8px">Step 1 of 3 \u2014 Main Diagonal</div>' + matHTML + '<div class="computation-line" style="margin-top:10px"><span style="color:var(--accent);font-weight:800">a</span> <span class="op">\u00d7</span> <span style="color:var(--accent);font-weight:800">d</span> <span class="eq">=</span> <span class="val">' + a + '</span> <span class="op">\u00d7</span> <span class="val">' + dd + '</span> <span class="eq">=</span> <span class="result">?</span></div>';
  if (step === 1) return '<div style="font-weight:700;color:var(--accent2);margin-bottom:8px">Step 2 of 3 \u2014 Anti-Diagonal</div>' + matHTML + '<div class="computation-line" style="margin-top:10px"><span style="color:var(--accent2);font-weight:800">b</span> <span class="op">\u00d7</span> <span style="color:var(--accent2);font-weight:800">c</span> <span class="eq">=</span> <span class="val">' + b + '</span> <span class="op">\u00d7</span> <span class="val">' + c + '</span> <span class="eq">=</span> <span class="result">?</span></div>';
  return '<div style="font-weight:700;color:var(--text);margin-bottom:8px">Step 3 of 3 \u2014 Determinant</div>' + matHTML + '<div class="computation-line" style="margin-top:10px"><span style="font-weight:800">det</span> <span class="eq">=</span> <span style="color:var(--accent)">a\u00d7d</span> <span class="op">\u2212</span> <span style="color:var(--accent2)">b\u00d7c</span> <span class="eq">=</span> <span class="val">' + ans.mainDiag + '</span> <span class="op">\u2212</span> <span class="val">' + ans.antiDiag + '</span> <span class="eq">=</span> <span class="result">?</span></div>';
}

function handleL6Answer(v, correct, btn) {
  var d = S.levelData; disableOptions(d.optionsDiv);
  if (v === correct) {
    btn.classList.add('correct');
    SoundSystem.playCorrect();
    var resultSpan = d.compDiv.querySelector('.result');
    if (resultSpan) { resultSpan.textContent = correct; resultSpan.style.color = 'var(--success)'; }
    S.score += (d.step === 2) ? 10 : 5; d.correct++;
    updateHeader(); updateStats6();
    if (d.step < 2) { d.step++; setTimeout(renderL6Step, 600); }
    else {
      var det = d.answers[d.mIdx].det, meaning, mColor;
      if (det > 0) { meaning = 'Positive \u2014 No flip!'; mColor = 'var(--success)'; }
      else if (det < 0) { meaning = 'Negative \u2014 Space is flipped!'; mColor = 'var(--accent2)'; }
      else { meaning = 'Zero \u2014 Space is collapsed!'; mColor = 'var(--muted)'; }
      var card = document.createElement('div'); card.className = 'det-result-card';
      card.innerHTML = '<div class="det-value" style="color:' + mColor + '">det = ' + det + '</div><div class="det-meaning">' + meaning + '</div>';
      if (d.optionsDiv && d.optionsDiv.parentNode) { d.optionsDiv.innerHTML = ''; d.optionsDiv.parentNode.appendChild(card); }
      d.mIdx++; d.step = 0;
      if (d.mIdx >= d.totalRounds) setTimeout(completeLevel, 1200);
      else setTimeout(renderL6Step, 1600);
    }
  } else {
    btn.classList.add('wrong'); SoundSystem.playWrong(); handleWrongAnswer(); showToast('Wrong \u2014 try again', 'error');
    setTimeout(function () { enableOptions(d.optionsDiv); }, 600);
  }
}

function updateTask6() {
  var d = S.levelData;
  if (d.mIdx >= d.totalRounds) { document.getElementById('taskText').innerHTML = '<span style="color:var(--success);font-weight:700">All determinants computed!</span>'; return; }
  var names = ['main diagonal product (a\u00d7d)', 'anti-diagonal product (b\u00d7c)', 'determinant (a\u00d7d \u2212 b\u00d7c)'];
  document.getElementById('taskText').innerHTML = 'Compute the <b style="color:var(--accent)">' + names[d.step] + '</b>';
}

function updateStats6() {
  document.getElementById('statsText').textContent = 'Progress: ' + S.levelData.correct + '/' + S.levelData.totalSteps + ' steps \u00a0|\u00a0 Matrix ' + Math.min(S.levelData.mIdx + 1, S.levelData.totalRounds) + '/' + S.levelData.totalRounds;
}


/* ================================================================
   LEVEL 7: CHECKER BATTLE
   ================================================================
   Capturing = matrix addition (your value += their value)
   Gold squares = scalar multiplication (value × 2 on landing)
   Win by capturing all red pieces or outscoring them.
   ================================================================ */

function initL7() {
  var d = S.levelData;
  d.cellSz = isMobile ? 50 : 64; d.rows = 6; d.cols = 6;
  d.grid = createEmptyGrid(6, 6);
  d.turn = 'teal'; d.selected = null; d.validMoves = []; d.over = false;
  d.tealTotal = 0; d.redTotal = 0;
  d.scalarSquares = [[2, 3, 2], [3, 0, 2]];
  for (var r = 0; r < 2; r++)
    for (var c = 0; c < 6; c++)
      if (isDark(r, c)) { var v = rand(1, 3); d.grid[r][c] = { color: 'teal', value: v }; d.tealTotal += v; }
  for (var r = 4; r < 6; r++)
    for (var c = 0; c < 6; c++)
      if (isDark(r, c)) { var v = rand(1, 3); d.grid[r][c] = { color: 'red', value: v }; d.redTotal += v; }
}

function renderL7() {
  var d = S.levelData;
  document.getElementById('levelBadge').textContent = '7';
  document.getElementById('levelTitle').textContent = LEVELS[6].title;
  document.getElementById('levelDesc').textContent = 'A real checkers battle where capturing adds values (matrix addition) and gold squares multiply (scalar multiplication). Capture all red pieces or outscore them!';
  document.getElementById('learnBox').style.display = 'block';
  document.getElementById('learnContent').innerHTML =
    '<div style="color:var(--text);font-weight:700;margin-bottom:4px">Rules:</div>' +
    '<i class="fa-solid fa-circle" style="color:var(--piece-teal);font-size:10px"></i> You (teal) move <b style="color:var(--text)">diagonally down</b><br>' +
    '<i class="fa-solid fa-circle" style="color:var(--piece-red);font-size:10px"></i> Red moves <b style="color:var(--text)">diagonally up</b><br>' +
    '<i class="fa-solid fa-bolt" style="color:var(--accent);font-size:10px"></i> Jump to capture: <b style="color:var(--text)">your value += their value</b><br>' +
    '<i class="fa-solid fa-star" style="color:var(--accent);font-size:10px"></i> Gold squares: <b style="color:var(--text)">value \u00d7 2</b>';
  updateTask7(); updateStats7();
  setHint('Click one of your teal pieces to see where it can move. Look for capture opportunities!');
  renderL7Board();
}

function renderL7Board() {
  var d = S.levelData;
  var area = document.getElementById('boardArea'); area.innerHTML = '';
  // Score bar
  var scoreBar = document.createElement('div');
  scoreBar.style.cssText = 'display:flex;align-items:center;gap:24px;margin-bottom:12px;justify-content:center';
  scoreBar.innerHTML = '<div style="display:flex;align-items:center;gap:8px"><div class="piece piece-teal" style="width:24px;height:24px;font-size:10px"></div><span style="font-weight:800;color:var(--piece-teal)">You: ' + d.tealTotal + '</span></div><span style="color:var(--muted);font-weight:700">vs</span><div style="display:flex;align-items:center;gap:8px"><div class="piece piece-red" style="width:24px;height:24px;font-size:10px"></div><span style="font-weight:800;color:var(--piece-red)">Red: ' + d.redTotal + '</span></div>';
  area.appendChild(scoreBar);
  // Turn indicator
  var turnDiv = document.createElement('div');
  turnDiv.style.cssText = 'text-align:center;font-weight:700;font-size:15px;margin-bottom:10px;color:' + (d.turn === 'teal' ? 'var(--piece-teal)' : 'var(--piece-red)');
  turnDiv.textContent = d.turn === 'teal' ? 'Your turn \u2014 click a teal piece' : 'Red is thinking...';
  area.appendChild(turnDiv);
  // Board
  var wrap = document.createElement('div');
  wrap.style.cssText = 'position:relative;display:inline-block';
  d.boardEl = makeBoard(d.rows, d.cols, d.cellSz, wrap);
  for (var r = 0; r < 6; r++) { var lbl = document.createElement('div'); lbl.style.cssText = 'position:absolute;left:-18px;top:' + (r * d.cellSz + d.cellSz / 2 - 7) + 'px;font-size:11px;font-weight:700;color:var(--accent)'; lbl.textContent = r; wrap.appendChild(lbl); }
  for (var c = 0; c < 6; c++) { var lbl = document.createElement('div'); lbl.style.cssText = 'position:absolute;top:-16px;left:' + (c * d.cellSz + d.cellSz / 2 - 5) + 'px;font-size:11px;font-weight:700;color:var(--accent)'; lbl.textContent = c; wrap.appendChild(lbl); }
  for (var r = 0; r < 6; r++)
    for (var c = 0; c < 6; c++) {
      var cell = getCell(d.boardEl, r, c);
      if (isScalarSquare(d, r, c)) cell.classList.add('cell-scalar');
      var piece = d.grid[r][c];
      if (piece) {
        cell.innerHTML = '<div class="piece piece-' + piece.color + ' piece-number">' + piece.value + '</div>';
        if (piece.color === 'teal') cell.classList.add('cell-clickable');
      }
      (function (rr, cc, cl) { cl.addEventListener('click', function () { handleL7Click(rr, cc); }); })(r, c, cell);
    }
  if (d.selected) {
    getCell(d.boardEl, d.selected[0], d.selected[1]).classList.add('cell-selected');
    for (var i = 0; i < d.validMoves.length; i++) {
      var m = d.validMoves[i];
      getCell(d.boardEl, m.to[0], m.to[1]).classList.add(m.type === 'capture' ? 'cell-valid-capture' : 'cell-valid-move');
      getCell(d.boardEl, m.to[0], m.to[1]).classList.add('cell-clickable');
    }
  }
  area.appendChild(wrap);
  // Game over overlay
  if (d.over) {
    var winner = (d.tealTotal > d.redTotal || d.redTotal <= 0) ? 'You win' : 'Red wins';
    var wColor = winner === 'You win' ? 'var(--success)' : 'var(--accent2)';
    var icon = winner === 'You win' ? '<i class="fa-solid fa-trophy" style="color:var(--accent)"></i>' : '<i class="fa-solid fa-face-sad-tear" style="color:var(--accent2)"></i>';
    var ov = document.createElement('div'); ov.className = 'modal-overlay';
    ov.innerHTML = '<div class="modal-box" style="text-align:center"><div style="font-size:48px;margin-bottom:12px">' + icon + '</div><h3 class="font-display text-2xl font-bold mb-2" style="color:' + wColor + '">' + winner + '!</h3><p style="color:var(--muted);margin-bottom:4px">Your total: <b style="color:var(--piece-teal)">' + d.tealTotal + '</b> \u2014 Red total: <b style="color:var(--piece-red)">' + d.redTotal + '</b></p><p style="color:var(--muted);margin-bottom:16px;font-size:14px">You used matrix addition (capturing) and scalar multiplication (gold squares)!</p><button id="battleReplay" class="btn-primary btn-lg">Play Again</button></div>';
    area.appendChild(ov); setHint(null);
    setTimeout(function () { var btn = document.getElementById('battleReplay'); if (btn) btn.addEventListener('click', function () { initL7(); renderL7(); }); }, 50);
  }
}

function updateTask7() {
  var d = S.levelData;
  if (d.over) { document.getElementById('taskText').innerHTML = 'Game over!'; return; }
  document.getElementById('taskText').innerHTML = d.turn === 'teal' ? 'Click a <b style="color:var(--piece-teal)">teal piece</b> to move or capture.' : '<b style="color:var(--piece-red)">Red</b> is moving...';
}

function updateStats7() { document.getElementById('statsText').textContent = 'You: ' + S.levelData.tealTotal + ' | Red: ' + S.levelData.redTotal; }

// --- Battle helpers ---

function isDark(r, c) { return (r + c) % 2 === 1; }

function isScalarSquare(d, r, c) {
  for (var i = 0; i < d.scalarSquares.length; i++) if (d.scalarSquares[i][0] === r && d.scalarSquares[i][1] === c) return true;
  return false;
}

function getScalarMultiplier(d, r, c) {
  for (var i = 0; i < d.scalarSquares.length; i++) if (d.scalarSquares[i][0] === r && d.scalarSquares[i][1] === c) return d.scalarSquares[i][2];
  return 1;
}

function createEmptyGrid(rows, cols) {
  var grid = [];
  for (var r = 0; r < rows; r++) { var row = []; for (var c = 0; c < cols; c++) row.push(null); grid.push(row); }
  return grid;
}

function getValidMoves(grid, r, c) {
  var piece = grid[r][c]; if (!piece) return [];
  var moves = [], dir = piece.color === 'teal' ? 1 : -1, diags = [[dir, -1], [dir, 1]];
  for (var i = 0; i < diags.length; i++) {
    var dr = diags[i][0], dc = diags[i][1], nr = r + dr, nc = c + dc;
    if (nr >= 0 && nr < 6 && nc >= 0 && nc < 6 && !grid[nr][nc]) moves.push({ type: 'move', to: [nr, nc] });
    var jr = r + 2 * dr, jc = c + 2 * dc;
    if (jr >= 0 && jr < 6 && jc >= 0 && jc < 6 && !grid[jr][jc] && grid[nr][nc] && grid[nr][nc].color !== piece.color)
      moves.push({ type: 'capture', to: [jr, jc], captured: [nr, nc] });
  }
  return moves;
}

function getAllMoves(grid, color) {
  var all = [], hasCap = false;
  for (var r = 0; r < 6; r++)
    for (var c = 0; c < 6; c++)
      if (grid[r][c] && grid[r][c].color === color) {
        var moves = getValidMoves(grid, r, c);
        for (var i = 0; i < moves.length; i++) {
          if (moves[i].type === 'capture') hasCap = true;
          all.push({ from: [r, c], type: moves[i].type, to: moves[i].to, captured: moves[i].captured });
        }
      }
  if (hasCap) { var caps = []; for (var i = 0; i < all.length; i++) { if (all[i].type === 'capture') caps.push(all[i]); } return caps; }
  return all;
}

function handleL7Click(r, c) {
  var d = S.levelData;
  if (d.over || d.turn !== 'teal') return;
  SoundSystem.playTap();
  if (d.selected) {
    var move = null;
    for (var i = 0; i < d.validMoves.length; i++) { if (d.validMoves[i].to[0] === r && d.validMoves[i].to[1] === c) { move = d.validMoves[i]; break; } }
    if (move) { SoundSystem.playCorrect(); executeL7Move(move); return; }
  }
  if (d.grid[r][c] && d.grid[r][c].color === 'teal') {
    var allMoves = getAllMoves(d.grid, 'teal'), pieceMoves = [];
    for (var i = 0; i < allMoves.length; i++) { if (allMoves[i].from[0] === r && allMoves[i].from[1] === c) pieceMoves.push(allMoves[i]); }
    if (pieceMoves.length === 0) { showToast('No valid moves for this piece', 'info'); return; }
    d.selected = [r, c]; d.validMoves = pieceMoves;
    var hasCapture = false;
    for (var i = 0; i < pieceMoves.length; i++) { if (pieceMoves[i].type === 'capture') { hasCapture = true; break; } }
    if (hasCapture) setHint('You can capture! Click a <b style="color:var(--accent2)">red-bordered circle</b> to jump over a red piece. Your value will increase by the captured piece\'s value (matrix addition).');
    else setHint('No captures available. Click a <b>white circle</b> to move diagonally forward. Look for gold squares (\u00d72) for a scalar multiplication bonus!');
    renderL7Board(); return;
  }
  SoundSystem.playWrong();
  handleWrongAnswer();
  d.selected = null; d.validMoves = [];
  setHint('Click one of your teal pieces to see where it can move.');
  renderL7Board();
}

function executeL7Move(move) {
  var d = S.levelData;
  var piece = d.grid[d.selected[0]][d.selected[1]];
  d.grid[d.selected[0]][d.selected[1]] = null;
  if (move.type === 'capture') {
    var cap = d.grid[move.captured[0]][move.captured[1]];
    var oldVal = piece.value; piece.value += cap.value;
    d.redTotal -= cap.value; d.grid[move.captured[0]][move.captured[1]] = null;
    SoundSystem.playCorrect();
    showToast('Captured! ' + oldVal + ' + ' + cap.value + ' = ' + piece.value + ' (matrix addition)', 'success');
  }
  var mult = getScalarMultiplier(d, move.to[0], move.to[1]);
  if (mult > 1) {
    var prev = piece.value; piece.value *= mult;
    d.tealTotal += piece.value - prev;
    SoundSystem.playCorrect();
    showToast('Scalar \u00d7' + mult + '! ' + prev + ' \u2192 ' + piece.value, 'info');
  }
  d.grid[move.to[0]][move.to[1]] = piece;
  d.selected = null; d.validMoves = [];
  if (d.redTotal <= 0) { d.over = true; S.score += 100; updateHeader(); renderL7Board(); completeLevel(); return; }
  d.turn = 'red';
  setHint('Red is making its move...');
  renderL7Board();
  setTimeout(aiL7Move, 800);
}

function aiL7Move() {
  var d = S.levelData;
  if (d.over) return;
  var moves = getAllMoves(d.grid, 'red');
  if (moves.length === 0) { d.over = true; S.score += 100; updateHeader(); renderL7Board(); completeLevel(); return; }
  var caps = [];
  for (var i = 0; i < moves.length; i++) { if (moves[i].type === 'capture') caps.push(moves[i]); }
  var move = caps.length > 0 ? caps[rand(0, caps.length - 1)] : moves[rand(0, moves.length - 1)];
  var piece = d.grid[move.from[0]][move.from[1]];
  d.grid[move.from[0]][move.from[1]] = null;
  if (move.type === 'capture') {
    var cap = d.grid[move.captured[0]][move.captured[1]];
    piece.value += cap.value; d.tealTotal -= cap.value;
    d.grid[move.captured[0]][move.captured[1]] = null;
  }
  var mult = getScalarMultiplier(d, move.to[0], move.to[1]);
  if (mult > 1) { var prev = piece.value; piece.value *= mult; d.redTotal += piece.value - prev; }
  d.grid[move.to[0]][move.to[1]] = piece;
  d.turn = 'teal';
  var playerMoves = getAllMoves(d.grid, 'teal');
  if (playerMoves.length === 0) { d.over = true; renderL7Board(); return; }
  setHint('Your turn! Click a teal piece to move. Look for captures or gold squares.');
  renderL7Board();
}


