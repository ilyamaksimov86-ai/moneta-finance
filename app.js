import {
  initDatabase,
  getAllTransactions,
  saveTransaction,
  bulkSaveTransactions,
  deleteTransaction,
  getAllCategories,
  saveCategory,
  deleteCategoryAndReassign,
  getSettings,
  setSetting,
  clearDemoData,
  clearAllData,
  exportFullBackup,
  importFullBackup,
  generateId,
} from './db.js';

// 24 minimalist SVG icons
const ICONS = {
  cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h9.3a1.5 1.5 0 0 0 1.4-1.1L21 8H6"/>',
  coffee: '<path d="M17 8h1a3 3 0 0 1 0 6h-1"/><path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8z"/><path d="M7 4v2M11 4v2"/>',
  car: '<path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11"/><rect x="3" y="11" width="18" height="6" rx="2"/><circle cx="7" cy="17" r="1.5"/><circle cx="17" cy="17" r="1.5"/>',
  home: '<path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/><path d="M9.5 20v-6h5v6"/>',
  heart: '<path d="M12 20s-7-4.5-9-8.5A5.2 5.2 0 0 1 12 6.5a5.2 5.2 0 0 1 9 5c-2 4-9 8.5-9 8.5z"/>',
  bag: '<path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  repeat: '<path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
  tag: '<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="8" cy="8" r="1.2"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  chart: '<path d="M4 19h16"/><rect x="6" y="11" width="3" height="8" rx="1"/><rect x="11" y="7" width="3" height="12" rx="1"/><rect x="16" y="4" width="3" height="15" rx="1"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8"/><path d="M12 8H8.5a2 2 0 1 1 0-4C11 4 12 8 12 8zm0 0h3.5a2 2 0 1 0 0-4C13 4 12 8 12 8z"/>',
  wallet: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M16 12.5h5"/><circle cx="16.5" cy="12.5" r="1"/>',
  utensils: '<path d="M6 3v7a2 2 0 0 0 4 0V3M8 3v18"/><path d="M16 3v18M16 3a3 3 0 0 1 3 3v5h-3"/>',
  plane: '<path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>',
  dumbbell: '<path d="M6 7v10M18 7v10M3 9v6M21 9v6M6 12h12"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v17H6a2 2 0 0 1-2-2V5z"/><path d="M4 17a2 2 0 0 1 2-2h13"/>',
  music: '<path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
  phone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>',
  shirt: '<path d="M16 4l4 3-2 4-2-1v10H8V10l-2 1-2-4 4-3a4 4 0 0 0 8 0z"/>',
  wine: '<path d="M8 3h8l-1 6a4 4 0 0 1-6 0L8 3z"/><path d="M12 13v7M8 20h8"/>',
  credit: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 19a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 19a5 5 0 0 1 5-4"/>',
};

const NAV_ICONS = {
  overview: '<path d="M12 3a9 9 0 1 0 9 9h-9V3z"/><path d="M15.5 3.7A9 9 0 0 1 20.3 8.5H15.5V3.7z"/>',
  transactions: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  categories: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
};

const PALETTE = [
  '#10B981', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#EC4899', '#EF4444', '#F97316',
  '#F59E0B', '#84CC16', '#06B6D4', '#64748B',
];

const MONTHS_RU = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

const MONTHS_GEN_RU = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

const MONTHS_SHORT_RU = [
  'янв', 'фев', 'мар', 'апр', 'май', 'июн',
  'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',
];

const WEEKDAYS_SHORT_RU = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

const state = {
  tab: 'overview',
  periodMode: 'month', // 'day' | 'week' | 'month'
  selectedDate: todayISO(0),
  monthKey: currentMonthKey(),
  overviewMode: 'expense',
  selectedDonutCatId: null,
  transactions: [],
  categories: [],
  settings: {
    currency: '₽',
    theme: 'dark',
    demoCleared: false,
    lastBackupAt: null,
    ghRepo: 'ilyamaksimov86-ai/adma-finance-data',
    ghPath: 'data.json',
    ghToken: '',
    ghLastSyncAt: null,
    localUpdatedAt: 0,
  },
  syncStatus: 'idle', // 'idle' | 'syncing' | 'synced' | 'error'
  syncError: '',
  filters: {
    search: '',
    type: 'all',
    categoryId: 'all',
    monthMode: 'selected', // 'selected' | 'all'
  },
  activeSheet: null,
  txForm: null,
  catForm: null,
  csvPreview: null,
  pendingUndo: null,
};

const mainEl = document.getElementById('mainContent');
const sheetBackdrop = document.getElementById('sheetBackdrop');
const sheetContainer = document.getElementById('sheetContainer');
const toastHost = document.getElementById('toastHost');
const offlineBadge = document.getElementById('offlineBadge');
const themeColorMeta = document.getElementById('themeColorMeta');

function svgIcon(name, size = 18) {
  const path = ICONS[name] || ICONS.tag;
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseISO(iso) {
  const [y, m, d] = String(iso || todayISO(0)).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function toISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function shiftDay(iso, delta) {
  const d = parseISO(iso);
  d.setDate(d.getDate() + delta);
  return toISO(d);
}

function getWeekStartISO(iso) {
  const d = parseISO(iso);
  const dow = d.getDay(); // 0=Sun..6=Sat
  const diffToMon = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + diffToMon);
  return toISO(d);
}

function getWeekEndISO(weekStartIso) {
  return shiftDay(weekStartIso, 6);
}

function formatDayPeriodLabel(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  if (iso === todayISO(0)) return `Сегодня, ${d} ${MONTHS_SHORT_RU[m - 1]}`;
  if (iso === todayISO(-1)) return `Вчера, ${d} ${MONTHS_SHORT_RU[m - 1]}`;
  const thisYear = new Date().getFullYear();
  return y === thisYear ? `${d} ${MONTHS_GEN_RU[m - 1]}` : `${d} ${MONTHS_GEN_RU[m - 1]} ${y}`;
}

function formatWeekRangeLabel(weekStartIso) {
  const weekEndIso = getWeekEndISO(weekStartIso);
  const [y1, m1, d1] = weekStartIso.split('-').map(Number);
  const [y2, m2, d2] = weekEndIso.split('-').map(Number);
  const thisYear = new Date().getFullYear();
  const yearSuffix = y2 !== thisYear ? ` ${y2}` : '';
  if (m1 === m2) return `${d1}–${d2} ${MONTHS_SHORT_RU[m1 - 1]}${yearSuffix}`;
  return `${d1} ${MONTHS_SHORT_RU[m1 - 1]} – ${d2} ${MONTHS_SHORT_RU[m2 - 1]}${yearSuffix}`;
}

function formatShortDDMM(iso) {
  const [, m, d] = iso.split('-');
  return `${d}.${m}`;
}

function shiftMonth(monthKey, delta) {
  const [y, m] = monthKey.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabel(monthKey) {
  const [y, m] = monthKey.split('-').map(Number);
  return `${MONTHS_RU[m - 1]} ${y}`;
}

function formatDayHeader(dateStr) {
  if (dateStr === todayISO(0)) return 'Сегодня';
  if (dateStr === todayISO(-1)) return 'Вчера';
  const [y, m, d] = dateStr.split('-').map(Number);
  const thisYear = new Date().getFullYear();
  return y === thisYear ? `${d} ${MONTHS_GEN_RU[m - 1]}` : `${d} ${MONTHS_GEN_RU[m - 1]} ${y}`;
}

function formatMoney(amount, { signed = false, type = null } = {}) {
  const cur = state.settings.currency || '₽';
  const abs = Math.abs(Number(amount) || 0);
  const hasDecimals = Math.round(abs * 100) % 100 !== 0;
  const formatted = abs.toLocaleString('ru-RU', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });
  let prefix = '';
  if (type === 'income') prefix = '+';
  else if (type === 'expense') prefix = '−';
  else if (signed) prefix = amount > 0 ? '+' : amount < 0 ? '−' : '';
  return `${prefix}${formatted}\u00A0${cur}`;
}

function formatCompactAmount(n) {
  const abs = Math.abs(Number(n) || 0);
  if (abs === 0) return '0';
  if (abs >= 1_000_000) return `${(abs / 1_000_000).toFixed(1).replace(/\.0$/, '')}м`;
  if (abs >= 10_000) return `${Math.round(abs / 1000)}к`;
  if (abs >= 1000) return `${(abs / 1000).toFixed(1).replace(/\.0$/, '')}к`;
  return String(Math.round(abs));
}

function getCategoryMap() {
  const map = new Map();
  for (const c of state.categories) map.set(c.id, c);
  return map;
}

function getCategoryUsageCounts() {
  const counts = new Map();
  for (const t of state.transactions) {
    counts.set(t.categoryId, (counts.get(t.categoryId) || 0) + 1);
  }
  return counts;
}

function getSortedCategoriesForType(type) {
  const counts = getCategoryUsageCounts();
  return state.categories
    .filter((c) => c.type === type)
    .sort((a, b) => {
      const diff = (counts.get(b.id) || 0) - (counts.get(a.id) || 0);
      if (diff !== 0) return diff;
      return (a.order || 0) - (b.order || 0);
    });
}

function getTopCommentsForCategory(categoryId, limit = 4) {
  const freq = new Map();
  for (const t of state.transactions) {
    if (t.categoryId !== categoryId) continue;
    const raw = (t.comment || '').trim();
    if (!raw || raw.length > 40) continue;
    const key = raw.toLowerCase();
    const cur = freq.get(key) || { text: raw, count: 0, latest: '' };
    cur.count += 1;
    if (t.date > cur.latest) {
      cur.latest = t.date;
      cur.text = raw;
    }
    freq.set(key, cur);
  }
  return [...freq.values()]
    .sort((a, b) => b.count - a.count || b.latest.localeCompare(a.latest))
    .slice(0, limit)
    .map((x) => x.text);
}

function applyTheme() {
  const pref = state.settings.theme || 'dark';
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const effective = pref === 'system' ? (prefersDark ? 'dark' : 'light') : pref;
  document.documentElement.setAttribute('data-theme', effective);
  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', effective === 'dark' ? '#09090b' : '#f4f4f5');
  }
}

function updateOnlineStatus() {
  if (offlineBadge) offlineBadge.hidden = navigator.onLine;
}

