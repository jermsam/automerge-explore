declare module 'hyperbee' {
  import { EventEmitter } from 'events';

  interface HyperbeeOptions {
    extension?: boolean;
    keyEncoding?: string;
    valueEncoding?: string;
    // Add more options as per the module's documentation
  }

  interface HyperbeeCore {
    id: string;
    // Define other properties of HyperbeeCore as per the module's documentation
  }

  export default class Hyperbee extends EventEmitter {
    constructor(core: HyperbeeCore, opts?: HyperbeeOptions);

    // Define methods and properties of the Hyperbee class as per the module's documentation
    batch: any; // Define the type of batch property
    clear: () => void;
    get: (key: string | Buffer) => Promise<any>;
    put: (key: string | Buffer, value: any) => Promise<void>;
    del: (key: string | Buffer) => Promise<void>;
    createReadStream: (opts?: any) => any; // Define the type of createReadStream method
    createWriteStream: (opts?: any) => any; // Define the type of createWriteStream method
    getKey: (seq: number) => Promise<string>;
    getBatch: (seq: number) => Promise<any[]>;
    update: (batch: any[]) => Promise<void>;
    flush: () => Promise<void>;
    iterator: () => any; // Define the type of iterator method
    ready: () => Promise<void>;
    replicate: (init: any, opts?: any) => any; // Define the type of replicate method
    // Add more methods and properties as per the module's documentation
  }
}
