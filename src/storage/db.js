import Dexie from 'dexie';

export const db = new Dexie('morning-charge-db');
db.version(1).stores({
  completions: '++id, date',
  settings: 'key',
});
