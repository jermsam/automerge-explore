/**
 * This module provides a storage adapter for IndexedDB.
 *
 * @packageDocumentation
 */

import {
  Chunk,
  StorageAdapterInterface,
  type StorageKey,
} from '@automerge/automerge-repo/slim';
import RAA from 'random-access-application';
import path from 'node:path';
import RAM from 'random-access-memory';
import CoreStore from 'corestore';
import Hyperbee from 'hyperbee';

export class HyperbeeStorageAdapter implements StorageAdapterInterface {
  private dbeePromise: Promise<Hyperbee>;
  
  /** Create a new {@link HyperbeeStorageAdapter}.
   * @param database - The name of the database to use. Defaults to "bee-storage".
   * @param store - The name of the object store to use. Defaults to "documents".
   * @param options - Hyperbee options
   */
  constructor(
    {
      database = 'bee-storage',
      store = 'documents',
      coreStoreOptions = {},
      hyperbeeOptions = {},
    } = {}) {
    this.dbeePromise = this.createDatabasePromise(database, store, coreStoreOptions, hyperbeeOptions);
  }
  
  private async createDatabasePromise(database: any, store: string, coreStoreOptions: any, hyperbeeOptions: any): Promise<Hyperbee> {
    const isStringStorage = typeof database === 'string';
    const isPathStorage = isStringStorage && (
      database.startsWith('.') || path.isAbsolute(database)
    );
    
    let storageBackend = database;
    if (isStringStorage && !isPathStorage) {
      storageBackend = RAA(database);
    } else if (database === false) {
      storageBackend = RAM.reusable();
    }
    const coreStore = new CoreStore(storageBackend, coreStoreOptions);
    // Create a new Hypercore feed for the given corePath
    const core = coreStore.get({name: store});
    const dbee = new Hyperbee(core, {
      ...hyperbeeOptions,
      keyEncoding: 'utf-8',
      valueEncoding: 'binary', // Automerge chunks are binary
    });
    await dbee.ready();
    return dbee;
  }
  
  async load(keyArray: string[]): Promise<Uint8Array | undefined> {
    const db = await this.dbeePromise;
    const key = keyArray.join('-');
    const binary = await db.get(key)
    return binary.value;
  }
  
  async save(keyArray: string[], binary: Uint8Array): Promise<void> {
    const db = await this.dbeePromise;
    const key = keyArray.join('-');
    await db.put(key, binary);
  }
  
  async remove(keyArray: string[]): Promise<void> {
    const db = await this.dbeePromise;
    const key = keyArray.join('-');
    return db.del(key);
  }
  
  async loadRange(keyPrefix: string[]): Promise<Chunk[]> {
    const db = await this.dbeePromise;
    const lowerBound = keyPrefix.join('-');
    const upperBound = [...keyPrefix, '\uffff'].join('-');
    const result: { data: Uint8Array; key: StorageKey }[] = [];
    
    for await (const {value, key} of db.createReadStream({
      gte: `${lowerBound}`,
      lte: `${upperBound}~`,
    })) {
      console.log(`Found chunk with key ${key}`);
      result.push({
        data: value,
        key: key.split('-') as StorageKey,
      });
    }
    
    return result;
  }
  
  async removeRange(keyPrefix: string[]): Promise<void> {
    const db = await this.dbeePromise;
    const lowerBound = keyPrefix.join('-');
    const upperBound = [...keyPrefix, '\uffff'].join('-');
    
    console.log(`Removing range with prefix: ${lowerBound}`);
    for await (const {key} of db.createReadStream({
      gte: `${lowerBound}`,
      lte: `${upperBound}~`,
    })) {
      console.log(`Removing chunk with key ${key}`);
      await db.del(key);
    }
  }
}
