'use strict';

/* =========================================================================
   ⚙️ КОНФИГУРАЦИЯ
   API_BASE — адрес бэкенда rocket_backend.py (FastAPI).
   Пустая строка '' = текущий хост страницы (для локального запуска).
   При заливке на GitHub Pages сюда пишется адрес бэкенда.
   ========================================================================= */
const API_BASE = 'https://ngrok-free.dev';

const MIN_TOPUP = 1;
const MAX_TOPUP = 1000000;

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

/* ================================= i18n ================================= */
const I18N = {
  ru: {
    adminBtn: 'Админка',
    placeBet: 'Сделай ставку',
    cashHint: 'Забери до краша!',
    betBtn: 'СТАВКА',
    cashoutBtn: 'ЗАБРАТЬ',
    waitBtn: '...',
    betPlaceholder: 'Ставка (⭐)',
    connected: 'На связи',
    offline: 'Не в сети',
    error: 'Ошибка',
    limits: 'Мин: {min} ⭐ | Макс: {max} ⭐',
    cashedOut: 'Выведено {mult}x — +{won} ⭐',
    crashedAt: 'Краш {mult}x',
    topupTitle: 'Пополнение баланса',
    topupMsg: 'Выбери сумму или введи свою (от 1 до 1 000 000 ⭐).',
    topupShort: 'У тебя {bal} ⭐. Не хватает {need} ⭐ — введи сумму и оплати.',
    topupPlaceholder: 'Своя сумма: 1 – 1 000 000',
    topupPay: 'Оплатить',
    topupRange: 'Введите число от 1 до 1 000 000',
    cancel: 'Отмена',
    langTitle: 'Язык',
    noAccess: 'Нет доступа',
    refresh: 'Обновить',
    back: 'Назад',
    overview: 'Обзор',
    settings: 'Настройки',
    players: 'Игроки',
    skins: 'Скины',
    admins: 'Админы приложения',
    stGames: 'Игр сыграно',
    stCashes: 'Кэш-аутов',
    stCrashes: 'Крашей',
    stWagered: 'Сделано ставок',
    stPaid: 'Выплачено',
    stNet: 'Нетто (доход)',
    stRtp: 'RTP всего',
    stLiveRtp: 'RTP за окно',
    stUsers: 'Игроков',
    stBanned: 'Банов',
    stActive: 'Активных игр',
    stMaint: 'Обслуживание',
    on: 'вкл',
    off: 'выкл',
    houseEdge: 'Края дома',
    minBet: 'Мин. ставка',
    maxBet: 'Макс. ставка',
    targetRtp: 'Целевой RTP',
    rtpWindow: 'Окно RTP (игр)',
    crashFloor: 'Пол мгнов. краша',
    crashCeil: 'Потолок мгнов. краша',
    tgMaintenance: 'Режим обслуживания',
    tgSmartRtp: 'Умный RTP',
    tgHourlyShave: 'Почасовой шейв',
    tgHardShave: 'Периодический шейв',
    tgWinnerShave: 'Шейв победителей',
    save: 'Сохранить',
    saved: 'Сохранено',
    search: 'Поиск (id, @username)',
    searchBtn: 'Найти',
    pBalance: 'Баланс',
    pGames: 'Игр',
    pWagered: 'Ставок',
    pWon: 'Выплачено',
    ban: 'Забанить',
    unban: 'Разбанить',
    forceCrash: 'Следующий краш принудительно',
    clearForce: 'Отменить принуд. краш',
    credit: 'Выдать ⭐',
    debit: 'Списать ⭐',
    amountPh: 'Кол-во ⭐',
    empty: 'Пусто',
    prev: '◀',
    next: '▶',
    ofTotal: 'Всего: {n}',
    skinAddHint: 'Скины добавляются в боте: команда /rskin (видео/GIF/фото).',
    skinOn: 'Вкл',
    skinOff: 'Выкл',
    delete: 'Удалить',
    noSkins: 'Скинов пока нет',
    confirmDelete: 'Удалить скин?',
    adminIdPh: 'ID или @username',
    grant: 'Выдать админку',
    revoke: 'Снять',
    mainOnly: 'Выдать/снять админку может только главный админ.',
    youAreMain: 'Ты — главный админ.',
    done: 'Готово',
    errLoad: 'Ошибка загрузки',
    player: 'Игрок'
  },
  uk: {
    adminBtn: 'Адмінка',
    placeBet: 'Зроби ставку',
    cashHint: 'Забери до крашу!',
    betBtn: 'СТАВКА',
    cashoutBtn: 'ЗАБРАТИ',
    waitBtn: '...',
    betPlaceholder: 'Ставка (⭐)',
    connected: 'На звʼязку',
    offline: 'Не в мережі',
    error: 'Помилка',
    limits: 'Мін: {min} ⭐ | Макс: {max} ⭐',
    cashedOut: 'Виведено {mult}x — +{won} ⭐',
    crashedAt: 'Краш {mult}x',
    topupTitle: 'Поповнення балансу',
    topupMsg: 'Обери суму або введи свою (від 1 до 1 000 000 ⭐).',
    topupShort: 'У тебе {bal} ⭐. Бракує {need} ⭐ — введи суму та оплати.',
    topupPlaceholder: 'Своя сума: 1 – 1 000 000',
    topupPay: 'Оплатити',
    topupRange: 'Введи число від 1 до 1 000 000',
    cancel: 'Скасувати',
    langTitle: 'Мова',
    noAccess: 'Немає доступу',
    refresh: 'Оновити',
    back: 'Назад',
    overview: 'Огляд',
    settings: 'Налаштування',
    players: 'Гравці',
    skins: 'Скіни',
    admins: 'Адміни застосунку',
    stGames: 'Ігор зіграно',
    stCashes: 'Кеш-аутів',
    stCrashes: 'Крашів',
    stWagered: 'Зроблено ставок',
    stPaid: 'Виплачено',
    stNet: 'Нетто (дохід)',
    stRtp: 'RTP всього',
    stLiveRtp: 'RTP за вікном',
    stUsers: 'Гравців',
    stBanned: 'Банів',
    stActive: 'Активних ігор',
    stMaint: 'Обслуговування',
    on: 'увімк',
    off: 'вимк',
    houseEdge: 'Край дому',
    minBet: 'Мін. ставка',
    maxBet: 'Макс. ставка',
    targetRtp: 'Цільовий RTP',
    rtpWindow: 'Вікно RTP (ігор)',
    crashFloor: 'Підлога миттєвого крашу',
    crashCeil: 'Стеля миттєвого крашу',
    tgMaintenance: 'Режим обслуговування',
    tgSmartRtp: 'Розумний RTP',
    tgHourlyShave: 'Погодинний шейв',
    tgHardShave: 'Періодичний шейв',
    tgWinnerShave: 'Шейв переможців',
    save: 'Зберегти',
    saved: 'Збережено',
    search: 'Пошук (id, @username)',
    searchBtn: 'Знайти',
    pBalance: 'Баланс',
    pGames: 'Ігор',
    pWagered: 'Ставок',
    pWon: 'Виплачено',
    ban: 'Забанити',
    unban: 'Розбанити',
    forceCrash: 'Наступний краш примусово',
    clearForce: 'Скасувати примус. краш',
    credit: 'Видати ⭐',
    debit: 'Списати ⭐',
    amountPh: 'Кількість ⭐',
    empty: 'Порожньо',
    prev: '◀',
    next: '▶',
    ofTotal: 'Всього: {n}',
    skinAddHint: 'Скіни додаються в боті: команда /rskin (відео/GIF/фото).',
    skinOn: 'Увімк',
    skinOff: 'Вимк',
    delete: 'Видалити',
    noSkins: 'Скінів поки немає',
    confirmDelete: 'Видалити скін?',
    adminIdPh: 'ID або @username',
    grant: 'Дати адмінку',
    revoke: 'Зняти',
    mainOnly: 'Дати/зняти адмінку може лише головний адмін.',
    youAreMain: 'Ти — головний адмін.',
    done: 'Готово',
    errLoad: 'Помилка завантаження',
    player: 'Гравець'
  },
  en: {
    adminBtn: 'Admin',
    placeBet: 'Place your bet',
    cashHint: 'Cash out before crash!',
    betBtn: 'BET',
    cashoutBtn: 'CASHOUT',
    waitBtn: '...',
    betPlaceholder: 'Bet (⭐)',
    connected: 'Connected',
    offline: 'Offline',
    error: 'Error',
    limits: 'Min: {min} ⭐ | Max: {max} ⭐',
    cashedOut: 'Cashed out at {mult}x — +{won} ⭐',
    crashedAt: 'Crashed at {mult}x',
    topupTitle: 'Top up balance',
    topupMsg: 'Pick an amount or type your own (1 – 1,000,000 ⭐).',
    topupShort: 'You have {bal} ⭐. You need {need} more — enter an amount and pay.',
    topupPlaceholder: 'Custom amount: 1 – 1,000,000',
    topupPay: 'Pay',
    topupRange: 'Enter a number from 1 to 1,000,000',
    cancel: 'Cancel',
    langTitle: 'Language',
    noAccess: 'No access',
    refresh: 'Refresh',
    back: 'Back',
    overview: 'Overview',
    settings: 'Settings',
    players: 'Players',
    skins: 'Skins',
    admins: 'App admins',
    stGames: 'Games played',
    stCashes: 'Cashouts',
    stCrashes: 'Crashes',
    stWagered: 'Wagered',
    stPaid: 'Paid out',
    stNet: 'Net profit',
    stRtp: 'Overall RTP',
    stLiveRtp: 'RTP window',
    stUsers: 'Players',
    stBanned: 'Banned',
    stActive: 'Active games',
    stMaint: 'Maintenance',
    on: 'on',
    off: 'off',
    houseEdge: 'House edge',
    minBet: 'Min bet',
    maxBet: 'Max bet',
    targetRtp: 'Target RTP',
    rtpWindow: 'RTP window (games)',
    crashFloor: 'Instant crash floor',
    crashCeil: 'Instant crash ceiling',
    tgMaintenance: 'Maintenance mode',
    tgSmartRtp: 'Smart RTP',
    tgHourlyShave: 'Hourly shave',
    tgHardShave: 'Periodic shave',
    tgWinnerShave: 'Winner shave',
    save: 'Save',
    saved: 'Saved',
    search: 'Search (id, @username)',
    searchBtn: 'Find',
    pBalance: 'Balance',
    pGames: 'Games',
    pWagered: 'Wagered',
    pWon: 'Paid out',
    ban: 'Ban',
    unban: 'Unban',
    forceCrash: 'Force next crash',
    clearForce: 'Clear forced crash',
    credit: 'Credit ⭐',
    debit: 'Debit ⭐',
    amountPh: 'Amount ⭐',
    empty: 'Empty',
    prev: '◀',
    next: '▶',
    ofTotal: 'Total: {n}',
    skinAddHint: 'Skins are added in the bot: /rskin (video/GIF/photo).',
    skinOn: 'On',
    skinOff: 'Off',
    delete: 'Delete',
    noSkins: 'No skins yet',
    confirmDelete: 'Delete skin?',
    adminIdPh: 'ID or @username',
    grant: 'Grant admin',
    revoke: 'Revoke',
    mainOnly: 'Only the main admin can grant or revoke.',
    youAreMain: 'You are the main admin.',
    done: 'Done',
    errLoad: 'Load failed',
    player: 'Player'
  }
};

