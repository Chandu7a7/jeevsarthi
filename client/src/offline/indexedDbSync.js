/**
 * Offline sync utility using IndexedDB
 * Stores scan events when offline and syncs when online
 */

const DB_NAME = 'jeevsarthi_offline';
const DB_VERSION = 1;
const STORE_NAME = 'pending_scans';

let db = null;

/**
 * Initialize IndexedDB
 * @returns {Promise<IDBDatabase>}
 */
const initDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = database.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        objectStore.createIndex('tagId', 'tagId', { unique: false });
      }
    };
  });
};

/**
 * Store offline scan event
 * @param {Object} scanData - Scan data to store
 * @returns {Promise<String>} Stored record ID
 */
export const storeOfflineScan = async (scanData) => {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const record = {
      tagId: scanData.tagId,
      timestamp: scanData.timestamp || Date.now(),
      payload: scanData.payload || scanData,
      synced: false,
    };

    return new Promise((resolve, reject) => {
      const request = store.add(record);
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error storing offline scan:', error);
    throw error;
  }
};

/**
 * Get all pending scans
 * @returns {Promise<Array>} Array of pending scan records
 */
export const getPendingScans = async () => {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');

    return new Promise((resolve, reject) => {
      const request = index.getAll();
      request.onsuccess = () => {
        const scans = request.result.filter((scan) => !scan.synced);
        resolve(scans);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error getting pending scans:', error);
    return [];
  }
};

/**
 * Mark scan as synced
 * @param {Number} id - Record ID
 * @returns {Promise}
 */
const markAsSynced = async (id) => {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const record = getRequest.result;
        if (record) {
          record.synced = true;
          const updateRequest = store.put(record);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (error) {
    console.error('Error marking scan as synced:', error);
    throw error;
  }
};

/**
 * Sync pending scans to server
 * @param {Function} syncFunction - Function to call for each scan
 * @returns {Promise<Number>} Number of synced scans
 */
export const syncPendingScans = async (syncFunction) => {
  if (!navigator.onLine) {
    return 0;
  }

  try {
    const pendingScans = await getPendingScans();
    let syncedCount = 0;

    for (const scan of pendingScans) {
      try {
        await syncFunction(scan.payload || scan);
        await markAsSynced(scan.id);
        syncedCount++;
      } catch (error) {
        console.error(`Error syncing scan ${scan.id}:`, error);
        // Continue with next scan
      }
    }

    return syncedCount;
  } catch (error) {
    console.error('Error syncing pending scans:', error);
    return 0;
  }
};

/**
 * Clear synced scans (cleanup)
 * @returns {Promise}
 */
export const clearSyncedScans = async () => {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.openCursor();
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (cursor.value.synced) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error clearing synced scans:', error);
    throw error;
  }
};

