import * as Automerge from '@automerge/automerge';
import {DocHandle, ChangeFn, Doc, } from '@automerge/automerge-repo';

export interface HistoryManagerOptions {
  undoMode?: 'local' | 'global';
  conflictResolver?: (_key: string, conflicts: Automerge.Conflicts) => Promise<Automerge.AutomergeValue | undefined>;
}

export interface HistoryItem<T> {
  opId: string;
  type: string;
  predecessors?: string[];
  changeFn?: ChangeFn<T>;
}

const STATE = Symbol.for('_am_meta');
const OBJECT_ID = Symbol.for('_am_objectId');

export function _state(doc: any, checkroot = true) {
  if (typeof doc !== 'object') {

    throw new RangeError('must be the document root');
  }
  const state = Reflect.get(doc, STATE);
  if (state === undefined ||
    state == null ||
    (checkroot && _obj(doc) !== '_root')) {
    throw new RangeError('must be the document root');
  }
  return state;
}

export function _obj(doc: any) {
  if (!(typeof doc === 'object') || doc === null) {
    return null;
  }
  return Reflect.get(doc, OBJECT_ID);
}

export default class HistoryManager {
private isUndoRedoInProgress = false;
  private docHandle: DocHandle<Automerge.AutomergeValue>;
  private undoStack: HistoryItem<Automerge.AutomergeValue>[] = [];
  private redoStack: HistoryItem<Automerge.AutomergeValue>[] = [];
  private history: HistoryItem<Automerge.AutomergeValue>[] = [];
  // private readonly undoMode: 'local' | 'global';
  private readonly conflictResolver: (key: string, conflicts: Automerge.Conflicts) => Promise<Automerge.AutomergeValue | undefined>;

  constructor(docHandle: DocHandle<Automerge.AutomergeValue>, options: HistoryManagerOptions = {}) {
    this.docHandle = docHandle;
    // this.undoMode = options.undoMode || 'local';
    this.conflictResolver = options.conflictResolver || this.defaultConflictResolver;

    this.initialize();
  }

  /**
   * Ensure the docHandle is ready and document is fully loaded.
   */
  private async initialize() {
    if (!this.docHandle.isReady()) {
      // Wait for the document to be ready
      await this.docHandle.doc();
    }
    this.docHandle.on('change', this.onDocumentChange.bind(this));
  }

  /**
   * Default conflict resolver: "Last Write Wins"
   */
  private async defaultConflictResolver(_key: string, conflicts: Automerge.Conflicts) {
    // Resolves to the most recent value (last write wins).
    return Object.values(conflicts).pop();
  }

  /**
   * Listener for document changes to update internal state.
   * Automatically tracks changes made through `docHandle`.
   */
  private async onDocumentChange() {
    const doc = await this.docHandle.doc() as Doc<Automerge.AutomergeValue>;

   if (!doc) return;

    const heads = Automerge.getHeads(doc as Doc<Automerge.AutomergeValue>); // Get the latest operation heads

    // Push the new operation into history
    const opId = heads[0];

    if (!this.history.length || this.history[this.history.length - 1].opId !== opId) {
      const newItem: HistoryItem<Automerge.AutomergeValue> = {
        opId,
        type: 'Change',
        predecessors: heads,
      };
      this.history.push(newItem);
      this.undoStack.push(newItem);
      this.redoStack = []; // Clear redo stack on new change
    }

    await this.resolveConflicts(doc);
  }

  private async resolveConflicts(doc: Doc<Automerge.AutomergeValue>) {
    const state = _state(doc, false);
    if (state.textV2)  return
    const conflictKeys = Object.keys(doc as Doc<any>).filter(key => {

      const conflicts = Automerge.getConflicts(doc, key) as Automerge.Conflicts;
      return conflicts && Object.keys(conflicts).length > 0;
    });

    const changesToApply: Array<{ key: string; value: Automerge.AutomergeValue }> = [];

    for (const key of conflictKeys) {
      const conflicts = Automerge.getConflicts(doc, key) as Automerge.Conflicts;
      const resolvedValue = await this.conflictResolver(key, conflicts);

      if (resolvedValue !== undefined) {
        changesToApply.push({ key, value: resolvedValue });
      }
    }

    // Apply all changes in a single change block
    if (changesToApply.length > 0) {
      this.docHandle.change((doc: Doc<Automerge.AutomergeValue>) => {
        for (const { key, value } of changesToApply) {
          (doc as any)[key] = value;
        }
      });
    }
  }


