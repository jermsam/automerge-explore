import {DocHandle} from '@automerge/automerge-repo';
import * as Automerge from '@automerge/automerge';
import b4a from 'b4a';

export type HistoryMode = 'local' | 'global';

export type VersionManagerOptions = {
  historyMode?: HistoryMode;
};

const defaultVersionManagerOptions: VersionManagerOptions = {
  historyMode: 'local',
};

const STATE = Symbol.for('_am_meta');
const OBJECT_ID = Symbol.for('_am_objectId');

export default class VersionManager<T> {
  private undoStack: Automerge.Change[];  // Store document changes
  private redoStack: Automerge.Change[];
  private handle: DocHandle<T>;
  private historyMode: HistoryMode;
  
  constructor(handle: DocHandle<T>, options: VersionManagerOptions = defaultVersionManagerOptions) {
    this.undoStack = [];
    this.redoStack = [];
    this.handle = handle;
    this.historyMode = options.historyMode || 'local';
    
    // Listen for changes and track document changes
    this.handle.on('change', this.trackChanges.bind(this));
    
  }
  
  // Check if the document is the root using Reflect
  private isRootDocument(doc: any): boolean {
    try {
      const state = Reflect.get(doc, STATE);
      return state && Reflect.get(doc, OBJECT_ID) === '_root';
    } catch (err) {
      return false;
    }
  }
  
  /**
   * Tracks changes made to the document and pushes them to the undo stack.
   * If historyMode is 'local', only local changes are tracked.
   */
  private trackChanges() {
    const doc = this.handle.docSync() as Automerge.Doc<T>;  // Get the current document state
    // Check if the document is the root document
    if (this.isRootDocument(doc)) {
      if (this.historyMode === 'local') {
        // Track only local changes
        const lastLocalChange = Automerge.getLastLocalChange(doc);
        
        // If there's a local change, add it to the undo stack and clear the redo stack
        if (lastLocalChange) {
          this.undoStack.push(lastLocalChange);
          this.redoStack = []; // Clear redo stack on new change
        }
      } else if (this.historyMode === 'global') {
        // Track all changes (global mode)
        const changes = Automerge.getChanges(Automerge.init<T>(), doc);
        this.undoStack.push(...changes);
        this.redoStack = [];  // Clear redo stack on new change
      }
    } else {
      console.log('Not the root document, skipping change tracking.');
    }
  }
  
  /**
   * Undo the last local/global change by reverting to the previous state.
   */
  public undo() {
    if (this.undoStack.length === 0) {
      console.log('No more changes to undo');
      return;
    }
    
    // Get the last change from the undo stack
    const lastChange = this.undoStack.pop() as Automerge.Change;
    
    // Store the current change in the redo stack before undoing
    const currentDoc = this.handle.docSync() as Automerge.Doc<T>;
    const allChanges = Automerge.getAllChanges(currentDoc);
    
    // Remove the last change from the change history using b4a.compare
    const remainingChanges = allChanges.filter(change => b4a.compare(change, lastChange) !== 0);
    
    // Create a new document state by applying all changes except the last one
    // const newDoc = Automerge.applyChanges(Automerge.init<T>(), remainingChanges);
    
    let newDoc = Automerge.init<T>();  // Initialize a new document of type T
    const appliedDocOrDocs = Automerge.applyChanges(Automerge.clone(newDoc), remainingChanges);
    
    // If applyChanges returns an array, extract the first document (which should be the correct one)
    newDoc = Array.isArray(appliedDocOrDocs) ? appliedDocOrDocs[0] : appliedDocOrDocs;
    
    // Add the last undone change to the redo stack
    this.redoStack.push(lastChange);
    
    // Update the document with the new state
    this.handle.update(() => newDoc);
  }
  
  /**
   * Redo the last undone operation by reapplying it.
   */
  public redo() {
    if (this.redoStack.length === 0) {
      console.log('No more changes to redo');
      return;
    }
    
    const currentDoc = this.handle.docSync() as Automerge.Doc<T>;
    const allChanges = Automerge.getAllChanges(currentDoc);
    // Get the last undone change from the redo stack
    const lastUndoneChange = this.redoStack.pop() as Automerge.Change;
    
    let newDoc = Automerge.init<T>();  // Initialize a new document of type T
    const appliedDocOrDocs = Automerge.applyChanges(Automerge.clone(newDoc), [...allChanges, lastUndoneChange]);
    
    // If applyChanges returns an array, extract the first document (which should be the correct one)
    newDoc = Array.isArray(appliedDocOrDocs) ? appliedDocOrDocs[0] : appliedDocOrDocs;
    // Move the redone change back to the undo stack
    this.undoStack.push(lastUndoneChange);
    // Update the document with the new state
    this.handle.update(() => newDoc);
  }
  
  /**
   * Check if there are any undo operations available.
   */
  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }
  
  /**
   * Check if there are any redo operations available.
   */
  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }
}