function showToast(message, { actionLabel = null, onAction = null, duration = 3500 } = {}) {
  toastHost.innerHTML = '';
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span>${escapeHtml(message)}</span>`;
  if (actionLabel && onAction) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'toast-action';
    btn.textContent = actionLabel;
    btn.addEventListener('click', () => {
      el.remove();
      onAction();
    });
    el.appendChild(btn);
  }
  toastHost.appendChild(el);
  setTimeout(() => {
    if (el.isConnected) el.remove();
  }, duration);
}

async function reloadData() {
  const [transactions, categories, settings] = await Promise.all([
    getAllTransactions(),
    getAllCategories(),
    getSettings(),
  ]);
  state.transactions = transactions;
  state.categories = categories;
  state.settings = settings;
  applyTheme();
}

function setTab(tab) {
  state.tab = tab;
  document.querySelectorAll('[data-tab]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  renderMain();
}

// ============================================================
// GITHUB AUTO-SYNC (Private Repo JSON Snapshot)
// ============================================================
let autoSyncTimer = null;

function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToUtf8(b64) {
  const binary = atob(b64.replace(/\s+/g, ''));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function updateSyncIndicatorDOM() {
  document.querySelectorAll('[data-sync-dot]').forEach((dot) => {
    dot.className = `sync-dot ${state.syncStatus}`;
    const label =
      state.syncStatus === 'syncing'
        ? 'Синхронизация с GitHub...'
        : state.syncStatus === 'synced'
          ? 'Синхронизировано с GitHub'
          : state.syncStatus === 'error'
            ? `Ошибка синхронизации: ${state.syncError || 'проверьте токен'}`
            : 'GitHub Sync не подключён';
    dot.title = label;
  });
}

function isGitHubConfigured() {
  return Boolean((state.settings.ghToken || '').trim() && (state.settings.ghRepo || '').trim());
}

async function ghApiFetch(path, options = {}) {
  const token = (state.settings.ghToken || '').trim();
  const res = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });
  return res;
}

async function pushToGitHub({ silent = true } = {}) {
  if (!isGitHubConfigured() || !navigator.onLine) return false;
  const repo = state.settings.ghRepo.trim();
  const filePath = (state.settings.ghPath || 'data.json').trim();

  state.syncStatus = 'syncing';
  state.syncError = '';
  updateSyncIndicatorDOM();

  try {
    let sha;
    const getRes = await ghApiFetch(`/repos/${repo}/contents/${encodeURIComponent(filePath)}?t=${Date.now()}`);
    if (getRes.ok) {
      const meta = await getRes.json();
      sha = meta.sha;
    } else if (getRes.status !== 404) {
      throw new Error(`GitHub HTTP ${getRes.status}`);
    }

    const payload = await exportFullBackup({ markBackup: false });
    const content = utf8ToBase64(JSON.stringify(payload, null, 2));
    const putBody = {
      message: `ADMA auto-sync (${payload.data.transactions.length} tx)`,
      content,
      ...(sha ? { sha } : {}),
    };

    const putRes = await ghApiFetch(`/repos/${repo}/contents/${encodeURIComponent(filePath)}`, {
      method: 'PUT',
      body: JSON.stringify(putBody),
    });
    if (!putRes.ok) {
      const errText = await putRes.text().catch(() => '');
      throw new Error(`HTTP ${putRes.status}${errText ? ': ' + errText.slice(0, 80) : ''}`);
    }

    const now = Date.now();
    await setSetting('ghLastSyncAt', now);
    await setSetting('lastBackupAt', now);
    state.settings.ghLastSyncAt = now;
    state.settings.lastBackupAt = now;
    state.syncStatus = 'synced';
    updateSyncIndicatorDOM();
    if (!silent) showToast('Сохранено в GitHub');
    if (state.tab === 'settings') renderSettingsTab();
    return true;
  } catch (err) {
    state.syncStatus = 'error';
    state.syncError = err.message || 'Ошибка сети';
    updateSyncIndicatorDOM();
    if (!silent) showToast(`Ошибка GitHub: ${state.syncError}`);
    return false;
  }
}

async function pullFromGitHub({ force = false, silent = true } = {}) {
  if (!isGitHubConfigured() || !navigator.onLine) return false;
  const repo = state.settings.ghRepo.trim();
  const filePath = (state.settings.ghPath || 'data.json').trim();

  state.syncStatus = 'syncing';
  state.syncError = '';
  updateSyncIndicatorDOM();

  try {
    const res = await ghApiFetch(`/repos/${repo}/contents/${encodeURIComponent(filePath)}?t=${Date.now()}`);
    if (res.status === 404) {
      // No cloud file yet — push local data up
      return await pushToGitHub({ silent });
    }
    if (!res.ok) throw new Error(`GitHub HTTP ${res.status}`);

    const meta = await res.json();
    if (!meta.content) throw new Error('Пустой файл в GitHub');
    const remote = JSON.parse(base64ToUtf8(meta.content));

    const remoteUpdated = Number(remote.updatedAt) || 0;
    const localUpdated = Number(state.settings.localUpdatedAt) || 0;
    const onlyDemoLocal = !state.settings.demoCleared && state.transactions.every((t) => t.isDemo);
    const remoteHasReal = Array.isArray(remote?.data?.transactions) && remote.data.transactions.length > 0;

    if (force || (onlyDemoLocal && remoteHasReal) || remoteUpdated > localUpdated) {
      await importFullBackup(remote);
      const now = Date.now();
      await setSetting('ghLastSyncAt', now);
      await setSetting('lastBackupAt', now);
      await reloadData();
      state.syncStatus = 'synced';
      updateSyncIndicatorDOM();
      renderMain();
      showToast(`Синхронизировано из GitHub (${state.transactions.length} опер.)`);
      return true;
    }

    if (localUpdated > remoteUpdated) {
      return await pushToGitHub({ silent });
    }

    state.syncStatus = 'synced';
    updateSyncIndicatorDOM();
    if (!silent) showToast('Данные уже актуальны');
    return true;
  } catch (err) {
    state.syncStatus = 'error';
    state.syncError = err.message || 'Ошибка чтения';
    updateSyncIndicatorDOM();
    if (!silent) showToast(`Ошибка GitHub: ${state.syncError}`);
    return false;
  }
}

async function scheduleAutoSync() {
  const now = Date.now();
  await setSetting('localUpdatedAt', now);
  state.settings.localUpdatedAt = now;
  if (!isGitHubConfigured()) return;
  clearTimeout(autoSyncTimer);
  autoSyncTimer = setTimeout(() => {
    pushToGitHub({ silent: true });
  }, 1500);
}

function renderMain() {
  if (state.tab === 'overview') renderOverview();
  else if (state.tab === 'transactions') renderTransactionsTab();
  else if (state.tab === 'categories') renderCategoriesTab();
  else if (state.tab === 'settings') renderSettingsTab();
}

// ============================================================
// OVERVIEW TAB (День / Неделя / Месяц + Swiss Neo-Bank)
// ============================================================
function getPeriodContext() {
  const mode = state.periodMode;

  if (mode === 'day') {
    const d = state.selectedDate || todayISO(0);
    const prevD = shiftDay(d, -1);
    const isCurrent = d === todayISO(0);
    const [, pm, pd] = prevD.split('-').map(Number);
    const prevCompareLabel = isCurrent ? 'ко вчера' : `к ${pd} ${MONTHS_SHORT_RU[pm - 1]}`;

    // 7-day trend window
    const today = todayISO(0);
    const sixDaysAgo = shiftDay(today, -6);
    const anchor = d >= sixDaysAgo && d <= today ? today : d;
    const bars = [];
    for (let i = 6; i >= 0; i -= 1) {
      const iso = shiftDay(anchor, -i);
      const dow = parseISO(iso).getDay();
      bars.push({
        key: iso,
        label: WEEKDAYS_SHORT_RU[dow],
        title: formatDayPeriodLabel(iso),
        sum: 0,
        isActive: iso === d,
      });
    }
    const barMap = new Map(bars.map((b) => [b.key, b]));
    for (const t of state.transactions) {
      if (t.type !== 'expense') continue;
      const item = barMap.get(t.date);
      if (item) item.sum += t.amount;
    }

    return {
      mode,
      label: formatDayPeriodLabel(d),
      heroTitle: 'Расходы за день',
      trendTitle: 'Динамика расходов',
      trendSub: '7 дней',
      trendCols: 7,
      isCurrent,
      resetLabel: 'Сегодня',
      prevCompareLabel,
      inCurrent: (t) => t.date === d,
      inPrev: (t) => t.date === prevD,
      bars,
      step: (delta) => {
        state.selectedDate = shiftDay(d, delta);
        state.monthKey = state.selectedDate.slice(0, 7);
      },
      reset: () => {
        state.selectedDate = todayISO(0);
        state.monthKey = currentMonthKey();
      },
      selectBar: (key) => {
        state.selectedDate = key;
        state.monthKey = key.slice(0, 7);
      },
    };
  }

  if (mode === 'week') {
    const ws = getWeekStartISO(state.selectedDate || todayISO(0));
    const we = getWeekEndISO(ws);
    const prevWs = shiftDay(ws, -7);
    const prevWe = shiftDay(ws, -1);
    const curWs = getWeekStartISO(todayISO(0));
    const isCurrent = ws === curWs;

    // 6-week trend window
    const fiveWeeksAgo = shiftDay(curWs, -35);
    const anchorWs = ws >= fiveWeeksAgo && ws <= curWs ? curWs : ws;
    const bars = [];
    for (let i = 5; i >= 0; i -= 1) {
      const bStart = shiftDay(anchorWs, -i * 7);
      const bEnd = getWeekEndISO(bStart);
      bars.push({
        key: bStart,
        end: bEnd,
        label: formatShortDDMM(bStart),
        title: formatWeekRangeLabel(bStart),
        sum: 0,
        isActive: bStart === ws,
      });
    }
    for (const t of state.transactions) {
      if (t.type !== 'expense') continue;
      for (const b of bars) {
        if (t.date >= b.key && t.date <= b.end) {
          b.sum += t.amount;
          break;
        }
      }
    }

    return {
      mode,
      label: formatWeekRangeLabel(ws),
      heroTitle: 'Расходы за неделю',
      trendTitle: 'Динамика расходов',
      trendSub: '6 недель',
      trendCols: 6,
      isCurrent,
      resetLabel: 'Эта неделя',
      prevCompareLabel: 'к пр. нед.',
      inCurrent: (t) => t.date >= ws && t.date <= we,
      inPrev: (t) => t.date >= prevWs && t.date <= prevWe,
      bars,
      step: (delta) => {
        state.selectedDate = shiftDay(ws, delta * 7);
        state.monthKey = state.selectedDate.slice(0, 7);
      },
      reset: () => {
        state.selectedDate = todayISO(0);
        state.monthKey = currentMonthKey();
      },
      selectBar: (key) => {
        state.selectedDate = key;
        state.monthKey = key.slice(0, 7);
      },
    };
  }

  // mode === 'month'
  const mk = state.monthKey;
  const prevMk = shiftMonth(mk, -1);
  const curMk = currentMonthKey();
  const isCurrent = mk === curMk;
  const [, prevMNum] = prevMk.split('-').map(Number);
  const prevShortLabel = MONTHS_SHORT_RU[prevMNum - 1];

  const sixBackFromCur = shiftMonth(curMk, -5);
  const trendAnchor = mk >= sixBackFromCur && mk <= curMk ? curMk : mk;
  const bars = [];
  for (let i = 5; i >= 0; i -= 1) {
    const mKey = shiftMonth(trendAnchor, -i);
    const [, mNum] = mKey.split('-').map(Number);
    bars.push({
      key: mKey,
      label: MONTHS_SHORT_RU[mNum - 1],
      title: formatMonthLabel(mKey),
      sum: 0,
      isActive: mKey === mk,
    });
  }
  const barMap = new Map(bars.map((b) => [b.key, b]));
  for (const t of state.transactions) {
    if (t.type !== 'expense') continue;
    const item = barMap.get(t.date.slice(0, 7));
    if (item) item.sum += t.amount;
  }

  return {
    mode: 'month',
    label: formatMonthLabel(mk),
    heroTitle: 'Расходы за месяц',
    trendTitle: 'Динамика расходов',
    trendSub: '6 месяцев',
    trendCols: 6,
    isCurrent,
    resetLabel: 'Текущий',
    prevCompareLabel: `к ${prevShortLabel}.`,
    inCurrent: (t) => t.date.startsWith(mk),
    inPrev: (t) => t.date.startsWith(prevMk),
    bars,
    step: (delta) => {
      state.monthKey = shiftMonth(mk, delta);
    },
    reset: () => {
      state.monthKey = currentMonthKey();
    },
    selectBar: (key) => {
      state.monthKey = key;
    },
  };
}

function renderOverview() {
  const ctx = getPeriodContext();
  const periodTxs = state.transactions.filter(ctx.inCurrent);
  let income = 0;
  let expense = 0;
  for (const t of periodTxs) {
    if (t.type === 'income') income += t.amount;
    else expense += t.amount;
  }
  const balance = income - expense;

  let prevExpense = 0;
  for (const t of state.transactions) {
    if (t.type === 'expense' && ctx.inPrev(t)) {
      prevExpense += t.amount;
    }
  }

  let deltaHtml = '';
  if (prevExpense > 0) {
    const pct = Math.round(((expense - prevExpense) / prevExpense) * 100);
    const cls = pct < 0 ? 'good' : pct > 0 ? 'bad' : '';
    const sign = pct > 0 ? '+' : pct < 0 ? '−' : '';
    deltaHtml = `<span class="delta-pill num ${cls}">${sign}${Math.abs(pct)}% ${ctx.prevCompareLabel}</span>`;
  } else if (expense > 0) {
    deltaHtml = `<span class="delta-pill">нет данных ${ctx.prevCompareLabel}</span>`;
  }

  const maxTrend = Math.max(1, ...ctx.bars.map((b) => b.sum));

  // Category breakdown for donut
  const modeTxs = periodTxs.filter((t) => t.type === state.overviewMode);
  const modeTotal = modeTxs.reduce((acc, t) => acc + t.amount, 0);
  const catMap = getCategoryMap();
  const byCat = new Map();
  for (const t of modeTxs) {
    byCat.set(t.categoryId, (byCat.get(t.categoryId) || 0) + t.amount);
  }
  const breakdown = [...byCat.entries()]
    .map(([categoryId, sum]) => {
      const cat = catMap.get(categoryId) || { id: categoryId, name: 'Без категории', icon: 'tag', color: '#64748B' };
      const pct = modeTotal > 0 ? (sum / modeTotal) * 100 : 0;
      return { cat, sum, pct };
    })
    .sort((a, b) => b.sum - a.sum);

  if (state.selectedDonutCatId && !breakdown.some((b) => b.cat.id === state.selectedDonutCatId)) {
    state.selectedDonutCatId = null;
  }
  const activeItem = breakdown.find((b) => b.cat.id === state.selectedDonutCatId) || null;

  const radius = 82;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const segmentsSvg = breakdown.length
    ? breakdown
        .map((item) => {
          const dash = (item.pct / 100) * circumference;
          const gap = breakdown.length > 1 ? 2.5 : 0;
          const segLen = Math.max(0.5, dash - gap);
          const isSelected = activeItem && activeItem.cat.id === item.cat.id;
          const opacity = activeItem && !isSelected ? 0.35 : 1;
          const svg = `<circle
            class="donut-segment ${isSelected ? 'active' : ''}"
            data-donut-cat="${escapeHtml(item.cat.id)}"
            cx="105" cy="105" r="${radius}"
            fill="none"
            stroke="${escapeHtml(item.cat.color)}"
            stroke-width="${isSelected ? 26 : 20}"
            stroke-dasharray="${segLen.toFixed(2)} ${(circumference - segLen).toFixed(2)}"
            stroke-dashoffset="${(-offset).toFixed(2)}"
            transform="rotate(-90 105 105)"
            opacity="${opacity}"
          />`;
          offset += dash;
          return svg;
        })
        .join('')
    : `<circle cx="105" cy="105" r="${radius}" fill="none" stroke="var(--surface-2)" stroke-width="20"/>`;

  const centerLabel = activeItem
    ? activeItem.cat.name
    : state.overviewMode === 'expense'
      ? 'Всего расходов'
      : 'Всего доходов';
  const centerValue = activeItem ? formatMoney(activeItem.sum) : formatMoney(modeTotal);
  const centerPct = activeItem ? `${activeItem.pct.toFixed(1)}%` : '';

  const recentTxs = [...periodTxs]
    .sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 5);

  const syncDotHtml = isGitHubConfigured()
    ? `<span class="sync-dot ${state.syncStatus}" data-sync-dot title="Синхронизация с GitHub"></span>`
    : '';

  mainEl.innerHTML = `
    <div class="stack">
      <div class="overview-topbar">
        <div class="mobile-brand-wrap">
          <span class="mobile-brand">ADMA</span>
          ${syncDotHtml}
        </div>
        <div class="period-pills" role="tablist" aria-label="Период обзора">
          <button type="button" class="period-pill ${state.periodMode === 'day' ? 'active' : ''}" data-period-mode="day">День</button>
          <button type="button" class="period-pill ${state.periodMode === 'week' ? 'active' : ''}" data-period-mode="week">Неделя</button>
          <button type="button" class="period-pill ${state.periodMode === 'month' ? 'active' : ''}" data-period-mode="month">Месяц</button>
        </div>
      </div>

      <div class="month-bar">
        <button type="button" class="month-nav-btn" id="prevPeriodBtn" aria-label="Предыдущий период">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div class="month-label-wrap">
          <span class="month-label">${escapeHtml(ctx.label)}</span>
          ${ctx.isCurrent ? '' : `<button type="button" class="today-chip" id="resetPeriodBtn">${ctx.resetLabel}</button>`}
        </div>
        <button type="button" class="month-nav-btn" id="nextPeriodBtn" aria-label="Следующий период">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      <section class="card hero-card">
        <div class="hero-top">
          <div>
            <div class="tech-label">${ctx.heroTitle}</div>
            <div class="hero-amount num">${formatMoney(expense)}</div>
          </div>
          ${deltaHtml}
        </div>
        <div class="hero-submetrics">
          <div>
            <div class="muted-label">Доходы</div>
            <div class="submetric-val num text-income">${formatMoney(income, { type: income > 0 ? 'income' : null })}</div>
          </div>
          <div>
            <div class="muted-label">Баланс</div>
            <div class="submetric-val num ${balance > 0 ? 'text-income' : ''}">${formatMoney(balance, { signed: true })}</div>
          </div>
        </div>
      </section>

      <section class="card">
        <div class="section-header" style="margin-bottom:10px;">
          <h2 class="section-title">${ctx.trendTitle}</h2>
          <span class="muted-label" style="margin:0;">${ctx.trendSub}</span>
        </div>
        <div class="trend-bars" style="--trend-cols:${ctx.trendCols}">
          ${ctx.bars
            .map((b) => {
              const heightPct = b.sum > 0 ? Math.max(8, Math.round((b.sum / maxTrend) * 100)) : 4;
              return `
                <button type="button" class="trend-col ${b.isActive ? 'active' : ''}" data-trend-key="${escapeHtml(b.key)}" title="${escapeHtml(b.title)}: ${formatMoney(b.sum)}" aria-label="${escapeHtml(b.title)}: ${formatMoney(b.sum)}">
                  <span class="trend-bar-amt num">${formatCompactAmount(b.sum)}</span>
                  <div class="trend-bar-track">
                    <div class="trend-bar-fill" style="height:${heightPct}%"></div>
                  </div>
                  <span class="trend-bar-lbl">${escapeHtml(b.label)}</span>
                </button>
              `;
            })
            .join('')}
        </div>
      </section>

      <section class="card">
        <div class="section-header">
          <h2 class="section-title">Структура</h2>
          <div class="segmented">
            <button type="button" class="seg-btn ${state.overviewMode === 'expense' ? 'active' : ''}" data-overview-mode="expense">Расходы</button>
            <button type="button" class="seg-btn ${state.overviewMode === 'income' ? 'active' : ''}" data-overview-mode="income">Доходы</button>
          </div>
        </div>

        ${
          breakdown.length === 0
            ? `<div class="empty-state">
                 <div class="empty-state-title">Нет операций за период</div>
                 <div>Нажмите «+», чтобы добавить запись.</div>
               </div>`
            : `<div class="overview-grid">
                 <div class="donut-wrap">
                   <svg class="donut-svg" viewBox="0 0 210 210" role="img" aria-label="Диаграмма по категориям">
                     ${segmentsSvg}
                   </svg>
                   <div class="donut-center">
                     <div class="donut-center-label">${escapeHtml(centerLabel)}</div>
                     <div class="donut-center-value num">${centerValue}</div>
                     ${centerPct ? `<div class="donut-center-pct num">${centerPct}</div>` : ''}
                   </div>
                   ${
                     activeItem
                       ? `<button type="button" class="btn btn-secondary btn-sm" id="filterBySelectedCatBtn" style="margin-top:8px;">
                            Операции: ${escapeHtml(activeItem.cat.name)}
                          </button>`
                       : ''
                   }
                 </div>

                 <div class="cat-breakdown-list">
                   ${breakdown
                     .map(
                       (item) => `
                     <button type="button" class="cat-breakdown-row ${activeItem && activeItem.cat.id === item.cat.id ? 'active' : ''}" data-breakdown-cat="${escapeHtml(item.cat.id)}">
                       <div class="cat-row-top">
                         <div class="cat-row-left">
                           <span class="cat-badge" style="background:${escapeHtml(item.cat.color)}20;color:${escapeHtml(item.cat.color)}">
                             ${svgIcon(item.cat.icon, 18)}
                           </span>
                           <span class="cat-row-name">${escapeHtml(item.cat.name)}</span>
                         </div>
                         <div class="cat-row-right">
                           <span class="cat-row-amount num">${formatMoney(item.sum)}</span>
                           <span class="cat-row-pct num">${item.pct.toFixed(0)}%</span>
                         </div>
                       </div>
                       <div class="progress-track">
                         <div class="progress-fill" style="width:${Math.max(2, item.pct).toFixed(1)}%;background:${escapeHtml(item.cat.color)}"></div>
                       </div>
                     </button>
                   `
                     )
                     .join('')}
                 </div>
               </div>`
        }
      </section>

      ${
        recentTxs.length > 0
          ? `<section class="stack" style="gap:8px;">
               <div class="section-header" style="margin-bottom:0;padding:0 4px;">
                 <h2 class="section-title">Последние операции</h2>
                 <button type="button" class="btn-link" id="seeAllTxBtn">Все →</button>
               </div>
               <div class="tx-list">
                 ${recentTxs
                   .map((t) => {
                     const cat = catMap.get(t.categoryId) || { name: 'Без категории', icon: 'tag', color: '#64748B' };
                     const sub = [formatDayHeader(t.date), t.comment].filter(Boolean).join(' · ');
                     return `
                       <button type="button" class="tx-row" data-recent-tx="${escapeHtml(t.id)}">
                         <div class="tx-left">
                           <span class="cat-badge" style="background:${escapeHtml(cat.color)}20;color:${escapeHtml(cat.color)}">
                             ${svgIcon(cat.icon, 18)}
                           </span>
                           <div class="tx-info">
                             <div class="tx-cat">${escapeHtml(cat.name)}</div>
                             <div class="tx-comment">${escapeHtml(sub)}</div>
                           </div>
                         </div>
                         <div class="tx-amount num ${t.type === 'income' ? 'text-income' : 'text-expense'}">
                           ${formatMoney(t.amount, { type: t.type })}
                         </div>
                       </button>
                     `;
                   })
                   .join('')}
               </div>
             </section>`
          : ''
      }
    </div>
  `;

  mainEl.querySelectorAll('[data-period-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.periodMode = btn.dataset.periodMode;
      state.selectedDonutCatId = null;
      renderOverview();
    });
  });
  document.getElementById('prevPeriodBtn')?.addEventListener('click', () => {
    ctx.step(-1);
    state.selectedDonutCatId = null;
    renderOverview();
  });
  document.getElementById('nextPeriodBtn')?.addEventListener('click', () => {
    ctx.step(1);
    state.selectedDonutCatId = null;
    renderOverview();
  });
  document.getElementById('resetPeriodBtn')?.addEventListener('click', () => {
    ctx.reset();
    state.selectedDonutCatId = null;
    renderOverview();
  });
  mainEl.querySelectorAll('[data-trend-key]').forEach((btn) => {
    btn.addEventListener('click', () => {
      ctx.selectBar(btn.dataset.trendKey);
      state.selectedDonutCatId = null;
      renderOverview();
    });
  });
  mainEl.querySelectorAll('[data-overview-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.overviewMode = btn.dataset.overviewMode;
      state.selectedDonutCatId = null;
      renderOverview();
    });
  });
  mainEl.querySelectorAll('[data-donut-cat]').forEach((el) => {
    el.addEventListener('click', () => {
      const id = el.dataset.donutCat;
      state.selectedDonutCatId = state.selectedDonutCatId === id ? null : id;
      renderOverview();
    });
  });
  mainEl.querySelectorAll('[data-breakdown-cat]').forEach((el) => {
    el.addEventListener('click', () => {
      const id = el.dataset.breakdownCat;
      if (state.selectedDonutCatId === id) {
        jumpToFilteredTransactions(id);
      } else {
        state.selectedDonutCatId = id;
        renderOverview();
      }
    });
  });
  document.getElementById('filterBySelectedCatBtn')?.addEventListener('click', () => {
    if (state.selectedDonutCatId) jumpToFilteredTransactions(state.selectedDonutCatId);
  });
  document.getElementById('seeAllTxBtn')?.addEventListener('click', () => {
    state.filters.type = 'all';
    state.filters.categoryId = 'all';
    state.filters.search = '';
    state.filters.monthMode = 'selected';
    setTab('transactions');
  });
  mainEl.querySelectorAll('[data-recent-tx]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tx = state.transactions.find((t) => t.id === btn.dataset.recentTx);
      if (tx) openTransactionSheet(tx);
    });
  });
}

function jumpToFilteredTransactions(categoryId) {
  state.filters.categoryId = categoryId;
  state.filters.type = state.overviewMode;
  state.filters.monthMode = 'selected';
  setTab('transactions');
}

// ============================================================
// TRANSACTIONS TAB
// ============================================================
function renderTransactionsTab() {
  const catOptions = state.categories
    .filter((c) => state.filters.type === 'all' || c.type === state.filters.type)
    .map((c) => `<option value="${escapeHtml(c.id)}" ${state.filters.categoryId === c.id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`)
    .join('');

  mainEl.innerHTML = `
    <div class="stack">
      <div class="page-title-row">
        <h1 class="page-title">Операции</h1>
      </div>

      <div class="month-bar">
        <button type="button" class="month-nav-btn" id="txPrevMonth" aria-label="Предыдущий месяц">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div class="month-label-wrap">
          <span class="month-label">${state.filters.monthMode === 'all' ? 'Все месяцы' : escapeHtml(formatMonthLabel(state.monthKey))}</span>
        </div>
        <button type="button" class="month-nav-btn" id="txNextMonth" aria-label="Следующий месяц">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      <div class="filters-bar">
        <div class="search-wrap">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input type="search" class="input search-input" id="txSearchInput" placeholder="Поиск по комментарию, категории, сумме..." value="${escapeHtml(state.filters.search)}">
        </div>
        <div class="chip-strip">
          <button type="button" class="filter-chip ${state.filters.monthMode === 'all' ? 'active' : ''}" id="toggleMonthScopeBtn">
            ${state.filters.monthMode === 'all' ? 'Все даты' : 'За месяц'}
          </button>
          <button type="button" class="filter-chip ${state.filters.type === 'all' ? 'active' : ''}" data-filter-type="all">Все</button>
          <button type="button" class="filter-chip ${state.filters.type === 'expense' ? 'active' : ''}" data-filter-type="expense">Расходы</button>
          <button type="button" class="filter-chip ${state.filters.type === 'income' ? 'active' : ''}" data-filter-type="income">Доходы</button>
          <select class="filter-select-chip ${state.filters.categoryId !== 'all' ? 'active' : ''}" id="txCatFilter" aria-label="Фильтр по категории">
            <option value="all">Категория: все</option>
            ${catOptions}
          </select>
        </div>
      </div>

      <div id="txFeedContainer" class="stack"></div>
    </div>
  `;

  document.getElementById('txPrevMonth')?.addEventListener('click', () => {
    state.filters.monthMode = 'selected';
    state.monthKey = shiftMonth(state.monthKey, -1);
    renderTransactionsTab();
  });
  document.getElementById('txNextMonth')?.addEventListener('click', () => {
    state.filters.monthMode = 'selected';
    state.monthKey = shiftMonth(state.monthKey, 1);
    renderTransactionsTab();
  });
  document.getElementById('toggleMonthScopeBtn')?.addEventListener('click', () => {
    state.filters.monthMode = state.filters.monthMode === 'all' ? 'selected' : 'all';
    renderTransactionsTab();
  });
  document.getElementById('txSearchInput')?.addEventListener('input', (e) => {
    state.filters.search = e.target.value;
    renderTransactionsFeedOnly();
  });
  mainEl.querySelectorAll('[data-filter-type]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.filters.type = btn.dataset.filterType;
      state.filters.categoryId = 'all';
      renderTransactionsTab();
    });
  });
  document.getElementById('txCatFilter')?.addEventListener('change', (e) => {
    state.filters.categoryId = e.target.value;
    e.target.classList.toggle('active', e.target.value !== 'all');
    renderTransactionsFeedOnly();
  });

  renderTransactionsFeedOnly();
}

function renderTransactionsFeedOnly() {
  const container = document.getElementById('txFeedContainer');
  if (!container) return;

  const catMap = getCategoryMap();
  const q = state.filters.search.trim().toLowerCase();

  const filtered = state.transactions.filter((t) => {
    if (state.filters.monthMode === 'selected' && !t.date.startsWith(state.monthKey)) return false;
    if (state.filters.type !== 'all' && t.type !== state.filters.type) return false;
    if (state.filters.categoryId !== 'all' && t.categoryId !== state.filters.categoryId) return false;
    if (q) {
      const catName = (catMap.get(t.categoryId)?.name || '').toLowerCase();
      const comment = (t.comment || '').toLowerCase();
      const amt = String(t.amount);
      if (!catName.includes(q) && !comment.includes(q) && !amt.includes(q)) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="card empty-state">
        <div class="empty-state-title">Операции не найдены</div>
        <div>Попробуйте изменить фильтры или добавить новую операцию.</div>
      </div>
    `;
    return;
  }

  let expSum = 0;
  let incSum = 0;
  const byDay = new Map();
  for (const t of filtered) {
    if (t.type === 'income') incSum += t.amount;
    else expSum += t.amount;
    if (!byDay.has(t.date)) byDay.set(t.date, []);
    byDay.get(t.date).push(t);
  }

  const totalsParts = [];
  if (expSum > 0) totalsParts.push(`<span class="text-expense">${formatMoney(expSum, { type: 'expense' })}</span>`);
  if (incSum > 0) totalsParts.push(`<span class="text-income">${formatMoney(incSum, { type: 'income' })}</span>`);

  const summaryHtml = `
    <div class="search-summary-pill">
      <span class="num">Операций: <strong>${filtered.length}</strong></span>
      <div class="search-summary-totals num">${totalsParts.join('')}</div>
    </div>
  `;

  container.innerHTML =
    summaryHtml +
    [...byDay.entries()]
      .map(([dateStr, items]) => {
        const dayNet = items.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
        return `
          <div class="day-group">
            <div class="day-header">
              <span>${escapeHtml(formatDayHeader(dateStr))}</span>
              <span class="num">${formatMoney(dayNet, { signed: true })}</span>
            </div>
            <div class="tx-list">
              ${items
                .map((t) => {
                  const cat = catMap.get(t.categoryId) || { name: 'Без категории', icon: 'tag', color: '#64748B' };
                  return `
                    <button type="button" class="tx-row" data-edit-tx="${escapeHtml(t.id)}">
                      <div class="tx-left">
                        <span class="cat-badge" style="background:${escapeHtml(cat.color)}20;color:${escapeHtml(cat.color)}">
                          ${svgIcon(cat.icon, 18)}
                        </span>
                        <div class="tx-info">
                          <div class="tx-cat">${escapeHtml(cat.name)}</div>
                          ${t.comment ? `<div class="tx-comment">${escapeHtml(t.comment)}</div>` : ''}
                        </div>
                      </div>
                      <div class="tx-amount num ${t.type === 'income' ? 'text-income' : 'text-expense'}">
                        ${formatMoney(t.amount, { type: t.type })}
                      </div>
                    </button>
                  `;
                })
                .join('')}
            </div>
          </div>
        `;
      })
      .join('');

  container.querySelectorAll('[data-edit-tx]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tx = state.transactions.find((t) => t.id === btn.dataset.editTx);
      if (tx) openTransactionSheet(tx);
    });
  });
}

