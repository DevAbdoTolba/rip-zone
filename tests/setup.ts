// Global test setup: provide fake IndexedDB implementation for Node.js/jsdom environment
// This must run before any Dexie database is instantiated
import 'fake-indexeddb/auto'
