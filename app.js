// ================= NAVEGACIÓN =================
const home = document.getElementById('home');
const views = {
  tetris: document.getElementById('view-tetris'),
  snake: document.getElementById('view-snake'),
  gato: document.getElementById('view-gato'),
  pong: document.getElementById('view-pong'),
};
let activeGame = null;

function stopAll() {
  tStop(); sStop(); pStop();
}
function go(name) {
  stopAll();
  home.classList.add('hidden');
  Object.values(views).forEach(v => v.classList.add('hidden'));
  views[name].classList.remove('hidden');
  activeGame = name;
  window.scrollTo(0, 0);
}
function goHome() {
  stopAll();
  Object.values(views).forEach(v => v.classList.add('hidden'));
  home.classList.remove('hidden');
  activeGame = null;
  window.scrollTo(0, 0);
}
document.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => go(b.dataset.go)));
document.querySelectorAll('[data-home]').forEach(b => b.addEventListener('click', goHome));

// ================= TETRIS =================
const tCanvas = document.getElementById('tetris-board');
const tCtx = tCanvas.getContext('2d');
const T_COLS = 10, T_ROWS = 20, T_SIZE = 30;
const SHAPES = {
  I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  J: [[1,0,0],[1,1,1],[0,0,0]],
  L: [[0,0,1],[1,1,1],[0,0,0]],
  O: [[1,1],[1,1]],
  S: [[0,1,1],[1,1,0],[0,0,0]],
  T: [[0,1,0],[1,1,1],[0,0,0]],
  Z: [[1,1,0],[0,1,1],[0,0,0]],
};
const COLORS = { I:'#7AA7FF', J:'#5B8DEF', L:'#E8A94F', O:'#E3C84B', S:'#6FCF7E', T:'#B48BE0', Z:'#E87A7A' };
let tBoard, tPiece, tScore, tLines, tLevel, tDropCounter, tDropInterval, tLastTime, tRaf, tGameOver, tPaused, tRunning;

