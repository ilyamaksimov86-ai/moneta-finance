const DB_NAME = 'MonetaDB';
const DB_VERSION = 1;

export const DEFAULT_CATEGORIES = [
  // Расходы
  { id: 'cat-exp-food', name: 'Продукты', type: 'expense', icon: 'cart', color: '#10B981', order: 1 },
  { id: 'cat-exp-cafe', name: 'Кафе', type: 'expense', icon: 'coffee', color: '#F59E0B', order: 2 },
  { id: 'cat-exp-transport', name: 'Транспорт', type: 'expense', icon: 'car', color: '#3B82F6', order: 3 },
  { id: 'cat-exp-home', name: 'Дом', type: 'expense', icon: 'home', color: '#8B5CF6', order: 4 },
  { id: 'cat-exp-health', name: 'Здоровье', type: 'expense', icon: 'heart', color: '#EF4444', order: 5 },
  { id: 'cat-exp-shopping', name: 'Покупки', type: 'expense', icon: 'bag', color: '#EC4899', order: 6 },
  { id: 'cat-exp-subs', name: 'Подписки', type: 'expense', icon: 'repeat', color: '#06B6D4', order: 7 },
  { id: 'cat-exp-other', name: 'Прочее', type: 'expense', icon: 'tag', color: '#64748B', order: 8 },
  // Доходы
  { id: 'cat-inc-salary', name: 'Основной доход', type: 'income', icon: 'briefcase', color: '#10B981', order: 1 },
  { id: 'cat-inc-business', name: 'Бизнес/Проекты', type: 'income', icon: 'trend', color: '#0EA5E9', order: 2 },
  { id: 'cat-inc-invest', name: 'Инвестиции', type: 'income', icon: 'chart', color: '#8B5CF6', order: 3 },
  { id: 'cat-inc-gift', name: 'Подарки', type: 'income', icon: 'gift', color: '#F59E0B', order: 4 },
  { id: 'cat-inc-other', name: 'Прочее', type: 'income', icon: 'wallet', color: '#64748B', order: 5 },
];

export const DEFAULT_SETTINGS = {
  currency: '₽',
  theme: 'system',
  demoCleared: false,
  lastBackupAt: null,
};

let dbPromise = null;

export function generateId(prefix = 'id') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('transactions')) {
        const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
        txStore.createIndex('date', 'date', { unique: false });
        txStore.createIndex('type', 'type', { unique: false });
        txStore.createIndex('categoryId', 'categoryId', { unique: false });
      }
      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

export async function requestPersistence() {
  try {
    if (navigator.storage && typeof navigator.storage.persist === 'function') {
      return await navigator.storage.persist();
    }
  } catch {
    // ignore
  }
  return false;
}

function txPromise(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error('Transaction aborted'));
  });
}

function reqPromise(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function localDateISO(daysOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function initDatabase() {
  await openDB();
  requestPersistence();

  const existingCats = await getAllCategories();
  const settings = await getSettings();

  if (existingCats.length === 0) {
    const db = await openDB();
    const tx = db.transaction(['categories', 'settings', 'transactions'], 'readwrite');
    const catStore = tx.objectStore('categories');
    for (const cat of DEFAULT_CATEGORIES) {
      catStore.put(cat);
    }

    const setStore = tx.objectStore('settings');
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      if (settings[key] === undefined) {
        setStore.put({ key, value });
      }
    }

    if (!settings.demoCleared) {
      const txStore = tx.objectStore('transactions');
      const now = Date.now();
      const demoTxs = [
        { id: generateId('demo'), type: 'income', amount: 185000, categoryId: 'cat-inc-salary', date: localDateISO(-4), comment: 'Демо: Аванс', createdAt: now - 4000, isDemo: true },
        { id: generateId('demo'), type: 'expense', amount: 4250, categoryId: 'cat-exp-food', date: localDateISO(0), comment: 'Демо: Супермаркет', createdAt: now - 3000, isDemo: true },
        { id: generateId('demo'), type: 'expense', amount: 790, categoryId: 'cat-exp-cafe', date: localDateISO(0), comment: 'Демо: Кофе и завтрак', createdAt: now - 2000, isDemo: true },
        { id: generateId('demo'), type: 'expense', amount: 1850, categoryId: 'cat-exp-transport', date: localDateISO(-1), comment: 'Демо: Такси и парковка', createdAt: now - 1500, isDemo: true },
        { id: generateId('demo'), type: 'expense', amount: 6400, categoryId: 'cat-exp-home', date: localDateISO(-2), comment: 'Демо: Коммунальные услуги', createdAt: now - 1000, isDemo: true },
        { id: generateId('demo'), type: 'expense', amount: 1290, categoryId: 'cat-exp-subs', date: localDateISO(-3), comment: 'Демо: Облако и музыка', createdAt: now - 500, isDemo: true },
      ];
      for (const item of demoTxs) {
        txStore.put(item);
      }
    }

    await txPromise(tx);
  }
}

export async function getAllTransactions() {
  const db = await openDB();
  const tx = db.transaction('transactions', 'readonly');
  const rows = await reqPromise(tx.objectStore('transactions').getAll());
  return rows.sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
}

export async function saveTransaction(record) {
  const db = await openDB();
  const tx = db.transaction('transactions', 'readwrite');
  const clean = {
    id: record.id || generateId('tx'),
    type: record.type === 'income' ? 'income' : 'expense',
    amount: Math.round(Math.abs(Number(record.amount)) * 100) / 100,
    categoryId: record.categoryId,
    date: record.date,
    comment: String(record.comment || '').trim(),
    createdAt: record.createdAt || Date.now(),
  };
  if (record.isDemo) clean.isDemo = true;
  tx.objectStore('transactions').put(clean);
  await txPromise(tx);
  return clean;
}

export async function bulkSaveTransactions(records) {
  const db = await openDB();
  const tx = db.transaction('transactions', 'readwrite');
  const store = tx.objectStore('transactions');
  for (const record of records) {
    store.put({
      id: record.id || generateId('tx'),
      type: record.type === 'income' ? 'income' : 'expense',
      amount: Math.round(Math.abs(Number(record.amount)) * 100) / 100,
      categoryId: record.categoryId,
      date: record.date,
      comment: String(record.comment || '').trim(),
      createdAt: record.createdAt || Date.now(),
    });
  }
  await txPromise(tx);
}

export async function deleteTransaction(id) {
  const db = await openDB();
  const tx = db.transaction('transactions', 'readwrite');
  tx.objectStore('transactions').delete(id);
  await txPromise(tx);
}

export async function getAllCategories() {
  const db = await openDB();
  const tx = db.transaction('categories', 'readonly');
  const rows = await reqPromise(tx.objectStore('categories').getAll());
  return rows.sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.name.localeCompare(b.name, 'ru'));
}

