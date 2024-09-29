import { DocHandle, Repo, isValidAutomergeUrl, } from '@automerge/automerge-repo';
import {BroadcastChannelNetworkAdapter} from '@automerge/automerge-repo-network-broadcastchannel';
// import {IndexedDBStorageAdapter} from '@automerge/automerge-repo-storage-indexeddb';
import {TodoItem} from './types';
import SAI from 'stochastic-access-idb';
import {HyperbeeStorageAdapter} from './p2p-adapters/automerge-repo-storage-hyperbee.ts';

// Initialize IndexedDB storage
const storage = SAI('todos-db');
const storageAdapter = new HyperbeeStorageAdapter({
  database: storage,
  store: 'tasks'
});
export const broadcast = new BroadcastChannelNetworkAdapter();
// const indexedDB = new IndexedDBStorageAdapter();

// Initialize the Automerge Repo
export const repo = new Repo({
  storage: storageAdapter,
  network: [broadcast],
});

export const getOrCreateHandle =(docId: string) =>{
  let handle: DocHandle<any>;
  if (isValidAutomergeUrl(docId)) {
    handle = repo.find(docId);
  } else {
    handle = repo.create<{ tasks: TodoItem[] }>({
      tasks: [],
    });
  }

  return handle;
}