// ============================================================
// CATEGORIES TAB
// ============================================================
function renderCategoriesTab() {
  const counts = new Map();
  for (const t of state.transactions) {
    counts.set(t.categoryId, (counts.get(t.categoryId) || 0) + 1);
  }

  const renderGroup = (type, title) => {
    const list = state.categories.filter((c) => c.type === type);
    return `
      <section class="stack">
        <div class="section-header" style="margin-bottom:0;">
          <h2 class="section-title">${title}</h2>
          <button type="button" class="btn btn-secondary btn-sm" data-add-cat="${type}">+ Добавить</button>
        </div>
        <div class="cat-manage-grid">
          ${list
            .map((cat) => {
              const cnt = counts.get(cat.id) || 0;
              return `
                <div class="cat-card">
                  <div class="cat-card-main">
                    <span class="cat-badge" style="background:${escapeHtml(cat.color)}20;color:${escapeHtml(cat.color)}">
                      ${svgIcon(cat.icon, 18)}
                    </span>
                    <div style="min-width:0;">
                      <div class="tx-cat">${escapeHtml(cat.name)}</div>
                      <div class="cat-card-meta num">${cnt} опер.</div>
                    </div>
                  </div>
                  <div style="display:flex;gap:2px;">
                    <button type="button" class="icon-btn" data-edit-cat="${escapeHtml(cat.id)}" aria-label="Редактировать">
                      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    </button>
                    ${
                      list.length > 1
                        ? `<button type="button" class="icon-btn" data-del-cat="${escapeHtml(cat.id)}" aria-label="Удалить">
                             <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
                           </button>`
                        : ''
                    }
                  </div>
                </div>
              `;
            })
            .join('')}
        </div>
      </section>
    `;
  };

  mainEl.innerHTML = `
    <div class="stack" style="gap:20px;">
      <div class="page-title-row">
        <h1 class="page-title">Категории</h1>
      </div>
      ${renderGroup('expense', 'Расходы')}
      ${renderGroup('income', 'Доходы')}
    </div>
  `;

  mainEl.querySelectorAll('[data-add-cat]').forEach((btn) => {
    btn.addEventListener('click', () => openCategorySheet(null, btn.dataset.addCat));
  });
  mainEl.querySelectorAll('[data-edit-cat]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = state.categories.find((c) => c.id === btn.dataset.editCat);
      if (cat) openCategorySheet(cat);
    });
  });
  mainEl.querySelectorAll('[data-del-cat]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = state.categories.find((c) => c.id === btn.dataset.delCat);
      if (cat) openDeleteCategorySheet(cat);
    });
  });
}