let lang = 'ru';
try { lang = localStorage.getItem('rocket_lang') || 'ru'; } catch (e) { lang = 'ru'; }
if (!I18N[lang]) lang = 'ru';
let langFromProfile = false;

function t(key, vars) {
  let s = (I18N[lang] && I18N[lang][key]) || I18N.ru[key] || key;
  if (vars) {
    Object.keys(vars).forEach(k => { s = s.split('{' + k + '}').join(String(vars[k])); });
  }
  return s;
}

function setLang(l) {
  if (!I18N[l]) l = 'ru';
  lang = l;
  langFromProfile = true;
  try { localStorage.setItem('rocket_lang', l); } catch (e) { /* ignore */ }
  applyI18n();
  closeLang();
}

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  const langBtn = document.getElementById('btn-lang');
  if (langBtn) langBtn.textContent = lang.toUpperCase();
  document.documentElement.lang = lang;
  setBtnState(btnMode);
  setStatus(statusOn, statusKey);
  setMultLabel(labelKey, labelVars);
  balanceEl.textContent = balance + ' ⭐';
  minBetText.textContent = t('limits', { min: limits.min_bet, max: limits.max_bet });
  if (document.getElementById('admin-overlay').classList.contains('show')) {
    renderAdmin(adminSection, adminArg);
  }
}