function tReset() {
  tBoard = Array.from({length: T_ROWS}, () => Array(T_COLS).fill(0));
  tScore = 0; tLines = 0; tLevel = 1;
  tDropInterval = 800; tDropCounter = 0; tLastTime = 0;
  tGameOver = false; tPaused = false; tRunning = true;
  tPiece = tRandomPiece();
  tUpdateHUD(); tSetMsg('¡A jugar!');
  cancelAnimationFrame(tRaf);
  tRaf = requestAnimationFrame(tUpdate);
}
function tRandomPiece() {
  const keys = Object.keys(SHAPES);
  const k = keys[Math.floor(Math.random() * keys.length)];
  return { matrix: SHAPES[k].map(r => r.slice()), color: COLORS[k], x: 3, y: 0 };
}
function tCollide(bd, pc) {
  for (let y = 0; y < pc.matrix.length; y++)
    for (let x = 0; x < pc.matrix[y].length; x++)
      if (pc.matrix[y][x] && (bd[y + pc.y] === undefined || bd[y + pc.y][x + pc.x] === undefined || bd[y + pc.y][x + pc.x])) return true;
  return false;
}
function tMerge() {
  tPiece.matrix.forEach((row, y) => row.forEach((v, x) => { if (v) tBoard[y + tPiece.y][x + tPiece.x] = tPiece.color; }));
}
function tRotateMatrix(m) {
  return m[0].map((_, i) => m.map(r => r[i]).reverse());
}
function tClearLines() {
  let n = 0;
  for (let y = T_ROWS - 1; y >= 0; y--) {
    if (tBoard[y].every(c => c)) { tBoard.splice(y, 1); tBoard.unshift(Array(T_COLS).fill(0)); n++; y++; }
  }
  if (n) {
    tLines += n;
    tScore += [0,100,300,500,800][n] * tLevel;
    tLevel = Math.floor(tLines / 10) + 1;
    tDropInterval = Math.max(100, 800 - (tLevel - 1) * 70);
    tUpdateHUD();
  }
}
function tDrop() {
  tPiece.y++;
  if (tCollide(tBoard, tPiece)) {
    tPiece.y--; tMerge(); tClearLines();
    tPiece = tRandomPiece();
    if (tCollide(tBoard, tPiece)) { tGameOver = true; tRunning = false; tSetMsg('Juego terminado — pulsa Iniciar'); tDraw(); return; }
  }
  tDropCounter = 0;
}
function tUpdate(time = 0) {
  if (!tRunning || tPaused || tGameOver) return;
  const delta = time - tLastTime; tLastTime = time;
  tDropCounter += delta;
  if (tDropCounter > tDropInterval) tDrop();
  tDraw();
  tRaf = requestAnimationFrame(tUpdate);
}
function tDraw() {
  tCtx.fillStyle = '#FFFFFF'; tCtx.fillRect(0, 0, tCanvas.width, tCanvas.height);
  tBoard.forEach((row, y) => row.forEach((c, x) => { if (c) tDrawBlock(x, y, c); }));
  if (tPiece && !tGameOver) tPiece.matrix.forEach((row, y) => row.forEach((v, x) => { if (v) tDrawBlock(tPiece.x + x, tPiece.y + y, tPiece.color); }));
  tCtx.strokeStyle = '#EDEDE8'; tCtx.lineWidth = 1;
  for (let i = 0; i <= T_COLS; i++) { tCtx.beginPath(); tCtx.moveTo(i*T_SIZE, 0); tCtx.lineTo(i*T_SIZE, tCanvas.height); tCtx.stroke(); }
  for (let i = 0; i <= T_ROWS; i++) { tCtx.beginPath(); tCtx.moveTo(0, i*T_SIZE); tCtx.lineTo(tCanvas.width, i*T_SIZE); tCtx.stroke(); }
}
function tDrawBlock(x, y, color) {
  tCtx.fillStyle = color; tCtx.fillRect(x*T_SIZE+2, y*T_SIZE+2, T_SIZE-4, T_SIZE-4);
  tCtx.fillStyle = 'rgba(255,255,255,.45)'; tCtx.fillRect(x*T_SIZE+2, y*T_SIZE+2, T_SIZE-4, 5);
}
function tUpdateHUD() {
  document.getElementById('t-score').textContent = tScore;
  document.getElementById('t-lines').textContent = tLines;
  document.getElementById('t-level').textContent = tLevel;
}
function tSetMsg(m) { document.getElementById('t-msg').textContent = m; }
function tStop() { tRunning = false; cancelAnimationFrame(tRaf); }
function tMove(dx) { if (!tRunning || tPaused || tGameOver) return; tPiece.x += dx; if (tCollide(tBoard, tPiece)) tPiece.x -= dx; tDraw(); }
function tRotate() { if (!tRunning || tPaused || tGameOver) return; const r = tRotateMatrix(tPiece.matrix); const old = tPiece.matrix; tPiece.matrix = r; if (tCollide(tBoard, tPiece)) tPiece.matrix = old; tDraw(); }
function tDown() { if (!tRunning || tPaused || tGameOver) return; tDrop(); tUpdateHUD(); tDraw(); }
function tHardDrop() { if (!tRunning || tPaused || tGameOver) return; while (!tCollide(tBoard, { ...tPiece, y: tPiece.y + 1 })) tPiece.y++; tDrop(); tUpdateHUD(); tDraw(); }

document.getElementById('t-start').addEventListener('click', tReset);
document.getElementById('t-pause').addEventListener('click', () => {
  if (!tRunning || tGameOver) return;
  tPaused = !tPaused;
  tSetMsg(tPaused ? 'En pausa' : '¡A jugar!');
  if (!tPaused) { tLastTime = performance.now(); tRaf = requestAnimationFrame(tUpdate); }
});
document.getElementById('t-left').addEventListener('click', () => tMove(-1));
document.getElementById('t-right').addEventListener('click', () => tMove(1));
document.getElementById('t-rotate').addEventListener('click', tRotate);
document.getElementById('t-down').addEventListener('click', tDown);
tBoard = Array.from({length: T_ROWS}, () => Array(T_COLS).fill(0));
tPiece = tRandomPiece(); tScore = 0; tLines = 0; tLevel = 1; tDraw();

