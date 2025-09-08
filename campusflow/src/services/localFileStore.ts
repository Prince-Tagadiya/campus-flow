// Simple IndexedDB wrapper to store file blobs locally per user and file id

const DB_NAME = 'campusflow-local-files';
const DB_VERSION = 1;
const STORE_NAME = 'files';

interface StoredFileRecord {
  userId: string;
  fileId: string;
  blob: Blob;
  createdAt: number;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'fileId' });
        store.createIndex('by_user', 'userId', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveFileBlob(userId: string, fileId: string, blob: Blob): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const record: StoredFileRecord = { userId, fileId, blob, createdAt: Date.now() };
    store.put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getFileBlob(fileId: string): Promise<Blob | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(fileId);
    req.onsuccess = () => {
      const rec = req.result as StoredFileRecord | undefined;
      resolve(rec ? rec.blob : null);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteFileBlob(fileId: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(fileId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function createObjectUrlFromIdb(fileId: string): Promise<string | null> {
  const blob = await getFileBlob(fileId);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}