function openLang() { document.getElementById('lang-popup').classList.add('show'); }
function closeLang() { document.getElementById('lang-popup').classList.remove('show'); }

/* ================================= Game ================================= */
/* Нейтральный скин-корабль (SVG, без эмодзи и огня) — фолбэк, если скинов нет */
const DEFAULT_SKIN = {
  id: 'default',
  name: 'Rocket',
  img: 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
    '<path d="M32 5c8 8 12 18 12 29v7l8 10v5l-10-3c-2 3-6 5-10 5s-8-2-10-5l-10 3v-5l8-10v-7C20 23 24 13 32 5z" fill="#8b949e"/>' +
    '<path d="M32 5c8 8 12 18 12 29v7h-12V5z" fill="#e6edf3"/>' +
    '<circle cx="32" cy="24" r="6" fill="#58a6ff" stroke="#1f6feb" stroke-width="2"/>' +
    '</svg>'
  )
};
let SKINS = [DEFAULT_SKIN];
let selectedSkin = DEFAULT_SKIN;

let state = 'idle'; // idle | flying | crashed | cashed
let gameData = null;
let balance = 0;
let myHistory = [];
let flightOrigin = 0;   // performance.now() в момент started_at
let crashPoint = 0;
let currentMult = 1.0;
let growthRate = 0.065;
let pollTimer = null;
let isAdmin = false;
let isMainAdmin = false;
let limits = { min_bet: 1, max_bet: 1000000 };

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const multDisplay = document.getElementById('mult-display');
const multLabel = document.getElementById('mult-label');
const actionBtn = document.getElementById('action-btn');
const betInput = document.getElementById('bet-input');
const balanceEl = document.getElementById('balance');
const histDots = document.getElementById('history-dots');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const minBetText = document.getElementById('min-bet-text');
const skinBar = document.getElementById('skin-bar');
const rocketOverlay = document.getElementById('rocket-overlay');