// ================= SNAKE =================
const sCanvas = document.getElementById('snake-board');
const sCtx = sCanvas.getContext('2d');
const S_N = 20, S_SIZE = 20;
let sSnake, sDir, sNextDir, sFood, sScore, sBest = 0, sTimer, sRunning, sGameOver;

function sReset() {
  sSnake = [{x:10,y:10},{x:9,y:10},{x:8,y:10}];
  sDir = {x:1,y:0}; sNextDir = {x:1,y:0};
  sScore = 0; sGameOver = false; sRunning = true;
  sPlaceFood(); sUpdateHUD(); sSetMsg('¡A jugar!');
  clearInterval(sTimer);
  sTimer = setInterval(sLoop, 130);
  sDraw();
}
function sPlaceFood() {
  while (true) {
    const f = { x: Math.floor(Math.random()*S_N), y: Math.floor(Math.random()*S_N) };
    if (!sSnake.some(s => s.x === f.x && s.y === f.y)) { sFood = f; return; }
  }
}
function sLoop() {
  if (!sRunning || sGameOver) return;
  sDir = sNextDir;
  const head = { x: sSnake[0].x + sDir.x, y: sSnake[0].y + sDir.y };
  if (head.x < 0 || head.y < 0 || head.x >= S_N || head.y >= S_N || sSnake.some(s => s.x === head.x && s.y === head.y)) {
    sGameOver = true; sRunning = false; clearInterval(sTimer);
    sBest = Math.max(sBest, sScore); sUpdateHUD();
    sSetMsg('Juego terminado — pulsa Iniciar'); return;
  }
  sSnake.unshift(head);
  if (head.x === sFood.x && head.y === sFood.y) { sScore += 10; sBest = Math.max(sBest, sScore); sPlaceFood(); }
  else sSnake.pop();
  sUpdateHUD(); sDraw();
}
function sDraw() {
  sCtx.fillStyle = '#FFFFFF'; sCtx.fillRect(0, 0, sCanvas.width, sCanvas.height);
  sCtx.fillStyle = '#E87A7A';
  sCtx.beginPath(); sCtx.arc(sFood.x*S_SIZE+S_SIZE/2, sFood.y*S_SIZE+S_SIZE/2, S_SIZE/2-3, 0, Math.PI*2); sCtx.fill();
  sSnake.forEach((s, i) => {
    sCtx.fillStyle = i === 0 ? '#1C1C1E' : '#B9B7AE';
    sCtx.beginPath(); sCtx.roundRect(s.x*S_SIZE+1, s.y*S_SIZE+1, S_SIZE-2, S_SIZE-2, 5); sCtx.fill();
  });
}
function sUpdateHUD() {
  document.getElementById('s-score').textContent = sScore;
  document.getElementById('s-best').textContent = sBest;
}
function sSetMsg(m) { document.getElementById('s-msg').textContent = m; }
function sStop() { sRunning = false; clearInterval(sTimer); }
function sSetDir(x, y) {
  if (sDir.x === -x && sDir.y === -y) return; // no reversa
  sNextDir = { x, y };
}
document.getElementById('s-start').addEventListener('click', sReset);
document.getElementById('s-up').addEventListener('click', () => sSetDir(0,-1));
document.getElementById('s-down').addEventListener('click', () => sSetDir(0,1));
document.getElementById('s-left').addEventListener('click', () => sSetDir(-1,0));
document.getElementById('s-right').addEventListener('click', () => sSetDir(1,0));
sSnake = [{x:10,y:10},{x:9,y:10},{x:8,y:10}]; sFood = {x:5,y:5}; sScore = 0; sDir = {x:1,y:0}; sNextDir = {x:1,y:0}; sDraw();

