import { DocHandle, Repo, isValidAutomergeUrl} from '@automerge/automerge-repo';
import {BroadcastChannelNetworkAdapter} from '@automerge/automerge-repo-network-broadcastchannel';
import {IndexedDBStorageAdapter} from '@automerge/automerge-repo-storage-indexeddb';
import {TodoItem} from './types';

export const broadcast = new BroadcastChannelNetworkAdapter();
const indexedDB = new IndexedDBStorageAdapter();

// Initialize the Automerge Repo
export const repo = new Repo({
  storage: indexedDB,
  network: [broadcast],
});

export const getOrCreateHandle =(docId: string) =>{
  let handle: DocHandle<any>;
  if (isValidAutomergeUrl(docId)) {
    handle = repo.find(docId);
  } else {
    handle = repo.create<{ tasks: TodoItem[] }>({
      tasks: [
        {
          contents: 'Explore Automerge',
          completed: false,
        },
      ],
    });
  }

  return handle;
}