export async function saveCategory(cat) {
  const db = await openDB();
  const tx = db.transaction('categories', 'readwrite');
  const clean = {
    id: cat.id || generateId('cat'),
    name: String(cat.name || '').trim(),
    type: cat.type === 'income' ? 'income' : 'expense',
    icon: cat.icon || 'tag',
    color: cat.color || '#64748B',
    order: typeof cat.order === 'number' ? cat.order : 99,
  };
  tx.objectStore('categories').put(clean);
  await txPromise(tx);
  return clean;
}

export async function deleteCategoryAndReassign(categoryId, targetCategoryId) {
  const db = await openDB();
  const tx = db.transaction(['transactions', 'categories'], 'readwrite');
  const txStore = tx.objectStore('transactions');
  const index = txStore.index('categoryId');
  const linked = await reqPromise(index.getAll(categoryId));
  for (const item of linked) {
    if (targetCategoryId) {
      item.categoryId = targetCategoryId;
      txStore.put(item);
    }
  }
  tx.objectStore('categories').delete(categoryId);
  await txPromise(tx);
}

export async function getSettings() {
  const db = await openDB();
  const tx = db.transaction('settings', 'readonly');
  const rows = await reqPromise(tx.objectStore('settings').getAll());
  const map = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return map;
}

export async function setSetting(key, value) {
  const db = await openDB();
  const tx = db.transaction('settings', 'readwrite');
  tx.objectStore('settings').put({ key, value });
  await txPromise(tx);
}

export async function clearDemoData() {
  const db = await openDB();
  const tx = db.transaction(['transactions', 'settings'], 'readwrite');
  const txStore = tx.objectStore('transactions');
  const all = await reqPromise(txStore.getAll());
  let removed = 0;
  for (const item of all) {
    if (item.isDemo) {
      txStore.delete(item.id);
      removed += 1;
    }
  }
  tx.objectStore('settings').put({ key: 'demoCleared', value: true });
  await txPromise(tx);
  return removed;
}

export async function clearAllData() {
  const db = await openDB();
  const tx = db.transaction(['transactions', 'categories', 'settings'], 'readwrite');
  tx.objectStore('transactions').clear();
  tx.objectStore('categories').clear();
  tx.objectStore('settings').clear();

  const catStore = tx.objectStore('categories');
  for (const cat of DEFAULT_CATEGORIES) {
    catStore.put(cat);
  }
  const setStore = tx.objectStore('settings');
  setStore.put({ key: 'currency', value: '₽' });
  setStore.put({ key: 'theme', value: 'system' });
  setStore.put({ key: 'demoCleared', value: true });
  setStore.put({ key: 'lastBackupAt', value: null });
  await txPromise(tx);
}

export async function exportFullBackup() {
  const [transactions, categories, settings] = await Promise.all([
    getAllTransactions(),
    getAllCategories(),
    getSettings(),
  ]);
  const now = Date.now();
  await setSetting('lastBackupAt', now);
  return {
    app: 'Moneta',
    version: 1,
    exportedAt: new Date(now).toISOString(),
    data: {
      transactions,
      categories,
      settings: { ...settings, lastBackupAt: now },
    },
  };
}

export async function importFullBackup(backupObj) {
  if (!backupObj || typeof backupObj !== 'object' || !backupObj.data) {
    throw new Error('Некорректный формат файла резервной копии');
  }
  const { transactions, categories, settings } = backupObj.data;
  if (!Array.isArray(transactions) || !Array.isArray(categories)) {
    throw new Error('В файле отсутствуют списки операций или категорий');
  }

  const db = await openDB();
  const tx = db.transaction(['transactions', 'categories', 'settings'], 'readwrite');
  const txStore = tx.objectStore('transactions');
  const catStore = tx.objectStore('categories');
  const setStore = tx.objectStore('settings');

  txStore.clear();
  catStore.clear();
  setStore.clear();

  for (const cat of categories) {
    if (cat && cat.id && cat.name) catStore.put(cat);
  }
  for (const item of transactions) {
    if (item && item.id && item.date && item.categoryId) txStore.put(item);
  }
  const mergedSettings = { ...DEFAULT_SETTINGS, ...(settings || {}), demoCleared: true };
  for (const [key, value] of Object.entries(mergedSettings)) {
    setStore.put({ key, value });
  }
  await txPromise(tx);
}