// ================= GATO (2 jugadores local) =================
let gBoard = Array(9).fill(''), gTurn = 'X', gActive = true;
let gScores = { X: 0, O: 0, E: 0 };
const gCells = document.querySelectorAll('.gato-cell');
const WINS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function gRender() {
  gCells.forEach((c, i) => {
    c.textContent = gBoard[i];
    c.className = 'gato-cell' + (gBoard[i] ? ' ' + gBoard[i].toLowerCase() : '');
  });
  document.getElementById('g-score-x').textContent = gScores.X;
  document.getElementById('g-score-o').textContent = gScores.O;
  document.getElementById('g-score-e').textContent = gScores.E;
}
function gStatus(m) { document.getElementById('g-status').textContent = m; }
gCells.forEach(c => c.addEventListener('click', () => {
  const i = +c.dataset.i;
  if (!gActive || gBoard[i]) return;
  gBoard[i] = gTurn; gRender();
  const win = WINS.find(w => w.every(j => gBoard[j] === gTurn));
  if (win) {
    win.forEach(j => gCells[j].classList.add('win'));
    gScores[gTurn]++; gRender();
    gStatus(`Gana el jugador ${gTurn}`);
    gActive = false; return;
  }
  if (gBoard.every(v => v)) { gScores.E++; gRender(); gStatus('Empate'); gActive = false; return; }
  gTurn = gTurn === 'X' ? 'O' : 'X';
  gStatus(`Turno de: ${gTurn}`);
}));
document.getElementById('g-reset').addEventListener('click', () => {
  gBoard = Array(9).fill(''); gTurn = 'X'; gActive = true; gRender(); gStatus('Turno de: X');
});
document.getElementById('g-clear').addEventListener('click', () => {
  gScores = { X: 0, O: 0, E: 0 };
  gBoard = Array(9).fill(''); gTurn = 'X'; gActive = true; gRender(); gStatus('Turno de: X');
});
gRender();

// ================= PING PONG (2 jugadores local) =================
const pCanvas = document.getElementById('pong-board');
const pCtx = pCanvas.getContext('2d');
const PW = 12, PH = 90, WIN_SCORE = 5;
let p1Y, p2Y, ball, pS1, pS2, pRunning, pPaused, pRaf, pOver;
const keys = {};

function pReset() {
  p1Y = pCanvas.height/2 - PH/2; p2Y = pCanvas.height/2 - PH/2;
  pS1 = 0; pS2 = 0; pOver = false; pPaused = false; pRunning = true;
  pServe(Math.random() > .5 ? 1 : -1);
  pSetMsg('¡A jugar! Primero en 5 gana.');
  cancelAnimationFrame(pRaf);
  pRaf = requestAnimationFrame(pLoop);
}
function pServe(dir) {
  ball = { x: pCanvas.width/2, y: pCanvas.height/2, vx: 5*dir, vy: (Math.random()*4-2) };
}
function pLoop() {
  if (!pRunning || pPaused || pOver) return;
  // paletas
  const spd = 7;
  if (keys['w'] || keys['W']) p1Y -= spd;
  if (keys['s'] || keys['S']) p1Y += spd;
  if (keys['ArrowUp']) p2Y -= spd;
  if (keys['ArrowDown']) p2Y += spd;
  if (pTouch.p1up) p1Y -= spd;
  if (pTouch.p1down) p1Y += spd;
  if (pTouch.p2up) p2Y -= spd;
  if (pTouch.p2down) p2Y += spd;
  p1Y = Math.max(0, Math.min(pCanvas.height - PH, p1Y));
  p2Y = Math.max(0, Math.min(pCanvas.height - PH, p2Y));
  // bola
  ball.x += ball.vx; ball.y += ball.vy;
  if (ball.y < 8 || ball.y > pCanvas.height - 8) ball.vy *= -1;
  // colisión paletas
  if (ball.x < 20 + PW && ball.y > p1Y && ball.y < p1Y + PH && ball.vx < 0) {
    ball.vx *= -1.08;
    ball.vy += (ball.y - (p1Y + PH/2)) * 0.05;
    ball.x = 20 + PW + 1;
  }
  if (ball.x > pCanvas.width - 20 - PW && ball.y > p2Y && ball.y < p2Y + PH && ball.vx > 0) {
    ball.vx *= -1.08;
    ball.vy += (ball.y - (p2Y + PH/2)) * 0.05;
    ball.x = pCanvas.width - 20 - PW - 1;
  }
  // puntos
  if (ball.x < 0) { pS2++; pCheckWin() || pServe(1); }
  if (ball.x > pCanvas.width) { pS1++; pCheckWin() || pServe(-1); }
  pDraw();
  pRaf = requestAnimationFrame(pLoop);
}
function pCheckWin() {
  if (pS1 >= WIN_SCORE) { pOver = true; pRunning = false; pSetMsg('Jugador 1 gana — pulsa Iniciar'); pDraw(); return true; }
  if (pS2 >= WIN_SCORE) { pOver = true; pRunning = false; pSetMsg('Jugador 2 gana — pulsa Iniciar'); pDraw(); return true; }
  return false;
}
function pDraw() {
  pCtx.fillStyle = '#FFFFFF'; pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);
  pCtx.strokeStyle = '#E4E2DA'; pCtx.setLineDash([8, 8]); pCtx.beginPath();
  pCtx.moveTo(pCanvas.width/2, 0); pCtx.lineTo(pCanvas.width/2, pCanvas.height); pCtx.stroke();
  pCtx.setLineDash([]);
  pCtx.fillStyle = '#1C1C1E';
  pCtx.beginPath(); pCtx.roundRect(20, p1Y, PW, PH, 6); pCtx.fill();
  pCtx.beginPath(); pCtx.roundRect(pCanvas.width - 20 - PW, p2Y, PW, PH, 6); pCtx.fill();
  pCtx.beginPath(); pCtx.arc(ball.x, ball.y, 8, 0, Math.PI*2); pCtx.fill();
  pCtx.fillStyle = '#B9B7AE'; pCtx.font = '600 40px Inter, sans-serif'; pCtx.textAlign = 'center';
  pCtx.fillText(pS1, pCanvas.width/2 - 60, 55);
  pCtx.fillText(pS2, pCanvas.width/2 + 60, 55);
}
function pSetMsg(m) { document.getElementById('p-msg').textContent = m; }
function pStop() { pRunning = false; cancelAnimationFrame(pRaf); }

