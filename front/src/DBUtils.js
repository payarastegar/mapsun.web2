import { openDB } from 'idb';

const DB_NAME = 'user-assets-db';
const STORE_NAME = 'keyval';

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    db.createObjectStore(STORE_NAME);
  },
});

class DBUtils {
  static async get(key) {
    return (await dbPromise).get(STORE_NAME, key);
  }

  static async set(key, val) {
    return (await dbPromise).put(STORE_NAME, val, key);
  }
}

export default DBUtils;