// ============================================================
// SETTINGS TAB
// ============================================================
function renderSettingsTab() {
  const txCount = state.transactions.length;
  const hasDemo = state.transactions.some((t) => t.isDemo);
  const ghConnected = isGitHubConfigured();
  const lastBackup = state.settings.ghLastSyncAt || state.settings.lastBackupAt;
  const daysSinceBackup = lastBackup ? Math.floor((Date.now() - lastBackup) / 86400000) : null;
  const needsBackup = !ghConnected && txCount > 0 && (daysSinceBackup === null || daysSinceBackup >= 30);

  const backupLabel = lastBackup
    ? new Date(lastBackup).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'ещё не создавался';

  const ghSyncLabel = state.settings.ghLastSyncAt
    ? new Date(state.settings.ghLastSyncAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    : 'ожидает синхронизации';

  mainEl.innerHTML = `
    <div class="stack">
      <div class="page-title-row">
        <h1 class="page-title">Настройки</h1>
      </div>
      ${
        needsBackup
          ? `<div class="alert-banner">
               <span>${daysSinceBackup === null ? 'Подключите GitHub Sync ниже или сделайте JSON-бэкап.' : `Бэкап не делался уже ${daysSinceBackup} дн. Сохраните копию.`}</span>
               <button type="button" class="btn btn-primary btn-sm" id="quickBackupBtn">Сохранить бэкап</button>
             </div>`
          : ''
      }

      <section class="card settings-group">
        <div class="section-header" style="margin-bottom:0;">
          <h2 class="section-title">Автосинхронизация с GitHub</h2>
          <span class="sync-dot ${ghConnected ? state.syncStatus : ''}" data-sync-dot></span>
        </div>
        <div class="setting-desc">
          ${
            ghConnected
              ? `Подключено к <strong>${escapeHtml(state.settings.ghRepo)}</strong> · последний обмен: ${escapeHtml(ghSyncLabel)}${state.syncError ? ` · ошибка: ${escapeHtml(state.syncError)}` : ''}`
              : 'Каждая новая операция автоматически сохраняется в приватный репозиторий GitHub — ручные бэкапы больше не нужны.'
          }
        </div>
        <div class="stack" style="gap:8px;">
          <input type="text" class="input" id="ghRepoInput" placeholder="owner/repo" value="${escapeHtml(state.settings.ghRepo || 'ilyamaksimov86-ai/adma-finance-data')}">
          <input type="password" class="input" id="ghTokenInput" placeholder="${ghConnected ? 'Токен сохранён (вставьте новый, чтобы заменить)' : 'Вставьте GitHub Fine-grained token (github_pat_...)'}" value="" autocomplete="off">
        </div>
        <div class="btn-row">
          <button type="button" class="btn btn-primary" id="saveGhSyncBtn">${ghConnected ? 'Сохранить и синхр.' : 'Подключить GitHub'}</button>
          ${
            ghConnected
              ? `<button type="button" class="btn btn-secondary" id="syncNowBtn">Выгрузить сейчас</button>
                 <button type="button" class="btn btn-secondary" id="pullGhBtn">Загрузить из GitHub</button>
                 <button type="button" class="btn btn-danger" id="disconnectGhBtn">Отключить</button>`
              : ''
          }
        </div>
      </section>

      <section class="card settings-group">
        <h2 class="section-title">Внешний вид и валюта</h2>
        <div class="setting-row">
          <div>
            <div class="setting-title">Валюта</div>
            <div class="setting-desc">Символ отображения сумм</div>
          </div>
          <div class="segmented">
            ${['₽', '$', '€']
              .map((c) => `<button type="button" class="seg-btn ${state.settings.currency === c ? 'active' : ''}" data-set-currency="${c}">${c}</button>`)
              .join('')}
          </div>
        </div>
        <div class="setting-row">
          <div>
            <div class="setting-title">Тема оформления</div>
            <div class="setting-desc">Системная, светлая или тёмная</div>
          </div>
          <div class="segmented">
            ${[
              ['system', 'Система'],
              ['light', 'Светлая'],
              ['dark', 'Тёмная'],
            ]
              .map(([v, label]) => `<button type="button" class="seg-btn ${state.settings.theme === v ? 'active' : ''}" data-set-theme="${v}">${label}</button>`)
              .join('')}
          </div>
        </div>
      </section>

      <section class="card settings-group">
        <h2 class="section-title">Данные и резервные копии</h2>
        <div class="setting-row">
          <div>
            <div class="setting-title">Локальное хранилище (IndexedDB)</div>
            <div class="setting-desc num">Сохранено операций: <strong>${txCount}</strong> · Последний бэкап: ${escapeHtml(backupLabel)}</div>
          </div>
        </div>

        <div class="btn-row">
          <button type="button" class="btn btn-primary" id="importCsvBtn">Импорт CSV</button>
          <button type="button" class="btn btn-secondary" id="exportCsvBtn">Экспорт CSV</button>
          <button type="button" class="btn btn-secondary" id="exportJsonBtn">Бэкап JSON</button>
          <button type="button" class="btn btn-secondary" id="importJsonBtn">Восстановить JSON</button>
        </div>

        <input type="file" id="csvFileInput" accept=".csv,text/csv" hidden>
        <input type="file" id="jsonFileInput" accept=".json,application/json" hidden>
      </section>

      <section class="card settings-group">
        <h2 class="section-title">Сброс данных</h2>
        <div class="btn-row">
          ${hasDemo ? '<button type="button" class="btn btn-secondary" id="clearDemoBtn">Очистить демо-данные</button>' : ''}
          <button type="button" class="btn btn-danger" id="clearAllBtn">Удалить все данные</button>
        </div>
      </section>
    </div>
  `;

  mainEl.querySelectorAll('[data-set-currency]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await setSetting('currency', btn.dataset.setCurrency);
      state.settings.currency = btn.dataset.setCurrency;
      renderSettingsTab();
      showToast(`Валюта изменена на ${btn.dataset.setCurrency}`);
    });
  });

  mainEl.querySelectorAll('[data-set-theme]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await setSetting('theme', btn.dataset.setTheme);
      state.settings.theme = btn.dataset.setTheme;
      applyTheme();
      renderSettingsTab();
    });
  });

  document.getElementById('saveGhSyncBtn')?.addEventListener('click', async () => {
    const repo = (document.getElementById('ghRepoInput')?.value || '').trim();
    const newToken = (document.getElementById('ghTokenInput')?.value || '').trim();
    const effectiveToken = newToken || (state.settings.ghToken || '').trim();
    if (!repo || !repo.includes('/')) {
      showToast('Укажите репозиторий в формате owner/repo');
      return;
    }
    if (!effectiveToken) {
      showToast('Вставьте GitHub token');
      return;
    }
    await setSetting('ghRepo', repo);
    await setSetting('ghToken', effectiveToken);
    state.settings.ghRepo = repo;
    state.settings.ghToken = effectiveToken;
    showToast('Подключаю GitHub...');
    await pullFromGitHub({ silent: false });
    renderSettingsTab();
  });

  document.getElementById('syncNowBtn')?.addEventListener('click', async () => {
    await pushToGitHub({ silent: false });
  });

  document.getElementById('pullGhBtn')?.addEventListener('click', async () => {
    await pullFromGitHub({ force: true, silent: false });
  });

  document.getElementById('disconnectGhBtn')?.addEventListener('click', async () => {
    await setSetting('ghToken', '');
    state.settings.ghToken = '';
    state.syncStatus = 'idle';
    state.syncError = '';
    renderSettingsTab();
    showToast('GitHub Sync отключён');
  });

  document.getElementById('quickBackupBtn')?.addEventListener('click', handleExportJson);
  document.getElementById('exportJsonBtn')?.addEventListener('click', handleExportJson);
  document.getElementById('exportCsvBtn')?.addEventListener('click', handleExportCsv);

  const csvInput = document.getElementById('csvFileInput');
  document.getElementById('importCsvBtn')?.addEventListener('click', () => csvInput.click());
  csvInput?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      openCsvImportPreview(text, file.name);
    } catch (err) {
      showToast(`Ошибка чтения CSV: ${err.message}`);
    }
  });

  const jsonInput = document.getElementById('jsonFileInput');
  document.getElementById('importJsonBtn')?.addEventListener('click', () => jsonInput.click());
  jsonInput?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      openRestoreJsonConfirmSheet(parsed, file.name);
    } catch {
      showToast('Не удалось прочитать JSON-файл резервной копии');
    }
  });

  document.getElementById('clearDemoBtn')?.addEventListener('click', async () => {
    const removed = await clearDemoData();
    await reloadData();
    scheduleAutoSync();
    renderSettingsTab();
    showToast(`Удалено демо-операций: ${removed}`);
  });

  document.getElementById('clearAllBtn')?.addEventListener('click', () => {
    openClearAllConfirmSheet();
  });
}