const pTouch = { p1up: false, p1down: false, p2up: false, p2down: false };
function bindHold(id, key) {
  const el = document.getElementById(id);
  const on = e => { e.preventDefault(); pTouch[key] = true; };
  const off = e => { e.preventDefault(); pTouch[key] = false; };
  el.addEventListener('mousedown', on); el.addEventListener('mouseup', off); el.addEventListener('mouseleave', off);
  el.addEventListener('touchstart', on, {passive:false}); el.addEventListener('touchend', off);
}
bindHold('p1-up', 'p1up'); bindHold('p1-down', 'p1down');
bindHold('p2-up', 'p2up'); bindHold('p2-down', 'p2down');

document.getElementById('p-start').addEventListener('click', pReset);
document.getElementById('p-pause').addEventListener('click', () => {
  if (!pRunning || pOver) return;
  pPaused = !pPaused;
  pSetMsg(pPaused ? 'En pausa' : '¡A jugar!');
  if (!pPaused) pRaf = requestAnimationFrame(pLoop);
});
// estado inicial pong
p1Y = 180; p2Y = 180; ball = {x:400,y:225,vx:5,vy:2}; pS1 = 0; pS2 = 0; pDraw();

// ================= TECLADO GLOBAL =================
document.addEventListener('keydown', e => {
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
  if (activeGame === 'pong') keys[e.key] = true;

  if (activeGame === 'tetris') {
    if (e.key === 'ArrowLeft') tMove(-1);
    else if (e.key === 'ArrowRight') tMove(1);
    else if (e.key === 'ArrowDown') tDown();
    else if (e.key === 'ArrowUp') tRotate();
    else if (e.key === ' ') tHardDrop();
    else if (e.key === 'p' || e.key === 'P') document.getElementById('t-pause').click();
  }
  if (activeGame === 'snake') {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') sSetDir(0,-1);
    else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') sSetDir(0,1);
    else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') sSetDir(-1,0);
    else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') sSetDir(1,0);
  }
});
document.addEventListener('keyup', e => { keys[e.key] = false; });