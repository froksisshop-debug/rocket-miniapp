'use strict';

/* =========================================================================
   ⚙️ КОНФИГУРАЦИЯ
   apiBase — адрес бэкенда rocket_backend.py (FastAPI).
   Пустая строка '' = текущий хост страницы (для локального запуска).
   При заливке на GitHub Pages сюда пишется адрес бэкенда.
   ========================================================================= */
const API_BASE = 'https://ngrok-free.dev';

/* ============================ Telegram WebApp ============================ */
const TG = (window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp : null;
window.TG = TG || { close() {}, ready() {}, expand() {}, initData: '', themeParams: {} };

function applyTheme() {
  if (!TG) return;
  const tp = TG.themeParams || {};
  const root = document.documentElement.style;
  const set = (cssVar, value) => {
    if (value && typeof value === 'string') root.setProperty(cssVar, value);
  };
  set('--bg', tp.bg_color);
  set('--card', tp.secondary_bg_color);
  set('--border', tp.section_separator_color || tp.secondary_text_color);
  set('--text', tp.text_color);
  set('--dim', tp.hint_color);
  set('--accent', tp.accent_text_color || tp.button_color);
}

function initTelegram() {
  if (!TG) return;
  try {
    TG.ready();
    TG.expand();
    if (typeof TG.disableVerticalSwipes === 'function') TG.disableVerticalSwipes();
    if (typeof TG.setHeaderColor === 'function') TG.setHeaderColor('secondary_bg_color');
    if (typeof TG.setBackgroundColor === 'function') TG.setBackgroundColor('secondary_bg_color');
    applyTheme();
    if (typeof TG.onEvent === 'function') TG.onEvent('themeChanged', applyTheme);
    if (typeof TG.onEvent === 'function') TG.onEvent('viewportChanged', () => resizeCanvas());
  } catch (e) {
    /* ignore — вне Telegram */
  }
}

/* ================================= Game ================================= */
const BASE_SKINS = [
  { id: 'default', emoji: '🚀', name: 'Classic' },
  { id: 'fire', emoji: '🔥', name: 'Fire' },
  { id: 'rocket', emoji: '🚀', name: 'Rocket' },
  { id: 'star', emoji: '⭐', name: 'Star' },
  { id: 'alien', emoji: '👽', name: 'Alien' },
  { id: 'ghost', emoji: '👻', name: 'Ghost' },
  { id: 'ufo', emoji: '🛸', name: 'UFO' },
  { id: 'saturn', emoji: '🪐', name: 'Saturn' }
];
let SKINS = BASE_SKINS.slice();

let state = 'idle'; // idle | flying | crashed | cashed
let gameData = null;
let balance = 0;
let selectedSkin = SKINS[0];
let myHistory = [];
let flightOrigin = 0;   // performance.now() в момент started_at
let crashPoint = 0;
let currentMult = 1.0;
let growthRate = 0.065;
let pollTimer = null;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const multDisplay = document.getElementById('mult-display');
const multLabel = document.getElementById('mult-label');
const actionBtn = document.getElementById('action-btn');
const betInput = document.getElementById('bet-input');
const balanceEl = document.getElementById('balance');
const histDots = document.getElementById('history-dots');
const recentList = document.getElementById('recent-list');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const minBetText = document.getElementById('min-bet-text');
const skinBar = document.getElementById('skin-bar');
const rocketOverlay = document.getElementById('rocket-overlay');

/* ================================= API ================================= */
function apiOrigin() {
  const base = (API_BASE || '').trim().replace(/\/+$/, '');
  return base || window.location.origin;
}

async function api(path, opts = {}) {
  const headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
  const initData = (TG && TG.initData) || '';
  if (initData) headers['X-Telegram-Init-Data'] = initData;
  const res = await fetch(apiOrigin() + path, Object.assign({}, opts, { headers: headers }));
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

async function loadMe() {
  try {
    const data = await api('/api/rocket/me');
    balance = data.user.stars;
    growthRate = data.growth_rate || 0.065;
    balanceEl.textContent = balance + ' ⭐';
    minBetText.textContent = `Min: ${data.limits.min_bet} ⭐ | Max: ${data.limits.max_bet} ⭐`;
    betInput.min = data.limits.min_bet;
    betInput.max = data.limits.max_bet;
    myHistory = (data.history || []).map(h => ({
      mult: h.mult,
      won: h.status === 'cashed',
      cashout: h.cashout_mult
    }));
    renderHistory();
    if (data.game && data.game.status === 'active') {
      resumeGame(data.game);
    } else {
      setStatus(true, 'Connected');
    }
  } catch (e) {
    setStatus(false, 'Offline');
  }
}

function setStatus(on, text) {
  statusDot.className = 'dot ' + (on ? 'on' : 'off');
  statusText.textContent = text;
}

/* ================================ SKINS ================================ */
function renderSkins() {
  skinBar.innerHTML = '';
  SKINS.forEach(s => {
    const btn = document.createElement('div');
    btn.className = 'skin-btn' + (s.id === selectedSkin.id ? ' active' : '');
    if (s.img) {
      const img = document.createElement('img');
      img.src = s.thumb || s.img;
      img.alt = s.name;
      btn.appendChild(img);
    } else {
      btn.textContent = s.emoji;
    }
    btn.title = s.name;
    btn.onclick = () => {
      selectedSkin = s;
      try { localStorage.setItem('rocket_skin', s.id); } catch (e) { /* ignore */ }
      renderSkins();
    };
    skinBar.appendChild(btn);
  });
}

async function loadSkins() {
  let saved = null;
  try { saved = localStorage.getItem('rocket_skin'); } catch (e) { /* ignore */ }
  if (saved) {
    const found = SKINS.find(s => s.id === saved);
    if (found) {
      selectedSkin = found;
      renderSkins();
    }
  }
  try {
    const data = await api('/api/rocket/skins');
    if (!data || !data.ok || !Array.isArray(data.skins) || !data.skins.length) return;
    const server = data.skins.filter(k => k && k.url).map(k => ({
      id: 'srv_' + k.id,
      name: k.name || 'Custom',
      emoji: '🚀',
      img: apiOrigin() + k.url,
      thumb: apiOrigin() + (k.poster || k.url)
    }));
    if (!server.length) return;
    SKINS = server.concat(BASE_SKINS);
    selectedSkin =
      SKINS.find(s => s.id === (selectedSkin && selectedSkin.id)) ||
      SKINS.find(s => s.id === saved) ||
      SKINS[0];
    renderSkins();
  } catch (e) {
    /* бэкенд недоступен — остаются встроенные emoji-скины */
  }
}

function showRocketSprite(x, y, size) {
  if (!rocketOverlay) return;
  const src = selectedSkin.img;
  if (rocketOverlay.getAttribute('src') !== src) rocketOverlay.src = src;
  rocketOverlay.style.display = 'block';
  rocketOverlay.style.width = size + 'px';
  rocketOverlay.style.height = size + 'px';
  rocketOverlay.style.transform = `translate(${x - size / 2}px, ${y - size / 2}px)`;
}

function hideRocketSprite() {
  if (rocketOverlay && rocketOverlay.style.display !== 'none') rocketOverlay.style.display = 'none';
}

/* ================================ ENGINE =============================== */
function resizeCanvas() {
  const box = canvas.parentElement;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = box.clientWidth * dpr;
  canvas.height = 320 * dpr;
  canvas.style.height = '320px';
}

function setBet(val) { betInput.value = val; }

async function onAction() {
  if (state === 'idle') {
    const bet = parseInt(betInput.value, 10);
    if (!bet || bet < 1) return;
    await startGame(bet);
  } else if (state === 'flying') {
    await cashout();
  }
}

async function startGame(bet) {
  setBtnState('loading');
  try {
    const data = await api('/api/rocket/start', {
      method: 'POST',
      body: JSON.stringify({ bet: bet })
    });
    if (data.need_invoice) {
      showTopup(data.shortfall, data.suggested_stars, data.balance);
      setBtnState('idle');
      return;
    }
    if (data.ok) {
      gameData = data.game;
      balance = data.balance;
      balanceEl.textContent = balance + ' ⭐';
      beginFlight(gameData);
      setStatus(true, 'Connected');
    } else {
      setBtnState('idle');
    }
  } catch (e) {
    setStatus(false, 'Error');
    setBtnState('idle');
  }
}

function resumeGame(game) {
  beginFlight(game);
}

function beginFlight(game) {
  state = 'flying';
  gameData = game;
  const elapsedSec = Math.max(0, (game.server_now || 0) - (game.started_at || 0));
  flightOrigin = performance.now() - elapsedSec * 1000;
  crashPoint = game.crash_point || 0;
  setBtnState('cashout');
  multLabel.textContent = 'Cash out before crash!';
  setStatus(true, 'Connected');
  startPolling();
}

async function cashout() {
  if (!gameData) return;
  setBtnState('loading');
  try {
    const data = await api('/api/rocket/cashout', {
      method: 'POST',
      body: JSON.stringify({ game_id: gameData.game_id })
    });
    if (data.ok) {
      state = 'cashed';
      stopPolling();
      balance = data.balance;
      balanceEl.textContent = balance + ' ⭐';
      const won = data.game.payout;
      const mult = data.game.cashout_mult;
      crashPoint = data.game.crash_point || crashPoint;
      myHistory.unshift({ mult: mult, won: true, cashout: mult });
      renderHistory();
      multLabel.textContent = `Cashed out at ${mult}x — +${won} ⭐`;
      setBtnState('idle');
      setTimeout(() => resetState(), 2500);
    } else if (data.reason === 'crashed') {
      onCrashed(data.game && data.game.crash_point);
      loadMe();
    } else {
      setBtnState('cashout');
    }
  } catch (e) {
    setBtnState('cashout');
  }
}

function onCrashed(point) {
  state = 'crashed';
  stopPolling();
  if (point) crashPoint = point;
  const shown = crashPoint || currentMult;
  myHistory.unshift({ mult: shown, won: false });
  renderHistory();
  multDisplay.textContent = shown.toFixed(2) + 'x';
  multDisplay.style.color = '#f85149';
  multLabel.textContent = `Crashed at ${shown}x`;
  setBtnState('idle');
  setTimeout(() => resetState(), 2500);
}

function startPolling() {
  stopPolling();
  pollTimer = setInterval(pollGame, 900);
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

async function pollGame() {
  if (state !== 'flying' || !gameData) return;
  try {
    const data = await api('/api/rocket/state?game_id=' + encodeURIComponent(gameData.game_id));
    if (state !== 'flying') return;
    if (!data.ok || !data.game) return;
    const g = data.game;
    if (g.crash_point) crashPoint = g.crash_point;
    if (g.status === 'crashed') {
      onCrashed(g.crash_point);
      loadMe();
    } else if (g.status === 'cashed') {
      state = 'cashed';
      stopPolling();
      myHistory.unshift({ mult: g.cashout_mult, won: true, cashout: g.cashout_mult });
      renderHistory();
      multLabel.textContent = `Cashed out at ${g.cashout_mult}x — +${g.payout} ⭐`;
      setBtnState('idle');
      loadMe();
      setTimeout(() => resetState(), 2500);
    }
  } catch (e) {
    /* тихий повтор */
  }
}

function resetState() {
  state = 'idle';
  gameData = null;
  stopPolling();
  setBtnState('idle');
  multLabel.textContent = 'Place your bet';
}

function setBtnState(s) {
  if (s === 'idle') {
    actionBtn.className = 'btn btn-bet';
    actionBtn.textContent = 'BET';
    actionBtn.disabled = false;
  } else if (s === 'cashout') {
    actionBtn.className = 'btn btn-cashout';
    actionBtn.textContent = '💰 CASHOUT';
    actionBtn.disabled = false;
  } else if (s === 'loading') {
    actionBtn.className = 'btn btn-wait';
    actionBtn.textContent = '...';
    actionBtn.disabled = true;
  }
}

/* ================================ TOPUP ================================ */
function showTopup(shortfall, suggested, currentBalance) {
  const msg = document.getElementById('topup-msg');
  msg.textContent = `You have ${currentBalance} ⭐. You need ${shortfall} more.`;
  document.getElementById('topup-popup').classList.add('show');
  window._suggested = suggested;
}

function closeTopup() {
  document.getElementById('topup-popup').classList.remove('show');
}

async function topupStars() {
  closeTopup();
  const amt = window._suggested || 50;
  try {
    const data = await api('/api/rocket/invoice', {
      method: 'POST',
      body: JSON.stringify({ stars: amt })
    });
    if (!data.invoice_url) {
      setStatus(false, 'Error');
      return;
    }
    if (TG && typeof TG.openInvoice === 'function') {
      TG.openInvoice(data.invoice_url, (status) => {
        if (status === 'paid' || status === 'failed') loadMe();
      });
    } else {
      window.open(data.invoice_url, '_blank');
    }
  } catch (e) {
    setStatus(false, 'Error');
  }
}

/* =============================== HISTORY =============================== */
function renderHistory() {
  histDots.innerHTML = '';
  myHistory.slice(0, 12).forEach(h => {
    const dot = document.createElement('span');
    dot.className = 'dot ' + (h.won ? 'win' : 'lose');
    histDots.appendChild(dot);
  });
  recentList.innerHTML = '';
  myHistory.slice(0, 8).forEach(h => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML =
      `<span class="mult ${h.won ? 'win' : 'lose'}">${h.mult}x</span>` +
      `<span class="bet-info">${h.won ? 'Won' : 'Crashed'}</span>`;
    recentList.appendChild(div);
  });
}

/* ============================== RENDERING ============================== */
function renderLoop(ts) {
  drawCanvas(ts);
  requestAnimationFrame(renderLoop);
}

function drawCanvas(ts) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  // фон (всегда тёмный — игровой экран независим от темы клиента)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#0a0e17');
  bgGrad.addColorStop(1, '#0d1117');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // звёзды
  if (!drawCanvas._stars) {
    drawCanvas._stars = [];
    for (let i = 0; i < 60; i++) {
      drawCanvas._stars.push({
        x: Math.random() * 480,
        y: Math.random() * 320,
        r: Math.random() * 1.5 + 0.3,
        a: Math.random()
      });
    }
  }
  drawCanvas._stars.forEach(s => {
    const flicker = 0.5 + 0.5 * Math.sin(ts * 0.001 + s.a * 10);
    ctx.fillStyle = `rgba(255,255,255,${0.3 + flicker * 0.5})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  });

  if (state === 'flying' || state === 'cashed' || state === 'crashed') {
    const elapsed = Math.max(0, (ts - flightOrigin) / 1000);
    if (state === 'flying') {
      currentMult = Math.exp(growthRate * elapsed);
    }
    const maxMult = Math.max(currentMult, 1.01);
    const progress = Math.log(maxMult) / Math.log(100);
    const clampedProg = Math.min(progress, 1.0);

    // сетка
    ctx.strokeStyle = 'rgba(88,166,255,0.08)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      const gy = h - (h * 0.15) - (h * 0.7 * (i / 4));
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
    }

    // траектория
    const rocketX = 40 + clampedProg * (w - 100);
    const rocketY = h - 30 - clampedProg * (h - 80);
    const prevProg = Math.max(0, clampedProg - 0.02);
    const prevX = 40 + prevProg * (w - 100);
    const prevY = h - 30 - prevProg * (h - 80);

    ctx.strokeStyle = '#58a6ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(rocketX, rocketY);
    ctx.stroke();

    // свечение
    const glowGrad = ctx.createRadialGradient(rocketX, rocketY, 0, rocketX, rocketY, 40);
    glowGrad.addColorStop(0, 'rgba(88,166,255,0.3)');
    glowGrad.addColorStop(1, 'rgba(88,166,255,0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(rocketX, rocketY, 40, 0, Math.PI * 2);
    ctx.fill();

    // ракета
    if (selectedSkin.img) {
      showRocketSprite(rocketX, rocketY, 44);
    } else {
      hideRocketSprite();
      ctx.font = '32px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selectedSkin.emoji, rocketX, rocketY);
    }

    // след
    if (state === 'flying') {
      for (let i = 0; i < 5; i++) {
        const tx = rocketX - 8 + Math.random() * 4;
        const ty = rocketY + 12 + Math.random() * 10;
        ctx.fillStyle = `rgba(255,${150 + Math.random() * 100},0,${0.4 - i * 0.07})`;
        ctx.beginPath();
        ctx.arc(tx, ty, 2 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // множитель
    if (state === 'flying') {
      multDisplay.textContent = currentMult.toFixed(2) + 'x';
      multDisplay.style.color = currentMult >= 2 ? '#3fb950' : currentMult >= 1.5 ? '#f0c040' : '#fff';
    } else if (state === 'crashed') {
      multDisplay.textContent = (crashPoint || currentMult).toFixed(2) + 'x';
      multDisplay.style.color = '#f85149';
    } else if (state === 'cashed') {
      multDisplay.style.color = '#3fb950';
    }
  } else {
    // idle
    if (selectedSkin.img) {
      showRocketSprite(w / 2, h - 60, 56);
    } else {
      hideRocketSprite();
      ctx.font = '48px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selectedSkin.emoji, w / 2, h - 60);
    }
    multDisplay.textContent = '1.00x';
    multDisplay.style.color = '#fff';
  }

  ctx.restore();
}

/* ================================= START ================================ */
function init() {
  initTelegram();
  renderSkins();
  loadSkins();
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  loadMe();
  requestAnimationFrame(renderLoop);
}

init();
