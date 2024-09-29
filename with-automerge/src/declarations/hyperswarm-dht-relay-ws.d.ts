declare module '@hyperswarm/dht-relay/ws' {
  import { WebSocket } from 'ws';

  export class Stream {
    constructor(secure: boolean, socket: WebSocket);

    // Add methods and properties as necessary
    someStreamMethod(): void; // Example method
  }
}