  public async undo() {
    if (this.isUndoRedoInProgress || !this.docHandle.isReady() || this.undoStack.length === 0) {
      return;
    }

    this.isUndoRedoInProgress = true;
    try {
      const lastOp = this.undoStack.pop() as HistoryItem<Automerge.AutomergeValue>;
      const anchorState = await this.findAnchorState(lastOp.opId);

      if (anchorState) {
        const locDoc = await this.docHandle.doc() as Doc<Automerge.AutomergeValue>;
        const changes = Automerge.getChanges(locDoc, anchorState);

        // Apply the changes in one single change block to avoid nesting
        this.docHandle.change((doc) => {
          Automerge.applyChanges(doc as Doc<Automerge.AutomergeValue>, changes);
        });

        this.redoStack.push(lastOp);
      }
    } finally {
      this.isUndoRedoInProgress = false;
    }
  }

  // private async localUndo(lastOp: HistoryItem<Automerge.AutomergeValue>) {
  //   const anchorState = await this.findAnchorState(lastOp.opId);
  //   if (anchorState) {
  //     this.docHandle.change((doc: Doc<Automerge.AutomergeValue>) => {
  //       const changes = Automerge.getChanges(doc, anchorState); // Get only the changes up to anchor state
  //       if (changes.length > 0) {
  //         Automerge.applyChanges(doc, changes);
  //       }
  //     });
  //     this.redoStack.push(lastOp);
  //   }
  // }


  // private async globalUndo(lastOp: HistoryItem<Automerge.AutomergeValue>) {
  //   const anchorState = await this.findAnchorState(lastOp.opId) as Doc<Automerge.AutomergeValue>;
  //
  //   if (anchorState) {
  //     this.docHandle.change((doc: Doc<Automerge.AutomergeValue>) => {
  //       // Clone the anchor state to avoid direct mutation
  //
  //       Automerge.merge(doc, anchorState);// Restore globally by merging
  //     });
  //   } else {
  //     console.error('Anchor state not found for global undo operation.');
  //   }
  //
  //   console.log('Global undo completed.');
  // }

  /**
   * Redo the last undone operation.
   */
  public async redo() {
    if (!this.docHandle.isReady()) {
      console.warn('Document handle is not ready for redo.');
      return;
    }

    this.isUndoRedoInProgress = true;

    try {
      const lastRedoOp = this.redoStack.pop();
      this.docHandle.change((doc) => {
        if (!lastRedoOp) return
        lastRedoOp.predecessors?.forEach((predecessor) => {
          const setOp = this.getOpById(predecessor);
          if (setOp && setOp.changeFn) setOp.changeFn(doc);
        });
      });
    } finally {
      this.isUndoRedoInProgress = false;
    }
  }

  /**
   * Fetch an operation by its ID from the history.
   */
  private getOpById(opId: string): HistoryItem<Automerge.AutomergeValue> | undefined {
    return this.history.find(op => op.opId === opId);
  }

  private async findAnchorState(opId: string): Promise<Doc<Automerge.AutomergeValue> | undefined> {
    const index = this.history.findIndex(op => op.opId === opId);
    if (index === -1) return undefined;

    const currentDoc = await this.docHandle.doc() as Doc<Automerge.AutomergeValue>;
    const changes = Automerge.getChanges(Automerge.init() as Doc<Automerge.AutomergeValue> , currentDoc );

    let tempDoc = Automerge.init();
    for (let i = 0; i <= index; i++) {
      tempDoc = Automerge.applyChanges(tempDoc, [changes[i]])[0];
    }

    if (_obj(tempDoc) === null) {
      throw new Error('Invalid document root: The tempDoc is not a valid Automerge document.');
    }

    return tempDoc;
  }

  // private async checkUndoRedoNeutrality() {
  //   const doc = await this.docHandle.doc();
  //   const originalState = Automerge.clone(doc as Doc<Automerge.AutomergeValue>);
  //
  //   await this.undo();
  //   await this.redo();
  //
  //   const finalState = Automerge.clone(doc as Doc<Automerge.AutomergeValue>);
  //   if (JSON.stringify(originalState) !== JSON.stringify(finalState)) {
  //     console.error('Undo/Redo Neutrality violated!');
  //   } else {
  //     console.log('Undo/Redo Neutrality upheld.');
  //   }
  // }
}