let btnMode = 'idle';
let statusOn = true;
let statusKey = 'connected';
let labelKey = 'placeBet';
let labelVars = {};

function setMultLabel(key, vars) {
  labelKey = key;
  labelVars = vars || {};
  multLabel.textContent = t(key, labelVars);
}

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
  let data = null;
  try { data = await res.json(); } catch (e) { data = null; }
  if (!res.ok) {
    const err = new Error((data && data.detail) || ('HTTP ' + res.status));
    err.status = res.status;
    throw err;
  }
  return data;
}

async function loadMe() {
  try {
    const data = await api('/api/rocket/me');
    balance = data.user.stars;
    growthRate = data.growth_rate || 0.065;
    balanceEl.textContent = balance + ' ⭐';
    limits = data.limits || limits;
    minBetText.textContent = t('limits', { min: limits.min_bet, max: limits.max_bet });
    betInput.min = limits.min_bet;
    betInput.max = limits.max_bet;
    myHistory = (data.history || []).map(h => ({
      mult: h.mult,
      won: h.status === 'cashed',
      cashout: h.cashout_mult
    }));
    renderHistory();
    isAdmin = !!data.is_admin;
    isMainAdmin = !!data.is_main;
    document.getElementById('btn-admin').classList.toggle('hidden', !isAdmin);
    if (!langFromProfile && data.lang && I18N[data.lang]) {
      lang = data.lang;
      applyI18n();
    }
    if (data.game && data.game.status === 'active') {
      resumeGame(data.game);
    } else {
      setStatus(true, 'connected');
    }
  } catch (e) {
    setStatus(false, 'offline');
  }
}

function setStatus(on, key) {
  statusOn = on;
  statusKey = key;
  statusDot.className = 'dot ' + (on ? 'on' : 'off');
  statusText.textContent = t(key);
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
      btn.textContent = (s.name || '?').slice(0, 1).toUpperCase();
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
  try {
    const data = await api('/api/rocket/skins');
    const server = (data && data.ok && Array.isArray(data.skins))
      ? data.skins.filter(k => k && k.url).map(k => ({
          id: 'srv_' + k.id,
          name: k.name || 'Custom',
          img: apiOrigin() + k.url,
          thumb: apiOrigin() + (k.poster || k.url)
        }))
      : [];
    SKINS = server.length ? server : [DEFAULT_SKIN];
  } catch (e) {
    SKINS = [DEFAULT_SKIN];
  }
  selectedSkin = SKINS.find(s => s.id === saved) || SKINS[0];
  renderSkins();
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
      setStatus(true, 'connected');
    } else {
      setBtnState('idle');
    }
  } catch (e) {
    setStatus(false, 'error');
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
  setMultLabel('cashHint');
  setStatus(true, 'connected');
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
      setMultLabel('cashedOut', { mult: mult, won: won });
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
  setMultLabel('crashedAt', { mult: shown.toFixed(2) });
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
      setMultLabel('cashedOut', { mult: g.cashout_mult, won: g.payout });
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
  setMultLabel('placeBet');
}

function setBtnState(s) {
  btnMode = s;
  if (s === 'idle') {
    actionBtn.className = 'btn btn-bet';
    actionBtn.textContent = t('betBtn');
    actionBtn.disabled = false;
  } else if (s === 'cashout') {
    actionBtn.className = 'btn btn-cashout';
    actionBtn.textContent = t('cashoutBtn');
    actionBtn.disabled = false;
  } else if (s === 'loading') {
    actionBtn.className = 'btn btn-wait';
    actionBtn.textContent = t('waitBtn');
    actionBtn.disabled = true;
  }
}

/* ================================ TOPUP ================================ */
function openTopup(shortfall, suggested, currentBalance) {
  const msg = document.getElementById('topup-msg');
  if (typeof shortfall === 'number' && typeof currentBalance === 'number') {
    msg.textContent = t('topupShort', { bal: currentBalance, need: shortfall });
  } else {
    msg.textContent = t('topupMsg');
  }
  document.getElementById('topup-input').value = suggested || '';
  document.getElementById('topup-popup').classList.add('show');
}

function showTopup(shortfall, suggested, currentBalance) {
  openTopup(shortfall, suggested, currentBalance);
}