// ============================================================
// QUICK ENTRY & EDIT TRANSACTION SHEET
// ============================================================
function openTransactionSheet(existingTx = null) {
  const type = existingTx ? existingTx.type : 'expense';
  const catsOfType = getSortedCategoriesForType(type);
  state.activeSheet = 'tx';
  state.txForm = {
    id: existingTx ? existingTx.id : null,
    type,
    expr: existingTx ? String(existingTx.amount) : '',
    categoryId: existingTx ? existingTx.categoryId : catsOfType[0]?.id || '',
    date: existingTx ? existingTx.date : todayISO(0),
    comment: existingTx ? existingTx.comment || '' : '',
    createdAt: existingTx ? existingTx.createdAt : null,
    showAllCats: false,
  };
  renderTransactionSheet();
  openSheetBackdrop();
  if (!existingTx) {
    setTimeout(() => document.getElementById('txAmountInput')?.focus(), 50);
  }
}

function evalAmountExpr(expr) {
  const clean = String(expr || '')
    .replace(/,/g, '.')
    .replace(/−/g, '-')
    .replace(/[^0-9.+\-]/g, '');
  if (!clean) return 0;
  // Safe tokenizer for + and -
  const tokens = clean.match(/[+\-]?[0-9]*\.?[0-9]+/g);
  if (!tokens) return 0;
  let sum = 0;
  for (const tok of tokens) {
    const n = parseFloat(tok);
    if (Number.isFinite(n)) sum += n;
  }
  return Math.round(sum * 100) / 100;
}

function renderTransactionSheet() {
  const f = state.txForm;
  const allCats = getSortedCategoriesForType(f.type);
  if (!allCats.some((c) => c.id === f.categoryId) && allCats[0]) {
    f.categoryId = allCats[0].id;
  }

  let visibleCats = allCats;
  if (!f.showAllCats && allCats.length > 8) {
    visibleCats = allCats.slice(0, 8);
    if (!visibleCats.some((c) => c.id === f.categoryId)) {
      const selectedCat = allCats.find((c) => c.id === f.categoryId);
      if (selectedCat) visibleCats[7] = selectedCat;
    }
  }

  const commentHints = getTopCommentsForCategory(f.categoryId, 4);
  const evaluated = evalAmountExpr(f.expr);
  const hasOp = /[+\-]/.test(f.expr.slice(1));
  const cur = state.settings.currency || '₽';

  sheetContainer.innerHTML = `
    <div class="sheet-handle"></div>
    <div class="sheet-header">
      <h3 class="sheet-title">${f.id ? 'Редактировать' : 'Новая операция'}</h3>
      <button type="button" class="icon-btn" id="closeSheetBtn" aria-label="Закрыть">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>

    <div class="sheet-body">
      <div class="segmented segmented-full">
        <button type="button" class="seg-btn ${f.type === 'expense' ? 'active' : ''}" data-tx-type="expense">Расход</button>
        <button type="button" class="seg-btn ${f.type === 'income' ? 'active' : ''}" data-tx-type="income">Доход</button>
      </div>

      <div class="amount-display-box">
        <div class="amount-expr num" id="amountExprHint">${hasOp ? `= ${evaluated.toLocaleString('ru-RU')}\u00A0${cur}` : ''}</div>
        <div class="amount-input-row">
          <input
            type="text"
            inputmode="decimal"
            autocomplete="off"
            class="amount-input num ${f.type === 'income' ? 'text-income' : 'text-expense'}"
            id="txAmountInput"
            placeholder="0"
            value="${escapeHtml(f.expr)}"
            aria-label="Сумма операции"
          >
          <span class="amount-currency ${f.type === 'income' ? 'text-income' : 'text-expense'}">${cur}</span>
        </div>
      </div>

      <div class="stack" style="gap:8px;">
        <div class="cat-picker-grid">
          ${visibleCats
            .map(
              (c) => `
            <button type="button" class="cat-pick-btn ${f.categoryId === c.id ? 'selected' : ''}" data-pick-cat="${escapeHtml(c.id)}">
              <span class="cat-badge" style="background:${escapeHtml(c.color)}20;color:${escapeHtml(c.color)}">
                ${svgIcon(c.icon, 18)}
              </span>
              <span class="cat-pick-label">${escapeHtml(c.name)}</span>
            </button>
          `
            )
            .join('')}
        </div>
        ${
          allCats.length > 8
            ? `<button type="button" class="btn btn-secondary btn-sm btn-full" id="toggleAllCatsBtn">
                 ${f.showAllCats ? 'Свернуть до частых' : `Показать все категории (${allCats.length})`}
               </button>`
            : ''
        }
      </div>

      <div class="date-chips">
        <button type="button" class="chip-btn ${f.date === todayISO(0) ? 'active' : ''}" data-quick-date="${todayISO(0)}">Сегодня</button>
        <button type="button" class="chip-btn ${f.date === todayISO(-1) ? 'active' : ''}" data-quick-date="${todayISO(-1)}">Вчера</button>
        <input type="date" class="date-input-inline" id="txDateInput" value="${escapeHtml(f.date)}">
      </div>

      <div>
        <input type="text" class="input" id="txCommentInput" placeholder="Комментарий (необязательно)" value="${escapeHtml(f.comment)}" maxlength="120">
        ${
          commentHints.length > 0
            ? `<div class="comment-hints">
                 ${commentHints
                   .map((hint) => `<button type="button" class="hint-chip" data-comment-hint="${escapeHtml(hint)}">${escapeHtml(hint)}</button>`)
                   .join('')}
               </div>`
            : ''
        }
      </div>
    </div>

    <div class="sheet-sticky-footer">
      <button type="button" class="btn btn-primary btn-full" id="saveTxBtn">${f.id ? 'Сохранить изменения' : 'Добавить операцию'}</button>
      ${f.id ? '<button type="button" class="btn btn-danger btn-full" id="deleteTxBtn">Удалить операцию</button>' : ''}
    </div>
  `;

  document.getElementById('closeSheetBtn')?.addEventListener('click', closeSheet);
  sheetContainer.querySelectorAll('[data-tx-type]').forEach((btn) => {
    btn.addEventListener('click', () => {
      f.type = btn.dataset.txType;
      f.showAllCats = false;
      renderTransactionSheet();
    });
  });
  sheetContainer.querySelectorAll('[data-pick-cat]').forEach((btn) => {
    btn.addEventListener('click', () => {
      f.categoryId = btn.dataset.pickCat;
      renderTransactionSheet();
    });
  });
  document.getElementById('toggleAllCatsBtn')?.addEventListener('click', () => {
    f.showAllCats = !f.showAllCats;
    renderTransactionSheet();
  });
  sheetContainer.querySelectorAll('[data-quick-date]').forEach((btn) => {
    btn.addEventListener('click', () => {
      f.date = btn.dataset.quickDate;
      renderTransactionSheet();
    });
  });
  document.getElementById('txDateInput')?.addEventListener('change', (e) => {
    f.date = e.target.value || todayISO(0);
    renderTransactionSheet();
  });
  const commentInput = document.getElementById('txCommentInput');
  commentInput?.addEventListener('input', (e) => {
    f.comment = e.target.value;
  });
  sheetContainer.querySelectorAll('[data-comment-hint]').forEach((btn) => {
    btn.addEventListener('click', () => {
      f.comment = btn.dataset.commentHint;
      if (commentInput) commentInput.value = f.comment;
    });
  });
  const amountInput = document.getElementById('txAmountInput');
  amountInput?.addEventListener('input', (e) => {
    f.expr = e.target.value.replace(/[^0-9.,+\-\s]/g, '');
    if (e.target.value !== f.expr) e.target.value = f.expr;
    const hint = document.getElementById('amountExprHint');
    if (hint) {
      const hasMath = /[+\-]/.test(f.expr.trim().slice(1));
      hint.textContent = hasMath ? `= ${evalAmountExpr(f.expr).toLocaleString('ru-RU')}\u00A0${cur}` : '';
    }
  });
  document.getElementById('saveTxBtn')?.addEventListener('click', handleSaveTransaction);
  document.getElementById('deleteTxBtn')?.addEventListener('click', handleDeleteTransaction);
}