function closeTopup() {
  document.getElementById('topup-popup').classList.remove('show');
}

function setTopup(v) {
  document.getElementById('topup-input').value = v;
}

async function topupStars() {
  const amt = parseInt(document.getElementById('topup-input').value, 10);
  if (!amt || amt < MIN_TOPUP || amt > MAX_TOPUP) {
    document.getElementById('topup-msg').textContent = t('topupRange');
    return;
  }
  closeTopup();
  try {
    const data = await api('/api/rocket/invoice', {
      method: 'POST',
      body: JSON.stringify({ stars: amt })
    });
    if (!data.invoice_url) {
      setStatus(false, 'error');
      return;
    }
    if (TG && typeof TG.openInvoice === 'function') {
      TG.openInvoice(data.invoice_url, (status) => {
        if (status === 'paid' || status === 'failed' || status === 'cancelled') loadMe();
      });
    } else {
      window.open(data.invoice_url, '_blank');
    }
  } catch (e) {
    setStatus(false, 'error');
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
}

/* ================================ ADMIN ================================ */
let adminSection = 'home';
let adminArg = null;
let adminStack = [];

const SETTING_FIELDS = [
  ['house_edge', 'houseEdge', 'float'],
  ['min_bet', 'minBet', 'int'],
  ['max_bet', 'maxBet', 'int'],
  ['target_rtp', 'targetRtp', 'float'],
  ['rtp_window', 'rtpWindow', 'int'],
  ['instant_crash_floor', 'crashFloor', 'float'],
  ['instant_crash_ceil', 'crashCeil', 'float']
];
const SETTING_TOGGLES = [
  ['maintenance', 'tgMaintenance'],
  ['smart_rtp_enabled', 'tgSmartRtp'],
  ['hourly_shave_enabled', 'tgHourlyShave'],
  ['hard_shave_enabled', 'tgHardShave'],
  ['winner_shave_enabled', 'tgWinnerShave']
];

function esc(s) {
  let out = String(s == null ? '' : s);
  out = out.split('&').join('&amp;');
  out = out.split('<').join('&lt;');
  out = out.split('>').join('&gt;');
  out = out.split('"').join('&quot;');
  out = out.split("'").join('&#39;');
  return out;
}

function openAdmin() {
  if (!isAdmin) return;
  adminStack = [];
  adminSection = 'home';
  adminArg = null;
  document.getElementById('admin-overlay').classList.add('show');
  renderAdmin('home');
}

function closeAdmin() {
  document.getElementById('admin-overlay').classList.remove('show');
}

function adminBack() {
  const prev = adminStack.pop();
  if (!prev) {
    closeAdmin();
    return;
  }
  adminSection = prev.section;
  adminArg = prev.arg;
  renderAdmin(prev.section, prev.arg);
}

async function adminNav(section, arg) {
  adminStack.push({ section: adminSection, arg: adminArg });
  adminSection = section;
  adminArg = arg;
  await renderAdmin(section, arg);
}

function adminTitle(section) {
  const map = {
    home: 'adminBtn', overview: 'overview', settings: 'settings',
    players: 'players', player: 'player', skins: 'skins', admins: 'admins'
  };
  return t(map[section] || 'adminBtn');
}

async function renderAdmin(section, arg) {
  adminSection = section;
  adminArg = arg;
  document.getElementById('admin-title').textContent = adminTitle(section);
  const body = document.getElementById('admin-body');
  body.innerHTML = '<div class="adm-row">' + esc(t('refresh')) + '…</div>';
  try {
    if (section === 'home') return renderAdminHome(body);
    if (section === 'overview') return await renderAdminOverview(body);
    if (section === 'settings') return await renderAdminSettings(body);
    if (section === 'players') return await renderAdminPlayers(body, arg || {});
    if (section === 'player') return await renderAdminPlayer(body, arg);
    if (section === 'skins') return await renderAdminSkins(body);
    if (section === 'admins') return await renderAdminAdmins(body);
    renderAdminHome(body);
  } catch (e) {
    body.innerHTML = '<div class="adm-error">❌ ' + esc(e.message || t('errLoad')) + '</div>' +
      '<button type="button" class="adm-btn" onclick="renderAdmin(adminSection, adminArg)">' + esc(t('refresh')) + '</button>';
  }
}

function renderAdminHome(body) {
  const items = [
    ['overview', 'overview'],
    ['settings', 'settings'],
    ['players', 'players'],
    ['skins', 'skins'],
    ['admins', 'admins']
  ];
  body.innerHTML = '';
  items.forEach(([sec, key]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'adm-btn adm-menu';
    b.textContent = t(key);
    b.onclick = () => adminNav(sec);
    body.appendChild(b);
  });
  if (isMainAdmin) {
    const note = document.createElement('div');
    note.className = 'adm-note';
    note.textContent = t('youAreMain');
    body.appendChild(note);
  }
}

function fmtRtp(v) {
  return (v == null) ? '—' : (v * 100).toFixed(1) + '%';
}

async function renderAdminOverview(body) {
  const d = await api('/api/admin/overview');
  const s = d.stats || {};
  const rows = [
    ['stGames', s.games],
    ['stCashes', s.cashes],
    ['stCrashes', s.crashes],
    ['stWagered', s.wagered + ' ⭐'],
    ['stPaid', s.paid + ' ⭐'],
    ['stNet', s.net_profit + ' ⭐'],
    ['stRtp', fmtRtp(s.rtp)],
    ['stLiveRtp', fmtRtp(s.live_rtp)],
    ['stUsers', s.users],
    ['stBanned', s.banned],
    ['stActive', s.active_games],
    ['stMaint', s.maintenance ? t('on') : t('off')]
  ];
  body.innerHTML = rows.map(([k, v]) =>
    '<div class="adm-row"><span>' + esc(t(k)) + '</span><b>' + esc(v) + '</b></div>'
  ).join('') +
    '<button type="button" class="adm-btn" onclick="renderAdmin(\'overview\')">' + esc(t('refresh')) + '</button>';
}

async function renderAdminSettings(body) {
  const d = await api('/api/admin/overview');
  const st = d.settings || {};
  let html = '';
  SETTING_FIELDS.forEach(([key, labelKey]) => {
    html += '<label class="adm-field"><span>' + esc(t(labelKey)) + '</span>' +
      '<input type="number" step="any" id="set_' + key + '" value="' + esc(st[key]) + '"></label>';
  });
  html += '<div class="adm-sub">' + esc(t('settings')) + '</div>';
  SETTING_TOGGLES.forEach(([key, labelKey]) => {
    const on = st[key] === '1';
    html += '<button type="button" class="adm-toggle' + (on ? ' on' : '') + '" id="tgl_' + key +
      '" data-on="' + (on ? '1' : '0') + '" onclick="toggleSetting(this)">' +
      esc(t(labelKey)) + ' — <b>' + (on ? t('on') : t('off')) + '</b></button>';
  });
  html += '<button type="button" class="adm-btn adm-save" onclick="saveSettings()">' + esc(t('save')) + '</button>' +
    '<div class="adm-note" id="settings-note"></div>';
  body.innerHTML = html;
}

function toggleSetting(btn) {
  const on = btn.dataset.on === '1';
  btn.dataset.on = on ? '0' : '1';
  btn.classList.toggle('on', !on);
  btn.querySelector('b').textContent = !on ? t('on') : t('off');
}

async function saveSettings() {
  const payload = {};
  SETTING_FIELDS.forEach(([key, , type]) => {
    const el = document.getElementById('set_' + key);
    if (!el || el.value === '') return;
    payload[key] = type === 'int' ? parseInt(el.value, 10) : parseFloat(el.value);
  });
  SETTING_TOGGLES.forEach(([key]) => {
    const el = document.getElementById('tgl_' + key);
    if (el) payload[key] = el.dataset.on === '1';
  });
  try {
    await api('/api/admin/settings', { method: 'POST', body: JSON.stringify(payload) });
    const note = document.getElementById('settings-note');
    if (note) note.textContent = '✅ ' + t('saved');
  } catch (e) {
    const note = document.getElementById('settings-note');
    if (note) note.textContent = '❌ ' + (e.message || t('error'));
  }
}

function playerRowHtml(p) {
  return '<button type="button" class="adm-row adm-click" onclick="adminNav(\'player\', ' + p.telegram_id + ')">' +
    '<span>' + esc(p.username ? '@' + p.username : p.telegram_id) + (p.banned ? ' 🚫' : '') + '</span>' +
    '<b>' + esc(p.stars) + ' ⭐</b></button>';
}

async function renderAdminPlayers(body, opts) {
  const q = opts.q || '';
  const offset = opts.offset || 0;
  const d = await api('/api/admin/players?q=' + encodeURIComponent(q) + '&offset=' + offset + '&limit=8');
  let html = '<div class="adm-search">' +
    '<input type="text" id="players-q" placeholder="' + esc(t('search')) + '" value="' + esc(q) + '">' +
    '<button type="button" class="adm-btn" onclick="searchPlayers()">' + esc(t('searchBtn')) + '</button></div>';
  const players = d.players || [];
  html += players.length
    ? players.map(playerRowHtml).join('')
    : '<div class="adm-note">' + esc(t('empty')) + '</div>';
  html += '<div class="adm-nav">' +
    '<button type="button" class="adm-btn" onclick="playersPage(-1)"' + (offset <= 0 ? ' disabled' : '') + '>' + t('prev') + '</button>' +
    '<button type="button" class="adm-btn" onclick="playersPage(1)">' + t('next') + '</button></div>' +
    '<div class="adm-note">' + esc(t('ofTotal', { n: d.total })) + '</div>';
  body.innerHTML = html;
}

function searchPlayers() {
  const q = (document.getElementById('players-q') || {}).value || '';
  renderAdmin('players', { q: q.trim(), offset: 0 });
}

function playersPage(dir) {
  const cur = (adminArg && adminArg.offset) || 0;
  const q = (adminArg && adminArg.q) || '';
  const next = Math.max(0, cur + dir * 8);
  renderAdmin('players', { q: q, offset: next });
}

async function renderAdminPlayer(body, tid) {
  const d = await api('/api/admin/players?q=' + encodeURIComponent(String(tid)) + '&limit=30');
  const p = (d.players || []).find(x => x.telegram_id === tid);
  if (!p) {
    body.innerHTML = '<div class="adm-note">' + esc(t('empty')) + '</div>' +
      '<button type="button" class="adm-btn" onclick="adminBack()">' + esc(t('back')) + '</button>';
    return;
  }
  let html = '<div class="adm-card">' +
    '<div class="adm-row"><span>ID</span><b>' + p.telegram_id + '</b></div>' +
    '<div class="adm-row"><span>@</span><b>' + esc(p.username || '—') + '</b></div>' +
    '<div class="adm-row"><span>' + esc(t('pBalance')) + '</span><b>' + p.stars + ' ⭐</b></div>' +
    '<div class="adm-row"><span>' + esc(t('pGames')) + '</span><b>' + p.games + '</b></div>' +
    '<div class="adm-row"><span>' + esc(t('pWagered')) + '</span><b>' + p.wagered + ' ⭐</b></div>' +
    '<div class="adm-row"><span>' + esc(t('pWon')) + '</span><b>' + p.paid + ' ⭐</b></div>' +
    '</div>';
  html += '<div class="adm-actions">';
  html += '<button type="button" class="adm-btn" onclick="playerAction(' + tid + ',\'' +
    (p.banned ? 'unban' : 'ban') + '\')">' + esc(p.banned ? t('unban') : t('ban')) + '</button>';
  html += '<button type="button" class="adm-btn" onclick="playerAction(' + tid + ',\'' +
    (p.force_next_crash ? 'clear_force' : 'force_crash') + '\')">' +
    esc(p.force_next_crash ? t('clearForce') : t('forceCrash')) + '</button>';
  html += '</div>';
  html += '<div class="adm-search"><input type="number" min="1" id="adm-amount" placeholder="' + esc(t('amountPh')) + '">' +
    '<button type="button" class="adm-btn" onclick="playerCredit(' + tid + ')">' + esc(t('credit')) + '</button>' +
    '<button type="button" class="adm-btn" onclick="playerDebit(' + tid + ')">' + esc(t('debit')) + '</button></div>' +
    '<div class="adm-note" id="player-note"></div>';
  body.innerHTML = html;
}

async function playerAction(tid, action) {
  try {
    await api('/api/admin/player', {
      method: 'POST',
      body: JSON.stringify({ telegram_id: tid, action: action })
    });
    renderAdmin('player', tid);
  } catch (e) {
    const note = document.getElementById('player-note');
    if (note) note.textContent = '❌ ' + (e.message || t('error'));
  }
}

async function playerCredit(tid) { await playerAmount(tid, 'credit'); }
async function playerDebit(tid) { await playerAmount(tid, 'debit'); }

async function playerAmount(tid, action) {
  const el = document.getElementById('adm-amount');
  const amount = parseInt(el && el.value, 10);
  const note = document.getElementById('player-note');
  if (!amount || amount < 1 || amount > 1000000) {
    if (note) note.textContent = '❌ ' + t('topupRange');
    return;
  }
  try {
    await api('/api/admin/player', {
      method: 'POST',
      body: JSON.stringify({ telegram_id: tid, action: action, amount: amount })
    });
    renderAdmin('player', tid);
    loadMe();
  } catch (e) {
    if (note) note.textContent = '❌ ' + (e.message || t('error'));
  }
}

async function renderAdminSkins(body) {
  const d = await api('/api/admin/skins');
  const skins = d.skins || [];
  let html = '<div class="adm-note">' + esc(t('skinAddHint')) + '</div>';
  if (!skins.length) {
    html += '<div class="adm-note">' + esc(t('noSkins')) + '</div>';
  }
  skins.forEach(s => {
    const url = s.poster || s.url || '';
    const full = url ? apiOrigin() + url : '';
    html += '<div class="adm-skin">' +
      (full ? '<img src="' + esc(full) + '" alt="">' : '') +
      '<span class="adm-skin-name">' + esc(s.name || s.id) +
      ' — ' + (s.enabled ? t('skinOn') : t('skinOff')) + '</span>' +
      '<button type="button" class="adm-btn" onclick="skinAction(\'' + esc(s.id) + '\',\'toggle\')">' +
      esc(t('skinOn') + '/' + t('skinOff')) + '</button>' +
      '<button type="button" class="adm-btn adm-danger" onclick="skinAction(\'' + esc(s.id) + '\',\'delete\')">' +
      esc(t('delete')) + '</button></div>';
  });
  body.innerHTML = html;
}

async function skinAction(id, action) {
  if (action === 'delete' && !window.confirm(t('confirmDelete'))) return;
  try {
    await api('/api/admin/skin', {
      method: 'POST',
      body: JSON.stringify({ id: id, action: action })
    });
    loadSkins();
    renderAdmin('skins');
  } catch (e) {
    body_error(e);
  }
}

function body_error(e) {
  const body = document.getElementById('admin-body');
  body.innerHTML = '<div class="adm-error">❌ ' + esc(e.message || t('error')) + '</div>';
}

async function renderAdminAdmins(body) {
  const d = await api('/api/admin/app-admins');
  const admins = d.admins || [];
  let html = '';
  admins.forEach(a => {
    html += '<div class="adm-row"><span>' +
      esc(a.username ? '@' + a.username : a.telegram_id) +
      (a.is_main ? ' 👑' : '') + '</span>' +
      (a.is_main ? '<b>★</b>' :
        '<button type="button" class="adm-btn adm-small" onclick="grantAdmin(' + a.telegram_id + ',\'revoke\')">' +
        esc(t('revoke')) + '</button>') +
      '</div>';
  });
  if (isMainAdmin) {
    html += '<div class="adm-search">' +
      '<input type="text" id="admin-target" placeholder="' + esc(t('adminIdPh')) + '">' +
      '<button type="button" class="adm-btn" onclick="grantAdmin(0,\'grant\')">' + esc(t('grant')) + '</button></div>';
  } else {
    html += '<div class="adm-note">' + esc(t('mainOnly')) + '</div>';
  }
  html += '<div class="adm-note" id="admins-note"></div>';
  body.innerHTML = html;
}

async function grantAdmin(tid, action) {
  const note = document.getElementById('admins-note');
  let payload = { action: action };
  if (action === 'grant') {
    const raw = ((document.getElementById('admin-target') || {}).value || '').trim();
    if (!raw) {
      if (note) note.textContent = '❌ ' + t('adminIdPh');
      return;
    }
    if (/^\d+$/.test(raw)) payload.telegram_id = parseInt(raw, 10);
    else payload.username = raw.replace(/^@/, '');
  } else {
    payload.telegram_id = tid;
  }
  try {
    await api('/api/admin/app-admin', { method: 'POST', body: JSON.stringify(payload) });
    if (note) note.textContent = '✅ ' + t('done');
    renderAdmin('admins');
  } catch (e) {
    if (note) note.textContent = '❌ ' + (e.message || t('error'));
  }
}

/* ============================== RENDERING ============================== */
function renderLoop(ts) {
  drawCanvas(ts);
  requestAnimationFrame(renderLoop);
}

/* Путь полёта: снизу вверх */
function flightPoint(prog, w, h) {
  const x = w / 2 + Math.sin(prog * Math.PI) * (w * 0.12);
  const y = h - 34 - prog * (h - 78);
  return [x, y];
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

    // траектория — снизу вверх
    ctx.strokeStyle = '#58a6ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const steps = 48;
    for (let i = 0; i <= steps; i++) {
      const p = (clampedProg * i) / steps;
      const pt = flightPoint(p, w, h);
      if (i === 0) ctx.moveTo(pt[0], pt[1]);
      else ctx.lineTo(pt[0], pt[1]);
    }
    ctx.stroke();

    // ракета
    const rp = flightPoint(clampedProg, w, h);
    if (selectedSkin.img) {
      showRocketSprite(rp[0], rp[1], 44);
    } else {
      hideRocketSprite();
      ctx.font = '32px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selectedSkin.name || '?', rp[0], rp[1]);
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
    // idle — ракета внизу, готова к взлёту
    const idle = flightPoint(0, w, h);
    if (selectedSkin.img) {
      showRocketSprite(idle[0], idle[1], 56);
    } else {
      hideRocketSprite();
      ctx.font = '40px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selectedSkin.name || '?', idle[0], idle[1]);
    }
    multDisplay.textContent = '1.00x';
    multDisplay.style.color = '#fff';
  }

  ctx.restore();
}

/* ================================= START ================================ */
function init() {
  initTelegram();
  applyI18n();
  renderSkins();
  loadSkins();
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  loadMe();
  requestAnimationFrame(renderLoop);
}

init();