async function handleSaveTransaction() {
  const f = state.txForm;
  if (!f) return;
  const amount = evalAmountExpr(f.expr);
  if (!Number.isFinite(amount) || amount <= 0) {
    showToast('Введите сумму больше 0');
    return;
  }
  if (!f.categoryId) {
    showToast('Выберите категорию');
    return;
  }
  const saved = await saveTransaction({
    id: f.id,
    type: f.type,
    amount,
    categoryId: f.categoryId,
    date: f.date || todayISO(0),
    comment: f.comment,
    createdAt: f.createdAt || Date.now(),
  });
  await reloadData();
  state.selectedDate = saved.date;
  state.monthKey = saved.date.slice(0, 7);
  scheduleAutoSync();
  closeSheet();
  renderMain();
  showToast(f.id ? 'Операция обновлена' : 'Операция добавлена');
}

async function handleDeleteTransaction() {
  const f = state.txForm;
  if (!f || !f.id) return;
  const backup = state.transactions.find((t) => t.id === f.id);
  if (!backup) return;
  await deleteTransaction(backup.id);
  await reloadData();
  scheduleAutoSync();
  closeSheet();
  renderMain();
  showToast('Операция удалена', {
    actionLabel: 'Отменить',
    duration: 4000,
    onAction: async () => {
      await saveTransaction(backup);
      await reloadData();
      scheduleAutoSync();
      renderMain();
      showToast('Операция восстановлена');
    },
  });
}

// ============================================================
// CATEGORY SHEETS
// ============================================================
function openCategorySheet(existing = null, defaultType = 'expense') {
  state.activeSheet = 'category';
  state.catForm = {
    id: existing ? existing.id : null,
    name: existing ? existing.name : '',
    type: existing ? existing.type : defaultType,
    icon: existing ? existing.icon : 'tag',
    color: existing ? existing.color : PALETTE[0],
    order: existing ? existing.order : state.categories.length + 1,
  };
  renderCategorySheet();
  openSheetBackdrop();
}

function renderCategorySheet() {
  const c = state.catForm;
  sheetContainer.innerHTML = `
    <div class="sheet-handle"></div>
    <div class="sheet-header">
      <h3 class="sheet-title">${c.id ? 'Редактировать категорию' : 'Новая категория'}</h3>
      <button type="button" class="icon-btn" id="closeSheetBtn" aria-label="Закрыть">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>

    <div class="sheet-body">
      <div>
        <div class="muted-label">Название</div>
        <input type="text" class="input" id="catNameInput" value="${escapeHtml(c.name)}" placeholder="Например, Спорт или Такси" maxlength="40">
      </div>

      ${
        c.id
          ? ''
          : `<div class="segmented segmented-full">
               <button type="button" class="seg-btn ${c.type === 'expense' ? 'active' : ''}" data-cat-type="expense">Расход</button>
               <button type="button" class="seg-btn ${c.type === 'income' ? 'active' : ''}" data-cat-type="income">Доход</button>
             </div>`
      }

      <div>
        <div class="muted-label">Цвет</div>
        <div class="color-picker-row">
          ${PALETTE.map((hex) => `<button type="button" class="color-dot ${c.color === hex ? 'selected' : ''}" data-cat-color="${hex}" style="background:${hex}" aria-label="${hex}"></button>`).join('')}
        </div>
      </div>

      <div>
        <div class="muted-label">Иконка</div>
        <div class="icon-picker-grid">
          ${Object.keys(ICONS)
            .map((key) => `<button type="button" class="icon-pick-cell ${c.icon === key ? 'selected' : ''}" data-cat-icon="${key}" aria-label="${key}">${svgIcon(key, 19)}</button>`)
            .join('')}
        </div>
      </div>
    </div>

    <div class="sheet-sticky-footer">
      <button type="button" class="btn btn-primary btn-full" id="saveCatBtn">Сохранить</button>
    </div>
  `;

  document.getElementById('closeSheetBtn')?.addEventListener('click', closeSheet);
  document.getElementById('catNameInput')?.addEventListener('input', (e) => {
    c.name = e.target.value;
  });
  sheetContainer.querySelectorAll('[data-cat-type]').forEach((btn) => {
    btn.addEventListener('click', () => {
      c.type = btn.dataset.catType;
      renderCategorySheet();
    });
  });
  sheetContainer.querySelectorAll('[data-cat-color]').forEach((btn) => {
    btn.addEventListener('click', () => {
      c.color = btn.dataset.catColor;
      renderCategorySheet();
    });
  });
  sheetContainer.querySelectorAll('[data-cat-icon]').forEach((btn) => {
    btn.addEventListener('click', () => {
      c.icon = btn.dataset.catIcon;
      renderCategorySheet();
    });
  });
  document.getElementById('saveCatBtn')?.addEventListener('click', async () => {
    const name = c.name.trim();
    if (!name) {
      showToast('Введите название категории');
      return;
    }
    await saveCategory({ ...c, name });
    await reloadData();
    scheduleAutoSync();
    closeSheet();
    renderMain();
    showToast(c.id ? 'Категория обновлена' : 'Категория создана');
  });
}

function openDeleteCategorySheet(cat) {
  const linkedCount = state.transactions.filter((t) => t.categoryId === cat.id).length;
  const alternatives = state.categories.filter((c) => c.type === cat.type && c.id !== cat.id);
  const defaultTarget =
    alternatives.find((c) => c.name.toLowerCase() === 'прочее' || c.name.toLowerCase() === 'другое') || alternatives[0];

  state.activeSheet = 'deleteCat';
  sheetContainer.innerHTML = `
    <div class="sheet-handle"></div>
    <div class="sheet-header">
      <h3 class="sheet-title">Удалить «${escapeHtml(cat.name)}»?</h3>
      <button type="button" class="icon-btn" id="closeSheetBtn" aria-label="Закрыть">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="sheet-body">
      ${
        linkedCount > 0
          ? `<div class="setting-desc">В этой категории <strong>${linkedCount}</strong> опер. Выберите, куда их перенести:</div>
             <select class="select" id="reassignCatSelect">
               ${alternatives.map((a) => `<option value="${escapeHtml(a.id)}" ${defaultTarget && a.id === defaultTarget.id ? 'selected' : ''}>${escapeHtml(a.name)}</option>`).join('')}
             </select>`
          : '<div class="setting-desc">В этой категории нет операций. Она будет удалена без потерь.</div>'
      }
    </div>
    <div class="sheet-sticky-footer">
      <div class="btn-row">
        <button type="button" class="btn btn-secondary" id="cancelDelCatBtn" style="flex:1">Отмена</button>
        <button type="button" class="btn btn-danger" id="confirmDelCatBtn" style="flex:1">Удалить</button>
      </div>
    </div>
  `;
  openSheetBackdrop();
  document.getElementById('closeSheetBtn')?.addEventListener('click', closeSheet);
  document.getElementById('cancelDelCatBtn')?.addEventListener('click', closeSheet);
  document.getElementById('confirmDelCatBtn')?.addEventListener('click', async () => {
    const targetId = document.getElementById('reassignCatSelect')?.value || defaultTarget?.id || null;
    await deleteCategoryAndReassign(cat.id, targetId);
    await reloadData();
    scheduleAutoSync();
    closeSheet();
    renderMain();
    showToast(`Категория «${cat.name}» удалена`);
  });
}

// ============================================================
// CSV IMPORT / EXPORT & JSON BACKUP
// ============================================================
function parseCsvText(rawText) {
  const text = rawText.replace(/^\uFEFF/, '').trim();
  if (!text) throw new Error('Файл пуст');

  // Detect delimiter from first line outside quotes
  const firstLine = text.split(/\r?\n/)[0] || '';
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;
  const delimiter = semiCount > commaCount ? ';' : ',';

  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(cell);
      cell = '';
    } else if (ch === '\r' && next === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      i++;
    } else if (ch === '\n' || ch === '\r') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += ch;
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  if (rows.length < 2) throw new Error('Нет строк с операциями');

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idx = {
    date: header.indexOf('date'),
    type: header.indexOf('type'),
    amount: header.indexOf('amount'),
    category: header.indexOf('category'),
    comment: header.indexOf('comment'),
  };
  if (idx.date === -1 || idx.type === -1 || idx.amount === -1 || idx.category === -1) {
    throw new Error('Ожидаются колонки: date, type, amount, category, comment');
  }

  const parsed = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.every((v) => !v.trim())) continue;
    const date = (r[idx.date] || '').trim();
    const rawType = (r[idx.type] || '').trim().toLowerCase();
    const type = rawType === 'income' || rawType === 'доход' ? 'income' : rawType === 'expense' || rawType === 'расход' ? 'expense' : null;
    const amount = parseFloat((r[idx.amount] || '').replace(/\s+/g, '').replace(',', '.'));
    const category = (r[idx.category] || '').trim() || 'Прочее';
    const comment = idx.comment >= 0 ? (r[idx.comment] || '').trim() : '';

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !type || !Number.isFinite(amount) || amount <= 0) {
      continue;
    }
    parsed.push({
      date,
      type,
      amount: Math.round(amount * 100) / 100,
      category,
      comment,
    });
  }

  if (parsed.length === 0) throw new Error('Не найдено валидных операций');
  return parsed;
}

function makeDedupKey(date, type, amount, categoryName, comment) {
  return `${date}|${type}|${Number(amount).toFixed(2)}|${categoryName.trim().toLowerCase()}|${(comment || '').trim().toLowerCase()}`;
}

function openCsvImportPreview(csvText, fileName) {
  const rows = parseCsvText(csvText);
  const existingCatKeys = new Set(state.categories.map((c) => `${c.type}|${c.name.trim().toLowerCase()}`));
  const newCatsMap = new Map();
  for (const r of rows) {
    const key = `${r.type}|${r.category.toLowerCase()}`;
    if (!existingCatKeys.has(key) && !newCatsMap.has(key)) {
      newCatsMap.set(key, { name: r.category, type: r.type });
    }
  }

  const catMap = getCategoryMap();
  const existingTxKeys = new Set(
    state.transactions.map((t) => makeDedupKey(t.date, t.type, t.amount, catMap.get(t.categoryId)?.name || '', t.comment))
  );
  let duplicateCount = 0;
  for (const r of rows) {
    if (existingTxKeys.has(makeDedupKey(r.date, r.type, r.amount, r.category, r.comment))) {
      duplicateCount += 1;
    }
  }

  const dates = rows.map((r) => r.date).sort();
  const newCats = [...newCatsMap.values()];

  state.activeSheet = 'csvImport';
  state.csvPreview = { rows, newCats, duplicateCount, skipDuplicates: true };

  sheetContainer.innerHTML = `
    <div class="sheet-handle"></div>
    <div class="sheet-header">
      <h3 class="sheet-title">Импорт CSV</h3>
      <button type="button" class="icon-btn" id="closeSheetBtn" aria-label="Закрыть">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="sheet-body">
      <div class="preview-box">
        <div><strong>Файл:</strong> ${escapeHtml(fileName)}</div>
        <div class="num"><strong>Найдено операций:</strong> ${rows.length}</div>
        <div class="num"><strong>Период:</strong> ${dates[0]} — ${dates[dates.length - 1]}</div>
        <div class="num"><strong>Совпадений с уже загруженными:</strong> ${duplicateCount}</div>
        <div>
          <strong>Новые категории (${newCats.length}):</strong>
          ${newCats.length ? escapeHtml(newCats.map((c) => c.name).join(', ')) : 'не требуются'}
        </div>
      </div>

      <label class="checkbox-row">
        <input type="checkbox" id="skipDupCheckbox" checked>
        <span>Пропускать дубликаты (дата + тип + сумма + категория + комментарий)</span>
      </label>
    </div>
    <div class="sheet-sticky-footer">
      <div class="btn-row">
        <button type="button" class="btn btn-secondary" id="cancelCsvBtn" style="flex:1">Отмена</button>
        <button type="button" class="btn btn-primary" id="confirmCsvBtn" style="flex:1">Импортировать</button>
      </div>
    </div>
  `;

  openSheetBackdrop();
  document.getElementById('closeSheetBtn')?.addEventListener('click', closeSheet);
  document.getElementById('cancelCsvBtn')?.addEventListener('click', closeSheet);
  document.getElementById('confirmCsvBtn')?.addEventListener('click', async () => {
    const skipDuplicates = document.getElementById('skipDupCheckbox')?.checked ?? true;
    await executeCsvImport(rows, newCats, skipDuplicates);
  });
}

async function executeCsvImport(rows, newCats, skipDuplicates) {
  const iconKeys = Object.keys(ICONS);
  let colorIdx = state.categories.length;
  for (const nc of newCats) {
    await saveCategory({
      name: nc.name,
      type: nc.type,
      icon: iconKeys[colorIdx % iconKeys.length],
      color: PALETTE[colorIdx % PALETTE.length],
      order: 100 + colorIdx,
    });
    colorIdx += 1;
  }

  const allCats = await getAllCategories();
  const catByKey = new Map(allCats.map((c) => [`${c.type}|${c.name.trim().toLowerCase()}`, c]));
  const catById = new Map(allCats.map((c) => [c.id, c]));

  const existingKeys = new Set(
    state.transactions.map((t) => makeDedupKey(t.date, t.type, t.amount, catById.get(t.categoryId)?.name || '', t.comment))
  );

  const toAdd = [];
  let skipped = 0;
  const now = Date.now();
  rows.forEach((r, idx) => {
    const dedup = makeDedupKey(r.date, r.type, r.amount, r.category, r.comment);
    if (skipDuplicates && existingKeys.has(dedup)) {
      skipped += 1;
      return;
    }
    const cat = catByKey.get(`${r.type}|${r.category.toLowerCase()}`);
    if (!cat) return;
    toAdd.push({
      id: generateId('tx'),
      type: r.type,
      amount: r.amount,
      categoryId: cat.id,
      date: r.date,
      comment: r.comment,
      createdAt: now + idx,
    });
  });

  if (toAdd.length > 0) {
    await bulkSaveTransactions(toAdd);
  }
  await setSetting('demoCleared', true);
  await reloadData();
  if (toAdd.length > 0) {
    const latestDate = toAdd.map((t) => t.date).sort().pop();
    if (latestDate) {
      state.selectedDate = latestDate;
      state.monthKey = latestDate.slice(0, 7);
    }
  }
  scheduleAutoSync();
  closeSheet();
  renderMain();
  showToast(`Импортировано: ${toAdd.length}${skipped ? `, пропущено дублей: ${skipped}` : ''}`);
}

function csvEscape(value) {
  const s = String(value ?? '');
  return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function handleExportCsv() {
  const catMap = getCategoryMap();
  const lines = ['date,type,amount,category,comment'];
  const sorted = [...state.transactions].sort((a, b) => a.date.localeCompare(b.date) || (a.createdAt || 0) - (b.createdAt || 0));
  for (const t of sorted) {
    const catName = catMap.get(t.categoryId)?.name || 'Прочее';
    lines.push([
      t.date,
      t.type,
      Number(t.amount).toFixed(2),
      csvEscape(catName),
      csvEscape(t.comment || ''),
    ].join(','));
  }
  const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `adma-export-${todayISO(0)}.csv`);
  showToast(`Экспортировано операций: ${sorted.length}`);
}

async function handleExportJson() {
  const payload = await exportFullBackup();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, `adma-backup-${todayISO(0)}.json`);
  await reloadData();
  if (state.tab === 'settings') renderSettingsTab();
  showToast('Резервная копия JSON сохранена');
}

function openRestoreJsonConfirmSheet(backupObj, fileName) {
  const txCnt = backupObj?.data?.transactions?.length ?? 0;
  const catCnt = backupObj?.data?.categories?.length ?? 0;
  state.activeSheet = 'restoreJson';
  sheetContainer.innerHTML = `
    <div class="sheet-handle"></div>
    <div class="sheet-header">
      <h3 class="sheet-title">Восстановить из JSON?</h3>
      <button type="button" class="icon-btn" id="closeSheetBtn" aria-label="Закрыть">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="sheet-body">
      <div class="preview-box">
        <div><strong>Файл:</strong> ${escapeHtml(fileName)}</div>
        <div class="num"><strong>Операций:</strong> ${txCnt} · <strong>Категорий:</strong> ${catCnt}</div>
        <div>Текущие данные на этом устройстве будут заменены содержимым резервной копии.</div>
      </div>
    </div>
    <div class="sheet-sticky-footer">
      <div class="btn-row">
        <button type="button" class="btn btn-secondary" id="cancelRestoreBtn" style="flex:1">Отмена</button>
        <button type="button" class="btn btn-primary" id="confirmRestoreBtn" style="flex:1">Восстановить</button>
      </div>
    </div>
  `;
  openSheetBackdrop();
  document.getElementById('closeSheetBtn')?.addEventListener('click', closeSheet);
  document.getElementById('cancelRestoreBtn')?.addEventListener('click', closeSheet);
  document.getElementById('confirmRestoreBtn')?.addEventListener('click', async () => {
    try {
      await importFullBackup(backupObj);
      await reloadData();
      closeSheet();
      renderMain();
      showToast(`Восстановлено операций: ${txCnt}`);
    } catch (err) {
      showToast(err.message || 'Ошибка восстановления');
    }
  });
}

function openClearAllConfirmSheet() {
  let step = 1;
  state.activeSheet = 'clearAll';
  const renderConfirm = () => {
    sheetContainer.innerHTML = `
      <div class="sheet-handle"></div>
      <div class="sheet-header">
        <h3 class="sheet-title">${step === 1 ? 'Удалить все данные?' : 'Подтвердите удаление'}</h3>
        <button type="button" class="icon-btn" id="closeSheetBtn" aria-label="Закрыть">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="sheet-body">
        <div class="setting-desc">
          ${
            step === 1
              ? `Будут удалены все операции (${state.transactions.length}) и пользовательские категории. Это действие нельзя отменить без JSON-бэкапа.`
              : 'Нажмите «Удалить навсегда» для полного сброса локальной базы данных.'
          }
        </div>
      </div>
      <div class="sheet-sticky-footer">
        <div class="btn-row">
          <button type="button" class="btn btn-secondary" id="cancelClearBtn" style="flex:1">Отмена</button>
          <button type="button" class="btn btn-danger" id="confirmClearBtn" style="flex:1">
            ${step === 1 ? 'Продолжить' : 'Удалить навсегда'}
          </button>
        </div>
      </div>
    `;
    document.getElementById('closeSheetBtn')?.addEventListener('click', closeSheet);
    document.getElementById('cancelClearBtn')?.addEventListener('click', closeSheet);
    document.getElementById('confirmClearBtn')?.addEventListener('click', async () => {
      if (step === 1) {
        step = 2;
        renderConfirm();
      } else {
        await clearAllData();
        await reloadData();
        closeSheet();
        renderMain();
        showToast('Все данные удалены');
      }
    });
  };
  renderConfirm();
  openSheetBackdrop();
}

// ============================================================
// SHEET HELPERS & KEYBOARD
// ============================================================
function openSheetBackdrop() {
  sheetBackdrop.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeSheet() {
  sheetBackdrop.hidden = true;
  document.body.style.overflow = '';
  state.activeSheet = null;
  state.txForm = null;
  state.catForm = null;
  state.csvPreview = null;
}

sheetBackdrop.addEventListener('click', (e) => {
  if (e.target === sheetBackdrop) closeSheet();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !sheetBackdrop.hidden) {
    closeSheet();
    return;
  }
  if (state.activeSheet === 'tx' && e.key === 'Enter') {
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT') {
      e.preventDefault();
      handleSaveTransaction();
    }
  }
});

// ============================================================
// BOOTSTRAP
// ============================================================
async function bootstrap() {
  // Inject bottom nav icons
  document.querySelectorAll('[data-nav-icon]').forEach((el) => {
    const key = el.dataset.navIcon;
    el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${NAV_ICONS[key] || ''}</svg>`;
  });

  document.querySelectorAll('[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => setTab(btn.dataset.tab));
  });

  document.getElementById('brandBtn')?.addEventListener('click', () => setTab('overview'));
  document.getElementById('desktopAddBtn')?.addEventListener('click', () => openTransactionSheet());
  document.getElementById('mobileAddBtn')?.addEventListener('click', () => openTransactionSheet());

  window.addEventListener('online', () => {
    updateOnlineStatus();
    if (isGitHubConfigured()) pushToGitHub({ silent: true });
  });
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
  }

  await initDatabase();
  await reloadData();
  setTab('overview');
  if (isGitHubConfigured() && navigator.onLine) {
    pullFromGitHub({ silent: true });
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).catch((err) => {
      console.warn('SW registration failed:', err);
    });
  }
}

bootstrap();
